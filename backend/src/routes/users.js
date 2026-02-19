import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (with optional role filter)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    
    const users = await prisma.user.findMany({
      where,
      select: { 
        id: true, 
        email: true, 
        name: true, 
        role: true, 
        avatar: true, 
        phone: true,
        createdAt: true,
        patientProfile: true,
        doctorProfile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Get single user by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { 
        patientProfile: {
          include: { medicalRecords: { orderBy: { visitDate: 'desc' }, take: 5 } }
        },
        doctorProfile: true 
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// Create new patient (ADMIN only)
router.post('/patients', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { email, password, name, phone, birthDate, address, allergies } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user + patient profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: 'PASIEN',
        avatar: '👤',
        patientProfile: {
          create: {
            birthDate: birthDate ? new Date(birthDate) : null,
            address,
            allergies
          }
        }
      },
      include: { patientProfile: true }
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// Update patient (ADMIN only)
router.patch('/patients/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { name, email, phone, birthDate, address, allergies } = req.body;

    // Update user data
    const userData = {};
    if (name) userData.name = name;
    if (email) userData.email = email;
    if (phone) userData.phone = phone;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: userData,
      include: { patientProfile: true }
    });

    // Update patient profile if exists
    if (user.patientProfile) {
      const profileData = {};
      if (birthDate !== undefined) profileData.birthDate = birthDate ? new Date(birthDate) : null;
      if (address !== undefined) profileData.address = address;
      if (allergies !== undefined) profileData.allergies = allergies;

      if (Object.keys(profileData).length > 0) {
        await prisma.patientProfile.update({
          where: { userId: req.params.id },
          data: profileData
        });
      }
    }

    // Fetch updated user
    const updated = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { patientProfile: true }
    });

    const { password, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
});

// Delete patient (ADMIN only)
router.delete('/patients/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (user.role !== 'PASIEN') {
      return res.status(400).json({ error: 'Can only delete patients' });
    }

    // Delete user (cascade will delete profile, appointments, etc)
    await prisma.user.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
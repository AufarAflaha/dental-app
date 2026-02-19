import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get patient's medical records (including odontogram)
router.get('/records/:patientId', authenticate, async (req, res, next) => {
  try {
    const { patientId } = req.params;

    // Get patient profile
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      include: { patientProfile: true }
    });

    if (!patient || patient.role !== 'PASIEN') {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get all medical records for this patient
    const records = await prisma.medicalRecord.findMany({
      where: { patientId: patient.patientProfile.id },
      orderBy: { visitDate: 'desc' }
    });

    res.json({
      patient: {
        id: patient.id,
        name: patient.name,
        email: patient.email,
        allergies: patient.patientProfile?.allergies,
        lastVisit: patient.patientProfile?.lastVisit,
        nextVisit: patient.patientProfile?.nextVisit
      },
      records
    });
  } catch (error) {
    next(error);
  }
});

// Create or Update Odontogram
router.post('/odontogram', authenticate, authorize('DOKTER', 'ADMIN'), async (req, res, next) => {
  try {
    const { patientId, odontogram, diagnosis, treatment, notes, cost } = req.body;

    // Validation
    if (!patientId || !odontogram) {
      return res.status(400).json({ error: 'patientId and odontogram required' });
    }

    // Get patient profile
    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      include: { patientProfile: true }
    });

    if (!patient || !patient.patientProfile) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    // Create medical record with odontogram
    const record = await prisma.medicalRecord.create({
      data: {
        patientId: patient.patientProfile.id,
        diagnosis: diagnosis || 'Pemeriksaan rutin',
        treatment: treatment || 'Update odontogram',
        notes: notes || '',
        cost: cost || 0,
        odontogram: odontogram // JSON object with tooth data
      }
    });

    // Update patient's last visit
    await prisma.patientProfile.update({
      where: { id: patient.patientProfile.id },
      data: { lastVisit: new Date() }
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

// Get latest odontogram for patient
router.get('/odontogram/:patientId', authenticate, async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await prisma.user.findUnique({
      where: { id: patientId },
      include: { patientProfile: true }
    });

    if (!patient || !patient.patientProfile) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Get latest record with odontogram
    const latestRecord = await prisma.medicalRecord.findFirst({
      where: {
        patientId: patient.patientProfile.id,
        odontogram: { not: null }
      },
      orderBy: { visitDate: 'desc' }
    });

    if (!latestRecord) {
      // Return default odontogram (all teeth = ok)
      const defaultOdontogram = {};
      for (let i = 11; i <= 18; i++) defaultOdontogram[i.toString()] = 'ok';
      for (let i = 21; i <= 28; i++) defaultOdontogram[i.toString()] = 'ok';
      for (let i = 31; i <= 38; i++) defaultOdontogram[i.toString()] = 'ok';
      for (let i = 41; i <= 48; i++) defaultOdontogram[i.toString()] = 'ok';

      return res.json({
        odontogram: defaultOdontogram,
        diagnosis: '',
        notes: '',
        visitDate: null
      });
    }

    res.json({
      odontogram: latestRecord.odontogram,
      diagnosis: latestRecord.diagnosis,
      notes: latestRecord.notes,
      visitDate: latestRecord.visitDate
    });
  } catch (error) {
    next(error);
  }
});

// Update diagnosis notes
router.patch('/records/:id', authenticate, authorize('DOKTER', 'ADMIN'), async (req, res, next) => {
  try {
    const { diagnosis, treatment, notes, cost } = req.body;

    const record = await prisma.medicalRecord.update({
      where: { id: req.params.id },
      data: { diagnosis, treatment, notes, cost }
    });

    res.json(record);
  } catch (error) {
    next(error);
  }
});

export default router;
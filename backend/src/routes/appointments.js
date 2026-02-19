import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all appointments
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { role, id } = req.user;
    const { status, date } = req.query;

    let where = {};
    if (role === 'DOKTER') where.doctorId = id;
    if (role === 'PASIEN') where.patientId = id;
    if (status) where.status = status;
    if (date) where.date = new Date(date);

    const appointments = await prisma.appointment.findMany({
      where,
      include: { patient: { select: { id: true, name: true, email: true } }, doctor: { select: { id: true, name: true } } },
      orderBy: { date: 'asc' }
    });

    res.json(appointments);
  } catch (error) {
    next(error);
  }
});

// Create appointment
router.post('/', authenticate, authorize('PASIEN', 'ADMIN'), async (req, res, next) => {
  try {
    const { doctorId, date, time, notes } = req.body;
    const patientId = req.user.role === 'PASIEN' ? req.user.id : req.body.patientId;

    const appointment = await prisma.appointment.create({
      data: { patientId, doctorId, date: new Date(date), time, notes },
      include: { patient: true, doctor: true }
    });

    // Create notification for doctor
    await prisma.notification.create({
      data: { userId: doctorId, type: 'BOOKING', title: 'Booking Baru', message: `Appointment dari ${appointment.patient.name}` }
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
});

// Update status
router.patch('/:id/status', authenticate, authorize('DOKTER', 'ADMIN'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
      include: { patient: true }
    });

    await prisma.notification.create({
      data: { userId: appointment.patientId, type: 'BOOKING', title: 'Status Appointment', message: `Status: ${status}` }
    });

    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

export default router;

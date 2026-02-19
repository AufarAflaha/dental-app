import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all appointments (filtered by user role)
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
      include: { 
        patient: { select: { id: true, name: true, email: true } }, 
        doctor: { select: { id: true, name: true } } 
      },
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

    // Validation
    if (!doctorId || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields: doctorId, date, time' });
    }

    const patientId = req.user.role === 'PASIEN' ? req.user.id : req.body.patientId;

    if (!patientId) {
      return res.status(400).json({ error: 'Patient ID required for admin' });
    }

    // Check if slot is already booked
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: new Date(date),
        time,
        status: { in: ['PENDING', 'CONFIRMED'] }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }

    const appointment = await prisma.appointment.create({
      data: { 
        patientId, 
        doctorId, 
        date: new Date(date), 
        time, 
        notes,
        status: 'PENDING'
      },
      include: { patient: true, doctor: true }
    });

    // Create notification for doctor
    await prisma.notification.create({
      data: { 
        userId: doctorId, 
        type: 'BOOKING', 
        title: 'Booking Baru', 
        message: `Appointment dari ${appointment.patient.name} pada ${time}` 
      }
    });

    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
});

// Update appointment status
router.patch('/:id/status', authenticate, authorize('DOKTER', 'ADMIN'), async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status },
      include: { patient: true, doctor: true }
    });

    // Notify patient
    await prisma.notification.create({
      data: { 
        userId: appointment.patientId, 
        type: 'BOOKING', 
        title: 'Status Appointment', 
        message: `Appointment Anda telah ${status}` 
      }
    });

    res.json(appointment);
  } catch (error) {
    next(error);
  }
});

// Cancel appointment
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const appointment = await prisma.appointment.findUnique({
      where: { id: req.params.id }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Only patient can cancel their own or admin can cancel any
    if (req.user.role === 'PASIEN' && appointment.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.appointment.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' }
    });

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

// Get available time slots
router.get('/slots/available', authenticate, async (req, res, next) => {
  try {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
      return res.status(400).json({ error: 'doctorId and date required' });
    }

    // Get all appointments for that doctor on that date
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      select: { time: true }
    });

    const bookedTimes = appointments.map(apt => apt.time);

    // All possible time slots (hardcoded for now - can be from doctor schedule)
    const allSlots = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","13:00","13:30","14:00"];
    
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    res.json({ availableSlots, bookedSlots: bookedTimes });
  } catch (error) {
    next(error);
  }
});

export default router;
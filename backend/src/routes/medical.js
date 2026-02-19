import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
const router = express.Router();
const prisma = new PrismaClient();

router.post('/records', authenticate, authorize('DOKTER', 'ADMIN'), async (req, res, next) => {
  try {
    const { patientId, diagnosis, treatment, notes, cost, odontogram } = req.body;
    const patient = await prisma.patientProfile.findUnique({ where: { userId: patientId } });
    const record = await prisma.medicalRecord.create({
      data: { patientId: patient.id, diagnosis, treatment, notes, cost, odontogram }
    });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
});

router.get('/records/:patientId', authenticate, async (req, res, next) => {
  try {
    const patient = await prisma.patientProfile.findUnique({ where: { userId: req.params.patientId } });
    const records = await prisma.medicalRecord.findMany({ where: { patientId: patient.id }, orderBy: { visitDate: 'desc' } });
    res.json(records);
  } catch (error) {
    next(error);
  }
});

export default router;

import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
const router = express.Router();
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

router.post('/', authenticate, authorize('DOKTER'), upload.fields([{ name: 'before' }, { name: 'after' }]), async (req, res, next) => {
  try {
    const { patientId, treatment, notes } = req.body;
    const photo = await prisma.photo.create({
      data: { patientId, treatment, beforePhoto: req.files.before[0].path, afterPhoto: req.files.after[0].path, notes }
    });
    res.status(201).json(photo);
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    const where = req.user.role === 'PASIEN' ? { patientId: req.user.id } : {};
    const photos = await prisma.photo.findMany({ where, include: { patient: { select: { name: true } } } });
    res.json(photos);
  } catch (error) {
    next(error);
  }
});

export default router;

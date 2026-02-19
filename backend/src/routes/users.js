import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';
const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({ where, select: { id: true, email: true, name: true, role: true, avatar: true } });
    res.json(users);
  } catch (error) {
    next(error);
  }
});

export default router;

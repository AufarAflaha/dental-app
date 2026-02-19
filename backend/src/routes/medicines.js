import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Get all medicines
router.get('/', authenticate, authorize('ADMIN', 'DOKTER'), async (req, res, next) => {
  try {
    const { category, lowStock } = req.query;
    let where = {};
    if (category) where.category = category;
    
    const medicines = await prisma.medicine.findMany({ where });

    if (lowStock === 'true') {
      const filtered = medicines.filter(m => m.stock <= m.minStock);
      return res.json(filtered);
    }

    res.json(medicines);
  } catch (error) {
    next(error);
  }
});

// Create medicine
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { name, category, stock, minStock, unit, expiryDate, price } = req.body;
    const medicine = await prisma.medicine.create({
      data: { name, category, stock, minStock, unit, expiryDate: new Date(expiryDate), price }
    });
    res.status(201).json(medicine);
  } catch (error) {
    next(error);
  }
});

// Update stock
router.patch('/:id/stock', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { change, reason } = req.body;
    const medicine = await prisma.medicine.findUnique({ where: { id: req.params.id } });
    
    const newStock = medicine.stock + change;
    const updated = await prisma.medicine.update({
      where: { id: req.params.id },
      data: { stock: newStock }
    });

    await prisma.stockHistory.create({
      data: { medicineId: req.params.id, change, reason, performedBy: req.user.id }
    });

    // Alert if low stock
    if (newStock <= medicine.minStock) {
      const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
      for (const admin of admins) {
        await prisma.notification.create({
          data: { userId: admin.id, type: 'STOCK', title: 'Stok Kritis', message: `${medicine.name} tersisa ${newStock} ${medicine.unit}` }
        });
      }
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
});

export default router;

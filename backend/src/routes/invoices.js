import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Generate invoice number
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 900) + 100; // 3 digit random
  return `INV-${year}${month}${day}-${random}`;
}

// Get all invoices
router.get('/', authenticate, authorize('ADMIN', 'DOKTER'), async (req, res, next) => {
  try {
    const { patientId, isPaid } = req.query;

    let where = {};
    if (patientId) where.patientId = patientId;
    if (isPaid !== undefined) where.isPaid = isPaid === 'true';

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 most recent
    });

    // Get patient names
    const invoicesWithPatients = await Promise.all(
      invoices.map(async (inv) => {
        const patient = await prisma.user.findUnique({
          where: { id: inv.patientId },
          select: { name: true, email: true }
        });
        return { ...inv, patient };
      })
    );

    res.json(invoicesWithPatients);
  } catch (error) {
    next(error);
  }
});

// Get single invoice by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get patient info
    const patient = await prisma.user.findUnique({
      where: { id: invoice.patientId },
      select: { name: true, email: true, phone: true }
    });

    res.json({ ...invoice, patient });
  } catch (error) {
    next(error);
  }
});

// Create invoice
router.post('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const { patientId, items } = req.body;

    // Validation
    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'patientId and items array required' });
    }

    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

    // Generate invoice number
    const invoiceNumber = generateInvoiceNumber();

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        patientId,
        invoiceNumber,
        items,
        total,
        isPaid: false
      }
    });

    // Create notification for patient
    await prisma.notification.create({
      data: {
        userId: patientId,
        type: 'PAYMENT',
        title: 'Invoice Baru',
        message: `Invoice ${invoiceNumber} sebesar Rp ${total.toLocaleString()} telah dibuat`
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    next(error);
  }
});

// Mark invoice as paid
router.patch('/:id/paid', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        isPaid: true,
        paidAt: new Date()
      }
    });

    // Notify patient
    await prisma.notification.create({
      data: {
        userId: invoice.patientId,
        type: 'PAYMENT',
        title: 'Pembayaran Diterima',
        message: `Pembayaran invoice ${invoice.invoiceNumber} telah diterima. Terima kasih!`
      }
    });

    res.json(invoice);
  } catch (error) {
    next(error);
  }
});

// Delete invoice (only unpaid invoices)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.isPaid) {
      return res.status(400).json({ error: 'Cannot delete paid invoice' });
    }

    await prisma.invoice.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
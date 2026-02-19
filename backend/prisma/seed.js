import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;

  const hashedPass = await bcrypt.hash('password123', 10);

  // Create users
  const dokter = await prisma.user.create({
    data: {
      email: 'anisa@klinik.id',
      password: hashedPass,
      name: 'drg. Anisa Putri',
      role: 'DOKTER',
      avatar: '👩‍⚕️',
      doctorProfile: {
        create: {
          specialty: 'Orthodonti',
          rating: 4.9,
          totalReviews: 45,
          schedule: {
            monday: { start: '08:00', end: '14:00' },
            tuesday: { start: '08:00', end: '14:00' },
            wednesday: { start: '08:00', end: '14:00' },
            thursday: { start: '08:00', end: '14:00' },
            friday: { start: '08:00', end: '14:00' }
          }
        }
      }
    }
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@klinik.id',
      password: hashedPass,
      name: 'Sinta Admin',
      role: 'ADMIN',
      avatar: '👩‍💼'
    }
  });

  const pasien = await prisma.user.create({
    data: {
      email: 'budi@gmail.com',
      password: hashedPass,
      name: 'Budi Santoso',
      role: 'PASIEN',
      avatar: '👨',
      patientProfile: {
        create: {
          allergies: 'Penisilin',
          lastVisit: new Date('2025-02-03'),
          nextVisit: new Date('2025-02-20')
        }
      }
    }
  });

  // Medicines
  await prisma.medicine.createMany({
    data: [
      { name: 'Lidocaine 2%', category: 'Anestesi', stock: 5, minStock: 10, unit: 'Ampul', expiryDate: new Date('2025-12-31'), price: 25000 },
      { name: 'Amoxicillin 500mg', category: 'Antibiotik', stock: 48, minStock: 20, unit: 'Kapsul', expiryDate: new Date('2026-03-31'), price: 500 },
      { name: 'Ibuprofen 400mg', category: 'Analgesik', stock: 62, minStock: 15, unit: 'Tablet', expiryDate: new Date('2026-06-30'), price: 300 }
    ]
  });

  // Appointment
  await prisma.appointment.create({
    data: {
      patientId: pasien.id,
      doctorId: dokter.id,
      date: new Date('2025-02-20'),
      time: '09:00',
      status: 'CONFIRMED',
      notes: 'Kontrol scaling'
    }
  });

  console.log('✅ Seed complete!');
  console.log('\n📧 Login credentials:');
  console.log('Dokter: anisa@klinik.id / password123');
  console.log('Admin: admin@klinik.id / password123');
  console.log('Pasien: budi@gmail.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

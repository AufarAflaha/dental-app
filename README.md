# 🦷 DentalCare - Complete Dental Clinic Management System

[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack, production-ready dental clinic management system built with React, Node.js, Express, and PostgreSQL. Designed for real clinical use with role-based access control, appointment booking, patient records, odontogram editor, and invoice management.

![DentalCare Banner](https://via.placeholder.com/1200x400/0A1628/00C9A7?text=DentalCare+Clinic+Management)

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [User Roles & Capabilities](#user-roles--capabilities)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with bcrypt password hashing
- Role-based access control (Doctor, Admin, Patient)
- Secure session management
- Protected routes with middleware validation

### 📅 Appointment Management
- **Patient**: Book appointments with doctor selection, date, and time
- **Doctor**: Confirm/complete appointments with status updates
- **Real-time slot availability** - prevents double-booking
- Automatic notifications on booking and status changes
- Appointment history with filtering (upcoming, completed, cancelled)

### 🦷 Interactive Odontogram Editor
- Visual representation of all 32 teeth (FDI notation)
- Click-to-edit tooth status: Normal, Filling, Crown, Missing, Scaling
- Color-coded visualization for quick assessment
- Save diagnosis notes, treatment plans, and medical history
- Patient selection with historical record tracking
- Allergy warnings and medical notes integration

### 👥 Patient Management (Admin)
- Full CRUD operations (Create, Read, Update, Delete)
- Patient profiles with:
  - Personal info (name, email, phone, birthdate, address)
  - Medical history and allergies
  - Appointment history
  - Treatment records
- Search and filter functionality
- Bulk operations support

### 💰 Invoice System
- Create itemized invoices with multiple treatments
- Auto-generate invoice numbers (format: INV-YYYYMMDD-XXX)
- Treatment presets for quick entry (Tambal, Scaling, Crown, etc.)
- Mark invoices as paid with timestamp
- Professional printable invoice view
- Patient notifications on invoice creation and payment
- Invoice history with status filtering

### 💊 Medicine Stock Management
- Real-time stock level monitoring
- Low stock alerts (visual indicators when stock ≤ minimum)
- Category-based organization (Anestesi, Antibiotik, Analgesik, etc.)
- Expiration date tracking
- Stock history logs
- Visual progress bars for quick assessment

### 🔔 Notification System
- Real-time notifications for:
  - Appointment bookings and status changes
  - Invoice creation and payment confirmations
  - Stock alerts (low inventory warnings)
  - Reminders (upcoming appointments)
- Unread badge counters
- Mark as read functionality
- Color-coded by notification type

### 📸 Photo Management
- Before/after treatment photo uploads (ready for implementation)
- Patient-linked photo galleries
- Treatment documentation

### 📊 Reports & Analytics (Admin)
- Treatment statistics (count by type)
- Revenue summaries
- Patient growth metrics
- Monthly performance reports

---

## 🛠️ Tech Stack

### Frontend
- **React 18.x** - UI framework
- **Axios** - HTTP client for API calls
- **React Context API** - Global state management
- **CSS-in-JS** - Inline styling for component isolation
- **Responsive Design** - Mobile-first approach (optimized for 375px-1920px)

### Backend
- **Node.js 20.x** - Runtime environment
- **Express.js** - Web framework
- **Prisma ORM** - Database ORM with type safety
- **PostgreSQL 15.x** - Relational database
- **JWT (jsonwebtoken)** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing

### DevOps & Tooling
- **Git** - Version control
- **npm** - Package management
- **Vite** - Build tool and dev server
- **Nodemon** - Auto-restart for development
- **ESLint** - Code linting

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Doctor UI  │  │   Admin UI   │  │  Patient UI  │      │
│  │   (React)    │  │   (React)    │  │   (React)    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │   (Axios + JWT) │
                    └────────┬────────┘
                             │
┌────────────────────────────┼─────────────────────────────────┐
│                   Backend Layer (Node.js + Express)          │
│  ┌─────────────────────────▼──────────────────────────────┐ │
│  │              REST API Routes                            │ │
│  │  /auth  /users  /appointments  /medical  /medicines    │ │
│  │  /photos  /notifications  /invoices                     │ │
│  └────────────────────┬─────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │         Middleware Layer                                │ │
│  │  • Authentication (JWT verification)                    │ │
│  │  • Authorization (Role-based access control)            │ │
│  │  • Error handling                                       │ │
│  │  • Request validation                                   │ │
│  └────────────────────┬─────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │         Business Logic Layer                            │ │
│  │  • Appointment scheduling & conflict detection          │ │
│  │  • Invoice generation (auto-numbering)                  │ │
│  │  • Stock level calculations                             │ │
│  │  • Notification dispatch                                │ │
│  └────────────────────┬─────────────────────────────────────┘ │
│                       │                                       │
│  ┌────────────────────▼────────────────────────────────────┐ │
│  │         Data Access Layer (Prisma ORM)                  │ │
│  │  • Query optimization                                   │ │
│  │  • Transaction management                               │ │
│  │  • Relation handling                                    │ │
│  └────────────────────┬─────────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                      │   │
│  │  ┌────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐   │   │
│  │  │ Users  │ │Patients  │ │Doctors │ │Medicines │   │   │
│  │  └────────┘ └──────────┘ └────────┘ └──────────┘   │   │
│  │  ┌────────────┐ ┌──────────┐ ┌──────────────┐     │   │
│  │  │Appointments│ │ Invoices │ │Notifications │     │   │
│  │  └────────────┘ └──────────┘ └──────────────┘     │   │
│  │  ┌───────────────┐ ┌──────┐                       │   │
│  │  │MedicalRecords │ │Photos│                       │   │
│  │  └───────────────┘ └──────┘                       │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 📸 Screenshots

### Login Screen
![Login](https://via.placeholder.com/800x600/0A1628/00C9A7?text=Login+Screen)

### Doctor Dashboard - Odontogram Editor
![Odontogram](https://via.placeholder.com/800x600/0A1628/00C9A7?text=Odontogram+Editor)

### Admin - Patient Management
![Patient CRUD](https://via.placeholder.com/800x600/1A0A2E/9B72CF?text=Patient+Management)

### Admin - Invoice Management
![Invoices](https://via.placeholder.com/800x600/1A0A2E/9B72CF?text=Invoice+System)

### Patient - Appointment Booking
![Booking](https://via.placeholder.com/800x600/003D2B/00C9A7?text=Appointment+Booking)

### Notification Center
![Notifications](https://via.placeholder.com/800x600/0A1628/FF9A3C?text=Notifications)

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v15.x or higher) - [Download](https://www.postgresql.org/download/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/dental-app.git
cd dental-app
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend  # or cd dental-app if using existing structure
npm install
```

### Database Setup

1. **Create PostgreSQL database**
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE dentalcare;

# Exit psql
\q
```

2. **Configure environment variables**

Create `.env` file in `backend/` directory:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/dentalcare"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
PORT=5000
NODE_ENV=development
UPLOAD_DIR=./uploads
```

**⚠️ Important:** Replace `YOUR_PASSWORD` with your PostgreSQL password!

3. **Run database migrations**
```bash
cd backend
npm run db:push
```

4. **Seed demo data (optional)**
```bash
npm run db:seed
```

This creates 3 demo accounts:
- **Doctor:** anisa@klinik.id / password123
- **Admin:** admin@klinik.id / password123
- **Patient:** budi@gmail.com / password123

### Running the Application

1. **Start backend server** (Terminal 1)
```bash
cd backend
npm run dev
```
Backend runs on: `http://localhost:5000`

2. **Start frontend dev server** (Terminal 2)
```bash
cd frontend  # or dental-app
npm run dev
```
Frontend runs on: `http://localhost:5173`

3. **Access the application**
- Open browser: `http://localhost:5173`
- Login with demo credentials above

---

## 👥 User Roles & Capabilities

### 🩺 Doctor (DOKTER)
| Feature | Capability |
|---------|-----------|
| Dashboard | View today's patient queue and statistics |
| Appointments | Confirm/complete appointments |
| Odontogram | Edit tooth status and save diagnosis |
| Medical Records | Create and view patient records |
| Photos | Upload before/after treatment photos |
| Schedule | View practice schedule |
| Notifications | Receive booking alerts |

### 👩‍💼 Admin
| Feature | Capability |
|---------|-----------|
| Dashboard | View all appointments and invoices |
| Patient Management | Full CRUD (Create, Read, Update, Delete) |
| Invoice Management | Create, edit, print invoices |
| Stock Management | Monitor and order medicines |
| Reports | View analytics and statistics |
| User Management | Manage all system users |
| Notifications | System-wide alerts |

### 👨 Patient (PASIEN)
| Feature | Capability |
|---------|-----------|
| Dashboard | View doctor info and appointment history |
| Booking | Book appointments with date/time selection |
| Appointment History | View upcoming and completed appointments |
| Cancel Appointment | Cancel pending appointments |
| Medical Records | View own treatment history |
| Notifications | Receive reminders and invoice alerts |
| Education | Access dental health tips |

---

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Create new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "PASIEN",
  "phone": "08123456789"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "clxxx",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PASIEN"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "anisa@klinik.id",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "clxxx",
    "email": "anisa@klinik.id",
    "name": "drg. Anisa Putri",
    "role": "DOKTER"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### GET `/api/auth/me`
Get current authenticated user.

**Headers:** `Authorization: Bearer {token}`

**Response:** `200 OK`

---

### Appointment Endpoints

#### GET `/api/appointments`
Get appointments (filtered by user role).

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` - Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `date` - Filter by date (YYYY-MM-DD)

**Response:** `200 OK`
```json
[
  {
    "id": "clxxx",
    "patientId": "clyyy",
    "doctorId": "clzzz",
    "date": "2025-02-20T00:00:00.000Z",
    "time": "09:00",
    "status": "CONFIRMED",
    "notes": "Kontrol rutin",
    "patient": {
      "name": "Budi Santoso",
      "email": "budi@gmail.com"
    },
    "doctor": {
      "name": "drg. Anisa Putri"
    }
  }
]
```

#### POST `/api/appointments`
Create new appointment.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "doctorId": "clzzz",
  "date": "2025-02-25",
  "time": "10:00",
  "notes": "Scaling rutin"
}
```

**Response:** `201 Created`

#### GET `/api/appointments/slots/available`
Get available time slots for a doctor on a specific date.

**Query Parameters:**
- `doctorId` (required)
- `date` (required, format: YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "availableSlots": ["08:00", "08:30", "09:30", "10:00", "10:30"],
  "bookedSlots": ["09:00"]
}
```

---

### Invoice Endpoints

#### POST `/api/invoices`
Create new invoice (Admin only).

**Request Body:**
```json
{
  "patientId": "clyyy",
  "items": [
    {
      "name": "Tambal Gigi",
      "description": "Tambal gigi 12 dengan komposit",
      "price": 350000
    },
    {
      "name": "Konsultasi",
      "description": "Pemeriksaan & konsultasi",
      "price": 75000
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "id": "clxxx",
  "invoiceNumber": "INV-20250219-456",
  "patientId": "clyyy",
  "items": [...],
  "total": 425000,
  "isPaid": false,
  "createdAt": "2025-02-19T..."
}
```

#### PATCH `/api/invoices/:id/paid`
Mark invoice as paid (Admin only).

**Response:** `200 OK`

---

For complete API documentation, see [API_DOCS.md](docs/API_DOCS.md)

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌──────────────┐         ┌──────────────┐
│     User     │         │   Doctor     │
│              │────────▶│   Profile    │
│ id           │         │ specialty    │
│ email        │         │ rating       │
│ password     │         │ schedule     │
│ name         │         └──────────────┘
│ role         │
└──────┬───────┘         ┌──────────────┐
       │                 │   Patient    │
       │────────────────▶│   Profile    │
       │                 │ birthDate    │
       │                 │ allergies    │
       │                 │ medicalHist  │
       │                 └──────┬───────┘
       │                        │
       ▼                        │
┌──────────────┐                │
│ Appointment  │                │
│              │◀───────────────┘
│ date         │
│ time         │         ┌──────────────┐
│ status       │         │   Medical    │
│ notes        │         │   Record     │
└──────────────┘         │              │
                         │ diagnosis    │
┌──────────────┐         │ treatment    │
│   Invoice    │         │ odontogram   │
│              │         └──────────────┘
│ invoiceNum   │
│ items (JSON) │         ┌──────────────┐
│ total        │         │  Medicine    │
│ isPaid       │         │              │
└──────────────┘         │ stock        │
                         │ minStock     │
┌──────────────┐         │ expiryDate   │
│ Notification │         └──────────────┘
│              │
│ type         │         ┌──────────────┐
│ title        │         │    Photo     │
│ message      │         │              │
│ isRead       │         │ beforePhoto  │
└──────────────┘         │ afterPhoto   │
                         │ treatment    │
                         └──────────────┘
```

### Key Tables

**Users** - Store all system users (doctors, admin, patients)
**PatientProfile** - Extended patient information
**DoctorProfile** - Doctor specialty and schedule
**Appointment** - Booking records with status tracking
**MedicalRecord** - Diagnosis, treatment, and odontogram data
**Invoice** - Itemized billing with payment status
**Medicine** - Inventory management
**Notification** - System alerts
**Photo** - Treatment documentation

For detailed schema, see [prisma/schema.prisma](backend/prisma/schema.prisma)

---

## 📁 Project Structure

```
dental-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   └── seed.js                # Demo data seeder
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js            # Authentication routes
│   │   │   ├── users.js           # User management
│   │   │   ├── appointments.js    # Appointment CRUD
│   │   │   ├── medical.js         # Medical records & odontogram
│   │   │   ├── medicines.js       # Stock management
│   │   │   ├── photos.js          # Photo uploads
│   │   │   ├── notifications.js   # Notification system
│   │   │   └── invoices.js        # Invoice management
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT verification
│   │   │   └── errorHandler.js    # Error handling
│   │   ├── utils/
│   │   │   └── jwt.js             # JWT utilities
│   │   └── server.js              # Express app entry
│   ├── uploads/                    # File storage
│   ├── .env                        # Environment variables
│   └── package.json
│
├── frontend/ (or dental-app/)
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingForm.jsx
│   │   │   ├── AppointmentHistory.jsx
│   │   │   ├── OdontogramEditor.jsx
│   │   │   ├── PatientManagement.jsx
│   │   │   ├── InvoiceManagement.jsx
│   │   │   └── NotificationScreen.jsx
│   │   ├── api/
│   │   │   └── client.js          # Axios configuration
│   │   ├── App.jsx                # Main app component
│   │   └── main.jsx               # React entry point
│   ├── public/
│   └── package.json
│
├── docs/
│   ├── API_DOCS.md                # Complete API reference
│   ├── SETUP-PRODUCTION.md        # Deployment guide
│   └── UPGRADE-PLAN.md            # Feature roadmap
│
├── README.md
└── LICENSE
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write clear commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

## 🐛 Known Issues & Roadmap

### Current Limitations
- Photo upload is UI-ready but needs backend storage configuration (S3/local)
- Email notifications require NodeMailer integration
- Real-time updates use polling (WebSocket would be ideal)
- PDF invoice generation is client-side only

### Planned Features (v2.0)
- [ ] WhatsApp/SMS appointment reminders (Twilio integration)
- [ ] Payment gateway integration (Midtrans/Xendit)
- [ ] Advanced analytics dashboard with charts
- [ ] Multi-clinic support
- [ ] Mobile app (React Native)
- [ ] Telemedicine integration
- [ ] Insurance claim management
- [ ] Prescription management
- [ ] Lab test integration

---



---

## 📞 Contact & Support

**Project Maintainer:** Aufar Akyas Aflaha
- Email: aflahasamsung@gmail.com
- GitHub: [@AufarAflaha](https://github.com/AufarAflaha)
- LinkedIn: [Aufar Akyas Aflaha](https://www.linkedin.com/in/aufar-akyas-aflaha-9b6633262/)

**Project Link:** [https://github.com/AufarAflaha/dental-app.git](https://github.com/AufarAflaha/dental-app.git)

---

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - Frontend framework
- [Node.js](https://nodejs.org/) - Backend runtime
- [PostgreSQL](https://www.postgresql.org/) - Database
- [Prisma](https://www.prisma.io/) - Database ORM
- [Vite](https://vitejs.dev/) - Build tool
- [Express](https://expressjs.com/) - Web framework

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/dental-app?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/dental-app?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/dental-app)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/dental-app)

---

<div align="center">

**Built with ❤️ for dental professionals**

[Report Bug](https://github.com/yourusername/dental-app/issues) · [Request Feature](https://github.com/yourusername/dental-app/issues) · 

</div>

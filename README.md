# RK Library Management System

A comprehensive web-based library management platform built with modern web technologies. This system enables libraries to manage seating arrangements, student subscriptions, shift scheduling, and facility bookings efficiently.

## 📋 Overview

RK Library is a full-stack web application designed to streamline library operations including seat management, student registration, subscription handling, shift scheduling, and booking systems. Built with Next.js 16, it provides a responsive interface for both administrators and students.

## ✨ Key Features

### Admin Features
- **Library Management**: Setup and configure library details, contact information, and facilities
- **Seat Management**: Create and manage floors with seat layouts and assignments
- **Shift Scheduling**: Configure multiple shifts (Morning, Afternoon, Evening, Night) with dynamic pricing
- **Student Management**: Register and track student information with document uploads (Aadhaar verification)
- **Subscription Management**: Handle subscription plans with start/end dates and payment tracking
- **Seat Assignments**: Assign students to specific seats in specific shifts
- **Inquiry Management**: Track and manage student inquiries with status updates (Pending, Contacted, Converted, Cancelled)
- **Dashboard Analytics**: View key statistics and library metrics
- **Booking System**: Manage seat pre-bookings and reservations
- **Registration Links**: Generate public registration links for student onboarding

### Student Features
- **Profile Management**: Maintain personal information and subscription status
- **Seat View**: Interactive seat map showing available seats across floors
- **Booking History**: Track all seat bookings and assignments
- **Renewal System**: Renew subscriptions when they expire
- **Active Sessions**: View current active sessions and usage history

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Utility-first styling
- **Shadcn UI** - High-quality UI components
- **React Hook Form** - Form state management
- **Zod** - Schema validation
- **React Query** - Data fetching and caching
- **React Table** - Advanced table component
- **Zustand** - State management
- **React Day Picker** - Date selection
- **Sonner** - Toast notifications
- **Lucide React** - Icon library

### Backend
- **Next.js API Routes** - Backend endpoints
- **Better Auth** - Authentication & session management
- **Prisma ORM** - Database abstraction
- **PostgreSQL** - Primary database (via Neon adapter)

### Media & Upload
- **ImageKit** - Image optimization and CDN
- **React Webcam** - Camera integration for document capture

### Document Export
- **jsPDF** - PDF generation
- **jsPDF AutoTable** - Table formatting in PDFs

### Development Tools
- **ESLint 9** - Code linting
- **Tailwind CSS PostCSS** - CSS processing

## 📁 Project Structure

```
app/
├── (auth)/                 # Authentication routes
│   ├── login/
│   ├── signup/
│   └── setup/
├── (main)/                 # Main application routes
│   ├── dashboard/
│   ├── profile/
│   ├── booking/
│   ├── student/
│   ├── seat-map/
│   ├── settings/
│   ├── history/
│   ├── inquiry/
│   ├── renewal/
│   └── about/
├── api/                    # API endpoints
│   ├── auth/
│   ├── booking/
│   ├── dashboard/
│   ├── inquiry/
│   ├── library/
│   ├── students/
│   └── subscriptions/
components/
├── auth/                   # Authentication components
├── dashboard/              # Dashboard components
├── seat-map/               # Seat mapping components
├── settings/               # Settings components
├── inquiry/                # Inquiry management components
├── profile/                # Profile components
├── ui/                     # Reusable UI components (Shadcn)
├── skelton/                # Loading skeleton components
└── layout/                 # Layout components

lib/
├── auth-client.ts          # Client-side auth utilities
├── auth.ts                 # Server-side auth setup
├── prisma.ts               # Prisma client
├── imageClintAuth.ts       # ImageKit client auth
├── validations.ts          # Zod schemas
├── utils.ts                # Utility functions
└── helper.ts               # Helper functions

prisma/
├── schema.prisma           # Database schema
└── migrations/             # Migration history

store/
├── useLibraryStore.ts      # Library store (Zustand)
└── useShiftStore.ts        # Shift store (Zustand)

types/
├── dashboard.ts            # Dashboard types
├── inqueriy.ts            # Inquiry types
└── seatMapTypes.ts        # Seat map types
```

## 🗄️ Database Schema

### Core Models

**User**
- Role-based access (Admin, User)
- Email verification support
- Session management
- Account banning capability

**Library**
- Library configuration and details
- Contact information and facilities
- Multiple floors and seats
- Shift and subscription management

**Student**
- Personal information with Aadhaar verification
- Document storage (Profile, Aadhaar front/back)
- Subscription tracking
- Seat assignments

**Seat & Floor**
- Multi-floor layout support
- Seat-level tracking with status
- Unique seat numbers per floor

**Shift**
- Four shift types: Morning, Afternoon, Evening, Night
- Dynamic pricing per shift
- Seat capacity management

**Subscription**
- Date-based subscriptions (Active/Expired status)
- Discount and payment tracking
- Floor and shift preferences

**SeatAssignment**
- Student-to-seat-shift mapping
- Prevents double-booking

**Inquiry**
- Lead tracking with status management
- Conversion funnel support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or higher
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rklibrary
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
Create a `.env.local` file with:
```env
# Database
DATABASE_URL="postgresql://..."

# Authentication
BETTER_AUTH_SECRET="your_secret_key"
BETTER_AUTH_URL="http://localhost:3000"

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="your_key"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="your_endpoint"
NEXT_PUBLIC_IMAGEKIT_PRIVATE_KEY="your_private_key"
```

4. Setup Prisma:
```bash
npx prisma generate
npx prisma db push
# or
npx prisma migrate dev --name init
```

5. Seed database (optional):
```bash
npm run seed
```

6. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint code quality checks
- `npm run seed` - Seed database with initial data

## 🔐 Authentication

The application uses **Better Auth** for authentication and session management with support for:
- Email/password authentication
- Social provider integration
- Session tracking
- User account banning

## 📱 Key Pages & Routes

### Public Routes
- `/` - Home page
- `/about` - About library
- `/login` - User login
- `/signup` - User registration
- `/setup` - Library setup wizard

### Protected Routes (Authenticated Users)
- `/dashboard` - Main dashboard with statistics
- `/profile` - User profile management
- `/booking` - Seat pre-booking system
- `/seat-map` - Interactive seat layout and assignments
- `/settings` - Library configuration
- `/students` - Student management
- `/inquiry` - Lead/inquiry tracking
- `/history` - Booking and subscription history
- `/student/renew` - Subscription renewal
- `/registration-success` - Registration confirmation

## 💾 Database Management

### Prisma Commands
```bash
# Generate Prisma Client
npx prisma generate

# Create new migration
npx prisma migrate dev --name <migration_name>

# Reset database (dev only)
npx prisma migrate reset

# View database UI
npx prisma studio

# Check migration status
npx prisma migrate status
```

## 🎨 UI Component Library

The project uses Shadcn UI components including:
- Alert Dialog
- Buttons, Cards, Inputs
- Dropdowns, Popups
- Tables with sorting and filtering
- Date/Month pickers
- Form elements

All components are customizable with Tailwind CSS.

## 📸 Image Optimization

Images are optimized through ImageKit with:
- Multiple quality levels (25%, 50%, 75%)
- Remote pattern support for ik.imagekit.io
- Automatic format optimization

## 🔄 State Management

- **Zustand** for client-side state
- **React Query** for server state and caching
- **React Hook Form** for form state

## 📊 Data Fetching

- Server-side data fetching with Prisma
- Client-side queries with React Query
- API routes for backend logic

## 🌐 Deployment

Deploy on [Vercel](https://vercel.com):

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📝 Development Guidelines

- Follow TypeScript best practices
- Use Zod for runtime validation
- Components in `components/` folder
- Utilities in `lib/` folder
- Types in `types/` folder
- API routes in `app/api/` folder


## 📄 License

This project is private and proprietary.

## 📞 Support

For issues or questions, please contact the development team.

---

**Last Updated**: May 2026
**Version**: 0.1.0

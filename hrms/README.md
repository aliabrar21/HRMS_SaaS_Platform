# HRMS SaaS Platform

A production-grade, end-to-end Human Resource Management System (Zoho People style) built as a modern full-stack monorepo. This platform is designed to handle all aspects of HR, from recruitment and onboarding to payroll, performance tracking, and leave management.

## 🚀 Features

### Core Modules
- **Authentication & Authorization**: Secure JWT-based authentication, role-based access control (RBAC).
- **Employee Directory**: Centralized employee profiles, assets tracking, and directory.
- **Onboarding & Offboarding**: Streamlined employee lifecycle management.
- **Attendance & Time Tracking**: Real-time attendance monitoring, leave requests, and tracking.
- **Payroll Management**: Automated salary calculations, payslip generation, and expense claims.
- **Performance Management**: Appraisals, OKRs, feedback tracking, and employee reviews.
- **Recruitment (ATS)**: Job postings, applicant tracking, and interview scheduling.
- **Learning Management System (LMS)**: Employee training, courses, and progress tracking.
- **Helpdesk & Ticketing**: Internal IT/HR support ticketing system.
- **Document Management**: Centralized secure storage for employee documents (AWS S3 integrated).
- **Real-time Notifications**: WebSockets-based in-app notifications and email alerts.
- **Analytics & Reporting**: Interactive dashboards and comprehensive data visualizations.

## 🛠 Tech Stack

This project is structured as a **Monorepo** using **pnpm workspaces**, separating the frontend, backend, and shared logic.

### Frontend (`@hrms/web`)
- **Framework**: React 18 with Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Radix UI (Headless UI components)
- **State Management**: Zustand (Global state) + React Query (Server state)
- **Routing**: React Router v6
- **Forms & Validation**: React Hook Form + Zod
- **Animations & Charts**: Framer Motion, Recharts
- **Other Utilities**: date-fns, axios, dompurify

### Backend (`@hrms/api`)
- **Framework**: Node.js + Express
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Background Jobs**: BullMQ + Redis
- **Real-time**: Socket.io
- **Storage**: AWS S3 (via `@aws-sdk/client-s3`)
- **Authentication**: JWT, bcrypt, Google Auth Library
- **Security**: Helmet, Express Rate Limit, CORS
- **File Processing**: PDFKit (Payslips/Reports), Sharp (Image optimization), Multer
- **Email Processing**: NodeMailer

### Shared (`@hrms/shared`)
- Shared TypeScript interfaces, types, and Zod schemas (e.g., auth schemas) used by both Frontend and Backend to ensure type safety across the stack.

## 📂 Project Structure

```text
hrms/
├── backend/                # Express API server
│   ├── prisma/             # Database schema and seeders
│   └── src/
│       ├── modules/        # Feature-based modules (Auth, Leave, Payroll, etc.)
│       ├── queues/         # BullMQ background job queues
│       ├── websockets/     # Socket.io event handlers
│       └── server.ts       # API entry point
├── frontend/               # React web application
│   ├── src/
│   │   ├── app/            # Global routing and app configuration
│   │   ├── components/     # Reusable UI components (Tailwind + Radix)
│   │   ├── layouts/        # Page layouts (Dashboard, Sidebar, Header)
│   │   ├── modules/        # Feature-based frontend modules (Pages & API hooks)
│   │   └── store/          # Zustand global stores
├── packages/
│   └── shared/             # Shared types and validation schemas
├── pnpm-workspace.yaml     # Monorepo configuration
└── package.json            # Root configuration and scripts
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- pnpm (v10+)
- Redis (for BullMQ background jobs)
- PostgreSQL / MySQL (Configured via Prisma)

### 1. Installation
Clone the repository and install dependencies across all workspaces:
```bash
git clone https://github.com/Shiva33987/SAAS.git
cd hrms
pnpm install
```

### 2. Environment Configuration
Create `.env` files for both the backend and frontend based on the provided `.env.example` templates.
- **Backend**: Configure Database URL, Redis URL, JWT Secret, AWS credentials, etc.
- **Frontend**: Configure API Base URL.

### 3. Database Setup
Generate Prisma client and run migrations:
```bash
pnpm db:generate
pnpm db:migrate
pnpm db:seed       # Optional: Seed initial data
```

### 4. Running the Application
Start both the backend API and frontend React app concurrently:
```bash
pnpm dev
```
- The **Frontend** will be available at `http://localhost:5173`
- The **Backend API** will be available at `http://localhost:3000`

## 📜 Scripts Overview
From the root directory, you can run the following commands:
- `pnpm dev`: Starts both frontend and backend development servers.
- `pnpm build`: Builds all workspaces for production.
- `pnpm lint`: Runs ESLint and Prettier checks.
- `pnpm format`: Formats code using Prettier.
- `pnpm db:generate`: Generates Prisma client.
- `pnpm db:migrate`: Runs database migrations.

## 🛡️ Architecture & Design Decisions
- **Feature-first Architecture**: Both frontend and backend codebases are organized by feature modules (`auth`, `payroll`, `leave`, etc.) rather than technical roles. This ensures excellent maintainability and scalability.
- **Type Safety**: By using a `shared` workspace, API contracts (request/response schemas) are strictly typed using Zod, ensuring frontend forms and backend validators are always in sync.
- **Background Processing**: Heavy tasks like payroll generation, email sending, and report generation are offloaded to BullMQ workers backed by Redis, keeping the main thread fast and non-blocking.

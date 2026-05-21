import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/modules/auth/pages/login-page';
import RegisterPage from '@/modules/auth/pages/register-page';
import VerifyOtpPage from '@/modules/auth/pages/verify-otp-page';
import DashboardPage from './routes/dashboard-page';
import ProtectedRoute from './routes/protected-route';
import { EmployeesPage } from './routes/employees-page';
import { AttendancePage } from './routes/attendance-page';
import { LeavePage } from './routes/leave-page';
import { PayrollPage } from './routes/payroll-page';
import { RecruitmentPage } from './routes/recruitment-page';
import { DocumentsPage } from './routes/documents-page';
import { PerformancePage } from './routes/performance-page';
import { HelpdeskPage } from './routes/helpdesk-page';
import { LmsPage } from './routes/lms-page';
import { OnboardingPage } from './routes/onboarding-page';
import { AnalyticsPage } from './routes/analytics-page';
import { AssetsPage } from './routes/assets-page';
import { ExpensesPage } from './routes/expenses-page';
import { NotificationsPage } from './routes/notifications-page';
import { MonitoringPage } from './routes/monitoring-page';
import { SettingsPage } from './routes/settings-page';
import { EmployeeProfilePage } from './routes/employee-profile-page';
import { EmployeeEditPage } from './routes/employee-edit-page';
import ErrorPage from './routes/error-page';

export const router = createBrowserRouter([
  {
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/verify-otp', element: <VerifyOtpPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/employees', element: <EmployeesPage /> },
          { path: '/employees/:id', element: <EmployeeProfilePage /> },
          { path: '/employees/:id/edit', element: <EmployeeEditPage /> },
          { path: '/attendance', element: <AttendancePage /> },
          { path: '/leave', element: <LeavePage /> },
          { path: '/payroll', element: <PayrollPage /> },
          { path: '/recruitment', element: <RecruitmentPage /> },
          { path: '/documents', element: <DocumentsPage /> },
          { path: '/performance', element: <PerformancePage /> },
          { path: '/helpdesk', element: <HelpdeskPage /> },
          { path: '/lms', element: <LmsPage /> },
          { path: '/onboarding', element: <OnboardingPage /> },
          { path: '/analytics', element: <AnalyticsPage /> },
          { path: '/assets', element: <AssetsPage /> },
          { path: '/expenses', element: <ExpensesPage /> },
          { path: '/notifications', element: <NotificationsPage /> },
          { path: '/monitoring', element: <MonitoringPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ]
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);

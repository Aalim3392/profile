import { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/protected-route.jsx';
import { RouteLoader } from './components/ui/route-loader.jsx';
import { AdminLayout } from './components/layout/admin-layout.jsx';
import { EmployeeLayout } from './components/layout/employee-layout.jsx';
import { useAuthStore } from './stores/auth-store.js';
import { LoginPage } from './pages/login-page.jsx';

const AdminAnalyticsPage = lazy(() => import('./pages/admin/analytics-page.jsx').then((module) => ({ default: module.AdminAnalyticsPage })));
const AdminAttendancePage = lazy(() => import('./pages/admin/attendance-page.jsx').then((module) => ({ default: module.AdminAttendancePage })));
const AdminDashboardPage = lazy(() => import('./pages/admin/dashboard-page.jsx').then((module) => ({ default: module.AdminDashboardPage })));
const AdminEmployeesPage = lazy(() => import('./pages/admin/employees-page.jsx').then((module) => ({ default: module.AdminEmployeesPage })));
const AdminInterviewsPage = lazy(() => import('./pages/admin/interviews-page.jsx').then((module) => ({ default: module.AdminInterviewsPage })));
const AdminJobsPage = lazy(() => import('./pages/admin/jobs-page.jsx').then((module) => ({ default: module.AdminJobsPage })));
const AdminLeavesPage = lazy(() => import('./pages/admin/leaves-page.jsx').then((module) => ({ default: module.AdminLeavesPage })));
const AdminNotificationsPage = lazy(() => import('./pages/admin/notifications-page.jsx').then((module) => ({ default: module.AdminNotificationsPage })));
const AdminTasksPage = lazy(() => import('./pages/admin/tasks-page.jsx').then((module) => ({ default: module.AdminTasksPage })));
const AdminTicketsPage = lazy(() => import('./pages/admin/tickets-page.jsx').then((module) => ({ default: module.AdminTicketsPage })));
const EmployeeAttendancePage = lazy(() => import('./pages/employee/attendance-page.jsx').then((module) => ({ default: module.EmployeeAttendancePage })));
const EmployeeDashboardPage = lazy(() => import('./pages/employee/dashboard-page.jsx').then((module) => ({ default: module.EmployeeDashboardPage })));
const EmployeeInterviewPrepPage = lazy(() => import('./pages/employee/interview-prep-page.jsx').then((module) => ({ default: module.EmployeeInterviewPrepPage })));
const EmployeeLeavesPage = lazy(() => import('./pages/employee/leaves-page.jsx').then((module) => ({ default: module.EmployeeLeavesPage })));
const EmployeeNotificationsPage = lazy(() => import('./pages/employee/notifications-page.jsx').then((module) => ({ default: module.EmployeeNotificationsPage })));
const EmployeeProfilePage = lazy(() => import('./pages/employee/profile-page.jsx').then((module) => ({ default: module.EmployeeProfilePage })));
const EmployeeSalaryPage = lazy(() => import('./pages/employee/salary-page.jsx').then((module) => ({ default: module.EmployeeSalaryPage })));
const EmployeeTasksPage = lazy(() => import('./pages/employee/tasks-page.jsx').then((module) => ({ default: module.EmployeeTasksPage })));
const EmployeeTicketsPage = lazy(() => import('./pages/employee/tickets-page.jsx').then((module) => ({ default: module.EmployeeTicketsPage })));

function lazyPage(element) {
  return <Suspense fallback={<RouteLoader />}>{element}</Suspense>;
}

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={lazyPage(<AdminDashboardPage />)} />
        <Route path="employees" element={lazyPage(<AdminEmployeesPage />)} />
        <Route path="attendance" element={lazyPage(<AdminAttendancePage />)} />
        <Route path="leaves" element={lazyPage(<AdminLeavesPage />)} />
        <Route path="tasks" element={lazyPage(<AdminTasksPage />)} />
        <Route path="jobs" element={lazyPage(<AdminJobsPage />)} />
        <Route path="interviews" element={lazyPage(<AdminInterviewsPage />)} />
        <Route path="analytics" element={lazyPage(<AdminAnalyticsPage />)} />
        <Route path="tickets" element={lazyPage(<AdminTicketsPage />)} />
        <Route path="notifications" element={lazyPage(<AdminNotificationsPage />)} />
      </Route>

      <Route
        path="/employee/*"
        element={
          <ProtectedRoute role="employee">
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/employee/dashboard" replace />} />
        <Route path="dashboard" element={lazyPage(<EmployeeDashboardPage />)} />
        <Route path="tasks" element={lazyPage(<EmployeeTasksPage />)} />
        <Route path="attendance" element={lazyPage(<EmployeeAttendancePage />)} />
        <Route path="leaves" element={lazyPage(<EmployeeLeavesPage />)} />
        <Route path="salary" element={lazyPage(<EmployeeSalaryPage />)} />
        <Route path="profile" element={lazyPage(<EmployeeProfilePage />)} />
        <Route path="tickets" element={lazyPage(<EmployeeTicketsPage />)} />
        <Route path="interview-prep" element={lazyPage(<EmployeeInterviewPrepPage />)} />
        <Route path="notifications" element={lazyPage(<EmployeeNotificationsPage />)} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

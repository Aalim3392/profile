import { ShellLayout } from './shell-layout.jsx';

const adminMenu = [
  'Dashboard',
  'Employees',
  'Attendance',
  'Leaves',
  'Tasks',
  'Jobs',
  'Interviews',
  'Analytics',
  'Tickets',
  'Notifications',
];

export function AdminLayout() {
  return <ShellLayout brand="HRMS Pro Admin" basePath="/admin" menu={adminMenu} />;
}

import { ShellLayout } from './shell-layout.jsx';

const employeeMenu = ['Dashboard', 'Tasks', 'Attendance', 'Leaves', 'Salary', 'Profile', 'Tickets', 'Interview Prep', 'Notifications'];

export function EmployeeLayout() {
  return <ShellLayout brand="HRMS Pro Employee" basePath="/employee" menu={employeeMenu} />;
}

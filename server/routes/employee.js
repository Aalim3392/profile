import express from 'express';
import {
  checkInEmployee,
  checkOutEmployee,
  createEmployeeLeave,
  createEmployeeTicket,
  getEmployeeDashboard,
  getEmployeeProfile,
  getEmployeeSalary,
  listEmployeeInterviewPrep,
  listEmployeeAttendance,
  listEmployeeLeaves,
  listEmployeeTasks,
  listEmployeeTickets,
  updateEmployeeProfile,
  updateOwnTaskRecord,
} from '../db/queries.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.use((req, res, next) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ success: false, message: 'Employee access required.' });
  }

  return next();
});

router.get('/api/auth/dashboard', (req, res) => {
  res.json({ success: true, data: getEmployeeDashboard(req.user.id) });
});

router.get('/api/auth/tasks', (req, res) => {
  res.json({ success: true, data: listEmployeeTasks(req.user.id, req.query) });
});

router.put('/api/auth/tasks/:id', (req, res) => {
  const data = updateOwnTaskRecord(req.user.id, req.params.id, req.body);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  return res.json({ success: true, data });
});

router.get('/api/auth/attendance', (req, res) => {
  res.json({ success: true, data: listEmployeeAttendance(req.user.id) });
});

router.post('/api/auth/attendance/checkin', (req, res) => {
  res.status(201).json({ success: true, data: checkInEmployee(req.user.id) });
});

router.post('/api/auth/attendance/checkout', (req, res) => {
  res.status(201).json({ success: true, data: checkOutEmployee(req.user.id) });
});

router.get('/api/auth/leaves', (req, res) => {
  res.json({ success: true, data: listEmployeeLeaves(req.user.id) });
});

router.post('/api/auth/leaves', (req, res) => {
  res.status(201).json({ success: true, data: createEmployeeLeave(req.user.id, req.body) });
});

router.get('/api/auth/salary', (req, res) => {
  res.json({ success: true, data: getEmployeeSalary(req.user.id, req.query.month) });
});

router.get('/api/auth/profile', (req, res) => {
  res.json({ success: true, data: getEmployeeProfile(req.user.id) });
});

router.put('/api/auth/profile', (req, res) => {
  const data = updateEmployeeProfile(req.user.id, req.body);
  return res.json({ success: true, data });
});

router.get('/api/auth/tickets', (req, res) => {
  res.json({ success: true, data: listEmployeeTickets(req.user.id) });
});

router.post('/api/auth/tickets', (req, res) => {
  res.status(201).json({ success: true, data: createEmployeeTicket(req.user.id, req.body) });
});

router.get('/api/auth/interview-prep', (req, res) => {
  res.json({ success: true, data: listEmployeeInterviewPrep(req.user.id) });
});

export default router;

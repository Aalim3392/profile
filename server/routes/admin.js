import express from 'express';
import {
  createApplicationRecord,
  createEmployeeRecord,
  createInterviewRecord,
  createJobRecord,
  createTaskRecord,
  deleteEmployeeRecord,
  deleteTaskRecord,
  getAdminDashboardSummary,
  getAnalyticsSummary,
  getAttendanceSummary,
  listApplicationsByJob,
  listAttendance,
  listEmployees,
  listInterviews,
  listJobs,
  listLeaves,
  listTasks,
  listTickets,
  updateApplicationRecord,
  updateEmployeeRecord,
  updateInterviewRecord,
  updateJobRecord,
  updateLeaveStatus,
  updateTaskRecord,
  updateTicketRecord,
  upsertAttendanceRecord,
} from '../db/queries.js';
import { requireAdmin, verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get('/api/auth/dashboard', (_req, res) => {
  res.json({ success: true, data: getAdminDashboardSummary() });
});

router.get('/api/auth/employees', (req, res) => {
  res.json({ success: true, data: listEmployees(req.query) });
});

router.post('/api/auth/employees', (req, res) => {
  res.status(201).json({ success: true, data: createEmployeeRecord(req.body) });
});

router.put('/api/auth/employees/:id', (req, res) => {
  const data = updateEmployeeRecord(req.params.id, req.body);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Employee not found.' });
  }

  return res.json({ success: true, data });
});

router.delete('/api/auth/employees/:id', (req, res) => {
  const deleted = deleteEmployeeRecord(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Employee not found.' });
  }

  return res.json({ success: true, message: 'Employee deleted.' });
});

router.get('/api/auth/attendance', (req, res) => {
  res.json({
    success: true,
    data: {
      summary: getAttendanceSummary(),
      records: listAttendance(req.query),
    },
  });
});

router.post('/api/auth/attendance', (req, res) => {
  res.status(201).json({ success: true, data: upsertAttendanceRecord(req.body) });
});

router.get('/api/auth/leaves', (req, res) => {
  res.json({ success: true, data: listLeaves(req.query) });
});

router.put('/api/auth/leaves/:id', (req, res) => {
  const data = updateLeaveStatus(req.params.id, req.body.status, req.user.id);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Leave request not found.' });
  }

  return res.json({ success: true, data });
});

router.get('/api/auth/tasks', (req, res) => {
  res.json({ success: true, data: listTasks(req.query) });
});

router.post('/api/auth/tasks', (req, res) => {
  res.status(201).json({ success: true, data: createTaskRecord(req.body, req.user.id) });
});

router.put('/api/auth/tasks/:id', (req, res) => {
  const data = updateTaskRecord(req.params.id, req.body);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  return res.json({ success: true, data });
});

router.delete('/api/auth/tasks/:id', (req, res) => {
  const deleted = deleteTaskRecord(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  return res.json({ success: true, message: 'Task deleted.' });
});

router.get('/api/auth/jobs', (_req, res) => {
  res.json({ success: true, data: listJobs() });
});

router.post('/api/auth/jobs', (req, res) => {
  res.status(201).json({ success: true, data: createJobRecord(req.body, req.user.id) });
});

router.put('/api/auth/jobs/:id', (req, res) => {
  const data = updateJobRecord(req.params.id, req.body);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Job not found.' });
  }

  return res.json({ success: true, data });
});

router.get('/api/auth/jobs/:id/applications', (req, res) => {
  res.json({ success: true, data: listApplicationsByJob(req.params.id) });
});

router.post('/api/auth/applications', (req, res) => {
  res.status(201).json({ success: true, data: createApplicationRecord(req.body) });
});

router.put('/api/auth/applications/:id', (req, res) => {
  const data = updateApplicationRecord(req.params.id, req.body);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  return res.json({ success: true, data });
});

router.get('/api/auth/interviews', (_req, res) => {
  res.json({ success: true, data: listInterviews() });
});

router.post('/api/auth/interviews', (req, res) => {
  res.status(201).json({ success: true, data: createInterviewRecord(req.body) });
});

router.put('/api/auth/interviews/:id', (req, res) => {
  const data = updateInterviewRecord(req.params.id, req.body);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Interview not found.' });
  }

  return res.json({ success: true, data });
});

router.get('/api/auth/tickets', (_req, res) => {
  res.json({ success: true, data: listTickets() });
});

router.put('/api/auth/tickets/:id', (req, res) => {
  const data = updateTicketRecord(req.params.id, req.body);
  if (!data) {
    return res.status(404).json({ success: false, message: 'Ticket not found.' });
  }

  return res.json({ success: true, data });
});

router.get('/api/auth/analytics/summary', (_req, res) => {
  res.json({ success: true, data: getAnalyticsSummary() });
});

export default router;

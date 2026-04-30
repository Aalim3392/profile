import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, 'hrms.db');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const createTables = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT,
  position TEXT,
  phone TEXT,
  avatar_url TEXT,
  joining_date TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS employees (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  employee_code TEXT UNIQUE,
  salary REAL DEFAULT 0,
  manager_id TEXT,
  location TEXT,
  skills TEXT,
  bio TEXT
);

CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  date TEXT NOT NULL,
  check_in TEXT,
  check_out TEXT,
  status TEXT,
  hours_worked REAL
);

CREATE TABLE IF NOT EXISTS leaves (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  leave_type TEXT,
  from_date TEXT,
  to_date TEXT,
  reason TEXT,
  status TEXT DEFAULT 'pending',
  approved_by TEXT,
  applied_on TEXT DEFAULT (datetime('now')),
  total_days INTEGER
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to TEXT REFERENCES users(id),
  assigned_by TEXT REFERENCES users(id),
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'todo',
  due_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT,
  description TEXT,
  requirements TEXT,
  location TEXT,
  type TEXT,
  status TEXT DEFAULT 'open',
  posted_by TEXT REFERENCES users(id),
  posted_on TEXT DEFAULT (datetime('now')),
  closing_date TEXT
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  job_id TEXT REFERENCES jobs(id),
  applicant_name TEXT,
  applicant_email TEXT,
  phone TEXT,
  resume_text TEXT,
  cover_letter TEXT,
  status TEXT DEFAULT 'applied',
  applied_on TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS interviews (
  id TEXT PRIMARY KEY,
  application_id TEXT REFERENCES applications(id),
  job_id TEXT REFERENCES jobs(id),
  candidate_name TEXT,
  candidate_email TEXT,
  interviewer_id TEXT REFERENCES users(id),
  scheduled_at TEXT,
  duration_minutes INTEGER DEFAULT 60,
  mode TEXT DEFAULT 'video',
  status TEXT DEFAULT 'scheduled',
  feedback TEXT,
  rating INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  subject TEXT,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'open',
  priority TEXT DEFAULT 'medium',
  created_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  role TEXT,
  content TEXT,
  session_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  title TEXT,
  message TEXT,
  type TEXT,
  is_read INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
`;

const sampleEmployees = [
  {
    name: 'Aarav Mehta',
    email: 'aarav.mehta@hrms.com',
    role: 'employee',
    department: 'Engineering',
    position: 'Frontend Developer',
    phone: '+91 98765 10234',
    joiningDate: '2024-02-12',
    salary: 78000,
    location: 'Bengaluru',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    bio: 'Builds polished internal tools and employee-facing experiences.',
  },
  {
    name: 'Priya Nair',
    email: 'priya.nair@hrms.com',
    role: 'employee',
    department: 'Human Resources',
    position: 'HR Business Partner',
    phone: '+91 98765 20456',
    joiningDate: '2023-10-04',
    salary: 65000,
    location: 'Kochi',
    skills: ['People Operations', 'Recruitment', 'Compliance'],
    bio: 'Supports employee experience, onboarding, and policy guidance.',
  },
  {
    name: 'Rohan Kapoor',
    email: 'rohan.kapoor@hrms.com',
    role: 'employee',
    department: 'Design',
    position: 'Product Designer',
    phone: '+91 98765 30987',
    joiningDate: '2024-01-08',
    salary: 72000,
    location: 'Pune',
    skills: ['Figma', 'Design Systems', 'User Research'],
    bio: 'Designs employee workflows with a warm, high-clarity visual style.',
  },
  {
    name: 'Sneha Iyer',
    email: 'sneha.iyer@hrms.com',
    role: 'employee',
    department: 'Finance',
    position: 'Payroll Specialist',
    phone: '+91 98765 41230',
    joiningDate: '2022-08-19',
    salary: 69000,
    location: 'Chennai',
    skills: ['Payroll', 'Excel', 'Statutory Compliance'],
    bio: 'Keeps payroll accurate and helps employees with salary-related questions.',
  },
  {
    name: 'Vikram Shah',
    email: 'vikram.shah@hrms.com',
    role: 'employee',
    department: 'Operations',
    position: 'Operations Analyst',
    phone: '+91 98765 52341',
    joiningDate: '2023-05-15',
    salary: 61000,
    location: 'Mumbai',
    skills: ['Operations', 'Reporting', 'Process Improvement'],
    bio: 'Tracks operational performance and supports cross-team execution.',
  },
];

const selectEmployeeFields = `
  u.id,
  u.name,
  u.email,
  u.role,
  u.department,
  u.position,
  u.phone,
  u.avatar_url,
  u.joining_date,
  u.status,
  u.created_at,
  e.id AS employee_id,
  e.employee_code,
  e.salary,
  e.manager_id,
  e.location,
  e.skills,
  e.bio
`;

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function formatDateTime(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function safeJsonParse(value, fallback = []) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function mapEmployeeRow(row) {
  return {
    ...row,
    salary: Number(row.salary || 0),
    skills: safeJsonParse(row.skills),
  };
}

function createNotification(userId, title, message, type = 'info') {
  db.prepare(
    `
      INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?)
    `
  ).run(uuidv4(), userId, title, message, type, formatDateTime(new Date()));
}

function createAdminNotifications(title, message, type = 'info') {
  const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();
  admins.forEach((admin) => createNotification(admin.id, title, message, type));
}

function getAdminId() {
  return db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get()?.id;
}

function seedUsers() {
  const insertUser = db.prepare(`
    INSERT INTO users (
      id, name, email, password, role, department, position, phone, avatar_url, joining_date, status
    ) VALUES (
      @id, @name, @email, @password, @role, @department, @position, @phone, @avatar_url, @joining_date, @status
    )
  `);

  const insertEmployee = db.prepare(`
    INSERT INTO employees (
      id, user_id, employee_code, salary, manager_id, location, skills, bio
    ) VALUES (
      @id, @user_id, @employee_code, @salary, @manager_id, @location, @skills, @bio
    )
  `);

  const adminId = uuidv4();

  insertUser.run({
    id: adminId,
    name: 'Admin User',
    email: 'admin@hrms.com',
    password: bcrypt.hashSync('Admin@123', 10),
    role: 'admin',
    department: 'Administration',
    position: 'HR Director',
    phone: '+91 90000 00001',
    avatar_url: '',
    joining_date: '2022-01-03',
    status: 'active',
  });

  sampleEmployees.forEach((employee, index) => {
    const userId = uuidv4();

    insertUser.run({
      id: userId,
      name: employee.name,
      email: employee.email,
      password: bcrypt.hashSync('Employee@123', 10),
      role: employee.role,
      department: employee.department,
      position: employee.position,
      phone: employee.phone,
      avatar_url: '',
      joining_date: employee.joiningDate,
      status: 'active',
    });

    insertEmployee.run({
      id: uuidv4(),
      user_id: userId,
      employee_code: `EMP-${String(index + 1).padStart(3, '0')}`,
      salary: employee.salary,
      manager_id: adminId,
      location: employee.location,
      skills: JSON.stringify(employee.skills),
      bio: employee.bio,
    });
  });

  return adminId;
}

function seedAttendance() {
  const users = db.prepare("SELECT id FROM users WHERE role = 'employee'").all();
  const insertAttendance = db.prepare(`
    INSERT INTO attendance (id, user_id, date, check_in, check_out, status, hours_worked)
    VALUES (@id, @user_id, @date, @check_in, @check_out, @status, @hours_worked)
  `);

  const today = new Date();

  users.forEach((user, userIndex) => {
    for (let i = 0; i < 30; i += 1) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() - i);
      const day = currentDate.getDay();

      let status = 'present';
      if (day === 0) {
        status = 'leave';
      } else if (day === 6 && i % 2 === 0) {
        status = 'half-day';
      } else if ((i + userIndex) % 13 === 0) {
        status = 'absent';
      }

      insertAttendance.run({
        id: uuidv4(),
        user_id: user.id,
        date: formatDate(currentDate),
        check_in: status === 'absent' ? null : `${formatDate(currentDate)} 09:${String((userIndex + i) % 6).padStart(2, '0')}:00`,
        check_out:
          status === 'absent' ? null : `${formatDate(currentDate)} 18:${String((userIndex + i + 2) % 6).padStart(2, '0')}:00`,
        status,
        hours_worked: status === 'present' ? 8.5 : status === 'half-day' ? 4.2 : 0,
      });
    }
  });
}

function seedLeaves(adminId) {
  const employees = db.prepare("SELECT id, name FROM users WHERE role = 'employee'").all();
  const insertLeave = db.prepare(`
    INSERT INTO leaves (id, user_id, leave_type, from_date, to_date, reason, status, approved_by, applied_on, total_days)
    VALUES (@id, @user_id, @leave_type, @from_date, @to_date, @reason, @status, @approved_by, @applied_on, @total_days)
  `);

  const leaveTypes = ['sick', 'casual', 'earned'];
  const statuses = ['pending', 'approved', 'rejected'];

  employees.forEach((employee, index) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (index + 3) * 2);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);

    insertLeave.run({
      id: uuidv4(),
      user_id: employee.id,
      leave_type: leaveTypes[index % leaveTypes.length],
      from_date: formatDate(startDate),
      to_date: formatDate(endDate),
      reason: `${employee.name.split(' ')[0]} requested time off for personal matters.`,
      status: statuses[index % statuses.length],
      approved_by: index % 3 === 0 ? null : adminId,
      applied_on: formatDateTime(new Date(startDate)),
      total_days: 2,
    });
  });
}

function seedTasks(adminId) {
  const employees = db.prepare("SELECT id, name, department FROM users WHERE role = 'employee'").all();
  const insertTask = db.prepare(`
    INSERT INTO tasks (id, title, description, assigned_to, assigned_by, priority, status, due_date, completed_at)
    VALUES (@id, @title, @description, @assigned_to, @assigned_by, @priority, @status, @due_date, @completed_at)
  `);

  const priorities = ['medium', 'high', 'low', 'urgent', 'medium'];
  const statuses = ['todo', 'in-progress', 'completed', 'todo', 'completed'];

  employees.forEach((employee, index) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + index + 1);
    const completedAt = statuses[index] === 'completed' ? formatDateTime(new Date()) : null;

    insertTask.run({
      id: uuidv4(),
      title: `Complete ${employee.name.split(' ')[0]}'s weekly deliverable`,
      description: `Review and submit the weekly progress update for ${employee.department}.`,
      assigned_to: employee.id,
      assigned_by: adminId,
      priority: priorities[index],
      status: statuses[index],
      due_date: formatDate(dueDate),
      completed_at: completedAt,
    });
  });
}

function seedJobsAndHiring(adminId) {
  const insertJob = db.prepare(`
    INSERT INTO jobs (id, title, department, description, requirements, location, type, status, posted_by, posted_on, closing_date)
    VALUES (@id, @title, @department, @description, @requirements, @location, @type, @status, @posted_by, @posted_on, @closing_date)
  `);
  const insertApplication = db.prepare(`
    INSERT INTO applications (id, job_id, applicant_name, applicant_email, phone, resume_text, cover_letter, status, applied_on)
    VALUES (@id, @job_id, @applicant_name, @applicant_email, @phone, @resume_text, @cover_letter, @status, @applied_on)
  `);
  const insertInterview = db.prepare(`
    INSERT INTO interviews (id, application_id, job_id, candidate_name, candidate_email, interviewer_id, scheduled_at, duration_minutes, mode, status, feedback, rating, notes)
    VALUES (@id, @application_id, @job_id, @candidate_name, @candidate_email, @interviewer_id, @scheduled_at, @duration_minutes, @mode, @status, @feedback, @rating, @notes)
  `);

  const interviewers = db.prepare("SELECT id FROM users WHERE role = 'employee' ORDER BY name").all();
  const jobs = [
    {
      title: 'Senior React Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'full-time',
      status: 'open',
      description: 'Own front-end architecture and mentor product engineers.',
      requirements: 'React, TypeScript, testing, design systems',
    },
    {
      title: 'People Operations Associate',
      department: 'Human Resources',
      location: 'Bengaluru',
      type: 'full-time',
      status: 'open',
      description: 'Support onboarding, policy documentation, and employee success.',
      requirements: 'HR ops, stakeholder management, documentation',
    },
    {
      title: 'Business Analyst',
      department: 'Operations',
      location: 'Mumbai',
      type: 'contract',
      status: 'paused',
      description: 'Track cross-functional process performance and reporting.',
      requirements: 'Analytics, SQL, operations reporting',
    },
  ];

  const statuses = ['applied', 'screening', 'interview', 'offer', 'rejected'];
  const jobIds = [];

  jobs.forEach((job, index) => {
    const postedOn = new Date();
    postedOn.setDate(postedOn.getDate() - (index + 7));
    const closingDate = new Date();
    closingDate.setDate(closingDate.getDate() + (20 - index * 3));
    const jobId = uuidv4();
    jobIds.push(jobId);

    insertJob.run({
      id: jobId,
      title: job.title,
      department: job.department,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      type: job.type,
      status: job.status,
      posted_by: adminId,
      posted_on: formatDateTime(postedOn),
      closing_date: formatDate(closingDate),
    });
  });

  jobIds.forEach((jobId, index) => {
    for (let i = 0; i < 3; i += 1) {
      const applicationId = uuidv4();
      const appliedOn = new Date();
      appliedOn.setDate(appliedOn.getDate() - (i + index + 1));
      const candidateName = ['Neha Verma', 'Kabir Singh', 'Ishita Das', 'Rahul Menon', 'Sana Khan'][index + i];
      const candidateEmail = candidateName.toLowerCase().replace(/\s+/g, '.') + '@mail.com';
      const status = statuses[(index + i) % statuses.length];

      insertApplication.run({
        id: applicationId,
        job_id: jobId,
        applicant_name: candidateName,
        applicant_email: candidateEmail,
        phone: `+91 98${index}${i}45${i}210`,
        resume_text: `${candidateName} resume summary`,
        cover_letter: `${candidateName} is excited about the opportunity.`,
        status,
        applied_on: formatDateTime(appliedOn),
      });

      if (status === 'interview' || status === 'offer') {
        const scheduledAt = new Date();
        scheduledAt.setDate(scheduledAt.getDate() + i + index + 1);
        scheduledAt.setHours(11 + i, 0, 0, 0);
        insertInterview.run({
          id: uuidv4(),
          application_id: applicationId,
          job_id: jobId,
          candidate_name: candidateName,
          candidate_email: candidateEmail,
          interviewer_id: interviewers[(index + i) % interviewers.length]?.id,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: 60,
          mode: i % 2 === 0 ? 'video' : 'in-person',
          status: status === 'offer' ? 'completed' : 'scheduled',
          feedback: status === 'offer' ? 'Strong communication and system design clarity.' : null,
          rating: status === 'offer' ? 4 : null,
          notes: status === 'offer' ? 'Recommended for final round.' : null,
        });
      }
    }
  });
}

function seedTickets() {
  const employees = db.prepare("SELECT id, name FROM users WHERE role = 'employee'").all();
  const insertTicket = db.prepare(`
    INSERT INTO support_tickets (id, user_id, subject, description, category, status, priority, created_at, resolved_at)
    VALUES (@id, @user_id, @subject, @description, @category, @status, @priority, @created_at, @resolved_at)
  `);

  const categories = ['payroll', 'hr-policy', 'it', 'general', 'general'];
  const statuses = ['open', 'in-progress', 'resolved', 'open', 'closed'];

  employees.forEach((employee, index) => {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - (index + 1));
    insertTicket.run({
      id: uuidv4(),
      user_id: employee.id,
      subject: `${employee.name.split(' ')[0]}'s support request`,
      description: `Support request from ${employee.name} related to ${categories[index]}.`,
      category: categories[index],
      status: statuses[index],
      priority: index % 2 === 0 ? 'medium' : 'high',
      created_at: formatDateTime(createdAt),
      resolved_at: statuses[index] === 'resolved' || statuses[index] === 'closed' ? formatDateTime(new Date()) : null,
    });
  });
}

function seedNotifications() {
  const employees = db.prepare("SELECT id, name FROM users WHERE role = 'employee'").all();

  employees.forEach((employee, index) => {
    createNotification(
      employee.id,
      'Task update',
      `Hi ${employee.name.split(' ')[0]}, you have a fresh task waiting in your queue.`,
      index % 2 === 0 ? 'info' : 'success'
    );
  });

  createAdminNotifications('Hiring update', 'New applications are waiting for review.', 'warning');
}

function runSeed() {
  db.exec(`
    DELETE FROM notifications;
    DELETE FROM chat_messages;
    DELETE FROM support_tickets;
    DELETE FROM interviews;
    DELETE FROM applications;
    DELETE FROM jobs;
    DELETE FROM tasks;
    DELETE FROM leaves;
    DELETE FROM attendance;
    DELETE FROM employees;
    DELETE FROM users;
  `);

  const adminId = seedUsers();
  seedAttendance();
  seedLeaves(adminId);
  seedTasks(adminId);
  seedJobsAndHiring(adminId);
  seedTickets();
  seedNotifications();
}

export function initializeDatabase(options = {}) {
  const { forceSeed = false } = options;
  db.exec(createTables);
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;

  if (forceSeed || userCount === 0) {
    runSeed();
  }
}

export function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { password, ...safeUser } = user;
  return safeUser;
}

export function findUserByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}

export function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

export function listEmployees(filters = {}) {
  const { search = '', department = '', status = '', role = '' } = filters;
  const query = `
    SELECT ${selectEmployeeFields}
    FROM users u
    LEFT JOIN employees e ON e.user_id = u.id
    WHERE 1 = 1
      AND (@search = '' OR u.name LIKE @searchLike OR u.email LIKE @searchLike OR e.employee_code LIKE @searchLike)
      AND (@department = '' OR u.department = @department)
      AND (@status = '' OR u.status = @status)
      AND (@role = '' OR u.role = @role)
    ORDER BY u.created_at DESC, u.name ASC
  `;

  return db
    .prepare(query)
    .all({
      search,
      searchLike: `%${search}%`,
      department,
      status,
      role,
    })
    .map(mapEmployeeRow);
}

export function getEmployeeById(id) {
  const row = db
    .prepare(
      `
        SELECT ${selectEmployeeFields}
        FROM users u
        LEFT JOIN employees e ON e.user_id = u.id
        WHERE u.id = ?
      `
    )
    .get(id);

  return row ? mapEmployeeRow(row) : null;
}

export function createEmployeeRecord(payload) {
  const userId = uuidv4();
  const employeeId = uuidv4();
  const password = payload.password || 'Employee@123';

  const transaction = db.transaction(() => {
    db.prepare(
      `
        INSERT INTO users (id, name, email, password, role, department, position, phone, avatar_url, joining_date, status)
        VALUES (?, ?, ?, ?, 'employee', ?, ?, ?, ?, ?, ?)
      `
    ).run(
      userId,
      payload.name,
      payload.email.toLowerCase().trim(),
      bcrypt.hashSync(password, 10),
      payload.department || '',
      payload.position || '',
      payload.phone || '',
      payload.avatar_url || '',
      payload.joining_date || formatDate(new Date()),
      payload.status || 'active'
    );

    db.prepare(
      `
        INSERT INTO employees (id, user_id, employee_code, salary, manager_id, location, skills, bio)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
    ).run(
      employeeId,
      userId,
      payload.employee_code || `EMP-${String(Date.now()).slice(-5)}`,
      Number(payload.salary || 0),
      payload.manager_id || getAdminId(),
      payload.location || '',
      JSON.stringify(payload.skills || []),
      payload.bio || ''
    );
  });

  transaction();
  createNotification(userId, 'Welcome to HRMS Pro', 'Your employee account is ready. Use Employee@123 to sign in.', 'success');
  return getEmployeeById(userId);
}

export function updateEmployeeRecord(id, payload) {
  const existing = getEmployeeById(id);
  if (!existing) {
    return null;
  }

  db.prepare(
    `
      UPDATE users
      SET name = ?, email = ?, department = ?, position = ?, phone = ?, avatar_url = ?, joining_date = ?, status = ?
      WHERE id = ?
    `
  ).run(
    payload.name ?? existing.name,
    (payload.email ?? existing.email).toLowerCase().trim(),
    payload.department ?? existing.department,
    payload.position ?? existing.position,
    payload.phone ?? existing.phone,
    payload.avatar_url ?? existing.avatar_url,
    payload.joining_date ?? existing.joining_date,
    payload.status ?? existing.status,
    id
  );

  db.prepare(
    `
      UPDATE employees
      SET employee_code = ?, salary = ?, manager_id = ?, location = ?, skills = ?, bio = ?
      WHERE user_id = ?
    `
  ).run(
    payload.employee_code ?? existing.employee_code,
    Number(payload.salary ?? existing.salary ?? 0),
    payload.manager_id ?? existing.manager_id,
    payload.location ?? existing.location,
    JSON.stringify(payload.skills ?? existing.skills ?? []),
    payload.bio ?? existing.bio,
    id
  );

  if (payload.password) {
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(payload.password, 10), id);
  }

  return getEmployeeById(id);
}

export function deleteEmployeeRecord(id) {
  const existing = getEmployeeById(id);
  if (!existing) {
    return false;
  }

  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM notifications WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM support_tickets WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM attendance WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM leaves WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM tasks WHERE assigned_to = ?').run(id);
    db.prepare('DELETE FROM interviews WHERE interviewer_id = ?').run(id);
    db.prepare('DELETE FROM employees WHERE user_id = ?').run(id);
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
  });

  transaction();
  return true;
}

export function getAdminDashboardSummary() {
  const totalEmployees = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'employee'").get().count;
  const openPositions = db.prepare("SELECT COUNT(*) AS count FROM jobs WHERE status = 'open'").get().count;
  const pendingLeaves = db.prepare("SELECT COUNT(*) AS count FROM leaves WHERE status = 'pending'").get().count;
  const today = formatDate(new Date());
  const tasksDueToday = db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE due_date = ? AND status != 'completed'").get(today).count;

  const headcountTrend = db
    .prepare(
      `
        WITH RECURSIVE months(offset, month_key) AS (
          SELECT 5, strftime('%Y-%m', date('now', 'start of month', '-5 months'))
          UNION ALL
          SELECT offset - 1, strftime('%Y-%m', date('now', 'start of month', printf('-%d months', offset - 1)))
          FROM months WHERE offset > 0
        )
        SELECT month_key AS month, (
          SELECT COUNT(*) FROM users u
          WHERE u.role = 'employee'
            AND date(u.joining_date) <= date(month_key || '-01', '+1 month', '-1 day')
        ) AS count
        FROM months
        ORDER BY month
      `
    )
    .all();

  const departmentAttendance = db
    .prepare(
      `
        SELECT u.department, ROUND(AVG(CASE WHEN a.status = 'present' THEN 100 WHEN a.status = 'half-day' THEN 50 ELSE 0 END), 1) AS attendance_rate
        FROM attendance a
        JOIN users u ON u.id = a.user_id
        WHERE a.date >= date('now', '-6 days')
        GROUP BY u.department
        ORDER BY attendance_rate DESC
      `
    )
    .all();

  const leaveDistribution = db
    .prepare(
      `
        SELECT leave_type AS name, COUNT(*) AS value
        FROM leaves
        GROUP BY leave_type
      `
    )
    .all();

  const recentActivity = [
    ...db
      .prepare(
        `
          SELECT 'leave' AS type, u.name AS actor, l.reason AS title, l.applied_on AS created_at
          FROM leaves l
          JOIN users u ON u.id = l.user_id
          ORDER BY l.applied_on DESC
          LIMIT 4
        `
      )
      .all(),
    ...db
      .prepare(
        `
          SELECT 'task' AS type, ua.name AS actor, t.title AS title, t.created_at AS created_at
          FROM tasks t
          LEFT JOIN users ua ON ua.id = t.assigned_to
          ORDER BY t.created_at DESC
          LIMIT 4
        `
      )
      .all(),
    ...db
      .prepare(
        `
          SELECT 'ticket' AS type, u.name AS actor, s.subject AS title, s.created_at AS created_at
          FROM support_tickets s
          JOIN users u ON u.id = s.user_id
          ORDER BY s.created_at DESC
          LIMIT 4
        `
      )
      .all(),
  ]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  const upcomingInterviews = db
    .prepare(
      `
        SELECT i.id, i.candidate_name, i.candidate_email, i.scheduled_at, i.mode, i.status, j.title AS job_title, u.name AS interviewer_name
        FROM interviews i
        LEFT JOIN jobs j ON j.id = i.job_id
        LEFT JOIN users u ON u.id = i.interviewer_id
        WHERE datetime(i.scheduled_at) >= datetime('now')
        ORDER BY i.scheduled_at ASC
        LIMIT 5
      `
    )
    .all();

  return {
    kpis: {
      totalEmployees,
      openPositions,
      pendingLeaves,
      tasksDueToday,
    },
    headcountTrend,
    departmentAttendance,
    leaveDistribution,
    recentActivity,
    upcomingInterviews,
  };
}

export function listAttendance(filters = {}) {
  const { employeeId = '', month = '' } = filters;
  return db
    .prepare(
      `
        SELECT a.*, u.name, u.department
        FROM attendance a
        JOIN users u ON u.id = a.user_id
        WHERE (@employeeId = '' OR a.user_id = @employeeId)
          AND (@month = '' OR strftime('%Y-%m', a.date) = @month)
        ORDER BY a.date DESC, u.name ASC
      `
    )
    .all({ employeeId, month });
}

export function getAttendanceSummary() {
  const today = formatDate(new Date());
  const base = db.prepare('SELECT COUNT(*) AS count FROM attendance WHERE date = ? AND status = ?');
  return {
    presentToday: base.get(today, 'present').count,
    absentToday: base.get(today, 'absent').count,
    onLeave: base.get(today, 'leave').count,
    halfDay: base.get(today, 'half-day').count,
  };
}

export function upsertAttendanceRecord(payload) {
  const existing = db.prepare('SELECT id FROM attendance WHERE user_id = ? AND date = ?').get(payload.user_id, payload.date);
  const hoursWorked =
    payload.status === 'present' ? Number(payload.hours_worked || 8.5) : payload.status === 'half-day' ? Number(payload.hours_worked || 4) : 0;

  if (existing) {
    db.prepare(
      `
        UPDATE attendance
        SET check_in = ?, check_out = ?, status = ?, hours_worked = ?
        WHERE id = ?
      `
    ).run(payload.check_in || null, payload.check_out || null, payload.status, hoursWorked, existing.id);
  } else {
    db.prepare(
      `
        INSERT INTO attendance (id, user_id, date, check_in, check_out, status, hours_worked)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    ).run(uuidv4(), payload.user_id, payload.date, payload.check_in || null, payload.check_out || null, payload.status, hoursWorked);
  }

  return db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(payload.user_id, payload.date);
}

export function listLeaves(filters = {}) {
  const { status = '' } = filters;
  const leaves = db
    .prepare(
      `
        SELECT l.*, u.name, u.department
        FROM leaves l
        JOIN users u ON u.id = l.user_id
        WHERE (@status = '' OR l.status = @status)
        ORDER BY l.applied_on DESC
      `
    )
    .all({ status });

  const balances = db
    .prepare(
      `
        SELECT u.id AS user_id, u.name,
          SUM(CASE WHEN l.leave_type = 'sick' AND l.status = 'approved' THEN l.total_days ELSE 0 END) AS sick_used,
          SUM(CASE WHEN l.leave_type = 'casual' AND l.status = 'approved' THEN l.total_days ELSE 0 END) AS casual_used,
          SUM(CASE WHEN l.leave_type = 'earned' AND l.status = 'approved' THEN l.total_days ELSE 0 END) AS earned_used
        FROM users u
        LEFT JOIN leaves l ON l.user_id = u.id
        WHERE u.role = 'employee'
        GROUP BY u.id, u.name
        ORDER BY u.name ASC
      `
    )
    .all()
    .map((row) => ({
      user_id: row.user_id,
      name: row.name,
      sick: 12 - Number(row.sick_used || 0),
      casual: 12 - Number(row.casual_used || 0),
      earned: 15 - Number(row.earned_used || 0),
    }));

  return { leaves, balances };
}

export function updateLeaveStatus(id, status, approvedBy) {
  const leave = db.prepare('SELECT * FROM leaves WHERE id = ?').get(id);
  if (!leave) {
    return null;
  }

  db.prepare('UPDATE leaves SET status = ?, approved_by = ? WHERE id = ?').run(status, approvedBy || null, id);
  const updated = db
    .prepare(
      `
        SELECT l.*, u.name, u.department
        FROM leaves l
        JOIN users u ON u.id = l.user_id
        WHERE l.id = ?
      `
    )
    .get(id);

  createNotification(
    leave.user_id,
    `Leave ${status}`,
    `Your ${leave.leave_type} leave request from ${leave.from_date} to ${leave.to_date} was ${status}.`,
    status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info'
  );

  return updated;
}

export function listTasks(filters = {}) {
  const { employee = '', priority = '', status = '' } = filters;
  return db
    .prepare(
      `
        SELECT t.*, assignee.name AS assigned_to_name, assignee.department AS assigned_to_department, assigner.name AS assigned_by_name
        FROM tasks t
        LEFT JOIN users assignee ON assignee.id = t.assigned_to
        LEFT JOIN users assigner ON assigner.id = t.assigned_by
        WHERE (@employee = '' OR t.assigned_to = @employee)
          AND (@priority = '' OR t.priority = @priority)
          AND (@status = '' OR t.status = @status)
        ORDER BY
          CASE t.status
            WHEN 'overdue' THEN 0
            WHEN 'todo' THEN 1
            WHEN 'in-progress' THEN 2
            ELSE 3
          END,
          t.due_date ASC
      `
    )
    .all({ employee, priority, status });
}

export function createTaskRecord(payload, assignedBy) {
  const id = uuidv4();
  db.prepare(
    `
      INSERT INTO tasks (id, title, description, assigned_to, assigned_by, priority, status, due_date, created_at, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    payload.title,
    payload.description || '',
    payload.assigned_to || null,
    assignedBy || null,
    payload.priority || 'medium',
    payload.status || 'todo',
    payload.due_date || null,
    formatDateTime(new Date()),
    payload.status === 'completed' ? formatDateTime(new Date()) : null
  );

  if (payload.assigned_to) {
    createNotification(payload.assigned_to, 'New task assigned', `You have been assigned: ${payload.title}`, 'info');
  }

  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

export function updateTaskRecord(id, payload) {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  if (!existing) {
    return null;
  }

  const status = payload.status ?? existing.status;
  const completedAt = status === 'completed' ? existing.completed_at || formatDateTime(new Date()) : null;

  db.prepare(
    `
      UPDATE tasks
      SET title = ?, description = ?, assigned_to = ?, priority = ?, status = ?, due_date = ?, completed_at = ?
      WHERE id = ?
    `
  ).run(
    payload.title ?? existing.title,
    payload.description ?? existing.description,
    payload.assigned_to ?? existing.assigned_to,
    payload.priority ?? existing.priority,
    status,
    payload.due_date ?? existing.due_date,
    completedAt,
    id
  );

  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

export function updateOwnTaskRecord(userId, id, payload) {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND assigned_to = ?').get(id, userId);
  if (!existing) {
    return null;
  }

  return updateTaskRecord(id, payload);
}

export function deleteTaskRecord(id) {
  return db.prepare('DELETE FROM tasks WHERE id = ?').run(id).changes > 0;
}

export function listJobs() {
  return db
    .prepare(
      `
        SELECT j.*, poster.name AS posted_by_name,
          COUNT(a.id) AS applicant_count
        FROM jobs j
        LEFT JOIN users poster ON poster.id = j.posted_by
        LEFT JOIN applications a ON a.job_id = j.id
        GROUP BY j.id
        ORDER BY j.posted_on DESC
      `
    )
    .all();
}

export function createJobRecord(payload, postedBy) {
  const id = uuidv4();
  db.prepare(
    `
      INSERT INTO jobs (id, title, department, description, requirements, location, type, status, posted_by, posted_on, closing_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    payload.title,
    payload.department || '',
    payload.description || '',
    payload.requirements || '',
    payload.location || '',
    payload.type || 'full-time',
    payload.status || 'open',
    postedBy,
    formatDateTime(new Date()),
    payload.closing_date || null
  );
  return db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
}

export function updateJobRecord(id, payload) {
  const existing = db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
  if (!existing) {
    return null;
  }

  db.prepare(
    `
      UPDATE jobs
      SET title = ?, department = ?, description = ?, requirements = ?, location = ?, type = ?, status = ?, closing_date = ?
      WHERE id = ?
    `
  ).run(
    payload.title ?? existing.title,
    payload.department ?? existing.department,
    payload.description ?? existing.description,
    payload.requirements ?? existing.requirements,
    payload.location ?? existing.location,
    payload.type ?? existing.type,
    payload.status ?? existing.status,
    payload.closing_date ?? existing.closing_date,
    id
  );

  return db.prepare('SELECT * FROM jobs WHERE id = ?').get(id);
}

export function listApplicationsByJob(jobId) {
  return db
    .prepare(
      `
        SELECT a.*, j.title AS job_title
        FROM applications a
        JOIN jobs j ON j.id = a.job_id
        WHERE a.job_id = ?
        ORDER BY a.applied_on DESC
      `
    )
    .all(jobId);
}

export function createApplicationRecord(payload) {
  const id = uuidv4();
  db.prepare(
    `
      INSERT INTO applications (id, job_id, applicant_name, applicant_email, phone, resume_text, cover_letter, status, applied_on)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    payload.job_id,
    payload.applicant_name,
    payload.applicant_email,
    payload.phone || '',
    payload.resume_text || '',
    payload.cover_letter || '',
    payload.status || 'applied',
    formatDateTime(new Date())
  );

  createAdminNotifications('New job application', `${payload.applicant_name} applied for a role.`, 'info');
  return db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
}

export function updateApplicationRecord(id, payload) {
  const existing = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
  if (!existing) {
    return null;
  }

  db.prepare(
    `
      UPDATE applications
      SET applicant_name = ?, applicant_email = ?, phone = ?, resume_text = ?, cover_letter = ?, status = ?
      WHERE id = ?
    `
  ).run(
    payload.applicant_name ?? existing.applicant_name,
    payload.applicant_email ?? existing.applicant_email,
    payload.phone ?? existing.phone,
    payload.resume_text ?? existing.resume_text,
    payload.cover_letter ?? existing.cover_letter,
    payload.status ?? existing.status,
    id
  );

  return db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
}

export function listInterviews() {
  return db
    .prepare(
      `
        SELECT i.*, j.title AS job_title, u.name AS interviewer_name
        FROM interviews i
        LEFT JOIN jobs j ON j.id = i.job_id
        LEFT JOIN users u ON u.id = i.interviewer_id
        ORDER BY i.scheduled_at DESC
      `
    )
    .all();
}

export function createInterviewRecord(payload) {
  const id = uuidv4();
  db.prepare(
    `
      INSERT INTO interviews (id, application_id, job_id, candidate_name, candidate_email, interviewer_id, scheduled_at, duration_minutes, mode, status, feedback, rating, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
  ).run(
    id,
    payload.application_id || null,
    payload.job_id || null,
    payload.candidate_name,
    payload.candidate_email,
    payload.interviewer_id || null,
    payload.scheduled_at,
    Number(payload.duration_minutes || 60),
    payload.mode || 'video',
    payload.status || 'scheduled',
    payload.feedback || null,
    payload.rating || null,
    payload.notes || null
  );

  if (payload.interviewer_id) {
    createNotification(payload.interviewer_id, 'Interview scheduled', `You have an interview with ${payload.candidate_name}.`, 'info');
  }

  return db.prepare('SELECT * FROM interviews WHERE id = ?').get(id);
}

export function updateInterviewRecord(id, payload) {
  const existing = db.prepare('SELECT * FROM interviews WHERE id = ?').get(id);
  if (!existing) {
    return null;
  }

  db.prepare(
    `
      UPDATE interviews
      SET application_id = ?, job_id = ?, candidate_name = ?, candidate_email = ?, interviewer_id = ?, scheduled_at = ?, duration_minutes = ?, mode = ?, status = ?, feedback = ?, rating = ?, notes = ?
      WHERE id = ?
    `
  ).run(
    payload.application_id ?? existing.application_id,
    payload.job_id ?? existing.job_id,
    payload.candidate_name ?? existing.candidate_name,
    payload.candidate_email ?? existing.candidate_email,
    payload.interviewer_id ?? existing.interviewer_id,
    payload.scheduled_at ?? existing.scheduled_at,
    Number(payload.duration_minutes ?? existing.duration_minutes),
    payload.mode ?? existing.mode,
    payload.status ?? existing.status,
    payload.feedback ?? existing.feedback,
    payload.rating ?? existing.rating,
    payload.notes ?? existing.notes,
    id
  );

  return db.prepare('SELECT * FROM interviews WHERE id = ?').get(id);
}

export function listTickets() {
  return db
    .prepare(
      `
        SELECT s.*, u.name, u.department
        FROM support_tickets s
        JOIN users u ON u.id = s.user_id
        ORDER BY s.created_at DESC
      `
    )
    .all();
}

export function updateTicketRecord(id, payload) {
  const existing = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
  if (!existing) {
    return null;
  }

  const status = payload.status ?? existing.status;
  const resolvedAt = status === 'resolved' || status === 'closed' ? formatDateTime(new Date()) : null;

  db.prepare(
    `
      UPDATE support_tickets
      SET subject = ?, description = ?, category = ?, status = ?, priority = ?, resolved_at = ?
      WHERE id = ?
    `
  ).run(
    payload.subject ?? existing.subject,
    payload.description ?? existing.description,
    payload.category ?? existing.category,
    status,
    payload.priority ?? existing.priority,
    resolvedAt,
    id
  );

  if (status !== existing.status) {
    createNotification(existing.user_id, 'Ticket update', `Your support ticket "${existing.subject}" is now ${status}.`, 'info');
  }

  return db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
}

export function getAnalyticsSummary() {
  const hiringFunnel = db
    .prepare(
      `
        SELECT status AS name, COUNT(*) AS value
        FROM applications
        GROUP BY status
      `
    )
    .all();

  const monthlyLeaves = db
    .prepare(
      `
        SELECT strftime('%Y-%m', from_date) AS month, COUNT(*) AS total
        FROM leaves
        GROUP BY strftime('%Y-%m', from_date)
        ORDER BY month DESC
        LIMIT 6
      `
    )
    .all()
    .reverse();

  const taskCompletion = db.prepare("SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed FROM tasks").get();
  const topPerformers = db
    .prepare(
      `
        SELECT u.name, COUNT(*) AS completed_tasks
        FROM tasks t
        JOIN users u ON u.id = t.assigned_to
        WHERE t.status = 'completed'
        GROUP BY u.id, u.name
        ORDER BY completed_tasks DESC
        LIMIT 5
      `
    )
    .all();

  const departmentProductivity = db
    .prepare(
      `
        SELECT u.department AS name,
          SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed,
          COUNT(*) AS total
        FROM tasks t
        JOIN users u ON u.id = t.assigned_to
        GROUP BY u.department
      `
    )
    .all()
    .map((row) => ({
      name: row.name,
      productivity: row.total ? Math.round((row.completed / row.total) * 100) : 0,
    }));

  return {
    hiringFunnel,
    monthlyLeaves,
    taskCompletionRate: taskCompletion.total ? Math.round((Number(taskCompletion.completed || 0) / taskCompletion.total) * 100) : 0,
    topPerformers,
    departmentProductivity,
  };
}

export function getEmployeeDashboard(userId) {
  const tasksDue = db.prepare("SELECT COUNT(*) AS count FROM tasks WHERE assigned_to = ? AND status != 'completed'").get(userId).count;
  const openTickets = db
    .prepare("SELECT COUNT(*) AS count FROM support_tickets WHERE user_id = ? AND status NOT IN ('resolved', 'closed')")
    .get(userId).count;
  const attendanceStats = db
    .prepare(
      `
        SELECT
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
          COUNT(*) AS total_days
        FROM attendance
        WHERE user_id = ?
      `
    )
    .get(userId);
  const attendancePercentage = attendanceStats.total_days
    ? Math.round((Number(attendanceStats.present_days || 0) / attendanceStats.total_days) * 100)
    : 0;

  const leaveUsage = db
    .prepare(
      `
        SELECT
          SUM(CASE WHEN leave_type = 'sick' AND status = 'approved' THEN total_days ELSE 0 END) AS sick_used,
          SUM(CASE WHEN leave_type = 'casual' AND status = 'approved' THEN total_days ELSE 0 END) AS casual_used,
          SUM(CASE WHEN leave_type = 'earned' AND status = 'approved' THEN total_days ELSE 0 END) AS earned_used
        FROM leaves
        WHERE user_id = ?
      `
    )
    .get(userId);

  const tasks = db
    .prepare(
      `
        SELECT *
        FROM tasks
        WHERE assigned_to = ?
        ORDER BY due_date ASC
        LIMIT 5
      `
    )
    .all(userId);

  const attendanceWeek = db
    .prepare(
      `
        SELECT date, status, check_in, check_out
        FROM attendance
        WHERE user_id = ? AND date >= date('now', '-6 days')
        ORDER BY date ASC
      `
    )
    .all(userId);

  const notifications = db
    .prepare(
      `
        SELECT *
        FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 5
      `
    )
    .all(userId);

  return {
    stats: {
      tasksDue,
      leaveBalance: {
        sick: 12 - Number(leaveUsage.sick_used || 0),
        casual: 12 - Number(leaveUsage.casual_used || 0),
        earned: 15 - Number(leaveUsage.earned_used || 0),
      },
      attendancePercentage,
      openTickets,
    },
    tasks,
    attendanceWeek,
    notifications,
  };
}

export function listEmployeeTasks(userId, filters = {}) {
  const { status = '', priority = '' } = filters;
  return db
    .prepare(
      `
        SELECT *
        FROM tasks
        WHERE assigned_to = ?
          AND (? = '' OR status = ?)
          AND (? = '' OR priority = ?)
        ORDER BY due_date ASC
      `
    )
    .all(userId, status, status, priority, priority);
}

export function listEmployeeAttendance(userId) {
  const records = db
    .prepare(
      `
        SELECT *
        FROM attendance
        WHERE user_id = ?
        ORDER BY date DESC
      `
    )
    .all(userId);

  const summary = db
    .prepare(
      `
        SELECT
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_days,
          SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) AS leave_days,
          COUNT(*) AS total_days
        FROM attendance
        WHERE user_id = ?
      `
    )
    .get(userId);

  return {
    records,
    summary: {
      present: Number(summary.present_days || 0),
      absent: Number(summary.absent_days || 0),
      leave: Number(summary.leave_days || 0),
      percentage: summary.total_days ? Math.round((Number(summary.present_days || 0) / summary.total_days) * 100) : 0,
    },
  };
}

export function checkInEmployee(userId) {
  const today = formatDate(new Date());
  const now = formatDateTime(new Date());
  upsertAttendanceRecord({
    user_id: userId,
    date: today,
    check_in: now,
    status: 'present',
    hours_worked: 0,
  });

  return db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(userId, today);
}

export function checkOutEmployee(userId) {
  const today = formatDate(new Date());
  const existing = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(userId, today);
  const now = formatDateTime(new Date());

  if (!existing) {
    return checkInEmployee(userId);
  }

  let hoursWorked = existing.hours_worked || 0;
  if (existing.check_in) {
    const diff = new Date(now) - new Date(existing.check_in.replace(' ', 'T'));
    hoursWorked = Math.max(0, Math.round((diff / 36e5) * 10) / 10);
  }

  db.prepare('UPDATE attendance SET check_out = ?, hours_worked = ? WHERE id = ?').run(now, hoursWorked, existing.id);
  return db.prepare('SELECT * FROM attendance WHERE id = ?').get(existing.id);
}

export function listEmployeeLeaves(userId) {
  const leaves = db.prepare('SELECT * FROM leaves WHERE user_id = ? ORDER BY applied_on DESC').all(userId);
  const dashboard = getEmployeeDashboard(userId);
  return {
    balances: dashboard.stats.leaveBalance,
    leaves,
  };
}

export function createEmployeeLeave(userId, payload) {
  const id = uuidv4();
  const start = new Date(payload.from_date);
  const end = new Date(payload.to_date);
  const totalDays = Math.max(1, Math.round((end - start) / 86400000) + 1);

  db.prepare(
    `
      INSERT INTO leaves (id, user_id, leave_type, from_date, to_date, reason, status, approved_by, applied_on, total_days)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NULL, ?, ?)
    `
  ).run(id, userId, payload.leave_type, payload.from_date, payload.to_date, payload.reason || '', formatDateTime(new Date()), totalDays);

  createAdminNotifications('Leave request submitted', 'A new leave request is pending review.', 'warning');
  return db.prepare('SELECT * FROM leaves WHERE id = ?').get(id);
}

export function getEmployeeSalary(userId, month) {
  const employee = getEmployeeById(userId);
  const basic = Math.round(Number(employee?.salary || 0) * 0.5);
  const hra = Math.round(Number(employee?.salary || 0) * 0.2);
  const allowances = Math.round(Number(employee?.salary || 0) * 0.15);
  const deductions = Math.round(Number(employee?.salary || 0) * 0.08);
  const netPay = basic + hra + allowances - deductions;

  return {
    month: month || new Date().toISOString().slice(0, 7),
    basic,
    hra,
    allowances,
    deductions,
    netPay,
    ctc: Number(employee?.salary || 0),
  };
}

export function getEmployeeProfile(userId) {
  return getEmployeeById(userId);
}

export function updateEmployeeProfile(userId, payload) {
  const existing = getEmployeeById(userId);
  if (!existing) {
    return null;
  }

  db.prepare(
    `
      UPDATE users
      SET phone = ?, avatar_url = ?
      WHERE id = ?
    `
  ).run(payload.phone ?? existing.phone, payload.avatar_url ?? existing.avatar_url, userId);

  db.prepare(
    `
      UPDATE employees
      SET bio = ?, skills = ?, location = ?
      WHERE user_id = ?
    `
  ).run(payload.bio ?? existing.bio, JSON.stringify(payload.skills ?? existing.skills ?? []), payload.location ?? existing.location, userId);

  if (payload.new_password) {
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(bcrypt.hashSync(payload.new_password, 10), userId);
  }

  return getEmployeeById(userId);
}

export function listEmployeeTickets(userId) {
  return db.prepare('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC').all(userId);
}

export function createEmployeeTicket(userId, payload) {
  const id = uuidv4();
  db.prepare(
    `
      INSERT INTO support_tickets (id, user_id, subject, description, category, status, priority, created_at, resolved_at)
      VALUES (?, ?, ?, ?, ?, 'open', ?, ?, NULL)
    `
  ).run(id, userId, payload.subject, payload.description || '', payload.category || 'general', payload.priority || 'medium', formatDateTime(new Date()));

  createAdminNotifications('New support ticket', `A new ${payload.category || 'general'} ticket is waiting for review.`, 'info');
  return db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
}

export function listNotificationsForUser(user) {
  if (user.role === 'admin') {
    return db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 25').all();
  }

  return db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 25').all(user.id);
}

export function markNotificationAsRead(notificationId, user) {
  const notification = db.prepare('SELECT * FROM notifications WHERE id = ?').get(notificationId);
  if (!notification) {
    return null;
  }

  if (user.role !== 'admin' && notification.user_id !== user.id) {
    return null;
  }

  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ?').run(notificationId);
  return db.prepare('SELECT * FROM notifications WHERE id = ?').get(notificationId);
}

export function markAllNotificationsAsRead(user) {
  if (user.role === 'admin') {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE is_read = 0').run();
  } else {
    db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0').run(user.id);
  }

  return listNotificationsForUser(user);
}

export function getLeaveBalanceSummary(userId) {
  const usage = db
    .prepare(
      `
        SELECT
          SUM(CASE WHEN leave_type = 'sick' AND status = 'approved' THEN total_days ELSE 0 END) AS sick_used,
          SUM(CASE WHEN leave_type = 'casual' AND status = 'approved' THEN total_days ELSE 0 END) AS casual_used,
          SUM(CASE WHEN leave_type = 'earned' AND status = 'approved' THEN total_days ELSE 0 END) AS earned_used,
          SUM(CASE WHEN leave_type = 'unpaid' AND status = 'approved' THEN total_days ELSE 0 END) AS unpaid_used
        FROM leaves
        WHERE user_id = ?
      `
    )
    .get(userId);

  return {
    sick: 12 - Number(usage.sick_used || 0),
    casual: 12 - Number(usage.casual_used || 0),
    earned: 15 - Number(usage.earned_used || 0),
    unpaid_used: Number(usage.unpaid_used || 0),
  };
}

export function getAttendanceSummaryForUser(userId) {
  const summary = db
    .prepare(
      `
        SELECT
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) AS present_days,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) AS absent_days,
          SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) AS leave_days,
          SUM(CASE WHEN status = 'half-day' THEN 1 ELSE 0 END) AS half_days,
          AVG(COALESCE(hours_worked, 0)) AS average_hours
        FROM attendance
        WHERE user_id = ?
      `
    )
    .get(userId);

  return {
    present_days: Number(summary.present_days || 0),
    absent_days: Number(summary.absent_days || 0),
    leave_days: Number(summary.leave_days || 0),
    half_days: Number(summary.half_days || 0),
    average_hours: Math.round(Number(summary.average_hours || 0) * 10) / 10,
  };
}

export function getChatHistory(sessionId, userId, limit = 20) {
  return db
    .prepare(
      `
        SELECT id, user_id, role, content, session_id, created_at
        FROM chat_messages
        WHERE session_id = ? AND user_id = ?
        ORDER BY created_at DESC, id DESC
        LIMIT ?
      `
    )
    .all(sessionId, userId, limit)
    .reverse();
}

export function listEmployeeInterviewPrep(userId) {
  return db
    .prepare(
      `
        SELECT i.id, i.scheduled_at, i.mode, i.status, j.title AS job_title, j.department
        FROM interviews i
        LEFT JOIN jobs j ON j.id = i.job_id
        WHERE i.interviewer_id = ?
          AND datetime(i.scheduled_at) >= datetime('now')
        ORDER BY i.scheduled_at ASC
      `
    )
    .all(userId);
}

export function storeChatMessage({ userId, role, content, sessionId }) {
  const message = {
    id: uuidv4(),
    user_id: userId,
    role,
    content,
    session_id: sessionId,
    created_at: formatDateTime(new Date()),
  };

  db.prepare(
    `
      INSERT INTO chat_messages (id, user_id, role, content, session_id, created_at)
      VALUES (@id, @user_id, @role, @content, @session_id, @created_at)
    `
  ).run(message);

  return message;
}

export { db };

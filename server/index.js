import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db/queries.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import employeeRoutes from './routes/employee.js';
import notificationRoutes from './routes/notifications.js';
import chatbotRoutes from './routes/chatbot.js';

const app = express();
const port = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../client/dist');
app.use(cors());
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

initializeDatabase();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'HRMS Pro server is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employee', employeeRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chatbot', chatbotRoutes);

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }

    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

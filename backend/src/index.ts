import express, { Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';
import crudRoutes from './routes/crud';
import analyticsRoutes from './routes/analytics';
import procedureRoutes from './routes/procedures';
import feesRoutes from './routes/fees';
import { authenticateToken } from './middleware/auth';
import { AuthenticatedRequest } from './types';

dotenv.config();

// Fix for Prisma BigInt serialization in res.json()
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for dev/testing ease
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/crud', crudRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/procedures', procedureRoutes);
app.use('/api/fees', feesRoutes);

// Meta & Helper endpoints
// GET /api/departments (Quick list for dropdowns)
app.get('/api/departments', async (req, res) => {
  try {
    const depts = await prisma.department.findMany({ orderBy: { code: 'asc' } });
    return res.json(depts);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/companies (Quick list for dropdowns)
app.get('/api/companies', async (req, res) => {
  try {
    const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });
    return res.json(companies);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/notifications (User specific notifications)
app.get('/api/notifications', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
    return res.json(notifications);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifications/:id/read (Mark single notification as read)
app.put('/api/notifications/:id/read', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notif = await prisma.notification.update({
      where: { id: req.params.id, userId: req.user!.userId },
      data: { isRead: true }
    });
    return res.json(notif);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/activity-logs (Recent audit logs for Admin)
app.get('/api/activity-logs', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = await prisma.activityLog.findMany({
      include: {
        user: { select: { email: true, firstName: true, lastName: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    return res.json(logs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  return res.json({ status: 'healthy', timestamp: new Date() });
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` CampusConnect Backend Server is live on Port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(`===================================================`);
});

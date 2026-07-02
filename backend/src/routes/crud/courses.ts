import { Router, Response } from 'express';
import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

const prisma = new PrismaClient();

// Ensure all routes in this router are authenticated
router.use(authenticateToken);



// GET all courses
router.get('/courses', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search as string || '';
    const departmentId = req.query.departmentId as string || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100; // default large to list for forms
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { code: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } }
      ]
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    const total = await prisma.course.count({ where });
    const courses = await prisma.course.findMany({
      where,
      include: { department: true },
      skip,
      take: limit,
      orderBy: { code: 'asc' }
    });

    return res.json({ total, page, limit, courses });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET single course
router.get('/courses/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        department: true,
        courseAssignments: { include: { faculty: { include: { user: true } } } }
      }
    });
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    return res.json(course);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE course
router.post('/courses', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { code, title, credits, departmentId } = req.body;
  if (!code || !title || !credits || !departmentId) {
    return res.status(400).json({ error: 'Missing required course fields.' });
  }

  try {
    const course = await prisma.course.create({
      data: {
        code,
        title,
        credits: parseInt(credits),
        departmentId
      },
      include: { department: true }
    });
    return res.status(201).json(course);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE course
router.put('/courses/:id', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { code, title, credits, departmentId } = req.body;
  try {
    const updated = await prisma.course.update({
      where: { id: req.params.id },
      data: {
        code: code || undefined,
        title: title || undefined,
        credits: credits ? parseInt(credits) : undefined,
        departmentId: departmentId || undefined
      },
      include: { department: true }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE course
router.delete('/courses/:id', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Course deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

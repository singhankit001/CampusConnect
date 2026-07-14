import { Router, Response } from 'express';
import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../../types';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router = Router();

const prisma = new PrismaClient();

// Ensure all routes in this router are authenticated
router.use(authenticateToken);



// GET all assignments
router.get('/assignments', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const courseId = req.query.courseId as string || '';
    const where: any = {};
    if (courseId) {
      where.courseId = courseId;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: { course: true },
      orderBy: { dueDate: 'asc' }
    });
    return res.json(assignments);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET single assignment
router.get('/assignments/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const asg = await prisma.assignment.findUnique({
      where: { id: req.params.id },
      include: { course: true, submissions: { include: { student: { include: { user: true } } } } }
    });
    if (!asg) return res.status(404).json({ error: 'Assignment not found.' });
    return res.json(asg);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE assignment
router.post('/assignments', requireRole([UserRole.FACULTY, UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, title, description, maxMarks, dueDate } = req.body;
  if (!courseId || !title || !description || !maxMarks || !dueDate) {
    return res.status(400).json({ error: 'Missing required assignment fields.' });
  }

  try {
    const assignment = await prisma.assignment.create({
      data: {
        courseId,
        title,
        description,
        maxMarks: parseInt(maxMarks),
        dueDate: new Date(dueDate)
      },
      include: { course: true }
    });
    return res.status(201).json(assignment);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE assignment
router.put('/assignments/:id', requireRole([UserRole.FACULTY, UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, maxMarks, dueDate } = req.body;
  try {
    const updated = await prisma.assignment.update({
      where: { id: req.params.id },
      data: {
        title: title || undefined,
        description: description || undefined,
        maxMarks: maxMarks ? parseInt(maxMarks) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined
      },
      include: { course: true }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE assignment
router.delete('/assignments/:id', requireRole([UserRole.FACULTY, UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.assignment.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Assignment deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

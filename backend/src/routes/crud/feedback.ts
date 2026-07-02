import { Router, Response } from 'express';
import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

const prisma = new PrismaClient();

// Ensure all routes in this router are authenticated
router.use(authenticateToken);



// GET all feedbacks
router.get('/feedback', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: { user: { select: { firstName: true, lastName: true, role: true, email: true } } },
      orderBy: { submissionDate: 'desc' }
    });
    return res.json(feedbacks);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET single feedback
router.get('/feedback/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const feed = await prisma.feedback.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    if (!feed) return res.status(404).json({ error: 'Feedback not found.' });
    return res.json(feed);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE feedback
router.post('/feedback', async (req: AuthenticatedRequest, res: Response) => {
  const { category, rating, comments } = req.body;
  if (!category || rating === undefined || !comments) {
    return res.status(400).json({ error: 'Category, rating, and comments are required.' });
  }

  try {
    const feedback = await prisma.feedback.create({
      data: {
        userId: req.user!.userId,
        category: category as FeedbackCategory,
        rating: parseInt(rating),
        comments
      }
    });
    return res.status(201).json(feedback);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE feedback
router.put('/feedback/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { category, rating, comments } = req.body;
  try {
    const updated = await prisma.feedback.update({
      where: { id: req.params.id },
      data: {
        category: category ? (category as FeedbackCategory) : undefined,
        rating: rating ? parseInt(rating) : undefined,
        comments: comments || undefined
      }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE feedback
router.delete('/feedback/:id', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.feedback.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Feedback record deleted.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

export default router;

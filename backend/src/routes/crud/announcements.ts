import { Router, Response } from 'express';
import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../../types';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router = Router();

const prisma = new PrismaClient();

// Ensure all routes in this router are authenticated
router.use(authenticateToken);



// GET all announcements
router.get('/announcements', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const target = req.query.target as string || '';
    const departmentId = req.query.departmentId as string || '';
    const where: any = {};

    if (target) {
      where.type = target as AnnouncementTarget;
    }
    if (departmentId) {
      where.departmentId = departmentId;
    }

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        creator: { select: { firstName: true, lastName: true } },
        department: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(announcements);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET single announcement
router.get('/announcements/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ann = await prisma.announcement.findUnique({
      where: { id: req.params.id },
      include: { creator: true, department: true }
    });
    if (!ann) return res.status(404).json({ error: 'Announcement not found.' });
    return res.json(ann);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE announcement
router.post('/announcements', requireRole([UserRole.FACULTY, UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, type, departmentId } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required.' });
  }

  try {
    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        type: type ? (type as AnnouncementTarget) : AnnouncementTarget.ALL,
        departmentId: departmentId || null,
        creatorId: req.user!.userId
      }
    });
    return res.status(201).json(announcement);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE announcement
router.put('/announcements/:id', requireRole([UserRole.FACULTY, UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, type, departmentId } = req.body;
  try {
    const updated = await prisma.announcement.update({
      where: { id: req.params.id },
      data: {
        title: title || undefined,
        content: content || undefined,
        type: type ? (type as AnnouncementTarget) : undefined,
        departmentId: departmentId !== undefined ? departmentId : undefined
      }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE announcement
router.delete('/announcements/:id', requireRole([UserRole.FACULTY, UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Announcement deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

import { Router, Response } from 'express';
import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

const prisma = new PrismaClient();

// Ensure all routes in this router are authenticated
router.use(authenticateToken);



// GET all clubs
router.get('/clubs', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clubs = await prisma.club.findMany({
      include: { president: { include: { user: true } } },
      orderBy: { name: 'asc' }
    });
    return res.json(clubs);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET single club
router.get('/clubs/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const club = await prisma.club.findUnique({
      where: { id: req.params.id },
      include: {
        president: { include: { user: true } },
        members: { include: { student: { include: { user: true } } } },
        events: true
      }
    });
    if (!club) return res.status(404).json({ error: 'Club not found.' });
    return res.json(club);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE club
router.post('/clubs', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, category, presidentId } = req.body;
  if (!name || !description || !category || !presidentId) {
    return res.status(400).json({ error: 'Missing required club fields.' });
  }

  try {
    const club = await prisma.club.create({
      data: { name, description, category, presidentId },
      include: { president: { include: { user: true } } }
    });
    return res.status(201).json(club);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE club
router.put('/clubs/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, category, presidentId } = req.body;
  try {
    const updated = await prisma.club.update({
      where: { id: req.params.id },
      data: {
        name: name || undefined,
        description: description || undefined,
        category: category || undefined,
        presidentId: presidentId || undefined
      }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE club
router.delete('/clubs/:id', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.club.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Club deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});




export default router;

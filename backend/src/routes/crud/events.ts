import { Router, Response } from 'express';
import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../../types';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router = Router();

const prisma = new PrismaClient();

// Ensure all routes in this router are authenticated
router.use(authenticateToken);



// GET all events
router.get('/events', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      include: { club: true, organizer: { select: { firstName: true, lastName: true, email: true } } },
      orderBy: { date: 'asc' }
    });
    return res.json(events);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET single event
router.get('/events/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const ev = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        club: true,
        organizer: true,
        registrations: { include: { user: true } }
      }
    });
    if (!ev) return res.status(404).json({ error: 'Event not found.' });
    return res.json(ev);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE event
router.post('/events', async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, date, time, location, clubId, capacity } = req.body;
  if (!title || !description || !date || !time || !location || !capacity) {
    return res.status(400).json({ error: 'Missing required event fields.' });
  }

  try {
    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        time,
        location,
        clubId: clubId || null,
        organizerId: req.user!.userId,
        capacity: parseInt(capacity)
      }
    });
    return res.status(201).json(event);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE event
router.put('/events/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, date, time, location, clubId, capacity } = req.body;
  try {
    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        title: title || undefined,
        description: description || undefined,
        date: date ? new Date(date) : undefined,
        time: time || undefined,
        location: location || undefined,
        clubId: clubId !== undefined ? clubId : undefined,
        capacity: capacity ? parseInt(capacity) : undefined
      }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE event
router.delete('/events/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Event deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

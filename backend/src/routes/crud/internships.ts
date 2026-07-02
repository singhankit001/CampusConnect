import { Router, Response } from 'express';
import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../../types';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// =========================================================================
// 7. INTERNSHIPS CRUD (Recruiter / Admin)
// =========================================================================

// GET all internships
router.get('/internships', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const companyId = req.query.companyId as string || '';
    const where: any = {};
    if (companyId) {
      where.companyId = companyId;
    }

    const internships = await prisma.internship.findMany({
      where,
      include: { company: true },
      orderBy: { deadline: 'asc' }
    });
    return res.json(internships);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET single internship
router.get('/internships/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const internship = await prisma.internship.findUnique({
      where: { id: req.params.id },
      include: {
        company: true,
        applications: { include: { student: { include: { user: true } } } }
      }
    });
    if (!internship) return res.status(404).json({ error: 'Internship not found.' });
    return res.json(internship);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE internship
router.post('/internships', requireRole([UserRole.RECRUITER, UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { companyId, title, description, location, type, stipend, durationMonths, deadline } = req.body;
  if (!companyId || !title || !description || !location || !type || stipend === undefined || !durationMonths || !deadline) {
    return res.status(400).json({ error: 'Missing required internship fields.' });
  }

  try {
    const internship = await prisma.internship.create({
      data: {
        companyId,
        title,
        description,
        location,
        type,
        stipend: parseFloat(stipend),
        durationMonths: parseInt(durationMonths),
        deadline: new Date(deadline)
      },
      include: { company: true }
    });
    return res.status(201).json(internship);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE internship
router.put('/internships/:id', requireRole([UserRole.RECRUITER, UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, location, type, stipend, durationMonths, deadline } = req.body;
  try {
    const updated = await prisma.internship.update({
      where: { id: req.params.id },
      data: {
        title: title || undefined,
        description: description || undefined,
        location: location || undefined,
        type: type || undefined,
        stipend: stipend ? parseFloat(stipend) : undefined,
        durationMonths: durationMonths ? parseInt(durationMonths) : undefined,
        deadline: deadline ? new Date(deadline) : undefined
      }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE internship
router.delete('/internships/:id', requireRole([UserRole.RECRUITER, UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.internship.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Internship opportunity deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

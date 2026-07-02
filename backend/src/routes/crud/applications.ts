import { Router, Response } from 'express';
import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../types';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

const prisma = new PrismaClient();

// Ensure all routes in this router are authenticated
router.use(authenticateToken);



// GET all applications
router.get('/applications', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.query.studentId as string || '';
    const recruiterCompanyId = req.query.companyId as string || '';
    const where: any = {};

    if (studentId) {
      where.studentId = studentId;
    }
    if (recruiterCompanyId) {
      where.internship = { companyId: recruiterCompanyId };
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        student: { include: { user: true } },
        internship: { include: { company: true } }
      },
      orderBy: { applicationDate: 'desc' }
    });
    return res.json(applications);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET single application
router.get('/applications/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: req.params.id },
      include: {
        student: { include: { user: true } },
        internship: { include: { company: true } },
        statusHistory: { orderBy: { changedAt: 'asc' } }
      }
    });
    if (!application) return res.status(404).json({ error: 'Application not found.' });
    return res.json(application);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE application
router.post('/applications', async (req: AuthenticatedRequest, res: Response) => {
  const { internshipId, studentId, resumeUrl, coverLetter } = req.body;
  if (!internshipId || !studentId || !resumeUrl) {
    return res.status(400).json({ error: 'Missing required application fields.' });
  }

  try {
    const application = await prisma.application.create({
      data: {
        internshipId,
        studentId,
        resumeUrl,
        coverLetter,
        status: ApplicationStatus.APPLIED
      }
    });
    return res.status(201).json(application);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE application (specifically for status updates by recruiter/admin)
router.put('/applications/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { status, resumeUrl, coverLetter } = req.body;
  try {
    const updated = await prisma.application.update({
      where: { id: req.params.id },
      data: {
        status: status ? (status as ApplicationStatus) : undefined,
        resumeUrl: resumeUrl || undefined,
        coverLetter: coverLetter || undefined
      },
      include: {
        student: { include: { user: true } },
        internship: { include: { company: true } }
      }
    });
    return res.json(updated);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE application
router.delete('/applications/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.application.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Application removed successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

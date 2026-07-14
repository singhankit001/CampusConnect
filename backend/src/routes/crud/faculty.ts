import { Router, Response } from 'express';
import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../../types';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router = Router();

const prisma = new PrismaClient();

// Ensure all routes in this router are authenticated
router.use(authenticateToken);



// GET all faculty
router.get('/faculty', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search as string || '';
    const departmentId = req.query.departmentId as string || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { designation: { contains: search, mode: 'insensitive' } }
      ]
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    const total = await prisma.faculty.count({ where });
    const faculty = await prisma.faculty.findMany({
      where,
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        department: true
      },
      skip,
      take: limit
    });

    return res.json({ total, page, limit, faculty });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET single faculty
router.get('/faculty/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const fac = await prisma.faculty.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        department: true,
        courseAssignments: { include: { course: true } }
      }
    });
    if (!fac) return res.status(404).json({ error: 'Faculty not found.' });
    return res.json(fac);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE faculty
router.post('/faculty', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, firstName, lastName, designation, departmentId, officeHours } = req.body;
  if (!email || !password || !firstName || !lastName || !designation || !departmentId) {
    return res.status(400).json({ error: 'Missing required faculty fields.' });
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, passwordHash, firstName, lastName, role: UserRole.FACULTY }
      });
      const faculty = await tx.faculty.create({
        data: {
          userId: user.id,
          designation,
          departmentId,
          officeHours
        },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          department: true
        }
      });
      return faculty;
    });

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE faculty
router.put('/faculty/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { firstName, lastName, designation, departmentId, officeHours } = req.body;
  try {
    const fac = await prisma.faculty.findUnique({ where: { id: req.params.id } });
    if (!fac) return res.status(404).json({ error: 'Faculty not found.' });

    const result = await prisma.$transaction(async (tx) => {
      if (firstName || lastName) {
        await tx.user.update({
          where: { id: fac.userId },
          data: {
            firstName: firstName || undefined,
            lastName: lastName || undefined
          }
        });
      }
      const updated = await tx.faculty.update({
        where: { id: req.params.id },
        data: {
          designation: designation || undefined,
          departmentId: departmentId || undefined,
          officeHours: officeHours !== undefined ? officeHours : undefined
        },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          department: true
        }
      });
      return updated;
    });

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// DELETE faculty
router.delete('/faculty/:id', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const fac = await prisma.faculty.findUnique({ where: { id: req.params.id } });
    if (!fac) return res.status(404).json({ error: 'Faculty not found.' });

    await prisma.user.delete({ where: { id: fac.userId } });
    return res.json({ message: 'Faculty and associated user deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

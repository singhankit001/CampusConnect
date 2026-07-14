import { Router, Response } from 'express';
import { PrismaClient, UserRole, EnrollmentStatus, AttendanceStatus, SubmissionStatus, ClubRole, RegistrationStatus, ApplicationStatus, FeedbackCategory, NotificationType, AnnouncementTarget } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../../types';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router = Router();

const prisma = new PrismaClient();

// Ensure all routes in this router are authenticated
router.use(authenticateToken);



// GET all students (with search, filter, pagination)
router.get('/students', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const search = req.query.search as string || '';
    const departmentId = req.query.departmentId as string || '';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      OR: [
        { rollNo: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    const total = await prisma.student.count({ where });
    const students = await prisma.student.findMany({
      where,
      include: {
        user: {
          select: { email: true, firstName: true, lastName: true, role: true }
        },
        department: true
      },
      skip,
      take: limit,
      orderBy: { rollNo: 'asc' }
    });

    return res.json({ total, page, limit, students });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET single student
router.get('/students/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true, firstName: true, lastName: true } },
        department: true,
        enrollments: { include: { course: true } }
      }
    });
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    return res.json(student);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// CREATE student (Admin Only)
router.post('/students', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, firstName, lastName, rollNo, departmentId, batch, cgpa } = req.body;
  if (!email || !password || !firstName || !lastName || !rollNo || !departmentId || !batch) {
    return res.status(400).json({ error: 'Missing required student fields.' });
  }

  try {
    const passwordHash = bcrypt.hashSync(password, 10);
    // Use transaction to create both User and Student profile
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { email, passwordHash, firstName, lastName, role: UserRole.STUDENT }
      });
      const student = await tx.student.create({
        data: {
          userId: user.id,
          rollNo,
          departmentId,
          batch,
          cgpa: cgpa ? parseFloat(cgpa) : 0.0
        },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
          department: true
        }
      });
      return student;
    });

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

// UPDATE student
router.put('/students/:id', async (req: AuthenticatedRequest, res: Response) => {
  const { firstName, lastName, rollNo, departmentId, batch, cgpa } = req.body;
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    const result = await prisma.$transaction(async (tx) => {
      if (firstName || lastName) {
        await tx.user.update({
          where: { id: student.userId },
          data: {
            firstName: firstName || undefined,
            lastName: lastName || undefined
          }
        });
      }
      const updated = await tx.student.update({
        where: { id: req.params.id },
        data: {
          rollNo: rollNo || undefined,
          departmentId: departmentId || undefined,
          batch: batch || undefined,
          cgpa: cgpa ? parseFloat(cgpa) : undefined
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

// DELETE student
router.delete('/students/:id', requireRole([UserRole.ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = await prisma.student.findUnique({ where: { id: req.params.id } });
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    // Cascade delete via User table because Student has relation CASCADE constraint in schema
    await prisma.user.delete({ where: { id: student.userId } });
    return res.json({ message: 'Student and associated user deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;

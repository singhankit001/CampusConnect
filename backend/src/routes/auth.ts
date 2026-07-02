import { Router, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-campus-connect-key-9988!';

// POST /api/auth/login
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        faculty: true,
        recruiter: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Sign Token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Resolve profile details based on role
    let profileId: string | null = null;
    let extraDetails: any = null;

    if (user.role === UserRole.STUDENT && user.student) {
      profileId = user.student.id;
      extraDetails = {
        rollNo: user.student.rollNo,
        departmentId: user.student.departmentId,
        cgpa: user.student.cgpa
      };
    } else if (user.role === UserRole.FACULTY && user.faculty) {
      profileId = user.faculty.id;
      extraDetails = {
        designation: user.faculty.designation,
        departmentId: user.faculty.departmentId
      };
    } else if (user.role === UserRole.RECRUITER && user.recruiter) {
      profileId = user.recruiter.id;
      extraDetails = {
        companyId: user.recruiter.companyId,
        companyName: user.recruiter.company.name,
        designation: user.recruiter.designation
      };
    }

    // Log Activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        details: `User logged in successfully (Role: ${user.role})`,
        ipAddress: req.ip || '127.0.0.1'
      }
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileId,
        details: extraDetails
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'An error occurred during login.' });
  }
});

// GET /api/auth/me (Get current session)
router.get('/me', async (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        student: true,
        faculty: true,
        recruiter: {
          include: {
            company: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let profileId: string | null = null;
    let extraDetails: any = null;

    if (user.role === UserRole.STUDENT && user.student) {
      profileId = user.student.id;
      extraDetails = {
        rollNo: user.student.rollNo,
        departmentId: user.student.departmentId,
        cgpa: user.student.cgpa
      };
    } else if (user.role === UserRole.FACULTY && user.faculty) {
      profileId = user.faculty.id;
      extraDetails = {
        designation: user.faculty.designation,
        departmentId: user.faculty.departmentId
      };
    } else if (user.role === UserRole.RECRUITER && user.recruiter) {
      profileId = user.recruiter.id;
      extraDetails = {
        companyId: user.recruiter.companyId,
        companyName: user.recruiter.company.name,
        designation: user.recruiter.designation
      };
    }

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        profileId,
        details: extraDetails
      }
    });
  } catch (err) {
    return res.status(401).json({ error: 'Session invalid or expired.' });
  }
});

export default router;

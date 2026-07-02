import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all fee structures (Admin)
router.get('/structures', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const structures = await prisma.feeStructure.findMany({
      include: { department: true }
    });
    res.json(structures);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST new fee structure (Admin)
router.post('/structures', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { title, amount, dueDate, departmentId, batch, academicYear } = req.body;
    const structure = await prisma.feeStructure.create({
      data: {
        title,
        amount,
        dueDate: new Date(dueDate),
        departmentId,
        batch,
        academicYear
      }
    });
    res.status(201).json(structure);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET student bills (Student/Admin)
router.get('/student/:studentId', authenticateToken, async (req: any, res: any) => {
  try {
    const { studentId } = req.params;
    
    // Auth check: Students can only view their own bills
    if (req.user.role === 'STUDENT' && req.user.profileId !== studentId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const bills = await prisma.studentBill.findMany({
      where: { studentId },
      include: { 
        feeStructure: true,
        payments: true
      },
      orderBy: { dueDate: 'asc' }
    });
    res.json(bills);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST Bulk Generate Invoices (Admin)
router.post('/generate-invoices', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { feeStructureId } = req.body;
    
    const feeStructure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
    if (!feeStructure) throw new Error('Fee Structure not found');

    // Find all matching students
    const students = await prisma.student.findMany({
      where: {
        ...(feeStructure.departmentId ? { departmentId: feeStructure.departmentId } : {}),
        ...(feeStructure.batch ? { batch: feeStructure.batch } : {})
      }
    });

    // Execute in transaction
    const result = await prisma.$transaction(
      students.map(student => 
        prisma.studentBill.create({
          data: {
            studentId: student.id,
            feeStructureId: feeStructure.id,
            amount: feeStructure.amount,
            status: 'PENDING',
            dueDate: feeStructure.dueDate
          }
        })
      )
    );

    res.json({ message: `Generated ${result.length} invoices successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

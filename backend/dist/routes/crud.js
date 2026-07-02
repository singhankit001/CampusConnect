"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Ensure all routes in this router are authenticated
router.use(auth_1.authenticateToken);
// =========================================================================
// 1. STUDENTS CRUD
// =========================================================================
// GET all students (with search, filter, pagination)
router.get('/students', async (req, res) => {
    try {
        const search = req.query.search || '';
        const departmentId = req.query.departmentId || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {
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
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET single student
router.get('/students/:id', async (req, res) => {
    try {
        const student = await prisma.student.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { email: true, firstName: true, lastName: true } },
                department: true,
                enrollments: { include: { course: true } }
            }
        });
        if (!student)
            return res.status(404).json({ error: 'Student not found.' });
        return res.json(student);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// CREATE student (Admin Only)
router.post('/students', (0, auth_1.requireRole)([client_1.UserRole.ADMIN]), async (req, res) => {
    const { email, password, firstName, lastName, rollNo, departmentId, batch, cgpa } = req.body;
    if (!email || !password || !firstName || !lastName || !rollNo || !departmentId || !batch) {
        return res.status(400).json({ error: 'Missing required student fields.' });
    }
    try {
        const passwordHash = bcrypt.hashSync(password, 10);
        // Use transaction to create both User and Student profile
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { email, passwordHash, firstName, lastName, role: client_1.UserRole.STUDENT }
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
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// UPDATE student
router.put('/students/:id', async (req, res) => {
    const { firstName, lastName, rollNo, departmentId, batch, cgpa } = req.body;
    try {
        const student = await prisma.student.findUnique({ where: { id: req.params.id } });
        if (!student)
            return res.status(404).json({ error: 'Student not found.' });
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
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// DELETE student
router.delete('/students/:id', (0, auth_1.requireRole)([client_1.UserRole.ADMIN]), async (req, res) => {
    try {
        const student = await prisma.student.findUnique({ where: { id: req.params.id } });
        if (!student)
            return res.status(404).json({ error: 'Student not found.' });
        // Cascade delete via User table because Student has relation CASCADE constraint in schema
        await prisma.user.delete({ where: { id: student.userId } });
        return res.json({ message: 'Student and associated user deleted successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// =========================================================================
// 2. FACULTY CRUD
// =========================================================================
// GET all faculty
router.get('/faculty', async (req, res) => {
    try {
        const search = req.query.search || '';
        const departmentId = req.query.departmentId || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {
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
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET single faculty
router.get('/faculty/:id', async (req, res) => {
    try {
        const fac = await prisma.faculty.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { email: true, firstName: true, lastName: true } },
                department: true,
                courseAssignments: { include: { course: true } }
            }
        });
        if (!fac)
            return res.status(404).json({ error: 'Faculty not found.' });
        return res.json(fac);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// CREATE faculty
router.post('/faculty', (0, auth_1.requireRole)([client_1.UserRole.ADMIN]), async (req, res) => {
    const { email, password, firstName, lastName, designation, departmentId, officeHours } = req.body;
    if (!email || !password || !firstName || !lastName || !designation || !departmentId) {
        return res.status(400).json({ error: 'Missing required faculty fields.' });
    }
    try {
        const passwordHash = bcrypt.hashSync(password, 10);
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { email, passwordHash, firstName, lastName, role: client_1.UserRole.FACULTY }
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
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// UPDATE faculty
router.put('/faculty/:id', async (req, res) => {
    const { firstName, lastName, designation, departmentId, officeHours } = req.body;
    try {
        const fac = await prisma.faculty.findUnique({ where: { id: req.params.id } });
        if (!fac)
            return res.status(404).json({ error: 'Faculty not found.' });
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
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// DELETE faculty
router.delete('/faculty/:id', (0, auth_1.requireRole)([client_1.UserRole.ADMIN]), async (req, res) => {
    try {
        const fac = await prisma.faculty.findUnique({ where: { id: req.params.id } });
        if (!fac)
            return res.status(404).json({ error: 'Faculty not found.' });
        await prisma.user.delete({ where: { id: fac.userId } });
        return res.json({ message: 'Faculty and associated user deleted successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// =========================================================================
// 3. COURSES CRUD
// =========================================================================
// GET all courses
router.get('/courses', async (req, res) => {
    try {
        const search = req.query.search || '';
        const departmentId = req.query.departmentId || '';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100; // default large to list for forms
        const skip = (page - 1) * limit;
        const where = {
            OR: [
                { code: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } }
            ]
        };
        if (departmentId) {
            where.departmentId = departmentId;
        }
        const total = await prisma.course.count({ where });
        const courses = await prisma.course.findMany({
            where,
            include: { department: true },
            skip,
            take: limit,
            orderBy: { code: 'asc' }
        });
        return res.json({ total, page, limit, courses });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET single course
router.get('/courses/:id', async (req, res) => {
    try {
        const course = await prisma.course.findUnique({
            where: { id: req.params.id },
            include: {
                department: true,
                courseAssignments: { include: { faculty: { include: { user: true } } } }
            }
        });
        if (!course)
            return res.status(404).json({ error: 'Course not found.' });
        return res.json(course);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// CREATE course
router.post('/courses', (0, auth_1.requireRole)([client_1.UserRole.ADMIN]), async (req, res) => {
    const { code, title, credits, departmentId } = req.body;
    if (!code || !title || !credits || !departmentId) {
        return res.status(400).json({ error: 'Missing required course fields.' });
    }
    try {
        const course = await prisma.course.create({
            data: {
                code,
                title,
                credits: parseInt(credits),
                departmentId
            },
            include: { department: true }
        });
        return res.status(201).json(course);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// UPDATE course
router.put('/courses/:id', (0, auth_1.requireRole)([client_1.UserRole.ADMIN]), async (req, res) => {
    const { code, title, credits, departmentId } = req.body;
    try {
        const updated = await prisma.course.update({
            where: { id: req.params.id },
            data: {
                code: code || undefined,
                title: title || undefined,
                credits: credits ? parseInt(credits) : undefined,
                departmentId: departmentId || undefined
            },
            include: { department: true }
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// DELETE course
router.delete('/courses/:id', (0, auth_1.requireRole)([client_1.UserRole.ADMIN]), async (req, res) => {
    try {
        await prisma.course.delete({ where: { id: req.params.id } });
        return res.json({ message: 'Course deleted successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// =========================================================================
// 4. ASSIGNMENTS CRUD
// =========================================================================
// GET all assignments
router.get('/assignments', async (req, res) => {
    try {
        const courseId = req.query.courseId || '';
        const where = {};
        if (courseId) {
            where.courseId = courseId;
        }
        const assignments = await prisma.assignment.findMany({
            where,
            include: { course: true },
            orderBy: { dueDate: 'asc' }
        });
        return res.json(assignments);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET single assignment
router.get('/assignments/:id', async (req, res) => {
    try {
        const asg = await prisma.assignment.findUnique({
            where: { id: req.params.id },
            include: { course: true, submissions: { include: { student: { include: { user: true } } } } }
        });
        if (!asg)
            return res.status(404).json({ error: 'Assignment not found.' });
        return res.json(asg);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// CREATE assignment
router.post('/assignments', (0, auth_1.requireRole)([client_1.UserRole.FACULTY, client_1.UserRole.ADMIN]), async (req, res) => {
    const { courseId, title, description, maxMarks, dueDate } = req.body;
    if (!courseId || !title || !description || !maxMarks || !dueDate) {
        return res.status(400).json({ error: 'Missing required assignment fields.' });
    }
    try {
        const assignment = await prisma.assignment.create({
            data: {
                courseId,
                title,
                description,
                maxMarks: parseInt(maxMarks),
                dueDate: new Date(dueDate)
            },
            include: { course: true }
        });
        return res.status(201).json(assignment);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// UPDATE assignment
router.put('/assignments/:id', (0, auth_1.requireRole)([client_1.UserRole.FACULTY, client_1.UserRole.ADMIN]), async (req, res) => {
    const { title, description, maxMarks, dueDate } = req.body;
    try {
        const updated = await prisma.assignment.update({
            where: { id: req.params.id },
            data: {
                title: title || undefined,
                description: description || undefined,
                maxMarks: maxMarks ? parseInt(maxMarks) : undefined,
                dueDate: dueDate ? new Date(dueDate) : undefined
            },
            include: { course: true }
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// DELETE assignment
router.delete('/assignments/:id', (0, auth_1.requireRole)([client_1.UserRole.FACULTY, client_1.UserRole.ADMIN]), async (req, res) => {
    try {
        await prisma.assignment.delete({ where: { id: req.params.id } });
        return res.json({ message: 'Assignment deleted successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// =========================================================================
// 5. EVENTS CRUD
// =========================================================================
// GET all events
router.get('/events', async (req, res) => {
    try {
        const events = await prisma.event.findMany({
            include: { club: true, organizer: { select: { firstName: true, lastName: true, email: true } } },
            orderBy: { date: 'asc' }
        });
        return res.json(events);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET single event
router.get('/events/:id', async (req, res) => {
    try {
        const ev = await prisma.event.findUnique({
            where: { id: req.params.id },
            include: {
                club: true,
                organizer: true,
                registrations: { include: { user: true } }
            }
        });
        if (!ev)
            return res.status(404).json({ error: 'Event not found.' });
        return res.json(ev);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// CREATE event
router.post('/events', async (req, res) => {
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
                organizerId: req.user.userId,
                capacity: parseInt(capacity)
            }
        });
        return res.status(201).json(event);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// UPDATE event
router.put('/events/:id', async (req, res) => {
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
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// DELETE event
router.delete('/events/:id', async (req, res) => {
    try {
        await prisma.event.delete({ where: { id: req.params.id } });
        return res.json({ message: 'Event deleted successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// =========================================================================
// 6. CLUBS CRUD
// =========================================================================
// GET all clubs
router.get('/clubs', async (req, res) => {
    try {
        const clubs = await prisma.club.findMany({
            include: { president: { include: { user: true } } },
            orderBy: { name: 'asc' }
        });
        return res.json(clubs);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET single club
router.get('/clubs/:id', async (req, res) => {
    try {
        const club = await prisma.club.findUnique({
            where: { id: req.params.id },
            include: {
                president: { include: { user: true } },
                members: { include: { student: { include: { user: true } } } },
                events: true
            }
        });
        if (!club)
            return res.status(404).json({ error: 'Club not found.' });
        return res.json(club);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// CREATE club
router.post('/clubs', (0, auth_1.requireRole)([client_1.UserRole.ADMIN]), async (req, res) => {
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
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// UPDATE club
router.put('/clubs/:id', async (req, res) => {
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
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// DELETE club
router.delete('/clubs/:id', (0, auth_1.requireRole)([client_1.UserRole.ADMIN]), async (req, res) => {
    try {
        await prisma.club.delete({ where: { id: req.params.id } });
        return res.json({ message: 'Club deleted successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// =========================================================================
// 7. INTERNSHIPS CRUD (Recruiter / Admin)
// =========================================================================
// GET all internships
router.get('/internships', async (req, res) => {
    try {
        const companyId = req.query.companyId || '';
        const where = {};
        if (companyId) {
            where.companyId = companyId;
        }
        const internships = await prisma.internship.findMany({
            where,
            include: { company: true },
            orderBy: { deadline: 'asc' }
        });
        return res.json(internships);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET single internship
router.get('/internships/:id', async (req, res) => {
    try {
        const internship = await prisma.internship.findUnique({
            where: { id: req.params.id },
            include: {
                company: true,
                applications: { include: { student: { include: { user: true } } } }
            }
        });
        if (!internship)
            return res.status(404).json({ error: 'Internship not found.' });
        return res.json(internship);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// CREATE internship
router.post('/internships', (0, auth_1.requireRole)([client_1.UserRole.RECRUITER, client_1.UserRole.ADMIN]), async (req, res) => {
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
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// UPDATE internship
router.put('/internships/:id', (0, auth_1.requireRole)([client_1.UserRole.RECRUITER, client_1.UserRole.ADMIN]), async (req, res) => {
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
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// DELETE internship
router.delete('/internships/:id', (0, auth_1.requireRole)([client_1.UserRole.RECRUITER, client_1.UserRole.ADMIN]), async (req, res) => {
    try {
        await prisma.internship.delete({ where: { id: req.params.id } });
        return res.json({ message: 'Internship opportunity deleted successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// =========================================================================
// 8. APPLICATIONS CRUD
// =========================================================================
// GET all applications
router.get('/applications', async (req, res) => {
    try {
        const studentId = req.query.studentId || '';
        const recruiterCompanyId = req.query.companyId || '';
        const where = {};
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
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET single application
router.get('/applications/:id', async (req, res) => {
    try {
        const application = await prisma.application.findUnique({
            where: { id: req.params.id },
            include: {
                student: { include: { user: true } },
                internship: { include: { company: true } },
                statusHistory: { orderBy: { changedAt: 'asc' } }
            }
        });
        if (!application)
            return res.status(404).json({ error: 'Application not found.' });
        return res.json(application);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// CREATE application
router.post('/applications', async (req, res) => {
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
                status: client_1.ApplicationStatus.APPLIED
            }
        });
        return res.status(201).json(application);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// UPDATE application (specifically for status updates by recruiter/admin)
router.put('/applications/:id', async (req, res) => {
    const { status, resumeUrl, coverLetter } = req.body;
    try {
        const updated = await prisma.application.update({
            where: { id: req.params.id },
            data: {
                status: status ? status : undefined,
                resumeUrl: resumeUrl || undefined,
                coverLetter: coverLetter || undefined
            },
            include: {
                student: { include: { user: true } },
                internship: { include: { company: true } }
            }
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// DELETE application
router.delete('/applications/:id', async (req, res) => {
    try {
        await prisma.application.delete({ where: { id: req.params.id } });
        return res.json({ message: 'Application removed successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// =========================================================================
// 9. ANNOUNCEMENTS CRUD
// =========================================================================
// GET all announcements
router.get('/announcements', async (req, res) => {
    try {
        const target = req.query.target || '';
        const departmentId = req.query.departmentId || '';
        const where = {};
        if (target) {
            where.type = target;
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
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET single announcement
router.get('/announcements/:id', async (req, res) => {
    try {
        const ann = await prisma.announcement.findUnique({
            where: { id: req.params.id },
            include: { creator: true, department: true }
        });
        if (!ann)
            return res.status(404).json({ error: 'Announcement not found.' });
        return res.json(ann);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// CREATE announcement
router.post('/announcements', (0, auth_1.requireRole)([client_1.UserRole.FACULTY, client_1.UserRole.ADMIN]), async (req, res) => {
    const { title, content, type, departmentId } = req.body;
    if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required.' });
    }
    try {
        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                type: type ? type : client_1.AnnouncementTarget.ALL,
                departmentId: departmentId || null,
                creatorId: req.user.userId
            }
        });
        return res.status(201).json(announcement);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// UPDATE announcement
router.put('/announcements/:id', (0, auth_1.requireRole)([client_1.UserRole.FACULTY, client_1.UserRole.ADMIN]), async (req, res) => {
    const { title, content, type, departmentId } = req.body;
    try {
        const updated = await prisma.announcement.update({
            where: { id: req.params.id },
            data: {
                title: title || undefined,
                content: content || undefined,
                type: type ? type : undefined,
                departmentId: departmentId !== undefined ? departmentId : undefined
            }
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// DELETE announcement
router.delete('/announcements/:id', (0, auth_1.requireRole)([client_1.UserRole.FACULTY, client_1.UserRole.ADMIN]), async (req, res) => {
    try {
        await prisma.announcement.delete({ where: { id: req.params.id } });
        return res.json({ message: 'Announcement deleted successfully.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// =========================================================================
// 10. FEEDBACK CRUD
// =========================================================================
// GET all feedbacks
router.get('/feedback', async (req, res) => {
    try {
        const feedbacks = await prisma.feedback.findMany({
            include: { user: { select: { firstName: true, lastName: true, role: true, email: true } } },
            orderBy: { submissionDate: 'desc' }
        });
        return res.json(feedbacks);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET single feedback
router.get('/feedback/:id', async (req, res) => {
    try {
        const feed = await prisma.feedback.findUnique({
            where: { id: req.params.id },
            include: { user: true }
        });
        if (!feed)
            return res.status(404).json({ error: 'Feedback not found.' });
        return res.json(feed);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// CREATE feedback
router.post('/feedback', async (req, res) => {
    const { category, rating, comments } = req.body;
    if (!category || rating === undefined || !comments) {
        return res.status(400).json({ error: 'Category, rating, and comments are required.' });
    }
    try {
        const feedback = await prisma.feedback.create({
            data: {
                userId: req.user.userId,
                category: category,
                rating: parseInt(rating),
                comments
            }
        });
        return res.status(201).json(feedback);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// UPDATE feedback
router.put('/feedback/:id', async (req, res) => {
    const { category, rating, comments } = req.body;
    try {
        const updated = await prisma.feedback.update({
            where: { id: req.params.id },
            data: {
                category: category ? category : undefined,
                rating: rating ? parseInt(rating) : undefined,
                comments: comments || undefined
            }
        });
        return res.json(updated);
    }
    catch (err) {
        return res.status(400).json({ error: err.message });
    }
});
// DELETE feedback
router.delete('/feedback/:id', (0, auth_1.requireRole)([client_1.UserRole.ADMIN]), async (req, res) => {
    try {
        await prisma.feedback.delete({ where: { id: req.params.id } });
        return res.json({ message: 'Feedback record deleted.' });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
exports.default = router;

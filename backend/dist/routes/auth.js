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
const jwt = __importStar(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-campus-connect-key-9988!';
// POST /api/auth/login
router.post('/login', async (req, res) => {
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
        const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
        // Resolve profile details based on role
        let profileId = null;
        let extraDetails = null;
        if (user.role === client_1.UserRole.STUDENT && user.student) {
            profileId = user.student.id;
            extraDetails = {
                rollNo: user.student.rollNo,
                departmentId: user.student.departmentId,
                cgpa: user.student.cgpa
            };
        }
        else if (user.role === client_1.UserRole.FACULTY && user.faculty) {
            profileId = user.faculty.id;
            extraDetails = {
                designation: user.faculty.designation,
                departmentId: user.faculty.departmentId
            };
        }
        else if (user.role === client_1.UserRole.RECRUITER && user.recruiter) {
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
    }
    catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'An error occurred during login.' });
    }
});
// GET /api/auth/me (Get current session)
router.get('/me', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized.' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
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
        let profileId = null;
        let extraDetails = null;
        if (user.role === client_1.UserRole.STUDENT && user.student) {
            profileId = user.student.id;
            extraDetails = {
                rollNo: user.student.rollNo,
                departmentId: user.student.departmentId,
                cgpa: user.student.cgpa
            };
        }
        else if (user.role === client_1.UserRole.FACULTY && user.faculty) {
            profileId = user.faculty.id;
            extraDetails = {
                designation: user.faculty.designation,
                departmentId: user.faculty.departmentId
            };
        }
        else if (user.role === client_1.UserRole.RECRUITER && user.recruiter) {
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
    }
    catch (err) {
        return res.status(401).json({ error: 'Session invalid or expired.' });
    }
});
exports.default = router;

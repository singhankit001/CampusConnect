"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Ensure authenticated
router.use(auth_1.authenticateToken);
// 1. POST /api/procedures/enroll-student
router.post('/enroll-student', async (req, res) => {
    const { studentId, courseId, semester, academicYear } = req.body;
    if (!studentId || !courseId || !semester || !academicYear) {
        return res.status(400).json({ error: 'studentId, courseId, semester, and academicYear are required.' });
    }
    try {
        // Call the stored function: SELECT EnrollStudent(studentId, courseId, semester, academicYear);
        const result = await prisma.$queryRawUnsafe(`SELECT EnrollStudent($1, $2, $3, $4) AS "enrollmentId"`, studentId, courseId, semester, academicYear);
        const enrollmentId = result[0]?.enrollmentId;
        // Log the transaction activity
        await prisma.activityLog.create({
            data: {
                userId: req.user.userId,
                action: 'ENROLL_STUDENT_PROCEDURE',
                details: `Enrolled student ${studentId} in course ${courseId} via EnrollStudent(). Enrollment ID: ${enrollmentId}`,
                ipAddress: req.ip || '127.0.0.1'
            }
        });
        return res.status(201).json({
            message: 'Student enrolled successfully via database procedure.',
            enrollmentId
        });
    }
    catch (err) {
        console.error('EnrollStudent procedure error:', err);
        return res.status(400).json({ error: err.message || 'Database execution failed.' });
    }
});
// 2. POST /api/procedures/apply-internship
router.post('/apply-internship', async (req, res) => {
    const { studentId, internshipId, resumeUrl, coverLetter } = req.body;
    if (!studentId || !internshipId || !resumeUrl) {
        return res.status(400).json({ error: 'studentId, internshipId, and resumeUrl are required.' });
    }
    try {
        // Call: SELECT ApplyForInternship(studentId, internshipId, resumeUrl, coverLetter);
        const result = await prisma.$queryRawUnsafe(`SELECT ApplyForInternship($1, $2, $3, $4) AS "applicationId"`, studentId, internshipId, resumeUrl, coverLetter || '');
        const applicationId = result[0]?.applicationId;
        await prisma.activityLog.create({
            data: {
                userId: req.user.userId,
                action: 'APPLY_INTERNSHIP_PROCEDURE',
                details: `Applied student ${studentId} to internship ${internshipId} via ApplyForInternship(). Application ID: ${applicationId}`,
                ipAddress: req.ip || '127.0.0.1'
            }
        });
        return res.status(201).json({
            message: 'Applied for internship successfully via database procedure.',
            applicationId
        });
    }
    catch (err) {
        console.error('ApplyForInternship procedure error:', err);
        return res.status(400).json({ error: err.message || 'Database execution failed.' });
    }
});
// 3. POST /api/procedures/register-event
router.post('/register-event', async (req, res) => {
    const { userId, eventId } = req.body;
    if (!userId || !eventId) {
        return res.status(400).json({ error: 'userId and eventId are required.' });
    }
    try {
        // Call: SELECT RegisterForEvent(userId, eventId);
        const result = await prisma.$queryRawUnsafe(`SELECT RegisterForEvent($1, $2) AS "registrationId"`, userId, eventId);
        const registrationId = result[0]?.registrationId;
        await prisma.activityLog.create({
            data: {
                userId: req.user.userId,
                action: 'REGISTER_EVENT_PROCEDURE',
                details: `Registered user ${userId} for event ${eventId} via RegisterForEvent(). Registration ID: ${registrationId}`,
                ipAddress: req.ip || '127.0.0.1'
            }
        });
        return res.status(201).json({
            message: 'Registered for event successfully via database procedure.',
            registrationId
        });
    }
    catch (err) {
        console.error('RegisterForEvent procedure error:', err);
        return res.status(400).json({ error: err.message || 'Database execution failed.' });
    }
});
// 4. POST /api/procedures/submit-assignment
router.post('/submit-assignment', async (req, res) => {
    const { studentId, assignmentId, fileUrl } = req.body;
    if (!studentId || !assignmentId || !fileUrl) {
        return res.status(400).json({ error: 'studentId, assignmentId, and fileUrl are required.' });
    }
    try {
        // Call: SELECT SubmitAssignment(studentId, assignmentId, fileUrl);
        const result = await prisma.$queryRawUnsafe(`SELECT SubmitAssignment($1, $2, $3) AS "submissionId"`, studentId, assignmentId, fileUrl);
        const submissionId = result[0]?.submissionId;
        await prisma.activityLog.create({
            data: {
                userId: req.user.userId,
                action: 'SUBMIT_ASSIGNMENT_PROCEDURE',
                details: `Submitted assignment ${assignmentId} for student ${studentId} via SubmitAssignment(). Submission ID: ${submissionId}`,
                ipAddress: req.ip || '127.0.0.1'
            }
        });
        return res.status(201).json({
            message: 'Assignment submitted successfully via database procedure.',
            submissionId
        });
    }
    catch (err) {
        console.error('SubmitAssignment procedure error:', err);
        return res.status(400).json({ error: err.message || 'Database execution failed.' });
    }
});
// 5. GET /api/procedures/student-report/:studentId
router.get('/student-report/:studentId', async (req, res) => {
    const { studentId } = req.params;
    try {
        // Call: SELECT GenerateStudentReport(studentId);
        const result = await prisma.$queryRawUnsafe(`SELECT GenerateStudentReport($1) AS report`, studentId);
        const report = result[0]?.report;
        if (!report) {
            return res.status(404).json({ error: 'No report data found.' });
        }
        return res.json(report);
    }
    catch (err) {
        console.error('GenerateStudentReport procedure error:', err);
        return res.status(400).json({ error: err.message || 'Database execution failed.' });
    }
});
exports.default = router;

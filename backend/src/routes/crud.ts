import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';

import studentsRouter from './crud/students';
import facultyRouter from './crud/faculty';
import coursesRouter from './crud/courses';
import assignmentsRouter from './crud/assignments';
import eventsRouter from './crud/events';
import clubsRouter from './crud/clubs';
import internshipsRouter from './crud/internships';
import applicationsRouter from './crud/applications';
import announcementsRouter from './crud/announcements';
import feedbackRouter from './crud/feedback';

const router = Router();

// Ensure all routes in this router are authenticated
router.use(authenticateToken);

router.use('/', studentsRouter);
router.use('/', facultyRouter);
router.use('/', coursesRouter);
router.use('/', assignmentsRouter);
router.use('/', eventsRouter);
router.use('/', clubsRouter);
router.use('/', internshipsRouter);
router.use('/', applicationsRouter);
router.use('/', announcementsRouter);
router.use('/', feedbackRouter);

export default router;

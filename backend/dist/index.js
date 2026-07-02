"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("./routes/auth"));
const crud_1 = __importDefault(require("./routes/crud"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const procedures_1 = __importDefault(require("./routes/procedures"));
const auth_2 = require("./middleware/auth");
dotenv_1.default.config();
// Fix for Prisma BigInt serialization in res.json()
BigInt.prototype.toJSON = function () {
    return Number(this);
};
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
const PORT = process.env.PORT || 5000;
// Enable CORS
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for dev/testing ease
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Body parser
app.use(express_1.default.json());
// Request logger middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
// Mount Routes
app.use('/api/auth', auth_1.default);
app.use('/api/crud', crud_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/procedures', procedures_1.default);
// Meta & Helper endpoints
// GET /api/departments (Quick list for dropdowns)
app.get('/api/departments', async (req, res) => {
    try {
        const depts = await prisma.department.findMany({ orderBy: { code: 'asc' } });
        return res.json(depts);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET /api/companies (Quick list for dropdowns)
app.get('/api/companies', async (req, res) => {
    try {
        const companies = await prisma.company.findMany({ orderBy: { name: 'asc' } });
        return res.json(companies);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET /api/notifications (User specific notifications)
app.get('/api/notifications', auth_2.authenticateToken, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        return res.json(notifications);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// PUT /api/notifications/:id/read (Mark single notification as read)
app.put('/api/notifications/:id/read', auth_2.authenticateToken, async (req, res) => {
    try {
        const notif = await prisma.notification.update({
            where: { id: req.params.id, userId: req.user.userId },
            data: { isRead: true }
        });
        return res.json(notif);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// GET /api/activity-logs (Recent audit logs for Admin)
app.get('/api/activity-logs', auth_2.authenticateToken, async (req, res) => {
    try {
        const logs = await prisma.activityLog.findMany({
            include: {
                user: { select: { email: true, firstName: true, lastName: true, role: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return res.json(logs);
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
// Health check endpoint
app.get('/health', (req, res) => {
    return res.json({ status: 'healthy', timestamp: new Date() });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});
// Start Server
app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(` CampusConnect Backend Server is live on Port ${PORT}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`===================================================`);
});

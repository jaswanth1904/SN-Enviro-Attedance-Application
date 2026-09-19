const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const initScheduler = require('./utils/scheduler');

// Load env vars
dotenv.config();

// Connect to Database
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

// Route files
const auth = require('./routes/authRoutes');
const attendance = require('./routes/attendanceRoutes');
const expenses = require('./routes/expenseRoutes');
const sites = require('./routes/siteRoutes');
const leaves = require('./routes/leaveRoutes');
const salaries = require('./routes/salaryRoutes');
const escalationRoutes = require('./routes/escalationRoutes');

const app = express();

// Body parser with increased limits for high-concurrency data streams
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Set static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set security headers
app.use(helmet());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent HTTP parameter pollution
app.use(hpp());

// Compress all responses for massive speed gains
app.use(compression());

// Enable CORS
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
    credentials: true
}));

// Dev logging middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    app.use(morgan('dev'));
}

// Optimized Rate limiting for 500+ concurrent enterprise users
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 5000, 
    message: {
        success: false,
        message: 'High Traffic Detected: Please wait before the next telemetry sync.'
    },
    standardHeaders: true, 
    legacyHeaders: false,
});
app.use(limiter);

// Mount routers
const adminRoutes = require('./routes/adminRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const pushRoutes = require('./routes/pushRoutes');
const webpush = require('web-push');

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:admin@snenviro.in',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

app.use('/api/auth', auth);
app.use('/api/attendance', attendance);
app.use('/api/expenses', expenses);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/sites', sites);
app.use('/api/leaves', leaves);
app.use('/api/salary', salaries);
app.use('/api/escalations', escalationRoutes);
app.use('/api/users', require('./routes/userRoutes'));

// API Documentation / Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to SN Enviro Attendance API',
        endpoints: {
            auth: '/api/auth',
            attendance: '/api/attendance',
            expenses: '/api/expenses',
            sites: '/api/sites'
        }
    });
});

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    // Start automated background tasks
    initScheduler();
    
    // Initialize Escalation Cron Job
    require('./cron/escalationJob');

    const PORT = process.env.PORT || 5002;
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        console.log(`🚀 Access internal API stream at http://localhost:${PORT}`);
    });

    // Initialize WebSockets for real-time MD Dashboard
    const { Server } = require('socket.io');
    const io = new Server(server, {
        cors: {
            origin: '*', // Allow all origins for dev
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket) => {
        console.log(`🔌 MD Dashboard connected via WebSocket: ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`🔌 MD Dashboard disconnected: ${socket.id}`);
        });
    });

    // Expose io object globally for controllers to broadcast events
    app.locals.io = io;

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err, promise) => {
        console.log(`Error: ${err.message}`);
        server.close(() => process.exit(1));
    });
}

module.exports = app;

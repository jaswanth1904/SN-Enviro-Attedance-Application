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

// Connect to database
connectDB().then(() => {
    // Start automated background tasks (11:30 AM Reports)
    initScheduler();
});

// Route files
const auth = require('./routes/authRoutes');
const attendance = require('./routes/attendanceRoutes');
const expenses = require('./routes/expenseRoutes');
const sites = require('./routes/siteRoutes');
const leaves = require('./routes/leaveRoutes');
const salaries = require('./routes/salaryRoutes');

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
app.use(cors());

// Dev logging middleware
if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
    app.use(morgan('dev'));
}

// Optimized Rate limiting for 500+ concurrent enterprise users
// This ensures that login bursts at peak hours (9 AM / 6 PM) don't lock out legitimate staff
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 mins
    max: 5000, // High capacity for large enterprise clusters
    message: {
        success: false,
        message: 'High Traffic Detected: Please wait before the next telemetry sync.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// Mount routers
app.use('/api/auth', auth);
app.use('/api/attendance', attendance);
app.use('/api/expenses', expenses);
app.use('/api/sites', sites);
app.use('/api/leaves', leaves);
app.use('/api/salary', salaries);

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

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`🚀 Access internal API stream at http://localhost:${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

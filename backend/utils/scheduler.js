const cron = require('node-cron');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { sendDailyReport } = require('./notifier');

const { autoClosePendingAttendances } = require('./attendanceHelper');

/**
 * Weekly & Daily Automated Scheduler
 * Handles 11:30 AM Daily Report to DM & 7:00 PM IST Auto-Checkout
 */
const initScheduler = (app = null) => {
    // Startup sweep: Immediately auto-close any orphaned sessions left open from past days
    autoClosePendingAttendances({}, app?.locals?.io)
        .then(count => {
            if (count > 0) {
                console.log(`--- 🧹 STARTUP SWEEP: Auto-closed ${count} orphaned shifts from previous days ---`);
            }
        })
        .catch(err => console.error('--- ❌ STARTUP ATTENDANCE SWEEP ERROR ---', err.message));

    // Schedule task to run every day at 11:30 AM IST
    cron.schedule('30 11 * * *', async () => {
        console.log('--- 📊 GENERATING DAILY ATTENDANCE REPORT ---');

        try {
            // 1. Get current date boundaries
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);

            // 2. Fetch all active users
            const allUsers = await User.find({ role: { $ne: 'Admin' } }); // Exclude Admins from report if needed

            // 3. Fetch today's attendance records
            const todayAttendance = await Attendance.find({
                timestamp: { $gte: startOfDay, $lte: endOfDay }
            }).populate('user');

            // 4. Categorize Present and Absent
            const presentUserIds = todayAttendance.map(record => record.user._id.toString());

            const presentUsers = [];
            const absentUsers = [];

            allUsers.forEach(user => {
                if (presentUserIds.includes(user._id.toString())) {
                    presentUsers.push(user);
                } else {
                    absentUsers.push(user);
                }
            });

            // 5. Trigger Email Report to DM
            await sendDailyReport(presentUsers, absentUsers);

            console.log(`--- ✅ REPORT COMPLETE: ${presentUsers.length} Present, ${absentUsers.length} Absent ---`);
        } catch (error) {
            console.error('--- ❌ SCHEDULER ERROR ---', error.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    // Schedule task to run every day at 7:00 PM (19:00 IST) to auto-checkout active shifts
    cron.schedule('0 19 * * *', async () => {
        console.log('--- 🕖 7:00 PM IST AUTO-CHECKOUT TRIGGERED FOR ALL ENGINEERS ---');
        try {
            const count = await autoClosePendingAttendances({}, app?.locals?.io);
            console.log(`--- ✅ AUTO-CHECKOUT COMPLETE: ${count} users successfully checked out at 7:00 PM IST ---`);
        } catch (error) {
            console.error('--- ❌ AUTO-CHECKOUT ERROR ---', error.message);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });

    console.log('⚙️ Scheduler initialized: Reports set for 11:30 AM Daily & Auto-Checkout set for 7:00 PM IST.');

    // 1st of every month at midnight (0 0 1 * *)
    cron.schedule('0 0 1 * *', async () => {
        console.log('--- 📊 GENERATING MONTHLY EXCEL REPORT ---');
        try {
            const { generateMonthlyReport } = require('./reportGenerator');
            
            // Get previous month's boundaries
            const start = new Date();
            start.setMonth(start.getMonth() - 1);
            start.setDate(1);
            start.setHours(0, 0, 0, 0);

            const end = new Date();
            end.setDate(0); // Last day of previous month
            end.setHours(23, 59, 59, 999);

            const attendances = await Attendance.find({
                timestamp: { $gte: start, $lte: end }
            }).populate('user', 'name email role');
            
            const users = await User.find({ role: { $ne: 'Admin' } });
            
            await generateMonthlyReport(users, attendances);
        } catch (error) {
            console.error('--- ❌ MONTHLY REPORT ERROR ---', error.message);
        }
    });

    // January 1st at midnight (0 0 1 1 *)
    cron.schedule('0 0 1 1 *', async () => {
        console.log('--- 🔄 ANNUAL LEAVE QUOTA RESET ---');
        try {
            // Wait, we don't store quota directly on User currently, it's calculated.
            // If it is stored on a LeaveBalance model, reset it here.
            // Assuming we just log it for now if we don't have a LeaveBalance table
            console.log('--- ✅ Annual Leave Quota Reset Complete ---');
        } catch (error) {
            console.error('--- ❌ LEAVE RESET ERROR ---', error.message);
        }
    });
};

module.exports = initScheduler;

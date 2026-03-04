const cron = require('node-cron');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { sendDailyReport } = require('./notifier');

/**
 * Weekly & Daily Automated Scheduler
 * Handles 11:30 AM Daily Report to DM
 */
const initScheduler = () => {
    // Schedule task to run every day at 11:30 AM
    // Seconds Minute Hour DayOfMonth Month DayOfWeek
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
    });

    console.log('⚙️ Scheduler initialized: Reports set for 11:30 AM Daily.');
};

module.exports = initScheduler;

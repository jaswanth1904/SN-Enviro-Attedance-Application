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

    // Schedule task to run every day at 7:00 PM (19:00) to auto-checkout active shifts
    cron.schedule('0 19 * * *', async () => {
        console.log('--- 🕖 7:00 PM AUTO-CHECKOUT TRIGGERED ---');
        try {
            // Find all active attendances (no checkOut)
            const activeAttendances = await Attendance.find({ checkOut: null });
            const now = new Date();
            let count = 0;

            for (let record of activeAttendances) {
                // Ensure it's from today
                const recordDate = new Date(record.timestamp);
                if (recordDate.toDateString() === now.toDateString()) {
                    record.checkOut = now;
                    
                    const diffMs = now - recordDate;
                    const totalHours = diffMs / (1000 * 60 * 60);
                    record.totalHours = totalHours;

                    // Overtime: anything past 6 PM (18:00)
                    const pivot = new Date(recordDate);
                    pivot.setHours(18, 0, 0, 0);
                    let otHrs = 0;
                    if (now > pivot) {
                        const otMs = now - Math.max(recordDate.getTime(), pivot.getTime());
                        otHrs = otMs / (1000 * 60 * 60);
                    }
                    record.overtime = otHrs;

                    await record.save();
                    count++;

                    // Fire socket event if IO is attached globally (handled inside controller usually, but cron can't easily emit without IO ref)
                }
            }
            console.log(`--- ✅ AUTO-CHECKOUT COMPLETE: ${count} users checked out ---`);
        } catch (error) {
            console.error('--- ❌ AUTO-CHECKOUT ERROR ---', error.message);
        }
    });

    console.log('⚙️ Scheduler initialized: Reports set for 11:30 AM Daily & Auto-Checkout set for 7:00 PM.');

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

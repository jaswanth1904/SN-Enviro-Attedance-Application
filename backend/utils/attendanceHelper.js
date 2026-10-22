/**
 * attendanceHelper.js
 * Centralized, Timezone-Safe (Asia/Kolkata, UTC+5:30) Attendance & Shift Logic
 */

/**
 * Returns YYYY-MM-DD in IST (Asia/Kolkata)
 * @param {Date|string|number} date 
 * @returns {string} e.g. "2026-10-22"
 */
const getISTDateString = (date = new Date()) => {
    return new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
};

/**
 * Returns current hour (0-23) in IST
 * @param {Date|string|number} date 
 * @returns {number}
 */
const getISTHour = (date = new Date()) => {
    const timeStr = new Date(date).toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour12: false
    });
    return parseInt(timeStr.split(':')[0], 10);
};

/**
 * Constructs 7:00 PM IST (19:00:00+05:30) for a given date
 * @param {Date|string|number} date 
 * @returns {Date}
 */
const getIST7PM = (date) => {
    const istDate = getISTDateString(date);
    return new Date(`${istDate}T19:00:00+05:30`);
};

/**
 * Constructs 6:00 PM IST (18:00:00+05:30) Overtime Pivot for a given date
 * @param {Date|string|number} date 
 * @returns {Date}
 */
const getIST6PMPivot = (date) => {
    const istDate = getISTDateString(date);
    return new Date(`${istDate}T18:00:00+05:30`);
};

/**
 * Calculates total hours and overtime (hours past 6:00 PM IST)
 * @param {Date|string|number} checkInTime 
 * @param {Date|string|number} checkOutTime 
 * @returns {{ totalHours: number, overtime: number }}
 */
const calculateShiftMetrics = (checkInTime, checkOutTime) => {
    const checkIn = new Date(checkInTime);
    const checkOut = new Date(checkOutTime);

    const diffMs = Math.max(0, checkOut.getTime() - checkIn.getTime());
    const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    const pivot = getIST6PMPivot(checkIn);
    let overtime = 0;
    if (checkOut > pivot) {
        const otMs = checkOut.getTime() - Math.max(checkIn.getTime(), pivot.getTime());
        overtime = parseFloat((Math.max(0, otMs) / (1000 * 60 * 60)).toFixed(2));
    }

    return { totalHours, overtime };
};

/**
 * Auto-closes any pending attendances where checkOut is null and:
 * 1. The shift is from a previous IST day, OR
 * 2. The shift is from today and the current IST time is >= 7:00 PM (19:00 IST).
 * 
 * @param {Object} filter - Optional Mongoose query filter (e.g. { user: userId })
 * @param {Object} io - Optional Socket.IO instance for real-time broadcasts
 * @returns {Promise<number>} Number of closed attendances
 */
const autoClosePendingAttendances = async (filter = {}, io = null) => {
    const Attendance = require('../models/Attendance');

    const query = {
        checkOut: null,
        ...filter
    };

    const pending = await Attendance.find(query);
    if (!pending || pending.length === 0) return 0;

    const now = new Date();
    const todayIST = getISTDateString(now);
    const currentISTHour = getISTHour(now);

    let closedCount = 0;

    for (const record of pending) {
        const recISTDate = getISTDateString(record.timestamp);
        const isPastDay = recISTDate < todayIST;
        const isTodayAfter7PM = (recISTDate === todayIST) && (currentISTHour >= 19);

        if (isPastDay || isTodayAfter7PM) {
            let closeTime = getIST7PM(record.timestamp);
            const checkIn = new Date(record.timestamp);

            // If check-in was at or after 7:00 PM IST, allocate an 8-hour shift window
            if (closeTime <= checkIn) {
                closeTime = new Date(checkIn.getTime() + 8 * 3600 * 1000);
            }

            const { totalHours, overtime } = calculateShiftMetrics(checkIn, closeTime);

            record.checkOut = closeTime;
            record.totalHours = totalHours;
            record.overtime = overtime;

            await Attendance.findByIdAndUpdate(record._id, {
                checkOut: closeTime,
                totalHours: totalHours,
                overtime: overtime
            });

            closedCount++;

            if (io) {
                io.emit('attendance_logged', record);
            }
        }
    }

    return closedCount;
};

module.exports = {
    getISTDateString,
    getISTHour,
    getIST7PM,
    getIST6PMPivot,
    calculateShiftMetrics,
    autoClosePendingAttendances
};

const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Site = require('../models/Site');
const Department = require('../models/Department');

// @desc    Get complete admin overview stats
// @route   GET /api/admin/overview
// @access  Admin/MD
exports.getOverviewStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Total Employees
        const totalEmployees = await User.countDocuments();

        // 2. Today's Attendance
        const todaysAttendance = await Attendance.find({
            timestamp: { $gte: today }
        }).populate('user', 'name role department site');

        const presentToday = new Set(todaysAttendance.map(a => a.user?._id?.toString())).size;
        
        // 3. Leaves
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const onLeaveToday = await Leave.countDocuments({
            status: 'Approved',
            startDate: { $lte: new Date() },
            endDate: { $gte: today }
        });

        // 4. Calculations
        const absentToday = totalEmployees - presentToday - onLeaveToday;
        
        const lateLogins = todaysAttendance.filter(a => {
            const time = new Date(a.timestamp);
            return time.getHours() >= 9 && time.getMinutes() > 30; // Assuming 9:30 is late
        }).length;

        const activeSites = await Site.countDocuments();
        const activeDepartments = await Department.countDocuments();

        // 5. Recent Activity (Latest 10 checkins)
        const recentActivity = todaysAttendance.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

        // Chart Data Calculations
        // 1. Pie Chart: Role Distribution
        const users = await User.find({}, 'role');
        const roleCount = {};
        users.forEach(u => {
            const r = u.role || 'Unassigned';
            roleCount[r] = (roleCount[r] || 0) + 1;
        });
        const pieChart = Object.keys(roleCount).map(k => ({ name: k, value: roleCount[k] }));

        // 2. Bar Chart: Attendance by Location (Today)
        const locCount = {};
        todaysAttendance.forEach(a => {
            const loc = a.locationName || 'Unknown';
            // Simplify location name for chart
            const shortLoc = loc.split(',')[0]; 
            locCount[shortLoc] = (locCount[shortLoc] || 0) + 1;
        });
        const barChart = Object.keys(locCount).map(k => ({ name: k, count: locCount[k] }));

        // 3. Line Chart: Weekly trend (past 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
        sevenDaysAgo.setHours(0,0,0,0);
        
        const pastWeekAttendance = await Attendance.find({ timestamp: { $gte: sevenDaysAgo } });
        const trendData = {};
        for(let i=0; i<7; i++) {
            const d = new Date(sevenDaysAgo);
            d.setDate(d.getDate() + i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
            trendData[dateStr] = 0;
        }
        pastWeekAttendance.forEach(a => {
            const dateStr = new Date(a.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
            if(trendData[dateStr] !== undefined) trendData[dateStr]++;
        });
        const lineChart = Object.keys(trendData).map(k => ({ name: k, attendance: trendData[k] }));

        res.status(200).json({
            success: true,
            data: {
                totalEmployees,
                presentToday,
                absentToday,
                lateLogins,
                onLeaveToday,
                activeSites,
                activeDepartments,
                attendancePercentage: totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0,
                recentActivity,
                pendingLeaves,
                charts: {
                    pie: pieChart,
                    bar: barChart,
                    line: lineChart
                }
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get live tracking data for MD Map
// @route   GET /api/admin/live-tracking
// @access  Admin/MD
exports.getLiveTracking = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todaysAttendance = await Attendance.find({
            timestamp: { $gte: today }
        }).populate('user', 'name role department site');

        const formattedData = todaysAttendance.map(att => {
            const time = new Date(att.timestamp);
            const isLate = (time.getHours() > 10 || (time.getHours() === 10 && time.getMinutes() >= 30));
            return {
                id: att._id,
                name: att.user?.name || 'Unknown',
                role: att.user?.role || 'Staff',
                city: att.locationName || 'Location Logged',
                lat: att.location?.coordinates[1] || 20.5937,
                lng: att.location?.coordinates[0] || 78.9629,
                status: isLate ? 'late' : 'on-time',
                time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        });

        res.status(200).json({ success: true, data: formattedData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Export report to CSV
// @route   GET /api/admin/export
// @access  Admin/MD
exports.exportReport = async (req, res) => {
    try {
        const { type, range } = req.query; // type: attendance, leaves, employees. range: today, this-week, this-month, etc.
        let csv = '';
        
        // Very basic date filtering
        const today = new Date();
        const queryDate = new Date();
        if (range === 'today') queryDate.setHours(0,0,0,0);
        if (range === 'this-week') queryDate.setDate(today.getDate() - 7);
        if (range === 'this-month') queryDate.setMonth(today.getMonth() - 1);
        
        if (type === 'attendance') {
            const records = await Attendance.find(range !== 'custom' ? { timestamp: { $gte: queryDate } } : {}).populate('user', 'name role empId');
            csv = 'Name,Role,Employee ID,Date,Time,Location,Status\n';
            records.forEach(r => {
                const d = new Date(r.timestamp);
                const isLate = (d.getHours() > 10 || (d.getHours() === 10 && d.getMinutes() >= 30));
                // Use standard string formats for Excel
                const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
                const timeStr = d.toTimeString().split(' ')[0]; // HH:MM:SS
                csv += `"${r.user?.name || 'N/A'}","${r.user?.role || 'N/A'}","${r.user?.empId || 'N/A'}","${dateStr}","${timeStr}","${r.locationName || 'N/A'}","${isLate ? 'Late' : 'On-Time'}"\n`;
            });
        } else if (type === 'leaves') {
            const records = await Leave.find(range !== 'custom' ? { appliedAt: { $gte: queryDate } } : {}).populate('user', 'name empId');
            csv = 'Name,Employee ID,Leave Type,Start,End,Status\n';
            records.forEach(r => {
                csv += `"${r.user?.name || 'N/A'}","${r.user?.empId || 'N/A'}","${r.leaveType}","${new Date(r.startDate).toISOString().split('T')[0]}","${new Date(r.endDate).toISOString().split('T')[0]}","${r.status}"\n`;
            });
        } else if (type === 'employees') {
            const records = await User.find();
            csv = 'Name,Email,Employee ID,Role,Phone\n';
            records.forEach(r => {
                csv += `"${r.name}","${r.email}","${r.empId || 'N/A'}","${r.role}","${r.phoneNumber || 'N/A'}"\n`;
            });
        } else {
            return res.status(400).send('Invalid report type');
        }

        res.header('Content-Type', 'text/csv');
        res.attachment(`report_${type}_${Date.now()}.csv`);
        res.send(csv);
    } catch (err) {
        console.error('Export Error:', err);
        res.status(500).send('Server Error during export');
    }
};

const sendEmail = require('../utils/sendEmail');

// @desc    Send Announcement Email
// @route   POST /api/admin/announcement
// @access  Admin/MD
exports.sendAnnouncement = async (req, res) => {
    try {
        const { subject, message, roles } = req.body;
        
        let query = {};
        if (roles && roles.length > 0) {
            query.role = { $in: roles };
        }
        
        const users = await User.find(query).select('email');
        const emails = users.map(u => u.email).filter(e => e); // ensure not null

        if (emails.length === 0) {
            return res.status(404).json({ success: false, error: 'No users found to email' });
        }

        // Send to all emails in parallel (or BCC if many)
        // For free tier 100 limit, we might want to batch, but for now we just loop
        for (const email of emails) {
            try {
                await sendEmail({
                    email,
                    subject,
                    message: `<div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
                        <h2 style="color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">${subject}</h2>
                        <p style="color: #475569; font-size: 16px;"><strong>MD has announced:</strong></p>
                        <p style="color: #334155; font-size: 15px; line-height: 1.6; background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6;">${message.replace(/\n/g, '<br>')}</p>
                        <p style="color: #475569; font-size: 16px; margin-top: 20px;">Open and see the details in the portal!</p>
                        <a href="http://localhost:5173/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Login to Portal</a>
                        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;">
                        <small style="color: #94a3b8;">This is an automated announcement from SN Enviro System.</small>
                    </div>`
                });
            } catch (err) {
                console.error(`Failed to send to ${email}`, err);
            }
        }

        res.status(200).json({ success: true, message: `Email sent to ${emails.length} users` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

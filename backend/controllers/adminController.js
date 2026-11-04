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

        // 1. Total Employees (Excluding MD / Admin)
        const totalEmployees = await User.countDocuments({ 
            role: { $nin: ['Admin', 'SuperAdmin'] },
            name: { $ne: 'Managing Director' },
            email: { $ne: 'md@snenviro.in' }
        });

        // 2. Today's Attendance (Excluding MD / Admin)
        const rawTodaysAttendance = await Attendance.find({
            timestamp: { $gte: today }
        }).populate('user', 'name role department site email');

        const todaysAttendance = rawTodaysAttendance.filter(a => 
            a.user && 
            a.user.role !== 'Admin' && 
            a.user.role !== 'SuperAdmin' &&
            a.user.name !== 'Managing Director' &&
            a.user.email !== 'md@snenviro.in'
        );

        const presentToday = new Set(todaysAttendance.map(a => a.user?._id?.toString())).size;
        
        // 3. Leaves
        const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });
        const onLeaveToday = await Leave.countDocuments({
            status: 'Approved',
            leaveType: { $ne: 'Work From Home (WFH)' },
            startDate: { $lte: new Date() },
            endDate: { $gte: today }
        });
        const wfhToday = await Leave.countDocuments({
            status: 'Approved',
            leaveType: 'Work From Home (WFH)',
            startDate: { $lte: new Date() },
            endDate: { $gte: today }
        });

        // 4. Calculations
        const absentToday = Math.max(0, totalEmployees - presentToday - onLeaveToday);
        
        const lateLogins = todaysAttendance.filter(a => {
            if (a.status === 'Late') return true;
            const time = new Date(a.timestamp);
            const istTime = new Date(time.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const hours = istTime.getHours();
            const minutes = istTime.getMinutes();
            return hours > 10 || (hours === 10 && minutes >= 30);
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
                wfhToday,
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
        }).populate('user', 'name role department site email');

        // Exclude Managing Director / Admin from live tracking map
        const employeeAttendance = todaysAttendance.filter(att => 
            att.user && 
            att.user.role !== 'Admin' && 
            att.user.role !== 'SuperAdmin' && 
            att.user.name !== 'Managing Director' &&
            att.user.email !== 'md@snenviro.in'
        );

        const formattedData = employeeAttendance.map(att => {
            const time = new Date(att.timestamp);
            const istTime = new Date(time.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
            const hours = istTime.getHours();
            const minutes = istTime.getMinutes();
            const isLate = att.status === 'Late' || hours > 10 || (hours === 10 && minutes >= 30);
            return {
                id: att._id,
                userId: att.user?._id || att.user?.id,
                name: att.user?.name || 'Unknown',
                role: att.user?.role || 'Staff',
                city: att.locationName || 'Location Logged',
                lat: att.location?.coordinates[1] || 20.5937,
                lng: att.location?.coordinates[0] || 78.9629,
                status: isLate ? 'late' : 'on-time',
                time: time.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true })
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
        const { type, range, startDate, endDate, role, employee } = req.query; // type: attendance, leaves, employees, absent
        let csv = '\uFEFF'; // UTF-8 BOM for Microsoft Excel compatibility
        
        // Date filtering in Indian Standard Time (IST)
        let query = {};
        if (startDate) {
            const start = new Date(`${startDate}T00:00:00.000+05:30`);
            const end = new Date(`${endDate || startDate}T23:59:59.999+05:30`);
            query.timestamp = { $gte: start, $lte: end };
        } else if (range === 'today') {
            const now = new Date();
            const istDateStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
            const start = new Date(`${istDateStr}T00:00:00.000+05:30`);
            const end = new Date(`${istDateStr}T23:59:59.999+05:30`);
            query.timestamp = { $gte: start, $lte: end };
        } else if (range === 'this-week') {
            const qDate = new Date();
            qDate.setDate(qDate.getDate() - 7);
            query.timestamp = { $gte: qDate };
        } else if (range === 'this-month') {
            const qDate = new Date();
            qDate.setMonth(qDate.getMonth() - 1);
            query.timestamp = { $gte: qDate };
        }
        
        if (type === 'attendance') {
            const records = await Attendance.find(query).populate('user', 'name role empId email').sort({ timestamp: -1 });
            
            // Filter non-admin and optional role/employee
            const filteredRecords = records.filter(r => {
                if (!r.user || r.user.role === 'Admin' || r.user.role === 'SuperAdmin') return false;
                if (role && role !== 'All' && r.user.role !== role) return false;
                if (employee && employee !== 'All' && r.user.name !== employee && r.user._id.toString() !== employee) return false;
                return true;
            });

            // Clean realistic columns matching company operations
            csv += 'Employee Name,Role,Employee ID,Date,Login Time (IST),Location / Plant Site,Status\n';
            filteredRecords.forEach(r => {
                const d = new Date(r.timestamp);
                const dateParts = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-'); // YYYY-MM-DD
                const dateStr = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                
                // Exact Login Time in IST
                const loginTimeStr = d.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                const loc = (r.locationName || 'Unknown Location').replace(/"/g, '""');
                
                // Late calculation (> 10:30 AM IST)
                const istTime = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
                const isLate = r.status === 'Late' || istTime.getHours() > 10 || (istTime.getHours() === 10 && istTime.getMinutes() >= 30);
                const statusStr = isLate ? 'Late (After 10:30 AM)' : 'Present';

                csv += `"${r.user?.name || 'N/A'}","${r.user?.role || 'N/A'}","${r.user?.empId || 'N/A'}","${dateStr}","${loginTimeStr}","${loc}","${statusStr}"\n`;
            });
        } else if (type === 'leaves') {
            let leaveQuery = {};
            if (startDate) {
                const start = new Date(`${startDate}T00:00:00.000+05:30`);
                const end = new Date(`${endDate || startDate}T23:59:59.999+05:30`);
                leaveQuery.appliedAt = { $gte: start, $lte: end };
            } else if (query.timestamp) {
                leaveQuery.appliedAt = query.timestamp;
            }

            const records = await Leave.find(leaveQuery).populate('user', 'name role empId email').sort({ appliedAt: -1 });
            csv += 'Employee Name,Role,Employee ID,Leave Type,Start Date,End Date,Status,MD Remarks / Note,Applied At\n';
            records.forEach(r => {
                const startParts = new Date(r.startDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-');
                const endParts = new Date(r.endDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-');
                const appliedParts = new Date(r.appliedAt).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-');
                const startStr = `${startParts[2]}-${startParts[1]}-${startParts[0]}`;
                const endStr = `${endParts[2]}-${endParts[1]}-${endParts[0]}`;
                const appliedStr = `${appliedParts[2]}-${appliedParts[1]}-${appliedParts[0]}`;
                const remarks = (r.adminRemarks || r.rejectionReason || 'None').replace(/"/g, '""');
                csv += `"${r.user?.name || 'N/A'}","${r.user?.role || 'N/A'}","${r.user?.empId || 'N/A'}","${r.leaveType || r.type}","${startStr}","${endStr}","${r.status}","${remarks}","${appliedStr}"\n`;
            });
        } else if (type === 'employees') {
            const records = await User.find({ role: { $ne: 'Admin' } }).sort({ name: 1 });
            csv += 'Employee Name,Email,Employee ID,Role,Phone Number,Joining Date\n';
            records.forEach(r => {
                let joinStr = 'N/A';
                if (r.joiningDate) {
                    const jp = new Date(r.joiningDate).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }).split('-');
                    joinStr = `${jp[2]}-${jp[1]}-${jp[0]}`;
                }
                csv += `"${r.name}","${r.email}","${r.empId || 'N/A'}","${r.role}","${r.phoneNumber || 'N/A'}","${joinStr}"\n`;
            });
        } else if (type === 'absent') {
            const dates = [];
            if (startDate) {
                let cur = new Date(`${startDate}T00:00:00.000+05:30`);
                const end = new Date(`${endDate || startDate}T00:00:00.000+05:30`);
                while (cur <= end) {
                    dates.push(cur.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
                    cur.setDate(cur.getDate() + 1);
                }
            } else if (range === 'today') {
                dates.push(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
            } else if (range === 'yesterday') {
                const d = new Date();
                d.setDate(d.getDate() - 1);
                dates.push(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
            } else if (range === 'this-week') {
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    dates.push(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
                }
            } else if (range === 'this-month') {
                const now = new Date();
                const startDay = new Date(now.getFullYear(), now.getMonth(), 1);
                let cur = startDay;
                while (cur <= now) {
                    dates.push(cur.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
                    cur.setDate(cur.getDate() + 1);
                }
            }

            let userQuery = { 
                role: { $nin: ['Admin', 'SuperAdmin'] },
                name: { $ne: 'Managing Director' },
                email: { $ne: 'md@snenviro.in' }
            };
            if (role && role !== 'All') {
                userQuery.role = role;
            }
            if (employee && employee !== 'All') {
                userQuery.name = employee;
            }
            const employees = await User.find(userQuery).sort({ name: 1 });

            csv += 'Employee Name,Role,Employee ID,Date,Status,Leave Details,Email,Phone Number\n';
            dates.reverse();

            for (const dStr of dates) {
                const dayStart = new Date(`${dStr}T00:00:00.000+05:30`);
                const dayEnd = new Date(`${dStr}T23:59:59.999+05:30`);

                const attendances = await Attendance.find({ timestamp: { $gte: dayStart, $lte: dayEnd } }).select('user');
                const presentUserIds = new Set(attendances.map(a => a.user?.toString()));

                const leaves = await Leave.find({
                    status: 'Approved',
                    startDate: { $lte: dayEnd },
                    endDate: { $gte: dayStart }
                }).select('user leaveType');
                const leaveMap = new Map();
                leaves.forEach(l => leaveMap.set(l.user?.toString(), l.leaveType));

                const [y, m, d] = dStr.split('-');
                const formattedDate = `${d}-${m}-${y}`;

                for (const emp of employees) {
                    const empIdStr = emp._id.toString();
                    if (!presentUserIds.has(empIdStr)) {
                        const onLeave = leaveMap.has(empIdStr);
                        const status = onLeave ? 'On Approved Leave' : 'Absent';
                        const leaveDetails = onLeave ? (leaveMap.get(empIdStr) || 'Approved Leave') : 'Unexcused / No Leave Applied';
                        csv += `"${emp.name}","${emp.role}","${emp.empId || 'N/A'}","${formattedDate}","${status}","${leaveDetails}","${emp.email}","${emp.phoneNumber || 'N/A'}"\n`;
                    }
                }
            }
        } else {
            return res.status(400).send('Invalid report type');
        }

        const dateSuffix = startDate ? startDate : new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment(`SN_Enviro_${type.toUpperCase()}_Report_${dateSuffix}.csv`);
        res.send(csv);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error generating report');
    }
};

// @desc    Get absent employees report for live preview
// @route   GET /api/admin/absent-report
// @access  Admin/MD
exports.getAbsentReport = async (req, res) => {
    try {
        const { range, startDate, endDate, role, employee } = req.query;
        const dates = [];
        if (startDate) {
            let cur = new Date(`${startDate}T00:00:00.000+05:30`);
            const end = new Date(`${endDate || startDate}T00:00:00.000+05:30`);
            while (cur <= end) {
                dates.push(cur.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
                cur.setDate(cur.getDate() + 1);
            }
        } else if (range === 'today') {
            dates.push(new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
        } else if (range === 'yesterday') {
            const d = new Date();
            d.setDate(d.getDate() - 1);
            dates.push(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
        } else if (range === 'this-week') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dates.push(d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
            }
        } else if (range === 'this-month') {
            const now = new Date();
            const startDay = new Date(now.getFullYear(), now.getMonth(), 1);
            let cur = startDay;
            while (cur <= now) {
                dates.push(cur.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }));
                cur.setDate(cur.getDate() + 1);
            }
        }

        let userQuery = { 
            role: { $nin: ['Admin', 'SuperAdmin'] },
            name: { $ne: 'Managing Director' },
            email: { $ne: 'md@snenviro.in' }
        };
        if (role && role !== 'All') {
            userQuery.role = role;
        }
        if (employee && employee !== 'All') {
            userQuery.name = employee;
        }
        const employees = await User.find(userQuery).sort({ name: 1 });

        const results = [];
        dates.reverse();

        for (const dStr of dates) {
            const dayStart = new Date(`${dStr}T00:00:00.000+05:30`);
            const dayEnd = new Date(`${dStr}T23:59:59.999+05:30`);

            const attendances = await Attendance.find({ timestamp: { $gte: dayStart, $lte: dayEnd } }).select('user');
            const presentUserIds = new Set(attendances.map(a => a.user?.toString()));

            const leaves = await Leave.find({
                status: 'Approved',
                startDate: { $lte: dayEnd },
                endDate: { $gte: dayStart }
            }).select('user leaveType');
            const leaveMap = new Map();
            leaves.forEach(l => leaveMap.set(l.user?.toString(), l.leaveType));

            const [y, m, d] = dStr.split('-');
            const formattedDate = `${d}-${m}-${y}`;

            for (const emp of employees) {
                const empIdStr = emp._id.toString();
                if (!presentUserIds.has(empIdStr)) {
                    const onLeave = leaveMap.has(empIdStr);
                    results.push({
                        _id: `${emp._id}_${dStr}`,
                        user: {
                            _id: emp._id,
                            name: emp.name,
                            role: emp.role,
                            empId: emp.empId,
                            email: emp.email,
                            phoneNumber: emp.phoneNumber
                        },
                        date: formattedDate,
                        rawDate: dStr,
                        status: onLeave ? 'On Approved Leave' : 'Absent',
                        leaveDetails: onLeave ? (leaveMap.get(empIdStr) || 'Approved Leave') : 'Unexcused / No Leave Applied'
                    });
                }
            }
        }

        res.status(200).json({ success: true, count: results.length, data: results });
    } catch (err) {
        console.error('getAbsentReport error:', err);
        res.status(500).json({ success: false, message: 'Server Error' });
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
                        <a href="${process.env.CLIENT_URL || 'http://localhost:5174'}/dashboard" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Login to Portal</a>
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

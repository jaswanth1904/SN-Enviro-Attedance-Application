const Attendance = require('../models/Attendance');
const Site = require('../models/Site');
const { sendOfficerNotification } = require('../utils/notifier');

// @desc    Record attendance
// @route   POST /api/attendance
// @access  Private (Staff/Senior/Accountant/Engineer/Office)
exports.recordAttendance = async (req, res, next) => {
    try {
        const { siteId, latitude, longitude, selfieUrl, locationName, timestamp, onlyReverse } = req.body;
        const { reverseGeocode } = require('../utils/geo');

        // Handle simple address detection for UI feedback
        if (onlyReverse) {
            const address = await reverseGeocode(latitude, longitude);
            return res.status(200).json({ success: true, address });
        }

        const attendanceData = {
            user: req.user.id,
            location: {
                type: 'Point',
                coordinates: [longitude, latitude]
            },
            selfieUrl,
            status: 'Present',
            timestamp: timestamp || Date.now()
        };

        // Site Engineer / Office Employee Specific Logic
        const isSpclRole = ['Application Engineer', 'Office Employee'].includes(req.user.role);

        if (req.isServiceLocation || isSpclRole) {
            // Use provided location name or detect via Google
            attendanceData.locationName = locationName || (await reverseGeocode(latitude, longitude));
        } else {
            attendanceData.site = siteId;
            attendanceData.distanceFromSite = req.distance;
            attendanceData.locationName = req.site.name;
        }

        const attendance = await Attendance.create(attendanceData);

        // Notify
        await sendOfficerNotification(req.user, req.site || { name: attendanceData.locationName }, attendance);

        // Real-time Push to Dashboard
        if (req.app.locals.io) {
            const populatedAttendance = await Attendance.findById(attendance._id)
                .populate('user', 'name email role')
                .populate('site', 'name');
            req.app.locals.io.emit('attendance_logged', populatedAttendance);
        }

        res.status(201).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Record attendance with immediate selfie upload (multipart/form-data)
// @route   POST /api/attendance/immediate
// @access  Private
exports.recordImmediateAttendance = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a selfie image'
            });
        }

        const { siteId, latitude, longitude, locationName, timestamp } = req.body;

        // Construct the URL for the uploaded file
        // Note: In production, this should be the full URL. For local dev, we use the path.
        const selfieUrl = `/uploads/${req.file.filename}`;

        const attendanceData = {
            user: req.user.id,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            selfieUrl,
            status: 'Present',
            timestamp: timestamp || Date.now()
        };

        if (req.isServiceLocation) {
            attendanceData.locationName = locationName || 'Service Location';
        } else {
            attendanceData.site = siteId;
            attendanceData.distanceFromSite = req.distance;
            attendanceData.locationName = req.site.name;
        }

        const attendance = await Attendance.create(attendanceData);

        // Proactive step: Trigger notification
        await sendOfficerNotification(req.user, req.site || { name: attendanceData.locationName }, attendance);

        // Real-time Push to Dashboard
        if (req.app.locals.io) {
            const populatedAttendance = await Attendance.findById(attendance._id)
                .populate('user', 'name email role')
                .populate('site', 'name');
            req.app.locals.io.emit('attendance_logged', populatedAttendance);
        }

        res.status(201).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Import attendance from CSV
// @route   POST /api/attendance/import
// @access  Private (Admin/Senior)
exports.importAttendance = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'Please upload a CSV file'
            });
        }

        const fs = require('fs');
        const User = require('../models/User');
        const Site = require('../models/Site');
        const { reverseGeocode } = require('../utils/geo');

        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const lines = fileContent.split(/\r?\n/);

        if (lines.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'CSV file is empty or missing data'
            });
        }

        // Robust CSV split regex
        const splitCsvRow = (line) => {
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            return matches ? matches.map(val => val.replace(/^"|"$/g, '').trim()) : line.split(',').map(v => v.trim());
        };

        const headers = splitCsvRow(lines[0]).map(h => h.toLowerCase());
        const dataLines = lines.slice(1).filter(line => line.trim() !== '');

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        const attendanceRecords = [];

        for (let i = 0; i < dataLines.length; i++) {
            const currentLine = splitCsvRow(dataLines[i]);
            const row = {};
            headers.forEach((header, index) => {
                row[header] = currentLine[index] || '';
            });

            try {
                if (!row.email) throw new Error('Email is missing');

                // Find User
                const user = await User.findOne({ email: row.email });
                if (!user) {
                    throw new Error(`User ${row.email} not found in SN Enviro database`);
                }

                const lat = parseFloat(row.latitude);
                const lng = parseFloat(row.longitude);

                if (isNaN(lat) || isNaN(lng)) {
                    throw new Error(`Invalid coordinates for ${row.email}`);
                }

                // Detect Role and Location
                let siteId = null;
                let locationName = row['location name'] || row['site name'];

                // If it's a site engineer and site name is provided, try to find site
                if (user.role === 'Site Engineer' || row['site name']) {
                    const site = await Site.findOne({ name: row['site name'] || row['location name'] });
                    if (site) {
                        siteId = site._id;
                        locationName = site.name;
                    }
                }

                // If location name still unknown, use Google Reverse Geocoding
                if (!locationName || locationName === 'Unknown' || locationName === 'Imported Location') {
                    locationName = await reverseGeocode(lat, lng);
                }

                attendanceRecords.push({
                    user: user._id,
                    site: siteId,
                    location: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    locationName: locationName,
                    selfieUrl: row['selfie url'] || null, // Optional for imports
                    status: row.status || 'Present',
                    timestamp: row.timestamp ? new Date(row.timestamp) : new Date(),
                    distanceFromSite: 0
                });

                results.success++;
            } catch (err) {
                results.failed++;
                results.errors.push(`Row ${i + 2}: ${err.message}`);
            }
        }

        if (attendanceRecords.length > 0) {
            await Attendance.insertMany(attendanceRecords);
        }

        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

        res.status(200).json({
            success: true,
            summary: results,
            message: `SN Enviro Attendance Import completed. Processed ${results.success} records for Site Engineers & Office Employees.`
        });
    } catch (error) {
        if (req.file && req.file.path) {
            const fs = require('fs');
            if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        }
        next(error);
    }
};

// @desc    Get current user's attendance records
// @route   GET /api/attendance/my
// @access  Private
exports.getMyAttendance = async (req, res, next) => {
    try {
        const attendance = await Attendance.find({ user: req.user.id })
            .sort('-timestamp')
            .limit(50);

        res.status(200).json({
            success: true,
            count: attendance.length,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all attendance records (Seniors/Admin only)
// @route   GET /api/attendance/reports
// @access  Private (Senior/Admin)
exports.getReports = async (req, res, next) => {
    try {
        const reports = await Attendance.find()
            .populate('user', 'name email')
            .populate('site', 'name')
            .sort('-timestamp');

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};
// @desc    Get all active live attendance records (MD Dashboard TV Map)
// @route   GET /api/attendance/tv-reports
// @access  Public
exports.getLiveReports = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reports = await Attendance.find({
            timestamp: { $gte: today },
            checkOut: { $exists: false }
        })
            .populate('user', 'name email role')
            .populate('site', 'name')
            .sort('-timestamp');

        res.status(200).json({
            success: true,
            count: reports.length,
            data: reports
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Check out attendance
// @route   PUT /api/attendance/checkout/:id
// @access  Private
exports.checkOutAttendance = async (req, res, next) => {
    try {
        let attendance = await Attendance.findById(req.params.id);

        if (!attendance) {
            return res.status(404).json({ success: false, error: 'Attendance record not found' });
        }

        // Make sure user owns the record
        if (attendance.user.toString() !== req.user.id && req.user.role !== 'Admin') {
            return res.status(401).json({ success: false, error: 'Not authorized' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ success: false, error: 'Already checked out for this session' });
        }

        const checkInTime = new Date(attendance.timestamp);
        const checkOutTime = new Date();
        const diffMs = checkOutTime - checkInTime;
        const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

        // OT logic: Activity after 6:00 PM (18:00)
        const sixPM = new Date(checkOutTime);
        sixPM.setHours(18, 0, 0, 0);

        let overtime = 0;
        if (checkOutTime > sixPM) {
            // Calculate time worked after 6 PM
            const startForOT = checkInTime > sixPM ? checkInTime : sixPM;
            const otMs = checkOutTime - startForOT;
            overtime = parseFloat((otMs / (1000 * 60 * 60)).toFixed(2));
        }

        attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            {
                checkOut: checkOutTime,
                totalHours: totalHours,
                overtime: overtime
            },
            {
                new: true,
                runValidators: true
            }
        ).populate('user', 'name email role').populate('site', 'name');

        // Real-time Push to Dashboard
        if (req.app.locals.io) {
            req.app.locals.io.emit('attendance_logged', attendance);
        }

        res.status(200).json({
            success: true,
            data: attendance
        });
    } catch (error) {
        next(error);
    }
};

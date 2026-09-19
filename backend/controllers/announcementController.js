const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Notification = require('../models/Notification');

const sendEmail = require('../utils/sendEmail');

// @desc    Create an announcement
// @route   POST /api/announcements
// @access  Admin/MD
exports.createAnnouncement = async (req, res) => {
    try {
        const { title, message, priority, audience, targetDepartments, targetSites, targetUsers, isPublished, expiryDate } = req.body;

        const announcement = await Announcement.create({
            title,
            message,
            sender: req.user.id,
            priority,
            audience,
            targetDepartments,
            targetSites,
            targetUsers,
            isPublished: true, // Always publish for demo
            expiryDate
        });

        // Generate notifications for targeted users immediately
        let userQuery = {};
        if (audience === 'Department') userQuery.department = { $in: targetDepartments };
        if (audience === 'Site') userQuery.site = { $in: targetSites };
        if (audience === 'Selected Employees') userQuery._id = { $in: targetUsers };
        
        const users = await User.find(userQuery).select('_id email');
        const notifications = users.map(u => ({
            user: u._id,
            title: `New Announcement: ${title}`,
            message: `You have a new ${priority} announcement from MD.`,
            type: 'MD Announcement',
            priority
        }));
        
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            // Real-time broadcast
            req.app.locals.io.emit('new_announcement', announcement);
            req.app.locals.io.emit('new_notifications');

            // Send actual emails and push notifications IN BACKGROUND (Fire and Forget)
            const webpush = require('web-push');
            
            setImmediate(() => {
                const blastNotifications = async () => {
                    for (const user of users) {
                        try {
                            // 1. Send Email
                            if (user.email) {
                                await sendEmail({
                                    email: user.email,
                                    subject: title,
                                    message: `<div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                        <h2 style="color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">${title}</h2>
                                        <p style="color: #475569; font-size: 16px;"><strong>MD has announced:</strong></p>
                                        <p style="color: #334155; font-size: 15px; line-height: 1.6; background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6;">${message.replace(/\n/g, '<br>')}</p>
                                        <p style="color: #475569; font-size: 16px; margin-top: 20px;">Open and see the details in the portal!</p>
                                        <a href="http://localhost:5173/" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Login to Portal</a>
                                        <hr style="margin-top: 30px; border: none; border-top: 1px solid #e2e8f0;">
                                        <small style="color: #94a3b8;">This is an automated announcement from SN Enviro System.</small>
                                    </div>`
                                });
                            }
                            
                            // 2. Send Web Push
                            const fullUser = await User.findById(user._id).select('pushSubscription');
                            if (fullUser && fullUser.pushSubscription) {
                                const payload = JSON.stringify({
                                    title: `MD Announcement: ${title}`,
                                    body: message.substring(0, 100) + '...',
                                    icon: '/vite.svg',
                                    url: '/'
                                });
                                await webpush.sendNotification(fullUser.pushSubscription, payload).catch(err => {
                                    if (err.statusCode === 410 || err.statusCode === 404) {
                                        // Subscription expired or invalid, remove it
                                        User.findByIdAndUpdate(user._id, { pushSubscription: null }).exec();
                                    } else {
                                        console.error('Push Notification Error:', err);
                                    }
                                });
                            }
                        } catch (err) {
                            console.error(`Failed to send announcement notification to ${user.email || user._id}`, err);
                        }
                    }
                };
                blastNotifications();
            });
        }

        res.status(201).json({ success: true, data: announcement });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all announcements (Admin view)
// @route   GET /api/announcements/admin
// @access  Admin/MD
exports.getAdminAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .populate('sender', 'name role')
            .sort({ createdAt: -1 });
        
        // Calculate read metrics
        const announcementsWithMetrics = await Promise.all(announcements.map(async (ann) => {
            let userQuery = {};
            if (ann.audience === 'Department') userQuery.department = { $in: ann.targetDepartments };
            if (ann.audience === 'Site') userQuery.site = { $in: ann.targetSites };
            if (ann.audience === 'Selected Employees') userQuery._id = { $in: ann.targetUsers };
            
            const totalRecipients = await User.countDocuments(userQuery);
            return {
                ...ann.toObject(),
                totalRecipients,
                readCount: ann.readBy.length
            };
        }));

        res.status(200).json({ success: true, data: announcementsWithMetrics });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get announcements for logged in user
// @route   GET /api/announcements
// @access  Private
exports.getUserAnnouncements = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Find announcements meant for this user
        const query = {
            isPublished: true,
            $or: [
                { audience: 'All Employees' },
                { audience: 'Department', targetDepartments: user.department },
                { audience: 'Site', targetSites: user.site },
                { audience: 'Selected Employees', targetUsers: req.user.id }
            ]
        };

        const announcements = await Announcement.find(query)
            .populate('sender', 'name role')
            .sort({ isPinned: -1, createdAt: -1 });

        res.status(200).json({ success: true, data: announcements });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Mark announcement as read
// @route   PUT /api/announcements/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });

        const alreadyRead = announcement.readBy.find(r => r.user.toString() === req.user.id);
        if (!alreadyRead) {
            announcement.readBy.push({ user: req.user.id });
            await announcement.save();
        }

        res.status(200).json({ success: true, data: announcement });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Admin/MD
exports.deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

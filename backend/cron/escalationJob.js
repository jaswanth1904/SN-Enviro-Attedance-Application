const cron = require('node-cron');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Explanation = require('../models/Explanation');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Daily at 10:45 AM
cron.schedule('45 10 * * *', async () => {
    console.log(`\x1b[36m%s\x1b[0m`, `[Cron] Running Escalation Check for Late Logins...`);
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // Find all active Service Engineers
        const engineers = await User.find({ role: 'Service Engineer' });

        for (const user of engineers) {
            const attendance = await Attendance.findOne({
                user: user._id,
                timestamp: { $gte: startOfDay, $lte: endOfDay }
            });

            // If no attendance, or logged in after 10:45 AM
            let needsEscalation = false;
            let reasonCode = '';

            if (!attendance) {
                needsEscalation = true;
                reasonCode = 'No Login Detected';
            } else {
                const loginTime = new Date(attendance.timestamp);
                if (loginTime.getHours() > 10 || (loginTime.getHours() === 10 && loginTime.getMinutes() >= 45)) {
                    needsEscalation = true;
                    reasonCode = 'Late Login (After 10:45 AM)';
                }
            }

            if (needsEscalation) {
                // Check if already escalated today
                const existing = await Explanation.findOne({
                    user: user._id,
                    date: { $gte: startOfDay, $lte: endOfDay }
                });

                if (!existing) {
                    const token = crypto.randomBytes(20).toString('hex');
                    
                    await Explanation.create({
                        user: user._id,
                        date: new Date(),
                        reason: reasonCode,
                        status: 'Pending Review',
                        token: token
                    });

                    // Real Email Transport
                    const explanationUrl = `http://localhost:5173/explain-absence/${token}`;
                    if (user.email) {
                        try {
                            const sendEmail = require('../utils/sendEmail');
                            await sendEmail({
                                email: user.email,
                                subject: 'ESCALATION: Late Check-In Alert',
                                message: `<div style="font-family: sans-serif; padding: 20px;">
                                    <h2>Late Check-In Escalation</h2>
                                    <p>Dear ${user.name},</p>
                                    <p>Our records indicate a late or missing check-in today.</p>
                                    <p><strong>Reason Code:</strong> ${reasonCode}</p>
                                    <p>Please click the link below to provide an explanation:</p>
                                    <a href="${explanationUrl}" style="display:inline-block; padding: 10px 20px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 5px;">Provide Explanation</a>
                                    <hr>
                                    <small>This is an automated escalation from the SN Enviro System.</small>
                                </div>`
                            });
                            console.log(`\x1b[32m%s\x1b[0m`, `[ESCALATION] 🚨 Real Auto-Warning sent to ${user.email}.`);
                        } catch (err) {
                            console.log(`\x1b[31m%s\x1b[0m`, `[ESCALATION FAILED] 🚨 Could not send email to ${user.email}. Check SMTP.`);
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.error('Escalation Cron Job Error:', err);
    }
});

console.log(`\x1b[35m%s\x1b[0m`, `⚙️ Escalation Engine initialized: Runs daily at 10:30 AM.`);

const nodemailer = require('nodemailer');

/**
 * Utility to send notifications (Email)
 */
const sendOfficerNotification = async (userData, siteData, attendanceData) => {
    try {
        const locationText = attendanceData.locationName || (siteData ? siteData.name : 'Remote Location');
        const subject = `🔔 Attendance Alert: ${userData.name}`;
        const message = `${userData.name} is online and present and located in ${locationText}.`;

        console.log('=================================');
        console.log(`NOTIFICATION: ${message}`);
        console.log('=================================');

        // Email Integration (Free using Gmail/SMTP)
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.DM_EMAIL || process.env.EMAIL_USER,
                subject: subject,
                text: `${message}\n\nTimestamp: ${attendanceData.timestamp}\nStatus: ${attendanceData.status}`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                        <h2 style="color: #2e7d32;">🔔 Attendance Alert</h2>
                        <p><strong>${userData.name}</strong> is online and present.</p>
                        <p><strong>Location:</strong> ${locationText}</p>
                        <p><strong>Time:</strong> ${attendanceData.timestamp}</p>
                        <hr>
                        <p style="font-size: 0.8em; color: #666;">This is an automated message from SN Enviro Entrance System.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('✅ Email Sent successfully to:', mailOptions.to);
        } else {
            console.log('⚠️ Email Skip: EMAIL_USER or EMAIL_PASS not configured in .env');
        }

        return true;
    } catch (error) {
        console.error('Notification Error:', error.message);
        return false;
    }
};

const sendDailyReport = async (presentUsers, absentUsers) => {
    try {
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        const subject = `📋 Daily Attendance Report: ${today}`;

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: process.env.DM_EMAIL || process.env.EMAIL_USER,
                subject: subject,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
                        <div style="background: #1a237e; color: #fff; padding: 15px; border-radius: 8px 8px 0 0;">
                            <h2 style="margin: 0;">📊 SN Enviro Daily Report</h2>
                            <p style="margin: 5px 0 0; opacity: 0.8;">Report Date: ${today}</p>
                        </div>
                        
                        <div style="padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
                            <div style="display: flex; gap: 20px; margin-bottom: 25px;">
                                <div style="flex: 1; padding: 15px; background: #e8f5e9; border-radius: 8px; text-align: center;">
                                    <h3 style="color: #2e7d32; margin: 0;">${presentUsers.length}</h3>
                                    <p style="margin: 0; font-size: 0.8em; font-weight: bold; color: #1b5e20;">PRESENT</p>
                                </div>
                                <div style="flex: 1; padding: 15px; background: #ffebee; border-radius: 8px; text-align: center;">
                                    <h3 style="color: #c62828; margin: 0;">${absentUsers.length}</h3>
                                    <p style="margin: 0; font-size: 0.8em; font-weight: bold; color: #b71c1c;">ABSENT</p>
                                </div>
                            </div>

                            <h4 style="color: #1a237e; border-bottom: 2px solid #f5f5f5; padding-bottom: 10px;">✅ Present List</h4>
                            <ul style="padding-left: 20px;">
                                ${presentUsers.map(u => `<li style="margin-bottom: 5px;"><strong>${u.name}</strong> <span style="color: #666; font-size: 0.9em;">(${u.role})</span></li>`).join('') || 'None'}
                            </ul>

                            <h4 style="color: #c62828; border-bottom: 2px solid #f5f5f5; padding-bottom: 10px; margin-top: 25px;">❌ Absent List</h4>
                            <ul style="padding-left: 20px; color: #666;">
                                ${absentUsers.map(u => `<li style="margin-bottom: 5px;">${u.name} <span style="font-size: 0.9em;">(${u.role})</span></li>`).join('') || 'All staff are present'}
                            </ul>

                            <hr style="border: none; border-top: 1px solid #f5f5f5; margin: 25px 0;">
                            <p style="font-size: 0.75em; color: #999; text-align: center;">
                                This is an automated system generated report sent daily at 11:30 AM.<br>
                                © 2026 SN Enviro Critical Systems
                            </p>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log('✅ Daily Report Email sent to DM');
        } else {
            console.log('⚠️ Report Skip: Email credentials not configured');
        }
        return true;
    } catch (error) {
        console.error('Daily Report Error:', error.message);
        return false;
    }
};

module.exports = {
    sendOfficerNotification,
    sendDailyReport
};

const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create reusable transporter object using the default SMTP transport
    const authUser = process.env.SMTP_EMAIL || process.env.EMAIL_USER || 'attendance@snenviro.in';
    const authPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS || 'qmti stui jjqb gbid';
    const fromEmail = process.env.FROM_EMAIL || 'attendance@snenviro.in';
    const fromName = process.env.FROM_NAME || 'SN Enviro Attendance Pvt Ltd';

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: authUser,
            pass: authPass
        }
    });

    const message = {
        from: `"${fromName}" <${fromEmail}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;

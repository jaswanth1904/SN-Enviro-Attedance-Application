const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL, // Must set in .env
            pass: process.env.SMTP_PASSWORD // Must set in .env (App Password)
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'Admin'} <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;

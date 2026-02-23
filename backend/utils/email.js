import nodemailer from 'nodemailer';

/**
 * Send Email using Nodemailer
 * For Gmail: You need to use an "App Password" if 2FA is enabled
 */
export const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Samvaad" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent: ${info.messageId}`);
        return { success: true, info };
    } catch (error) {
        console.error('❌ Email send failed:', error);
        return { success: false, error };
    }
};

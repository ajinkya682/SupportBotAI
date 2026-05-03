const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const sendEmail = async (options) => {
    try {
        let transporter;

        if (process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.REFRESH_TOKEN) {
            const oAuth2Client = new google.auth.OAuth2(
                process.env.CLIENT_ID,
                process.env.CLIENT_SECRET,
                'https://developers.google.com/oauthplayground'
            );

            oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });
            const accessToken = await oAuth2Client.getAccessToken();

            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL_USER,
                    clientId: process.env.CLIENT_ID,
                    clientSecret: process.env.CLIENT_SECRET,
                    refreshToken: process.env.REFRESH_TOKEN,
                    accessToken: accessToken.token,
                },
            });
        } else if (process.env.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        } else {
            throw new Error('Email credentials missing in .env');
        }

        const mailOptions = {
            from: `SupportBotAI <${process.env.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
        };

        const result = await transporter.sendMail(mailOptions);
        return result;
    } catch (error) {
        console.error("❌ Email Error:", error.message);
        // In development, don't crash the request so we can still use console-logged OTPs
        if (process.env.NODE_ENV !== 'production') {
            console.warn("⚠️ Continuing without sending email because NODE_ENV is development.");
            return { success: false, dev: true };
        }
        throw new Error('Email could not be sent. ' + error.message);
    }
};

module.exports = sendEmail;

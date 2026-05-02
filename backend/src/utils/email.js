import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import config from '../config/config.js';

/**
 * Email Service Utility
 * Optimized to handle both OAuth2 (Production) and App Passwords (Development).
 */

const sendEmail = async (options) => {
    try {
        let transporter;

        const isOauthConfigured = config.CLIENT_ID && config.CLIENT_SECRET && config.REFRESH_TOKEN;

        if (isOauthConfigured) {
            const oAuth2Client = new google.auth.OAuth2(
                config.CLIENT_ID,
                config.CLIENT_SECRET,
                'https://developers.google.com/oauthplayground'
            );

            oAuth2Client.setCredentials({ refresh_token: config.REFRESH_TOKEN });
            
            const { token } = await oAuth2Client.getAccessToken();

            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: config.EMAIL_USER,
                    clientId: config.CLIENT_ID,
                    clientSecret: config.CLIENT_SECRET,
                    refreshToken: config.REFRESH_TOKEN,
                    accessToken: token,
                },
            });
        } 
        else if (config.EMAIL_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.EMAIL_USER,
                    pass: config.EMAIL_PASS,
                },
            });
        } 
        else {
            throw new Error('No email credentials found. Please check your .env file.');
        }

        const mailOptions = {
            from: `SupportBotAI <${config.EMAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
        };

        await transporter.verify();
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return info;

    } catch (error) {
        console.error("Email Error:", error.message);
        
        if (error.message.includes('invalid_grant')) {
            console.error("TIP: Refresh Token expired. Regenerate it at https://developers.google.com/oauthplayground");
        }
        
        throw new Error('Email delivery failed: ' + error.message);
    }
};

export default sendEmail;
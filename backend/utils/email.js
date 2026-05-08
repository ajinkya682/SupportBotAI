const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const templates = {
    otp: (name, otp) => ({
        subject: 'Your Verification Code - SupportBotAI',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #6366f1; margin: 0; font-size: 28px;">SupportBotAI</h1>
                </div>
                <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Verify Your Identity</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello ${name},</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">We received a request to access your account. Please use the following verification code to proceed:</p>
                <div style="text-align: center; margin: 40px 0;">
                    <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6366f1; background: #f5f3ff; padding: 15px 30px; border-radius: 12px; border: 2px dashed #c7d2fe;">${otp}</span>
                </div>
                <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in 10 minutes for security reasons.</p>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">If you didn't request this, you can safely ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; ${new Date().getFullYear()} SupportBotAI. All rights reserved.</p>
            </div>
        `
    }),
    welcomeOwner: (name) => ({
        subject: 'Welcome to SupportBotAI - Your AI Support Journey Begins! 🚀',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #6366f1; margin: 0; font-size: 28px;">SupportBotAI</h1>
                </div>
                <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Welcome Aboard, ${name}!</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">We're thrilled to have you join SupportBotAI. You've just taken a massive step toward automating your customer support and providing 24/7 assistance to your visitors.</p>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 25px 0;">
                    <h3 style="color: #1e293b; margin-top: 0;">Next Steps to Success:</h3>
                    <ul style="color: #475569; padding-left: 20px;">
                        <li style="margin-bottom: 10px;"><b>Train your AI:</b> Upload your knowledge base or sync your website URL.</li>
                        <li style="margin-bottom: 10px;"><b>Customize Appearance:</b> Match the widget to your brand colors.</li>
                        <li style="margin-bottom: 10px;"><b>Install the Script:</b> Add our one-line code to your website.</li>
                        <li style="margin-bottom: 10px;"><b>Add Your Team:</b> Invite agents to handle complex queries.</li>
                    </ul>
                </div>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.FRONTEND_URL}/dashboard" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.4);">Go to Dashboard</a>
                </div>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">If you have any questions, our team is here to help you every step of the way.</p>
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; ${new Date().getFullYear()} SupportBotAI. Empowering Businesses with AI.</p>
            </div>
        `
    }),
    welcomeAgent: (name, ownerName, businessName, password) => ({
        subject: `You've been added as a Support Agent for ${businessName}! 🎧`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #6366f1; margin: 0; font-size: 28px;">SupportBotAI</h1>
                </div>
                <h2 style="color: #1e293b; text-align: center; margin-bottom: 20px;">Hello ${name},</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;"><b>${ownerName}</b> has invited you to join the support team for <b>${businessName}</b> on SupportBotAI.</p>
                
                <div style="background: #fdf2f2; padding: 20px; border-radius: 12px; margin: 25px 0; border: 1px solid #fee2e2;">
                    <h3 style="color: #991b1b; margin-top: 0;">Your Login Credentials:</h3>
                    <p style="color: #b91c1c; margin-bottom: 5px;"><b>Dashboard URL:</b> ${process.env.FRONTEND_URL}/login</p>
                    <p style="color: #b91c1c; margin-bottom: 5px;"><b>Email:</b> ${name} (Your registered email)</p>
                    <p style="color: #b91c1c; margin-bottom: 0;"><b>Temporary Password:</b> <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px;">${password}</code></p>
                </div>
                
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">Once you log in, you'll be able to handle live conversations when our AI agent escalates them. We recommend changing your password after your first login.</p>
                
                <div style="text-align: center; margin: 35px 0;">
                    <a href="${process.env.FRONTEND_URL}/login" style="background-color: #6366f1; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Login to Console</a>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">&copy; ${new Date().getFullYear()} SupportBotAI. Live Human Support Optimized.</p>
            </div>
        `
    })
};

const sendEmail = async (options) => {
    try {
        const { email, type, data } = options;
        let subject = options.subject;
        let html = options.html;

        // If a template type is provided, use it
        if (type && templates[type]) {
            const template = templates[type](...Object.values(data));
            subject = template.subject;
            html = template.html;
        }

        const { data: result, error } = await resend.emails.send({
            from: 'SupportBotAI <onboarding@resend.dev>', // Change to your verified domain in production
            to: email,
            subject: subject,
            html: html,
        });

        if (error) {
            throw new Error(error.message);
        }

        return { success: true, messageId: result.id };
    } catch (error) {
        console.error("❌ Resend Email Error:", error.message);
        
        // In development, we log but don't fail the request
        if (process.env.NODE_ENV !== 'production') {
            console.warn("⚠️ Email failed in dev, but continuing...");
            return { success: false, dev: true };
        }
        
        throw new Error('Email service unavailable. Please try again later.');
    }
};

module.exports = sendEmail;

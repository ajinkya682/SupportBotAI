import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import sendEmail from '../utils/email.js';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const client = new OAuth2Client(config.GOOGLE_CLIENT_ID);

const sendAuthResponse = (user, statusCode, res) => {
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
        expiresIn: config.JWT_EXPIRES_IN,
    });

    res.status(statusCode).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ownerId: user.ownerId,
        token,
    });
};

const resolveGoogleUser = async (idToken, accessToken) => {
    if (idToken) {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: config.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return { name: payload.name, email: payload.email, googleId: payload.sub };
    }
    if (accessToken) {
        const { data } = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
        );
        return { name: data.name, email: data.email, googleId: data.sub };
    }
    return null;
};

export const googleLogin = async (req, res) => {
    try {
        const { idToken, accessToken } = req.body;
        const profile = await resolveGoogleUser(idToken, accessToken);
        
        if (!profile) return res.status(400).json({ message: 'No token provided' });

        let user = await User.findOne({ email: profile.email });

        if (user) {
            if (!user.googleId) {
                user.googleId = profile.googleId;
                await user.save();
            }
        } else {
            user = await User.create({
                name: profile.name,
                email: profile.email,
                googleId: profile.googleId,
            });
        }

        // Set status for Support Agents specifically
        if (user.role === 'agent') {
            user.status = 'online';
            user.lastHeartbeat = new Date();
            await user.save();
        }

        sendAuthResponse(user, 200, res);
    } catch (error) {
        res.status(400).json({ message: 'Google authentication failed' });
    }
};

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        /* 
          * Use .lean() for faster lookup when we don't need a full Mongoose doc 
        */
        const userExists = await User.findOne({ email }).lean();
        
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password });

        sendAuthResponse(user, 201, res);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            if (user.role === 'agent') {
                user.status = 'online';
                user.lastHeartbeat = new Date();
                await user.save();
            }
            return sendAuthResponse(user, 200, res);
        }
        
        res.status(401).json({ message: 'Invalid email or password' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + OTP_EXPIRY_MS;
        await user.save();

        const html = buildOtpEmail(user.name, otp);
        await sendEmail({ email: user.email, subject: 'Password Reset OTP', html });

        res.json({ message: 'OTP sent to email' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to send OTP' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({
            email,
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });

        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const buildOtpEmail = (name, otp) => `
  <div style="font-family: sans-serif; max-width: 500px; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
    <h2 style="color: #6366f1;">Reset Password</h2>
    <p>Hi ${name}, use this code to reset your password:</p>
    <div style="font-size: 24px; font-weight: bold; background: #f3f4f6; padding: 10px; text-align: center;">${otp}</div>
    <p>Expires in 10 minutes.</p>
  </div>
`;

export const getUserProfile = (req, res) => res.json(req.user);

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').lean();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
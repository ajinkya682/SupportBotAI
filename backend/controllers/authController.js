const User = require('../models/User');
const Business = require('../models/Business');
const PlatformConfig = require('../models/PlatformConfig');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

const OTP_EXPIRY_MS = 10 * 60 * 1000;

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

const resolveGoogleUser = async (idToken, accessToken) => {
  if (idToken) {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return { name: payload.name, email: payload.email, googleId: payload.sub };
  }
  if (accessToken) {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    );
    return {
      name: response.data.name,
      email: response.data.email,
      googleId: response.data.sub,
    };
  }
  return null;
};

exports.googleLogin = async (req, res, next) => {
  const { idToken, accessToken, plan } = req.body;
  console.log("Google Login Request Received:", { hasIdToken: !!idToken, hasAccessToken: !!accessToken, plan });
  try {
    const profile = await resolveGoogleUser(idToken, accessToken);
    console.log("Resolved Google Profile:", profile);
    if (!profile) {
      return res.status(400).json({ message: 'No token provided' });
    }

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
      // Create business with selected plan
      const config = await PlatformConfig.findOne();
      const freeLimit = config ? config.freeConversationLimit : 100;
      const proLimit = config ? config.proConversationLimit : 999999;
      
      const selectedPlan = plan === 'pro' ? 'pro' : 'free';
      const apiKey = `sb_${crypto.randomBytes(16).toString('hex')}`;

      await Business.create({ 
        owner: user._id, 
        name: `${user.name}'s Business`,
        plan: selectedPlan,
        apiKey: apiKey,
        conversationLimit: selectedPlan === 'pro' ? proLimit : freeLimit
      });
    }

    if (user.role === 'agent') {
      user.status = 'online';
      user.lastHeartbeat = new Date();
      await user.save();
    }

    console.log("Google Login Success, returning user:", user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ownerId: user.ownerId,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(400).json({ message: 'Google authentication failed' });
  }
};

exports.registerUser = async (req, res, next) => {
  const { name, email, password, plan } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });
    
    // Create business with selected plan
    const config = await PlatformConfig.findOne();
    const freeLimit = config ? config.freeConversationLimit : 100;
    const proLimit = config ? config.proConversationLimit : 999999;
    
    const selectedPlan = plan === 'pro' ? 'pro' : 'free';
    const apiKey = `sb_${crypto.randomBytes(16).toString('hex')}`;

    await Business.create({ 
      owner: user._id, 
      name: `${user.name}'s Business`,
      plan: selectedPlan,
      apiKey: apiKey,
      conversationLimit: selectedPlan === 'pro' ? proLimit : freeLimit
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    // 1. Check if it's the Super Admin (Hardcoded in .env)
    if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'superadmin', email: process.env.SUPER_ADMIN_EMAIL, role: 'superadmin' },
        process.env.SUPER_ADMIN_JWT_SECRET,
        { expiresIn: '30d' }
      );
      return res.json({
        _id: 'superadmin',
        name: 'Super Admin',
        email: process.env.SUPER_ADMIN_EMAIL,
        role: 'superadmin',
        token: token
      });
    }

    // 2. Normal User/Agent Login
    const user = await User.findOne({ email });
    if (user && user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }
    if (user && (await user.comparePassword(password))) {
      if (user.role === 'agent') {
        user.status = 'online';
        user.lastHeartbeat = new Date();
        await user.save();
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ownerId: user.ownerId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserProfile = (req, res) => {
  res.json(req.user);
};

exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user && (await user.comparePassword(oldPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = Date.now() + OTP_EXPIRY_MS;
    await user.save();

    const html = buildOtpEmail(user.name, otp);
    await sendEmail({ email: user.email, subject: 'Password Reset OTP - SupportBotAI', html });

    res.json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

const buildOtpEmail = (name, otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
    <h2 style="color: #6366f1; text-align: center;">Reset Your Password</h2>
    <p>Hello ${name},</p>
    <p>We received a request to reset your password. Use the OTP below to proceed:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px 20px; border-radius: 8px;">${otp}</span>
    </div>
    <p>This code will expire in 10 minutes.</p>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;">
    <p style="font-size: 12px; color: #64748b; text-align: center;">Powered by SupportBotAI</p>
  </div>
`;

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired OTP' });
    res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

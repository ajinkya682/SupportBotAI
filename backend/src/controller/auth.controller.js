import User from '../models/User.model.js';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';


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

export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        /* 
        /* Use .lean() for faster lookup when we don't need a full Mongoose doc 
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

export const getUserProfile = (req, res) => res.json(req.user);

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').lean();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
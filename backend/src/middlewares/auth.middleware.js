import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token || token === 'undefined' || token === 'null') {
        return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password').lean();

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user no longer exists' });
        }

        next();
    } catch (error) {
        console.error(`Auth Error: ${error.message}`);
        res.status(401).json({ message: 'Not authorized, token expired or invalid' });
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Role (${req.user?.role}) is not authorized to access this resource` 
            });
        }
        next();
    };
};

export const admin = authorize('owner');
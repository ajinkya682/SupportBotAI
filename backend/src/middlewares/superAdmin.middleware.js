import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * Super Admin Guard
 * This middleware protects global platform settings.
 * It uses a dedicated secret to isolate platform control from tenant data.
 */
export const superAdminProtect = (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token || token === 'null' || token === 'undefined') {
            return res.status(401).json({ 
                success: false, 
                message: 'Access Denied: No platform token provided.' 
            });
        }

        const decoded = jwt.verify(token, config.SUPER_ADMIN_JWT_SECRET);

        if (decoded.role !== 'superadmin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Forbidden: You do not have platform-level permissions.' 
            });
        }

        req.superAdmin = decoded;
        next();

    } catch (error) {
        console.error('Super Admin Auth Error:', error.message);
        
        const message = error.name === 'TokenExpiredError' 
            ? 'Session expired. Please log in to the admin panel again.' 
            : 'Authentication failed: Invalid platform token.';

        res.status(401).json({ success: false, message });
    }
};
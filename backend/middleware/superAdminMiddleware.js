const jwt = require('jsonwebtoken');

const superAdminProtect = (req, res, next) => {
    try {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.SUPER_ADMIN_JWT_SECRET);
        
        if (decoded.role !== 'superadmin') {
            return res.status(403).json({ success: false, message: 'Not authorized as super admin' });
        }

        req.superAdmin = decoded;
        next();
    } catch (error) {
        console.error('Super admin auth error:', error);
        res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};

module.exports = { superAdminProtect };

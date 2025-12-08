const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { isTokenBlacklisted } = require('../controllers/auth.controller');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Check if token is blacklisted (logged out)
        if (isTokenBlacklisted(token)) {
            return res.status(401).json({
                success: false,
                message: 'Token has been invalidated. Please login again.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            include: [
                { model: Role, as: 'role' }
            ]
        });

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token or user deactivated.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired. Please login again.'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format.'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (!req.user.role || req.user.role.name !== 'Admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin access required.'
        });
    }

    next();
};

const managerMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required.'
        });
    }

    if (!req.user.role || !['Admin', 'Manager'].includes(req.user.role.name)) {
        return res.status(403).json({
            success: false,
            message: 'Manager access required.'
        });
    }

    next();
};

// Optional authentication - doesn't require login but attaches user if logged in
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return next(); // Continue without user
        }

        // Check if token is blacklisted
        if (isTokenBlacklisted(token)) {
            return next(); // Continue without user
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            include: [{ model: Role, as: 'role' }]
        });

        if (user && user.isActive) {
            req.user = user;
        }
        next();
    } catch (error) {
        // Continue without user on any error
        next();
    }
};

// Authorize specific roles
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.'
            });
        }

        if (!req.user.role || !roles.includes(req.user.role.name)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
        }

        next();
    };
};

module.exports = {
    authMiddleware,
    adminMiddleware,
    managerMiddleware,
    authenticate: authMiddleware,
    optionalAuth,
    authorize
};
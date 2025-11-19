/**
 * @swagger
 * tags:
 * name: Authentication
 * description: User registration, login, profile management, and password recovery
 */
const express = require('express');
const { body, validationResult } = require('express-validator');
const {
    register,
    login,
    forgotPassword,
    resetPassword,
    getProfile,
    updateProfile,
    changePassword
} = require('../controllers/auth.controller');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ... (Định nghĩa Validation middleware và handleValidationErrors không đổi) ...

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation errors',
            errors: errors.array()
        });
    }
    next();
};

/**
 * @swagger
 * /auth/register:
 * post:
 * summary: Register a new user
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - firstName
 * - lastName
 * - email
 * - password
 * properties:
 * firstName: { type: string, example: "John", minLength: 2 }
 * lastName: { type: string, example: "Doe", minLength: 2 }
 * email: { type: string, format: email, example: "john.doe@example.com" }
 * password: { type: string, format: password, example: "secure123", minLength: 6 }
 * phone: { type: string, example: "0901234567", optional: true }
 * responses:
 * 201:
 * description: User successfully registered
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "User registered successfully" }
 * user: { type: object }
 * 400:
 * description: Validation error or User already exists
 */
router.post('/register', validateRegistration, handleValidationErrors, register);

/**
 * @swagger
 * /auth/login:
 * post:
 * summary: User login
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * - password
 * properties:
 * email: { type: string, format: email, example: "john.doe@example.com" }
 * password: { type: string, format: password, example: "secure123" }
 * responses:
 * 200:
 * description: Login successful
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * token: { type: string, example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
 * user: { type: object }
 * 400:
 * description: Validation error
 * 401:
 * description: Invalid credentials
 */
router.post('/login', validateLogin, handleValidationErrors, login);

/**
 * @swagger
 * /auth/forgot-password:
 * post:
 * summary: Request a password reset link
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - email
 * properties:
 * email: { type: string, format: email, example: "john.doe@example.com" }
 * responses:
 * 200:
 * description: Password reset email sent (or request processed if user not found, for security)
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Password reset link sent to your email" }
 * 400:
 * description: Validation error
 */
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 * post:
 * summary: Reset password using a valid token
 * tags: [Authentication]
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - token
 * - newPassword
 * properties:
 * token: { type: string, example: "a2b4c6d8e0f1g3h5i7j9k1l3m5n7p9q1" }
 * newPassword: { type: string, format: password, example: "newsecure123", minLength: 6 }
 * responses:
 * 200:
 * description: Password successfully reset
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Password has been reset successfully" }
 * 400:
 * description: Validation error or Invalid/Expired token
 */
router.post('/reset-password', validateResetPassword, handleValidationErrors, resetPassword);

// --- Protected routes (Require Authentication) ---

/**
 * @swagger
 * /auth/profile:
 * get:
 * summary: Get the authenticated user's profile
 * tags: [Authentication]
 * security:
 * - bearerAuth: []
 * responses:
 * 200:
 * description: User profile data
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * user: { type: object }
 * 401:
 * description: Unauthorized (missing or invalid token)
 */
router.get('/profile', authMiddleware, getProfile);

/**
 * @swagger
 * /auth/profile:
 * put:
 * summary: Update the authenticated user's profile
 * tags: [Authentication]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * firstName: { type: string, example: "John Edited", minLength: 2, optional: true }
 * lastName: { type: string, example: "Doe Edited", minLength: 2, optional: true }
 * phone: { type: string, example: "0909876543", optional: true }
 * responses:
 * 200:
 * description: Profile successfully updated
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Profile updated successfully" }
 * user: { type: object }
 * 400:
 * description: Validation error
 * 401:
 * description: Unauthorized
 */
router.put('/profile', authMiddleware, validateProfileUpdate, handleValidationErrors, updateProfile);

/**
 * @swagger
 * /auth/change-password:
 * put:
 * summary: Change the authenticated user's password
 * tags: [Authentication]
 * security:
 * - bearerAuth: []
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * required:
 * - currentPassword
 * - newPassword
 * properties:
 * currentPassword: { type: string, format: password, example: "secure123" }
 * newPassword: { type: string, format: password, example: "newsecure123", minLength: 6 }
 * responses:
 * 200:
 * description: Password successfully changed
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "Password changed successfully" }
 * 400:
 * description: Validation error or Incorrect current password
 * 401:
 * description: Unauthorized
 */
router.put('/change-password', authMiddleware, validateChangePassword, handleValidationErrors, changePassword);

module.exports = router;
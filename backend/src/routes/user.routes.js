const express = require('express');
const { body, validationResult } = require('express-validator');
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    getRoles,
    getPositions
} = require('../controllers/user.controller');
const { authMiddleware, adminMiddleware, managerMiddleware } = require('../middleware/auth');
const { handleUploadError } = require('../middleware/upload');

const router = express.Router();

// Validation middleware
const validateUser = [
    body('firstName').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('roleId').optional().isInt({ min: 1 }).withMessage('Role ID must be a valid number'),
    body('positionId').optional().isInt({ min: 1 }).withMessage('Position ID must be a valid number')
];

const validateUserUpdate = [
    body('firstName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
    body('lastName').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
    body('roleId').optional().isInt({ min: 1 }).withMessage('Role ID must be a valid number'),
    body('positionId').optional().isInt({ min: 1 }).withMessage('Position ID must be a valid number'),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value')
];

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

// Public routes (for dropdown data)
/**
 * @swagger
 * /users/roles:
 * get:
 * summary: Get all available user roles
 * tags: [User Management]
 * responses:
 * 200:
 * description: A list of roles
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: integer, example: 1 }
 * name: { type: string, example: "Admin" }
 * 500:
 * description: Server error
 */
router.get('/roles', getRoles);

/**
 * @swagger
 * /users/positions:
 * get:
 * summary: Get all available user positions
 * tags: [User Management]
 * responses:
 * 200:
 * description: A list of positions
 * content:
 * application/json:
 * schema:
 * type: array
 * items:
 * type: object
 * properties:
 * id: { type: integer, example: 1 }
 * name: { type: string, example: "Software Engineer" }
 * 500:
 * description: Server error
 */
router.get('/positions', getPositions);
// Protected routes - require authentication
router.use(authMiddleware);

// Manager and Admin routes
/**
 * @swagger
 * /users:
 * get:
 * summary: Get a list of all users
 * tags: [User Management]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: query
 * name: page
 * schema: { type: integer, example: 1 }
 * description: Page number for pagination
 * - in: query
 * name: limit
 * schema: { type: integer, example: 10 }
 * description: Number of items per page
 * responses:
 * 200:
 * description: List of users retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * data:
 * type: array
 * items: { type: object }
 * pagination: { type: object }
 * 401:
 * description: Unauthorized (missing or invalid token)
 * 403:
 * description: Forbidden (Requires Manager or Admin role)
 */
router.get('/', managerMiddleware, getAllUsers);

/**
 * @swagger
 * /users/{id}:
 * get:
 * summary: Get user details by ID
 * tags: [User Management]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * description: ID of the user to get
 * responses:
 * 200:
 * description: User details retrieved successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * 401:
 * description: Unauthorized
 * 403:
 * description: Forbidden (Requires Manager or Admin role)
 * 404:
 * description: User not found
 */
router.get('/:id', managerMiddleware, getUserById);

// --- Admin Only Routes ---

/**
 * @swagger
 * /users:
 * post:
 * summary: Create a new user account
 * tags: [User Management]
 * security:
 * - bearerAuth: []
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
 * firstName: { type: string, example: "Jane", minLength: 2 }
 * lastName: { type: string, example: "Smith", minLength: 2 }
 * email: { type: string, format: email, example: "jane.smith@example.com" }
 * password: { type: string, format: password, example: "P@ssword123", minLength: 6 }
 * phone: { type: string, example: "0901234567", optional: true }
 * roleId: { type: integer, example: 2, description: "ID of the role (e.g., Manager)" }
 * positionId: { type: integer, example: 5, description: "ID of the position" }
 * responses:
 * 201:
 * description: User created successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "User created successfully" }
 * user: { type: object }
 * 400:
 * description: Validation error or Email already exists
 * 403:
 * description: Forbidden (Requires Admin role)
 */
router.post('/', adminMiddleware, handleUploadError, validateUser, handleValidationErrors, createUser);

/**
 * @swagger
 * /users/{id}:
 * put:
 * summary: Update an existing user's details
 * tags: [User Management]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * description: ID of the user to update
 * requestBody:
 * required: true
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * firstName: { type: string, example: "Jane Updated", optional: true }
 * lastName: { type: string, example: "Smith Updated", optional: true }
 * email: { type: string, format: email, example: "jane.updated@example.com", optional: true }
 * phone: { type: string, example: "0909876543", optional: true }
 * roleId: { type: integer, example: 3, optional: true }
 * positionId: { type: integer, example: 6, optional: true }
 * isActive: { type: boolean, example: true, optional: true }
 * responses:
 * 200:
 * description: User updated successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "User updated successfully" }
 * user: { type: object }
 * 400:
 * description: Validation error
 * 403:
 * description: Forbidden (Requires Admin role)
 * 404:
 * description: User not found
 */
router.put('/:id', adminMiddleware, handleUploadError, validateUserUpdate, handleValidationErrors, updateUser);

/**
 * @swagger
 * /users/{id}:
 * delete:
 * summary: Delete a user account
 * tags: [User Management]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * description: ID of the user to delete
 * responses:
 * 204:
 * description: User deleted successfully (No Content)
 * 401:
 * description: Unauthorized
 * 403:
 * description: Forbidden (Requires Admin role)
 * 404:
 * description: User not found
 */
router.delete('/:id', adminMiddleware, deleteUser);

/**
 * @swagger
 * /users/{id}/toggle-status:
 * patch:
 * summary: Toggle the active status of a user (activate/deactivate)
 * tags: [User Management]
 * security:
 * - bearerAuth: []
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema: { type: integer }
 * description: ID of the user to update
 * responses:
 * 200:
 * description: User status toggled successfully
 * content:
 * application/json:
 * schema:
 * type: object
 * properties:
 * message: { type: string, example: "User status toggled to inactive" }
 * user: { type: object }
 * 401:
 * description: Unauthorized
 * 403:
 * description: Forbidden (Requires Admin role)
 * 404:
 * description: User not found
 */
router.patch('/:id/toggle-status', adminMiddleware, toggleUserStatus);

module.exports = router;
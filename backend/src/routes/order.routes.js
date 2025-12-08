const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');

// Public routes
router.post('/', optionalAuth, orderController.createOrder); // Allow guest checkout
router.get('/track/:code', orderController.getOrderByCode); // Track order by code

// Protected routes (logged in users)
router.get('/my-orders', authenticate, orderController.getMyOrders);
router.post('/:id/cancel', authenticate, orderController.cancelOrder);

// Admin/Manager routes
router.get('/', authenticate, authorize('Admin', 'Manager'), orderController.getOrders);
router.get('/stats', authenticate, authorize('Admin', 'Manager'), orderController.getOrderStats);
router.get('/:id', authenticate, authorize('Admin', 'Manager'), orderController.getOrderById);
router.patch('/:id/status', authenticate, authorize('Admin', 'Manager'), orderController.updateOrderStatus);

module.exports = router;

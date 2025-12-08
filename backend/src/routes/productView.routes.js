const express = require('express');
const router = express.Router();
const productViewController = require('../controllers/productView.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Record a view (public - works for both logged in and anonymous users)
router.post('/:productId', optionalAuth, productViewController.recordView);

// Get view count (public)
router.get('/count/:productId', productViewController.getViewCount);

// Get recently viewed products (works for both logged in and anonymous)
router.get('/recent', optionalAuth, productViewController.getRecentlyViewed);

// Clear view history (requires auth)
router.delete('/history', authenticate, productViewController.clearViewHistory);

module.exports = router;

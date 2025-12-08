const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { authenticate } = require('../middleware/auth');

// All wishlist routes require authentication
router.use(authenticate);

// Get user's wishlist
router.get('/', wishlistController.getWishlist);

// Add to wishlist
router.post('/', wishlistController.addToWishlist);

// Toggle wishlist (add/remove)
router.post('/toggle/:productId', wishlistController.toggleWishlist);

// Check if product is in wishlist
router.get('/check/:productId', wishlistController.checkWishlist);

// Remove from wishlist
router.delete('/:productId', wishlistController.removeFromWishlist);

module.exports = router;

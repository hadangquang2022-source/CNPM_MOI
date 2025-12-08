const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Get reviews for a product (public)
router.get('/product/:productId', reviewController.getProductReviews);

// Get review count for product (public)
router.get('/count/:productId', reviewController.getReviewCount);

// Mark review as helpful (public)
router.post('/:id/helpful', reviewController.markHelpful);

// Protected routes
router.use(authenticate);

// Create a review
router.post('/', reviewController.createReview);

// Get user's review for a product
router.get('/my-review/:productId', reviewController.getUserReview);

// Update a review
router.put('/:id', reviewController.updateReview);

// Delete a review
router.delete('/:id', reviewController.deleteReview);

module.exports = router;

const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');

// Lazy loading / pagination
router.get('/category/:category?', ProductController.getProductsByCategory);

module.exports = router;

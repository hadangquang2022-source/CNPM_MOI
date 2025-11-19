const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

// API phân trang theo category
router.get('/category/:category', productController.getProductsByCategory);

// API lấy tất cả sản phẩm (active) phân trang
router.get('/all', productController.getAllProducts);

module.exports = router;

const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateProduct = [
    body('productName')
        .trim()
        .notEmpty().withMessage('Tên sản phẩm là bắt buộc')
        .isLength({ min: 2, max: 150 }).withMessage('Tên sản phẩm từ 2-150 ký tự'),
    body('sku')
        .trim()
        .notEmpty().withMessage('SKU là bắt buộc')
        .isLength({ max: 100 }).withMessage('SKU tối đa 100 ký tự'),
    body('price')
        .optional({ nullable: true })
        .isFloat({ min: 0 }).withMessage('Giá phải là số dương'),
    body('stockQuantity')
        .optional()
        .isInt({ min: 0 }).withMessage('Số lượng phải là số nguyên dương'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: errors.array()
            });
        }
        next();
    }
];

// Public routes
// API lấy tất cả sản phẩm (active) phân trang
router.get('/', productController.getAllProducts);

// API lấy danh sách categories
router.get('/categories', productController.getCategories);

// API phân trang theo category
router.get('/category/:category', productController.getProductsByCategory);

// API lấy chi tiết sản phẩm
router.get('/:id', productController.getProductById);

// API lấy sản phẩm tương tự
router.get('/:id/similar', productController.getSimilarProducts);

// API lấy thống kê sản phẩm (số người mua, đánh giá, yêu thích)
router.get('/:id/stats', productController.getProductStats);

// Protected routes (requires authentication)
// API tạo sản phẩm mới
router.post('/', authMiddleware, validateProduct, productController.createProduct);

// API cập nhật sản phẩm
router.put('/:id', authMiddleware, productController.updateProduct);

// API xóa sản phẩm
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;

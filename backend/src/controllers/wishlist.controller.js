const { Wishlist, Product, User } = require('../models');
const { Op } = require('sequelize');

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findAll({
            where: { userId: req.user.id },
            include: [{
                model: Product,
                as: 'product',
                attributes: ['id', 'productName', 'sku', 'price', 'category', 'stockQuantity', 'isActive']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: wishlist
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi lấy danh sách yêu thích', 
            error: error.message 
        });
    }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Check if already in wishlist
        const existing = await Wishlist.findOne({
            where: {
                userId: req.user.id,
                productId
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm đã có trong danh sách yêu thích'
            });
        }

        const wishlistItem = await Wishlist.create({
            userId: req.user.id,
            productId
        });

        const result = await Wishlist.findByPk(wishlistItem.id, {
            include: [{
                model: Product,
                as: 'product'
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Đã thêm vào danh sách yêu thích',
            data: result
        });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi thêm vào danh sách yêu thích', 
            error: error.message 
        });
    }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const deleted = await Wishlist.destroy({
            where: {
                userId: req.user.id,
                productId
            }
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không có trong danh sách yêu thích'
            });
        }

        res.json({
            success: true,
            message: 'Đã xóa khỏi danh sách yêu thích'
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi xóa khỏi danh sách yêu thích', 
            error: error.message 
        });
    }
};

// Check if product is in wishlist
const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        const exists = await Wishlist.findOne({
            where: {
                userId: req.user.id,
                productId
            }
        });

        res.json({
            success: true,
            data: { isInWishlist: !!exists }
        });
    } catch (error) {
        console.error('Check wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi kiểm tra danh sách yêu thích', 
            error: error.message 
        });
    }
};

// Toggle wishlist (add if not exists, remove if exists)
const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        const existing = await Wishlist.findOne({
            where: {
                userId: req.user.id,
                productId
            }
        });

        if (existing) {
            await existing.destroy();
            return res.json({
                success: true,
                message: 'Đã xóa khỏi danh sách yêu thích',
                data: { isInWishlist: false }
            });
        } else {
            await Wishlist.create({
                userId: req.user.id,
                productId
            });
            return res.json({
                success: true,
                message: 'Đã thêm vào danh sách yêu thích',
                data: { isInWishlist: true }
            });
        }
    } catch (error) {
        console.error('Toggle wishlist error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi cập nhật danh sách yêu thích', 
            error: error.message 
        });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
    toggleWishlist
};

const { ProductView, Product, User } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const { sequelize } = require('../config/database');

// Record a product view
const recordView = async (req, res) => {
    try {
        const { productId } = req.params;
        const sessionId = req.headers['x-session-id'] || req.ip;
        const userId = req.user?.id || null;

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Avoid duplicate views within 30 minutes from same user/session
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const recentView = await ProductView.findOne({
            where: {
                productId,
                [Op.or]: [
                    { userId: userId, userId: { [Op.ne]: null } },
                    { sessionId: sessionId, userId: null }
                ],
                viewedAt: { [Op.gte]: thirtyMinutesAgo }
            }
        });

        if (recentView) {
            // Update viewedAt instead of creating new
            await recentView.update({ viewedAt: new Date() });
            return res.json({
                success: true,
                message: 'View updated',
                data: recentView
            });
        }

        // Create new view record
        const view = await ProductView.create({
            userId,
            productId,
            sessionId: userId ? null : sessionId,
            viewedAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'View recorded',
            data: view
        });
    } catch (error) {
        console.error('Record view error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi ghi nhận lượt xem', 
            error: error.message 
        });
    }
};

// Get recently viewed products for a user
const getRecentlyViewed = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const sessionId = req.headers['x-session-id'] || req.ip;
        const userId = req.user?.id || null;

        let whereClause;
        if (userId) {
            whereClause = { userId };
        } else {
            whereClause = { sessionId, userId: null };
        }

        // Get distinct products, ordered by most recent view
        const views = await ProductView.findAll({
            where: whereClause,
            include: [{
                model: Product,
                as: 'product',
                where: { isActive: true },
                attributes: ['id', 'productName', 'sku', 'price', 'category', 'stockQuantity']
            }],
            order: [['viewedAt', 'DESC']],
            limit: limit * 2 // Get more to account for duplicates
        });

        // Remove duplicates, keep most recent
        const seen = new Set();
        const uniqueViews = views.filter(view => {
            if (seen.has(view.productId)) return false;
            seen.add(view.productId);
            return true;
        }).slice(0, limit);

        res.json({
            success: true,
            data: uniqueViews
        });
    } catch (error) {
        console.error('Get recently viewed error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi lấy sản phẩm đã xem', 
            error: error.message 
        });
    }
};

// Get view count for a product
const getViewCount = async (req, res) => {
    try {
        const { productId } = req.params;

        const count = await ProductView.count({
            where: { productId }
        });

        // Get unique viewers count
        const uniqueViewers = await ProductView.count({
            where: { productId },
            distinct: true,
            col: 'userId'
        });

        res.json({
            success: true,
            data: {
                totalViews: count,
                uniqueViewers
            }
        });
    } catch (error) {
        console.error('Get view count error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi lấy số lượt xem', 
            error: error.message 
        });
    }
};

// Clear view history for a user
const clearViewHistory = async (req, res) => {
    try {
        const userId = req.user.id;

        await ProductView.destroy({
            where: { userId }
        });

        res.json({
            success: true,
            message: 'Đã xóa lịch sử xem'
        });
    } catch (error) {
        console.error('Clear view history error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi xóa lịch sử xem', 
            error: error.message 
        });
    }
};

module.exports = {
    recordView,
    getRecentlyViewed,
    getViewCount,
    clearViewHistory
};

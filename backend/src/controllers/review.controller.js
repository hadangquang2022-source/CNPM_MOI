const { ProductReview, Product, User, Order, OrderItem } = require('../models');
const { Op, fn, col } = require('sequelize');
const { sequelize } = require('../config/database');

// Get reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder || 'DESC';

        const { count, rows: reviews } = await ProductReview.findAndCountAll({
            where: {
                productId,
                isApproved: true
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'fullName', 'avatar']
            }],
            order: [[sortBy, sortOrder]],
            limit,
            offset
        });

        // Get rating statistics
        const stats = await ProductReview.findOne({
            where: { productId, isApproved: true },
            attributes: [
                [fn('AVG', col('rating')), 'averageRating'],
                [fn('COUNT', col('id')), 'totalReviews']
            ],
            raw: true
        });

        // Get rating distribution
        const distribution = await ProductReview.findAll({
            where: { productId, isApproved: true },
            attributes: [
                'rating',
                [fn('COUNT', col('rating')), 'count']
            ],
            group: ['rating'],
            raw: true
        });

        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        distribution.forEach(d => {
            ratingDistribution[d.rating] = parseInt(d.count);
        });

        res.json({
            success: true,
            data: {
                reviews,
                stats: {
                    averageRating: parseFloat(stats?.averageRating) || 0,
                    totalReviews: parseInt(stats?.totalReviews) || 0,
                    ratingDistribution
                },
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: limit
                }
            }
        });
    } catch (error) {
        console.error('Get product reviews error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi lấy đánh giá sản phẩm', 
            error: error.message 
        });
    }
};

// Create a review
const createReview = async (req, res) => {
    try {
        const { productId, rating, title, comment, orderId } = req.body;
        const userId = req.user.id;

        // Check if product exists
        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        // Check if user already reviewed this product
        const existingReview = await ProductReview.findOne({
            where: { userId, productId }
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'Bạn đã đánh giá sản phẩm này rồi'
            });
        }

        // Check if this is a verified purchase
        let isVerifiedPurchase = false;
        if (orderId) {
            const orderItem = await OrderItem.findOne({
                include: [{
                    model: Order,
                    as: 'order',
                    where: { 
                        id: orderId,
                        userId,
                        status: 'delivered'
                    }
                }],
                where: { productId }
            });
            isVerifiedPurchase = !!orderItem;
        } else {
            // Check if user ever purchased this product
            const purchasedItem = await OrderItem.findOne({
                include: [{
                    model: Order,
                    as: 'order',
                    where: { 
                        userId,
                        status: 'delivered'
                    }
                }],
                where: { productId }
            });
            isVerifiedPurchase = !!purchasedItem;
        }

        const review = await ProductReview.create({
            userId,
            productId,
            orderId,
            rating,
            title,
            comment,
            isVerifiedPurchase
        });

        const result = await ProductReview.findByPk(review.id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'fullName', 'avatar']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Đánh giá đã được gửi thành công',
            data: result
        });
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi gửi đánh giá', 
            error: error.message 
        });
    }
};

// Update a review
const updateReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, comment } = req.body;
        const userId = req.user.id;

        const review = await ProductReview.findOne({
            where: { id, userId }
        });

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        await review.update({ rating, title, comment });

        const result = await ProductReview.findByPk(id, {
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'fullName', 'avatar']
            }]
        });

        res.json({
            success: true,
            message: 'Đánh giá đã được cập nhật',
            data: result
        });
    } catch (error) {
        console.error('Update review error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi cập nhật đánh giá', 
            error: error.message 
        });
    }
};

// Delete a review
const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role?.name;

        let whereClause = { id };
        // Only allow user to delete their own review unless admin
        if (userRole !== 'admin') {
            whereClause.userId = userId;
        }

        const deleted = await ProductReview.destroy({ where: whereClause });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        res.json({
            success: true,
            message: 'Đánh giá đã được xóa'
        });
    } catch (error) {
        console.error('Delete review error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi xóa đánh giá', 
            error: error.message 
        });
    }
};

// Get user's review for a product
const getUserReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const review = await ProductReview.findOne({
            where: { userId, productId },
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'fullName', 'avatar']
            }]
        });

        res.json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error('Get user review error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi lấy đánh giá', 
            error: error.message 
        });
    }
};

// Get review count for product (public)
const getReviewCount = async (req, res) => {
    try {
        const { productId } = req.params;

        const count = await ProductReview.count({
            where: { productId, isApproved: true }
        });

        const avgRating = await ProductReview.findOne({
            where: { productId, isApproved: true },
            attributes: [[fn('AVG', col('rating')), 'averageRating']],
            raw: true
        });

        res.json({
            success: true,
            data: {
                totalReviews: count,
                averageRating: parseFloat(avgRating?.averageRating) || 0
            }
        });
    } catch (error) {
        console.error('Get review count error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi lấy số đánh giá', 
            error: error.message 
        });
    }
};

// Mark review as helpful
const markHelpful = async (req, res) => {
    try {
        const { id } = req.params;

        const review = await ProductReview.findByPk(id);
        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đánh giá'
            });
        }

        await review.increment('helpfulCount');

        res.json({
            success: true,
            message: 'Cảm ơn phản hồi của bạn',
            data: { helpfulCount: review.helpfulCount + 1 }
        });
    } catch (error) {
        console.error('Mark helpful error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi khi đánh dấu hữu ích', 
            error: error.message 
        });
    }
};

module.exports = {
    getProductReviews,
    createReview,
    updateReview,
    deleteReview,
    getUserReview,
    getReviewCount,
    markHelpful
};

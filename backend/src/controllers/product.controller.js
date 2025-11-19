const Product = require('../models/Product');
const { Op } = require('sequelize');

// Lấy danh sách sản phẩm theo category + phân trang
exports.getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;  

        const offset = (page - 1) * limit;

        const whereCondition = {
            isActive: true,
        };

        // Nếu có category thì filter theo category, không có thì lấy tất cả
        if (category && category !== 'all') {
            whereCondition.category = category;
        }

        const { count, rows } = await Product.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });

        return res.json({
            message: 'Products fetched successfully',
            data: rows,
            pagination: {
                total: count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                hasMore: offset + rows.length < count,
            }
        });

    } catch (error) {
        console.error('Get products error:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};

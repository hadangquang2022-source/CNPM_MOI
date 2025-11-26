const Product = require('../models/Product');
const { Op, literal, fn, col } = require('sequelize');
const { sequelize } = require('../config/database');

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productName
 *               - sku
 *             properties:
 *               productName:
 *                 type: string
 *                 example: "iPhone 15 Pro"
 *               sku:
 *                 type: string
 *                 example: "IP15PRO-256"
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 example: "Electronics"
 *               price:
 *                 type: number
 *                 example: 999.99
 *               stockQuantity:
 *                 type: integer
 *                 example: 100
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error or SKU already exists
 */
exports.createProduct = async (req, res) => {
    try {
        const { productName, sku, description, category, price, stockQuantity } = req.body;

        // Validate required fields
        if (!productName || !sku) {
            return res.status(400).json({
                success: false,
                message: 'Tên sản phẩm và SKU là bắt buộc'
            });
        }

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ where: { sku } });
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Mã SKU đã tồn tại'
            });
        }

        // Create product
        const product = await Product.create({
            productName,
            sku,
            description: description || null,
            category: category || null,
            price: price || null,
            stockQuantity: stockQuantity || 0,
            isActive: true
        });

        return res.status(201).json({
            success: true,
            message: 'Tạo sản phẩm thành công',
            data: product
        });

    } catch (error) {
        console.error('Create product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        return res.json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error('Get product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *               sku:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               stockQuantity:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { productName, sku, description, category, price, stockQuantity, isActive } = req.body;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Check if SKU already exists (if changing SKU)
        if (sku && sku !== product.sku) {
            const existingProduct = await Product.findOne({ where: { sku } });
            if (existingProduct) {
                return res.status(400).json({
                    success: false,
                    message: 'Mã SKU đã tồn tại'
                });
            }
        }

        // Update fields
        if (productName !== undefined) product.productName = productName;
        if (sku !== undefined) product.sku = sku;
        if (description !== undefined) product.description = description;
        if (category !== undefined) product.category = category;
        if (price !== undefined) product.price = price;
        if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
        if (isActive !== undefined) product.isActive = isActive;

        await product.save();

        return res.json({
            success: true,
            message: 'Cập nhật sản phẩm thành công',
            data: product
        });

    } catch (error) {
        console.error('Update product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product (soft delete)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy sản phẩm'
            });
        }

        // Soft delete - set isActive to false
        product.isActive = false;
        await product.save();

        return res.json({
            success: true,
            message: 'Xóa sản phẩm thành công'
        });

    } catch (error) {
        console.error('Delete product error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Get all unique categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of categories
 */
exports.getCategories = async (req, res) => {
    try {
        const categories = await Product.findAll({
            attributes: ['category'],
            where: {
                category: { [Op.ne]: null },
                isActive: true
            },
            group: ['category'],
            order: [['category', 'ASC']]
        });

        const categoryList = categories.map(c => c.category).filter(Boolean);

        return res.json({
            success: true,
            data: categoryList
        });

    } catch (error) {
        console.error('Get categories error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server',
            error: error.message
        });
    }
};

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
        return res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Lấy tất cả sản phẩm (active) theo phân trang với Full-text search
exports.getAllProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category } = req.query;  
        const offset = (page - 1) * limit;

        let whereCondition = { isActive: true };
        let order = [['createdAt', 'DESC']];
        let attributes = { include: [] };

        // Full-text search hoặc LIKE search
        if (search && search.trim()) {
            const searchTerm = search.trim();
            
            // Escape special characters for FULLTEXT search
            const escapedSearch = searchTerm.replace(/[+\-><()~*\"@]/g, ' ').trim();
            
            if (escapedSearch.length >= 2) {
                // Sử dụng Full-text search với NATURAL LANGUAGE MODE
                // Thêm relevance score để sắp xếp theo độ phù hợp
                attributes.include.push([
                    literal(`MATCH(product_name, description, sku) AGAINST('${escapedSearch}' IN NATURAL LANGUAGE MODE)`),
                    'relevance'
                ]);

                // Full-text search condition với fallback LIKE
                whereCondition[Op.or] = [
                    literal(`MATCH(product_name, description, sku) AGAINST('${escapedSearch}' IN NATURAL LANGUAGE MODE)`),
                    { productName: { [Op.like]: `%${searchTerm}%` } },
                    { sku: { [Op.like]: `%${searchTerm}%` } },
                    { description: { [Op.like]: `%${searchTerm}%` } }
                ];

                // Sắp xếp theo relevance score
                order = [[literal('relevance'), 'DESC'], ['createdAt', 'DESC']];
            } else {
                // Nếu search term quá ngắn, dùng LIKE search
                whereCondition[Op.or] = [
                    { productName: { [Op.like]: `%${searchTerm}%` } },
                    { sku: { [Op.like]: `%${searchTerm}%` } }
                ];
            }
        }

        // Filter by category
        if (category && category !== 'all') {
            whereCondition.category = category;
        }

        const { count, rows } = await Product.findAndCountAll({
            where: whereCondition,
            attributes,
            limit: parseInt(limit),
            offset,
            order
        });

        // Remove relevance from response data
        const products = rows.map(product => {
            const p = product.toJSON();
            delete p.relevance;
            return p;
        });

        return res.json({
            success: true,
            message: 'All products fetched successfully',
            data: products,
            pagination: {
                total: count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                hasMore: offset + rows.length < count,
            }
        });

    } catch (error) {
        console.error('Get all products error:', error);
        
        // Fallback nếu FULLTEXT index chưa được tạo
        if (error.message && (error.message.includes('FULLTEXT') || error.message.includes('MATCH'))) {
            return await exports.getAllProductsFallback(req, res);
        }
        
        return res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

// Fallback search khi FULLTEXT chưa sẵn sàng
exports.getAllProductsFallback = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, category } = req.query;  
        const offset = (page - 1) * limit;

        const whereCondition = { isActive: true };

        if (search && search.trim()) {
            whereCondition[Op.or] = [
                { productName: { [Op.like]: `%${search}%` } },
                { sku: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

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
            success: true,
            message: 'All products fetched successfully',
            data: rows,
            pagination: {
                total: count,
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                hasMore: offset + rows.length < count,
            }
        });

    } catch (error) {
        console.error('Get all products fallback error:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

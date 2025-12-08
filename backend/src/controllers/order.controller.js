const { Op } = require('sequelize');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Product = require('../models/Product');
const User = require('../models/User');
const { sequelize } = require('../config/database');

// Create new order
const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            shippingCity,
            shippingDistrict,
            shippingWard,
            paymentMethod,
            note,
            items // Array of { productId, quantity }
        } = req.body;

        // Validate required fields
        if (!customerName || !customerEmail || !customerPhone || !shippingAddress || !shippingCity || !shippingDistrict) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ thông tin giao hàng'
            });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Giỏ hàng trống'
            });
        }

        // Calculate order totals and validate products
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findByPk(item.productId, { transaction });
            
            if (!product) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm với ID ${item.productId} không tồn tại`
                });
            }

            if (product.stockQuantity < item.quantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Sản phẩm "${product.productName}" không đủ số lượng trong kho`
                });
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
                productId: product.id,
                productName: product.productName,
                productSku: product.sku,
                price: product.price,
                quantity: item.quantity,
                totalPrice: itemTotal
            });

            // Update stock
            await product.update({
                stockQuantity: product.stockQuantity - item.quantity
            }, { transaction });
        }

        // Calculate shipping fee (free if > 500,000)
        const shippingFee = subtotal > 500000 ? 0 : 30000;
        const totalAmount = subtotal + shippingFee;

        // Generate order code
        const orderCode = Order.generateOrderCode();

        // Create order
        const order = await Order.create({
            orderCode,
            userId: req.user?.id || null,
            customerName,
            customerEmail,
            customerPhone,
            shippingAddress,
            shippingCity,
            shippingDistrict,
            shippingWard: shippingWard || '',
            subtotal,
            shippingFee,
            totalAmount,
            paymentMethod: paymentMethod || 'cod',
            note: note || '',
            status: 'pending',
            paymentStatus: 'pending'
        }, { transaction });

        // Create order items
        for (const item of orderItems) {
            await OrderItem.create({
                orderId: order.id,
                ...item
            }, { transaction });
        }

        await transaction.commit();

        // Fetch complete order with items
        const completeOrder = await Order.findByPk(order.id, {
            include: [{
                model: OrderItem,
                as: 'items'
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Đặt hàng thành công',
            data: { order: completeOrder }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tạo đơn hàng',
            error: error.message
        });
    }
};

// Get all orders (Admin/Manager)
const getOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            status,
            paymentStatus,
            search,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = 'DESC'
        } = req.query;

        const offset = (page - 1) * limit;
        const where = {};

        if (status) {
            where.status = status;
        }

        if (paymentStatus) {
            where.paymentStatus = paymentStatus;
        }

        if (search) {
            where[Op.or] = [
                { orderCode: { [Op.like]: `%${search}%` } },
                { customerName: { [Op.like]: `%${search}%` } },
                { customerEmail: { [Op.like]: `%${search}%` } },
                { customerPhone: { [Op.like]: `%${search}%` } }
            ];
        }

        if (startDate && endDate) {
            where.createdAt = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ],
            order: [[sortBy, sortOrder]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đơn hàng',
            error: error.message
        });
    }
};

// Get order by ID
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: 'items'
                },
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }
            ]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        res.json({
            success: true,
            data: { order }
        });

    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thông tin đơn hàng',
            error: error.message
        });
    }
};

// Get order by code (for tracking)
const getOrderByCode = async (req, res) => {
    try {
        const { code } = req.params;

        const order = await Order.findOne({
            where: { orderCode: code },
            include: [{
                model: OrderItem,
                as: 'items'
            }]
        });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng với mã này'
            });
        }

        res.json({
            success: true,
            data: { order }
        });

    } catch (error) {
        console.error('Get order by code error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi tra cứu đơn hàng',
            error: error.message
        });
    }
};

// Get my orders (for logged in user)
const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        const offset = (page - 1) * limit;
        const where = { userId };

        if (status) {
            where.status = status;
        }

        const { count, rows: orders } = await Order.findAndCountAll({
            where,
            include: [{
                model: OrderItem,
                as: 'items'
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(count / limit),
                    totalItems: count,
                    itemsPerPage: parseInt(limit)
                }
            }
        });

    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy danh sách đơn hàng',
            error: error.message
        });
    }
};

// Update order status (Admin/Manager)
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentStatus, cancelReason } = req.body;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        const updateData = {};

        if (status) {
            updateData.status = status;
            
            if (status === 'delivered') {
                updateData.deliveredAt = new Date();
                if (order.paymentMethod === 'cod') {
                    updateData.paymentStatus = 'paid';
                }
            }
            
            if (status === 'cancelled') {
                updateData.cancelReason = cancelReason || '';
                
                // Restore stock
                const items = await OrderItem.findAll({ where: { orderId: id } });
                for (const item of items) {
                    const product = await Product.findByPk(item.productId);
                    if (product) {
                        await product.update({
                            stockQuantity: product.stockQuantity + item.quantity
                        });
                    }
                }
            }
        }

        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }

        await order.update(updateData);

        const updatedOrder = await Order.findByPk(id, {
            include: [{
                model: OrderItem,
                as: 'items'
            }]
        });

        res.json({
            success: true,
            message: 'Cập nhật đơn hàng thành công',
            data: { order: updatedOrder }
        });

    } catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật đơn hàng',
            error: error.message
        });
    }
};

// Cancel order (Customer)
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const userId = req.user?.id;

        const order = await Order.findByPk(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy đơn hàng'
            });
        }

        // Check if user owns this order
        if (order.userId && order.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Bạn không có quyền hủy đơn hàng này'
            });
        }

        // Only allow cancellation for pending/confirmed orders
        if (!['pending', 'confirmed'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                message: 'Không thể hủy đơn hàng ở trạng thái này'
            });
        }

        // Restore stock
        const items = await OrderItem.findAll({ where: { orderId: id } });
        for (const item of items) {
            const product = await Product.findByPk(item.productId);
            if (product) {
                await product.update({
                    stockQuantity: product.stockQuantity + item.quantity
                });
            }
        }

        await order.update({
            status: 'cancelled',
            cancelReason: reason || 'Khách hàng hủy đơn'
        });

        res.json({
            success: true,
            message: 'Hủy đơn hàng thành công'
        });

    } catch (error) {
        console.error('Cancel order error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi hủy đơn hàng',
            error: error.message
        });
    }
};

// Get order statistics (Admin)
const getOrderStats = async (req, res) => {
    try {
        const totalOrders = await Order.count();
        const pendingOrders = await Order.count({ where: { status: 'pending' } });
        const processingOrders = await Order.count({ where: { status: ['confirmed', 'processing', 'shipping'] } });
        const completedOrders = await Order.count({ where: { status: 'delivered' } });
        const cancelledOrders = await Order.count({ where: { status: 'cancelled' } });

        const totalRevenue = await Order.sum('totalAmount', {
            where: { status: 'delivered', paymentStatus: 'paid' }
        }) || 0;

        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = await Order.count({
            where: {
                createdAt: { [Op.gte]: today }
            }
        });

        const todayRevenue = await Order.sum('totalAmount', {
            where: {
                createdAt: { [Op.gte]: today },
                status: 'delivered',
                paymentStatus: 'paid'
            }
        }) || 0;

        res.json({
            success: true,
            data: {
                totalOrders,
                pendingOrders,
                processingOrders,
                completedOrders,
                cancelledOrders,
                totalRevenue,
                todayOrders,
                todayRevenue
            }
        });

    } catch (error) {
        console.error('Get order stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy thống kê đơn hàng',
            error: error.message
        });
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    getOrderByCode,
    getMyOrders,
    updateOrderStatus,
    cancelOrder,
    getOrderStats
};

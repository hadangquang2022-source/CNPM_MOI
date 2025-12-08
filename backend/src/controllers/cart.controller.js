const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { sequelize } = require('../config/database');

// Get user's cart
const getCart = async (req, res) => {
    try {
        const userId = req.user.id;

        let cart = await Cart.findOne({
            where: { userId },
            include: [{
                model: CartItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'productName', 'sku', 'price', 'stockQuantity', 'category']
                }]
            }]
        });

        // Create cart if doesn't exist
        if (!cart) {
            cart = await Cart.create({ userId, totalItems: 0, totalAmount: 0 });
            cart.items = [];
        }

        res.json({
            success: true,
            data: { cart }
        });

    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi lấy giỏ hàng',
            error: error.message
        });
    }
};

// Add item to cart
const addToCart = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const userId = req.user.id;
        const { productId, quantity = 1 } = req.body;

        // Validate product
        const product = await Product.findByPk(productId, { transaction });
        if (!product) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không tồn tại'
            });
        }

        if (!product.isActive) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Sản phẩm đã ngừng kinh doanh'
            });
        }

        if (product.stockQuantity < quantity) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Số lượng sản phẩm trong kho không đủ'
            });
        }

        // Get or create cart
        let cart = await Cart.findOne({ where: { userId }, transaction });
        if (!cart) {
            cart = await Cart.create({ userId, totalItems: 0, totalAmount: 0 }, { transaction });
        }

        // Check if item already in cart
        let cartItem = await CartItem.findOne({
            where: { cartId: cart.id, productId },
            transaction
        });

        if (cartItem) {
            // Update quantity
            const newQuantity = cartItem.quantity + quantity;
            if (newQuantity > product.stockQuantity) {
                await transaction.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Số lượng vượt quá tồn kho'
                });
            }
            await cartItem.update({ 
                quantity: newQuantity,
                price: product.price 
            }, { transaction });
        } else {
            // Add new item
            cartItem = await CartItem.create({
                cartId: cart.id,
                productId,
                quantity,
                price: product.price
            }, { transaction });
        }

        // Update cart totals
        await updateCartTotals(cart.id, transaction);

        await transaction.commit();

        // Fetch updated cart
        const updatedCart = await Cart.findOne({
            where: { userId },
            include: [{
                model: CartItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'productName', 'sku', 'price', 'stockQuantity', 'category']
                }]
            }]
        });

        res.json({
            success: true,
            message: 'Đã thêm vào giỏ hàng',
            data: { cart: updatedCart }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi thêm vào giỏ hàng',
            error: error.message
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Số lượng phải lớn hơn 0'
            });
        }

        const cart = await Cart.findOne({ where: { userId }, transaction });
        if (!cart) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Giỏ hàng không tồn tại'
            });
        }

        const cartItem = await CartItem.findOne({
            where: { id: itemId, cartId: cart.id },
            include: [{ model: Product, as: 'product' }],
            transaction
        });

        if (!cartItem) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không có trong giỏ hàng'
            });
        }

        if (quantity > cartItem.product.stockQuantity) {
            await transaction.rollback();
            return res.status(400).json({
                success: false,
                message: 'Số lượng vượt quá tồn kho'
            });
        }

        await cartItem.update({ quantity }, { transaction });
        await updateCartTotals(cart.id, transaction);

        await transaction.commit();

        // Fetch updated cart
        const updatedCart = await Cart.findOne({
            where: { userId },
            include: [{
                model: CartItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'productName', 'sku', 'price', 'stockQuantity', 'category']
                }]
            }]
        });

        res.json({
            success: true,
            message: 'Đã cập nhật giỏ hàng',
            data: { cart: updatedCart }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Update cart item error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi cập nhật giỏ hàng',
            error: error.message
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const userId = req.user.id;
        const { itemId } = req.params;

        const cart = await Cart.findOne({ where: { userId }, transaction });
        if (!cart) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Giỏ hàng không tồn tại'
            });
        }

        const cartItem = await CartItem.findOne({
            where: { id: itemId, cartId: cart.id },
            transaction
        });

        if (!cartItem) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Sản phẩm không có trong giỏ hàng'
            });
        }

        await cartItem.destroy({ transaction });
        await updateCartTotals(cart.id, transaction);

        await transaction.commit();

        // Fetch updated cart
        const updatedCart = await Cart.findOne({
            where: { userId },
            include: [{
                model: CartItem,
                as: 'items',
                include: [{
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'productName', 'sku', 'price', 'stockQuantity', 'category']
                }]
            }]
        });

        res.json({
            success: true,
            message: 'Đã xóa khỏi giỏ hàng',
            data: { cart: updatedCart }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa khỏi giỏ hàng',
            error: error.message
        });
    }
};

// Clear cart
const clearCart = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const userId = req.user.id;

        const cart = await Cart.findOne({ where: { userId }, transaction });
        if (!cart) {
            await transaction.rollback();
            return res.status(404).json({
                success: false,
                message: 'Giỏ hàng không tồn tại'
            });
        }

        await CartItem.destroy({ where: { cartId: cart.id }, transaction });
        await cart.update({ totalItems: 0, totalAmount: 0 }, { transaction });

        await transaction.commit();

        res.json({
            success: true,
            message: 'Đã xóa tất cả sản phẩm trong giỏ hàng',
            data: { cart: { ...cart.toJSON(), items: [] } }
        });

    } catch (error) {
        await transaction.rollback();
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi khi xóa giỏ hàng',
            error: error.message
        });
    }
};

// Helper function to update cart totals
const updateCartTotals = async (cartId, transaction) => {
    const items = await CartItem.findAll({
        where: { cartId },
        transaction
    });

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await Cart.update(
        { totalItems, totalAmount },
        { where: { id: cartId }, transaction }
    );
};

module.exports = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart
};

const User = require('./User');
const Role = require('./Role');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Wishlist = require('./Wishlist');
const ProductView = require('./ProductView');
const ProductReview = require('./ProductReview');

// Define associations
User.belongsTo(Role, {
    foreignKey: 'roleId',
    as: 'role'
});
Role.hasMany(User, {
    foreignKey: 'roleId',
    as: 'users'
});

// Order associations
Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders'
});

Order.hasMany(OrderItem, {
    foreignKey: 'orderId',
    as: 'items'
});
OrderItem.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
});

OrderItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});
Product.hasMany(OrderItem, {
    foreignKey: 'productId',
    as: 'orderItems'
});

// Cart associations
Cart.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
User.hasOne(Cart, {
    foreignKey: 'userId',
    as: 'cart'
});

Cart.hasMany(CartItem, {
    foreignKey: 'cartId',
    as: 'items'
});
CartItem.belongsTo(Cart, {
    foreignKey: 'cartId',
    as: 'cart'
});

CartItem.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});
Product.hasMany(CartItem, {
    foreignKey: 'productId',
    as: 'cartItems'
});

// Wishlist associations
Wishlist.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
User.hasMany(Wishlist, {
    foreignKey: 'userId',
    as: 'wishlists'
});

Wishlist.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});
Product.hasMany(Wishlist, {
    foreignKey: 'productId',
    as: 'wishlists'
});

// Product View associations
ProductView.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
User.hasMany(ProductView, {
    foreignKey: 'userId',
    as: 'productViews'
});

ProductView.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});
Product.hasMany(ProductView, {
    foreignKey: 'productId',
    as: 'views'
});

// Product Review associations
ProductReview.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
User.hasMany(ProductReview, {
    foreignKey: 'userId',
    as: 'reviews'
});

ProductReview.belongsTo(Product, {
    foreignKey: 'productId',
    as: 'product'
});
Product.hasMany(ProductReview, {
    foreignKey: 'productId',
    as: 'reviews'
});

ProductReview.belongsTo(Order, {
    foreignKey: 'orderId',
    as: 'order'
});

module.exports = {
    User,
    Role,
    Product,
    Order,
    OrderItem,
    Cart,
    CartItem,
    Wishlist,
    ProductView,
    ProductReview
};
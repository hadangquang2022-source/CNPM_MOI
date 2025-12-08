const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow guest checkout
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // Customer Info
    customerName: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    customerEmail: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    customerPhone: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    // Shipping Address
    shippingAddress: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    shippingCity: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    shippingDistrict: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    shippingWard: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    // Order Details
    subtotal: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    shippingFee: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    discount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    // Payment
    paymentMethod: {
        type: DataTypes.ENUM('cod', 'bank', 'momo'),
        allowNull: false,
        defaultValue: 'cod'
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
    },
    // Order Status
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    note: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    cancelReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    deliveredAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'orders',
    timestamps: true
});

// Static method to generate order code
Order.generateOrderCode = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `QS${timestamp}${random}`;
};

module.exports = Order;

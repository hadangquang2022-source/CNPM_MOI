const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'products',
            key: 'id'
        }
    },
    productName: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    productSku: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
    },
    totalPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    }
}, {
    tableName: 'order_items',
    timestamps: true,
    hooks: {
        beforeCreate: (item) => {
            item.totalPrice = item.price * item.quantity;
        },
        beforeUpdate: (item) => {
            item.totalPrice = item.price * item.quantity;
        }
    }
});

module.exports = OrderItem;

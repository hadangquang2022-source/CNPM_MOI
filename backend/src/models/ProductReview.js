const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductReview = sequelize.define('ProductReview', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'product_id',
        references: {
            model: 'products',
            key: 'id'
        }
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Optional - link to order
        field: 'order_id',
        references: {
            model: 'orders',
            key: 'id'
        }
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    isVerifiedPurchase: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_verified_purchase'
    },
    isApproved: {
        type: DataTypes.BOOLEAN,
        defaultValue: true, // Auto approve, can be changed to false for moderation
        field: 'is_approved'
    },
    helpfulCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        field: 'helpful_count'
    }
}, {
    tableName: 'product_reviews',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'product_id'] // One review per user per product
        }
    ]
});

module.exports = ProductReview;

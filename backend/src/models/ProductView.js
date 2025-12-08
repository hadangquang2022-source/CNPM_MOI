const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductView = sequelize.define('ProductView', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow anonymous views
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
    sessionId: {
        type: DataTypes.STRING(100),
        allowNull: true, // For anonymous users tracking
        field: 'session_id'
    },
    viewedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'viewed_at'
    }
}, {
    tableName: 'product_views',
    timestamps: true,
    underscored: true,
    indexes: [
        {
            fields: ['user_id', 'product_id']
        },
        {
            fields: ['session_id', 'product_id']
        }
    ]
});

module.exports = ProductView;

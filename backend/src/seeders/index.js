const { sequelize } = require('../config/database');
const { User, Role, Product } = require('../models');

const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');

        await sequelize.sync({ force: true });
        console.log('Database synced successfully');

        // Seed Roles - Only Admin and Customer
        const roles = await Role.bulkCreate([
            { name: 'Admin', description: 'Full system access and management', isActive: true },
            { name: 'Customer', description: 'Regular customer who can browse and purchase products', isActive: true }
        ]);
        console.log('Roles created successfully');

        // Seed Users - 1 Admin and 1 Customer
        const users = await User.bulkCreate([
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: 'admin123',
                phone: '0123456789',
                address: '123 Admin Street, Admin City',
                dateOfBirth: '1990-01-01',
                roleId: roles[0].id, // Admin
                isActive: true
            },
            {
                firstName: 'Customer',
                lastName: 'User',
                email: 'customer@example.com',
                password: 'customer123',
                phone: '0987654321',
                address: '456 Customer Ave, Customer City',
                dateOfBirth: '1995-06-15',
                roleId: roles[1].id, // Customer
                isActive: true
            }
        ], { individualHooks: true }); // Enable hooks for password hashing
        console.log('Users created successfully');

        // Seed Products
        const products = await Product.bulkCreate([
            {
                productName: 'Wireless Mouse',
                sku: 'WM-1001',
                description: 'Ergonomic wireless mouse with long battery life',
                category: 'Electronics',
                price: 25.99,
                stockQuantity: 150,
                isActive: true
            },
            {
                productName: 'Mechanical Keyboard',
                sku: 'MK-2002',
                description: 'RGB mechanical keyboard with brown switches',
                category: 'Electronics',
                price: 79.99,
                stockQuantity: 80,
                isActive: true
            },
            {
                productName: 'USB-C Charging Cable',
                sku: 'UC-3003',
                description: 'High-speed USB-C charging cable 1.5m',
                category: 'Accessories',
                price: 9.99,
                stockQuantity: 500,
                isActive: true
            },
            {
                productName: 'Laptop Stand',
                sku: 'LS-4004',
                description: 'Adjustable aluminum laptop stand',
                category: 'Office Equipment',
                price: 29.99,
                stockQuantity: 200,
                isActive: true
            },
            {
                productName: 'Noise Cancelling Headphones',
                sku: 'NH-5005',
                description: 'Over-ear headphones with active noise cancellation',
                category: 'Electronics',
                price: 129.99,
                stockQuantity: 60,
                isActive: true
            },
            {
                productName: 'Webcam 1080p',
                sku: 'WC-6006',
                description: 'Full HD webcam with autofocus and microphone',
                category: 'Electronics',
                price: 49.99,
                stockQuantity: 90,
                isActive: true
            }
        ]);
        console.log('Products created successfully');

        console.log('\n=== Database seeding completed successfully! ===');
        console.log('\nTest Accounts:');
        console.log('Admin: admin@example.com / admin123');
        console.log('Customer: customer@example.com / customer123\n');

        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;

const { sequelize } = require('../config/database');
const { User, Role, Position, Product } = require('../models');

const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');

        await sequelize.sync({ force: true });
        console.log('Database synced successfully');

        // Seed Roles
        const roles = await Role.bulkCreate([
            { name: 'Admin', description: 'Full system access and user management', isActive: true },
            { name: 'Manager', description: 'User management and reporting access', isActive: true },
            { name: 'Employee', description: 'Basic user access', isActive: true },
            { name: 'User', description: 'Standard user access', isActive: true },
        ]);
        console.log('Roles created successfully');

        // Seed Positions
        const positions = await Position.bulkCreate([
            { title: 'Software Engineer', description: 'Develops apps', department: 'Engineering', salary: 75000, isActive: true },
            { title: 'Senior Software Engineer', description: 'Senior dev', department: 'Engineering', salary: 95000, isActive: true },
            { title: 'Product Manager', description: 'Manages product', department: 'Product', salary: 85000, isActive: true },
            { title: 'UI/UX Designer', description: 'Designs UI', department: 'Design', salary: 65000, isActive: true },
            { title: 'DevOps Engineer', description: 'Handles infra', department: 'Engineering', salary: 80000, isActive: true },
            { title: 'HR Manager', description: 'Handles HR', department: 'Human Resources', salary: 70000, isActive: true },
        ]);
        console.log('Positions created successfully');

        // Seed Users
        const users = await User.bulkCreate([
            {
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: 'admin123',
                phone: '+1234567890',
                address: '123 Admin Street, Admin City',
                dateOfBirth: '1990-01-01',
                roleId: roles[0].id,
                positionId: positions[1].id,
                isActive: true
            },
            {
                firstName: 'John',
                lastName: 'Manager',
                email: 'manager@example.com',
                password: 'manager123',
                phone: '+1234567891',
                address: '456 Manager Ave',
                dateOfBirth: '1985-05-15',
                roleId: roles[1].id,
                positionId: positions[2].id,
                isActive: true
            },
            {
                firstName: 'Alice',
                lastName: 'Smith',
                email: 'alice@example.com',
                password: 'alice123',
                phone: '+1234567892',
                address: '789 Employee St',
                dateOfBirth: '1992-08-20',
                roleId: roles[2].id,
                positionId: positions[0].id,
                isActive: true
            }
        ]);
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

        console.log('Database seeding completed successfully!');

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

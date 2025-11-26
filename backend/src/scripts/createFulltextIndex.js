/**
 * Script tạo FULLTEXT index cho bảng Products
 * Chạy 1 lần: node src/scripts/createFulltextIndex.js
 */

require('dotenv').config();
const { sequelize } = require('../config/database');

async function createFulltextIndex() {
    try {
        console.log('🔄 Connecting to database...');
        await sequelize.authenticate();
        console.log('✅ Database connected');

        console.log('🔄 Creating FULLTEXT index...');
        
        // Kiểm tra xem index đã tồn tại chưa
        const [indexes] = await sequelize.query(`
            SHOW INDEX FROM products WHERE Key_name = 'products_fulltext_search'
        `);

        if (indexes.length > 0) {
            console.log('⚠️ FULLTEXT index already exists. Dropping and recreating...');
            await sequelize.query(`
                ALTER TABLE products DROP INDEX products_fulltext_search
            `);
        }

        // Tạo FULLTEXT index với tên cột đúng trong database (snake_case)
        await sequelize.query(`
            ALTER TABLE products 
            ADD FULLTEXT INDEX products_fulltext_search (product_name, description, sku)
        `);

        console.log('✅ FULLTEXT index created successfully!');
        console.log('');
        console.log('📝 Full-text search now supports:');
        console.log('   - Natural language search');
        console.log('   - Relevance ranking');
        console.log('   - Search across product_name, description, and sku');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating FULLTEXT index:', error.message);
        
        if (error.message.includes('doesn\'t exist')) {
            console.log('');
            console.log('💡 Table products does not exist yet.');
            console.log('   Please run the server first to create tables, then run this script again.');
        }
        
        process.exit(1);
    }
}

createFulltextIndex();

// config/swagger.config.js
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tên dự án API',
      version: '1.0.0',
      description: 'Tài liệu API cho ứng dụng quản lý của bạn.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5000}/api`,
        description: 'Máy chủ Phát triển (Development server)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Các đường dẫn đến file chứa JSDoc comments của bạn
  apis: ['./routes/*.js', './models/*.js'], // Thay đổi tùy theo cấu trúc thư mục của bạn
};

const specs = swaggerJsdoc(options);
module.exports = specs;
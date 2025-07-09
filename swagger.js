const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Novelas Ligeras',
      version: '1.0.0',
      description: 'API para gestionar una biblioteca de novelas ligeras',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: ['./routes/*.js'], // Rutas donde buscar los comentarios de la API
};

module.exports = swaggerJsdoc(options);
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configuración
const API_KEY = '50fca525a8f9a6f0491a71deb8701e94977e66754ed73334d2b01b69541ea3c3';
const BASE_URL = 'http://localhost:3000/api';

// Función para probar la API
async function testAPI() {
  try {
    // Prueba GET /api/novelas
    console.log('Probando GET /api/novelas...');
    const response = await fetch(`${BASE_URL}/novelas`, {
      headers: {
        'X-API-Key': API_KEY
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API funcionando correctamente!');
      console.log('Respuesta:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Error:', response.status, response.statusText);
      const error = await response.text();
      console.log('Detalles del error:', error);
    }
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
  }
}

// Ejecutar la prueba
testAPI();
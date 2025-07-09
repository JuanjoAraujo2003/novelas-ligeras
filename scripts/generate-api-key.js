const crypto = require('crypto');

// Generar una API key segura de 32 bytes y convertirla a hexadecimal
const apiKey = crypto.randomBytes(32).toString('hex');

console.log('Tu API Key generada es:');
console.log(apiKey);
console.log('\nAgrega esta clave a tu archivo .env como:');
console.log('API_KEY=' + apiKey);
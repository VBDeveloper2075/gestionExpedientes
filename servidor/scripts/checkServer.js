// Script para verificar que el servidor está funcionando correctamente
const fetch = require('node-fetch').default;
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

async function checkServer() {
  try {
    console.log(`Intentando conectar al servidor en ${BASE_URL}...`);
    
    // Intentar conectar a la ruta de prueba
    const response = await fetch(BASE_URL);
    const data = await response.text();
    
    console.log('Respuesta del servidor:', data);
    console.log('✅ El servidor está funcionando correctamente.');
    
    // Verificar las rutas API
    console.log('\nVerificando rutas API...');
    
    const routes = [
      '/api/docentes',
      '/api/escuelas',
      '/api/expedientes',
      '/api/disposiciones'
    ];
    
    for (const route of routes) {
      try {
        const apiResponse = await fetch(`${BASE_URL}${route}`);
        console.log(`Ruta ${route}: ${apiResponse.status} ${apiResponse.statusText}`);
      } catch (error) {
        console.error(`❌ Error al conectar a ${route}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error al conectar al servidor:', error.message);
    console.log('\nPosibles problemas:');
    console.log('1. El servidor no está en ejecución. Inicie el servidor con: npm start');
    console.log('2. El servidor está usando un puerto diferente.');
    console.log('3. Hay un problema con la configuración del servidor.');
  }
}

checkServer();

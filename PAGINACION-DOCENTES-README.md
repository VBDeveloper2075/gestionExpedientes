# Solucionando Problemas de Conexión - Paginación de Docentes

## 🚨 Error: ERR_CONNECTION_REFUSED

Este error indica que el servidor backend no está ejecutándose. Sigue estos pasos para solucionarlo:

### 📋 Pasos para Resolver

#### 1. Verificar Prerequisitos
- ✅ MySQL debe estar instalado y ejecutándose
- ✅ Node.js debe estar instalado
- ✅ Las dependencias deben estar instaladas

#### 2. Instalar Dependencias del Servidor
```bash
cd servidor
npm install
```

#### 3. Configurar Base de Datos
Asegúrate de que existe la base de datos `jp3_db` y la tabla `docentes`:

```sql
CREATE DATABASE IF NOT EXISTS jp3_db;
USE jp3_db;

-- Verificar si existe la tabla docentes
SHOW TABLES LIKE 'docentes';
```

#### 4. Verificar Configuración
El archivo `servidor/.env` debe contener:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=jp3_db
PORT=5000
```

#### 5. Probar Inicialización
```bash
cd servidor
npm run init
```

#### 6. Iniciar el Servidor
```bash
cd servidor
npm start
# o alternativamente:
node server.js
```

### 🔧 Script de Diagnóstico Automático
Ejecuta el script de diagnóstico:
```bash
diagnostico-servidor.bat
```

### 🌐 Probar la Paginación

Una vez que el servidor esté corriendo, puedes probar la API de paginación:

#### URLs de Prueba
- `http://localhost:5000/api/docentes` - Primera página (25 registros)
- `http://localhost:5000/api/docentes?page=2&limit=10` - Segunda página (10 registros)
- `http://localhost:5000/api/docentes?search=juan` - Búsqueda
- `http://localhost:5000/api/docentes?page=1&limit=5&search=ana` - Búsqueda paginada

#### Respuesta Esperada
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Juan",
      "apellido": "Pérez",
      "dni": "12345678",
      "email": "juan@email.com",
      "telefono": "123456789"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "totalPages": 6
  }
}
```

### 🎯 Características Implementadas

#### Backend (Servidor)
- ✅ Paginación con parámetros `page` y `limit`
- ✅ Búsqueda por nombre, apellido, DNI y email
- ✅ Respuesta en formato estándar `{ data, pagination }`
- ✅ Logging detallado para debugging
- ✅ Manejo de errores robusto

#### Frontend (Cliente)
- ✅ Componente de lista paginada
- ✅ Controles de navegación
- ✅ Búsqueda en tiempo real con debounce
- ✅ Indicadores de estado de carga
- ✅ Manejo de errores de conexión
- ✅ Compatibilidad hacia atrás

### 🐛 Solución de Problemas Comunes

#### El servidor no inicia
- Verifica que MySQL esté corriendo
- Revisa el archivo `.env`
- Ejecuta `npm install` en la carpeta servidor

#### Error de base de datos
- Crea la base de datos `jp3_db`
- Importa la estructura de tablas
- Verifica credenciales en `.env`

#### El frontend no se conecta
- Verifica que el servidor esté en puerto 5000
- Revisa la configuración en `cliente/src/services/config.js`
- Abre las herramientas de desarrollador del navegador

### 📱 Probando en el Navegador

1. Inicia el servidor: `cd servidor && npm start`
2. Inicia el cliente: `cd cliente && npm start`
3. Navega a: `http://localhost:3000/docentes`
4. Verifica que aparezcan los controles de paginación
5. Prueba la búsqueda y navegación entre páginas

### 🎉 ¡Todo Funcionando!

Si ves la lista de docentes con controles de paginación y búsqueda, ¡la implementación está completa y funcionando correctamente!

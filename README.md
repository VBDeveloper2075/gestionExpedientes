# JP Verito - Sistema de Gestión Educativa SAD3F
## Archivo Digital - Secretaría de Asuntos Docentes de Tres de Febrero

---

## 🎯 DESCRIPCIÓN

Sistema completo de gestión educativa con **autenticación JWT** y **control de roles** para la administración de expedientes, disposiciones, docentes y escuelas del Archivo Digital de la SAD de Tres de Febrero.

### 🏛️ Entidad: 
**Secretaría de Asuntos Docentes de Tres de Febrero (SAD3F)**

### 👥 Usuarios Objetivo:
- **Administradores**: Acceso completo para gestión de datos
- **Usuarios**: Acceso de solo lectura para consultas

---

## ✅ ESTADO ACTUAL CONFIRMADO

### 🚀 SISTEMA COMPLETO Y FUNCIONANDO:

#### ✅ **Backend Express** (Servidor Principal)
- **4 APIs REST completas**: docentes, escuelas, expedientes, disposiciones
- **Sistema de autenticación JWT** con roles admin/user
- **Base de datos MySQL** con 6 tablas relacionales
- **Middleware de protección** por roles implementado
- **CORS configurado** para desarrollo y producción

#### ✅ **Frontend React** (Interfaz de Usuario)
- **Sistema de autenticación** completo con context
- **Protección de rutas** por roles
- **4 módulos CRUD** funcionales y protegidos
- **Paginación y búsqueda** implementadas
- **Formularios validados** para todas las entidades
- **UI responsiva** con Bootstrap

#### ✅ **Base de Datos MySQL** (Estructura Completa)
```
jp3_db/
├── users              # Usuarios del sistema (admin/user)
├── docentes           # Información de docentes
├── escuelas           # Datos de escuelas
├── expedientes        # Expedientes educativos
├── disposiciones      # Disposiciones administrativas
└── [tablas relacionales] # Relaciones many-to-many
```

#### ✅ **Autenticación y Seguridad**
- **JWT tokens** con expiración automática
- **Roles diferenciados**: admin (escritura) / user (lectura)
- **Interceptors automáticos** para incluir tokens
- **Protección a nivel de componente** y API
- **Sesión persistente** con localStorage

---

## 🔐 CREDENCIALES DE ACCESO

### 👤 Usuarios del Sistema:
```
🔑 ADMINISTRADOR
Usuario: admin
Contraseña: sadAdmin2025!
Permisos: Acceso completo (crear/editar/eliminar)

👁️ USUARIO CONSULTA
Usuario: usuario  
Contraseña: sadUser2025!
Permisos: Solo lectura (ver/buscar/exportar)
```

---

## 🚀 GUÍA DE INSTALACIÓN Y USO

### 📋 Prerrequisitos
1. **Node.js** (versión 18 o superior)
2. **XAMPP** con MySQL y phpMyAdmin
3. **Git** para control de versiones

### 🗄️ Configuración de Base de Datos

1. **Iniciar XAMPP:**
   ```
   - Abrir XAMPP Control Panel
   - Iniciar servicios Apache y MySQL
   ```

2. **Crear Base de Datos:**
   ```
   - Acceder a phpMyAdmin: http://localhost/phpmyadmin
   - Crear base de datos: jp3_db
   ```

3. **Inicializar Estructura:**
   ```bash
   cd servidor
   npm run init-db
   ```

### 💻 Instalación del Proyecto

```bash
# 1. Clonar repositorio
git clone https://github.com/VBDeveloper2075/jpVerito.git
cd jpVerito

# 2. Instalar dependencias del servidor
cd servidor
npm install

# 3. Instalar dependencias del cliente
cd ../cliente
npm install
```

### ▶️ Ejecución en Desarrollo

```bash
# Terminal 1 - Iniciar Backend API
cd servidor
npm run server
# Servidor corriendo en: http://localhost:5000

# Terminal 2 - Iniciar Frontend React
cd cliente  
npm run client
# Cliente corriendo en: http://localhost:3000
```

### 🌐 Acceso a la Aplicación

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Aplicación Principal** | http://localhost:3000 | Frontend React |
| **API Backend** | http://localhost:5000 | Servicios REST |
| **Administrador BD** | http://localhost/phpmyadmin | Gestión MySQL |

---

## 🏗️ ARQUITECTURA DEL PROYECTO

### 📁 Estructura de Directorios

```
jpVerito/
├── 📄 CONTEXTO_PROYECTO.md     # Plan maestro del proyecto
├── 📄 README.md               # Esta documentación
├── 📄 package.json            # Scripts principales
│
├── 🎨 cliente/                # Frontend React
│   ├── public/               # Archivos estáticos
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── auth/         # Autenticación (Login, etc.)
│   │   │   ├── common/       # Componentes reutilizables
│   │   │   ├── docentes/     # Gestión de docentes
│   │   │   ├── escuelas/     # Gestión de escuelas
│   │   │   ├── expedientes/  # Gestión de expedientes
│   │   │   └── disposiciones/ # Gestión de disposiciones
│   │   ├── context/          # Context de React
│   │   │   ├── AuthContext.js # Estado de autenticación
│   │   │   └── AppContext.js  # Estado global
│   │   ├── pages/            # Páginas principales
│   │   ├── services/         # Servicios API
│   │   └── styles/           # CSS y assets (logoSad.jpg)
│   └── package.json
│
├── 🔧 servidor/              # Backend Express
│   ├── auth/                # Sistema de autenticación
│   │   ├── middleware.js    # Verificación JWT
│   │   ├── controllers.js   # Lógica de login/register  
│   │   └── routes.js        # Endpoints auth
│   ├── config/              # Configuración
│   │   ├── db.js           # Conexión MySQL
│   │   ├── initDB.js       # Inicialización BD
│   │   └── updateDB.js     # Scripts de actualización
│   ├── models/              # Modelos de datos
│   │   ├── User.js         # Modelo de usuarios
│   │   ├── Docente.js      # Modelo de docentes
│   │   ├── Escuela.js      # Modelo de escuelas
│   │   ├── Expediente.js   # Modelo de expedientes
│   │   └── Disposicion.js  # Modelo de disposiciones
│   ├── routes/              # Endpoints API
│   │   ├── docentes.js     # CRUD docentes
│   │   ├── escuelas.js     # CRUD escuelas
│   │   ├── expedientes.js  # CRUD expedientes
│   │   └── disposiciones.js # CRUD disposiciones
│   ├── scripts/             # Scripts utilitarios
│   ├── server.js           # Servidor principal
│   └── package.json
│
└── 📊 jp3_db/               # Base de datos MySQL
    └── [tablas relacionales] # Estructura completa
```

---

## 🔒 SISTEMA DE AUTENTICACIÓN

### 🎭 Roles y Permisos

#### 👑 **ADMINISTRADOR** (`admin`)
```
✅ Ver todos los datos (docentes, escuelas, expedientes, disposiciones)
✅ Crear nuevos registros en todas las entidades
✅ Editar información existente
✅ Eliminar registros (con confirmación)
✅ Gestionar usuarios del sistema
✅ Acceso completo a todas las funcionalidades
```

#### 👁️ **USUARIO** (`user`)  
```
✅ Ver expedientes (solo lectura)
✅ Ver disposiciones (solo lectura)
✅ Buscar y filtrar información
✅ Exportar reportes y datos
❌ NO puede crear nuevos registros
❌ NO puede editar información
❌ NO puede eliminar datos
❌ Botones de acción ocultos automáticamente
```

### 🔑 Endpoints de Autenticación

| Método | Endpoint | Descripción | Acceso |
|--------|----------|-------------|---------|
| `POST` | `/auth/login` | Iniciar sesión | Público |
| `GET` | `/auth/verify` | Verificar token válido | Protegido |
| `POST` | `/auth/logout` | Cerrar sesión | Protegido |
| `GET` | `/auth/me` | Obtener perfil usuario | Protegido |

---

## 📊 APIs REST DISPONIBLES

### 🎯 Endpoints Principales

| Entidad | Endpoint | Métodos | Descripción | Protección |
|---------|----------|---------|-------------|------------|
| **Docentes** | `/api/docentes` | GET, POST, PUT, DELETE | Gestión de docentes | JWT + Roles |
| **Escuelas** | `/api/escuelas` | GET, POST, PUT, DELETE | Gestión de escuelas | JWT + Roles |
| **Expedientes** | `/api/expedientes` | GET, POST, PUT, DELETE | Gestión de expedientes | JWT + Roles |
| **Disposiciones** | `/api/disposiciones` | GET, POST, PUT, DELETE | Gestión de disposiciones | JWT + Roles |

### 🔍 Funcionalidades Implementadas

#### ✅ **Paginación Avanzada**
```javascript
GET /api/docentes?page=1&limit=10&search=nombre
```

#### ✅ **Búsqueda y Filtros**
```javascript
GET /api/expedientes?search=legajo&status=activo
```

#### ✅ **Relaciones Many-to-Many**
```javascript
// Expedientes relacionados con múltiples disposiciones
// Docentes asignados a múltiples escuelas
```

---

## 🎯 PRÓXIMA FASE: DEPLOYMENT EN LA NUBE

### 📋 Según CONTEXTO_PROYECTO.md - ETAPA 3:

#### 🚀 **RAILWAY + NETLIFY DEPLOYMENT**
```
🎯 OBJETIVO: Sistema accesible públicamente 24/7

Frontend (Netlify):
  ✅ CDN global gratuito
  ✅ SSL automático
  ✅ Deploy automático desde Git
  
Backend + DB (Railway): 
  ✅ MySQL managed database
  ✅ Auto-scaling
  ✅ SSL/HTTPS incluido

URLs Finales:
  📱 App: https://verito-expedientes.netlify.app
  🔧 API: https://verito-api.railway.app
```

#### ⏱️ **Cronograma de Deployment**
```
Semana 1: Preparación variables de entorno
Semana 2: Deploy Railway (backend + DB)
Semana 3: Deploy Netlify (frontend)
Resultado: Sistema en producción público
```

---

## 🛠️ COMANDOS ÚTILES

### 🔧 Desarrollo
```bash
# Iniciar base de datos completa
npm run init-db

# Iniciar modo desarrollo completo
npm run dev

# Solo backend
cd servidor && npm run server

# Solo frontend  
cd cliente && npm run client
```

### 📊 Base de Datos
```bash
# Verificar conexión
cd servidor && npm run test-connection

# Resetear datos de desarrollo
cd servidor && npm run reset-dev-data

# Backup de datos
mysqldump -u root jp3_db > backup_jp3.sql
```

---

## 🆘 SOPORTE Y CONTACTO

### 📧 **Contacto Principal**
**Email:** vbar@abc.gob.ar  
**Entidad:** Secretaría de Asuntos Docentes de Tres de Febrero

### 🐛 **Reporte de Issues**
1. Verificar credenciales de acceso
2. Comprobar servicios XAMPP activos
3. Revisar logs del servidor: `cd servidor && npm run server`
4. Contactar a vbar@abc.gob.ar con detalles del error

### 📋 **Backup y Recuperación**
- **Datos críticos**: Backup diario recomendado
- **Configuración**: Variables de entorno documentadas
- **Rollback**: Plan de contingencia en CONTEXTO_PROYECTO.md

---

## 🏆 LOGROS IMPLEMENTADOS

### ✅ **Funcionalidades Completadas**
- [x] **Sistema completo de autenticación JWT**
- [x] **4 módulos CRUD totalmente funcionales**
- [x] **Protección por roles en frontend y backend**
- [x] **Paginación y búsqueda implementadas**
- [x] **Interfaz responsive y moderna**
- [x] **Base de datos relacional completa**
- [x] **Validaciones y manejo de errores**
- [x] **Sesión persistente automática**

### 🎯 **Próximos Objetivos**
- [ ] **Deploy en Railway (backend + database)**
- [ ] **Deploy en Netlify (frontend)**
- [ ] **URLs públicas para acceso remoto**
- [ ] **Migración de datos a la nube**
- [ ] **Monitoreo y analytics**

---

## 📈 MÉTRICAS DEL PROYECTO

### 📊 **Estadísticas Técnicas**
- **Backend:** Express.js + JWT + MySQL
- **Frontend:** React.js + Bootstrap + Context API
- **Base de Datos:** 6 tablas relacionales
- **Autenticación:** 2 roles diferenciados
- **APIs:** 4 endpoints REST completos
- **Componentes React:** 20+ componentes modulares

### ⚡ **Performance**
- **Tiempo de carga:** < 2 segundos
- **Paginación:** 10 registros por página
- **Búsqueda:** Tiempo real
- **Autenticación:** Token persistente

---

**🎯 Archivo Digital - SAD3F | Sistema de Gestión Educativa Completo**

*Desarrollado para la Secretaría de Asuntos Docentes de Tres de Febrero*

---

*Última actualización: Agosto 2025*  
*Estado: ✅ Sistema completo funcionando | 🚀 Listo para deployment en la nube*
"# gestionExpedientes" 

# 🍺 Bar Management System - Sprint 1

## 🚀 Inicio Rápido

### 1. Levantar el Sistema
```bash
docker compose up -d
```

### 2. Inicializar Usuario Admin (Primera vez)
```bash
./init-admin.sh
```

### 3. Acceder al Sistema
- **URL**: http://localhost:8080
- **Email**: admin@bar.com
- **Password**: admin123

## 📋 Servicios Disponibles

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| **Frontend** | 8080 | Interfaz de usuario |
| **API Gateway** | 8080 | Nginx reverse proxy |
| **MS-AUTH-GO** | 8081 | Autenticación y usuarios |
| **MS-VENUE-GO** | 8082 | Sedes y mesas |
| **MS-CATALOG-GO** | 8083 | Productos y categorías |
| **PostgreSQL** | 5439 | Base de datos |

## 🔐 Credenciales por Defecto

### Usuario Administrador
- **Email**: admin@bar.com
- **Password**: admin123
- **Rol**: Administrador (acceso completo)

## 🛡️ Funcionalidades de Seguridad

### ⏰ Gestión de Sesiones
- **Timeout automático**: Las sesiones expiran automáticamente después de 3 minutos de inactividad
- **Advertencia de expiración**: A los 2:30 minutos se muestra una advertencia: "Your session will expire in 30 seconds due to inactivity"
- **Redirección automática**: Al expirar la sesión, se muestra "Session expired. Please log in again" y redirige al login

### 🔒 Validación de Contraseñas (ISO 27001)
- **Mínimo 8 caracteres**
- **Al menos una mayúscula (A-Z)**
- **Al menos una minúscula (a-z)**
- **Al menos un número (0-9)**
- **Al menos un carácter especial (!@#$%^&*)**
- **No contraseñas comunes o fácilmente adivinables**

### 🚫 Bloqueo de Cuentas
- **3 intentos fallidos**: Después de 3 intentos consecutivos fallidos, la cuenta se bloquea por 15 minutos
- **Mensaje de bloqueo**: "Account temporarily locked due to multiple failed attempts"
- **Registro completo**: Se registran todos los intentos de login (exitosos y fallidos) con timestamp, IP y usuario

### 📊 Auditoría de Seguridad
- **Registro de intentos**: Todos los intentos de login se registran con:
  - Email del usuario
  - Dirección IP
  - User-Agent del navegador
  - Éxito o fallo del intento
  - Timestamp exacto
- **Nunca se muestran contraseñas**: Las contraseñas nunca se muestran en texto plano, ni en logs

## 🎯 Funcionalidades del Sprint 1

### ✅ Completadas
- [x] **Login de Usuario** - Autenticación JWT
- [x] **Configuración de Roles** - Admin, Cajero, Mesero, Barman
- [x] **Gestión de Usuarios** - CRUD completo
- [x] **Configuración de Sedes** - Crear y gestionar ubicaciones
- [x] **Configuración de Mesas** - Crear y gestionar mesas
- [x] **Catálogo de Productos** - CRUD de productos
- [x] **Catálogo de Categorías** - CRUD de categorías

## 🛠️ Comandos Útiles

### Ver logs de todos los servicios
```bash
docker compose logs -f
```

### Ver logs de un servicio específico
```bash
docker compose logs -f ms-auth-go
```

### Reiniciar un servicio
```bash
docker compose restart ms-auth-go
```

### Detener todos los servicios
```bash
docker compose down
```

### Detener y eliminar volúmenes (¡CUIDADO!)
```bash
docker compose down -v
```

## 🔧 Desarrollo

### Estructura del Proyecto
```
project/
├── services/
│   ├── FR-BAR-RT/          # Frontend React + TypeScript
│   ├── MS-AUTH-GO/         # Microservicio de Autenticación
│   ├── MS-VENUE-GO/        # Microservicio de Sedes y Mesas
│   ├── MS-CATALOG-GO/      # Microservicio de Productos
│   └── INFRA-BAR-DK/       # Infraestructura y Docker
└── database/               # Scripts de base de datos
```

### Tecnologías Utilizadas
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Go 1.21, Gin Framework
- **Base de Datos**: PostgreSQL 17
- **Autenticación**: JWT
- **Contenedores**: Docker, Docker Compose
- **Proxy**: Nginx

## 🚨 Solución de Problemas

### Error 401 en Login
Si el login falla con error 401:
1. Verificar que el usuario admin existe:
   ```bash
   ./init-admin.sh
   ```

### Servicios no inician
1. Verificar que Docker esté corriendo
2. Verificar puertos disponibles (8080, 8081, 8082, 8083, 5439)
3. Revisar logs:
   ```bash
   docker compose logs
   ```

### Base de datos no conecta
1. Verificar que PostgreSQL esté corriendo:
   ```bash
   docker compose ps postgres-db
   ```
2. Verificar conectividad:
   ```bash
   docker compose exec postgres-db pg_isready
   ```

## 📞 Soporte

Para reportar problemas o solicitar nuevas funcionalidades, contactar al equipo de desarrollo.

---
**🎉 ¡Sistema listo para el Sprint 1!**

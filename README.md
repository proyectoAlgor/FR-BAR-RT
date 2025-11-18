# 🍺 Bar Management System - Proyecto Completo

Sistema completo de gestión de bar con arquitectura de microservicios, desarrollado como proyecto académico para Diseño de Algoritmos.

## 📋 Descripción del Proyecto

Sistema de gestión integral para bares que incluye:
- Autenticación y gestión de usuarios con roles
- Configuración de sedes y mesas
- Catálogo de productos y categorías
- Algoritmos de optimización
- Interfaz web responsive

## 🏗️ Arquitectura

El proyecto está organizado en los siguientes componentes:

```
.
├── FR-BAR-RT-main/          # Frontend React + TypeScript
├── MS-AUTH-GO-main/         # Microservicio de Autenticación
├── MS-VENUE-GO-main/        # Microservicio de Sedes y Mesas
├── MS-CATALOG-GO-main/      # Microservicio de Productos
├── MS-OPTIMIZATION-GO-main/ # Microservicio de Optimización
└── INFRA-BAR-DK-main/       # Infraestructura y Docker Compose
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Docker y Docker Compose instalados
- Git instalado

### Pasos para levantar el proyecto

1. **Navegar a la carpeta de infraestructura:**
   ```bash
   cd INFRA-BAR-DK-main/INFRA-BAR-DK-main/compose
   ```

2. **Construir las imágenes:**
   ```bash
   ./build-local.sh
   ```

3. **Levantar los servicios:**
   ```bash
   docker compose up -d
   ```

4. **Inicializar usuario administrador (primera vez):**
   ```bash
   ./init-admin.sh
   ```

5. **Acceder a la aplicación:**
   - **Frontend**: http://localhost:8080
   - **Email**: admin@bar.com
   - **Password**: admin123

## 📦 Componentes del Sistema

### Frontend (FR-BAR-RT)
- **Tecnología**: React 19, TypeScript, Tailwind CSS
- **Puerto**: 3000 (desarrollo) / 8080 (producción vía Nginx)
- **Características**:
  - Interfaz responsive
  - Gestión de sesiones con timeout automático
  - Validación de contraseñas (ISO 27001)
  - Bloqueo de cuentas por intentos fallidos

### Microservicios (Go)

#### MS-AUTH-GO (Puerto 8081)
- Autenticación JWT
- Gestión de usuarios y roles
- Validación de contraseñas
- Bloqueo de cuentas

#### MS-VENUE-GO (Puerto 8082)
- CRUD de sedes (locations)
- CRUD de mesas (tables)

#### MS-CATALOG-GO (Puerto 8083)
- CRUD de productos
- CRUD de categorías
- Gestión de precios

#### MS-OPTIMIZATION-GO
- Algoritmos de ordenamiento
- Algoritmos de búsqueda
- Algoritmos de cambio de dinero

### Infraestructura (INFRA-BAR-DK)
- Docker Compose para orquestación
- Nginx como API Gateway
- PostgreSQL 17 como base de datos
- Scripts de inicialización

## 🛠️ Comandos Útiles

### Gestión de Git

```bash
# Ver estado del repositorio
git status

# Ver ramas disponibles
git branch

# Crear una nueva rama
git checkout -b feature/nombre-funcionalidad

# Ver historial de commits
git log --oneline
```

### Gestión de Docker

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f ms-auth-go

# Reiniciar un servicio
docker compose restart ms-auth-go

# Detener todos los servicios
docker compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina la BD)
docker compose down -v
```

## 📝 Estructura de Ramas

- `main`: Rama principal con el código estable
- `feature/*`: Ramas para nuevas funcionalidades
- `bugfix/*`: Ramas para corrección de errores

## 🔐 Seguridad

### Funcionalidades Implementadas
- ✅ Autenticación JWT
- ✅ Validación de contraseñas (ISO 27001)
- ✅ Timeout de sesión automático (3 minutos)
- ✅ Bloqueo de cuentas (3 intentos fallidos = 15 min bloqueo)
- ✅ Auditoría de intentos de login
- ✅ Middleware de autenticación en todos los microservicios

## 📚 Documentación Adicional

- [Documentación de Infraestructura](./INFRA-BAR-DK-main/INFRA-BAR-DK-main/README.md)
- [Guía de Inicio Rápido](./INFRA-BAR-DK-main/INFRA-BAR-DK-main/compose/README.md)

## 🤝 Contribución

1. Crear una rama desde `main`: `git checkout -b feature/nombre-funcionalidad`
2. Desarrollar y testear localmente
3. Hacer commit de los cambios: `git commit -m "Descripción del cambio"`
4. Push a la rama: `git push origin feature/nombre-funcionalidad`
5. Crear Pull Request (si aplica)

## 📄 Licencia

Proyecto educativo - Universidad

## 👥 Equipo

Equipo de Desarrollo - Diseño de Algoritmos

---

**🎉 ¡Proyecto listo para desarrollo!**


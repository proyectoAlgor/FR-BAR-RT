# INFRA-BAR-DK - Infraestructura Bar Management System

## 📋 Descripción
Infraestructura completa para el sistema de gestión de bar, organizada por sprints y siguiendo mejores prácticas DevOps.

## 🎯 Primer Sprint - Microservicios Implementados

### HU1: Login de Usuario
- **Microservicio**: `MS-AUTH-GO`
- **Puerto**: 8081
- **Funcionalidades**: Autenticación, gestión de usuarios, roles y JWT

### HU3: Configuración de Sedes y Mesas
- **Microservicio**: `MS-VENUE-GO`
- **Puerto**: 8082
- **Funcionalidades**: CRUD de sedes (locations) y mesas (tables)

### HU4: Configuración de Productos
- **Microservicio**: `MS-CATALOG-GO`
- **Puerto**: 8083
- **Funcionalidades**: CRUD de categorías y productos con pricing

### HU9: Aplicación Responsiva
- **Frontend**: `FR-BAR-RT` (React 19)
- **Puerto**: 3000
- **Características**: UI responsive con Tailwind CSS

## 🏗️ Arquitectura

```
                    ┌──────────────┐
                    │   Frontend   │
                    │  FR-BAR-RT   │
                    │  (Port 3000) │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ API Gateway  │
                    │    Nginx     │
                    │  (Port 8080) │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌─────▼───────┐
    │ MS-AUTH-GO  │ │ MS-VENUE-GO │ │MS-CATALOG-GO│
    │ (Port 8081) │ │ (Port 8082) │ │ (Port 8083) │
    └──────┬──────┘ └──────┬──────┘ └─────┬───────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                    ┌──────▼───────┐
                    │  PostgreSQL  │
                    │   (17-alpine)│
                    │  (Port 5432) │
                    └──────────────┘
```

## 🚀 Quick Start

### 1. Construir Imágenes Locales
```bash
cd infra/INFRA-BAR-DK/compose
./build-local.sh
```

### 2. Levantar Servicios
```bash
cd infra/INFRA-BAR-DK/compose
docker-compose up -d
```

### 3. Verificar Salud de Servicios
```bash
# PostgreSQL
docker-compose ps postgres-db

# Microservicios
curl http://localhost:8080/api/auth/health
curl http://localhost:8080/api/venue/health
curl http://localhost:8080/api/catalog/health

# Frontend
curl http://localhost:3000
```

### 4. Acceder a la Aplicación
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Usuario por defecto**: 
  - Email: `admin@bar.com`
  - Password: `admin123`

## 📦 Estructura de Directorios

```
infra/INFRA-BAR-DK/
├── compose/
│   ├── build-local.sh        # Script de build automatizado
│   ├── docker-compose.yml    # Orquestación de servicios
│   ├── nginx.conf            # Configuración del API Gateway
│   └── env.example           # Variables de entorno de ejemplo
├── database/
│   └── init.sql              # Script de inicialización de BD
└── README.md                 # Este archivo
```

## 🛠️ Comandos Útiles

### Gestión de Servicios
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f ms-auth-go
docker-compose logs -f ms-venue-go
docker-compose logs -f ms-catalog-go
docker-compose logs -f frontend

# Reiniciar un servicio
docker-compose restart ms-auth-go

# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina la BD)
docker-compose down -v
```

### Base de Datos
```bash
# Acceder a psql
docker-compose exec postgres-db psql -U bar_user -d bar_management_db

# Backup de la base de datos
docker-compose exec postgres-db pg_dump -U bar_user bar_management_db > backup.sql

# Restaurar backup
cat backup.sql | docker-compose exec -T postgres-db psql -U bar_user -d bar_management_db
```

### Desarrollo
```bash
# Rebuild de un servicio específico
docker-compose build ms-auth-go
docker-compose up -d ms-auth-go

# Ver recursos consumidos
docker stats

# Limpiar sistema Docker
docker system prune -f
```

## 🔧 Configuración

### Variables de Entorno
Copia `env.example` a `.env` y ajusta según tu entorno:

```bash
cp env.example .env
# Edita .env con tus valores
```

### Configuración de Servicios
Cada microservicio acepta las siguientes variables:
- `DATABASE_URL`: URL de conexión a PostgreSQL
- `JWT_SECRET`: Clave secreta para firmar tokens JWT
- `SERVICE_HOST`: Host del servicio (default: 0.0.0.0)
- `SERVICE_PORT`: Puerto del servicio (default: 8080)

## 📊 Healthchecks

Todos los servicios implementan healthchecks:
- **Intervalo**: 30s
- **Timeout**: 10s
- **Retries**: 3
- **Start Period**: 40s (servicios Go), 10s (PostgreSQL)

## 🔐 Seguridad

### Consideraciones de Producción
- [ ] Cambiar `JWT_SECRET` por uno seguro (mínimo 32 caracteres)
- [ ] Cambiar credenciales de PostgreSQL
- [ ] Configurar CORS específico (no usar `*`)
- [ ] Habilitar HTTPS/TLS en Nginx
- [ ] Implementar rate limiting
- [ ] Agregar secrets management (Vault, AWS Secrets Manager)
- [ ] Configurar logging centralizado (ELK, Loki)
- [ ] Implementar monitoring (Prometheus + Grafana)

## 📈 Monitoreo

### Logs Estructurados
Todos los servicios Go emiten logs en formato JSON para fácil parsing:
```json
{
  "level": "info",
  "service": "ms-auth-go",
  "timestamp": "2025-10-08T12:00:00Z",
  "message": "User logged in",
  "user_id": "uuid-here"
}
```

### Métricas (Futuro)
- Request rate
- Latency (p50, p95, p99)
- Error rate
- Database connection pool

## 🧪 Testing

### Testing Individual de Servicios
```bash
# MS-AUTH-GO
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bar.com","password":"admin123"}'

# MS-VENUE-GO (requiere token)
curl -X GET http://localhost:8080/api/venue/locations \
  -H "Authorization: Bearer <token>"

# MS-CATALOG-GO (requiere token)
curl -X GET http://localhost:8080/api/catalog/products \
  -H "Authorization: Bearer <token>"
```

## 🔄 CI/CD (Futuro)

### Pipeline Sugerido
1. **Build**: Construir imágenes Docker
2. **Test**: Tests unitarios y de integración
3. **Security Scan**: Escaneo de vulnerabilidades (Trivy, Snyk)
4. **Push**: Subir imágenes a registry
5. **Deploy**: Desplegar a Kubernetes/ECS

## 📝 Convenciones

### Nomenclatura de Microservicios
- Formato: `MS-<DOMINIO>-<LENGUAJE>`
- Ejemplos: `MS-AUTH-GO`, `MS-VENUE-GO`, `MS-CATALOG-GO`

### Nomenclatura de Frontend
- Formato: `FR-<PROYECTO>-<FRAMEWORK>`
- Ejemplo: `FR-BAR-RT` (React)

### Versionado
- Semantic Versioning: `v<MAJOR>.<MINOR>.<PATCH>`
- Ejemplo: `v1.0.0`

## 🤝 Contribución

1. Crear branch desde `main`: `feature/<nombre>`
2. Desarrollar y testear localmente
3. Crear Pull Request con descripción detallada
4. Code review y merge

## 📄 Licencia
Proyecto educativo - Universidad

## 👥 Contacto
Equipo de Desarrollo - Diseño de Algoritmos


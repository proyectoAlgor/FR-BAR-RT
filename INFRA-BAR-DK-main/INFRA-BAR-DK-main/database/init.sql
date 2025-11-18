-- ================================================
-- Bar Management System - Database Initialization
-- SPRINT 1: Sistema completo de gestión de bar
-- ================================================
-- Funcionalidades incluidas:
-- ✓ Login de Usuario (Autenticación)
-- ✓ Configuración de Roles y Permisos (Autorización)
-- ✓ Configuración de Sedes y Mesas (Infraestructura)
-- ✓ Catálogo Básico de Productos (Bebidas)
-- ================================================

-- ================================================
-- EXTENSIONES
-- ================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS citext;     -- emails case-insensitive

-- ================================================
-- SCHEMA
-- ================================================
CREATE SCHEMA IF NOT EXISTS bar_system;

-- ================================================
-- TIPOS ENUMERADOS
-- ================================================
CREATE TYPE bar_system.table_status AS ENUM ('available', 'occupied', 'reserved');

-- ================================================
-- MÓDULO 1: AUTENTICACIÓN Y AUTORIZACIÓN
-- ================================================

-- Usuarios del sistema
CREATE TABLE IF NOT EXISTS bar_system.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email CITEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    document_number VARCHAR(20) NOT NULL,
    document_type VARCHAR(10) NOT NULL CHECK (document_type IN ('CC', 'CE', 'PP', 'TI', 'RC')),
    venue_id UUID REFERENCES bar_system.locations(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    last_failed_login_at TIMESTAMP WITH TIME ZONE,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(document_number, document_type)
);

-- Roles del sistema (RBAC)
CREATE TABLE IF NOT EXISTS bar_system.roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Relación N:M entre usuarios y roles
CREATE TABLE IF NOT EXISTS bar_system.user_roles (
    user_id UUID NOT NULL,
    role_id INTEGER NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id)
        REFERENCES bar_system.users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id)
        REFERENCES bar_system.roles (id) ON DELETE CASCADE
);

-- Registro de intentos de login (ISO 27001)
CREATE TABLE IF NOT EXISTS bar_system.login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES bar_system.users(id) ON DELETE SET NULL,
    email CITEXT NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    success BOOLEAN NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Registro de cambios de contraseña (ISO 27001)
CREATE TABLE IF NOT EXISTS bar_system.password_reset_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES bar_system.users(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES bar_system.users(id) ON DELETE CASCADE,
    reset_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET NOT NULL,
    user_agent TEXT,
    reset_type VARCHAR(20) NOT NULL DEFAULT 'admin_reset' CHECK (reset_type IN ('admin_reset', 'user_request', 'system_generated'))
);

-- ================================================
-- MÓDULO 2: INFRAESTRUCTURA (SEDES Y MESAS)
-- ================================================

-- Sedes o sucursales del bar
CREATE TABLE IF NOT EXISTS bar_system.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mesas de cada sede
CREATE TABLE IF NOT EXISTS bar_system.tables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL,
    code VARCHAR(50) NOT NULL,
    seats INTEGER NOT NULL CHECK (seats > 0),
    status bar_system.table_status NOT NULL DEFAULT 'available',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (location_id, code),
    CONSTRAINT fk_tables_location FOREIGN KEY (location_id)
        REFERENCES bar_system.locations (id) ON DELETE CASCADE
);

-- ================================================
-- MÓDULO 3: CATÁLOGO DE PRODUCTOS
-- ================================================

-- Categorías de productos
CREATE TABLE IF NOT EXISTS bar_system.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Productos (bebidas y aperitivos)
CREATE TABLE IF NOT EXISTS bar_system.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id)
        REFERENCES bar_system.categories (id) ON DELETE RESTRICT
);

-- ================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE CONSULTAS
-- ================================================

-- Índices de usuarios
CREATE INDEX IF NOT EXISTS idx_users_email ON bar_system.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON bar_system.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON bar_system.users(created_at DESC);

-- Índices de roles
CREATE INDEX IF NOT EXISTS idx_roles_code ON bar_system.roles(code);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON bar_system.roles(is_active);

-- Índices de relación user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON bar_system.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON bar_system.user_roles(role_id);

-- Índices de seguridad
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON bar_system.login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON bar_system.login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON bar_system.login_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_users_is_locked ON bar_system.users(is_locked);
CREATE INDEX IF NOT EXISTS idx_users_locked_until ON bar_system.users(locked_until);

-- Índices de auditoría de contraseñas
CREATE INDEX IF NOT EXISTS idx_password_reset_log_user_id ON bar_system.password_reset_log(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_log_admin_id ON bar_system.password_reset_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_log_reset_at ON bar_system.password_reset_log(reset_at DESC);
CREATE INDEX IF NOT EXISTS idx_password_reset_log_ip ON bar_system.password_reset_log(ip_address);

-- Índices de locations
CREATE INDEX IF NOT EXISTS idx_locations_code ON bar_system.locations(code);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON bar_system.locations(is_active);

-- Índices de tables
CREATE INDEX IF NOT EXISTS idx_tables_location_id ON bar_system.tables(location_id);
CREATE INDEX IF NOT EXISTS idx_tables_status ON bar_system.tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_is_active ON bar_system.tables(is_active);

-- Índices de categorías
CREATE INDEX IF NOT EXISTS idx_categories_name ON bar_system.categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON bar_system.categories(is_active);

-- Índices de productos
CREATE INDEX IF NOT EXISTS idx_products_code ON bar_system.products(code);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON bar_system.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON bar_system.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_name_search ON bar_system.products 
    USING gin(to_tsvector('spanish', name));

-- ================================================
-- FUNCIONES Y TRIGGERS
-- ================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION bar_system.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualización automática de timestamps
CREATE TRIGGER trg_users_updated_at 
    BEFORE UPDATE ON bar_system.users
    FOR EACH ROW EXECUTE FUNCTION bar_system.update_updated_at_column();

CREATE TRIGGER trg_roles_updated_at 
    BEFORE UPDATE ON bar_system.roles
    FOR EACH ROW EXECUTE FUNCTION bar_system.update_updated_at_column();

CREATE TRIGGER trg_locations_updated_at 
    BEFORE UPDATE ON bar_system.locations
    FOR EACH ROW EXECUTE FUNCTION bar_system.update_updated_at_column();

CREATE TRIGGER trg_tables_updated_at 
    BEFORE UPDATE ON bar_system.tables
    FOR EACH ROW EXECUTE FUNCTION bar_system.update_updated_at_column();

CREATE TRIGGER trg_categories_updated_at 
    BEFORE UPDATE ON bar_system.categories
    FOR EACH ROW EXECUTE FUNCTION bar_system.update_updated_at_column();

CREATE TRIGGER trg_products_updated_at 
    BEFORE UPDATE ON bar_system.products
    FOR EACH ROW EXECUTE FUNCTION bar_system.update_updated_at_column();

-- ================================================
-- VISTAS MATERIALIZADAS Y NORMALES
-- ================================================

-- Vista: Usuarios con roles asignados (para consultas frecuentes)
CREATE OR REPLACE VIEW bar_system.v_users_with_roles AS
SELECT 
    u.id,
    u.email,
    u.full_name,
    u.is_active,
    u.created_at,
    u.updated_at,
    COALESCE(array_agg(r.code) FILTER (WHERE r.code IS NOT NULL), '{}') AS role_codes,
    COALESCE(array_agg(r.name) FILTER (WHERE r.name IS NOT NULL), '{}') AS role_names
FROM bar_system.users u
LEFT JOIN bar_system.user_roles ur ON u.id = ur.user_id
LEFT JOIN bar_system.roles r ON ur.role_id = r.id AND r.is_active = TRUE
GROUP BY u.id, u.email, u.full_name, u.is_active, u.created_at, u.updated_at;

-- Vista: Productos con información de categoría
CREATE OR REPLACE VIEW bar_system.v_products_full AS
SELECT 
    p.id,
    p.code,
    p.name,
    p.price_cents,
    ROUND(p.price_cents / 100.0, 2) AS price_decimal,
    p.is_active,
    p.created_at,
    p.updated_at,
    p.category_id,
    c.name AS category_name,
    c.description AS category_description
FROM bar_system.products p
INNER JOIN bar_system.categories c ON p.category_id = c.id;

-- Vista: Mesas con información de sede
CREATE OR REPLACE VIEW bar_system.v_tables_full AS
SELECT 
    t.id,
    t.code AS table_code,
    t.seats,
    t.status,
    t.is_active AS table_active,
    t.created_at,
    t.updated_at,
    l.id AS location_id,
    l.code AS location_code,
    l.name AS location_name,
    l.address AS location_address,
    l.phone AS location_phone,
    l.is_active AS location_active
FROM bar_system.tables t
INNER JOIN bar_system.locations l ON t.location_id = l.id;

-- ================================================
-- DATOS INICIALES: ROLES DEL SISTEMA
-- ================================================

INSERT INTO bar_system.roles (code, name, description) VALUES 
    ('admin', 'Administrator', 'Full system access: user management, roles, venues, products and configuration'),
    ('cashier', 'Cashier', 'Payment management, bill closing and venue reports'),
    ('waiter', 'Waiter', 'Order taking, table management and customer service')
ON CONFLICT (code) DO NOTHING;

-- ================================================
-- DATOS INICIALES: CATEGORÍAS DE PRODUCTOS
-- ================================================

INSERT INTO bar_system.categories (name, description) VALUES 
    ('Cervezas', 'Cervezas nacionales, importadas y artesanales'),
    ('Cócteles', 'Bebidas preparadas con licores y mezcladores'),
    ('Licores', 'Licores puros: whisky, ron, vodka, tequila (shots y copas)'),
    ('Vinos', 'Vinos tintos, blancos y rosados (copas y botellas)'),
    ('Refrescos', 'Bebidas sin alcohol: agua, jugos, gaseosas'),
    ('Aperitivos', 'Snacks y picadas para acompañar bebidas')
ON CONFLICT (name) DO NOTHING;

-- ================================================
-- DATOS DE EJEMPLO: PRODUCTOS (BEBIDAS)
-- ================================================

DO $$
DECLARE
    cat_cervezas UUID;
    cat_cocteles UUID;
    cat_licores UUID;
    cat_vinos UUID;
    cat_refrescos UUID;
    cat_aperitivos UUID;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO cat_cervezas FROM bar_system.categories WHERE name = 'Cervezas';
    SELECT id INTO cat_cocteles FROM bar_system.categories WHERE name = 'Cócteles';
    SELECT id INTO cat_licores FROM bar_system.categories WHERE name = 'Licores';
    SELECT id INTO cat_vinos FROM bar_system.categories WHERE name = 'Vinos';
    SELECT id INTO cat_refrescos FROM bar_system.categories WHERE name = 'Refrescos';
    SELECT id INTO cat_aperitivos FROM bar_system.categories WHERE name = 'Aperitivos';
    
    -- Insertar productos de ejemplo
    INSERT INTO bar_system.products (category_id, code, name, price_cents) VALUES
        -- Cervezas (5 productos)
        (cat_cervezas, 'CERV-001', 'Cerveza Club Colombia', 800),
        (cat_cervezas, 'CERV-002', 'Cerveza Poker', 700),
        (cat_cervezas, 'CERV-003', 'Cerveza Águila', 700),
        (cat_cervezas, 'CERV-004', 'Cerveza Artesanal IPA', 1200),
        (cat_cervezas, 'CERV-005', 'Corona Extra', 1000),
        
        -- Cócteles (5 productos)
        (cat_cocteles, 'COCT-001', 'Mojito', 1500),
        (cat_cocteles, 'COCT-002', 'Margarita', 1800),
        (cat_cocteles, 'COCT-003', 'Piña Colada', 1600),
        (cat_cocteles, 'COCT-004', 'Cuba Libre', 1200),
        (cat_cocteles, 'COCT-005', 'Daiquiri', 1700),
        
        -- Licores (5 productos)
        (cat_licores, 'LIC-001', 'Ron Medellín (shot)', 800),
        (cat_licores, 'LIC-002', 'Aguardiente Antioqueño', 1000),
        (cat_licores, 'LIC-003', 'Whisky Old Parr (copa)', 1500),
        (cat_licores, 'LIC-004', 'Vodka Absolut (shot)', 900),
        (cat_licores, 'LIC-005', 'Tequila José Cuervo (shot)', 1000),
        
        -- Vinos (3 productos)
        (cat_vinos, 'VIN-001', 'Vino Tinto Copa', 1200),
        (cat_vinos, 'VIN-002', 'Vino Blanco Copa', 1200),
        (cat_vinos, 'VIN-003', 'Vino Tinto Botella', 6000),
        
        -- Refrescos (4 productos)
        (cat_refrescos, 'REF-001', 'Agua Mineral', 300),
        (cat_refrescos, 'REF-002', 'Coca-Cola', 500),
        (cat_refrescos, 'REF-003', 'Jugo Natural', 700),
        (cat_refrescos, 'REF-004', 'Limonada Natural', 600),
        
        -- Aperitivos (3 productos)
        (cat_aperitivos, 'APE-001', 'Papas Fritas', 800),
        (cat_aperitivos, 'APE-002', 'Alitas de Pollo', 1500),
        (cat_aperitivos, 'APE-003', 'Nachos con Queso', 1200)
    ON CONFLICT (code) DO NOTHING;
END $$;

-- ================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- ================================================

COMMENT ON SCHEMA bar_system IS 'Schema principal del sistema de gestión de bar - Sprint 1 completo';

-- Comentarios de tablas
COMMENT ON TABLE bar_system.users IS 'Usuarios del sistema con autenticación';
COMMENT ON TABLE bar_system.roles IS 'Roles para control de acceso basado en roles (RBAC)';
COMMENT ON TABLE bar_system.user_roles IS 'Relación many-to-many entre usuarios y roles';
COMMENT ON TABLE bar_system.locations IS 'Sedes o sucursales del bar';
COMMENT ON TABLE bar_system.tables IS 'Mesas disponibles en cada sede';
COMMENT ON TABLE bar_system.categories IS 'Categorías de productos (bebidas y aperitivos)';
COMMENT ON TABLE bar_system.products IS 'Catálogo de productos disponibles';

-- Comentarios de vistas
COMMENT ON VIEW bar_system.v_users_with_roles IS 'Vista desnormalizada de usuarios con sus roles';
COMMENT ON VIEW bar_system.v_products_full IS 'Vista de productos con información completa de categoría';
COMMENT ON VIEW bar_system.v_tables_full IS 'Vista de mesas con información completa de sede';

-- ================================================
-- INSTRUCCIONES DE USO
-- ================================================
-- 1. Crear primer usuario administrador:
--    POST /api/auth/register
--    { "email": "admin@bar.com", "password": "admin123", "full_name": "Administrador" }
--
-- 2. Asignar rol admin al primer usuario:
--    INSERT INTO bar_system.user_roles (user_id, role_id) 
--    VALUES ('<user_id>', 1);
--
-- 3. Login:
--    POST /api/auth/login
--    { "email": "admin@bar.com", "password": "admin123" }
-- ================================================
-- FIN DEL SCRIPT - SPRINT 1 COMPLETO
-- ================================================

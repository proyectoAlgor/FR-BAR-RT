-- ================================================
-- SPRINT 3: Tablas de Ventas y Pagos
-- Ejecutar en base de datos existente
-- ================================================

-- Tipos enumerados para órdenes y pagos
DO $$ BEGIN
    CREATE TYPE bar_system.order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled', 'closed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bar_system.payment_method AS ENUM ('cash', 'card', 'transfer', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE bar_system.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Órdenes/Pedidos
CREATE TABLE IF NOT EXISTS bar_system.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    table_id UUID NOT NULL REFERENCES bar_system.tables(id) ON DELETE RESTRICT,
    location_id UUID NOT NULL REFERENCES bar_system.locations(id) ON DELETE RESTRICT,
    waiter_id UUID REFERENCES bar_system.users(id) ON DELETE SET NULL,
    cashier_id UUID REFERENCES bar_system.users(id) ON DELETE SET NULL,
    status bar_system.order_status NOT NULL DEFAULT 'pending',
    subtotal_cents INTEGER NOT NULL DEFAULT 0 CHECK (subtotal_cents >= 0),
    tax_cents INTEGER NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
    discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
    total_cents INTEGER NOT NULL DEFAULT 0 CHECK (total_cents >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Items de orden (productos en cada orden)
CREATE TABLE IF NOT EXISTS bar_system.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES bar_system.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES bar_system.products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
    subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Pagos
CREATE TABLE IF NOT EXISTS bar_system.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES bar_system.orders(id) ON DELETE CASCADE,
    cashier_id UUID NOT NULL REFERENCES bar_system.users(id) ON DELETE RESTRICT,
    amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
    payment_method bar_system.payment_method NOT NULL,
    payment_status bar_system.payment_status NOT NULL DEFAULT 'pending',
    reference_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices de órdenes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON bar_system.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON bar_system.orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_location_id ON bar_system.orders(location_id);
CREATE INDEX IF NOT EXISTS idx_orders_waiter_id ON bar_system.orders(waiter_id);
CREATE INDEX IF NOT EXISTS idx_orders_cashier_id ON bar_system.orders(cashier_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON bar_system.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON bar_system.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_closed_at ON bar_system.orders(closed_at DESC);

-- Índices de items de orden
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON bar_system.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON bar_system.order_items(product_id);

-- Índices de pagos
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON bar_system.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_cashier_id ON bar_system.payments(cashier_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_method ON bar_system.payments(payment_method);
CREATE INDEX IF NOT EXISTS idx_payments_payment_status ON bar_system.payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON bar_system.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_completed_at ON bar_system.payments(completed_at DESC);

-- Trigger para actualizar updated_at
CREATE TRIGGER trg_orders_updated_at 
    BEFORE UPDATE ON bar_system.orders
    FOR EACH ROW EXECUTE FUNCTION bar_system.update_updated_at_column();

-- Comentarios
COMMENT ON TABLE bar_system.orders IS 'Órdenes/Pedidos de clientes';
COMMENT ON TABLE bar_system.order_items IS 'Items/productos en cada orden';
COMMENT ON TABLE bar_system.payments IS 'Pagos realizados por los clientes';


-- ================================================
-- DATOS DE EJEMPLO PARA EL SISTEMA DE BAR
-- Este script inserta datos de prueba para poder
-- generar reportes y probar todas las funcionalidades
-- ================================================

-- Limpiar datos existentes (opcional, comentar si no quieres borrar datos)
-- TRUNCATE TABLE bar_system.order_items CASCADE;
-- TRUNCATE TABLE bar_system.payments CASCADE;
-- TRUNCATE TABLE bar_system.orders CASCADE;
-- TRUNCATE TABLE bar_system.products CASCADE;
-- TRUNCATE TABLE bar_system.categories CASCADE;

-- ================================================
-- CATEGORÍAS DE PRODUCTOS
-- ================================================
INSERT INTO bar_system.categories (id, name, description, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Cervezas', 'Cervezas nacionales e importadas', true),
('550e8400-e29b-41d4-a716-446655440002', 'Licores', 'Whisky, Ron, Vodka, Tequila', true),
('550e8400-e29b-41d4-a716-446655440003', 'Cocteles', 'Bebidas mezcladas y cócteles', true),
('550e8400-e29b-41d4-a716-446655440004', 'Vinos', 'Vinos tintos, blancos y espumosos', true),
('550e8400-e29b-41d4-a716-446655440005', 'Aperitivos', 'Snacks y acompañamientos', true),
('550e8400-e29b-41d4-a716-446655440006', 'Bebidas Sin Alcohol', 'Refrescos, jugos, agua', true)
ON CONFLICT DO NOTHING;

-- ================================================
-- PRODUCTOS
-- ================================================
INSERT INTO bar_system.products (id, category_id, code, name, price_cents, is_active) VALUES
-- Cervezas
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'CER-001', 'Aguila', 5000, true),
('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'CER-002', 'Poker', 5000, true),
('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'CER-003', 'Club Colombia', 6000, true),
('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'CER-004', 'Corona', 8000, true),
('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'CER-005', 'Heineken', 8500, true),

-- Licores
('660e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'LIC-001', 'Ron Medellín', 12000, true),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'LIC-002', 'Ron Viejo de Caldas', 15000, true),
('660e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440002', 'LIC-003', 'Whisky Old Parr', 25000, true),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440002', 'LIC-004', 'Vodka Smirnoff', 18000, true),
('660e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440002', 'LIC-005', 'Tequila Jose Cuervo', 20000, true),

-- Cocteles
('660e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440003', 'COC-001', 'Mojito', 15000, true),
('660e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440003', 'COC-002', 'Piña Colada', 18000, true),
('660e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440003', 'COC-003', 'Margarita', 20000, true),
('660e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440003', 'COC-004', 'Cuba Libre', 12000, true),
('660e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440003', 'COC-005', 'Daiquiri', 16000, true),

-- Vinos
('660e8400-e29b-41d4-a716-446655440016', '550e8400-e29b-41d4-a716-446655440004', 'VIN-001', 'Vino Tinto Casa', 25000, true),
('660e8400-e29b-41d4-a716-446655440017', '550e8400-e29b-41d4-a716-446655440004', 'VIN-002', 'Vino Blanco Casa', 25000, true),
('660e8400-e29b-41d4-a716-446655440018', '550e8400-e29b-41d4-a716-446655440004', 'VIN-003', 'Champagne', 45000, true),

-- Aperitivos
('660e8400-e29b-41d4-a716-446655440019', '550e8400-e29b-41d4-a716-446655440005', 'APE-001', 'Papas Fritas', 8000, true),
('660e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440005', 'APE-002', 'Nachos con Queso', 12000, true),
('660e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440005', 'APE-003', 'Alitas de Pollo', 15000, true),
('660e8400-e29b-41d4-a716-446655440022', '550e8400-e29b-41d4-a716-446655440005', 'APE-004', 'Empanadas (3 unidades)', 10000, true),

-- Bebidas Sin Alcohol
('660e8400-e29b-41d4-a716-446655440023', '550e8400-e29b-41d4-a716-446655440006', 'BEB-001', 'Coca Cola', 4000, true),
('660e8400-e29b-41d4-a716-446655440024', '550e8400-e29b-41d4-a716-446655440006', 'BEB-002', 'Agua con Gas', 3000, true),
('660e8400-e29b-41d4-a716-446655440025', '550e8400-e29b-41d4-a716-446655440006', 'BEB-003', 'Jugo de Naranja', 5000, true),
('660e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440006', 'BEB-004', 'Limonada', 6000, true)
ON CONFLICT DO NOTHING;

-- ================================================
-- ÓRDENES DE EJEMPLO (últimos 30 días)
-- ================================================

-- Función auxiliar para generar números de orden
DO $$
DECLARE
    location_id_var UUID;
    table_id_var UUID;
    waiter_id_var UUID;
    cashier_id_var UUID;
    order_id_var UUID;
    product_id_var UUID;
    i INTEGER;
    order_date TIMESTAMP WITH TIME ZONE;
    order_number VARCHAR(50);
BEGIN
    -- Obtener IDs existentes
    SELECT id INTO location_id_var FROM bar_system.locations LIMIT 1;
    SELECT id INTO table_id_var FROM bar_system.tables WHERE location_id = location_id_var LIMIT 1;
    SELECT id INTO waiter_id_var FROM bar_system.users WHERE is_active = true LIMIT 1;
    SELECT id INTO cashier_id_var FROM bar_system.users WHERE is_active = true LIMIT 1;
    
    -- Si no hay datos base, salir
    IF location_id_var IS NULL OR table_id_var IS NULL OR waiter_id_var IS NULL THEN
        RAISE NOTICE 'No hay datos base (locations, tables, users). Por favor crea primero estos datos.';
        RETURN;
    END IF;

    -- Crear órdenes de los últimos 30 días
    FOR i IN 1..50 LOOP
        -- Fecha aleatoria en los últimos 30 días
        order_date := CURRENT_TIMESTAMP - (random() * interval '30 days');
        order_number := 'ORD-' || TO_CHAR(order_date, 'YYYYMMDD') || '-' || LPAD(i::TEXT, 4, '0');
        
        -- Crear orden
        INSERT INTO bar_system.orders (
            id, order_number, table_id, location_id, waiter_id, cashier_id,
            status, subtotal_cents, tax_cents, discount_cents, total_cents,
            created_at, closed_at
        ) VALUES (
            gen_random_uuid(),
            order_number,
            table_id_var,
            location_id_var,
            waiter_id_var,
            CASE WHEN random() > 0.3 THEN cashier_id_var ELSE NULL END, -- 70% tienen cajero
            CASE 
                WHEN random() > 0.7 THEN 'closed'::bar_system.order_status
                WHEN random() > 0.5 THEN 'delivered'::bar_system.order_status
                WHEN random() > 0.3 THEN 'ready'::bar_system.order_status
                ELSE 'pending'::bar_system.order_status
            END,
            0, -- Se calculará después
            0, -- Se calculará después
            CASE WHEN random() > 0.8 THEN (random() * 5000)::INTEGER ELSE 0 END, -- 20% tienen descuento
            0, -- Se calculará después
            order_date,
            CASE WHEN random() > 0.7 THEN order_date + (random() * interval '2 hours') ELSE NULL END
        ) RETURNING id INTO order_id_var;
        
        -- Agregar items a la orden (1-5 productos aleatorios)
        FOR j IN 1..(1 + (random() * 4)::INTEGER) LOOP
            SELECT id INTO product_id_var 
            FROM bar_system.products 
            WHERE is_active = true 
            ORDER BY random() 
            LIMIT 1;
            
            IF product_id_var IS NOT NULL THEN
                INSERT INTO bar_system.order_items (
                    order_id, product_id, quantity, unit_price_cents, subtotal_cents
                ) VALUES (
                    order_id_var,
                    product_id_var,
                    (1 + (random() * 3)::INTEGER), -- Cantidad 1-4
                    (SELECT price_cents FROM bar_system.products WHERE id = product_id_var),
                    (SELECT price_cents FROM bar_system.products WHERE id = product_id_var) * (1 + (random() * 3)::INTEGER)
                );
            END IF;
        END LOOP;
        
        -- Actualizar totales de la orden
        UPDATE bar_system.orders
        SET 
            subtotal_cents = (
                SELECT COALESCE(SUM(subtotal_cents), 0)
                FROM bar_system.order_items
                WHERE order_id = order_id_var
            ),
            tax_cents = (
                SELECT COALESCE(SUM(subtotal_cents), 0) * 0.19
                FROM bar_system.order_items
                WHERE order_id = order_id_var
            )::INTEGER,
            total_cents = (
                SELECT COALESCE(SUM(subtotal_cents), 0) * 1.19 - discount_cents
                FROM bar_system.order_items
                WHERE order_id = order_id_var
            )::INTEGER
        WHERE id = order_id_var;
        
        -- Crear pagos para órdenes cerradas
        IF (SELECT status FROM bar_system.orders WHERE id = order_id_var) = 'closed' THEN
            DECLARE
                total_order INTEGER;
                payment_amount INTEGER;
                payment_method_var bar_system.payment_method;
            BEGIN
                SELECT total_cents INTO total_order FROM bar_system.orders WHERE id = order_id_var;
                
                -- 70% pago único, 30% múltiples pagos
                IF random() > 0.3 THEN
                    -- Pago único
                    payment_method_var := CASE 
                        WHEN random() > 0.6 THEN 'cash'::bar_system.payment_method
                        WHEN random() > 0.3 THEN 'card'::bar_system.payment_method
                        ELSE 'transfer'::bar_system.payment_method
                    END;
                    
                    INSERT INTO bar_system.payments (
                        order_id, cashier_id, amount_cents, payment_method,
                        payment_status, reference_number, created_at, completed_at
                    ) VALUES (
                        order_id_var,
                        cashier_id_var,
                        total_order,
                        payment_method_var,
                        'completed'::bar_system.payment_status,
                        CASE WHEN payment_method_var != 'cash' THEN 'REF-' || LPAD((random() * 1000000)::INTEGER::TEXT, 6, '0') ELSE NULL END,
                        (SELECT closed_at FROM bar_system.orders WHERE id = order_id_var),
                        (SELECT closed_at FROM bar_system.orders WHERE id = order_id_var)
                    );
                ELSE
                    -- Múltiples pagos (2-3 pagos)
                    DECLARE
                        remaining INTEGER := total_order;
                        payment_count INTEGER := 2 + (random() * 1)::INTEGER;
                        partial_amount INTEGER;
                    BEGIN
                        FOR k IN 1..payment_count LOOP
                            IF k = payment_count THEN
                                partial_amount := remaining;
                            ELSE
                                partial_amount := (remaining * (0.4 + random() * 0.3))::INTEGER;
                                remaining := remaining - partial_amount;
                            END IF;
                            
                            payment_method_var := CASE 
                                WHEN random() > 0.6 THEN 'cash'::bar_system.payment_method
                                WHEN random() > 0.3 THEN 'card'::bar_system.payment_method
                                ELSE 'transfer'::bar_system.payment_method
                            END;
                            
                            INSERT INTO bar_system.payments (
                                order_id, cashier_id, amount_cents, payment_method,
                                payment_status, reference_number, created_at, completed_at
                            ) VALUES (
                                order_id_var,
                                cashier_id_var,
                                partial_amount,
                                payment_method_var,
                                'completed'::bar_system.payment_status,
                                CASE WHEN payment_method_var != 'cash' THEN 'REF-' || LPAD((random() * 1000000)::INTEGER::TEXT, 6, '0') ELSE NULL END,
                                (SELECT closed_at FROM bar_system.orders WHERE id = order_id_var) - (interval '1 minute' * k),
                                (SELECT closed_at FROM bar_system.orders WHERE id = order_id_var) - (interval '1 minute' * k)
                            );
                        END LOOP;
                    END;
                END IF;
            END;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Se crearon 50 órdenes de ejemplo con sus items y pagos';
END $$;

-- ================================================
-- RESUMEN DE DATOS INSERTADOS
-- ================================================
DO $$
DECLARE
    cat_count INTEGER;
    prod_count INTEGER;
    order_count INTEGER;
    payment_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO cat_count FROM bar_system.categories;
    SELECT COUNT(*) INTO prod_count FROM bar_system.products;
    SELECT COUNT(*) INTO order_count FROM bar_system.orders;
    SELECT COUNT(*) INTO payment_count FROM bar_system.payments;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATOS DE EJEMPLO INSERTADOS:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Categorías: %', cat_count;
    RAISE NOTICE 'Productos: %', prod_count;
    RAISE NOTICE 'Órdenes: %', order_count;
    RAISE NOTICE 'Pagos: %', payment_count;
    RAISE NOTICE '========================================';
END $$;


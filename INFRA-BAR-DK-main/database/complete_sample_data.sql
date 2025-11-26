-- ================================================
-- DATOS COMPLETOS DE EJEMPLO PARA EL SISTEMA
-- Este script crea todos los datos necesarios para
-- probar el sistema y generar reportes
-- ================================================

-- ================================================
-- 1. SEDES (LOCATIONS)
-- ================================================
INSERT INTO bar_system.locations (id, code, name, address, phone, is_active) VALUES
('770e8400-e29b-41d4-a716-446655440001', 'SED-001', 'Bar Principal - Centro', 'Calle 50 #45-30, Medellín', '+57 4 123 4567', true),
('770e8400-e29b-41d4-a716-446655440002', 'SED-002', 'Bar Sucursal - Poblado', 'Carrera 43A #1-50, Medellín', '+57 4 234 5678', true)
ON CONFLICT DO NOTHING;

-- ================================================
-- 2. MESAS (TABLES)
-- ================================================
INSERT INTO bar_system.tables (id, location_id, code, seats, status, is_active) VALUES
-- Mesas para Sede 1
('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'MESA-01', 2, 'available', true),
('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'MESA-02', 4, 'available', true),
('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'MESA-03', 4, 'available', true),
('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 'MESA-04', 6, 'available', true),
('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001', 'MESA-05', 2, 'available', true),
-- Mesas para Sede 2
('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', 'MESA-01', 4, 'available', true),
('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', 'MESA-02', 6, 'available', true),
('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440002', 'MESA-03', 2, 'available', true)
ON CONFLICT DO NOTHING;

-- ================================================
-- 3. USUARIOS ADICIONALES (si no existen)
-- ================================================
-- Nota: Estos usuarios se crearán solo si no existen usuarios con esos emails
-- Las contraseñas deben ser hasheadas, así que estos son solo ejemplos
-- En producción, usa el endpoint de registro o el script de inicialización

-- ================================================
-- 4. VERIFICAR Y CREAR ÓRDENES DE EJEMPLO
-- ================================================
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
    order_count INTEGER;
BEGIN
    -- Obtener IDs existentes
    SELECT id INTO location_id_var FROM bar_system.locations WHERE is_active = true LIMIT 1;
    SELECT id INTO table_id_var FROM bar_system.tables WHERE location_id = location_id_var AND is_active = true LIMIT 1;
    SELECT id INTO waiter_id_var FROM bar_system.users WHERE is_active = true LIMIT 1;
    SELECT id INTO cashier_id_var FROM bar_system.users WHERE is_active = true LIMIT 1;
    
    -- Verificar si ya hay órdenes
    SELECT COUNT(*) INTO order_count FROM bar_system.orders;
    
    -- Si no hay datos base, salir
    IF location_id_var IS NULL OR table_id_var IS NULL OR waiter_id_var IS NULL THEN
        RAISE NOTICE 'No hay datos base suficientes. Verifica que existan locations, tables y users.';
        RETURN;
    END IF;
    
    -- Si ya hay órdenes, no crear más
    IF order_count > 0 THEN
        RAISE NOTICE 'Ya existen % órdenes en el sistema. No se crearán más.', order_count;
        RETURN;
    END IF;

    RAISE NOTICE 'Creando 50 órdenes de ejemplo...';

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
            CASE WHEN random() > 0.3 THEN cashier_id_var ELSE NULL END,
            CASE 
                WHEN random() > 0.7 THEN 'closed'::bar_system.order_status
                WHEN random() > 0.5 THEN 'delivered'::bar_system.order_status
                WHEN random() > 0.3 THEN 'ready'::bar_system.order_status
                ELSE 'pending'::bar_system.order_status
            END,
            0,
            0,
            CASE WHEN random() > 0.8 THEN (random() * 5000)::INTEGER ELSE 0 END,
            0,
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
                    (1 + (random() * 3)::INTEGER),
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
-- RESUMEN FINAL
-- ================================================
DO $$
DECLARE
    cat_count INTEGER;
    prod_count INTEGER;
    loc_count INTEGER;
    table_count INTEGER;
    order_count INTEGER;
    payment_count INTEGER;
    item_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO cat_count FROM bar_system.categories;
    SELECT COUNT(*) INTO prod_count FROM bar_system.products;
    SELECT COUNT(*) INTO loc_count FROM bar_system.locations;
    SELECT COUNT(*) INTO table_count FROM bar_system.tables;
    SELECT COUNT(*) INTO order_count FROM bar_system.orders;
    SELECT COUNT(*) INTO payment_count FROM bar_system.payments;
    SELECT COUNT(*) INTO item_count FROM bar_system.order_items;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATOS DE EJEMPLO EN EL SISTEMA:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Categorías: %', cat_count;
    RAISE NOTICE 'Productos: %', prod_count;
    RAISE NOTICE 'Sedes: %', loc_count;
    RAISE NOTICE 'Mesas: %', table_count;
    RAISE NOTICE 'Órdenes: %', order_count;
    RAISE NOTICE 'Items de Orden: %', item_count;
    RAISE NOTICE 'Pagos: %', payment_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'El sistema está listo para generar reportes!';
    RAISE NOTICE '========================================';
END $$;


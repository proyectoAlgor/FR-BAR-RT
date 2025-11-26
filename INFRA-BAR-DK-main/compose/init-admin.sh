#!/bin/bash

echo "🔐 Inicializando usuario administrador..."

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

# Verificar si el usuario admin ya existe
echo "🔍 Verificando si el usuario admin ya existe..."
ADMIN_EXISTS=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@bar.com", "password": "admin123"}' | jq -r '.token // empty')

if [ -n "$ADMIN_EXISTS" ]; then
  echo "✅ Usuario admin ya existe y está configurado correctamente"
  exit 0
fi

# Crear usuario admin
echo "📝 Creando usuario administrador..."
USER_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bar.com",
    "password": "admin123",
    "first_name": "Administrador",
    "last_name": "del Sistema",
    "document_number": "12345678",
    "document_type": "CC"
  }')

USER_ID=$(echo "$USER_RESPONSE" | jq -r '.id // empty')

if [ -z "$USER_ID" ]; then
  echo "❌ Error al crear usuario admin: $USER_RESPONSE"
  exit 1
fi

echo "✅ Usuario admin creado con ID: $USER_ID"

# Asignar rol de administrador
echo "🔑 Asignando rol de administrador..."
docker compose exec postgres-db psql -U bar_user -d bar_management_db -c \
  "INSERT INTO bar_system.user_roles (user_id, role_id) VALUES ('$USER_ID', 1) ON CONFLICT DO NOTHING;" > /dev/null 2>&1

echo "✅ Rol de administrador asignado"

# Verificar que todo funciona
echo "🔍 Verificando configuración..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@bar.com", "password": "admin123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')

if [ -n "$TOKEN" ]; then
  echo "✅ Login exitoso - Sistema listo para usar"
  echo "📋 Credenciales:"
  echo "   Email: admin@bar.com"
  echo "   Password: admin123"
else
  echo "❌ Error en la verificación final"
  exit 1
fi

echo "🎉 Inicialización completada exitosamente"

# Script para inicializar el usuario administrador
# Bar Management System

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  INICIALIZACION DE USUARIO ADMINISTRADOR" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Esperar a que los servicios estén listos
Write-Host "[INFO] Esperando a que los servicios esten listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Verificar si el usuario admin ya existe y funciona
Write-Host "[INFO] Verificando si el usuario admin ya existe..." -ForegroundColor Yellow
$loginTest = @{
    email = "admin@bar.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginTest `
        -ErrorAction SilentlyContinue
    
    if ($response.token) {
        Write-Host "[OK] Usuario admin ya existe y funciona correctamente" -ForegroundColor Green
        Write-Host "  Token obtenido: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
        exit 0
    }
} catch {
    Write-Host "[INFO] Usuario admin no existe o la contraseña es incorrecta" -ForegroundColor Yellow
}

# Eliminar usuario existente si hay problema
Write-Host "[INFO] Limpiando usuario admin existente si existe..." -ForegroundColor Yellow
try {
    $composeDir = Join-Path $PSScriptRoot "INFRA-BAR-DK-main\compose"
    Set-Location $composeDir
    docker compose exec -T postgres-db psql -U bar_user -d bar_management_db -c `
        "DELETE FROM bar_system.user_roles WHERE user_id IN (SELECT id FROM bar_system.users WHERE email = 'admin@bar.com');" 2>&1 | Out-Null
    docker compose exec -T postgres-db psql -U bar_user -d bar_management_db -c `
        "DELETE FROM bar_system.users WHERE email = 'admin@bar.com';" 2>&1 | Out-Null
} catch {
    Write-Host "[INFO] No se pudo limpiar usuario existente (puede que no exista)" -ForegroundColor Gray
}

# Crear usuario admin
Write-Host "[INFO] Creando usuario administrador..." -ForegroundColor Cyan
$registerData = @{
    email = "admin@bar.com"
    password = "admin123"
    first_name = "Administrador"
    last_name = "del Sistema"
    document_number = "12345678"
    document_type = "CC"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerData
    
    if ($registerResponse.id) {
        $userId = $registerResponse.id
        Write-Host "[OK] Usuario admin creado con ID: $userId" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] No se recibio ID del usuario creado" -ForegroundColor Red
        exit 1
    }
} catch {
    $errorMessage = $_.Exception.Message
    if ($errorMessage -like "*already exists*") {
        Write-Host "[INFO] El usuario ya existe, obteniendo ID..." -ForegroundColor Yellow
        try {
            $composeDir = Join-Path $PSScriptRoot "INFRA-BAR-DK-main\compose"
            Set-Location $composeDir
            $result = docker compose exec -T postgres-db psql -U bar_user -d bar_management_db -t -c `
                "SELECT id FROM bar_system.users WHERE email = 'admin@bar.com';"
            $userId = $result.Trim()
        } catch {
            Write-Host "[ERROR] No se pudo obtener el ID del usuario" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "[ERROR] Error al crear usuario: $errorMessage" -ForegroundColor Red
        Write-Host "  Respuesta completa: $($_.Exception.Response)" -ForegroundColor Gray
        exit 1
    }
}

# Asignar rol de administrador
Write-Host "[INFO] Asignando rol de administrador..." -ForegroundColor Cyan
try {
    $composeDir = Join-Path $PSScriptRoot "INFRA-BAR-DK-main\compose"
    Set-Location $composeDir
    $roleResult = docker compose exec -T postgres-db psql -U bar_user -d bar_management_db -c `
        "INSERT INTO bar_system.user_roles (user_id, role_id) VALUES ('$userId', 1) ON CONFLICT DO NOTHING;"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Rol de administrador asignado" -ForegroundColor Green
    } else {
        Write-Host "[ADVERTENCIA] Puede que el rol ya este asignado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERROR] Error al asignar rol: $_" -ForegroundColor Red
    exit 1
}

# Verificar que todo funciona
Write-Host "[INFO] Verificando configuracion..." -ForegroundColor Cyan
Start-Sleep -Seconds 2

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginTest
    
    if ($loginResponse.token) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "  [OK] LOGIN EXITOSO - SISTEMA LISTO" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Credenciales de acceso:" -ForegroundColor Cyan
        Write-Host "  Email: admin@bar.com" -ForegroundColor White
        Write-Host "  Password: admin123" -ForegroundColor White
        Write-Host ""
        Write-Host "Token generado: $($loginResponse.token.Substring(0, 30))..." -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "[ERROR] Login fallo - no se recibio token" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERROR] Error en la verificacion final: $_" -ForegroundColor Red
    Write-Host "  Intenta hacer login manualmente desde la aplicacion" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Inicializacion completada exitosamente!" -ForegroundColor Green
Write-Host ""


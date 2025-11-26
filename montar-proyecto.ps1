# ================================================
# Script para montar el proyecto completo
# Bar Management System
# ================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  MONTAJE DEL PROYECTO - BAR MANAGEMENT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker esté instalado
Write-Host "[1/5] Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está instalado"
    }
    Write-Host "  [OK] Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Docker no esta instalado" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Por favor, instala Docker Desktop desde:" -ForegroundColor Yellow
    Write-Host "  https://www.docker.com/products/docker-desktop" -ForegroundColor White
    exit 1
}

# Verificar que Docker esté corriendo
Write-Host "[2/5] Verificando que Docker esté corriendo..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está corriendo"
    }
    Write-Host "  [OK] Docker esta corriendo" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Docker Desktop no esta corriendo" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Por favor, inicia Docker Desktop y espera a que esté completamente iniciado." -ForegroundColor Yellow
    Write-Host "  Luego ejecuta este script nuevamente." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Intentando iniciar Docker Desktop..." -ForegroundColor Cyan
    try {
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
        Write-Host "  [INFO] Esperando 30 segundos a que Docker Desktop inicie..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Verificar nuevamente
        $maxRetries = 10
        $retryCount = 0
        while ($retryCount -lt $maxRetries) {
            docker ps | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  [OK] Docker esta corriendo ahora" -ForegroundColor Green
                break
            }
            $retryCount++
            Write-Host "  [INFO] Esperando... ($retryCount/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
        
        if ($retryCount -eq $maxRetries) {
            Write-Host "  [ERROR] Docker Desktop no inicio correctamente" -ForegroundColor Red
            Write-Host "  Por favor, inicia Docker Desktop manualmente y vuelve a ejecutar este script" -ForegroundColor Yellow
            exit 1
        }
    } catch {
        Write-Host "  [ERROR] No se pudo iniciar Docker Desktop automaticamente" -ForegroundColor Red
        Write-Host "  Por favor, inicia Docker Desktop manualmente" -ForegroundColor Yellow
        exit 1
    }
}

# Verificar archivo .env
Write-Host "[3/5] Verificando configuración..." -ForegroundColor Yellow
$composeDir = Join-Path $PSScriptRoot "INFRA-BAR-DK-main\compose"
$envFile = Join-Path $composeDir ".env"
$envExample = Join-Path $composeDir "env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Write-Host "  [ADVERTENCIA] Archivo .env no encontrado, usando valores por defecto" -ForegroundColor Yellow
        Write-Host "  (Puedes crear .env desde env.example si necesitas personalizar)" -ForegroundColor Gray
    }
} else {
    Write-Host "  [OK] Archivo .env encontrado" -ForegroundColor Green
}

# Navegar al directorio de compose
if (-not (Test-Path $composeDir)) {
    Write-Host "  [ERROR] No se encuentra el directorio: $composeDir" -ForegroundColor Red
    exit 1
}

Set-Location $composeDir
Write-Host "  [OK] Directorio de compose: $composeDir" -ForegroundColor Green

# Construir imágenes
Write-Host ""
Write-Host "[4/5] Construyendo imágenes Docker..." -ForegroundColor Blue
Write-Host "  (Esto puede tardar varios minutos la primera vez)" -ForegroundColor Gray
docker compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  [ERROR] Error al construir las imagenes" -ForegroundColor Red
    Write-Host "  Revisa los logs arriba para más detalles" -ForegroundColor Yellow
    exit 1
}

Write-Host "  [OK] Imagenes construidas correctamente" -ForegroundColor Green

# Levantar servicios
Write-Host ""
Write-Host "[5/5] Levantando servicios..." -ForegroundColor Green
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  [ERROR] Error al levantar los servicios" -ForegroundColor Red
    Write-Host "  Revisa los logs arriba para más detalles" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "  [OK] PROYECTO MONTADO CORRECTAMENTE" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Esperar a que los servicios estén listos
Write-Host "[INFO] Esperando a que los servicios esten listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Mostrar estado
Write-Host ""
Write-Host "[INFO] Estado de los servicios:" -ForegroundColor Cyan
docker compose ps

Write-Host ""
Write-Host "[INFO] Acceder a la aplicacion:" -ForegroundColor Cyan
Write-Host "   URL: http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Credenciales por defecto:" -ForegroundColor Cyan
Write-Host "   Email: admin@bar.com" -ForegroundColor White
Write-Host "   Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "[INFO] Comandos utiles:" -ForegroundColor Cyan
Write-Host "   Ver logs:        docker compose logs -f" -ForegroundColor White
Write-Host "   Ver estado:      docker compose ps" -ForegroundColor White
Write-Host "   Detener:         docker compose down" -ForegroundColor White
Write-Host "   Reiniciar:       docker compose restart" -ForegroundColor White
Write-Host ""

# Inicializar usuario admin (opcional)
Write-Host "[PREGUNTA] Deseas inicializar el usuario administrador ahora? (S/N)" -ForegroundColor Yellow
Write-Host "   (Si es la primera vez que montas el proyecto, responde S)" -ForegroundColor Gray
$response = Read-Host

if ($response -eq "S" -or $response -eq "s" -or $response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "[INFO] Inicializando usuario administrador..." -ForegroundColor Cyan
    
    # Esperar un poco más para que los servicios estén completamente listos
    Start-Sleep -Seconds 5
    
    # Verificar si el script init-admin.sh existe (para Linux/Mac)
    $initScript = Join-Path $composeDir "init-admin.sh"
    if (Test-Path $initScript) {
        Write-Host "  Ejecutando script de inicialización..." -ForegroundColor Yellow
        # En Windows, necesitamos usar WSL o Git Bash, o crear un script PowerShell equivalente
        Write-Host "  [ADVERTENCIA] Script bash detectado. Para Windows, puedes:" -ForegroundColor Yellow
        Write-Host "     1. Usar WSL: wsl bash init-admin.sh" -ForegroundColor White
        Write-Host "     2. O crear el usuario manualmente desde la aplicación" -ForegroundColor White
    } else {
        Write-Host "  [INFO] El usuario admin se creara automaticamente al iniciar sesion" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "[OK] Proyecto listo para usar!" -ForegroundColor Green
Write-Host ""


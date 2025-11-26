# Script para construir y levantar los servicios del proyecto
# Ejecutar desde la raíz del proyecto

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "CONSTRUYENDO Y LEVANTANDO SERVICIOS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que Docker esté instalado
Write-Host "🔍 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está instalado"
    }
    Write-Host "✅ Docker encontrado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "   Por favor, instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar que Docker esté corriendo
Write-Host "🔍 Verificando que Docker esté corriendo..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker no está corriendo"
    }
    Write-Host "✅ Docker está corriendo" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Docker Desktop no está corriendo" -ForegroundColor Red
    Write-Host "   Por favor, inicia Docker Desktop y espera a que esté completamente iniciado" -ForegroundColor Yellow
    Write-Host "   Luego ejecuta este script nuevamente" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Navegar al directorio de compose
$composeDir = Join-Path $PSScriptRoot "INFRA-BAR-DK-main\compose"

if (-not (Test-Path $composeDir)) {
    Write-Host "❌ No se encuentra el directorio: $composeDir" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Directorio de compose: $composeDir" -ForegroundColor Yellow
Set-Location $composeDir

Write-Host ""
Write-Host "🔨 Construyendo imágenes Docker..." -ForegroundColor Blue
docker compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al construir las imágenes" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Levantando servicios..." -ForegroundColor Green
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al levantar los servicios" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Servicios levantados correctamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Ver estado de los servicios:" -ForegroundColor Cyan
Write-Host "   docker compose ps" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Acceder a la aplicación:" -ForegroundColor Cyan
Write-Host "   http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "📝 Ver logs:" -ForegroundColor Cyan
Write-Host "   docker compose logs -f" -ForegroundColor White
Write-Host ""


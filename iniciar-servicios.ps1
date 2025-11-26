# Script para iniciar los servicios del proyecto Bar Management
# Ejecutar desde cualquier ubicación

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "INICIANDO SERVICIOS - BAR MANAGEMENT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Buscar el archivo docker-compose.yml del proyecto
$scriptPath = $PSScriptRoot
if ([string]::IsNullOrEmpty($scriptPath)) {
    $scriptPath = Get-Location
}

Write-Host "Buscando docker-compose.yml..." -ForegroundColor Yellow

# Buscar recursivamente el docker-compose.yml en INFRA-BAR-DK-main
$composeFile = Get-ChildItem -Path $scriptPath -Filter "docker-compose.yml" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -like "*INFRA-BAR-DK-main*compose*" } | 
    Select-Object -First 1

if (-not $composeFile) {
    Write-Host "ERROR: No se encontro docker-compose.yml en INFRA-BAR-DK-main\compose" -ForegroundColor Red
    Write-Host "Asegurate de estar en el directorio raiz del proyecto" -ForegroundColor Yellow
    exit 1
}

$composeDir = Split-Path $composeFile.FullName
Write-Host "Encontrado en: $composeDir" -ForegroundColor Green
Write-Host ""

Set-Location $composeDir

# Verificar estado actual
Write-Host "Estado actual de los servicios:" -ForegroundColor Cyan
docker compose ps
Write-Host ""

# Construir si es necesario
Write-Host "Construyendo imagenes (si es necesario)..." -ForegroundColor Blue
docker compose build --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "ADVERTENCIA: Hubo errores al construir. Continuando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Levantando servicios..." -ForegroundColor Green
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al levantar los servicios" -ForegroundColor Red
    Write-Host ""
    Write-Host "Ver logs con: docker compose logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Esperando a que los servicios esten listos..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "SERVICIOS LEVANTADOS!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Estado de los servicios:" -ForegroundColor Cyan
docker compose ps
Write-Host ""
Write-Host "Acceder a la aplicacion:" -ForegroundColor Cyan
Write-Host "  http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "Comandos utiles:" -ForegroundColor Cyan
Write-Host "  Ver logs: docker compose logs -f" -ForegroundColor White
Write-Host "  Detener: docker compose down" -ForegroundColor White
Write-Host "  Reiniciar: docker compose restart" -ForegroundColor White
Write-Host ""


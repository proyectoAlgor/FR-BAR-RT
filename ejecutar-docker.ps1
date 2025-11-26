# Script simple para construir y levantar servicios
# Ejecutar desde PowerShell en la raíz del proyecto

$ErrorActionPreference = "Stop"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "CONSTRUYENDO Y LEVANTANDO SERVICIOS" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio de compose
$currentDir = Get-Location
$composeDir = Join-Path $currentDir "INFRA-BAR-DK-main\compose"

if (-not (Test-Path $composeDir)) {
    Write-Host "ERROR: No se encuentra el directorio compose" -ForegroundColor Red
    Write-Host "Directorio buscado: $composeDir" -ForegroundColor Yellow
    exit 1
}

Write-Host "Cambiando a directorio: $composeDir" -ForegroundColor Yellow
Set-Location $composeDir

Write-Host ""
Write-Host "Construyendo imagenes Docker..." -ForegroundColor Blue
docker compose build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al construir las imagenes" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Levantando servicios..." -ForegroundColor Green
docker compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR al levantar los servicios" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "SERVICIOS LEVANTADOS CORRECTAMENTE!" -ForegroundColor Green
Write-Host ""
Write-Host "Ver estado: docker compose ps" -ForegroundColor Cyan
Write-Host "Ver logs: docker compose logs -f" -ForegroundColor Cyan
Write-Host "Acceder: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""


# PowerShell script equivalente a build-local.sh
$ErrorActionPreference = "Stop"

$DOCKER_REGISTRY = "barmanagement/services"
$VERSION = "v1.0.0"

Write-Host "================================================" -ForegroundColor Blue
Write-Host "BUILD LOCAL - BAR MANAGEMENT SYSTEM" -ForegroundColor Blue
Write-Host "Sprint 1-4: HU1, HU3, HU4, Reportes y Analytics" -ForegroundColor Blue
Write-Host "================================================" -ForegroundColor Blue
Write-Host ""

# Obtener el directorio base (2 niveles arriba desde compose)
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BASE_DIR = Split-Path -Parent (Split-Path -Parent $SCRIPT_DIR)

Write-Host "[1/6] MS-AUTH-GO" -ForegroundColor Blue
Set-Location "$BASE_DIR\MS-AUTH-GO-main"
docker build -t "${DOCKER_REGISTRY}:ms-auth-go-${VERSION}" .
docker tag "${DOCKER_REGISTRY}:ms-auth-go-${VERSION}" "${DOCKER_REGISTRY}:ms-auth-go-latest"
Write-Host "✓ MS-AUTH-GO" -ForegroundColor Green
Write-Host ""

Write-Host "[2/6] MS-VENUE-GO" -ForegroundColor Blue
Set-Location "$BASE_DIR\MS-VENUE-GO-main"
docker build -t "${DOCKER_REGISTRY}:ms-venue-go-${VERSION}" .
docker tag "${DOCKER_REGISTRY}:ms-venue-go-${VERSION}" "${DOCKER_REGISTRY}:ms-venue-go-latest"
Write-Host "✓ MS-VENUE-GO" -ForegroundColor Green
Write-Host ""

Write-Host "[3/6] MS-CATALOG-GO" -ForegroundColor Blue
Set-Location "$BASE_DIR\MS-CATALOG-GO-main"
docker build -t "${DOCKER_REGISTRY}:ms-catalog-go-${VERSION}" .
docker tag "${DOCKER_REGISTRY}:ms-catalog-go-${VERSION}" "${DOCKER_REGISTRY}:ms-catalog-go-latest"
Write-Host "✓ MS-CATALOG-GO" -ForegroundColor Green
Write-Host ""

Write-Host "[4/6] MS-OPTIMIZATION-GO" -ForegroundColor Blue
Set-Location "$BASE_DIR\MS-OPTIMIZATION-GO-main"
docker build -t "${DOCKER_REGISTRY}:ms-optimization-go-${VERSION}" .
docker tag "${DOCKER_REGISTRY}:ms-optimization-go-${VERSION}" "${DOCKER_REGISTRY}:ms-optimization-go-latest"
Write-Host "✓ MS-OPTIMIZATION-GO" -ForegroundColor Green
Write-Host ""

Write-Host "[5/6] MS-REPORTS-GO (Sprint 4)" -ForegroundColor Blue
Set-Location "$BASE_DIR\MS-REPORTS-GO-main"
docker build -t "${DOCKER_REGISTRY}:ms-reports-go-${VERSION}" .
docker tag "${DOCKER_REGISTRY}:ms-reports-go-${VERSION}" "${DOCKER_REGISTRY}:ms-reports-go-latest"
Write-Host "✓ MS-REPORTS-GO" -ForegroundColor Green
Write-Host ""

Write-Host "[6/6] FR-BAR-RT (Frontend React)" -ForegroundColor Blue
Set-Location "$BASE_DIR\FR-BAR-RT-main"
docker build -t "${DOCKER_REGISTRY}:frontend-${VERSION}" .
docker tag "${DOCKER_REGISTRY}:frontend-${VERSION}" "${DOCKER_REGISTRY}:frontend-latest"
Write-Host "✓ FR-BAR-RT" -ForegroundColor Green
Write-Host ""

Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "✓ ALL IMAGES BUILT SUCCESSFULLY" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

docker images | Select-String "$DOCKER_REGISTRY" | Select-Object -First 10
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. cd INFRA-BAR-DK-main\compose" -ForegroundColor Yellow
Write-Host "  2. docker compose up -d" -ForegroundColor Yellow
Write-Host "  3. Access: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""


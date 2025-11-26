#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOCKER_REGISTRY="barmanagement/services"
VERSION="v1.0.0"

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}BUILD LOCAL - BAR MANAGEMENT SYSTEM${NC}"
echo -e "${BLUE}Sprint 1-4: HU1, HU3, HU4, Reportes y Analytics${NC}"
echo -e "${BLUE}================================================${NC}"
echo

# Obtener el directorio base (3 niveles arriba desde compose)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BASE_DIR="$( cd "$SCRIPT_DIR/../.." && pwd )"

echo -e "${BLUE}[1/6] MS-AUTH-GO${NC}"
cd "$BASE_DIR/MS-AUTH-GO-main"
docker build -t ${DOCKER_REGISTRY}:ms-auth-go-${VERSION} .
docker tag ${DOCKER_REGISTRY}:ms-auth-go-${VERSION} ${DOCKER_REGISTRY}:ms-auth-go-latest
echo -e "${GREEN}✓ MS-AUTH-GO${NC}"
echo

echo -e "${BLUE}[2/6] MS-VENUE-GO${NC}"
cd "$BASE_DIR/MS-VENUE-GO-main"
docker build -t ${DOCKER_REGISTRY}:ms-venue-go-${VERSION} .
docker tag ${DOCKER_REGISTRY}:ms-venue-go-${VERSION} ${DOCKER_REGISTRY}:ms-venue-go-latest
echo -e "${GREEN}✓ MS-VENUE-GO${NC}"
echo

echo -e "${BLUE}[3/6] MS-CATALOG-GO${NC}"
cd "$BASE_DIR/MS-CATALOG-GO-main"
docker build -t ${DOCKER_REGISTRY}:ms-catalog-go-${VERSION} .
docker tag ${DOCKER_REGISTRY}:ms-catalog-go-${VERSION} ${DOCKER_REGISTRY}:ms-catalog-go-latest
echo -e "${GREEN}✓ MS-CATALOG-GO${NC}"
echo

echo -e "${BLUE}[4/6] MS-OPTIMIZATION-GO${NC}"
cd "$BASE_DIR/MS-OPTIMIZATION-GO-main"
docker build -t ${DOCKER_REGISTRY}:ms-optimization-go-${VERSION} .
docker tag ${DOCKER_REGISTRY}:ms-optimization-go-${VERSION} ${DOCKER_REGISTRY}:ms-optimization-go-latest
echo -e "${GREEN}✓ MS-OPTIMIZATION-GO${NC}"
echo

echo -e "${BLUE}[5/6] MS-REPORTS-GO (Sprint 4)${NC}"
cd "$BASE_DIR/MS-REPORTS-GO-main"
docker build -t ${DOCKER_REGISTRY}:ms-reports-go-${VERSION} .
docker tag ${DOCKER_REGISTRY}:ms-reports-go-${VERSION} ${DOCKER_REGISTRY}:ms-reports-go-latest
echo -e "${GREEN}✓ MS-REPORTS-GO${NC}"
echo

echo -e "${BLUE}[6/6] FR-BAR-RT (Frontend React)${NC}"
cd "$BASE_DIR/FR-BAR-RT-main"
docker build -t ${DOCKER_REGISTRY}:frontend-${VERSION} .
docker tag ${DOCKER_REGISTRY}:frontend-${VERSION} ${DOCKER_REGISTRY}:frontend-latest
echo -e "${GREEN}✓ FR-BAR-RT${NC}"
echo

echo
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✓ ALL IMAGES BUILT SUCCESSFULLY${NC}"
echo -e "${GREEN}================================================${NC}"
echo
docker images | grep "${DOCKER_REGISTRY}" | head -10
echo
echo -e "${YELLOW}Next steps:${NC}"
echo -e "${YELLOW}  1. cd infra/INFRA-BAR-DK/compose${NC}"
echo -e "${YELLOW}  2. docker-compose up -d${NC}"
echo -e "${YELLOW}  3. Access: http://localhost:8080${NC}"
echo

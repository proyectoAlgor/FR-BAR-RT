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
echo -e "${BLUE}Primer Sprint: HU1, HU3, HU4${NC}"
echo -e "${BLUE}================================================${NC}"
echo

echo -e "${BLUE}[1/4] MS-AUTH-GO${NC}"
cd ../../../services/MS-AUTH-GO
docker build -t ${DOCKER_REGISTRY}:ms-auth-go-${VERSION} .
docker tag ${DOCKER_REGISTRY}:ms-auth-go-${VERSION} ${DOCKER_REGISTRY}:ms-auth-go-latest
echo -e "${GREEN}✓ MS-AUTH-GO${NC}"
echo

echo -e "${BLUE}[2/4] MS-VENUE-GO${NC}"
cd ../MS-VENUE-GO
docker build -t ${DOCKER_REGISTRY}:ms-venue-go-${VERSION} .
docker tag ${DOCKER_REGISTRY}:ms-venue-go-${VERSION} ${DOCKER_REGISTRY}:ms-venue-go-latest
echo -e "${GREEN}✓ MS-VENUE-GO${NC}"
echo

echo -e "${BLUE}[3/4] MS-CATALOG-GO${NC}"
cd ../MS-CATALOG-GO
docker build -t ${DOCKER_REGISTRY}:ms-catalog-go-${VERSION} .
docker tag ${DOCKER_REGISTRY}:ms-catalog-go-${VERSION} ${DOCKER_REGISTRY}:ms-catalog-go-latest
echo -e "${GREEN}✓ MS-CATALOG-GO${NC}"
echo

echo -e "${BLUE}[4/4] FR-BAR-RT (Frontend React)${NC}"
cd ../FR-BAR-RT
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

# ---------------------------------------------------------------------------
# Priyansh Care - Automated Kubernetes Deployment Script (Safe Plain Text)
# ---------------------------------------------------------------------------

Write-Host "Starting local Kubernetes deployment on Docker Desktop..." -ForegroundColor Cyan

# 1. Build Docker Images
Write-Host "Step 1: Building microservices Docker images locally..." -ForegroundColor Green

Write-Host "Building eureka-server..." -ForegroundColor Yellow
docker build -t eureka-server:latest ./eureka-server

Write-Host "Building api-gateway..." -ForegroundColor Yellow
docker build -t api-gateway:latest ./api-gateway

Write-Host "Building auth-service..." -ForegroundColor Yellow
docker build -t auth-service:latest ./auth-service

Write-Host "Building doctor-service..." -ForegroundColor Yellow
docker build -t doctor-service:latest ./doctor-service

Write-Host "Building patient-service..." -ForegroundColor Yellow
docker build -t patient-service:latest ./patient-service

Write-Host "Building appointment-service..." -ForegroundColor Yellow
docker build -t appointment-service:latest ./appointment-service

Write-Host "Building clinical-service..." -ForegroundColor Yellow
docker build -t clinical-service:latest ./clinical-service

Write-Host "Building billing-service..." -ForegroundColor Yellow
docker build -t billing-service:latest ./billing-service

Write-Host "Building notification-service..." -ForegroundColor Yellow
docker build -t notification-service:latest ./notification-service

# 2. Deploy to Kubernetes
Write-Host "Step 2: Applying Kubernetes manifests..." -ForegroundColor Green

cd k8s

Write-Host "Applying infrastructure configurations..." -ForegroundColor Yellow
kubectl apply -f infrastructure.yaml

Write-Host "Applying eureka-server configuration..." -ForegroundColor Yellow
kubectl apply -f eureka-server.yaml

Write-Host "Applying microservices configurations..." -ForegroundColor Yellow
kubectl apply -f microservices.yaml

# Go back to parent directory
cd ..

Write-Host "Kubernetes deployment commands applied. Check status using: kubectl get pods" -ForegroundColor Green

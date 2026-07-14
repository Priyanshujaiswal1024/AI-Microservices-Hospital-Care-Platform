# Startup script for Hospital Management System microservices
Write-Host "Starting HMS Backend locally..." -ForegroundColor Cyan

Write-Host "1. Compiling JARs with Maven..." -ForegroundColor Yellow
mvn clean package -DskipTests

if ($LASTEXITCODE -ne 0) {
    Write-Error "Maven build failed. Aborting."
    exit $LASTEXITCODE
}

Write-Host "2. Starting Docker containers..." -ForegroundColor Yellow
docker-compose up --build -d

Write-Host "--------------------------------------------------" -ForegroundColor Gray
Write-Host "HMS Services started successfully!" -ForegroundColor Green
Write-Host "API Gateway Port: 8000" -ForegroundColor Cyan
Write-Host "Eureka Discovery Server: http://localhost:8761" -ForegroundColor Cyan
Write-Host "Kafka UI Dashboard: http://localhost:9090" -ForegroundColor Cyan
Write-Host "--------------------------------------------------" -ForegroundColor Gray

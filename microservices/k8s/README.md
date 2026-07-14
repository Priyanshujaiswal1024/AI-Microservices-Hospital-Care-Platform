# deploying HMS Microservices on Kubernetes (Minikube / Docker Desktop)

This directory contains the Kubernetes manifests to deploy the **Priyansh Care Portal** microservices cluster.

## 1. Prerequisites
- **kubectl** installed and configured.
- **Minikube** or **Docker Desktop** (with Kubernetes enabled) running.
- **Docker CLI** configured to build local images directly into the k8s daemon:
  - If using Minikube, run: `minikube docker-env | Invoke-Expression` (on Windows PowerShell) to point docker CLI to the Minikube registry.

---

## 2. Step-by-Step Deployment Guide

### Step 1: Build local microservice images
Before applying the manifests, build the docker images so Kubernetes can locate them locally. Run from the `microservices` parent directory:
```powershell
docker build -t eureka-server:latest ./eureka-server
docker build -t api-gateway:latest ./api-gateway
docker build -t auth-service:latest ./auth-service
docker build -t doctor-service:latest ./doctor-service
docker build -t patient-service:latest ./patient-service
docker build -t appointment-service:latest ./appointment-service
docker build -t clinical-service:latest ./clinical-service
docker build -t billing-service:latest ./billing-service
docker build -t notification-service:latest ./notification-service
```

### Step 2: Deploy Infrastructure
Deploy PostgreSQL (with automated creation of all 7 databases), Kafka + Zookeeper, and Zipkin tracing server:
```powershell
kubectl apply -f infrastructure.yaml
```
Verify they are running:
```powershell
kubectl get pods
```

### Step 3: Deploy Eureka Discovery Server
```powershell
kubectl apply -f eureka-server.yaml
```

### Step 4: Deploy Business Microservices
Apply the business microservices, including the `api-gateway` which exposes a **NodePort (Port 30000)**:
```powershell
kubectl apply -f microservices.yaml
```

---

## 3. Accessing the Application

- **API Gateway Gateway (REST calls):** Exposes on NodePort `30000`. You can access it locally at `http://localhost:30000` (Docker Desktop) or via Minikube IP:
  ```powershell
  minikube service api-gateway --url
  ```
- **Zipkin Tracing UI:** Forward Zipkin port to access dashboard:
  ```powershell
  kubectl port-forward svc/zipkin 9411:9411
  ```
- **Eureka Server UI:** Forward Eureka port:
  ```powershell
  kubectl port-forward svc/eureka-server 8761:8761
  ```

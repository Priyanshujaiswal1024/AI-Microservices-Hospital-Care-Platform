# 🏥 HMS Microservices Architecture

> Hospital Management System — migrated from monolith to microservices using **Kafka** for async event-driven communication.

---

## Architecture Overview

```
                    ┌──────────────────────────────┐
  Vercel Frontend   │        API Gateway :8080      │  Single entry point
  ──────────────►   │  Spring Cloud Gateway + JWT   │
                    └──────────────┬───────────────┘
                                   │  Route by path
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
   /auth/**               /doctors/**, etc.          /api/v1/admin/**
          │                        │                        │
   ┌──────▼──────┐        ┌───────▼──────┐        ┌───────▼──────┐
   │auth-service │        │doctor-service│        │admin-service │
   │   :8081     │        │   :8082      │        │   :8089      │
   └─────────────┘        └──────────────┘        └──────────────┘

                 ════════════ KAFKA ════════════
   Topics:
     appointment.booked    ──► notification-service  (booking email)
     appointment.cancelled ──► notification-service  (cancel email)
     appointment.completed ──► billing-service       (auto-bill)
                           ──► clinical-service      (prompt prescription)
     bill.generated        ──► notification-service  (invoice email)
     bill.paid             ──► notification-service  (payment email)
     otp.send              ──► notification-service  (OTP email)
     doctor.welcome        ──► notification-service  (welcome email)
     prescription.added    ──► notification-service  (rx email)
     pharmacy.low-stock    ──► admin-service         (alert)
```

---

## Services

| Service | Port | Database | Responsibilities |
|---|---|---|---|
| **api-gateway** | 8080 | — | JWT validation, CORS, routing |
| **auth-service** | 8081 | hms_auth | Signup/login, OTP, Google OAuth2, JWT |
| **doctor-service** | 8082 | hms_doctor | Doctor profiles, departments, availability |
| **appointment-service** | 8083 | hms_appointment | Book/cancel/complete appointments |
| **patient-service** | 8084 | hms_patient | Patient profiles, insurance |
| **billing-service** | 8085 | hms_billing | Auto-billing, PDF invoices, payment |
| **pharmacy-service** | 8086 | hms_pharmacy | Medicine CRUD, low-stock alerts |
| **notification-service** | 8087 | — | Email notifications via Thymeleaf |
| **clinical-service** | 8088 | hms_clinical | Prescriptions, medical records |
| **admin-service** | 8089 | — | BFF aggregating all service stats |

---

## Kafka Topics

| Topic | Producer | Consumer(s) |
|---|---|---|
| `appointment.booked` | appointment-service | notification-service |
| `appointment.cancelled` | appointment-service | notification-service |
| `appointment.completed` | appointment-service | billing-service, clinical-service |
| `bill.generated` | billing-service | notification-service |
| `bill.paid` | billing-service | notification-service |
| `otp.send` | auth-service | notification-service |
| `doctor.welcome` | doctor-service | notification-service |
| `prescription.added` | clinical-service | notification-service |
| `pharmacy.low-stock` | pharmacy-service | admin-service |

---

## Local Development

### Prerequisites
- Docker + Docker Compose
- JDK 21
- Maven 3.9+

### Run Locally (Docker)
```bash
# 1. Copy environment file
cp .env.example .env
# Edit .env with your actual secrets

# 2. Start everything
cd microservices/
docker-compose up -d

# 3. Monitor Kafka
open http://localhost:9090   # Kafka UI

# 4. API Gateway
open http://localhost:8080
```

### Run Individual Services (IntelliJ/Maven)
```bash
# Build parent POM first
mvn install -DskipTests

# Start any service
cd auth-service
mvn spring-boot:run

# Or build JAR then run
mvn package -DskipTests
java -jar target/*.jar
```

---

## Deployment on Render

Each service deploys as a **separate Web Service** on Render:

1. Connect your GitHub repo to Render
2. For each service, set:
   - **Root Directory**: `microservices/<service-name>`
   - **Build Command**: `mvn package -DskipTests`
   - **Start Command**: `java -jar target/*.jar`
3. Set environment variables from `.env.example` in each service's Render dashboard

### Inter-service URLs on Render
Set these in each service's environment:
```
DOCTOR_SERVICE_URL=https://hms-doctor.onrender.com
PATIENT_SERVICE_URL=https://hms-patient.onrender.com
...
```

### Neon PostgreSQL
Each service gets its own **database** on the same Neon project:
- `hms_auth`, `hms_doctor`, `hms_patient`, `hms_appointment`
- `hms_clinical`, `hms_pharmacy`, `hms_billing`

### Kafka (Confluent Cloud)
- Create a free Confluent Cloud cluster
- Set `KAFKA_BOOTSTRAP_SERVERS` to your Confluent bootstrap URL
- All services share the same Kafka cluster

---

## Security Design

- **API Gateway** validates JWT on all non-auth routes
- **X-User-Id** and **X-User-Roles** headers are injected by gateway into downstream requests
- All services use `@PreAuthorize` for role-based access
- Passwords encoded with BCrypt
- JWT signed with HMAC-SHA512

---

## Key Design Decisions

### Denormalized Snapshots
Instead of cross-service JPA joins, services store **name/email snapshots** in their own tables. This trades slight storage overhead for:
- No circular dependency on other services at read time
- Faster queries (no network hop)
- Service isolation

### Strangler Fig Pattern
The old monolith `backend/` folder remains deployable. Migration can be done incrementally — route specific paths through the gateway to new microservices, keep others on the monolith until fully migrated.

### Event-Driven Billing
`appointment-service` publishes `appointment.completed` → `billing-service` automatically creates the bill. No synchronous coupling. If billing-service is down, the event is replayed when it comes back (Kafka durability).

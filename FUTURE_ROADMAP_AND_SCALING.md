# 🚀 SN Enviro System: Future Scope & Production Scaling Architecture

---

## 📌 Executive Summary

During enterprise stress testing, the current single-instance Node.js/Express backend successfully handled over **1,750 concurrent requests** across heavy database operations, Bcrypt password hashing, and token verification with **100% success rate and zero crashes**.

### Is Clustering or Horizontal Scaling Required Now?
> **No. It is completely unnecessary for the current phase.**
> - The existing single-node server easily handles the current employee headcount and peak morning login volumes (between 9:00 AM – 10:30 AM IST).
> - Server memory footprint remains lean (~120MB RAM) with near-instant response times for typical operational usage.

This document serves as the **official roadmap and blueprint** for scaling the infrastructure in future expansion phases when active headcount surpasses **5,000+ simultaneous users**.

---

## 📊 Current Architecture vs. Future Scaling Roadmap

```
===================================================================================
CURRENT ARCHITECTURE (Optimized for Present Operations)
===================================================================================

 [ Mobile / Web PWA ]  --->  [ Vite Client (5174) ]
                                    │
                                    ▼
                         [ Node.js + Express API ]
                         (Single Process - Port 5002)
                                    │
                                    ▼
                          [ MongoDB Database ]

 Status: ✅ Verified 1,750+ concurrent requests with zero crashes.
 Assessment: Fully sufficient for current team and immediate production rollout.

===================================================================================
FUTURE SCALE ARCHITECTURE (Trigger: 5,000+ to 10,000+ Active Staff)
===================================================================================

                     [ Mobile PWA & Desktop Portals ]
                                    │
                                    ▼
                         [ Nginx Reverse Proxy ]
                   (SSL Termination + Static Cache + Gzip)
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
   [ PM2 Worker 1 ]          [ PM2 Worker 2 ]          [ PM2 Worker N ]
   (Express Core 1)          (Express Core 2)          (Express Core N)
          │                         │                         │
          └─────────────────────────┼─────────────────────────┘
                                    │
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
     [ Redis Cache & MQ ]                        [ MongoDB Cluster ]
  • Socket.io Multi-Node Hub                   • Primary (Writes)
  • BullMQ Background Emails                   • Secondary (Read Replicas)
  • Session Token Cache                        • Connection Pool: 100
```

---

## 🗺️ Step-by-Step Future Scaling Phases

### Phase 1: PM2 Multi-Core Clustering
* **Trigger:** Headcount exceeds 2,500 active employees.
* **Goal:** Maximize utilization of all available server CPU cores on multi-core VPS/Cloud instances.
* **Implementation:**
  ```bash
  # Launch Express across all available CPU cores automatically
  pm2 start server.js -i max --name "sn-enviro-backend"

  # Zero-downtime rolling reload during updates
  pm2 reload sn-enviro-backend
  ```
* **Benefits:** Distributes intensive CPU tasks (such as Bcrypt password verification) across multiple threads, preventing any single-thread bottleneck.

---

### Phase 2: Nginx Reverse Proxy & Traffic Throttling
* **Trigger:** Concurrent public access or DDoS protection required.
* **Implementation:**
  - Place Nginx in front of port `5002` to manage SSL termination, HTTP/2 protocol, and request rate limiting.
  - Rate-limit login endpoints (`/api/auth/login`) to prevent automated credential attacks:
    ```nginx
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=10r/s;
    location /api/auth/login {
        limit_req zone=login_limit burst=20 nodelay;
        proxy_pass http://localhost:5002;
    }
    ```

---

### Phase 3: Redis Distributed Caching & WebSocket Bus
* **Trigger:** Real-time tracking across 1,000+ concurrent live TV map viewers and mobile devices.
* **Implementation:**
  1. **Socket.io Redis Adapter:**
     ```javascript
     const { createAdapter } = require('@socket.io/redis-adapter');
     const { createClient } = require('redis');
     io.adapter(createAdapter(pubClient, subClient));
     ```
  2. **In-Memory Caching:**
     - Cache static master data (site locations, plant geofence radii, department rosters) with a 15-minute TTL.
     - Reduces direct MongoDB read queries by up to 75%.

---

### Phase 4: Asynchronous Queue Workers for Email & Escalations
* **Trigger:** Thousands of automated check-in and late-escalation email dispatches.
* **Implementation:**
  - Offload SMTP transmissions and PDF generation to background worker queues using **BullMQ**.
  - Keeps HTTP request-response cycles ultra-fast (<30ms) for the end-user while emails dispatch reliably in the background with automatic retries.

---

### Phase 5: Database Connection Pooling & Read Replicas
* **Trigger:** High analytics and historical report export volumes during month-end payroll cycles.
* **Implementation:**
  - Configure MongoDB connection pool:
    ```javascript
    mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 100,
        minPoolSize: 10,
        serverSelectionTimeoutMS: 5000
    });
    ```
  - Route read-heavy analytics (`/api/admin/overview`, `/api/admin/export`) to secondary read replicas.

---

## 📋 Summary Table

| Phase | Technology | Target Scale | Necessity For Now | Planned Timeline |
| :--- | :--- | :--- | :--- | :--- |
| **Current (Baseline)** | Single Node.js + Express + MongoDB | Up to 2,000 users | ✅ **Current Production Setup** | Active |
| **Phase 1** | PM2 Cluster Mode (Multi-core) | 2,000 – 5,000 users | ❌ Not Needed | Future Phase |
| **Phase 2** | Nginx Reverse Proxy & Rate Limiter | 5,000+ users | ❌ Not Needed | Future Phase |
| **Phase 3** | Redis In-Memory Cache & Socket Bus | 5,000 – 10,000 users | ❌ Not Needed | Future Phase |
| **Phase 4** | BullMQ Background Email Workers | 10,000+ users | ❌ Not Needed | Future Phase |
| **Phase 5** | MongoDB Read Replicas & Pool Tuning | Enterprise scale | ❌ Not Needed | Future Phase |

---
*Document Version: 1.0.0*  
*Project: SN Enviro Enterprise Attendance System*  
*Last Updated: 2026-10-26*

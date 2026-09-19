# 🌍 SN Enviro Enterprise Attendance & Telemetry System

A state-of-the-art, real-time employee attendance and field-tracking platform custom-built for SN Enviro. This system leverages advanced GPS geo-fencing, live WebSocket telemetry, and high-resolution mapping to monitor field engineers and staff across India in real-time.

## 🚀 Key Features

*   **📍 Geo-Fenced Check-Ins:** Employees can only mark their attendance when they are physically within the GPS radius of their assigned plant/site.
*   **📸 Selfie Verification:** Mandatory encrypted selfie uploads ensure proof-of-presence for every field check-in.
*   **🗺️ MD's Live Command Center (TV Map):** A spectacular, ultra-premium 8K Dark Mode map designed specifically for large TV displays. It tracks every engineer's live location across India with glowing pings and auto-refreshing WebSocket data.
*   **📊 Real-Time Analytics Dashboard:** An enterprise-grade Admin Panel featuring live attendance rates, automated late-login detection, site distribution charts, and instant CSV exporting.
*   **🔔 Push Notifications & Announcements:** Instant web push notifications sent directly to employees' mobile devices for critical MD announcements and HR updates.
*   **🏖️ Integrated Leave & Salary Hub:** Full employee self-service portal for tracking leaves, applying for PTO, and reviewing salary slips.

## 🛠️ Technology Stack

**Frontend (Client & UI):**
*   [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) - Lightning fast SPA architecture
*   [TailwindCSS](https://tailwindcss.com/) - Modern, glassmorphic UI design system
*   [React-Leaflet](https://react-leaflet.js.org/) - Advanced interactive maps (OpenStreetMap integration)
*   [Framer Motion](https://www.framer.com/motion/) - Cinematic UI animations
*   [Vite PWA](https://vite-pwa-org.netlify.app/) - Progressive Web App support (Installable on iOS/Android)

**Backend (API & Database):**
*   [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) - High-performance REST API
*   [MongoDB](https://www.mongodb.com/) (Mongoose) - NoSQL document storage
*   [Socket.io](https://socket.io/) - Real-time bidirectional event-based communication
*   [JWT](https://jwt.io/) - Secure JSON Web Token authentication (Role-Based Access Control)
*   [Web-Push](https://www.npmjs.com/package/web-push) - VAPID Key push notification integration

## 📂 Project Architecture

The repository is structured as a full-stack monorepo:

```text
SN-Enviro-Attendance-Application/
├── backend/                  # Node.js Express Server
│   ├── controllers/          # API business logic (Admin, Attendance, Auth)
│   ├── models/               # MongoDB Schemas
│   ├── routes/               # API endpoint definitions
│   └── server.js             # Entry point & Socket.io configuration
│
└── frontend/                 # Vite React App
    ├── public/               # Static assets & Service Workers
    ├── src/
    │   ├── components/       # Reusable React UI Components
    │   ├── AdminPanel/       # Enterprise Dashboard components
    │   ├── App.jsx           # Main Application Router
    │   └── index.css         # Tailwind directives & Custom CSS
    └── package.json          # Frontend dependencies
```

## 🔐 Security & Compliance

*   **Role-Based Access Control (RBAC):** Strict segregation between `Staff`, `Site Engineer`, `Application Engineer`, and `Admin`.
*   **Data Permanence:** Critical attendance data is stored permanently without TTL deletion scripts, ensuring multi-year historical compliance and audit capabilities.
*   **Protected Routes:** All sensitive telemetry and export endpoints require bearer token authentication.

---
*Developed for internal enterprise deployment at SN Enviro.*

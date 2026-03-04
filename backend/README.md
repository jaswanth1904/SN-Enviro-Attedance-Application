# SN Enviro Attendance Application API

Production-ready Node.js/Express REST API for a Field Service Management System.

## Features
- **Geofencing**: Attendance only allowed within 100m of the site using Haversine Formula.
- **Attendance Tracking**: Secure clock-in with selfie proof.
- **Officer Notifications**: Real-time alerts (console logs) upon successful attendance.
- **Expense Management**: Multi-part form upload for bills via Multer & Cloudinary.
- **RBAC**: Role-Based Access Control (Admin, Senior, Accountant, Staff).
- **Security**: Helmet, Express-Rate-Limit, JWT, Bcrypt hashing.
- **Error Handling**: Global middleware for clean JSON responses.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: MongoDB/Mongoose
- **Storage**: Cloudinary
- **Auth**: JWT & Bcrypt

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup environment variables:
   - Create a `.env` file based on `.env.example`
   - Add your MongoDB URI and Cloudinary credentials
4. Start the server:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a user
- `POST /api/auth/login` - Login & get token

### Attendance
- `POST /api/attendance` - Record attendance (Requires SiteID, Lat, Lng, SelfieUrl)
- `GET /api/attendance/reports` - View reports (Senior/Admin only)

### Expenses
- `POST /api/expenses/upload` - Upload bill (Requires amount, description, bill file)
- `GET /api/expenses/pending` - View pending bills (Accountant/Admin only)
- `PUT /api/expenses/:id` - Approve/Reject expense (Accountant/Admin only)

### Sites
- `POST /api/sites` - Create site (Admin only)
- `GET /api/sites` - View sites

# Nexus AI - Premium AI Productivity & Workflow Automation Platform

Nexus AI is an ultra-premium, production-ready AI Productivity and Workflow Automation SaaS platform. Featuring a sleek, minimalist Vercel/Linear-inspired design system with smooth GSAP animations and an interactive WebGL Three.js particle backdrop, the platform provides visual trigger-action orchestrations, developer API keys management, telemetry dashboards, and email verification.

---

## 📂 Folder Structure Explanation

```
nexus-root/
├── backend/                       # Node.js + Express.js TypeScript Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts              # Database Connection (MySQL / SQLite switcher)
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts # Login, register, verify-otp, resets
│   │   │   ├── apikey.controller.ts
│   │   │   ├── workflow.controller.ts
│   │   │   └── notification.controller.ts
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts # Dual JWT & API Key token verification
│   │   │   └── error.middleware.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── apikey.routes.ts
│   │   │   └── ...
│   │   └── server.ts              # Express Server entry-point
│   ├── .env                       # Environment configs
│   ├── db.sql                     # Complete MySQL schema script
│   └── tsconfig.json              # TypeScript compilation rules
│
└── frontend/                      # React + Vite + TypeScript Frontend
    ├── src/
    │   ├── components/
    │   │   ├── CanvasHero3D.tsx   # Three.js 3D Sphere / 2D Canvas Fallback
    │   │   ├── CustomCursor.tsx   # GSAP Magnetic Mouse Follower
    │   │   └── WorkflowBuilder.tsx# Visual interactive nodes grid editor
    │   ├── context/
    │   │   ├── AuthContext.tsx    # Session tokens & authenticated fetches
    │   │   └── ThemeContext.tsx   # Dark / Light Mode manager
    │   ├── layouts/
    │   │   ├── RootLayout.tsx     # Public site wrappers with sticky headers
    │   │   └── DashboardLayout.tsx# Private workspace panels with notifications
    │   ├── pages/
    │   │   ├── LandingPage.tsx    # GSAP timeline, tilting cards, FAQs
    │   │   ├── auth/              # Signup, Login, OTP verification screens
    │   │   └── dashboard/         # Overviews, key managers, workflows, logs
    │   ├── App.tsx                # Nested Router Switchboard
    │   ├── index.css              # Glassmorphic utilities & scrollbar designs
    │   └── main.tsx               # Providers attachment mounts
    ├── tailwind.config.js         # Design token definitions
    └── vite.config.ts             # Vite server bundling configs
```

---

## ⚙️ Installation Guide

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- MySQL Server (optional - defaults to automatic zero-config SQLite)

### 1. Backend Setup
1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the environmental variables in `backend/.env`. Create a copy from `.env.example`:
   ```bash
   cp .env.example .env
   ```
4. By default, the database is configured as `DB_TYPE=sqlite` for a zero-config setup. The SQLite file `nexus_ai.db` will be initialized automatically in the backend directory.
   - To connect to **MySQL**, change the environment variables to:
     ```env
     DB_TYPE=mysql
     DB_HOST=localhost
     DB_USER=your_mysql_user
     DB_PASSWORD=your_mysql_password
     DB_NAME=nexus_ai_db
     DB_PORT=3306
     ```
     Run `backend/db.sql` on your MySQL server to initialize the relational structures.

### 2. Frontend Setup
1. Open a terminal in the `frontend/` directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

---

## 🚀 Running the Platform Locally

Run both frontend and backend concurrently to start the platform.

### Running Backend Server
From the `backend/` directory, execute:
```bash
npm run dev
```
The server will start on [http://localhost:5000](http://localhost:5000) and initialize connection logs in your terminal.

### Running Frontend Dev Server
From the `frontend/` directory, execute:
```bash
npm run dev
```
The dev bundle will launch on [http://localhost:5173](http://localhost:5173). Open this URL in your web browser.

---

## 🎨 Premium Animation Features Checklist

- [x] **Hero Timeline Intro**: Staggered letter and text animations on page load (GSAP).
- [x] **Card Tilt Mechanics**: Interactive features grids tilting relative to cursor hover offsets.
- [x] **Custom Glowing Cursor**: Dot-and-ring cursor elements that scale and morph around hoverable buttons/links.
- [x] **Stats Count Up**: Chronological metric animations (e.g. 0 -> 99.9%) triggered upon scrolling.
- [x] **Smooth Scrolling**: Implemented using optimized CSS transitions and layout properties.
- [x] **Infinite Slider**: Smooth marquee scrolling showing company logos.
- [x] **Interactive Workflow Simulation**: Active edges light up, pulsing coordinate signals down connected node paths, printing logs in real-time.

---

## 🛡️ Production Deployment Notes

1. **Security Middlewares**:
   - `helmet` is configured on the Express server to prevent script injections and header leakage.
   - `express-rate-limit` caps client queries at 200 hits per 15 minutes to prevent DDoS triggers.
2. **Database Resilience**:
   - The relational database uses search indexing on common email and token hash queries.
   - Hashing passwords uses `bcryptjs` (10 rounds). API Key verification hashes key inputs using deterministic SHA-256 (prefixed for fast scanning).
3. **CORS Configuration**:
   - Adjust `cors` parameters in `backend/src/server.ts` to allow requests only from your production domain (rather than `*`).
4. **Email OTP Delivery**:
   - Update the SMTP host settings in `backend/.env` with production configurations (e.g. SMTP server or services like SendGrid/Resend) to deliver actual emails. Unconfigured keys default back to terminal logging.


# ISTAConnect — Plateforme Communautaire Digitale ISTA

A full-stack community platform for ISTA trainees built with Laravel 11 + React (Vite).

---

## 🔐 Login Credentials

| Role      | Email             | Password   |
|-----------|-------------------|------------|
| **Admin** | `admin@ista.ma`   | `admin123` |
| **User**  | `alami@gmail.com` | `alami123` |

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Laravel 11, Sanctum, MySQL        |
| Frontend  | React 18, Vite, Tailwind CSS      |
| Storage   | Laravel public disk               |
| Auth      | Laravel Sanctum (token-based)     |

---

## 📁 Project Structure

plateforme-communautaire-ista/
│
├── backend/                        # Laravel 11 REST API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/    # API controllers
│   │   │   └── Middleware/         # Custom middleware
│   │   └── Models/                 # Eloquent models
│   │
│   ├── database/
│   │   ├── migrations/             # Database migrations
│   │   └── seeders/                # Database seeders
│   │
│   ├── routes/
│   │   └── api.php                 # All API routes
│   │
│   ├── storage/                    # Uploaded files
│   ├── .env.example                # Environment template
│   └── db.sql                      # Database dump (optional)
│
└── frontend/                       # React + Vite SPA
    └── src/
        ├── api/                    # Axios configuration for API requests
        ├── assets/                 # Images, icons, and static assets
        │
        ├── components/
        │   ├── admin/              # Admin panel components
        │   │   ├── common/         # Reusable admin components
        │   │   ├── layout/                   # Admin layout (Navbar, Sidebar)
        │   │   ├── pages/                      # Admin pages
        │   │   └── Dashboard.jsx               # Admin dashboard main component
        │   │
        │   └── user/                           # User interface components
        │       ├── layout/                     # User layout components
        │       ├── pages/                      # User pages (feed, profile, etc.)
        │       ├── LandingPage.jsx             # Public landing page
        │       ├── ProtectedRoute.jsx          # Route protection component
        │       └── UserProtectedRoute.jsx      # User-specific route guard
        │
        ├── context/                            # React contexts(AuthContext,ThemeContext)
        ├── hooks/                              # Custom React hooks
        ├── locales/                            # i18n translations (en, fr)
        ├── pages/                              # Route-level pages
        ├── utils/                              # Utility functions(PDF export, helpers)
        ├── App.jsx                             # Main routes configuration
        └── main.jsx                            # React application entry point   
## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL (via XAMPP or Laragon)
- Git

---

### Step 1 — Clone & checkout branch

```bash
git clone <repo-url>
cd plateforme-communautaire-ista
git checkout abdosbranch
git pull
```

---

### Step 2 — Backend Setup

```bash
cd backend
composer install
```

Create your environment file:

```bash
cp .env.example .env
```

Open `backend/.env` and configure:

```env
APP_URL=http://localhost:8000
FILESYSTEM_DISK=public

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ista_connect
DB_USERNAME=root
DB_PASSWORD=
```

Generate app key and link storage:

```bash
php artisan key:generate
php artisan storage:link
```

#### Option A — Import SQL dump (recommended, faster)

Create a database named `ista_connect` in phpMyAdmin, then import:

```bash
mysql -u root -p ista_connect < db.sql
```

#### Option B — Fresh migrations

```bash
php artisan migrate --seed
php artisan db:seed --class=AdminSeeder
```

Start the backend server:

```bash
php artisan serve
```

Backend runs at → `http://localhost:8000`

---

### Step 3 — Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

Or create `frontend/.env` manually:

```env
VITE_API_URL=http://localhost:8000/api
```

Start the frontend:

```bash
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

## ✨ Features

### 🔧 Admin Panel (`/admin`)

| Page          | Description                                      |
|---------------|--------------------------------------------------|
| Dashboard     | Real-time stats, charts, activity logs           |
| Users         | Invite, manage roles, delete users               |
| Posts         | Moderate posts, view details, delete             |
| Lost & Found  | Manage items, resolve, delete                    |
| Feedback      | Review and update feedback status                |
| Reports       | Review and dismiss user reports                  |
| Groups        | View all chat groups, members, messages          |
| Notifications | Admin notification feed                          |
| Logs          | Activity log with live feed                      |
| Settings      | Platform settings management                     |
| PDF Export    | Export users, posts, reports to PDF              |

### 👤 User Interface (`/`)

| Page          | Description                                      |
|---------------|--------------------------------------------------|
| Landing       | Hero page with login/register                    |
| Feed          | Posts with likes, comments, media upload         |
| Lost & Found  | Report/claim items with image upload             |
| Messages      | Direct messages between users                    |
| Groups        | Create/join group chats                          |
| Profile       | User profile with follow system                  |
| Notifications | Real-time notifications                          |
| Feedback      | Submit feedback to admins                        |

---

## 🗄 Database

### Models & Relationships

| Model          | Key Relations                                     |
|----------------|---------------------------------------------------|
| User           | posts, comments, likes, followers, notifications  |
| Post           | user, media, likes, comments                      |
| LostFound      | user, media, claims                               |
| Message        | sender, receiver                                  |
| Group          | creator, members, messages                        |
| GroupMessage   | group, user                                       |
| Notification   | user                                              |
| Feedback       | user                                              |
| Report         | reporter                                          |
| ActivityLog    | user                                              |
| Setting        | key/value store                                   |
| Filiere        | users                                             |

---

## ⚠️ Common Issues

**MySQL connection refused**
→ Start MySQL in XAMPP/Laragon Control Panel

**Images not displaying**
→ Run `php artisan storage:link` and confirm `FILESYSTEM_DISK=public` in `.env`

**CORS errors in browser**
→ Confirm `APP_URL=http://localhost:8000` in `backend/.env` and restart server

**Login fails after fresh install**
→ Make sure you seeded the database or imported `db.sql`

**`npm run dev` fails**
→ Make sure `frontend/.env` exists with `VITE_API_URL`

**php artisan commands fail**
→ Run `composer install` first and make sure `.env` exists with `php artisan key:generate`

---

## 👨‍💻 Team

| Member | Branch         |
|--------|----------------|
| Abdo   | `abdosbranch`  |

---

© 2025 ISTAConnect · ISTA Marrakech — Développement Digital
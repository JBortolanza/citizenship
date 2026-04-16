# Citizenship System

A full-stack application for documentation management and citizenship recognition, built with FastAPI, React, and PostgreSQL.

## 🚀 Tech Stack

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.12+)
- **Database ORM:** [SQLModel](https://sqlmodel.tiangolo.com/) (SQLAlchemy + Pydantic)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Authentication:** JWT (Jose), Cookie-based sessions, Argon2 password hashing
- **Email:** [FastAPI-Mail](https://sabuhish.github.io/fastapi-mail/)
- **Server:** Uvicorn

### Frontend
- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Forms:** React Hook Form + Zod
- **Routing:** React Router 7

### Infrastructure
- **Proxy/Web Server:** [Caddy](https://caddyserver.com/)
- **Containerization:** Docker & Docker Compose

---

## 📂 Project Structure

```text
.
├── backend/                # FastAPI application
│   ├── app/
│   │   ├── core/           # Auth, Database, Email, Logging configs
│   │   ├── models/         # SQLModel definitions
│   │   └── routes/         # API endpoints
│   └── requirements.txt
├── frontend/               # React Vite application
│   ├── src/
│   │   ├── components/     # UI components (Shadcn)
│   │   ├── lib/            # API client and utils
│   │   ├── pages/          # Application views
│   │   └── store/          # Zustand stores
│   └── package.json
├── Caddyfile               # Reverse proxy configuration
├── docker-compose.yml      # Orchestration
└── .env                    # Environment variables (not committed)
```

---

## 🛠️ Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js (for local frontend development)
- Python 3.12+ (for local backend development)

### Quick Start (Docker)

1. **Clone the repository**
2. **Create a `.env` file** in the root directory (see [Environment Variables](#environment-variables) below).
3. **Run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```
4. **Access the application:**
   - Frontend: `http://localhost`
   - API Documentation: `http://localhost/api/docs`

---

## ⚙️ Environment Variables

Create a `.env` file in the root with the following:

```env
# Database (Docker)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=citizenship
DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/citizenship

# Security
JWT_SECRET_KEY=your_super_secret_key_generate_with_openssl_rand_hex_32
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Email (SMTP)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_FROM=your_email@gmail.com
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com

# Frontend
FRONTEND_URL=http://localhost
```

---

## 🔧 Development

### Backend Local Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Local Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 Features
- [x] Secure Authentication (JWT in HTTP-only cookies)
- [x] Role-based access control (Admin/User)
- [x] Password recovery via email
- [x] Responsive UI with Tailwind 4
- [x] Automated database migrations (via SQLModel)
- [ ] Document upload and processing (In Progress)
- [ ] Application tracking system (Planned)

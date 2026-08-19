# Student Management System

Full-stack Student Management System — Django REST Framework backend, React (Vite) frontend, JWT auth, three roles (Admin / Teacher / Student).

## Features
- JWT authentication with auto-refresh
- Role-based permissions (admin / teacher / student)
- Admin: manage students, teachers, courses (create/edit/delete), enroll students, reset any user's password
- Teacher: mark attendance, view attendance history (filterable by course/date), enter grades, delete grade/attendance records
- Student: view own attendance % (overall + per-course) and grades (with computed letter grade)
- Role-aware dashboard summary endpoint
- Self-service change password (any role)
- Deploy-ready config (Whitenoise static files, `dj-database-url`, Gunicorn `Procfile`)

## Tech Stack
Backend: Python, Django, Django REST Framework, SimpleJWT, django-cors-headers
Frontend: React, Vite, React Router, Axios

## Project Structure
```
student-mgmt/
├── backend/        # Django REST API
│   ├── core/        # settings, urls
│   ├── accounts/    # custom User, auth, password change/reset
│   ├── students/
│   ├── teachers/
│   ├── courses/
│   ├── attendance/
│   ├── grades/
│   └── dashboard/   # role-aware summary endpoint
└── frontend/        # React (Vite) SPA
    └── src/
        ├── api/       # axios instance + JWT refresh interceptor
        ├── auth/      # AuthContext
        ├── routes/    # PrivateRoute (role guard)
        ├── components/
        ├── pages/
        │   ├── admin/
        │   ├── teacher/
        │   └── student/
```

## Backend Setup (Windows / PowerShell)
```powershell
cd backend
py -3.11 -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

python manage.py makemigrations accounts students teachers courses attendance grades
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
A `.env` with local dev defaults (SQLite, `DEBUG=True`) is already included. Use `.env.example` as the template for production values.

## Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`, talks to the API at `http://localhost:8000/api` by default.

## Creating Users
Only an admin (`createsuperuser`, or an existing admin) can create teachers/students — via the Django admin (`/admin/`) or through the Admin dashboard UI (Students / Teachers pages), which registers the linked `User` (role auto-set) and profile in one step.

## Key API Endpoints
```
POST   /api/auth/login/                    obtain JWT
POST   /api/auth/refresh/                  refresh JWT
POST   /api/accounts/register/             admin creates a user (role: admin/teacher/student)
GET    /api/accounts/me/                   current user
POST   /api/accounts/change-password/      self-service password change
POST   /api/accounts/reset-password/<id>/  admin resets another user's password

GET|POST|PATCH|DELETE  /api/students/
GET|POST|PATCH|DELETE  /api/teachers/
GET|POST|PATCH|DELETE  /api/courses/
POST                    /api/courses/<id>/enroll/

GET|POST|PATCH|DELETE  /api/attendance/    supports ?course=&date_from=&date_to=
GET|POST|PATCH|DELETE  /api/grades/

GET    /api/dashboard/summary/             role-aware dashboard stats
```

## Deployment
- **Backend**: Docker-based free hosts (e.g. Back4App) work well if your card fails international verification on Heroku/Render. Set env vars from `.env.example`, run `python manage.py migrate` on release (`Procfile` already includes this).
- **Frontend**: Vercel. Set `VITE_API_URL` to your deployed backend's `/api` URL, then `npm run build`.

## Known Gaps / Next Steps
- No automated tests
- No email-based password reset (admin-driven reset endpoint is provided instead)
- No pagination on list endpoints (fine for classroom-scale data; add `PageNumberPagination` if this grows)

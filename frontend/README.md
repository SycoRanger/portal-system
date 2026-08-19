# Edunova — Student Management Frontend (Redesign)

Full UI/UX redesign of the Student Management System frontend. Same Django REST backend, same API contracts — no backend changes required.

## Stack
React 18 + Vite · Tailwind CSS (design-token based, light/dark) · React Router v6 · Recharts · Lucide icons · Axios

## What changed vs. the previous frontend
- Full application shell: collapsible sidebar (mobile drawer), sticky header, theme toggle
- Design system: CSS-variable tokens for color/spacing/radius, reusable UI primitives (`Button`, `Card`, `Badge`, `Avatar`, `Modal`, `Dropdown`, `DataTable`, `StatCard`, `EmptyState`, `ErrorState`, `Skeleton`, toasts, confirm dialogs)
- Split-screen login page
- Admin dashboard: real stat cards, an attendance trend chart (built from actual `/attendance/` records, last 14 days) and a grade-average-by-course chart (built from actual `/grades/` records) — both show a proper empty state instead of fake data when there's nothing to plot yet
- Students / Teachers / Courses: searchable tables, dropdown row actions, edit-in-place modals, confirm dialogs on delete, admin password reset
- New Student Profile page (tabs: Overview / Courses / Attendance / Grades), built entirely from existing endpoints (attendance & grades lists filtered client-side by student — no new backend routes needed)
- Teacher Attendance page: tabbed Mark / History view with course+date filtering and record deletion
- Teacher Grades page: entry grid + recorded-grades table with computed percentage and letter grade
- Student dashboard: attendance progress ring, per-course attendance bars, recent grades
- Loading skeletons, empty states, and error+retry states on every data-driven page
- API calls organized under `src/api/` (`client.js` + one file per resource) instead of scattered `axios` calls
- `AuthContext` rehydrates the session from the stored JWT on page load/refresh (previous version logged users out on refresh)

## What did NOT change
- All Django endpoints, request/response shapes, and auth flow are untouched and reused as-is.
- No fake data anywhere — dashboard charts intentionally show an empty state rather than invented analytics, since the backend doesn't track enrollment-over-time or per-course headcount separately from attendance/grade records.

## Setup
```powershell
cd frontend
npm install
npm run dev
```
Talks to `http://localhost:8000/api` by default (see `.env.development`).

## Production build / Vercel
```powershell
npm run build
```
Set `VITE_API_URL` in Vercel's project environment variables to your deployed backend's `/api` URL (see `.env.production` for the placeholder). `vercel.json` is included so client-side routes resolve correctly on refresh/deep link.

## Known scope notes
- JavaScript (not TypeScript) was used to keep the handoff simple and immediately runnable without a type-migration pass.
- Dark mode is implemented (toggle in the header) using the same design tokens as light mode, not a simple inversion.
- "Student Enrollment Over Time" and "Course Distribution by enrolled students" charts from the brief were intentionally omitted — the backend doesn't expose a dated enrollment history or a per-course student-count endpoint, and faking that data was explicitly out of scope.

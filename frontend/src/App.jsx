import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import PrivateRoute from './routes/PrivateRoute';

import Login from './pages/Login';
import ChangePassword from './pages/ChangePassword';

import AdminDashboard from './pages/admin/Dashboard';
import Students from './pages/admin/Students';
import StudentProfile from './pages/admin/StudentProfile';
import Teachers from './pages/admin/Teachers';
import Courses from './pages/admin/Courses';

import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherAttendance from './pages/teacher/Attendance';
import TeacherGrades from './pages/teacher/Grades';

import StudentDashboard from './pages/student/Dashboard';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}`} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ConfirmProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<RootRedirect />} />
                <Route path="/login" element={<Login />} />
                <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

                <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
                <Route path="/admin/students" element={<PrivateRoute roles={['admin']}><Students /></PrivateRoute>} />
                <Route path="/admin/students/:id" element={<PrivateRoute roles={['admin']}><StudentProfile /></PrivateRoute>} />
                <Route path="/admin/teachers" element={<PrivateRoute roles={['admin']}><Teachers /></PrivateRoute>} />
                <Route path="/admin/courses" element={<PrivateRoute roles={['admin']}><Courses /></PrivateRoute>} />

                <Route path="/teacher" element={<PrivateRoute roles={['teacher']}><TeacherDashboard /></PrivateRoute>} />
                <Route path="/teacher/attendance" element={<PrivateRoute roles={['teacher']}><TeacherAttendance /></PrivateRoute>} />
                <Route path="/teacher/grades" element={<PrivateRoute roles={['teacher']}><TeacherGrades /></PrivateRoute>} />

                <Route path="/student" element={<PrivateRoute roles={['student']}><StudentDashboard /></PrivateRoute>} />

                <Route path="*" element={<RootRedirect />} />
              </Routes>
            </BrowserRouter>
          </ConfirmProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

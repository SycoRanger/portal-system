import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <nav>
      {user.role === 'admin' && (
        <>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/students">Students</Link>
          <Link to="/admin/teachers">Teachers</Link>
          <Link to="/admin/courses">Courses</Link>
        </>
      )}
      {user.role === 'teacher' && (
        <>
          <Link to="/teacher">Dashboard</Link>
          <Link to="/teacher/attendance">Mark Attendance</Link>
          <Link to="/teacher/attendance-history">Attendance History</Link>
          <Link to="/teacher/grades">Enter Grades</Link>
        </>
      )}
      {user.role === 'student' && <Link to="/student">Dashboard</Link>}
      <Link to="/change-password">Change Password</Link>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import ErrorMessage from '../../components/ErrorMessage';
import getErrorMessage from '../../utils/getErrorMessage';

export default function MarkAttendance() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/courses/').then((res) => setCourses(res.data)); }, []);
  useEffect(() => { api.get('/students/').then((res) => setStudents(res.data)); }, []);

  const submit = async () => {
    setError('');
    setSaving(true);
    try {
      for (const s of students) {
        const status = statuses[s.id];
        if (!status) continue;
        await api.post('/attendance/', { student: s.id, course: courseId, date, status });
      }
      alert('Attendance saved');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <h2>Mark Attendance</h2>
      <ErrorMessage message={error} />
      <div className="filters">
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">-- Course --</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <table>
        <thead><tr><th>Student</th><th>Status</th></tr></thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.student_id}</td>
              <td>
                <select onChange={(e) => setStatuses({ ...statuses, [s.id]: e.target.value })}>
                  <option value="">-</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="leave">Leave</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={submit} disabled={!courseId || saving}>{saving ? 'Saving...' : 'Save Attendance'}</button>
    </div>
  );
}

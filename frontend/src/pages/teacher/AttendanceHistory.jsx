import { useEffect, useState } from 'react';
import api from '../../api/axios';
import ErrorMessage from '../../components/ErrorMessage';
import getErrorMessage from '../../utils/getErrorMessage';

export default function AttendanceHistory() {
  const [records, setRecords] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { api.get('/courses/').then((res) => setCourses(res.data)); }, []);

  const load = async () => {
    setError('');
    try {
      const params = {};
      if (courseFilter) params.course = courseFilter;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await api.get('/attendance/', { params });
      setRecords(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!confirm('Delete this attendance record?')) return;
    await api.delete(`/attendance/${id}/`);
    load();
  };

  return (
    <div className="page">
      <h2>Attendance History</h2>
      <ErrorMessage message={error} />
      <div className="filters">
        <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)}>
          <option value="">All Courses</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="From" />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="To" />
        <button onClick={load}>Filter</button>
      </div>
      <table>
        <thead><tr><th>Date</th><th>Student</th><th>Course</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {records.map((r) => (
            <tr key={r.id}>
              <td>{r.date}</td>
              <td>{r.student_detail?.student_id}</td>
              <td>{r.course_detail?.code}</td>
              <td>{r.status}</td>
              <td><button className="link-btn danger" onClick={() => remove(r.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      {records.length === 0 && <p>No records found.</p>}
    </div>
  );
}

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import ErrorMessage from '../../components/ErrorMessage';
import getErrorMessage from '../../utils/getErrorMessage';

export default function EnterGrades() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [existingGrades, setExistingGrades] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [examType, setExamType] = useState('final');
  const [marks, setMarks] = useState({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/courses/').then((res) => setCourses(res.data)); }, []);
  useEffect(() => { api.get('/students/').then((res) => setStudents(res.data)); }, []);

  const loadGrades = () => api.get('/grades/').then((res) => setExistingGrades(res.data));
  useEffect(() => { loadGrades(); }, []);

  const submit = async () => {
    setError('');
    setSaving(true);
    try {
      for (const s of students) {
        const obtained = marks[s.id];
        if (obtained === undefined || obtained === '') continue;
        await api.post('/grades/', {
          student: s.id, course: courseId, exam_type: examType,
          marks_obtained: obtained, total_marks: 100,
        });
      }
      alert('Grades saved');
      loadGrades();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this grade record?')) return;
    await api.delete(`/grades/${id}/`);
    loadGrades();
  };

  return (
    <div className="page">
      <h2>Enter Grades</h2>
      <ErrorMessage message={error} />
      <div className="filters">
        <select value={courseId} onChange={(e) => setCourseId(e.target.value)}>
          <option value="">-- Course --</option>
          {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={examType} onChange={(e) => setExamType(e.target.value)}>
          <option value="quiz">Quiz</option>
          <option value="midterm">Midterm</option>
          <option value="final">Final</option>
        </select>
      </div>
      <table>
        <thead><tr><th>Student</th><th>Marks (/100)</th></tr></thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td>{s.student_id}</td>
              <td><input type="number" min="0" max="100" onChange={(e) => setMarks({ ...marks, [s.id]: e.target.value })} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={submit} disabled={!courseId || saving}>{saving ? 'Saving...' : 'Save Grades'}</button>

      <h3>Existing Grades</h3>
      <table>
        <thead><tr><th>Course</th><th>Type</th><th>Marks</th><th>%</th><th>Letter</th><th></th></tr></thead>
        <tbody>
          {existingGrades.map((g) => (
            <tr key={g.id}>
              <td>{g.course_code}</td>
              <td>{g.exam_type}</td>
              <td>{g.marks_obtained}/{g.total_marks}</td>
              <td>{g.percentage}%</td>
              <td>{g.letter_grade}</td>
              <td><button className="link-btn danger" onClick={() => remove(g.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

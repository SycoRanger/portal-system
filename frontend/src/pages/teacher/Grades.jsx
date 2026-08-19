import { useEffect, useMemo, useState } from 'react';
import { Award, Trash2, PenLine, Pencil, Check, X } from 'lucide-react';
import { coursesApi } from '../../api/courses';
import { studentsApi } from '../../api/students';
import { gradesApi } from '../../api/grades';
import { useAuth } from '../../auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import { fullName } from '../../utils/format';
import getErrorMessage from '../../utils/getErrorMessage';

const GRADE_TONE = { A: 'success', B: 'success', C: 'warning', D: 'warning', F: 'danger' };

export default function TeacherGrades() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [existingGrades, setExistingGrades] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [examType, setExamType] = useState('final');
  const [totalMarks, setTotalMarks] = useState(100);
  const [marks, setMarks] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [editingGradeId, setEditingGradeId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const toast = useToast();
  const confirm = useConfirm();
  const { user } = useAuth();

  useEffect(() => {
    coursesApi.list().then((res) => setCourses(res.data));
    studentsApi.list().then((res) => setStudents(res.data));
  }, []);

  const myCourses = useMemo(
    () => courses.filter((c) => c.teacher?.user?.id === user?.id),
    [courses, user]
  );

  useEffect(() => {
    if (myCourses.length === 1 && !courseId) setCourseId(myCourses[0].id);
  }, [myCourses]);

  const loadGrades = async () => {
    setLoadingGrades(true);
    try {
      const res = await gradesApi.list();
      setExistingGrades(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingGrades(false);
    }
  };
  useEffect(() => { loadGrades(); }, []);

  const enteredCount = useMemo(() => Object.values(marks).filter((v) => v !== '' && v !== undefined).length, [marks]);

  const submit = async () => {
    if (!courseId) return;
    const entries = Object.entries(marks).filter(([, v]) => v !== '' && v !== undefined);
    const invalid = entries.find(([, v]) => Number(v) < 0 || Number(v) > Number(totalMarks));
    if (invalid) {
      toast.error(`Marks must be between 0 and ${totalMarks}.`);
      return;
    }
    setSaving(true);
    try {
      for (const [studentId, obtained] of entries) {
        await gradesApi.create({ student: Number(studentId), course: courseId, exam_type: examType, marks_obtained: obtained, total_marks: totalMarks });
      }
      toast.success(`Grades saved for ${entries.length} student${entries.length !== 1 ? 's' : ''}.`);
      setMarks({});
      loadGrades();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const startEditGrade = (g) => {
    setEditingGradeId(g.id);
    setEditValue(String(g.marks_obtained));
  };

  const cancelEditGrade = () => {
    setEditingGradeId(null);
    setEditValue('');
  };

  const saveEditGrade = async (g) => {
    if (editValue === '' || Number(editValue) < 0 || Number(editValue) > Number(g.total_marks)) {
      toast.error(`Enter a value between 0 and ${g.total_marks}.`);
      return;
    }
    try {
      await gradesApi.update(g.id, { marks_obtained: editValue });
      toast.success('Grade updated.');
      setEditingGradeId(null);
      loadGrades();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const removeGrade = async (g) => {
    const ok = await confirm({ title: 'Delete grade record', description: `Remove this ${g.exam_type} grade for ${g.course_code}?`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await gradesApi.remove(g.id);
      toast.success('Grade deleted.');
      loadGrades();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'course', header: 'Course', render: (g) => <div><div className="font-medium text-ink">{g.course_code}</div><div className="text-xs uppercase text-ink-muted">{g.exam_type}</div></div> },
    {
      key: 'marks', header: 'Marks',
      render: (g) =>
        editingGradeId === g.id ? (
          <div className="flex items-center gap-1.5">
            <input
              type="number" min="0" max={g.total_marks} autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveEditGrade(g); if (e.key === 'Escape') cancelEditGrade(); }}
              className="h-8 w-16 rounded-lg border border-primary bg-surface px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <span className="text-ink-muted">/{g.total_marks}</span>
            <button onClick={() => saveEditGrade(g)} className="text-success hover:opacity-80"><Check size={15} /></button>
            <button onClick={cancelEditGrade} className="text-ink-faint hover:text-ink"><X size={15} /></button>
          </div>
        ) : (
          `${g.marks_obtained}/${g.total_marks}`
        ),
    },
    { key: 'pct', header: 'Percentage', render: (g) => g.percentage !== null ? `${g.percentage}%` : '—' },
    { key: 'grade', header: 'Grade', render: (g) => g.letter_grade ? <Badge tone={GRADE_TONE[g.letter_grade]}>{g.letter_grade}</Badge> : '—' },
    {
      key: 'actions', header: '',
      render: (g) => (
        <div className="flex items-center gap-3">
          <button onClick={() => startEditGrade(g)} className="text-ink-faint hover:text-primary"><Pencil size={15} /></button>
          <button onClick={() => removeGrade(g)} className="text-ink-faint hover:text-danger"><Trash2 size={15} /></button>
        </div>
      ),
    },
  ];

  return (
    <AppShell title="Grades">
      <PageHeader title="Marks & Grades" description="Enter exam marks and review academic records." />

      <Card className="mb-6">
        <CardBody>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Select label="Course" required value={courseId} onChange={(e) => { setCourseId(e.target.value); setMarks({}); }} className="sm:w-56">
              <option value="">Select a course</option>
              {myCourses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Exam type" value={examType} onChange={(e) => setExamType(e.target.value)} className="sm:w-40">
              <option value="quiz">Quiz</option>
              <option value="midterm">Midterm</option>
              <option value="final">Final</option>
            </Select>
            <Input
              label="Total Marks (weightage)"
              type="number" min="1"
              value={totalMarks}
              onChange={(e) => { setTotalMarks(e.target.value); setMarks({}); }}
              className="sm:w-40"
            />
            {courseId && <Badge tone="primary" className="mb-0.5 h-fit">{enteredCount} entered</Badge>}
          </div>

          <div className="mt-5">
            {!courseId ? (
              <EmptyState icon={PenLine} title="Select a course to begin" description="Choose a course and exam type to enter marks." compact />
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={fullName(s.user)} size={32} />
                      <div>
                        <div className="text-sm font-medium text-ink">{fullName(s.user)}</div>
                        <div className="text-xs text-ink-muted">{s.student_id}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number" min="0" max={totalMarks} placeholder="—"
                        value={marks[s.id] ?? ''}
                        onChange={(e) => setMarks({ ...marks, [s.id]: e.target.value })}
                        className="h-9 w-20 rounded-lg border border-border bg-surface px-3 text-right text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                      />
                      <span className="text-sm text-ink-muted">/ {totalMarks}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {courseId && students.length > 0 && (
            <div className="mt-5 flex justify-end border-t border-border pt-4">
              <Button onClick={submit} loading={saving} disabled={enteredCount === 0}>Save Grades</Button>
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-ink">Recorded Grades</h3>
        </CardHeader>
        <DataTable
          columns={columns}
          data={existingGrades}
          loading={loadingGrades}
          empty={<EmptyState icon={Award} title="No grades recorded yet" description="Grades you enter will show up here." />}
        />
      </Card>
    </AppShell>
  );
}
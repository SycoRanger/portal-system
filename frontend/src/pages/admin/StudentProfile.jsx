import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Calendar, BookOpen, ClipboardCheck, Award } from 'lucide-react';
import { studentsApi } from '../../api/students';
import { attendanceApi } from '../../api/attendance';
import { gradesApi } from '../../api/grades';
import AppShell from '../../components/layout/AppShell';
import { Card, CardBody } from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageSpinner from '../../components/ui/PageSpinner';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { fullName, formatDate, cn } from '../../utils/format';
import getErrorMessage from '../../utils/getErrorMessage';

const STATUS_TONE = { present: 'success', absent: 'danger', leave: 'warning' };
const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'courses', label: 'Courses' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'grades', label: 'Grades' },
];

export default function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [s, a, g] = await Promise.all([studentsApi.get(id), attendanceApi.list(), gradesApi.list()]);
      setStudent(s.data);
      setAttendance(a.data.filter((r) => r.student === s.data.id));
      setGrades(g.data.filter((r) => r.student === s.data.id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const courses = useMemo(() => {
    const map = new Map();
    attendance.forEach((a) => a.course_detail && map.set(a.course_detail.id, a.course_detail));
    grades.forEach((g) => { if (!map.has(g.course)) map.set(g.course, { id: g.course, code: g.course_code, name: g.course_name }); });
    return Array.from(map.values());
  }, [attendance, grades]);

  const attendancePct = useMemo(() => {
    if (!attendance.length) return null;
    const present = attendance.filter((a) => a.status === 'present').length;
    return Math.round((present / attendance.length) * 1000) / 10;
  }, [attendance]);

  const avgGrade = useMemo(() => {
    const withPct = grades.filter((g) => g.percentage !== null && g.percentage !== undefined);
    if (!withPct.length) return null;
    return Math.round((withPct.reduce((a, g) => a + g.percentage, 0) / withPct.length) * 10) / 10;
  }, [grades]);

  if (loading) return <AppShell title="Student Profile"><PageSpinner /></AppShell>;
  if (error) return <AppShell title="Student Profile"><ErrorState message={error} onRetry={load} /></AppShell>;
  if (!student) return null;

  return (
    <AppShell title="Student Profile">
      <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/admin/students')} className="mb-4 -ml-2">
        Back to Students
      </Button>

      <Card className="mb-6">
        <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar name={fullName(student.user)} size={64} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-ink">{fullName(student.user)}</h1>
              <Badge tone="success">Active</Badge>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-muted">
              <span className="flex items-center gap-1.5"><BookOpen size={13} /> ID: {student.student_id}</span>
              {student.user.email && <span className="flex items-center gap-1.5"><Mail size={13} /> {student.user.email}</span>}
              {student.date_of_birth && <span className="flex items-center gap-1.5"><Calendar size={13} /> {formatDate(student.date_of_birth)}</span>}
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatMini icon={BookOpen} label="Enrolled Courses" value={courses.length} tone="primary" />
        <StatMini icon={ClipboardCheck} label="Attendance Rate" value={attendancePct !== null ? `${attendancePct}%` : '—'} tone="success" />
        <StatMini icon={Award} label="Average Grade" value={avgGrade !== null ? `${avgGrade}%` : '—'} tone="warning" />
      </div>

      <div className="mt-6 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Card className="mt-4 rounded-t-none">
        <CardBody>
          {tab === 'overview' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoRow label="Username" value={student.user.username} />
              <InfoRow label="Student ID" value={student.student_id} />
              <InfoRow label="Email" value={student.user.email || '—'} />
              <InfoRow label="Date of birth" value={student.date_of_birth ? formatDate(student.date_of_birth) : '—'} />
              <InfoRow label="Address" value={student.address || '—'} />
            </div>
          )}

          {tab === 'courses' && (
            courses.length === 0 ? (
              <EmptyState icon={BookOpen} title="No course activity yet" description="Courses appear here once attendance or grades are recorded." compact />
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="text-sm font-medium text-ink">{c.name}</div>
                      <div className="text-xs text-ink-muted">{c.code}</div>
                    </div>
                    <Badge tone="primary">{c.credit_hours ? `${c.credit_hours} credits` : 'Enrolled'}</Badge>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'attendance' && (
            attendance.length === 0 ? (
              <EmptyState icon={ClipboardCheck} title="No attendance records" description="Attendance for this student will show up here once marked." compact />
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {attendance.map((a) => (
                  <div key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-ink">{a.course_detail?.code}</span>
                    <span className="text-ink-muted">{formatDate(a.date)}</span>
                    <Badge tone={STATUS_TONE[a.status]}>{a.status}</Badge>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'grades' && (
            grades.length === 0 ? (
              <EmptyState icon={Award} title="No grades recorded" description="Grades for this student will show up here once entered." compact />
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {grades.map((g) => (
                  <div key={g.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <span className="text-ink">{g.course_code}</span>
                      <span className="ml-2 text-xs uppercase text-ink-muted">{g.exam_type}</span>
                    </div>
                    <span className="text-ink-muted">{g.marks_obtained}/{g.total_marks}</span>
                    <Badge tone="primary">{g.letter_grade}</Badge>
                  </div>
                ))}
              </div>
            )
          )}
        </CardBody>
      </Card>
    </AppShell>
  );
}

function StatMini({ icon: Icon, label, value, tone }) {
  const toneMap = { primary: 'bg-primary-soft text-primary', success: 'bg-success-soft text-success', warning: 'bg-warning-soft text-warning' };
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', toneMap[tone])}>
          <Icon size={18} />
        </div>
        <div>
          <div className="text-xs text-ink-muted">{label}</div>
          <div className="text-lg font-bold text-ink">{value}</div>
        </div>
      </CardBody>
    </Card>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</div>
      <div className="mt-1 text-sm text-ink">{value}</div>
    </div>
  );
}

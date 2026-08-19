import { useEffect, useState } from 'react';
import { ClipboardCheck, Award, BookOpen } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard';
import AppShell from '../../components/layout/AppShell';
import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import { greeting } from '../../utils/format';
import { useAuth } from '../../auth/AuthContext';
import getErrorMessage from '../../utils/getErrorMessage';

const GRADE_TONE = { A: 'success', B: 'success', C: 'warning', D: 'warning', F: 'danger' };

function AttendanceRing({ percentage }) {
  const pct = percentage ?? 0;
  const r = 42, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg width="112" height="112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} strokeWidth="10" className="stroke-border" fill="none" />
        <circle
          cx="56" cy="56" r={r} strokeWidth="10" fill="none" strokeLinecap="round"
          className="stroke-primary transition-all duration-700"
          strokeDasharray={c} strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-bold text-ink">{percentage !== null ? `${percentage}%` : '—'}</div>
        <div className="text-[10px] text-ink-muted">Attendance</div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await dashboardApi.summary();
      setData(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return <AppShell title="Dashboard"><ErrorState message={error} onRetry={load} /></AppShell>;

  return (
    <AppShell title="Dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink">{greeting()}, {user?.first_name || user?.username}</h1>
        <p className="mt-1 text-sm text-ink-muted">Here's a snapshot of your academic progress.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center p-6 lg:col-span-1">
          {loading ? <div className="skeleton h-28 w-28 rounded-full" /> : <AttendanceRing percentage={data?.overall_attendance_percentage} />}
          <p className="mt-3 text-center text-xs text-ink-muted">Overall attendance across all courses</p>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
          <StatCard icon={BookOpen} label="Courses Tracked" value={data?.attendance_by_course?.length ?? 0} hint="With attendance records" tone="primary" loading={loading} />
          <StatCard icon={Award} label="Grades Recorded" value={data?.grades?.length ?? 0} hint="Across all exams" tone="success" loading={loading} />
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-sm font-semibold text-ink">Attendance by Course</h3>
        </CardHeader>
        <CardBody className="pt-2">
          {loading ? (
            <div className="flex flex-col gap-3">{[1, 2].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}</div>
          ) : !data?.attendance_by_course?.length ? (
            <EmptyState icon={ClipboardCheck} title="No attendance yet" description="Your attendance records will appear here once your teacher marks them." compact />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {data.attendance_by_course.map((a, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <span className="w-20 shrink-0 text-sm font-medium text-ink">{a.course}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-hover">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${a.percentage}%` }} />
                  </div>
                  <span className="w-28 shrink-0 text-right text-xs text-ink-muted">{a.present}/{a.total} · {a.percentage}%</span>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <h3 className="text-sm font-semibold text-ink">Recent Grades</h3>
        </CardHeader>
        <CardBody className="pt-2">
          {loading ? (
            <div className="flex flex-col gap-3">{[1, 2].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}</div>
          ) : !data?.grades?.length ? (
            <EmptyState icon={Award} title="No grades yet" description="Grades entered by your teachers will appear here." compact />
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {data.grades.map((g, i) => (
                <div key={i} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <span className="font-medium text-ink">{g.course}</span>
                    <span className="ml-2 text-xs uppercase text-ink-muted">{g.exam_type}</span>
                  </div>
                  <span className="text-ink-muted">{g.marks_obtained}/{g.total_marks}</span>
                  {g.letter_grade && <Badge tone={GRADE_TONE[g.letter_grade]}>{g.letter_grade}</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </AppShell>
  );
}

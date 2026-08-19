import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, ClipboardCheck, ArrowUpRight, UserPlus } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard';
import { attendanceApi } from '../../api/attendance';
import { gradesApi } from '../../api/grades';
import AppShell from '../../components/layout/AppShell';
import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import AttendanceTrendChart from '../../components/dashboard/AttendanceTrendChart';
import GradeDistributionChart from '../../components/dashboard/GradeDistributionChart';
import { greeting } from '../../utils/format';
import getErrorMessage from '../../utils/getErrorMessage';

function buildAttendanceTrend(records) {
  const days = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const counts = Object.fromEntries(days.map((d) => [d, 0]));
  records.forEach((r) => {
    if (r.status === 'present' && counts[r.date] !== undefined) counts[r.date] += 1;
  });
  return days.map((d) => ({
    label: new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    present: counts[d],
  }));
}

function buildGradeAverages(grades) {
  const byCourse = {};
  grades.forEach((g) => {
    if (g.percentage === null || g.percentage === undefined) return;
    byCourse[g.course_code] = byCourse[g.course_code] || [];
    byCourse[g.course_code].push(g.percentage);
  });
  return Object.entries(byCourse).map(([course, vals]) => ({
    course,
    average: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
  }));
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [attendanceTrend, setAttendanceTrend] = useState(null);
  const [gradeAverages, setGradeAverages] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [summaryRes, attendanceRes, gradesRes] = await Promise.all([
        dashboardApi.summary(),
        attendanceApi.list(),
        gradesApi.list(),
      ]);
      setData(summaryRes.data);
      setAttendanceTrend(buildAttendanceTrend(attendanceRes.data));
      setGradeAverages(buildGradeAverages(gradesRes.data));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <AppShell title="Dashboard">
      <PageIntro today={today} />

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label="Total Students" value={data?.total_students ?? 0} hint="Active student directory" tone="primary" loading={loading} />
            <StatCard icon={GraduationCap} label="Total Teachers" value={data?.total_teachers ?? 0} hint="Across all departments" tone="success" loading={loading} />
            <StatCard icon={BookOpen} label="Total Courses" value={data?.total_courses ?? 0} hint="Currently offered" tone="warning" loading={loading} />
            <StatCard
              icon={ClipboardCheck}
              label="Attendance Today"
              value={data ? `${data.attendance_today.present}/${data.attendance_today.marked}` : '0/0'}
              hint={data?.attendance_today?.percentage !== null && data?.attendance_today?.percentage !== undefined ? `${data.attendance_today.percentage}% present` : 'No records marked yet'}
              tone="danger"
              loading={loading}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
            <AttendanceTrendChart data={attendanceTrend} loading={loading} />
            <GradeDistributionChart data={gradeAverages} loading={loading} />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <div>
                <h3 className="text-sm font-semibold text-ink">Recent Students</h3>
                <p className="text-xs text-ink-muted">Newest additions to the student directory</p>
              </div>
              <Button variant="ghost" size="sm" icon={ArrowUpRight} onClick={() => navigate('/admin/students')}>
                View all
              </Button>
            </CardHeader>
            <CardBody className="pt-2">
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
                </div>
              ) : !data?.recent_students?.length ? (
                <EmptyState
                  icon={UserPlus}
                  title="No students yet"
                  description="Your student directory is empty. Add your first student to get started."
                  actionLabel="Add Student"
                  onAction={() => navigate('/admin/students')}
                />
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {data.recent_students.map((s, i) => (
                    <div key={i} className="flex items-center gap-3 py-3">
                      <Avatar name={s.name} size={34} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-ink">{s.name}</div>
                        <div className="text-xs text-ink-muted">ID: {s.student_id}</div>
                      </div>
                      <Badge tone="success">Active</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </>
      )}
    </AppShell>
  );
}

function PageIntro({ today }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-ink">{greeting()}, Admin</h1>
      <p className="mt-1 text-sm text-ink-muted">Here's what's happening with your institution today · {today}</p>
    </div>
  );
}

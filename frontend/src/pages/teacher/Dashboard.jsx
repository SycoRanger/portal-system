import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, ClipboardCheck, ClipboardList } from 'lucide-react';
import { dashboardApi } from '../../api/dashboard';
import AppShell from '../../components/layout/AppShell';
import StatCard from '../../components/ui/StatCard';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import { greeting } from '../../utils/format';
import getErrorMessage from '../../utils/getErrorMessage';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  return (
    <AppShell title="Dashboard">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">{greeting()}, Teacher</h1>
          <p className="mt-1 text-sm text-ink-muted">Here's an overview of your classes today.</p>
        </div>
        <Button icon={ClipboardCheck} onClick={() => navigate('/teacher/attendance')}>Take Attendance</Button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={BookOpen} label="My Courses" value={data?.total_courses ?? 0} hint="Assigned to you" tone="primary" loading={loading} />
            <StatCard icon={Users} label="My Students" value={data?.total_students ?? 0} hint="Across all courses" tone="success" loading={loading} />
            <StatCard icon={ClipboardList} label="Marked Today" value={data?.attendance_marked_today ?? 0} hint="Attendance records" tone="warning" loading={loading} />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <div>
                <h3 className="text-sm font-semibold text-ink">My Courses</h3>
                <p className="text-xs text-ink-muted">Courses assigned to you this term</p>
              </div>
            </CardHeader>
            <CardBody className="pt-2">
              {loading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2].map((i) => <div key={i} className="skeleton h-12 rounded-lg" />)}
                </div>
              ) : !data?.courses?.length ? (
                <EmptyState icon={BookOpen} title="No courses assigned" description="Once an admin assigns you a course, it will appear here." />
              ) : (
                <div className="flex flex-col divide-y divide-border">
                  {data.courses.map((c) => (
                    <div key={c.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="text-sm font-medium text-ink">{c.name}</div>
                        <div className="text-xs text-ink-muted">{c.code}</div>
                      </div>
                      <Badge tone="primary">Active</Badge>
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

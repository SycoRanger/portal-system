import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardHeader, CardBody } from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Sk from '../ui/Skeleton';
import { CalendarRange } from 'lucide-react';

export default function AttendanceTrendChart({ data, loading }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-sm font-semibold text-ink">Attendance Overview</h3>
          <p className="text-xs text-ink-muted">Present count over the last 14 days</p>
        </div>
      </CardHeader>
      <CardBody className="pt-3">
        {loading ? (
          <Sk className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState
            compact
            icon={CalendarRange}
            title="No attendance recorded yet"
            description="Once teachers start marking attendance, trends will appear here."
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="rgb(var(--border))" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid rgb(var(--border))',
                  background: 'rgb(var(--surface))',
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="present" stroke="rgb(var(--primary))" strokeWidth={2} fill="url(#attendanceFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}

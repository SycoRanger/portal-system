import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Card, CardHeader, CardBody } from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import Sk from '../ui/Skeleton';
import { Award } from 'lucide-react';

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

export default function GradeDistributionChart({ data, loading }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h3 className="text-sm font-semibold text-ink">Academic Performance</h3>
          <p className="text-xs text-ink-muted">Average score by course</p>
        </div>
      </CardHeader>
      <CardBody className="pt-3">
        {loading ? (
          <Sk className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <EmptyState
            compact
            icon={Award}
            title="No grades recorded yet"
            description="Once teachers enter marks, course averages will appear here."
          />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid vertical={false} stroke="rgb(var(--border))" />
              <XAxis dataKey="course" tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'rgb(var(--ink-faint))' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                cursor={{ fill: 'rgb(var(--surface-hover))' }}
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid rgb(var(--border))',
                  background: 'rgb(var(--surface))',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="average" radius={[6, 6, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}

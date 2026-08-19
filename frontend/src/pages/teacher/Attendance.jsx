import { useEffect, useMemo, useState } from 'react';
import { ClipboardCheck, History, Trash2, CalendarRange } from 'lucide-react';
import { coursesApi } from '../../api/courses';
import { studentsApi } from '../../api/students';
import { attendanceApi } from '../../api/attendance';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import { fullName, formatDate, cn } from '../../utils/format';
import getErrorMessage from '../../utils/getErrorMessage';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', tone: 'success' },
  { value: 'leave', label: 'Leave', tone: 'warning' },
  { value: 'absent', label: 'Absent', tone: 'danger' },
];

export default function TeacherAttendance() {
  const [tab, setTab] = useState('mark');
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [statuses, setStatuses] = useState({});
  const [saving, setSaving] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [filterCourse, setFilterCourse] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    coursesApi.list().then((res) => setCourses(res.data));
    studentsApi.list().then((res) => setStudents(res.data));
  }, []);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const params = {};
      if (filterCourse) params.course = filterCourse;
      if (filterFrom) params.date_from = filterFrom;
      if (filterTo) params.date_to = filterTo;
      const res = await attendanceApi.list(params);
      setHistory(res.data);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab]);

  const presentCount = useMemo(() => Object.values(statuses).filter((s) => s === 'present').length, [statuses]);

  const saveAttendance = async () => {
    if (!courseId) return;
    setSaving(true);
    try {
      const entries = Object.entries(statuses).filter(([, v]) => v);
      for (const [studentId, status] of entries) {
        await attendanceApi.create({ student: Number(studentId), course: courseId, date, status });
      }
      toast.success(`Attendance saved for ${entries.length} student${entries.length !== 1 ? 's' : ''}.`);
      setStatuses({});
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (record, status) => {
    if (status === record.status) return;
    try {
      await attendanceApi.update(record.id, { status });
      toast.success('Attendance updated.');
      setHistory((prev) => prev.map((r) => (r.id === record.id ? { ...r, status } : r)));
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const removeRecord = async (r) => {
    const ok = await confirm({ title: 'Delete attendance record', description: `Remove ${r.student_detail?.student_id}'s record for ${formatDate(r.date)}?`, confirmLabel: 'Delete' });
    if (!ok) return;
    try {
      await attendanceApi.remove(r.id);
      toast.success('Record deleted.');
      loadHistory();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const historyColumns = [
    { key: 'date', header: 'Date', render: (r) => formatDate(r.date) },
    { key: 'student', header: 'Student', render: (r) => r.student_detail?.student_id },
    { key: 'course', header: 'Course', render: (r) => r.course_detail?.code },
    {
      key: 'status', header: 'Status',
      render: (r) => (
        <select
          value={r.status}
          onChange={(e) => updateStatus(r, e.target.value)}
          className={cn(
            'h-8 rounded-lg border px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/30',
            r.status === 'present' ? 'border-success/30 bg-success-soft text-success'
              : r.status === 'leave' ? 'border-warning/30 bg-warning-soft text-warning'
              : 'border-danger/30 bg-danger-soft text-danger'
          )}
        >
          {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ),
    },
    { key: 'actions', header: '', render: (r) => <button onClick={() => removeRecord(r)} className="text-ink-faint hover:text-danger"><Trash2 size={15} /></button> },
  ];

  return (
    <AppShell title="Attendance">
      <PageHeader title="Attendance" description="Mark today's attendance or browse past records." />

      <div className="mb-5 flex gap-1 border-b border-border">
        <button onClick={() => setTab('mark')} className={cn('flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium', tab === 'mark' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink')}>
          <ClipboardCheck size={15} /> Mark Attendance
        </button>
        <button onClick={() => setTab('history')} className={cn('flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium', tab === 'history' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink')}>
          <History size={15} /> History
        </button>
      </div>

      {tab === 'mark' && (
        <Card>
          <CardBody>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <Select label="Course" required value={courseId} onChange={(e) => { setCourseId(e.target.value); setStatuses({}); }} className="sm:w-64">
                <option value="">Select a course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
              <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="sm:w-48" />
              {courseId && <Badge tone="success" className="mb-0.5 h-fit">{presentCount} present so far</Badge>}
            </div>

            <div className="mt-5">
              {!courseId ? (
                <EmptyState icon={CalendarRange} title="Select a course to begin" description="Choose a course above to load its student roster." compact />
              ) : students.length === 0 ? (
                <EmptyState icon={ClipboardCheck} title="No students found" description="There are no students in the directory yet." compact />
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
                      <div className="flex gap-1.5">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setStatuses({ ...statuses, [s.id]: opt.value })}
                            className={cn(
                              'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                              statuses[s.id] === opt.value
                                ? opt.tone === 'success' ? 'border-success bg-success-soft text-success'
                                  : opt.tone === 'warning' ? 'border-warning bg-warning-soft text-warning'
                                  : 'border-danger bg-danger-soft text-danger'
                                : 'border-border text-ink-muted hover:bg-surface-hover'
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {courseId && students.length > 0 && (
              <div className="mt-5 flex justify-end border-t border-border pt-4">
                <Button onClick={saveAttendance} loading={saving} disabled={Object.keys(statuses).length === 0}>
                  Save Attendance
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {tab === 'history' && (
        <Card>
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-end">
            <Select label="Course" value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="sm:w-56">
              <option value="">All courses</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Input label="From" type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="sm:w-44" />
            <Input label="To" type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="sm:w-44" />
            <Button variant="secondary" onClick={loadHistory}>Apply Filters</Button>
          </div>
          <DataTable
            columns={historyColumns}
            data={history}
            loading={historyLoading}
            empty={<EmptyState icon={History} title="No attendance records" description="Records matching these filters will appear here." />}
          />
        </Card>
      )}
    </AppShell>
  );
}
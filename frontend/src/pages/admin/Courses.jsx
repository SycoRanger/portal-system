import { useEffect, useMemo, useState } from 'react';
import { Plus, MoreHorizontal, Pencil, Trash2, UserPlus2, BookOpen } from 'lucide-react';
import { coursesApi } from '../../api/courses';
import { teachersApi } from '../../api/teachers';
import { studentsApi } from '../../api/students';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import Dropdown, { DropdownItem } from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import getErrorMessage from '../../utils/getErrorMessage';

const emptyForm = { code: '', name: '', teacher_id: '', credit_hours: 3 };

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [enrollCourse, setEnrollCourse] = useState(null);
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  const toast = useToast();
  const confirm = useConfirm();

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const [c, t, s] = await Promise.all([coursesApi.list(), teachersApi.list(), studentsApi.list()]);
      setCourses(c.data);
      setTeachers(t.data);
      setStudents(s.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return courses;
    const q = query.toLowerCase();
    return courses.filter((c) => [c.code, c.name, c.teacher?.user?.username].some((v) => v?.toLowerCase().includes(q)));
  }, [courses, query]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setFormError(''); setFormOpen(true); };
  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({ code: c.code, name: c.name, teacher_id: c.teacher?.id || '', credit_hours: c.credit_hours });
    setFormError('');
    setFormOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = { code: form.code, name: form.name, credit_hours: Number(form.credit_hours), teacher_id: form.teacher_id || null };
      if (editingId) {
        await coursesApi.update(editingId, payload);
        toast.success('Course updated.');
      } else {
        await coursesApi.create(payload);
        toast.success('Course created.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c) => {
    const ok = await confirm({
      title: 'Delete course',
      description: `Are you sure you want to delete ${c.name} (${c.code})? This action cannot be undone.`,
      confirmLabel: 'Delete Course',
    });
    if (!ok) return;
    try {
      await coursesApi.remove(c.id);
      toast.success('Course deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const submitEnroll = async (e) => {
    e.preventDefault();
    if (!enrollStudentId) return;
    setEnrolling(true);
    try {
      await coursesApi.enroll(enrollCourse.id, enrollStudentId);
      toast.success(`Student enrolled in ${enrollCourse.code}.`);
      setEnrollCourse(null);
      setEnrollStudentId('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEnrolling(false);
    }
  };

  const columns = [
    {
      key: 'course', header: 'Course',
      render: (c) => (
        <div>
          <div className="font-medium text-ink">{c.name}</div>
          <div className="text-xs text-ink-muted">{c.code}</div>
        </div>
      ),
    },
    { key: 'teacher', header: 'Teacher', render: (c) => c.teacher?.user?.username ? <span className="text-ink-muted">{c.teacher.user.username}</span> : <Badge tone="warning">Unassigned</Badge> },
    { key: 'credits', header: 'Credit Hours', render: (c) => <span className="text-ink-muted">{c.credit_hours}</span> },
    { key: 'status', header: 'Status', render: () => <Badge tone="success">Active</Badge> },
    {
      key: 'actions', header: '',
      render: (c) => (
        <Dropdown trigger={<button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-hover hover:text-ink"><MoreHorizontal size={16} /></button>}>
          {(close) => (
            <>
              <DropdownItem icon={UserPlus2} onClick={() => { close(); setEnrollCourse(c); }}>Enroll student</DropdownItem>
              <DropdownItem icon={Pencil} onClick={() => { close(); openEdit(c); }}>Edit</DropdownItem>
              <DropdownItem icon={Trash2} danger onClick={() => { close(); remove(c); }}>Delete</DropdownItem>
            </>
          )}
        </Dropdown>
      ),
    },
  ];

  return (
    <AppShell title="Courses">
      <PageHeader
        title="Courses"
        description="Manage course offerings and instructor assignments."
        actions={<Button icon={Plus} onClick={openCreate}>Add Course</Button>}
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by code, name, or teacher..." className="sm:w-72" />
          <span className="text-xs text-ink-muted">{filtered.length} course{filtered.length !== 1 && 's'}</span>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          error={error}
          onRetry={load}
          empty={
            <EmptyState
              icon={BookOpen}
              title={query ? 'No matching courses' : 'No courses yet'}
              description={query ? 'Try a different search term.' : 'Create your first course offering to get started.'}
              actionLabel={!query ? 'Add Course' : undefined}
              onAction={!query ? openCreate : undefined}
            />
          }
        />
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? 'Edit Course' : 'Add Course'}>
        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          {formError && <div className="rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{formError}</div>}
          <Input label="Course code" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. CS101" />
          <Input label="Course name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Teacher" value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}>
            <option value="">Unassigned</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.user.username} {t.department && `— ${t.department}`}</option>)}
          </Select>
          <Input label="Credit hours" type="number" min="1" max="10" value={form.credit_hours} onChange={(e) => setForm({ ...form, credit_hours: e.target.value })} />
          <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingId ? 'Save Changes' : 'Add Course'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!enrollCourse} onClose={() => setEnrollCourse(null)} title="Enroll Student" size="sm">
        {enrollCourse && (
          <form onSubmit={submitEnroll} className="flex flex-col gap-4 p-6">
            <p className="text-sm text-ink-muted">Enroll a student into <span className="font-medium text-ink">{enrollCourse.name}</span>.</p>
            <Select label="Student" required value={enrollStudentId} onChange={(e) => setEnrollStudentId(e.target.value)}>
              <option value="">Select a student</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.student_id} — {s.user.username}</option>)}
            </Select>
            <div className="mt-1 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEnrollCourse(null)}>Cancel</Button>
              <Button type="submit" loading={enrolling}>Enroll</Button>
            </div>
          </form>
        )}
      </Modal>
    </AppShell>
  );
}

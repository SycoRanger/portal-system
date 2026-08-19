import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, MoreHorizontal, Eye, Pencil, KeyRound, Trash2, Users } from 'lucide-react';
import { studentsApi } from '../../api/students';
import { authApi } from '../../api/auth';
import { useToast } from '../../context/ToastContext';
import { useConfirm } from '../../context/ConfirmContext';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import SearchInput from '../../components/ui/SearchInput';
import DataTable from '../../components/ui/DataTable';
import EmptyState from '../../components/ui/EmptyState';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Dropdown, { DropdownItem } from '../../components/ui/Dropdown';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { fullName, formatDate } from '../../utils/format';
import getErrorMessage from '../../utils/getErrorMessage';

const emptyForm = { username: '', email: '', password: '', student_id: '', date_of_birth: '', first_name: '', last_name: '' };

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');

  const toast = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await studentsApi.list();
      setStudents(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return students;
    const q = query.toLowerCase();
    return students.filter((s) =>
      [s.student_id, s.user.username, fullName(s.user), s.user.email].some((v) => v?.toLowerCase().includes(q))
    );
  }, [students, query]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setFormError(''); setFormOpen(true); };
  const openEdit = (s) => {
    setEditingId(s.id);
    setForm({
      username: s.user.username, email: s.user.email || '', password: '',
      student_id: s.student_id, date_of_birth: s.date_of_birth || '',
      first_name: s.user.first_name || '', last_name: s.user.last_name || '',
    });
    setFormError('');
    setFormOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingId) {
        await studentsApi.update(editingId, {
          student_id: form.student_id, date_of_birth: form.date_of_birth || null,
          first_name: form.first_name, last_name: form.last_name, email: form.email,
        });
        toast.success('Student updated.');
      } else {
        const { data: user } = await authApi.register({
          username: form.username, email: form.email, password: form.password,
          first_name: form.first_name, last_name: form.last_name, role: 'student',
        });
        await studentsApi.create({ user_id: user.id, student_id: form.student_id, date_of_birth: form.date_of_birth || null });
        toast.success('Student added.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s) => {
    const ok = await confirm({
      title: 'Delete student',
      description: `Are you sure you want to delete ${fullName(s.user)}? This action cannot be undone.`,
      confirmLabel: 'Delete Student',
    });
    if (!ok) return;
    try {
      await studentsApi.remove(s.id);
      toast.success('Student deleted.');
      load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const submitReset = async (e) => {
    e.preventDefault();
    try {
      await authApi.resetPassword(resetTarget.user.id, resetPassword);
      toast.success(`Password reset for ${resetTarget.user.username}.`);
      setResetTarget(null);
      setResetPassword('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const columns = [
    {
      key: 'student', header: 'Student',
      render: (s) => (
        <button onClick={() => navigate(`/admin/students/${s.id}`)} className="flex items-center gap-3 text-left">
          <Avatar name={fullName(s.user)} size={32} />
          <div>
            <div className="font-medium text-ink hover:text-primary">{fullName(s.user)}</div>
            <div className="text-xs text-ink-muted">@{s.user.username}</div>
          </div>
        </button>
      ),
    },
    { key: 'student_id', header: 'Student ID', render: (s) => <span className="text-ink-muted">{s.student_id}</span> },
    { key: 'email', header: 'Email', render: (s) => <span className="text-ink-muted">{s.user.email || '—'}</span> },
    { key: 'dob', header: 'Date of Birth', render: (s) => <span className="text-ink-muted">{s.date_of_birth ? formatDate(s.date_of_birth) : '—'}</span> },
    { key: 'status', header: 'Status', render: () => <Badge tone="success">Active</Badge> },
    {
      key: 'actions', header: '',
      render: (s) => (
        <Dropdown trigger={<button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-hover hover:text-ink"><MoreHorizontal size={16} /></button>}>
          {(close) => (
            <>
              <DropdownItem icon={Eye} onClick={() => { close(); navigate(`/admin/students/${s.id}`); }}>View profile</DropdownItem>
              <DropdownItem icon={Pencil} onClick={() => { close(); openEdit(s); }}>Edit</DropdownItem>
              <DropdownItem icon={KeyRound} onClick={() => { close(); setResetTarget(s); }}>Reset password</DropdownItem>
              <DropdownItem icon={Trash2} danger onClick={() => { close(); remove(s); }}>Delete</DropdownItem>
            </>
          )}
        </Dropdown>
      ),
    },
  ];

  return (
    <AppShell title="Students">
      <PageHeader
        title="Students"
        description="Manage your institution's student directory."
        actions={<Button icon={UserPlus} onClick={openCreate}>Add Student</Button>}
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by name, ID, or email..." className="sm:w-72" />
          <span className="text-xs text-ink-muted">{filtered.length} student{filtered.length !== 1 && 's'}</span>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          error={error}
          onRetry={load}
          empty={
            <EmptyState
              icon={Users}
              title={query ? 'No matching students' : 'Your student directory is empty'}
              description={query ? 'Try a different search term.' : 'Add your first student to get started.'}
              actionLabel={!query ? 'Add Student' : undefined}
              onAction={!query ? openCreate : undefined}
            />
          }
        />
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? 'Edit Student' : 'Add Student'} size="lg">
        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          {formError && <div className="rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{formError}</div>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Username" required disabled={!!editingId} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <Input label="Student ID" required value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} />
            <Input label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Date of birth" type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} />
            {!editingId && (
              <Input label="Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="sm:col-span-2" />
            )}
          </div>
          <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingId ? 'Save Changes' : 'Add Student'}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!resetTarget} onClose={() => setResetTarget(null)} title="Reset Password" size="sm">
        {resetTarget && (
          <form onSubmit={submitReset} className="flex flex-col gap-4 p-6">
            <p className="text-sm text-ink-muted">Set a new password for <span className="font-medium text-ink">{resetTarget.user.username}</span>.</p>
            <Input label="New password" type="password" required minLength={6} value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} autoFocus />
            <div className="mt-1 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setResetTarget(null)}>Cancel</Button>
              <Button type="submit">Reset Password</Button>
            </div>
          </form>
        )}
      </Modal>
    </AppShell>
  );
}

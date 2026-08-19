import { useEffect, useMemo, useState } from 'react';
import { UserPlus, MoreHorizontal, Pencil, KeyRound, Trash2, GraduationCap } from 'lucide-react';
import { teachersApi } from '../../api/teachers';
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
import { fullName } from '../../utils/format';
import getErrorMessage from '../../utils/getErrorMessage';

const emptyForm = { username: '', email: '', password: '', teacher_id: '', department: '', first_name: '', last_name: '' };

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
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

  const load = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await teachersApi.list();
      setTeachers(res.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return teachers;
    const q = query.toLowerCase();
    return teachers.filter((t) =>
      [t.teacher_id, t.user.username, fullName(t.user), t.department].some((v) => v?.toLowerCase().includes(q))
    );
  }, [teachers, query]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setFormError(''); setFormOpen(true); };
  const openEdit = (t) => {
    setEditingId(t.id);
    setForm({
      username: t.user.username, email: t.user.email || '', password: '',
      teacher_id: t.teacher_id, department: t.department || '',
      first_name: t.user.first_name || '', last_name: t.user.last_name || '',
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
        await teachersApi.update(editingId, {
          teacher_id: form.teacher_id, department: form.department,
          first_name: form.first_name, last_name: form.last_name, email: form.email,
        });
        toast.success('Teacher updated.');
      } else {
        const { data: user } = await authApi.register({
          username: form.username, email: form.email, password: form.password,
          first_name: form.first_name, last_name: form.last_name, role: 'teacher',
        });
        await teachersApi.create({ user_id: user.id, teacher_id: form.teacher_id, department: form.department });
        toast.success('Teacher added.');
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (t) => {
    const ok = await confirm({
      title: 'Delete teacher',
      description: `Are you sure you want to delete ${fullName(t.user)}? This action cannot be undone.`,
      confirmLabel: 'Delete Teacher',
    });
    if (!ok) return;
    try {
      await teachersApi.remove(t.id);
      toast.success('Teacher deleted.');
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
      key: 'teacher', header: 'Teacher',
      render: (t) => (
        <div className="flex items-center gap-3">
          <Avatar name={fullName(t.user)} size={32} />
          <div>
            <div className="font-medium text-ink">{fullName(t.user)}</div>
            <div className="text-xs text-ink-muted">@{t.user.username}</div>
          </div>
        </div>
      ),
    },
    { key: 'teacher_id', header: 'Teacher ID', render: (t) => <span className="text-ink-muted">{t.teacher_id}</span> },
    { key: 'department', header: 'Department', render: (t) => t.department ? <Badge tone="primary">{t.department}</Badge> : <span className="text-ink-muted">—</span> },
    { key: 'email', header: 'Email', render: (t) => <span className="text-ink-muted">{t.user.email || '—'}</span> },
    {
      key: 'actions', header: '',
      render: (t) => (
        <Dropdown trigger={<button className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint hover:bg-surface-hover hover:text-ink"><MoreHorizontal size={16} /></button>}>
          {(close) => (
            <>
              <DropdownItem icon={Pencil} onClick={() => { close(); openEdit(t); }}>Edit</DropdownItem>
              <DropdownItem icon={KeyRound} onClick={() => { close(); setResetTarget(t); }}>Reset password</DropdownItem>
              <DropdownItem icon={Trash2} danger onClick={() => { close(); remove(t); }}>Delete</DropdownItem>
            </>
          )}
        </Dropdown>
      ),
    },
  ];

  return (
    <AppShell title="Teachers">
      <PageHeader
        title="Teachers"
        description="Manage faculty accounts and departments."
        actions={<Button icon={UserPlus} onClick={openCreate}>Add Teacher</Button>}
      />

      <Card>
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput value={query} onChange={setQuery} placeholder="Search by name, ID, or department..." className="sm:w-72" />
          <span className="text-xs text-ink-muted">{filtered.length} teacher{filtered.length !== 1 && 's'}</span>
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          error={error}
          onRetry={load}
          empty={
            <EmptyState
              icon={GraduationCap}
              title={query ? 'No matching teachers' : 'No teachers yet'}
              description={query ? 'Try a different search term.' : 'Add your first teacher to build out your faculty.'}
              actionLabel={!query ? 'Add Teacher' : undefined}
              onAction={!query ? openCreate : undefined}
            />
          }
        />
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editingId ? 'Edit Teacher' : 'Add Teacher'} size="lg">
        <form onSubmit={submit} className="flex flex-col gap-4 p-6">
          {formError && <div className="rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">{formError}</div>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Username" required disabled={!!editingId} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            <Input label="Teacher ID" required value={form.teacher_id} onChange={(e) => setForm({ ...form, teacher_id: e.target.value })} />
            <Input label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Input label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            {!editingId && (
              <Input label="Password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="sm:col-span-2" />
            )}
          </div>
          <div className="mt-2 flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingId ? 'Save Changes' : 'Add Teacher'}</Button>
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

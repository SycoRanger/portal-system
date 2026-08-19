import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { authApi } from '../api/auth';
import { useToast } from '../context/ToastContext';
import AppShell from '../components/layout/AppShell';
import { Card, CardBody } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import getErrorMessage from '../utils/getErrorMessage';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.changePassword({ old_password: oldPassword, new_password: newPassword });
      toast.success('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell title="Change Password">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <KeyRound size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Change Password</h1>
            <p className="text-sm text-ink-muted">Update the password for your account.</p>
          </div>
        </div>

        <Card>
          <CardBody>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="rounded-lg border border-danger/20 bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
                  {error}
                </div>
              )}
              <Input
                label="Current password"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
              <Button type="submit" loading={loading} className="mt-1 self-start">
                Update password
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}

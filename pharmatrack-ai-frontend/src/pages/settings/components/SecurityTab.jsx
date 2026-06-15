import { useState } from 'react';
import Icon from '@/components/common/Icon';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormSection from '@/components/forms/FormSection';
import TextField from '@/components/forms/TextField';
import * as authService from '@/services/authService';
import ToggleSwitch from './ToggleSwitch';

const INITIAL_SESSIONS = [
  { id: 'sess-1', device: 'Chrome on Windows', location: 'Boston, MA', current: true, lastActive: 'Active now' },
  { id: 'sess-2', device: 'PharmaTrack Mobile (iOS)', location: 'Chicago, IL', current: false, lastActive: '2 hours ago' },
  { id: 'sess-3', device: 'Firefox on macOS', location: 'Seattle, WA', current: false, lastActive: '3 days ago' },
];

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function SecurityTab() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const revokeSession = (id) => setSessions((prev) => prev.filter((session) => session.id !== id));

  const handlePasswordChange = (field) => (event) => {
    setPasswordForm((prev) => ({ ...prev, [field]: event.target.value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
    setPasswordSaved(false);
  };

  const validatePasswordForm = () => {
    const nextErrors = {};
    if (!passwordForm.currentPassword) nextErrors.currentPassword = 'Current password is required.';
    if (!passwordForm.newPassword) nextErrors.newPassword = 'New password is required.';
    else if (passwordForm.newPassword.length < 8) nextErrors.newPassword = 'Password must be at least 8 characters.';
    if (passwordForm.confirmPassword !== passwordForm.newPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    return nextErrors;
  };

  const handleUpdatePassword = async () => {
    const nextErrors = validatePasswordForm();
    setPasswordErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPasswordSaving(true);
    try {
      await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm(EMPTY_PASSWORD_FORM);
      setPasswordSaved(true);
    } catch (err) {
      setPasswordErrors({ form: err.response?.data?.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-base font-semibold text-on-surface">Change Password</h3>
        <p className="mt-1 text-sm text-on-surface-variant">Use a strong password you don&apos;t reuse on other sites.</p>
        <FormSection className="mt-4">
          <TextField
            label="Current Password"
            id="currentPassword"
            type="password"
            icon="lock"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange('currentPassword')}
            error={passwordErrors.currentPassword}
            containerClassName="sm:col-span-2"
          />
          <TextField
            label="New Password"
            id="newPassword"
            type="password"
            icon="lock_reset"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange('newPassword')}
            error={passwordErrors.newPassword}
          />
          <TextField
            label="Confirm New Password"
            id="confirmPassword"
            type="password"
            icon="lock_reset"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange('confirmPassword')}
            error={passwordErrors.confirmPassword}
          />
        </FormSection>
        <div className="mt-4 flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
          {passwordErrors.form && (
            <span className="flex items-center gap-1.5 text-sm text-error">
              <Icon name="error" className="text-base" />
              {passwordErrors.form}
            </span>
          )}
          {passwordSaved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-500">
              <Icon name="check_circle" filled className="text-base" />
              Password updated
            </span>
          )}
          <Button onClick={handleUpdatePassword} disabled={passwordSaving}>
            <Icon name="save" className="text-base" />
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <ToggleSwitch
          id="twoFactor"
          label="Two-Factor Authentication"
          description="Require a verification code in addition to your password when signing in."
          checked={twoFactor}
          onChange={setTwoFactor}
        />
      </Card>

      <Card className="p-6">
        <h3 className="text-base font-semibold text-on-surface">Active Sessions</h3>
        <p className="mt-1 text-sm text-on-surface-variant">Devices currently signed in to your account.</p>
        <div className="mt-4 divide-y divide-outline-variant/60">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-high text-on-surface-variant">
                  <Icon name={session.device.includes('Mobile') ? 'smartphone' : 'computer'} />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium text-on-surface">
                    {session.device}
                    {session.current && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        This device
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {session.location} · {session.lastActive}
                  </p>
                </div>
              </div>
              {!session.current && (
                <Button variant="outline" size="sm" onClick={() => revokeSession(session.id)}>
                  Sign Out
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

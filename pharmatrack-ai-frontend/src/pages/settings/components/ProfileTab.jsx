import { useState } from 'react';
import Avatar from '@/components/common/Avatar';
import Icon from '@/components/common/Icon';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import FormSection from '@/components/forms/FormSection';
import TextField from '@/components/forms/TextField';
import TextAreaField from '@/components/forms/TextAreaField';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileTab() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    title: user?.title ?? '',
    facility: user?.facility ?? '',
    bio: user?.bio ?? '',
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setSaved(false);
  };

  const handleSave = (event) => {
    event.preventDefault();
    setSaved(true);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSave} className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar src={user?.avatarUrl} name={user?.name} size="lg" />
          <div>
            <p className="text-sm font-semibold text-on-surface">{user?.name}</p>
            <p className="text-xs text-on-surface-variant">{user?.role}</p>
            <Button type="button" variant="outline" size="sm" className="mt-2">
              <Icon name="upload" className="text-sm" />
              Change Photo
            </Button>
          </div>
        </div>

        <FormSection title="Personal Information" description="Update your details and how your profile appears to other team members.">
          <TextField label="Full Name" id="profileName" value={form.name} onChange={handleChange('name')} />
          <TextField label="Email Address" id="profileEmail" type="email" icon="mail" value={form.email} onChange={handleChange('email')} />
          <TextField label="Job Title" id="profileTitle" icon="badge" value={form.title} onChange={handleChange('title')} />
          <TextField label="Facility" id="profileFacility" icon="location_on" value={form.facility} onChange={handleChange('facility')} />
          <TextAreaField
            label="Bio"
            id="profileBio"
            rows={3}
            value={form.bio}
            onChange={handleChange('bio')}
            containerClassName="sm:col-span-2"
            helperText="A short description shown on your profile."
          />
        </FormSection>

        <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-500">
              <Icon name="check_circle" filled className="text-base" />
              Saved
            </span>
          )}
          <Button type="submit">
            <Icon name="save" className="text-base" />
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

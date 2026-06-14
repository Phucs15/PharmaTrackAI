import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Icon from '@/components/common/Icon';
import FormSection from '@/components/forms/FormSection';
import TextField from '@/components/forms/TextField';
import SelectField from '@/components/forms/SelectField';
import * as userService from '@/services/userService';
import { ALL_ROLES } from '@/constants/roles';
import { FACILITIES } from '@/constants/medicineOptions';

const EMPTY_FORM = {
  name: '',
  email: '',
  role: '',
  title: '',
  facility: '',
  status: 'Active',
};

const STATUS_OPTIONS = ['Active', 'Inactive'];

export default function AddUserModal({ open, onClose, onSaved, user = null }) {
  const isEdit = Boolean(user);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm(
        user
          ? {
              name: user.name,
              email: user.email,
              role: user.role,
              title: user.title ?? '',
              facility: user.facility ?? '',
              status: user.status ?? 'Active',
            }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.email.trim()) nextErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email address.';
    if (!form.role) nextErrors.role = 'Select a role.';
    if (!form.facility) nextErrors.facility = 'Select a facility.';
    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    if (isEdit) {
      await userService.update(user.id, form);
    } else {
      await userService.create(form);
    }
    setSaving(false);
    await onSaved?.();
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit User' : 'Add New User'} size="lg">
      <div className="space-y-6">
        <p className="text-sm text-on-surface-variant">
          {isEdit
            ? 'Update this team member’s details and access level.'
            : 'Invite a new team member and assign their role and facility.'}
        </p>

        <FormSection>
          <TextField
            label="Full Name"
            id="userName"
            icon="person"
            placeholder="e.g. Jane Doe"
            value={form.name}
            onChange={handleChange('name')}
            required
            error={errors.name}
            containerClassName="sm:col-span-2"
          />
          <TextField
            label="Email Address"
            id="userEmail"
            type="email"
            icon="mail"
            placeholder="jane.doe@pharmatrack.com"
            value={form.email}
            onChange={handleChange('email')}
            required
            error={errors.email}
            containerClassName="sm:col-span-2"
          />
          <SelectField
            label="Role"
            id="userRole"
            placeholder="Select role"
            options={ALL_ROLES}
            value={form.role}
            onChange={handleChange('role')}
            required
            error={errors.role}
          />
          <TextField
            label="Job Title"
            id="userTitle"
            icon="badge"
            placeholder="e.g. Warehouse Staff"
            value={form.title}
            onChange={handleChange('title')}
          />
          <SelectField
            label="Facility"
            id="userFacility"
            placeholder="Select facility"
            options={FACILITIES}
            value={form.facility}
            onChange={handleChange('facility')}
            required
            error={errors.facility}
          />
          <SelectField
            label="Status"
            id="userStatus"
            options={STATUS_OPTIONS}
            value={form.status}
            onChange={handleChange('status')}
          />
        </FormSection>

        <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Icon name="save" className="text-base" />
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add User'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

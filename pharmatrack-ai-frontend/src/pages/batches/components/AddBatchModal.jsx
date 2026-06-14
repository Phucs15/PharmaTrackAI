import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Icon from '@/components/common/Icon';
import FormSection from '@/components/forms/FormSection';
import TextField from '@/components/forms/TextField';
import SelectField from '@/components/forms/SelectField';
import DateField from '@/components/forms/DateField';
import * as batchService from '@/services/batchService';
import { FACILITIES, UNIT_TYPES } from '@/constants/medicineOptions';

const EMPTY_FORM = {
  batchNumber: '',
  medicineId: '',
  facility: '',
  quantity: '',
  unitType: '',
  mfgDate: '',
  expDate: '',
};

export default function AddBatchModal({ open, onClose, onSaved, medicines = [] }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({
      ...prev,
      [field]: field === 'batchNumber' ? value.toUpperCase() : value,
      ...(field === 'medicineId'
        ? { unitType: medicines.find((med) => med.id === value)?.unitType ?? prev.unitType }
        : {}),
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.batchNumber.trim()) nextErrors.batchNumber = 'Batch number is required.';
    if (!form.medicineId) nextErrors.medicineId = 'Select a medicine.';
    if (!form.facility) nextErrors.facility = 'Select a facility.';
    if (!form.unitType) nextErrors.unitType = 'Select a unit type.';
    if (form.quantity === '' || Number(form.quantity) <= 0) {
      nextErrors.quantity = 'Enter a valid quantity.';
    }
    if (!form.mfgDate) nextErrors.mfgDate = 'Manufacture date is required.';
    if (!form.expDate) nextErrors.expDate = 'Expiry date is required.';
    if (form.mfgDate && form.expDate && form.expDate <= form.mfgDate) {
      nextErrors.expDate = 'Expiry date must be after the manufacture date.';
    }
    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const medicine = medicines.find((med) => med.id === form.medicineId);

    setSaving(true);
    await batchService.create({
      batchNumber: form.batchNumber.trim(),
      medicineId: form.medicineId,
      medicineName: medicine?.name ?? '',
      facility: form.facility,
      quantity: Number(form.quantity),
      unitType: form.unitType,
      mfgDate: form.mfgDate,
      expDate: form.expDate,
    });
    setSaving(false);
    await onSaved?.();
    onClose?.();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Batch" size="lg">
      <div className="space-y-6">
        <p className="text-sm text-on-surface-variant">
          Register a new batch into the inventory tracking system.
        </p>

        <FormSection>
          <TextField
            label="Batch Number"
            id="batchNumber"
            icon="tag"
            placeholder="e.g. B-2024-100"
            value={form.batchNumber}
            onChange={handleChange('batchNumber')}
            required
            error={errors.batchNumber}
            className="font-mono uppercase"
            containerClassName="sm:col-span-2"
          />
          <SelectField
            label="Medicine"
            id="medicineId"
            placeholder="Select medicine"
            options={medicines.map((med) => ({ value: med.id, label: `${med.name} (${med.code})` }))}
            value={form.medicineId}
            onChange={handleChange('medicineId')}
            required
            error={errors.medicineId}
          />
          <SelectField
            label="Facility"
            id="facility"
            placeholder="Select facility"
            options={FACILITIES}
            value={form.facility}
            onChange={handleChange('facility')}
            required
            error={errors.facility}
          />
          <TextField
            label="Quantity"
            id="quantity"
            type="number"
            min="1"
            icon="inventory_2"
            value={form.quantity}
            onChange={handleChange('quantity')}
            required
            error={errors.quantity}
          />
          <SelectField
            label="Unit Type"
            id="unitType"
            placeholder="Select unit type"
            options={UNIT_TYPES}
            value={form.unitType}
            onChange={handleChange('unitType')}
            required
            error={errors.unitType}
          />
          <DateField
            label="Manufacture Date"
            id="mfgDate"
            value={form.mfgDate}
            onChange={handleChange('mfgDate')}
            required
            error={errors.mfgDate}
          />
          <DateField
            label="Expiry Date"
            id="expDate"
            value={form.expDate}
            onChange={handleChange('expDate')}
            required
            error={errors.expDate}
          />
        </FormSection>

        <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Icon name="save" className="text-base" />
            {saving ? 'Saving...' : 'Save Batch'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

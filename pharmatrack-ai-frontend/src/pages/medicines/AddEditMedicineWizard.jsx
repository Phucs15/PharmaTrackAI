import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Stepper from '@/components/forms/Stepper';
import FormSection from '@/components/forms/FormSection';
import TextField from '@/components/forms/TextField';
import SelectField from '@/components/forms/SelectField';
import TextAreaField from '@/components/forms/TextAreaField';
import * as medicineService from '@/services/medicineService';
import { MEDICINE_CATEGORIES, UNIT_TYPES } from '@/constants/medicineOptions';
import { formatCurrency, formatNumber, getUnitAbbreviation } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const STEPS = ['Identification', 'Logistics', 'Review'];

const EMPTY_FORM = {
  name: '',
  code: '',
  category: '',
  manufacturer: '',
  unitType: '',
  totalStock: '',
  reorderLevel: '',
  unitPrice: '',
  storageNotes: '',
};

function ReviewRow({ label, value, mono = false }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant/40 py-2.5 text-sm last:border-b-0">
      <span className="text-on-surface-variant">{label}</span>
      <span className={cn('text-right font-medium text-on-surface', mono && 'font-mono')}>{value || '-'}</span>
    </div>
  );
}

export default function AddEditMedicineWizard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { onSaved } = useOutletContext() ?? {};
  const isEdit = Boolean(id);

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const medicine = await medicineService.getById(id);
      if (cancelled) return;
      setForm({
        name: medicine.name,
        code: medicine.code,
        category: medicine.category,
        manufacturer: medicine.manufacturer,
        unitType: medicine.unitType,
        totalStock: medicine.totalStock,
        reorderLevel: medicine.reorderLevel,
        unitPrice: medicine.unitPrice ?? '',
        storageNotes: medicine.storageNotes ?? '',
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const handleClose = () => navigate('/medicines');

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: field === 'code' ? value.toUpperCase() : value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const getStepErrors = (step) => {
    const stepErrors = {};
    if (step === 0) {
      if (!form.name.trim()) stepErrors.name = 'Medicine name is required.';
      if (!form.code.trim()) stepErrors.code = 'Item code is required.';
      if (!form.category) stepErrors.category = 'Select a category.';
      if (!form.manufacturer.trim()) stepErrors.manufacturer = 'Manufacturer is required.';
    }
    if (step === 1) {
      if (!form.unitType) stepErrors.unitType = 'Select a unit type.';
      if (form.totalStock === '' || Number(form.totalStock) < 0) {
        stepErrors.totalStock = 'Enter a valid stock quantity.';
      }
      if (form.reorderLevel === '' || Number(form.reorderLevel) < 0) {
        stepErrors.reorderLevel = 'Enter a valid reorder level.';
      }
    }
    return stepErrors;
  };

  const handleNext = () => {
    const stepErrors = getStepErrors(activeStep);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setActiveStep((step) => Math.min(step + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((step) => Math.max(step - 1, 0));

  const handleSave = async () => {
    const identificationErrors = getStepErrors(0);
    const logisticsErrors = getStepErrors(1);

    if (Object.keys(identificationErrors).length > 0) {
      setErrors(identificationErrors);
      setActiveStep(0);
      return;
    }
    if (Object.keys(logisticsErrors).length > 0) {
      setErrors(logisticsErrors);
      setActiveStep(1);
      return;
    }

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      category: form.category,
      manufacturer: form.manufacturer.trim(),
      unitType: form.unitType,
      totalStock: Number(form.totalStock),
      reorderLevel: Number(form.reorderLevel),
      unitPrice: form.unitPrice === '' ? 0 : Number(form.unitPrice),
      storageNotes: form.storageNotes.trim(),
    };

    if (isEdit) {
      await medicineService.update(id, payload);
    } else {
      await medicineService.create(payload);
    }

    setSaving(false);
    await onSaved?.();
    navigate('/medicines');
  };

  return (
    <Modal open onClose={handleClose} title={isEdit ? 'Edit Medicine' : 'Add New Medicine'} size="lg">
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-on-surface-variant">
            {isEdit
              ? 'Update the catalog details for this medicine.'
              : 'Add a new medicine to the pharmaceutical inventory catalog.'}
          </p>

          <Stepper steps={STEPS} activeStep={activeStep} />

          {activeStep === 0 && (
            <FormSection title="Identification" description="Basic details that identify this medicine.">
              <TextField
                label="Medicine Name"
                id="name"
                icon="prescriptions"
                value={form.name}
                onChange={handleChange('name')}
                required
                error={errors.name}
                containerClassName="sm:col-span-2"
              />
              <TextField
                label="Item Code / SKU"
                id="code"
                value={form.code}
                onChange={handleChange('code')}
                required
                error={errors.code}
                className="font-mono uppercase"
                helperText="Unique internal identifier, e.g. AMX-500."
              />
              <SelectField
                label="Therapeutic Category"
                id="category"
                placeholder="Select category"
                options={MEDICINE_CATEGORIES}
                value={form.category}
                onChange={handleChange('category')}
                required
                error={errors.category}
              />
              <TextField
                label="Manufacturer"
                id="manufacturer"
                icon="factory"
                value={form.manufacturer}
                onChange={handleChange('manufacturer')}
                required
                error={errors.manufacturer}
                containerClassName="sm:col-span-2"
              />
            </FormSection>
          )}

          {activeStep === 1 && (
            <FormSection title="Logistics" description="Stock levels, pricing, and storage requirements.">
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
              <TextField
                label="Unit Price (USD)"
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                icon="attach_money"
                value={form.unitPrice}
                onChange={handleChange('unitPrice')}
                helperText="Used to calculate total stock value."
              />
              <TextField
                label={isEdit ? 'Current Stock' : 'Initial Stock'}
                id="totalStock"
                type="number"
                min="0"
                icon="inventory_2"
                value={form.totalStock}
                onChange={handleChange('totalStock')}
                required
                error={errors.totalStock}
              />
              <TextField
                label="Minimum Stock Level"
                id="reorderLevel"
                type="number"
                min="0"
                icon="warning"
                value={form.reorderLevel}
                onChange={handleChange('reorderLevel')}
                required
                error={errors.reorderLevel}
                helperText="AI will alert when inventory falls below this threshold."
              />
              <TextAreaField
                label="Storage Requirements / Notes"
                id="storageNotes"
                placeholder="e.g. Store below 25°C, protect from moisture."
                value={form.storageNotes}
                onChange={handleChange('storageNotes')}
                containerClassName="sm:col-span-2"
              />
            </FormSection>
          )}

          {activeStep === 2 && (
            <div>
              <h3 className="text-base font-semibold text-on-surface">Review &amp; Confirm</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Please review the details below before saving.
              </p>
              <div className="mt-4">
                <ReviewRow label="Medicine Name" value={form.name} />
                <ReviewRow label="Item Code" value={form.code} mono />
                <ReviewRow label="Category" value={form.category} />
                <ReviewRow label="Manufacturer" value={form.manufacturer} />
                <ReviewRow label="Unit Type" value={form.unitType} />
                <ReviewRow
                  label={isEdit ? 'Current Stock' : 'Initial Stock'}
                  value={`${formatNumber(Number(form.totalStock) || 0)} ${getUnitAbbreviation(form.unitType)}`}
                />
                <ReviewRow
                  label="Minimum Stock Level"
                  value={`${formatNumber(Number(form.reorderLevel) || 0)} ${getUnitAbbreviation(form.unitType)}`}
                />
                <ReviewRow label="Unit Price" value={formatCurrency(Number(form.unitPrice) || 0)} />
                {form.storageNotes && <ReviewRow label="Storage Notes" value={form.storageNotes} />}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-outline-variant pt-4">
            <Button variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <div className="flex gap-3">
              {activeStep > 0 && (
                <Button variant="outline" onClick={handleBack} disabled={saving}>
                  <Icon name="arrow_back" className="text-base" />
                  Back
                </Button>
              )}
              {activeStep < STEPS.length - 1 ? (
                <Button onClick={handleNext}>
                  Next Step
                  <Icon name="arrow_forward" className="text-base" />
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Medicine'}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

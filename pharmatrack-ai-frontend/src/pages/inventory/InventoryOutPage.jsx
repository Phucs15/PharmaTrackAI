import { useEffect, useState } from 'react';
import Icon from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SelectField from '@/components/forms/SelectField';
import TextField from '@/components/forms/TextField';
import DateField from '@/components/forms/DateField';
import TextAreaField from '@/components/forms/TextAreaField';
import InventoryTabs from './components/InventoryTabs';
import TransactionLogCard from './components/TransactionLogCard';
import SelectedBatchInfo from './components/SelectedBatchInfo';
import * as medicineService from '@/services/medicineService';
import * as batchService from '@/services/batchService';
import * as inventoryService from '@/services/inventoryService';
import { formatNumber, getUnitAbbreviation } from '@/utils/formatters';

const EMPTY_FORM = {
  medicineId: '',
  batchId: '',
  quantity: '',
  dispatchDate: '',
  destination: '',
  notes: '',
};

export default function InventoryOutPage() {
  const [medicines, setMedicines] = useState([]);
  const [batchData, setBatchData] = useState({ medicineId: null, batches: [] });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [medicineList, txns] = await Promise.all([
        medicineService.getAll(),
        inventoryService.getTransactionHistory({ type: 'OUT' }),
      ]);
      if (!cancelled) {
        setMedicines(medicineList);
        setTransactions(txns);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!form.medicineId) return undefined;

    let cancelled = false;

    (async () => {
      const batchList = await batchService.getByMedicine(form.medicineId);
      if (!cancelled) {
        setBatchData({ medicineId: form.medicineId, batches: batchList });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form.medicineId]);

  const selectedMedicine = medicines.find((med) => med.id === form.medicineId);
  const loadingBatches = Boolean(form.medicineId) && batchData.medicineId !== form.medicineId;
  const batchOptions = loadingBatches ? [] : batchData.batches;
  const selectedBatch = batchOptions.find((batch) => batch.id === form.batchId);
  const requestedQty = Number(form.quantity || 0);
  const overStock = Boolean(selectedBatch) && requestedQty > selectedBatch.quantity;

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'medicineId' ? { batchId: '' } : {}),
    }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFeedback(null);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.medicineId) nextErrors.medicineId = 'Select a medicine.';
    if (!form.batchId) nextErrors.batchId = 'Select a batch.';
    if (form.quantity === '' || requestedQty <= 0) nextErrors.quantity = 'Enter a valid quantity.';
    else if (overStock) nextErrors.quantity = `Quantity exceeds available stock (${formatNumber(selectedBatch.quantity)}) for batch ${selectedBatch.batchNumber}.`;
    if (!form.dispatchDate) nextErrors.dispatchDate = 'Dispatch date is required.';
    if (!form.destination.trim()) nextErrors.destination = 'Destination is required.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setFeedback(null);

    try {
      const transaction = await inventoryService.recordInventoryOut({
        medicineId: form.medicineId,
        medicineName: selectedMedicine.name,
        batchId: selectedBatch.batchNumber,
        batchDbId: selectedBatch.id,
        quantity: requestedQty,
        unitType: selectedBatch.unitType,
        destination: form.destination.trim(),
        notes: form.notes.trim(),
        date: new Date(form.dispatchDate).toISOString(),
      });

      setTransactions((prev) => [transaction, ...prev]);
      const refreshedBatches = await batchService.getByMedicine(form.medicineId);
      setBatchData({ medicineId: form.medicineId, batches: refreshedBatches });
      setForm((prev) => ({ ...EMPTY_FORM, medicineId: prev.medicineId }));
      setFeedback({ message: `Dispatch logged for ${selectedMedicine.name} to ${transaction.destination}.` });
    } catch (error) {
      if (error.code === 'OVERSTOCK') {
        setErrors({ quantity: error.message });
      } else {
        throw error;
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-semibold tracking-tight text-on-surface">Inventory Out</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Record outward stock movement and generate dispatch manifests.
        </p>
      </div>

      <InventoryTabs />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-8 lg:col-span-2">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-on-surface">
            <Icon name="outbox" className="text-primary" />
            Dispatch Inventory
          </h3>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                label="Select Medicine"
                id="medicineId"
                placeholder="Choose medication..."
                options={medicines.map((med) => ({ value: med.id, label: `${med.name} (${med.code})` }))}
                value={form.medicineId}
                onChange={handleChange('medicineId')}
                required
                error={errors.medicineId}
              />
              <SelectField
                label="Select Batch"
                id="batchId"
                placeholder={loadingBatches ? 'Loading batches...' : 'Choose batch...'}
                options={batchOptions.map((batch) => ({
                  value: batch.id,
                  label: `${batch.batchNumber} (Stock: ${formatNumber(batch.quantity)})`,
                }))}
                value={form.batchId}
                onChange={handleChange('batchId')}
                disabled={!form.medicineId || loadingBatches}
                required
                error={errors.batchId}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Quantity to Dispatch"
                id="quantity"
                type="number"
                min="1"
                icon="local_shipping"
                suffix={selectedBatch ? getUnitAbbreviation(selectedBatch.unitType) : 'units'}
                value={form.quantity}
                onChange={handleChange('quantity')}
                required
                error={errors.quantity}
              />
              <DateField
                label="Dispatch Date"
                id="dispatchDate"
                value={form.dispatchDate}
                onChange={handleChange('dispatchDate')}
                required
                error={errors.dispatchDate}
              />
            </div>

            {overStock && !errors.quantity && (
              <div className="flex items-center gap-2 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
                <Icon name="warning" className="text-base" />
                Quantity exceeds available stock ({formatNumber(selectedBatch.quantity)}) for batch {selectedBatch.batchNumber}.
              </div>
            )}

            <TextField
              label="Destination / Recipient Facility"
              id="destination"
              icon="local_shipping"
              placeholder="e.g. City Clinic, Metro Hospital..."
              value={form.destination}
              onChange={handleChange('destination')}
              required
              error={errors.destination}
            />

            <TextAreaField
              label="Dispatch Notes (Optional)"
              id="notes"
              rows={3}
              placeholder="e.g. Urgent transfer to cover stock shortfall."
              value={form.notes}
              onChange={handleChange('notes')}
            />

            {feedback && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                <Icon name="check_circle" className="text-base" />
                {feedback.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
              <Button type="button" variant="outline" onClick={() => setForm({ ...EMPTY_FORM, medicineId: form.medicineId })} disabled={saving}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || overStock}>
                <Icon name="send" className="text-base" />
                {saving ? 'Dispatching...' : 'Confirm Dispatch'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <SelectedBatchInfo batch={selectedBatch} medicine={selectedMedicine} />
          <TransactionLogCard type="OUT" transactions={transactions} />
        </div>
      </div>
    </div>
  );
}

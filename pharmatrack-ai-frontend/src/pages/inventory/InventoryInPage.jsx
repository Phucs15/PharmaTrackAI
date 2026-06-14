import { useEffect, useState } from 'react';
import Icon from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SelectField from '@/components/forms/SelectField';
import TextField from '@/components/forms/TextField';
import DateField from '@/components/forms/DateField';
import TextAreaField from '@/components/forms/TextAreaField';
import ToggleButtonGroup from '@/components/forms/ToggleButtonGroup';
import InventoryTabs from './components/InventoryTabs';
import TransactionLogCard from './components/TransactionLogCard';
import * as medicineService from '@/services/medicineService';
import * as inventoryService from '@/services/inventoryService';
import { SUPPLIERS, STORAGE_ZONES } from '@/constants/inventoryOptions';
import { getUnitAbbreviation } from '@/utils/formatters';

const EMPTY_FORM = {
  medicineId: '',
  batchNumber: '',
  expDate: '',
  supplier: '',
  quantity: '',
  unitCost: '',
  storageZone: STORAGE_ZONES[0].value,
  notes: '',
};

export default function InventoryInPage() {
  const [medicines, setMedicines] = useState([]);
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
        inventoryService.getTransactionHistory({ type: 'IN' }),
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

  const selectedMedicine = medicines.find((med) => med.id === form.medicineId);

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setForm((prev) => ({ ...prev, [field]: field === 'batchNumber' ? value.toUpperCase() : value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setFeedback(null);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.medicineId) nextErrors.medicineId = 'Select a medicine.';
    if (!form.batchNumber.trim()) nextErrors.batchNumber = 'Batch number is required.';
    if (!form.expDate) nextErrors.expDate = 'Expiry date is required.';
    if (!form.supplier) nextErrors.supplier = 'Select a supplier or distributor.';
    if (form.quantity === '' || Number(form.quantity) <= 0) nextErrors.quantity = 'Enter a valid quantity.';
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setFeedback(null);

    const transaction = await inventoryService.recordInventoryIn({
      medicineId: form.medicineId,
      medicineName: selectedMedicine.name,
      batchId: form.batchNumber.trim(),
      quantity: Number(form.quantity),
      unitType: selectedMedicine.unitType,
      source: form.supplier,
      notes: form.notes.trim(),
      expDate: form.expDate,
      unitCost: form.unitCost === '' ? 0 : Number(form.unitCost),
      storageZone: form.storageZone,
    });

    setTransactions((prev) => [transaction, ...prev]);
    setForm({ ...EMPTY_FORM, storageZone: form.storageZone });
    setSaving(false);
    setFeedback({ message: `Receipt logged for ${selectedMedicine.name} (Batch ${transaction.batchId}).` });
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
        <h1 className="font-headline text-3xl font-semibold tracking-tight text-on-surface">Inventory In</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Log incoming shipments and add received stock to the system.
        </p>
      </div>

      <InventoryTabs />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="p-8 lg:col-span-5">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-semibold text-on-surface">
            <Icon name="move_to_inbox" className="text-primary" />
            Receive New Stock
          </h3>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <SelectField
              label="Medicine Product"
              id="medicineId"
              placeholder="Choose medication..."
              options={medicines.map((med) => ({ value: med.id, label: `${med.name} (${med.code})` }))}
              value={form.medicineId}
              onChange={handleChange('medicineId')}
              required
              error={errors.medicineId}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Batch Number"
                id="batchNumber"
                value={form.batchNumber}
                onChange={handleChange('batchNumber')}
                required
                error={errors.batchNumber}
                className="font-mono uppercase"
              />
              <DateField
                label="Expiry Date"
                id="expDate"
                value={form.expDate}
                onChange={handleChange('expDate')}
                required
                error={errors.expDate}
              />
            </div>
            <SelectField
              label="Supplier / Distributor"
              id="supplier"
              placeholder="Select supplier..."
              options={SUPPLIERS}
              value={form.supplier}
              onChange={handleChange('supplier')}
              required
              error={errors.supplier}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Quantity Received"
                id="quantity"
                type="number"
                min="1"
                icon="inventory_2"
                suffix={selectedMedicine ? getUnitAbbreviation(selectedMedicine.unitType) : 'units'}
                value={form.quantity}
                onChange={handleChange('quantity')}
                required
                error={errors.quantity}
              />
              <TextField
                label="Unit Cost"
                id="unitCost"
                type="number"
                min="0"
                step="0.01"
                icon="attach_money"
                value={form.unitCost}
                onChange={handleChange('unitCost')}
              />
            </div>
            <ToggleButtonGroup
              label="Initial Storage Zone"
              options={STORAGE_ZONES}
              value={form.storageZone}
              onChange={(value) => setForm((prev) => ({ ...prev, storageZone: value }))}
            />
            <TextAreaField
              label="Receiving Notes (Optional)"
              id="notes"
              rows={3}
              placeholder="e.g. Cold chain shipment verified on arrival."
              value={form.notes}
              onChange={handleChange('notes')}
            />

            {feedback && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                <Icon name="check_circle" className="text-base" />
                {feedback.message}
              </div>
            )}

            <div className="border-t border-outline-variant pt-4">
              <Button type="submit" className="w-full" disabled={saving}>
                <Icon name="check_circle" className="text-base" />
                {saving ? 'Logging Receipt...' : 'Confirm Receipt & Log'}
              </Button>
            </div>
          </form>
        </Card>

        <TransactionLogCard type="IN" transactions={transactions} className="lg:col-span-7" />
      </div>
    </div>
  );
}

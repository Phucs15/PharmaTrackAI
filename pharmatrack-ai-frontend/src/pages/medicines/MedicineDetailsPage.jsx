import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import EmptyState from '@/components/common/EmptyState';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataTable from '@/components/tables/DataTable';
import StockByFacilityCard from './components/StockByFacilityCard';
import * as medicineService from '@/services/medicineService';
import * as batchService from '@/services/batchService';
import * as inventoryService from '@/services/inventoryService';
import { useAuth } from '@/hooks/useAuth';
import { MANAGEMENT_ROLES } from '@/constants/roles';
import { formatDate, formatDateTime, formatNumber, getUnitAbbreviation } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const BATCH_COLUMNS = [
  { key: 'batchNumber', header: 'Batch Number', className: 'font-mono text-on-surface' },
  { key: 'facility', header: 'Location', className: 'text-on-surface-variant' },
  { key: 'quantity', header: 'Quantity', render: (row) => formatNumber(row.quantity) },
  { key: 'mfgDate', header: 'Manufactured', className: 'text-on-surface-variant', render: (row) => formatDate(row.mfgDate) },
  { key: 'expDate', header: 'Expiry Date', className: 'text-on-surface-variant', render: (row) => formatDate(row.expDate) },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

const ACTIVITY_COLUMNS = [
  {
    key: 'id',
    header: 'Transaction ID',
    className: 'font-mono text-on-surface-variant',
    render: (row) => row.id.toUpperCase(),
  },
  {
    key: 'type',
    header: 'Type',
    render: (row) => (
      <span className={cn('flex items-center gap-1', row.type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-tertiary')}>
        <Icon name={row.type === 'IN' ? 'arrow_downward' : 'arrow_upward'} className="text-sm" />
        {row.type === 'IN' ? 'Inbound' : 'Outbound'}
      </span>
    ),
  },
  { key: 'quantity', header: 'Quantity', render: (row) => formatNumber(row.quantity) },
  {
    key: 'source',
    header: 'Source / Destination',
    className: 'text-on-surface-variant',
    render: (row) => row.source ?? row.destination ?? '-',
  },
  { key: 'date', header: 'Date', className: 'text-on-surface-variant', render: (row) => formatDateTime(row.date) },
  { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
];

export default function MedicineDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManage = hasRole(MANAGEMENT_ROLES);

  const [medicine, setMedicine] = useState(null);
  const [batches, setBatches] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setNotFound(false);

      try {
        const [med, batchList, txns] = await Promise.all([
          medicineService.getById(id),
          batchService.getByMedicine(id),
          inventoryService.getTransactionHistory({ medicineId: id }),
        ]);

        if (cancelled) return;
        setMedicine(med);
        setBatches(batchList);
        setTransactions(txns);
      } catch (error) {
        if (!cancelled && error.code === 'NOT_FOUND') {
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    await medicineService.remove(id);
    setDeleting(false);
    setDeleteOpen(false);
    navigate('/medicines');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (notFound || !medicine) {
    return (
      <EmptyState
        icon="search_off"
        title="Medicine not found"
        description="The medicine you're looking for doesn't exist or has been removed."
        action={
          <Button onClick={() => navigate('/medicines')}>
            <Icon name="arrow_back" className="text-base" />
            Back to Medicines
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-on-surface-variant">
          <Link to="/medicines" className="hover:text-primary">
            Medicines
          </Link>
          <Icon name="chevron_right" className="text-sm" />
          <span className="text-on-surface">Details</span>
        </nav>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Icon name="pill" filled className="text-3xl" />
            </div>
            <div>
              <h1 className="flex items-center gap-3 font-headline text-2xl font-semibold text-on-surface">
                {medicine.name}
                <StatusBadge status={medicine.status} />
              </h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                {medicine.category} · {medicine.manufacturer}
              </p>
            </div>
          </div>
          {canManage && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(`/medicines/${id}/edit`)}>
                <Icon name="edit" className="text-base" />
                Edit
              </Button>
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                <Icon name="delete" className="text-base" />
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Card className="p-6 lg:col-span-4">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-on-surface">
            <Icon name="info" className="text-primary" />
            Basic Information
          </h3>
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-on-surface-variant">Item Code</dt>
              <dd className="mt-1 inline-flex rounded-md bg-surface-container-high px-2 py-1 font-mono text-on-surface">
                {medicine.code}
              </dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Category</dt>
              <dd className="mt-1 text-on-surface">{medicine.category}</dd>
            </div>
            <div>
              <dt className="text-on-surface-variant">Manufacturer</dt>
              <dd className="mt-1 text-on-surface">{medicine.manufacturer}</dd>
            </div>
            {medicine.storageNotes && (
              <div>
                <dt className="text-on-surface-variant">Storage Conditions</dt>
                <dd className="mt-1 flex items-center gap-2 text-on-surface">
                  <Icon name="device_thermostat" className="text-base text-primary" />
                  {medicine.storageNotes}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-on-surface-variant">Reorder Level</dt>
              <dd className="mt-1 font-semibold text-primary">
                {formatNumber(medicine.reorderLevel)} {getUnitAbbreviation(medicine.unitType)}
              </dd>
            </div>
          </dl>
        </Card>

        <StockByFacilityCard
          className="lg:col-span-8"
          stockByFacility={medicine.stockByFacility}
          totalStock={medicine.totalStock}
        />

        <Card className="overflow-hidden lg:col-span-12">
          <div className="flex items-center justify-between border-b border-primary/10 bg-surface-container/30 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
              <Icon name="layers" className="text-primary" />
              Active Batches
            </h3>
            <Link to="/batches" className="text-xs font-medium text-primary hover:underline">
              View All
            </Link>
          </div>
          <DataTable
            columns={BATCH_COLUMNS}
            data={batches}
            emptyMessage="No batches recorded for this medicine."
            emptyIcon="layers"
          />
        </Card>

        <Card className="overflow-hidden lg:col-span-12">
          <div className="flex items-center justify-between border-b border-primary/10 bg-surface-container/30 p-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
              <Icon name="receipt_long" className="text-primary" />
              Recent Activity
            </h3>
          </div>
          <DataTable
            columns={ACTIVITY_COLUMNS}
            data={transactions.slice(0, 5)}
            emptyMessage="No recent transactions for this medicine."
            emptyIcon="receipt_long"
          />
        </Card>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete medicine?"
        description={`This will permanently remove "${medicine.name}" from the catalog.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}

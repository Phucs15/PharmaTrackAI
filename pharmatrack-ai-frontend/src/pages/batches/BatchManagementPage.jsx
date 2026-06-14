import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import IconButton from '@/components/common/IconButton';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import SearchInput from '@/components/common/SearchInput';
import StatCard from '@/components/common/StatCard';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import SelectField from '@/components/forms/SelectField';
import DataTable from '@/components/tables/DataTable';
import TableRowActions from '@/components/tables/TableRowActions';
import AddBatchModal from './components/AddBatchModal';
import * as batchService from '@/services/batchService';
import * as medicineService from '@/services/medicineService';
import { useAuth } from '@/hooks/useAuth';
import { MANAGEMENT_ROLES } from '@/constants/roles';
import { FACILITIES } from '@/constants/medicineOptions';
import { formatDate, formatNumber, getUnitAbbreviation } from '@/utils/formatters';
import { cn } from '@/utils/cn';

const PAGE_SIZE = 5;
const FACILITY_OPTIONS = [{ value: 'all', label: 'All Facilities' }, ...FACILITIES.map((facility) => ({ value: facility, label: facility }))];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Safe', label: 'Safe' },
  { value: 'Near Expiry', label: 'Near Expiry' },
  { value: 'Expired', label: 'Expired' },
];

export default function BatchManagementPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManage = hasRole(MANAGEMENT_ROLES);

  const [batches, setBatches] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [facility, setFacility] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    const data = await batchService.getAll();
    setBatches(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const [batchList, medicineList] = await Promise.all([batchService.getAll(), medicineService.getAll()]);
      if (!cancelled) {
        setBatches(batchList);
        setMedicines(medicineList);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return batches.filter((batch) => {
      const matchesFacility = facility === 'all' || batch.facility === facility;
      const matchesStatus = status === 'all' || batch.status === status;
      const matchesSearch =
        !query ||
        batch.batchNumber.toLowerCase().includes(query) ||
        batch.medicineName.toLowerCase().includes(query);
      return matchesFacility && matchesStatus && matchesSearch;
    });
  }, [batches, facility, status, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const nearExpiryCount = useMemo(
    () => batches.filter((batch) => batch.status === 'Near Expiry' || batch.status === 'Expired').length,
    [batches]
  );
  const safeVolumePercent = useMemo(() => {
    if (batches.length === 0) return 0;
    const safeCount = batches.filter((batch) => batch.status === 'Safe').length;
    return (safeCount / batches.length) * 100;
  }, [batches]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleFacilityChange = (value) => {
    setFacility(value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await batchService.remove(deleteTarget.id);
    await refresh();
    setDeleting(false);
    setDeleteTarget(null);
  };

  const columns = useMemo(
    () => [
      {
        key: 'batchNumber',
        header: 'Batch Number',
        className: 'font-mono text-primary',
        render: (row) => `#${row.batchNumber}`,
      },
      {
        key: 'medicineName',
        header: 'Medicine Name',
        render: (row) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Icon name="medication" className="text-base" />
            </div>
            <span className="font-medium text-on-surface">{row.medicineName}</span>
          </div>
        ),
      },
      { key: 'facility', header: 'Facility', className: 'text-on-surface-variant' },
      {
        key: 'quantity',
        header: 'Quantity',
        render: (row) => (
          <span>
            {formatNumber(row.quantity)}{' '}
            <span className="text-xs text-on-surface-variant">{getUnitAbbreviation(row.unitType)}</span>
          </span>
        ),
      },
      { key: 'mfgDate', header: 'Mfg Date', className: 'text-on-surface-variant', render: (row) => formatDate(row.mfgDate) },
      {
        key: 'expDate',
        header: 'Expiry Date',
        render: (row) => (
          <span className={cn(row.status === 'Expired' ? 'text-error' : row.status === 'Near Expiry' ? 'text-tertiary' : 'text-on-surface-variant')}>
            {formatDate(row.expDate)}
          </span>
        ),
      },
      { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        render: (row) => (
          <div onClick={(event) => event.stopPropagation()}>
            <TableRowActions
              onView={() => navigate(`/medicines/${row.medicineId}`)}
              onDelete={canManage ? () => setDeleteTarget(row) : undefined}
            />
          </div>
        ),
      },
    ],
    [canManage, navigate]
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-headline text-3xl font-semibold tracking-tight text-on-surface">
            Batch Management
            <span className="flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-normal text-primary shadow-glow">
              <Icon name="sync" className="text-xs" /> Live
            </span>
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Track batches across facilities and monitor expiry windows.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setAddOpen(true)}>
            <Icon name="add" className="text-base" />
            Add New Batch
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          icon="layers"
          iconColor="primary"
          label="Total Active Batches"
          value={formatNumber(batches.length)}
          trend="+3.2%"
        />
        <StatCard
          icon="priority_high"
          iconColor="error"
          label="Near Expiry Alerts"
          value={formatNumber(nearExpiryCount)}
          variant={nearExpiryCount > 0 ? 'critical' : 'default'}
        />
        <StatCard
          icon="check_circle"
          iconColor="tertiary"
          label="Safe Status Volume"
          value={`${safeVolumePercent.toFixed(1)}%`}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-primary/10 bg-surface-container/30 p-6 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
            <Icon name="format_list_bulleted" className="text-primary" />
            Recent Batches
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search batch or medicine..."
              className="w-full sm:w-56"
            />
            <SelectField
              id="facilityFilter"
              value={facility}
              onChange={(event) => handleFacilityChange(event.target.value)}
              options={FACILITY_OPTIONS}
              containerClassName="sm:w-44"
            />
            <SelectField
              id="statusFilter"
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
              options={STATUS_OPTIONS}
              containerClassName="sm:w-40"
            />
            <IconButton icon="download" label="Export list" />
          </div>
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          emptyMessage="No batches match your filters."
          emptyIcon="layers"
        />
        {filtered.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-on-surface-variant">
              Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length} batches
            </p>
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <AddBatchModal open={addOpen} onClose={() => setAddOpen(false)} onSaved={refresh} medicines={medicines} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete batch?"
        description={deleteTarget ? `This will permanently remove batch "${deleteTarget.batchNumber}" from the system.` : ''}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}

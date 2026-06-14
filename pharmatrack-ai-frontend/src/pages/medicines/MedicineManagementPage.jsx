import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import DataTable from '@/components/tables/DataTable';
import TableRowActions from '@/components/tables/TableRowActions';
import CategoryStatsBar from './components/CategoryStatsBar';
import MedicineFilters from './components/MedicineFilters';
import * as medicineService from '@/services/medicineService';
import { useAuth } from '@/hooks/useAuth';
import { MANAGEMENT_ROLES } from '@/constants/roles';
import { formatNumber, getUnitAbbreviation } from '@/utils/formatters';

const PAGE_SIZE = 5;

export default function MedicineManagementPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const canManage = hasRole(MANAGEMENT_ROLES);

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    const data = await medicineService.getAll();
    setMedicines(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const data = await medicineService.getAll();
      if (!cancelled) {
        setMedicines(data);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return medicines.filter((med) => {
      const matchesCategory = category === 'all' || med.category === category;
      const matchesSearch =
        !query ||
        med.name.toLowerCase().includes(query) ||
        med.code.toLowerCase().includes(query) ||
        med.manufacturer.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [medicines, category, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategory(value);
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await medicineService.remove(deleteTarget.id);
    await refresh();
    setDeleting(false);
    setDeleteTarget(null);
  };

  const columns = useMemo(
    () => [
      {
        key: 'code',
        header: 'Code',
        className: 'font-mono text-primary',
      },
      {
        key: 'name',
        header: 'Medicine Name',
        render: (row) => (
          <div>
            <p className="font-medium text-on-surface">{row.name}</p>
            <p className="text-xs text-on-surface-variant">{row.unitType}</p>
          </div>
        ),
      },
      {
        key: 'category',
        header: 'Category',
        render: (row) => (
          <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-xs font-medium text-on-surface-variant">
            {row.category}
          </span>
        ),
      },
      {
        key: 'manufacturer',
        header: 'Manufacturer',
        className: 'text-on-surface-variant',
      },
      {
        key: 'totalStock',
        header: 'Stock',
        className: 'text-right',
        headerClassName: 'text-right',
        render: (row) => (
          <span className="font-medium text-on-surface">
            {formatNumber(row.totalStock)}{' '}
            <span className="text-xs text-on-surface-variant">{getUnitAbbreviation(row.unitType)}</span>
          </span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row) => <StatusBadge status={row.status} />,
      },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        render: (row) => (
          <div onClick={(event) => event.stopPropagation()}>
            <TableRowActions
              onView={() => navigate(`/medicines/${row.id}`)}
              onEdit={canManage ? () => navigate(`/medicines/${row.id}/edit`) : undefined}
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
            Medicines Directory
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-normal text-primary shadow-glow">
              {formatNumber(medicines.length)} Total
            </span>
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Manage your pharmaceutical inventory catalog and stock levels.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => navigate('/medicines/new')}>
            <Icon name="add" className="text-base" />
            Add Medicine
          </Button>
        )}
      </div>

      <CategoryStatsBar medicines={medicines} />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-primary/10 bg-surface-container/30 p-6 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
            <Icon name="format_list_bulleted" className="text-primary" />
            Inventory List
          </h3>
          <MedicineFilters
            search={search}
            onSearchChange={handleSearchChange}
            category={category}
            onCategoryChange={handleCategoryChange}
          />
        </div>
        <DataTable
          columns={columns}
          data={paginated}
          onRowClick={(row) => navigate(`/medicines/${row.id}`)}
          emptyMessage="No medicines match your filters."
          emptyIcon="medication"
        />
        {filtered.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-on-surface-variant">
              Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length} medicines
            </p>
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <Outlet context={{ onSaved: refresh }} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete medicine?"
        description={deleteTarget ? `This will permanently remove "${deleteTarget.name}" from the catalog.` : ''}
        confirmLabel="Delete"
        loading={deleting}
      />
    </div>
  );
}

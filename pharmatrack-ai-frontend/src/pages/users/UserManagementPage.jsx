import { useCallback, useEffect, useMemo, useState } from 'react';
import Avatar from '@/components/common/Avatar';
import Icon from '@/components/common/Icon';
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
import AddUserModal from './components/AddUserModal';
import * as userService from '@/services/userService';
import { ALL_ROLES, ROLES } from '@/constants/roles';
import { formatNumber } from '@/utils/formatters';

const PAGE_SIZE = 5;
const ROLE_OPTIONS = [{ value: 'all', label: 'All Roles' }, ...ALL_ROLES.map((role) => ({ value: role, label: role }))];
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [modalUser, setModalUser] = useState(undefined);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const refresh = useCallback(async () => {
    const data = await userService.getAll();
    setUsers(data);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const data = await userService.getAll();
      if (!cancelled) {
        setUsers(data);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((item) => {
      const matchesRole = role === 'all' || item.role === role;
      const matchesStatus = status === 'all' || item.status === status;
      const matchesSearch =
        !query || item.name.toLowerCase().includes(query) || item.email.toLowerCase().includes(query);
      return matchesRole && matchesStatus && matchesSearch;
    });
  }, [users, role, status, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeCount = useMemo(() => users.filter((item) => item.status === 'Active').length, [users]);
  const adminCount = useMemo(() => users.filter((item) => item.role === ROLES.ADMIN).length, [users]);

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value) => {
    setRole(value);
    setPage(1);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    await userService.remove(deleteTarget.id);
    await refresh();
    setDeleting(false);
    setDeleteTarget(null);
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'User',
        render: (row) => (
          <div className="flex items-center gap-3">
            <Avatar src={row.avatarUrl} name={row.name} size="sm" />
            <div>
              <p className="font-medium text-on-surface">{row.name}</p>
              <p className="text-xs text-on-surface-variant">{row.email}</p>
            </div>
          </div>
        ),
      },
      { key: 'role', header: 'Role', className: 'text-on-surface-variant' },
      { key: 'facility', header: 'Facility', className: 'text-on-surface-variant' },
      { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
      { key: 'lastActive', header: 'Last Active', className: 'text-on-surface-variant' },
      {
        key: 'actions',
        header: '',
        className: 'text-right',
        render: (row) => (
          <TableRowActions onEdit={() => setModalUser(row)} onDelete={() => setDeleteTarget(row)} />
        ),
      },
    ],
    []
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
          <h1 className="font-headline text-3xl font-semibold tracking-tight text-on-surface">User Management</h1>
          <p className="mt-1 text-sm text-on-surface-variant">Manage staff accounts, roles, and facility access.</p>
        </div>
        <Button onClick={() => setModalUser(null)}>
          <Icon name="person_add" className="text-base" />
          Add User
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard icon="group" iconColor="primary" label="Total Users" value={formatNumber(users.length)} />
        <StatCard icon="check_circle" iconColor="tertiary" label="Active Accounts" value={formatNumber(activeCount)} />
        <StatCard icon="admin_panel_settings" iconColor="secondary" label="Administrators" value={formatNumber(adminCount)} />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-primary/10 bg-surface-container/30 p-6 lg:flex-row lg:items-center lg:justify-between">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-on-surface">
            <Icon name="group" className="text-primary" />
            Team Directory
          </h3>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search name or email..."
              className="w-full sm:w-56"
            />
            <SelectField
              id="roleFilter"
              value={role}
              onChange={(event) => handleRoleChange(event.target.value)}
              options={ROLE_OPTIONS}
              containerClassName="sm:w-44"
            />
            <SelectField
              id="statusFilter"
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
              options={STATUS_OPTIONS}
              containerClassName="sm:w-40"
            />
          </div>
        </div>
        <DataTable columns={columns} data={paginated} emptyMessage="No users match your filters." emptyIcon="group_off" />
        {filtered.length > 0 && (
          <div className="flex flex-col gap-4 border-t border-outline-variant p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-on-surface-variant">
              Showing {(safePage - 1) * PAGE_SIZE + 1}-{Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
              {filtered.length} users
            </p>
            <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      <AddUserModal open={modalUser !== undefined} onClose={() => setModalUser(undefined)} onSaved={refresh} user={modalUser} />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove user?"
        description={deleteTarget ? `This will permanently remove "${deleteTarget.name}" from the team directory.` : ''}
        confirmLabel="Remove"
        loading={deleting}
      />
    </div>
  );
}

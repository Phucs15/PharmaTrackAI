import SearchInput from '@/components/common/SearchInput';
import SelectField from '@/components/forms/SelectField';
import IconButton from '@/components/common/IconButton';
import { MEDICINE_CATEGORIES } from '@/constants/medicineOptions';
import { cn } from '@/utils/cn';

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  ...MEDICINE_CATEGORIES.map((category) => ({ value: category, label: category })),
];

export default function MedicineFilters({ search, onSearchChange, category, onCategoryChange, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
      <SearchInput
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search by name, code, or manufacturer..."
        className="w-full sm:w-64"
      />
      <SelectField
        id="categoryFilter"
        value={category}
        onChange={(event) => onCategoryChange(event.target.value)}
        options={CATEGORY_OPTIONS}
        containerClassName="sm:w-48"
      />
      <div className="flex items-center gap-1">
        <IconButton icon="filter_list" label="More filters" />
        <IconButton icon="download" label="Export list" />
      </div>
    </div>
  );
}

import Icon from '@/components/common/Icon';
import Card from '@/components/ui/Card';
import { formatDate, formatNumber, getUnitAbbreviation } from '@/utils/formatters';

export default function SelectedBatchInfo({ batch, medicine }) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-on-surface">
        <Icon name="inventory" className="text-primary" />
        Selected Batch Info
      </h3>
      {!batch ? (
        <p className="text-sm text-on-surface-variant">Select a medicine and batch to view its details.</p>
      ) : (
        <div className="space-y-4 text-sm">
          <div>
            <p className="text-on-surface-variant">Batch ID</p>
            <p className="mt-1 inline-flex rounded-md bg-surface-container-high px-2 py-1 font-mono text-on-surface">
              {batch.batchNumber}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-on-surface-variant">Available Stock</p>
              <p className="mt-1 font-semibold text-primary">
                {formatNumber(batch.quantity)} {getUnitAbbreviation(batch.unitType)}
              </p>
            </div>
            <div>
              <p className="text-on-surface-variant">Expiry Date</p>
              <p className="mt-1 font-medium text-on-surface">{formatDate(batch.expDate)}</p>
            </div>
          </div>
          {medicine?.storageNotes && (
            <div>
              <p className="text-on-surface-variant">Storage Condition</p>
              <p className="mt-1 flex items-center gap-2 text-on-surface">
                <Icon name="ac_unit" className="text-base text-primary" />
                {medicine.storageNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

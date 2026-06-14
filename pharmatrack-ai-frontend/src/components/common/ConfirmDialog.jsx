import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Icon from '@/components/common/Icon';

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={
            variant === 'danger'
              ? 'mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error'
              : 'mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary'
          }
        >
          <Icon name={variant === 'danger' ? 'warning' : 'help'} className="text-2xl" />
        </div>
        <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
        {description && <p className="mt-2 text-sm text-on-surface-variant">{description}</p>}
        <div className="mt-6 flex w-full gap-3">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Please wait...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

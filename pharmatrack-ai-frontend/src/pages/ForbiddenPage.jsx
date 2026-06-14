import { Link } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import Button from '@/components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-error/30 bg-error/10">
        <Icon name="block" className="text-4xl text-error" />
      </div>
      <h1 className="font-headline text-5xl font-bold text-on-surface">403</h1>
      <p className="mt-2 text-lg font-semibold text-on-surface">Access Restricted</p>
      <p className="mt-2 max-w-md text-sm text-on-surface-variant">
        You don't have permission to view this page. Contact an administrator if you believe this is an error.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button>
          <Icon name="home" className="text-base" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}

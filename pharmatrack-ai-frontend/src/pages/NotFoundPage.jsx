import { Link } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import Button from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="glass-panel mb-6 flex h-20 w-20 items-center justify-center rounded-full">
        <Icon name="search_off" className="text-4xl text-primary" />
      </div>
      <h1 className="font-headline text-5xl font-bold text-on-surface">404</h1>
      <p className="mt-2 text-lg font-semibold text-on-surface">Page Not Found</p>
      <p className="mt-2 max-w-md text-sm text-on-surface-variant">
        The page you're looking for doesn't exist or has been moved.
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

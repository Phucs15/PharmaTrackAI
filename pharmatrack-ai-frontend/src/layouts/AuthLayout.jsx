import { Outlet } from 'react-router-dom';
import Icon from '@/components/common/Icon';
import ThemeToggle from '@/components/common/ThemeToggle';

export default function AuthLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-on-surface transition-colors duration-300">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-surface-container-low p-12 lg:flex">
        <div className="absolute top-6 left-6 z-20">
          <ThemeToggle className="border border-outline-variant bg-surface" />
        </div>
        <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-transparent to-tertiary/5" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-tertiary/10 blur-[100px]" />
        <div className="relative z-10 mt-12">
          <h1 className="flex items-center gap-3 font-headline text-3xl font-bold text-primary">
            <Icon name="science" className="text-4xl" />
            PharmaTrack AI
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-on-surface-variant">
            Next-generation pharmaceutical logistics and expiry monitoring powered by predictive intelligence.
          </p>
        </div>
        <div className="glass-panel relative z-10 max-w-sm rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Icon name="psychology" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-on-surface">AI Forecast Active</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Predictive models analyzing 2.4M inventory data points globally.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex w-full items-center justify-center bg-background p-8 sm:p-12 lg:w-1/2 lg:p-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute right-4 top-4 z-20 lg:hidden">
          <ThemeToggle className="border border-outline-variant bg-surface" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-12 text-center lg:hidden">
            <h1 className="inline-flex items-center justify-center gap-2 font-headline text-3xl font-bold text-primary">
              <Icon name="science" className="text-4xl" />
              PharmaTrack AI
            </h1>
            <p className="mt-2 text-sm text-on-surface-variant">Pharma Logistics Platform</p>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

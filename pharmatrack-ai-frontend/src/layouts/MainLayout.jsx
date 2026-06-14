import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AmbientBackground from '@/components/layout/AmbientBackground';
import Sidebar from '@/components/layout/Sidebar';
import TopHeader from '@/components/layout/TopHeader';
import MobileDrawer from '@/components/layout/MobileDrawer';

export default function MainLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-on-surface transition-colors duration-300">
      <AmbientBackground />
      <Sidebar className="fixed left-0 top-0 hidden h-screen lg:flex" />
      <TopHeader onMenuClick={() => setDrawerOpen(true)} />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <main className="px-4 pb-12 pt-24 sm:px-6 lg:ml-64 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

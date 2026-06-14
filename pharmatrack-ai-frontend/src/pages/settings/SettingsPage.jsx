import { useState } from 'react';
import Tabs from '@/components/ui/Tabs';
import ProfileTab from './components/ProfileTab';
import AppearanceTab from './components/AppearanceTab';
import NotificationsTab from './components/NotificationsTab';
import SecurityTab from './components/SecurityTab';

const TABS = [
  { value: 'profile', label: 'Profile', icon: 'person' },
  { value: 'appearance', label: 'Appearance', icon: 'palette' },
  { value: 'notifications', label: 'Notifications', icon: 'notifications' },
  { value: 'security', label: 'Security', icon: 'shield' },
];

const TAB_COMPONENTS = {
  profile: ProfileTab,
  appearance: AppearanceTab,
  notifications: NotificationsTab,
  security: SecurityTab,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const ActiveTabContent = TAB_COMPONENTS[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-semibold tracking-tight text-on-surface">Settings</h1>
        <p className="mt-1 text-sm text-on-surface-variant">Manage your profile, appearance, notifications, and security.</p>
      </div>

      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

      <ActiveTabContent />
    </div>
  );
}

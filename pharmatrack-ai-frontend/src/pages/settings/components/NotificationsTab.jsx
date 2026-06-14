import { useState } from 'react';
import Icon from '@/components/common/Icon';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ToggleSwitch from './ToggleSwitch';

const NOTIFICATION_GROUPS = [
  {
    title: 'Inventory Alerts',
    items: [
      { id: 'lowStock', label: 'Low Stock Alerts', description: 'Get notified when a medicine drops below its reorder threshold.', defaultChecked: true },
      { id: 'expiryWarnings', label: 'Expiry Warnings', description: 'Receive alerts for batches nearing expiration.', defaultChecked: true },
      { id: 'overstock', label: 'Overstock Notices', description: 'Flag categories that are significantly overstocked.', defaultChecked: false },
    ],
  },
  {
    title: 'AI & Reports',
    items: [
      { id: 'aiInsights', label: 'AI Forecast Insights', description: 'Weekly digest of demand predictions and reorder suggestions.', defaultChecked: true },
      { id: 'reportReady', label: 'Report Generation', description: 'Notify when a scheduled report finishes generating.', defaultChecked: false },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'loginAlerts', label: 'New Login Alerts', description: 'Email me when my account is accessed from a new device.', defaultChecked: true },
      { id: 'productUpdates', label: 'Product Updates', description: 'Occasional news about new PharmaTrack AI features.', defaultChecked: false },
    ],
  },
];

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState(() =>
    NOTIFICATION_GROUPS.flatMap((group) => group.items).reduce(
      (acc, item) => ({ ...acc, [item.id]: item.defaultChecked }),
      {}
    )
  );

  const togglePref = (id) => (value) => setPrefs((prev) => ({ ...prev, [id]: value }));

  return (
    <Card className="p-6">
      <div className="divide-y divide-outline-variant">
        {NOTIFICATION_GROUPS.map((group) => (
          <div key={group.title} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-base font-semibold text-on-surface">{group.title}</h3>
            <div className="mt-2 divide-y divide-outline-variant/60">
              {group.items.map((item) => (
                <ToggleSwitch
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  description={item.description}
                  checked={prefs[item.id]}
                  onChange={togglePref(item.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end border-t border-outline-variant pt-4">
        <Button>
          <Icon name="save" className="text-base" />
          Save Preferences
        </Button>
      </div>
    </Card>
  );
}

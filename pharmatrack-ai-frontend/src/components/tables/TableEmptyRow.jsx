import Icon from '@/components/common/Icon';

export default function TableEmptyRow({ colSpan, message = 'No records found.', icon = 'inbox' }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-on-surface-variant">
        <div className="flex flex-col items-center gap-2">
          <Icon name={icon} className="text-3xl text-on-surface-variant/50" />
          {message}
        </div>
      </td>
    </tr>
  );
}

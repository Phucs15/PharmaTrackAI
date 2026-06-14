import TextField from './TextField';

export default function DateField({ icon = 'calendar_month', ...props }) {
  return <TextField type="date" icon={icon} {...props} />;
}

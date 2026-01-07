import { Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { useTranslation } from 'react-i18next';

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  const { t } = useTranslation('analytics');
  const handleFromChange = (val: Dayjs | null) => {
    if (val) onChange(val.format('YYYY-MM-DD'), to);
  };

  const handleToChange = (val: Dayjs | null) => {
    if (val) onChange(from, val.format('YYYY-MM-DD'));
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      <DatePicker
        label={t('filters.from')}
        value={dayjs(from)}
        onChange={handleFromChange}
        maxDate={dayjs(to)}
        slotProps={{ textField: { size: 'small' } }}
      />
      <DatePicker
        label={t('filters.to')}
        value={dayjs(to)}
        onChange={handleToChange}
        minDate={dayjs(from)}
        maxDate={dayjs()}
        slotProps={{ textField: { size: 'small' } }}
      />
    </Box>
  );
}

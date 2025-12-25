import { Typography, type TypographyProps } from '@mui/material';
import { formatCHF } from '@/shared/utils/formatters';
import { useAppSelector } from '@/app/hooks';
import { selectLocale } from '@/shared/state/uiSlice';

const LOCALE_MAP: Record<string, string> = {
  de: 'de-CH',
  fr: 'fr-CH',
  it: 'it-CH',
  en: 'en-CH',
};

interface CurrencyDisplayProps extends Omit<TypographyProps, 'children'> {
  value: number;
  showSign?: boolean;
}

export function CurrencyDisplay({ value, showSign = false, ...props }: CurrencyDisplayProps) {
  const locale = useAppSelector(selectLocale);
  const formatted = formatCHF(value, LOCALE_MAP[locale] ?? 'de-CH');

  const sign = showSign && value > 0 ? '+' : '';

  return (
    <Typography component="span" {...props}>
      {sign}{formatted}
    </Typography>
  );
}

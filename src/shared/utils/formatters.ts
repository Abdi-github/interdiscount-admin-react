import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/de';
import 'dayjs/locale/en';
import 'dayjs/locale/fr';
import 'dayjs/locale/it';

dayjs.extend(relativeTime);

// ─── Currency – Swiss Francs ─────────────────────────────────────────────────

export function formatCHF(value: number, locale = 'de-CH'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'CHF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCHFCompact(value: number): string {
  if (value >= 1_000_000) return `CHF ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `CHF ${(value / 1_000).toFixed(1)}k`;
  return formatCHF(value);
}

// ─── Numbers ─────────────────────────────────────────────────────────────────

export function formatNumber(value: number, locale = 'de-CH'): string {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatPercent(value: number, locale = 'de-CH'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

// ─── Dates ────────────────────────────────────────────────────────────────────

export function formatDate(value: string | Date, locale = 'de'): string {
  return dayjs(value).locale(locale).format('DD.MM.YYYY');
}

export function formatDateTime(value: string | Date, locale = 'de'): string {
  return dayjs(value).locale(locale).format('DD.MM.YYYY HH:mm');
}

export function formatRelativeTime(value: string | Date, locale = 'de'): string {
  return dayjs(value).locale(locale).fromNow();
}

// ─── Strings ─────────────────────────────────────────────────────────────────

export function truncate(str: string, length = 50): string {
  return str.length > length ? `${str.slice(0, length)}…` : str;
}

export function capitalise(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

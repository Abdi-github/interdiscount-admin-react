import { useState, useEffect, useRef } from 'react';

// ─── Debounce hook ────────────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ─── Debounced callback ───────────────────────────────────────────────────────

export function useDebouncedCallback<T extends unknown[]>(
  fn: (...args: T) => void,
  delay = 300
): (...args: T) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return (...args: T) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fn(...args), delay);
  };
}

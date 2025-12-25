import { useCallback } from 'react';
import { useSnackbar, type OptionsObject } from 'notistack';

// ─── Typed notification hook ─────────────────────────────────────────────────

export function useNotification() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const notify = useCallback(
    (message: string, options?: OptionsObject) => {
      enqueueSnackbar(message, { ...options });
    },
    [enqueueSnackbar]
  );

  const success = useCallback(
    (message: string) => enqueueSnackbar(message, { variant: 'success' }),
    [enqueueSnackbar]
  );

  const error = useCallback(
    (message: string) => enqueueSnackbar(message, { variant: 'error' }),
    [enqueueSnackbar]
  );

  const warning = useCallback(
    (message: string) => enqueueSnackbar(message, { variant: 'warning' }),
    [enqueueSnackbar]
  );

  const info = useCallback(
    (message: string) => enqueueSnackbar(message, { variant: 'info' }),
    [enqueueSnackbar]
  );

  return { notify, success, error, warning, info, closeSnackbar };
}

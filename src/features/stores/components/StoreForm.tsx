import { useEffect } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, Card, CardContent, CardHeader, Checkbox,
  FormControlLabel, Grid, MenuItem, Stack, Switch,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import type { Store, CreateStorePayload } from '../stores.types';
import type { Canton, City } from '@/features/locations/locations.types';

const getLocalName = (name: { de: string } | string | unknown): string => {
  if (typeof name === 'object' && name !== null && 'de' in name) return (name as { de: string }).de;
  return String(name ?? '');
};

// ─── Opening hours config ─────────────────────────────────────────────────────

const DAYS = [
  { key: 'monday' as const },
  { key: 'tuesday' as const },
  { key: 'wednesday' as const },
  { key: 'thursday' as const },
  { key: 'friday' as const },
  { key: 'saturday' as const },
  { key: 'sunday' as const },
] as const;

const DEFAULT_OPENING_HOURS = DAYS.map((d) => ({
  day: d.key as string,
  open: '09:00',
  close: '18:00',
  is_closed: d.key === 'sunday',
}));

// ─── Schema ───────────────────────────────────────────────────────────────────

const daySchema = z.object({
  day: z.string(),
  open: z.string(),
  close: z.string(),
  is_closed: z.boolean(),
});

const schema = z.object({
  name: z.string().min(2),
  street: z.string().min(2),
  street_number: z.string().min(1),
  postal_code: z.string().min(4).max(5),
  city_id: z.string().min(1, 'city_required'),
  canton_id: z.string().min(1, 'canton_required'),
  phone: z.string().min(8),
  email: z.string().email('email_invalid'),
  format: z.string(),
  is_active: z.boolean(),
  opening_hours: z.array(daySchema).optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  defaultValues?: Store | null;
  cantons: Canton[];
  cities: City[];
  onSubmit: (data: CreateStorePayload) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function StoreForm({ defaultValues, cantons, cities, onSubmit, isLoading, onCancel }: Props) {
  const { t } = useTranslation('stores');
  const { t: tc } = useTranslation('common');
  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      street: '',
      street_number: '',
      postal_code: '',
      city_id: '',
      canton_id: '',
      phone: '',
      email: '',
      format: 'standard',
      is_active: true,
      opening_hours: DEFAULT_OPENING_HOURS,
    },
  });

  const { fields, replace } = useFieldArray({ control, name: 'opening_hours' });

  const selectedCanton = watch('canton_id');
  const filteredCities = selectedCanton
    ? cities.filter((c) => {
        const cantonId = typeof c.canton_id === 'string' ? c.canton_id : (c.canton_id as unknown as { _id: string })?._id;
        return cantonId === selectedCanton;
      })
    : cities;

  useEffect(() => {
    if (defaultValues) {
      // Normalise opening_hours from API (array or record format)
      let normalizedHours = DEFAULT_OPENING_HOURS;
      if (Array.isArray(defaultValues.opening_hours) && defaultValues.opening_hours.length) {
        const src = defaultValues.opening_hours as Array<{ day: unknown; open: string; close: string; is_closed: boolean }>;
        normalizedHours = DAYS.map((d) => {
          const found = src.find((h) => {
            const dayVal = typeof h.day === 'object' && h.day !== null && 'en' in (h.day as object)
              ? (h.day as { en: string }).en.toLowerCase()
              : String(h.day ?? '').toLowerCase();
            return dayVal === d.key;
          });
          return found
            ? { day: d.key as string, open: found.open || '09:00', close: found.close || '18:00', is_closed: found.is_closed ?? false }
            : { day: d.key as string, open: '09:00', close: '18:00', is_closed: d.key === 'sunday' };
        });
      } else if (defaultValues.opening_hours && !Array.isArray(defaultValues.opening_hours)) {
        const rec = defaultValues.opening_hours as Record<string, { open: string; close: string } | null>;
        normalizedHours = DAYS.map((d) => {
          const entry = rec[d.key];
          return entry
            ? { day: d.key as string, open: entry.open || '09:00', close: entry.close || '18:00', is_closed: false }
            : { day: d.key as string, open: '09:00', close: '18:00', is_closed: true };
        });
      }

      reset({
        name: defaultValues.name,
        street: defaultValues.street,
        street_number: defaultValues.street_number,
        postal_code: defaultValues.postal_code,
        city_id: typeof defaultValues.city_id === 'object' ? (defaultValues.city_id as { _id: string })._id : defaultValues.city_id,
        canton_id: typeof defaultValues.canton_id === 'object' ? (defaultValues.canton_id as { _id: string })._id : defaultValues.canton_id,
        phone: defaultValues.phone,
        email: defaultValues.email,
        format: defaultValues.format ?? 'standard',
        is_active: defaultValues.is_active,
        opening_hours: normalizedHours,
      });
      replace(normalizedHours);
    }
  }, [defaultValues, reset, replace]);

  const handleFormSubmit = (values: FormValues) => {
    onSubmit({
      name: values.name,
      street: values.street,
      street_number: values.street_number,
      postal_code: values.postal_code,
      city_id: values.city_id,
      canton_id: values.canton_id,
      phone: values.phone,
      email: values.email,
      format: values.format,
      is_active: values.is_active,
      opening_hours: values.opening_hours as CreateStorePayload['opening_hours'],
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing={3}>
        <Card>
          <CardHeader title={t('form.store_data_card')} />
          <CardContent>
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Controller name="name" control={control}
                    render={({ field }) => <TextField {...field} label={t('form.store_name')} error={!!errors.name} helperText={errors.name?.message} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="format" control={control}
                    render={({ field }) => (
                      <TextField {...field} select label={t('fields.format')} fullWidth>
                        <MenuItem value="standard">Standard</MenuItem>
                        <MenuItem value="xxl">XXL</MenuItem>
                        <MenuItem value="compact">Compact</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Controller name="street" control={control}
                    render={({ field }) => <TextField {...field} label={t('form.street')} error={!!errors.street} helperText={errors.street?.message} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="street_number" control={control}
                    render={({ field }) => <TextField {...field} label={t('form.street_number')} error={!!errors.street_number} helperText={errors.street_number?.message} fullWidth />}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Controller name="postal_code" control={control}
                    render={({ field }) => <TextField {...field} label={t('form.postal_code')} error={!!errors.postal_code} helperText={errors.postal_code?.message} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Controller name="canton_id" control={control}
                    render={({ field }) => (
                      <TextField {...field} select label={t('form.canton')} error={!!errors.canton_id} helperText={errors.canton_id?.message ? t(`form.${errors.canton_id?.message}`) : undefined} fullWidth>
                        {cantons.map((c) => (
                          <MenuItem key={c._id} value={c._id}>{c.code} — {getLocalName(c.name)}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <Controller name="city_id" control={control}
                    render={({ field }) => (
                      <TextField {...field} select label={t('form.city')} error={!!errors.city_id} helperText={errors.city_id?.message ? t(`form.${errors.city_id?.message}`) : undefined} fullWidth>
                        {filteredCities.map((c) => (
                          <MenuItem key={c._id} value={c._id}>{getLocalName(c.name)}</MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
              </Grid>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title={t('form.contact_card')} />
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Controller name="phone" control={control}
                  render={({ field }) => <TextField {...field} label={t('form.phone')} error={!!errors.phone} helperText={errors.phone?.message} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Controller name="email" control={control}
                  render={({ field }) => <TextField {...field} label={t('form.email')} type="email" error={!!errors.email} helperText={errors.email?.message ? t(`form.${errors.email?.message}`) : undefined} fullWidth />}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Opening Hours ── */}
        <Card>
          <CardHeader title={t('form.hours_card')} subheader={t('form.hours_subheader')} />
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 3 }}>{t('form.day_col')}</TableCell>
                  <TableCell>{t('form.open_col')}</TableCell>
                  <TableCell>{t('form.close_col')}</TableCell>
                  <TableCell align="center">{t('form.closed_col')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id} hover>
                    <TableCell sx={{ pl: 3 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {t(`days.${DAYS[index]?.key ?? field.day}`)}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Controller
                        name={`opening_hours.${index}.open`}
                        control={control}
                        render={({ field: f }) => (
                          <TextField
                            {...f}
                            size="small"
                            placeholder="09:00"
                            sx={{ width: 100 }}
                            disabled={watch(`opening_hours.${index}.is_closed`)}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 0.5 }}>
                      <Controller
                        name={`opening_hours.${index}.close`}
                        control={control}
                        render={({ field: f }) => (
                          <TextField
                            {...f}
                            size="small"
                            placeholder="18:00"
                            sx={{ width: 100 }}
                            disabled={watch(`opening_hours.${index}.is_closed`)}
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ py: 0.5 }}>
                      <Controller
                        name={`opening_hours.${index}.is_closed`}
                        control={control}
                        render={({ field: f }) => (
                          <Checkbox
                            checked={f.value}
                            onChange={(e) => f.onChange(e.target.checked)}
                            size="small"
                          />
                        )}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* ── Status ── */}
        <Card>
          <CardContent>
            <Controller name="is_active" control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                  label={t('form.active_label')}
                />
              )}
            />
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={onCancel}>{tc('actions.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {defaultValues ? tc('actions.save') : t('create')}
          </Button>
        </Box>
      </Stack>
    </form>
  );
}

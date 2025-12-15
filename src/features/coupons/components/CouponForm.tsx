import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import {
  Button, Card, CardContent, CardHeader, Chip,
  FormControlLabel, InputAdornment, MenuItem, Stack,
  Switch, TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import type { Coupon, CreateCouponPayload } from '../coupons.types';

const schema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_-]+$/, 'Nur Großbuchstaben, Zahlen, - und _'),
  description_de: z.string().max(200).optional(),
  description_en: z.string().max(200).optional(),
  discount_type: z.enum(['percentage', 'fixed']),
  discount_value: z.number({ invalid_type_error: 'Pflichtfeld' }).positive('Muss positiv sein'),
  minimum_order: z.number().nonnegative().nullable().optional(),
  max_uses: z.number().int().positive().nullable().optional(),
  valid_from: z.instanceof(dayjs as unknown as typeof Dayjs, { message: 'Datum erforderlich' }).nullable(),
  valid_until: z.instanceof(dayjs as unknown as typeof Dayjs, { message: 'Datum erforderlich' }).nullable(),
  is_active: z.boolean(),
}).refine(
  (d) => {
    if (!d.valid_from || !d.valid_until) return true;
    return (d.valid_until as Dayjs).isAfter(d.valid_from as Dayjs);
  },
  { message: 'Enddatum muss nach Startdatum liegen', path: ['valid_until'] }
);

type FormValues = z.infer<typeof schema>;

interface CouponFormProps {
  defaultValues?: Coupon;
  onSubmit: (payload: CreateCouponPayload) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export function CouponForm({ defaultValues, onSubmit, isLoading, onCancel }: CouponFormProps) {
  const { t } = useTranslation('coupons');
  const { t: tc } = useTranslation('common');
  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      description_de: '',
      description_en: '',
      discount_type: 'percentage',
      discount_value: 0,
      minimum_order: null,
      max_uses: null,
      valid_from: dayjs(),
      valid_until: dayjs().add(30, 'day'),
      is_active: true,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        code: defaultValues.code,
        description_de: defaultValues.description?.de ?? '',
        description_en: defaultValues.description?.en ?? '',
        discount_type: defaultValues.discount_type,
        discount_value: defaultValues.discount_value,
        minimum_order: defaultValues.minimum_order ?? null,
        max_uses: defaultValues.max_uses ?? null,
        valid_from: dayjs(defaultValues.valid_from),
        valid_until: dayjs(defaultValues.valid_until),
        is_active: defaultValues.is_active,
      });
    }
  }, [defaultValues, reset]);

  const discountType = watch('discount_type');

  const handleFormSubmit = (values: FormValues) => {
    const payload: CreateCouponPayload = {
      code: values.code.toUpperCase(),
      description: {
        de: values.description_de || undefined,
        en: values.description_en || undefined,
      },
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      minimum_order: values.minimum_order ?? null,
      max_uses: values.max_uses ?? null,
      valid_from: (values.valid_from as Dayjs).toISOString(),
      valid_until: (values.valid_until as Dayjs).toISOString(),
      is_active: values.is_active,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing={3}>
        {/* ── Code & Discount ── */}
        <Card>
          <CardHeader title={t('form.details_card')} />
          <CardContent>
            <Stack spacing={2}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('form.code_label')}
                    placeholder="z.B. SOMMER25"
                    error={!!errors.code}
                    helperText={errors.code?.message ?? t('form.code_hint')}
                    fullWidth
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    InputProps={{
                      endAdornment: field.value && (
                        <InputAdornment position="end">
                          <Chip label={field.value} size="small" variant="outlined" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="discount_type"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label={t('form.discount_type_label')} sx={{ minWidth: 160 }}>
                      <MenuItem value="percentage">{t('form.type_percentage')}</MenuItem>
                      <MenuItem value="fixed">{t('form.type_fixed')}</MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  name="discount_value"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('form.discount_value_label')}
                      type="number"
                      error={!!errors.discount_value}
                      helperText={errors.discount_value?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            {discountType === 'percentage' ? '%' : 'CHF'}
                          </InputAdornment>
                        ),
                      }}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="minimum_order"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label={t('form.min_order_label')}
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                      InputProps={{ startAdornment: <InputAdornment position="start">CHF</InputAdornment> }}
                    />
                  )}
                />
                <Controller
                  name="max_uses"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      label={t('form.max_uses_label')}
                      type="number"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                      error={!!errors.max_uses}
                      helperText={errors.max_uses?.message}
                    />
                  )}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* ── Validity ── */}
        <Card>
          <CardHeader title={t('form.validity_card')} />
          <CardContent>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="valid_from"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label={t('form.valid_from_label')}
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          error: !!errors.valid_from,
                          helperText: errors.valid_from?.message,
                          fullWidth: true,
                        },
                      }}
                    />
                  )}
                />
                <Controller
                  name="valid_until"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      label={t('form.valid_until_label')}
                      value={field.value}
                      onChange={field.onChange}
                      slotProps={{
                        textField: {
                          error: !!errors.valid_until,
                          helperText: errors.valid_until?.message,
                          fullWidth: true,
                        },
                      }}
                    />
                  )}
                />
              </Stack>

              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Switch checked={field.value} onChange={field.onChange} />}
                    label={t('form.active_label')}
                  />
                )}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* ── Description ── */}
        <Card>
          <CardHeader title={t('form.description_card')} subheader={t('form.description_subheader')} />
          <CardContent>
            <Stack spacing={2}>
              <Controller
                name="description_de"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('form.desc_de_label')}
                    multiline
                    rows={2}
                    fullWidth
                    error={!!errors.description_de}
                    helperText={errors.description_de?.message}
                  />
                )}
              />
              <Controller
                name="description_en"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('form.desc_en_label')}
                    multiline
                    rows={2}
                    fullWidth
                    error={!!errors.description_en}
                    helperText={errors.description_en?.message}
                  />
                )}
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>{tc('actions.cancel')}</Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {defaultValues ? t('form.save_btn') : t('form.create_btn')}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}

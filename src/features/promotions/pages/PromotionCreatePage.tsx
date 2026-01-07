import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box, Button, Card, CardContent, CardHeader, Stack,
  TextField, MenuItem, FormControlLabel, Switch, Grid, InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { PageHeader } from '@/shared/components/PageHeader';
import { useNotification } from '@/shared/hooks/useNotification';
import { useCreatePromotionMutation } from '../promotions.api';
import type { CreatePromotionPayload } from '../promotions.types';

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed', 'buy_x_get_y']),
  discount_value: z.number().min(0),
  buy_quantity: z.number().min(1).optional(),
  get_quantity: z.number().min(1).optional(),
  valid_from: z.instanceof(Object),
  valid_until: z.instanceof(Object),
  is_active: z.boolean(),
});

type FormValues = {
  title: string;
  description: string;
  discount_type: 'percentage' | 'fixed' | 'buy_x_get_y';
  discount_value: number;
  buy_quantity: number;
  get_quantity: number;
  valid_from: Dayjs;
  valid_until: Dayjs;
  is_active: boolean;
};

export function PromotionCreatePage() {
  const { t } = useTranslation('promotions');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [createPromotion, { isLoading }] = useCreatePromotionMutation();

  const { control, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 10,
      buy_quantity: 2,
      get_quantity: 1,
      valid_from: dayjs(),
      valid_until: dayjs().add(30, 'day'),
      is_active: true,
    },
  });

  const promotionType = watch('discount_type');

  const handleFormSubmit = async (values: FormValues) => {
    const payload: CreatePromotionPayload = {
      title: values.title,
      description: values.description || undefined,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      buy_quantity: values.discount_type === 'buy_x_get_y' ? values.buy_quantity : undefined,
      get_quantity: values.discount_type === 'buy_x_get_y' ? values.get_quantity : undefined,
      valid_from: values.valid_from.toISOString(),
      valid_until: values.valid_until.toISOString(),
      is_active: values.is_active,
    };
    try {
      await createPromotion(payload).unwrap();
      success(t('messages.created'));
      navigate('/promotions');
    } catch {
      error(t('messages.create_error'));
    }
  };

  return (
    <Box>
      <PageHeader title={t('create')} subtitle={t('create_subtitle')} />
      <Box sx={{ maxWidth: 800, mt: 2 }}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack spacing={3}>
            <Card>
              <CardHeader title={t('form.details_card')} />
              <CardContent>
                <Stack spacing={2}>
                  <Controller name="title" control={control}
                    render={({ field }) => (
                      <TextField {...field} label={t('form.title_field')} error={!!errors.title} helperText={errors.title?.message} fullWidth />
                    )}
                  />
                  <Controller name="description" control={control}
                    render={({ field }) => (
                      <TextField {...field} label={t('form.description_field')} multiline rows={2} fullWidth />
                    )}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Controller name="discount_type" control={control}
                        render={({ field }) => (
                          <TextField {...field} select label={t('form.type_field')} fullWidth>
                            <MenuItem value="percentage">{t('type.percentage')}</MenuItem>
                            <MenuItem value="fixed">{t('type.fixed')}</MenuItem>
                            <MenuItem value="buy_x_get_y">{t('type.buy_x_get_y')}</MenuItem>
                          </TextField>
                        )}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      {promotionType !== 'buy_x_get_y' ? (
                        <Controller name="discount_value" control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={t('form.value_field')}
                              type="number"
                              fullWidth
                              InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    {promotionType === 'percentage' ? '%' : 'CHF'}
                                  </InputAdornment>
                                ),
                              }}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          )}
                        />
                      ) : (
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Controller name="buy_quantity" control={control}
                              render={({ field }) => (
                                <TextField {...field} label={t('form.buy_x_label')} type="number" fullWidth
                                  onChange={(e) => field.onChange(Number(e.target.value))} />
                              )}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Controller name="get_quantity" control={control}
                              render={({ field }) => (
                                <TextField {...field} label={t('form.get_y_label')} type="number" fullWidth
                                  onChange={(e) => field.onChange(Number(e.target.value))} />
                              )}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>

                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title={t('form.validity_card')} />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller name="valid_from" control={control}
                      render={({ field }) => (
                        <DatePicker
                          label={t('form.start_date')}
                          value={field.value}
                          onChange={field.onChange}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Controller name="valid_until" control={control}
                      render={({ field }) => (
                        <DatePicker
                          label={t('form.end_date')}
                          value={field.value}
                          onChange={field.onChange}
                          slotProps={{ textField: { fullWidth: true } }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Controller name="is_active" control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                      label={t('form.activate_label')}
                    />
                  )}
                />
              </CardContent>
            </Card>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/promotions')}>{tc('actions.cancel')}</Button>
              <Button type="submit" variant="contained" disabled={isLoading}>{t('create')}</Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}

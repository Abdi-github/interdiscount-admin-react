import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControlLabel,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { type Dayjs } from 'dayjs';
import { PageHeader } from '@/shared/components/PageHeader';
import { useNotification } from '@/shared/hooks/useNotification';
import { useUpdatePromotionMutation } from '../promotions.api';
import type { CreatePromotionPayload, Promotion } from '../promotions.types';

// ─── Schema ───────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export function PromotionEditPage() {
  const { t } = useTranslation('promotions');
  const { t: tc } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const location = useLocation();

  // Passed via navigate state from PromotionsListPage
  const promotion = (location.state as { promotion?: Promotion })?.promotion;

  const [updatePromotion, { isLoading }] = useUpdatePromotionMutation();

  const { control, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: promotion
      ? {
          title: promotion.title,
          description: promotion.description ?? '',
          discount_type: promotion.discount_type,
          discount_value: promotion.discount_value,
          buy_quantity: promotion.buy_quantity ?? 2,
          get_quantity: promotion.get_quantity ?? 1,
          valid_from: dayjs(promotion.valid_from),
          valid_until: dayjs(promotion.valid_until),
          is_active: promotion.is_active,
        }
      : {
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

  if (!promotion) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
          {t('detail.not_found')}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/promotions')}>
          {t('detail.back')}
        </Button>
      </Box>
    );
  }

  const handleFormSubmit = async (values: FormValues) => {
    if (!id) return;
    const payload: CreatePromotionPayload = {
      title: values.title,
      description: values.description || undefined,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      buy_quantity: values.discount_type === 'buy_x_get_y' ? values.buy_quantity : undefined,
      get_quantity: values.discount_type === 'buy_x_get_y' ? values.get_quantity : undefined,
      valid_from: (values.valid_from as Dayjs).toISOString(),
      valid_until: (values.valid_until as Dayjs).toISOString(),
      is_active: values.is_active,
    };
    try {
      await updatePromotion({ id, body: payload }).unwrap();
      success(t('messages.updated'));
      navigate('/promotions');
    } catch {
      error(t('messages.update_error'));
    }
  };

  return (
    <Box>
      <PageHeader title={t('edit')} subtitle={promotion.title} />
      <Box sx={{ maxWidth: 800, mt: 2 }}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Stack spacing={3}>
            <Card>
              <CardHeader title={t('form.details_card')} />
              <CardContent>
                <Stack spacing={2}>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label={t('form.title_field')} error={!!errors.title} helperText={errors.title?.message} fullWidth />
                    )}
                  />
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField {...field} label={t('form.description_field')} multiline rows={2} fullWidth />
                    )}
                  />
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="discount_type"
                        control={control}
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
                        <Controller
                          name="discount_value"
                          control={control}
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
                            <Controller
                              name="buy_quantity"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label={t('form.buy_x_label')}
                                  type="number"
                                  fullWidth
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              )}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <Controller
                              name="get_quantity"
                              control={control}
                              render={({ field }) => (
                                <TextField
                                  {...field}
                                  label={t('form.get_y_label')}
                                  type="number"
                                  fullWidth
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              )}
                            />
                          </Grid>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                  {/* no min_order_amount field in API */}
                </Stack>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title={t('form.validity_card')} />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Controller
                      name="valid_from"
                      control={control}
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
                    <Controller
                      name="valid_until"
                      control={control}
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
                <Controller
                  name="is_active"
                  control={control}
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
              <Button variant="outlined" onClick={() => navigate('/promotions')}>{tc('actions.cancel')}</Button>
              <Button type="submit" variant="contained" disabled={isLoading}>{t('update_btn')}</Button>
            </Box>
          </Stack>
        </form>
      </Box>
    </Box>
  );
}

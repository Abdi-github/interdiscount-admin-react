import { useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useGetPublicCategoriesQuery, useGetPublicBrandsQuery } from '../products.api';
import type { CreateProductPayload, Product, ProductStatus } from '../products.types';

// ─── Schema ───────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(3, 'Mindestens 3 Zeichen').max(500),
  name_short: z.string().min(2, 'Mindestens 2 Zeichen').max(200),
  code: z.string().min(1, 'Erforderlich').max(50),
  brand_id: z.string().nullable().optional(),
  category_id: z.string().min(1, 'Kategorie erforderlich'),
  price: z.number({ invalid_type_error: 'Preis erforderlich' }).positive('Muss positiv sein'),
  original_price: z.number().positive().nullable().optional(),
  delivery_days: z.number().int().min(0).optional(),
  in_store_possible: z.boolean().optional(),
  is_active: z.boolean().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'ARCHIVED', 'INACTIVE']),
  specification: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProductFormProps {
  defaultValues?: Partial<Product>;
  onSubmit: (payload: CreateProductPayload) => Promise<void>;
  isLoading?: boolean;
  onCancel: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'PUBLISHED', label: 'PUBLISHED' },
  { value: 'INACTIVE', label: 'INACTIVE' },
  { value: 'ARCHIVED', label: 'ARCHIVED' },
];

// Note: labels rendered via t('status.VALUE') inside component

export function ProductForm({ defaultValues, onSubmit, isLoading, onCancel }: ProductFormProps) {
  const { t } = useTranslation('products');
  const { t: tc } = useTranslation('common');
  const { data: categoriesData } = useGetPublicCategoriesQuery({ limit: 500 });
  const { data: brandsData } = useGetPublicBrandsQuery({ limit: 500 });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      name_short: '',
      code: '',
      brand_id: null,
      category_id: '',
      price: 0,
      original_price: null,
      delivery_days: 2,
      in_store_possible: true,
      is_active: true,
      status: 'DRAFT',
      specification: '',
    },
  });

  useEffect(() => {
    if (defaultValues) {
      const categoryId =
        typeof defaultValues.category_id === 'object' && defaultValues.category_id !== null
          ? (defaultValues.category_id as { _id: string })._id
          : (defaultValues.category_id as string) ?? '';
      const brandId =
        typeof defaultValues.brand_id === 'object' && defaultValues.brand_id !== null
          ? (defaultValues.brand_id as { _id: string })._id
          : (defaultValues.brand_id as string) ?? null;

      reset({
        name: defaultValues.name ?? '',
        name_short: defaultValues.name_short ?? '',
        code: defaultValues.code ?? '',
        brand_id: brandId,
        category_id: categoryId,
        price: defaultValues.price ?? 0,
        original_price: defaultValues.original_price ?? null,
        delivery_days: defaultValues.delivery_days ?? 2,
        in_store_possible: defaultValues.in_store_possible ?? true,
        is_active: defaultValues.is_active ?? true,
        status: defaultValues.status ?? 'DRAFT',
        specification:
          typeof defaultValues.specification === 'string' ? defaultValues.specification : '',
      });
    }
  }, [defaultValues, reset]);

  const handleFormSubmit = async (values: ProductFormValues) => {
    const payload: CreateProductPayload = {
      name: values.name,
      name_short: values.name_short,
      code: values.code,
      brand_id: values.brand_id || null,
      category_id: values.category_id,
      price: values.price,
      original_price: values.original_price ?? null,
      delivery_days: values.delivery_days ?? 2,
      in_store_possible: values.in_store_possible ?? true,
      is_active: values.is_active ?? true,
      status: values.status,
      specification: values.specification ?? '',
    };
    await onSubmit(payload);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack spacing={3}>
        {/* ── Basic Information ── */}
        <Card>
          <CardHeader title={t('form.product_info')} />
          <CardContent>
            <Stack spacing={2}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('fields.name')}
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />
              <Controller
                name="name_short"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('fields.name_short')}
                    fullWidth
                    error={!!errors.name_short}
                    helperText={errors.name_short?.message}
                  />
                )}
              />
              <Stack direction="row" spacing={2}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label={t('fields.code')}
                      fullWidth
                      error={!!errors.code}
                      helperText={errors.code?.message}
                    />
                  )}
                />
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label={t('fields.status')} sx={{ minWidth: 160 }}>
                      {STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {t(`status.${opt.value}`)}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label={t('fields.category')}
                      fullWidth
                      error={!!errors.category_id}
                      helperText={errors.category_id?.message}
                    >
                      <MenuItem value="">{t('form.category_empty')}</MenuItem>
                      {categoriesData?.data?.map((cat) => (
                        <MenuItem key={cat._id} value={cat._id}>
                          {typeof cat.name === 'object'
                            ? (cat.name as { de: string }).de
                            : cat.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="brand_id"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      value={field.value ?? ''}
                      select
                      label={t('fields.brand')}
                      fullWidth
                    >
                      <MenuItem value="">{t('form.brand_empty')}</MenuItem>
                      {brandsData?.data?.map((brand) => (
                        <MenuItem key={brand._id} value={brand._id}>
                          {brand.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* ── Pricing ── */}
        <Card>
          <CardHeader title={t('form.pricing')} />
          <CardContent>
            <Stack direction="row" spacing={2}>
              <Controller
                name="price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('fields.price')}
                    type="number"
                    fullWidth
                    error={!!errors.price}
                    helperText={errors.price?.message}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">CHF</InputAdornment>,
                    }}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                )}
              />
              <Controller
                name="original_price"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    value={field.value ?? ''}
                    label={t('fields.original_price')}
                    type="number"
                    fullWidth
                    InputProps={{
                      startAdornment: <InputAdornment position="start">CHF</InputAdornment>,
                    }}
                    onChange={(e) =>
                      field.onChange(e.target.value ? parseFloat(e.target.value) : null)
                    }
                  />
                )}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* ── Details ── */}
        <Card>
          <CardHeader title={t('form.details_delivery')} />
          <CardContent>
            <Stack spacing={2}>
              <Controller
                name="delivery_days"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={t('fields.delivery_days')}
                    type="number"
                    sx={{ width: 200 }}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  />
                )}
              />
              <Stack direction="row" spacing={3}>
                <Controller
                  name="in_store_possible"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value ?? true} />}
                      label={t('fields.in_store')}
                    />
                  )}
                />
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={<Checkbox {...field} checked={field.value ?? true} />}
                      label={tc('status.active')}
                    />
                  )}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* ── Specification ── */}
        <Card>
          <CardHeader title={t('form.specifications')} />
          <CardContent>
            <Controller
              name="specification"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                    label={t('form.spec_label')}
                  multiline
                  rows={6}
                  fullWidth
                  placeholder='{"Prozessor": "Intel Core i7", "RAM": "16 GB"}'
                />
              )}
            />
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={onCancel} disabled={isLoading}>
            {tc('actions.cancel')}
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {defaultValues ? tc('actions.save') : t('create')}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

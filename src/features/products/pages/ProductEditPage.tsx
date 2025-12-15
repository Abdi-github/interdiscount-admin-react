import { useParams, useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { useNotification } from '@/shared/hooks/useNotification';
import { useGetProductQuery, useUpdateProductMutation } from '../products.api';
import { ProductForm } from '../components/ProductForm';
import { ProductImageUpload } from '../components/ProductImageUpload';
import type { CreateProductPayload } from '../products.types';

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('products');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();

  const { data: productData, isLoading: isFetching, isError } = useGetProductQuery(id ?? '', {
    skip: !id,
  });

  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const handleSubmit = async (payload: CreateProductPayload) => {
    if (!id) return;
    try {
      await updateProduct({ id, body: payload }).unwrap();
      success(t('messages.updated'));
      navigate('/products');
    } catch {
      error(tc('errors.generic'));
    }
  };

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !productData?.data) {
    return <Alert severity="error">Produkt nicht gefunden.</Alert>;
  }

  const product = productData.data;

  return (
    <Box>
      <PageHeader
        title={t('edit')}
        subtitle={product.name_short}
      />
      <Box sx={{ maxWidth: 900, mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <ProductImageUpload productId={product._id} images={product.images ?? []} />
        <ProductForm
          defaultValues={product}
          onSubmit={handleSubmit}
          isLoading={isUpdating}
          onCancel={() => navigate('/products')}
        />
      </Box>
    </Box>
  );
}

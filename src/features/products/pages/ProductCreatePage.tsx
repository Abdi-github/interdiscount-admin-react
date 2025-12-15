import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { useNotification } from '@/shared/hooks/useNotification';
import { useCreateProductMutation } from '../products.api';
import { ProductForm } from '../components/ProductForm';
import type { CreateProductPayload } from '../products.types';

export function ProductCreatePage() {
  const navigate = useNavigate();
  const { t } = useTranslation('products');
  const { t: tc } = useTranslation('common');
  const { success, error } = useNotification();
  const [createProduct, { isLoading }] = useCreateProductMutation();

  const handleSubmit = async (payload: CreateProductPayload) => {
    try {
      const result = await createProduct(payload).unwrap();
      success(t('messages.created_redirect'));
      navigate(`/products/${result.data._id}/edit`);
    } catch {
      error(tc('errors.generic'));
    }
  };

  return (
    <Box>
      <PageHeader title={t('create')} subtitle={t('create_subtitle')} />
      <Box sx={{ maxWidth: 900, mt: 2 }}>
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => navigate('/products')}
        />
      </Box>
    </Box>
  );
}

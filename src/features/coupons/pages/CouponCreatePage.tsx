import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { useNotification } from '@/shared/hooks/useNotification';
import { useCreateCouponMutation } from '../coupons.api';
import { CouponForm } from '../components/CouponForm';
import type { CreateCouponPayload } from '../coupons.types';

export function CouponCreatePage() {
  const { t } = useTranslation('coupons');
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [createCoupon, { isLoading }] = useCreateCouponMutation();

  const handleSubmit = async (payload: CreateCouponPayload) => {
    try {
      await createCoupon(payload).unwrap();
      success(t('messages.created'));
      navigate('/coupons');
    } catch {
      error(t('messages.create_error'));
    }
  };

  return (
    <Box>
      <PageHeader title={t('create')} subtitle={t('create_subtitle')} />
      <Box sx={{ maxWidth: 800, mt: 2 }}>
        <CouponForm onSubmit={handleSubmit} isLoading={isLoading} onCancel={() => navigate('/coupons')} />
      </Box>
    </Box>
  );
}

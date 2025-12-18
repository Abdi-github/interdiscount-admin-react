import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/shared/components/PageHeader';
import { useNotification } from '@/shared/hooks/useNotification';
import { useCreateStoreMutation } from '../stores.api';
import { StoreForm } from '../components/StoreForm';
import type { CreateStorePayload } from '../stores.types';
import { useGetPublicCantonsQuery } from '@/features/locations/locations.api';
import { useGetPublicCitiesQuery } from '@/features/locations/locations.api';

export function StoreCreatePage() {
  const { t } = useTranslation('stores');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [createStore, { isLoading }] = useCreateStoreMutation();
  const { data: cantonsData } = useGetPublicCantonsQuery({ limit: 100 });
  const { data: citiesData } = useGetPublicCitiesQuery({ limit: 500 });

  const handleSubmit = async (payload: CreateStorePayload) => {
    try {
      const name = payload.name
        .toLowerCase()
        .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await createStore({ ...payload, slug: name }).unwrap();
      success(t('messages.created'));
      navigate('/stores');
    } catch {
      error(tc('errors.generic'));
    }
  };

  return (
    <Box>
      <PageHeader title={t('create')} subtitle={t('create_subtitle')} />
      <Box sx={{ maxWidth: 900, mt: 2 }}>
        <StoreForm
          cantons={cantonsData?.data ?? []}
          cities={citiesData?.data ?? []}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => navigate('/stores')}
        />
      </Box>
    </Box>
  );
}

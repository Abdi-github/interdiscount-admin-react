import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Button, Card, CardContent, CardHeader, Stack, TextField,
  MenuItem, IconButton, Typography, Divider,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { PageHeader } from '@/shared/components/PageHeader';
import { useNotification } from '@/shared/hooks/useNotification';
import { useCreateTransferMutation } from '../transfers.api';
import { useGetPublicStoresQuery } from '@/features/stores/stores.api';

interface TransferItem {
  product_id: string;
  quantity: number;
}

export function TransferCreatePage() {
  const { t } = useTranslation('transfers');
  const { t: tc } = useTranslation('common');
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [createTransfer, { isLoading }] = useCreateTransferMutation();
  const { data: storesData } = useGetPublicStoresQuery({ limit: 200 });

  const [toStoreId, setToStoreId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<TransferItem[]>([{ product_id: '', quantity: 1 }]);

  const addItem = () => setItems([...items, { product_id: '', quantity: 1 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, field: keyof TransferItem, value: string | number) => {
    setItems(items.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const handleSubmit = async () => {
    if (!toStoreId) { error(t('messages.required_store')); return; }
    const validItems = items.filter((i) => i.product_id && i.quantity > 0);
    if (validItems.length === 0) { error(t('messages.required_items')); return; }
    try {
      await createTransfer({ to_store_id: toStoreId, items: validItems, notes: notes || undefined }).unwrap();
      success(t('messages.created'));
      navigate('/transfers');
    } catch {
      error(tc('errors.generic'));
    }
  };

  return (
    <Box>
      <PageHeader title={t('create')} subtitle={t('create_subtitle')} />
      <Box sx={{ maxWidth: 800, mt: 2 }}>
        <Stack spacing={3}>
          <Card>
            <CardHeader title={t('form.target_store_card')} />
            <CardContent>
              <Stack spacing={2}>
                <TextField
                  select label={t('form.target_store_label')} value={toStoreId}
                  onChange={(e) => setToStoreId(e.target.value)} fullWidth
                >
                  {(storesData?.data ?? []).map((s) => (
                    <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label={t('fields.notes')} value={notes} onChange={(e) => setNotes(e.target.value)}
                  multiline rows={2} fullWidth
                />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title={t('form.items_card')}
              action={
                <Button size="small" startIcon={<Add />} onClick={addItem}>{t('form.add')}</Button>
              }
            />
            <CardContent>
              <Stack spacing={2}>
                {items.map((item, index) => (
                  <Box key={index}>
                    {index > 0 && <Divider sx={{ mb: 2 }} />}
                    <Stack direction="row" spacing={2} alignItems="center">
                      <TextField
                        label={t('form.product_id_label')} value={item.product_id}
                        onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                        sx={{ flex: 2 }}
                        placeholder={t('form.product_id_label')}
                      />
                      <TextField
                        label={t('form.quantity_label')} type="number" value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                        sx={{ flex: 1 }}
                        inputProps={{ min: 1 }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                      >
                        <Delete />
                      </IconButton>
                    </Stack>
                  </Box>
                ))}
                {items.length === 0 && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    {t('form.no_items')}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" onClick={() => navigate('/transfers')}>{tc('actions.cancel')}</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={isLoading}>
              {t('form.submit')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box, Tabs, Tab, CircularProgress, Alert, Card, CardContent,
  CardHeader, Typography, Chip, Grid, Stack, Button,
  Avatar, List, ListItem, ListItemAvatar, ListItemText,
  IconButton, Tooltip,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { PageHeader } from '@/shared/components/PageHeader';
import { useNotification } from '@/shared/hooks/useNotification';
import {
  useGetStoreQuery, useUpdateStoreMutation,
  useGetStoreStaffQuery, useAssignStoreStaffMutation,
} from '../stores.api';
import { StoreForm } from '../components/StoreForm';
import { StaffAssignmentDialog } from '../components/StaffAssignmentDialog';
import { StoreInventoryTable } from '../components/StoreInventoryTable';
import { useGetPublicCantonsQuery, useGetPublicCitiesQuery } from '@/features/locations/locations.api';
import type { CreateStorePayload } from '../stores.types';

export function StoreDetailPage() {
  const { t } = useTranslation('stores');
  const { t: tc } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useNotification();
  const [tab, setTab] = useState(0);
  const [staffDialogOpen, setStaffDialogOpen] = useState(false);

  const { data: storeData, isLoading, isError } = useGetStoreQuery(id ?? '', { skip: !id });
  const [updateStore, { isLoading: isUpdating }] = useUpdateStoreMutation();
  const { data: cantonsData } = useGetPublicCantonsQuery({ limit: 100 });
  const { data: citiesData } = useGetPublicCitiesQuery({ limit: 500 });
  const { data: staffData, refetch: refetchStaff } = useGetStoreStaffQuery(id ?? '', { skip: !id });
  const [removeStaff] = useAssignStoreStaffMutation();

  const currentStaff = staffData?.data ?? [];

  const handleSubmit = async (payload: CreateStorePayload) => {
    if (!id) return;
    try {
      await updateStore({ id, body: payload }).unwrap();
      success(t('messages.updated'));
    } catch {
      error(tc('errors.generic'));
    }
  };

  const handleRemoveStaff = async (userId: string) => {
    if (!id) return;
    const newIds = currentStaff.filter((s) => s._id !== userId).map((s) => s._id);
    try {
      await removeStaff({ id, user_ids: newIds }).unwrap();
      success(t('staff_section.removed'));
      refetchStaff();
    } catch {
      error(tc('errors.generic'));
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (isError || !storeData?.data) return <Alert severity="error">{t('messages.not_found')}</Alert>;

  const store = storeData.data;
  const cityObj = typeof store.city_id === 'object' ? store.city_id as { name: { de: string } | string; _id: string } : null;
  const cityName = cityObj ? (typeof cityObj.name === 'object' ? cityObj.name.de : cityObj.name) : store.city_id as string;
  const cantonCode = typeof store.canton_id === 'object' ? (store.canton_id as { code: string }).code : '';

  return (
    <Box>
      <PageHeader
        title={store.name}
        subtitle={`${store.store_id} · ${cityName}${cantonCode ? `, ${cantonCode}` : ''}`}
      />
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={t('tabs.details')} />
          <Tab label={t('tabs.overview')} />
          <Tab label={t('tabs.staff')} />
          <Tab label={t('tabs.inventory')} />
        </Tabs>
      </Box>

      {/* ── Tab 0: Edit form ── */}
      {tab === 0 && (
        <Box sx={{ maxWidth: 900 }}>
          <StoreForm
            defaultValues={store}
            cantons={cantonsData?.data ?? []}
            cities={citiesData?.data ?? []}
            onSubmit={handleSubmit}
            isLoading={isUpdating}
            onCancel={() => navigate('/stores')}
          />
        </Box>
      )}

      {/* ── Tab 1: Overview info card ── */}
      {tab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title={t('detail.info_card')} />
              <CardContent>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('detail.store_id_label')}</Typography>
                    <Typography variant="body2">{store.store_id}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('detail.format_label')}</Typography>
                    <Chip label={store.format?.toUpperCase()} size="small" variant="outlined" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('detail.address_label')}</Typography>
                    <Typography variant="body2" align="right">
                      {store.street} {store.street_number}, {store.postal_code} {cityName}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('detail.phone_label')}</Typography>
                    <Typography variant="body2">{store.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('detail.email_label')}</Typography>
                    <Typography variant="body2">{store.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">{t('detail.status_label')}</Typography>
                    <Chip label={store.is_active ? t('detail.active') : t('detail.inactive')} size="small" color={store.is_active ? 'success' : 'default'} />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ── Tab 2: Staff ── */}
      {tab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setStaffDialogOpen(true)}
            >
              {t('staff_section.assign_btn')}
            </Button>
          </Box>
          <Card>
            <CardContent sx={{ p: 0 }}>
              {currentStaff.length === 0 ? (
                <Typography color="text.secondary" sx={{ p: 3 }}>
                  {t('staff_section.empty')}
                </Typography>
              ) : (
                <List disablePadding>
                  {currentStaff.map((member, idx) => (
                    <ListItem
                      key={member._id}
                      divider={idx < currentStaff.length - 1}
                      secondaryAction={
                        <Tooltip title={t('staff_section.remove_btn')}>
                          <IconButton size="small" color="error" onClick={() => handleRemoveStaff(member._id)}>
                            <PersonRemoveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                          {member.first_name[0]}{member.last_name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${member.first_name} ${member.last_name}`}
                        secondary={
                          <Box component="span" sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                            <span>{member.email}</span>
                            {member.roles?.map((r) => (
                              <Chip key={r._id} label={r.name} size="small" variant="outlined" sx={{ fontSize: 10, height: 18 }} />
                            ))}
                          </Box>
                        }
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                        secondaryTypographyProps={{ component: 'span' }}
                      />
                      <Chip
                        label={member.is_active ? t('detail.active') : t('detail.inactive')}
                        size="small"
                        color={member.is_active ? 'success' : 'default'}
                        sx={{ mr: 4 }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>

          <StaffAssignmentDialog
            open={staffDialogOpen}
            onClose={() => setStaffDialogOpen(false)}
            storeId={id ?? ''}
            currentStaff={currentStaff}
            onSuccess={() => {
              success(t('staff_section.assigned'));
              refetchStaff();
            }}
          />
        </Box>
      )}

      {/* ── Tab 3: Inventory ── */}
      {tab === 3 && id && (
        <StoreInventoryTable storeId={id} />
      )}
    </Box>
  );
}


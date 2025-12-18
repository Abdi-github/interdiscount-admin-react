import { useState, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, InputAdornment, Box, Typography,
  List, ListItem, ListItemAvatar, ListItemText, Avatar,
  Checkbox, Chip, CircularProgress, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import { useTranslation } from 'react-i18next';
import { useNotification } from '@/shared/hooks/useNotification';
import { useGetUsersQuery } from '@/features/users/users.api';
import { useAssignStoreStaffMutation } from '../stores.api';
import type { StoreStaff } from '../stores.types';

interface StaffAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  storeId: string;
  currentStaff: StoreStaff[];
  onSuccess: () => void;
}

export function StaffAssignmentDialog({
  open, onClose, storeId, currentStaff, onSuccess,
}: StaffAssignmentDialogProps) {
  const { t } = useTranslation('stores');
  const { t: tc } = useTranslation('common');
  const { error: notifyError } = useNotification();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    currentStaff.map((s) => s._id)
  );

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery(
    { search: search || undefined, limit: 50 },
    { skip: !open }
  );
  const [assignStaff, { isLoading: isSaving }] = useAssignStoreStaffMutation();

  const users = usersData?.data ?? [];

  const handleToggle = (userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = async () => {
    try {
      await assignStaff({ id: storeId, user_ids: selectedIds }).unwrap();
      onSuccess();
      onClose();
    } catch {
      notifyError(tc('errors.generic'));
    }
  };

  const currentStaffIds = useMemo(() => new Set(currentStaff.map((s) => s._id)), [currentStaff]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('assign_dialog.title')}</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        {/* Current Staff */}
        {currentStaff.length > 0 && (
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography variant="overline" color="text.secondary">
              {t('assign_dialog.current_title')}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
              {currentStaff.map((s) => (
                <Chip
                  key={s._id}
                  label={`${s.first_name} ${s.last_name}`}
                  size="small"
                  variant="outlined"
                  color={selectedIds.includes(s._id) ? 'primary' : 'default'}
                  onDelete={() => handleToggle(s._id)}
                />
              ))}
            </Box>
          </Box>
        )}
        <Divider />
        {/* Search + User List */}
        <Box sx={{ px: 2, pt: 2 }}>
          <Typography variant="overline" color="text.secondary">
            {t('assign_dialog.available_title')}
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder={t('assign_dialog.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mt: 1, mb: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        {usersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : users.length === 0 ? (
          <Typography color="text.secondary" sx={{ px: 2, pb: 2, fontSize: 14 }}>
            {t('assign_dialog.empty_available')}
          </Typography>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {users.map((user) => {
              const isSelected = selectedIds.includes(user._id);
              const isCurrent = currentStaffIds.has(user._id);
              return (
                <ListItem
                  key={user._id}
                  secondaryAction={<Checkbox edge="end" checked={isSelected} onChange={() => handleToggle(user._id)} />}
                  sx={{ '&:hover': { bgcolor: 'action.hover' }, cursor: 'pointer' }}
                  onClick={() => handleToggle(user._id)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: isCurrent ? 'primary.main' : 'action.selected' }}>
                      <PersonIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.first_name} ${user.last_name}`}
                    secondary={user.email}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{tc('cancel')}</Button>
        <Button variant="contained" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <CircularProgress size={18} /> : t('assign_dialog.save_btn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NAV_ITEMS, type NavItem } from './SidebarNavItems';
import { useAuth } from '@/shared/hooks/useAuth';
import { DRAWER_WIDTH, INTERDISCOUNT_RED } from '@/styles/theme';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  selectSidebarOpen,
  selectMobileSidebarOpen,
  setMobileSidebarOpen,
} from '@/shared/state/uiSlice';

interface SidebarProps {
  variant?: 'permanent' | 'temporary';
}

function NavItemRow({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { t } = useTranslation('common');
  const label = t(item.labelKey);
  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      <Tooltip title={collapsed ? label : ''} placement="right">
        <ListItemButton
          component={NavLink}
          to={item.to ?? '/'}
          sx={{
            minHeight: 44,
            px: collapsed ? 1.5 : 2,
            justifyContent: collapsed ? 'center' : 'flex-start',
            borderRadius: 1.5,
            mx: 1,
            mb: 0.25,
            '&.active': {
              bgcolor: `${INTERDISCOUNT_RED}18`,
              color: 'primary.main',
              '& .MuiListItemIcon-root': { color: 'primary.main' },
              fontWeight: 600,
            },
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: collapsed ? 'unset' : 36,
              mr: collapsed ? 0 : 1,
              color: 'text.secondary',
            }}
          >
            <item.icon fontSize="small" />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={label}
              primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
}

export function Sidebar(_props: SidebarProps) {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const mobileSidebarOpen = useAppSelector(selectMobileSidebarOpen);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  const collapsed = !isMobile && !sidebarOpen;

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || (user ? item.roles.includes(user.user_type) : false)
  );

  const DrawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          minHeight: 64,
        }}
      >
        {collapsed ? (
          <Box
            sx={{
              width: 32,
              height: 32,
              bgcolor: INTERDISCOUNT_RED,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Typography variant="body1" fontWeight={900} color="#fff">
              i
            </Typography>
          </Box>
        ) : (
          <Box component="img" src="/logo.svg" alt="Interdiscount" sx={{ height: 36 }} />
        )}
      </Box>

      <Divider />

      {/* Nav items */}
      <List sx={{ flex: 1, pt: 1, overflow: 'auto' }}>
        {visibleItems.map((item) => (
          <Box key={item.id}>
            {item.dividerBefore && <Divider sx={{ my: 1 }} />}
            <NavItemRow item={item} collapsed={collapsed} />
          </Box>
        ))}
      </List>

      <Divider />
      {/* User info at bottom */}
      {!collapsed && user && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="caption" display="block" color="text.disabled" noWrap>
            {user.user_type}
          </Typography>
        </Box>
      )}
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileSidebarOpen}
        onClose={() => dispatch(setMobileSidebarOpen(false))}
        ModalProps={{ keepMounted: true }}
        sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {DrawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: collapsed ? 64 : DRAWER_WIDTH,
        flexShrink: 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        '& .MuiDrawer-paper': {
          width: collapsed ? 64 : DRAWER_WIDTH,
          overflow: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        },
      }}
    >
      {DrawerContent}
    </Drawer>
  );
}

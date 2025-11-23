import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  useMediaQuery,
  useTheme,
  ListItemIcon,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import LanguageIcon from '@mui/icons-material/Language';
import CheckIcon from '@mui/icons-material/Check';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '@/shared/components/ThemeToggle';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import {
  toggleSidebar,
  toggleMobileSidebar,
  selectSidebarOpen,
  setLocale,
  selectLocale,
} from '@/shared/state/uiSlice';
import { logout } from '@/shared/state/authSlice';
import { useAuth } from '@/shared/hooks/useAuth';
import { DRAWER_WIDTH } from '@/styles/theme';
import type { AppLocale } from '@/shared/types/common.types';

const LANGUAGES: { code: AppLocale; label: string; flag: string }[] = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export function AdminAppBar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const sidebarOpen = useAppSelector(selectSidebarOpen);
  const currentLocale = useAppSelector(selectLocale);
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);

  const handleToggle = () => {
    if (isMobile) dispatch(toggleMobileSidebar());
    else dispatch(toggleSidebar());
  };

  const handleLogout = () => {
    setAnchorEl(null);
    dispatch(logout());
    navigate('/auth/login', { replace: true });
  };

  const handleLanguageChange = (code: AppLocale) => {
    dispatch(setLocale(code));
    i18n.changeLanguage(code);
    setLangAnchorEl(null);
  };

  const initials =
    user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase() : 'U';

  return (
    <MuiAppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (t) => t.zIndex.drawer + 1,
        ml: { md: sidebarOpen ? `${DRAWER_WIDTH}px` : '64px' },
        width: { md: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 64}px)` },
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar>
        <IconButton onClick={handleToggle} edge="start" sx={{ mr: 2 }} aria-label="Menü">
          {!isMobile && sidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
        </IconButton>

        <Box sx={{ flex: 1 }} />

        {/* Language switcher */}
        <Tooltip title="Sprache wechseln">
          <IconButton onClick={(e) => setLangAnchorEl(e.currentTarget)} sx={{ mr: 0.5 }}>
            <LanguageIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={langAnchorEl}
          open={Boolean(langAnchorEl)}
          onClose={() => setLangAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{ paper: { sx: { minWidth: 160 } } }}
        >
          {LANGUAGES.map((lang) => (
            <MenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              selected={lang.code === currentLocale}
            >
              <ListItemIcon sx={{ minWidth: 32, fontSize: '1.1rem' }}>{lang.flag}</ListItemIcon>
              <Typography variant="body2">{lang.label}</Typography>
              {lang.code === currentLocale && (
                <CheckIcon fontSize="small" sx={{ ml: 'auto', color: 'primary.main' }} />
              )}
            </MenuItem>
          ))}
        </Menu>

        <ThemeToggle />

        <Tooltip title="Konto">
          <IconButton
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ ml: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}>
              {initials}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {user && (
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2">
                {user.first_name} {user.last_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          )}
          <Divider />
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/settings');
            }}
          >
            <PersonIcon fontSize="small" sx={{ mr: 1.5 }} />
            Einstellungen
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
            Abmelden
          </MenuItem>
        </Menu>
      </Toolbar>
    </MuiAppBar>
  );
}

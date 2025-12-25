import { IconButton, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleColorMode, selectColorMode } from '@/shared/state/uiSlice';

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const colorMode = useAppSelector(selectColorMode);

  return (
    <Tooltip title={colorMode === 'light' ? 'Dunkles Design' : 'Helles Design'}>
      <IconButton onClick={() => dispatch(toggleColorMode())} color="inherit">
        {colorMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

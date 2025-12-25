import { Box, InputAdornment, TextField, IconButton, Tooltip } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useTranslation } from 'react-i18next';

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onFilterClick?: () => void;
  onExportClick?: () => void;
  actions?: React.ReactNode;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  onFilterClick,
  onExportClick,
  actions,
}: DataTableToolbarProps) {
  const { t } = useTranslation('common');
  const placeholder = searchPlaceholder ?? t('actions.search');
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      <TextField
        size="small"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ minWidth: 260 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: searchValue ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearchChange('')}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {onFilterClick && (
        <Tooltip title="Filter">
          <IconButton onClick={onFilterClick} size="small">
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}

      {onExportClick && (
        <Tooltip title="Exportieren">
          <IconButton onClick={onExportClick} size="small">
            <FileDownloadIcon />
          </IconButton>
        </Tooltip>
      )}

      <Box sx={{ flex: 1 }} />
      {actions}
    </Box>
  );
}

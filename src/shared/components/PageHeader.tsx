import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import type { BreadcrumbItem } from '@/shared/types/common.types';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  /** Pass any ReactNode — typically a Button or Stack of Buttons */
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
      }}
    >
      <Box sx={{ flex: 1 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 0.5 }}
          >
            {breadcrumbs.map((crumb, idx) =>
              crumb.to ? (
                <Link
                  key={idx}
                  component={RouterLink}
                  to={crumb.to}
                  underline="hover"
                  color="inherit"
                  sx={{ fontSize: '0.8rem' }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={idx} sx={{ fontSize: '0.8rem' }} color="text.primary">
                  {crumb.label}
                </Typography>
              )
            )}
          </Breadcrumbs>
        )}
        <Typography variant="h5">{title}</Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>

      {actions && (
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}

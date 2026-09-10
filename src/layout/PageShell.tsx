import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { themeColors } from '../theme/themeColors';

interface PageShellProps {
  breadcrumbs: string[];
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ breadcrumbs, title, subtitle, actions, children }: PageShellProps) {
  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.25,
          borderBottom: `1px solid ${themeColors.border}`,
          bgcolor: themeColors.surface,
        }}
      >
        <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 16 }} />}>
          {breadcrumbs.map((crumb, i) => (
            <Typography
              key={crumb}
              variant="body2"
              sx={{
                fontSize: 12.5,
                color: i === breadcrumbs.length - 1 ? themeColors.textPrimary : themeColors.textSecondary,
                fontWeight: i === breadcrumbs.length - 1 ? 700 : 400,
              }}
            >
              {crumb}
            </Typography>
          ))}
        </Breadcrumbs>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Chip
            size="small"
            icon={<FiberManualRecordIcon sx={{ fontSize: '8px !important', color: `${themeColors.primary} !important` }} />}
            label="KHI · Pakistan"
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              bgcolor: themeColors.pageBackground,
              border: `1px solid ${themeColors.border}`,
              fontSize: 11.5,
              fontWeight: 600,
              color: themeColors.textSecondary,
              height: 26,
            }}
          />
          <Avatar sx={{ bgcolor: themeColors.primary, width: 30, height: 30, fontSize: 12, fontWeight: 700 }}>SC</Avatar>
        </Box>
      </Box>
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: themeColors.textPrimary, lineHeight: 1.25 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: themeColors.textSecondary, fontSize: 13, mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
        </Box>
        {children}
      </Box>
    </Box>
  );
}

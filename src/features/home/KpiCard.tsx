import { ReactNode } from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface KpiCardProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
  hint?: string;
  hintColor?: string;
}

export function KpiCard({ icon, iconBg, label, value, hint, hintColor }: KpiCardProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start', height: '100%' }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.3 }}>
          {label.toUpperCase()}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          {value}
        </Typography>
        {hint && (
          <Typography variant="caption" sx={{ color: hintColor ?? 'text.secondary' }}>
            {hint}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

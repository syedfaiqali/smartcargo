import { ReactNode } from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { themeColors } from '../theme/themeColors';

export function FormRow({ children }: { children: ReactNode }) {
  return (
    <Grid container spacing={1.5} sx={{ mb: 1.5 }} alignItems="flex-start">
      {children}
    </Grid>
  );
}

export function FormField({ xs = 12, sm = 6, md = 4, children }: { xs?: number; sm?: number; md?: number; children: ReactNode }) {
  return (
    <Grid item xs={xs} sm={sm} md={md}>
      {children}
    </Grid>
  );
}

export function SectionHeader({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: `${themeColors.primary}14`,
        px: 1.5,
        py: 0.5,
        mt: 2,
        mb: 1.5,
        borderRadius: 0.5,
        border: `1px solid ${themeColors.primaryLight}`,
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {children}
      </Typography>
    </Box>
  );
}

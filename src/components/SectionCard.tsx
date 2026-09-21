import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { navyTrustColors, navyTrustHeadingFontFamily } from '../theme/navyTrustTheme';

interface SectionCardProps {
  number: string;
  title: string;
  /** Small right-aligned meta text in the card header, e.g. an ID badge. */
  meta?: ReactNode;
  children: ReactNode;
}

/** A bordered white card with a numbered, uppercase navy header — the "1.1 PRIMARY IDENTIFIERS" style block. */
export function SectionCard({ number, title, meta, children }: SectionCardProps) {
  return (
    <Box
      sx={{
        bgcolor: navyTrustColors.surface,
        border: `1px solid ${navyTrustColors.border}`,
        borderRadius: '12px',
        overflow: 'hidden',
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: navyTrustColors.navy,
          borderBottom: `1px solid ${navyTrustColors.navyDark}`,
          px: 2,
          py: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: navyTrustHeadingFontFamily,
            fontSize: 12.5,
            fontWeight: 700,
            letterSpacing: 0.4,
            color: '#ffffff',
            textTransform: 'uppercase',
          }}
        >
          {number} {title}
        </Typography>
        {meta && (
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#ffd782', letterSpacing: 0.3 }}>
            {meta}
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Box>
  );
}

export function SectionCardRow({ children }: { children: ReactNode }) {
  return (
    <Grid container spacing={1.5} sx={{ mb: 1.5 }} alignItems="flex-start">
      {children}
    </Grid>
  );
}

export function SectionCardField({ xs = 12, sm = 6, md = 4, children }: { xs?: number; sm?: number; md?: number; children: ReactNode }) {
  return (
    <Grid item xs={xs} sm={sm} md={md}>
      {children}
    </Grid>
  );
}

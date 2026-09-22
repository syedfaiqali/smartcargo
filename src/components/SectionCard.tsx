import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { navyTrustColors, navyTrustHeadingFontFamily, sectionTints, SectionTint } from '../theme/navyTrustTheme';

interface SectionCardProps {
  number: string;
  title: string;
  /** Pastel tint for this section's header band — different areas of a form read as distinct. */
  tint?: SectionTint;
  /** Small right-aligned meta text/action in the card header, e.g. an ID badge or "+ Add line". */
  meta?: ReactNode;
  children: ReactNode;
}

/** A bordered white card with a numbered, pastel-tinted header — the "1.1 Primary identifiers" style block. */
export function SectionCard({ number, title, tint = 'blue', meta, children }: SectionCardProps) {
  const colors = sectionTints[tint];
  return (
    <Box
      sx={{
        bgcolor: navyTrustColors.surface,
        border: `1px solid ${navyTrustColors.border}`,
        borderRadius: '14px',
        overflow: 'hidden',
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: colors.header,
          px: 2,
          py: 1.25,
        }}
      >
        <Typography
          sx={{
            fontFamily: navyTrustHeadingFontFamily,
            fontSize: 13.5,
            fontWeight: 700,
            color: colors.text,
          }}
        >
          <Box component="span" sx={{ opacity: 0.75, mr: 0.75 }}>{number}</Box>
          {title}
        </Typography>
        {meta && (
          <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: navyTrustColors.textSecondary, letterSpacing: 0.2 }}>
            {meta}
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 2.25 }}>{children}</Box>
    </Box>
  );
}

export function SectionCardRow({ children }: { children: ReactNode }) {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-start">
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

import { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import { navyTrustHeadingFontFamily } from '../theme/navyTrustTheme';

interface FinancialsSummaryCardProps {
  title: string;
  /** Regular line items, e.g. Freight, Commission, Tax. */
  rows: { label: string; value: string }[];
  /** The large highlighted total at the bottom. */
  totalLabel: string;
  totalValue: string;
  icon?: ReactNode;
}

/** Dark full-bleed summary card for money totals — the "Shipment Financials" block. */
export function FinancialsSummaryCard({ title, rows, totalLabel, totalValue, icon }: FinancialsSummaryCardProps) {
  return (
    <Box
      sx={{
        bgcolor: '#0f1c33',
        borderRadius: '14px',
        p: 2.5,
        mb: 2,
        color: '#e6ebf5',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: '8px',
            bgcolor: 'rgba(255,255,255,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7fb2ff',
          }}
        >
          {icon ?? <PaidOutlinedIcon sx={{ fontSize: 16 }} />}
        </Box>
        <Typography sx={{ fontFamily: navyTrustHeadingFontFamily, fontSize: 13.5, fontWeight: 700, color: '#fff' }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {rows.map((row) => (
          <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <Typography sx={{ fontSize: 13, color: 'rgba(230,235,245,0.7)' }}>{row.label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#e6ebf5' }}>{row.value}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.12)', mt: 2, pt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#e6ebf5' }}>{totalLabel}</Typography>
        <Typography sx={{ fontFamily: navyTrustHeadingFontFamily, fontSize: 20, fontWeight: 800, color: '#5fd0ff' }}>
          {totalValue}
        </Typography>
      </Box>
    </Box>
  );
}

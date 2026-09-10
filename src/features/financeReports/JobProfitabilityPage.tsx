import { useMemo } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { getJobProfitability } from '../../data/financeReportsService';

const KIND_LABEL: Record<string, string> = {
  AIR_MAWB: 'Air Export (MAWB)',
  AIR_HAWB: 'Air Export (HAWB)',
  SEA: 'Sea Export',
};

export function JobProfitabilityPage() {
  const rows = useMemo(() => getJobProfitability(), []);
  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalCost = rows.reduce((s, r) => s + r.cost, 0);

  return (
    <PageShell breadcrumbs={['Finance', 'Reports (Finance)', 'Job Profitability']} title="Job Profitability Report">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Revenue is the job's finalized freight/charge total; Cost is linked Other Charges Payable (plus Sea Export
        buy charges). Only finalized jobs are included.
      </Typography>

      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Job No.</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Cost</TableCell>
              <TableCell>Profit</TableCell>
              <TableCell>Margin %</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No finalized jobs yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell>{r.jobNo}</TableCell>
                  <TableCell>
                    <Chip size="small" label={KIND_LABEL[r.jobKind]} variant="outlined" />
                  </TableCell>
                  <TableCell>{r.partyName}</TableCell>
                  <TableCell>{r.revenue.toFixed(2)}</TableCell>
                  <TableCell>{r.cost.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: r.profit >= 0 ? 'success.main' : 'error.main' }}>{r.profit.toFixed(2)}</TableCell>
                  <TableCell>{r.revenue ? ((r.profit / r.revenue) * 100).toFixed(1) : '0.0'}%</TableCell>
                </TableRow>
              ))
            )}
            {rows.length > 0 && (
              <TableRow>
                <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                  Total
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{totalRevenue.toFixed(2)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{totalCost.toFixed(2)}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{(totalRevenue - totalCost).toFixed(2)}</TableCell>
                <TableCell />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </PageShell>
  );
}

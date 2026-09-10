import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { AgingRow, getApAging, getArAging } from '../../data/financeReportsService';

interface AgingReportPageProps {
  kind: 'AR' | 'AP';
}

const BUCKET_COLOR: Record<AgingRow['bucket'], 'success' | 'warning' | 'error' | 'default'> = {
  '0-30': 'success',
  '31-60': 'warning',
  '61-90': 'warning',
  '90+': 'error',
};

export function AgingReportPage({ kind }: AgingReportPageProps) {
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().slice(0, 10));
  const rows = useMemo(() => (kind === 'AR' ? getArAging(asOfDate) : getApAging(asOfDate)), [kind, asOfDate]);

  const bucketTotals = rows.reduce<Record<AgingRow['bucket'], number>>(
    (acc, r) => ({ ...acc, [r.bucket]: acc[r.bucket] + r.balance }),
    { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }
  );
  const grandTotal = rows.reduce((sum, r) => sum + r.balance, 0);

  return (
    <PageShell breadcrumbs={['Finance', 'Reports (Finance)', kind === 'AR' ? 'AR Aging' : 'AP Aging']} title={kind === 'AR' ? 'AR Aging Report' : 'AP Aging Report'}>
      <Box sx={{ mb: 2, maxWidth: 260 }}>
        <TextField label="As Of Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={asOfDate} onChange={(e) => setAsOfDate(e.target.value)} />
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {(['0-30', '31-60', '61-90', '90+'] as const).map((bucket) => (
          <Grid item xs={6} sm={3} key={bucket}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                {bucket} days
              </Typography>
              <Typography variant="h6" color={`${BUCKET_COLOR[bucket]}.main`}>
                {bucketTotals[bucket].toFixed(2)}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Doc No.</TableCell>
              <TableCell>Job No.</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Doc Date</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Bucket</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No outstanding {kind === 'AR' ? 'receivables' : 'payables'} as of this date.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell>{r.docNo}</TableCell>
                  <TableCell>{r.jobNo}</TableCell>
                  <TableCell>{r.partyName || r.partyCode}</TableCell>
                  <TableCell>{r.docDate}</TableCell>
                  <TableCell>{r.totalAmount.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{r.balance.toFixed(2)}</TableCell>
                  <TableCell>{r.daysOutstanding}</TableCell>
                  <TableCell>
                    <Chip size="small" label={r.bucket} color={BUCKET_COLOR[r.bucket]} />
                  </TableCell>
                </TableRow>
              ))
            )}
            {rows.length > 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ fontWeight: 700 }}>
                  Grand Total
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{grandTotal.toFixed(2)}</TableCell>
                <TableCell colSpan={2} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </PageShell>
  );
}

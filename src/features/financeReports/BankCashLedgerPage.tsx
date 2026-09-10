import { useMemo } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { PageShell } from '../../layout/PageShell';
import { getBankCashLedger } from '../../data/financeReportsService';

export function BankCashLedgerPage() {
  const entries = useMemo(() => getBankCashLedger(), []);

  let runningBalance = 0;
  const withBalance = entries.map((e) => {
    runningBalance += e.kind === 'RECEIPT' ? e.amount : -e.amount;
    return { ...e, runningBalance };
  });

  const totalReceipts = entries.filter((e) => e.kind === 'RECEIPT').reduce((s, e) => s + e.amount, 0);
  const totalPayments = entries.filter((e) => e.kind === 'PAYMENT').reduce((s, e) => s + e.amount, 0);

  return (
    <PageShell breadcrumbs={['Finance', 'Reports (Finance)', 'Bank/Cash Ledger']} title="Bank/Cash Ledger">
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Total Receipts (Inflow)
            </Typography>
            <Typography variant="h6" color="success.main">
              {totalReceipts.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Total Payments (Outflow)
            </Typography>
            <Typography variant="h6" color="error.main">
              {totalPayments.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Net Balance
            </Typography>
            <Typography variant="h6" color="primary.main">
              {(totalReceipts - totalPayments).toFixed(2)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Voucher No.</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Bank/Cash</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Inflow</TableCell>
              <TableCell>Outflow</TableCell>
              <TableCell>Running Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {withBalance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No finalized Receipt/Payment vouchers yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              withBalance.map((e, i) => (
                <TableRow key={i} hover>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.voucherNo}</TableCell>
                  <TableCell>
                    <Chip size="small" label={e.kind} color={e.kind === 'RECEIPT' ? 'success' : 'error'} variant="outlined" />
                  </TableCell>
                  <TableCell>{e.bankCode}</TableCell>
                  <TableCell>{e.partyName}</TableCell>
                  <TableCell>{e.kind === 'RECEIPT' ? e.amount.toFixed(2) : ''}</TableCell>
                  <TableCell>{e.kind === 'PAYMENT' ? e.amount.toFixed(2) : ''}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{e.runningBalance.toFixed(2)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </PageShell>
  );
}

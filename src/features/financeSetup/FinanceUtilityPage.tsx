import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';

type UtilityKind = 'post-dated-cheques' | 'cheque-book' | 'bank-reconciliation';

const content: Record<UtilityKind, { title: string; description: string; fields: string[] }> = {
  'post-dated-cheques': {
    title: 'Post Dated Cheques Received',
    description: 'Record and track cheques received from customers before their deposit date.',
    fields: ['Cheque No.', 'Cheque Date', 'Bank', 'Received From', 'Amount'],
  },
  'cheque-book': {
    title: 'Cheque Book',
    description: 'Maintain cheque-book ranges for each bank account and monitor issued cheques.',
    fields: ['Bank', 'Cheque Book No.', 'Starting Cheque No.', 'Ending Cheque No.', 'Current Cheque No.'],
  },
  'bank-reconciliation': {
    title: 'Bank Reconciliation',
    description: 'Reconcile the system bank balance against a bank statement for a selected period.',
    fields: ['Bank', 'Statement Date', 'Statement Balance', 'System Balance', 'Remarks'],
  },
};

export function FinanceUtilityPage({ kind }: { kind: UtilityKind }) {
  const config = content[kind];
  const [started, setStarted] = useState(false);

  return (
    <PageShell breadcrumbs={['Finance', config.title]} title={config.title}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{config.description}</Typography>
      {!started ? (
        <Alert severity="info" action={<Button color="inherit" size="small" onClick={() => setStarted(true)}>NEW</Button>}>
          Click NEW to create a {config.title.toLowerCase()} record.
        </Alert>
      ) : (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {config.fields.map((field) => (
              <Grid item xs={12} md={field === 'Remarks' ? 12 : 6} key={field}>
                <TextField label={field} fullWidth type={field.includes('Date') ? 'date' : field === 'Amount' || field.includes('Balance') ? 'number' : 'text'} InputLabelProps={field.includes('Date') ? { shrink: true } : undefined} multiline={field === 'Remarks'} minRows={field === 'Remarks' ? 2 : undefined} />
              </Grid>
            ))}
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button variant="contained">Save</Button>
            <Button variant="outlined" onClick={() => setStarted(false)}>Cancel</Button>
          </Box>
        </Paper>
      )}
    </PageShell>
  );
}

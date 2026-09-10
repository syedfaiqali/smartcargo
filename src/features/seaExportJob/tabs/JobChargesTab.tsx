import { v4 as uuid } from 'uuid';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormRow, FormField, SectionHeader } from '../../../components/FormGrid';
import { SeaExportJob } from '../../../domain/seaExportJob';
import { currencyRepo } from '../../../data/masterDataService';
import { recomputeJobChargesTotals } from '../seaJobCalculations';

interface JobChargesTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

export function JobChargesTab({ job, editable, onChange }: JobChargesTabProps) {
  const currencies = currencyRepo.list();
  const jc = job.jobCharges;

  const apply = (patch: Partial<SeaExportJob['jobCharges']>) => onChange(recomputeJobChargesTotals({ ...job, jobCharges: { ...jc, ...patch } }));

  const addLine = () => {
    apply({ lines: [...jc.lines, { id: uuid(), code: '', description: '', curr: jc.currencies[0]?.curr || 'USD', sellFAmount: 0, buyFAmount: 0 }] });
  };
  const updateLine = (id: string, patch: Partial<SeaExportJob['jobCharges']['lines'][number]>) => {
    apply({ lines: jc.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeLine = (id: string) => apply({ lines: jc.lines.filter((l) => l.id !== id) });

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <SectionHeader>Currencies</SectionHeader>
          {jc.currencies.map((c, i) => (
            <FormRow key={i}>
              <FormField md={6}>
                <TextField
                  select
                  label={`Curr ${i + 1}`}
                  fullWidth
                  value={c.curr}
                  disabled={!editable}
                  onChange={(e) => {
                    const currencies = [...jc.currencies];
                    currencies[i] = { ...c, curr: e.target.value };
                    apply({ currencies });
                  }}
                >
                  <MenuItem value="">(none)</MenuItem>
                  {currencies.map((cur) => (
                    <MenuItem key={cur.code} value={cur.code}>
                      {cur.code}
                    </MenuItem>
                  ))}
                </TextField>
              </FormField>
              <FormField md={6}>
                <TextField
                  label="Ex.Rate"
                  type="number"
                  fullWidth
                  value={c.exRate}
                  disabled={!editable}
                  onChange={(e) => {
                    const currencies = [...jc.currencies];
                    currencies[i] = { ...c, exRate: Number(e.target.value) };
                    apply({ currencies });
                  }}
                />
              </FormField>
            </FormRow>
          ))}

          <SectionHeader>Context (from Job)</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField label="Party Code" fullWidth value={job.partyCode} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Sub Agent Code" fullWidth value={job.subAgentParty} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Port of Load" fullWidth value={job.portOfLoad} disabled />
            </FormField>
            <FormField md={6}>
              <TextField label="Destination" fullWidth value={job.destination} disabled />
            </FormField>
          </FormRow>
        </Grid>

        <Grid item xs={12} md={8}>
          <SectionHeader>Other Charges</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Curr</TableCell>
                  <TableCell>Sell F/Amount</TableCell>
                  <TableCell>Buy F/Amount</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {jc.lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={line.code} disabled={!editable} onChange={(e) => updateLine(line.id, { code: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <TextField variant="standard" value={line.description} disabled={!editable} onChange={(e) => updateLine(line.id, { description: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" value={line.curr} disabled={!editable} onChange={(e) => updateLine(line.id, { curr: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" type="number" value={line.sellFAmount} disabled={!editable} onChange={(e) => updateLine(line.id, { sellFAmount: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" type="number" value={line.buyFAmount} disabled={!editable} onChange={(e) => updateLine(line.id, { buyFAmount: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                    Total Charges
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{jc.totalSellCharges.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{jc.totalBuyCharges.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addLine} sx={{ m: 1 }}>
              Add Charge Line
            </Button>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, maxWidth: 360 }}>
            <Grid container spacing={1}>
              <Grid item xs={7}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Total G/P Amount
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body2" align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {jc.totalGpAmount.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={7}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Total G/P Less KB
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body2" align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {jc.totalGpLessKb.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Alert severity="warning" sx={{ mt: 2 }}>
            "K.B." business meaning is not confirmed for Sea Export (docs Section 12.10, same open question as Air
            Export) — Total G/P Less KB currently equals Total G/P Amount with no adjustment applied.
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}

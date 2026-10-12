import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { FormField, FormRow } from '../../../components/FormGrid';
import { WorkflowSection } from '../../../components/WorkflowSection';
import { chargeableRepo, currencyRepo } from '../../../data/masterDataService';
import { SeaExportJob } from '../../../domain/seaExportJob';
import { recomputeJobChargesTotals } from '../seaJobCalculations';

interface JobChargesTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

const money = (value: number) => (Number.isFinite(value) ? value : 0).toFixed(2);

export function JobChargesTab({ job, editable, onChange }: JobChargesTabProps) {
  const [openSections, setOpenSections] = useState({ currencies: true, context: true, charges: true, profit: true });
  const currencies = currencyRepo.list();
  const chargeCodes = chargeableRepo.list();
  const jc = job.jobCharges;
  const apply = (patch: Partial<SeaExportJob['jobCharges']>) =>
    onChange(recomputeJobChargesTotals({ ...job, jobCharges: { ...jc, ...patch } }));

  const addLine = () => apply({
    lines: [...jc.lines, {
      id: uuid(), code: '', description: '', curr: jc.currencies[0]?.curr || currencies[0]?.code || '',
      sellFAmount: 0, buyFAmount: 0,
    }],
  });
  const updateLine = (id: string, patch: Partial<SeaExportJob['jobCharges']['lines'][number]>) =>
    apply({ lines: jc.lines.map((line) => line.id === id ? { ...line, ...patch } : line) });
  const removeLine = (id: string) => apply({ lines: jc.lines.filter((line) => line.id !== id) });
  const rateFor = (code: string) => jc.currencies.find((currency) => currency.curr === code)?.exRate ?? 0;
  const toPkr = (amount: number, currency: string) => amount * rateFor(currency);
  const totalSellPkr = jc.lines.reduce((total, line) => total + toPkr(line.sellFAmount, line.curr), 0);
  const totalBuyPkr = jc.lines.reduce((total, line) => total + toPkr(line.buyFAmount, line.curr), 0);
  const totalGp = totalSellPkr - totalBuyPkr;
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));

  const context = [
    ['Party Code', job.partyCode ? `${job.partyCode}${job.partyName ? ` - ${job.partyName}` : ''}` : '—'],
    ["Sub Agent Code", job.subAgentParty || '—'],
    ['Port of Load', job.portOfLoad || '—'],
    ['Destination', job.destination || '—'],
  ];

  return (
    <Box>
      <WorkflowSection
        title="Currencies"
        subtitle="Set up to three charge currencies and their exchange rates"
        open={openSections.currencies}
        onToggle={() => toggleSection('currencies')}
      >
        <Grid container spacing={1.5}>
          {jc.currencies.map((currency, index) => (
            <Grid item xs={12} md={4} key={index}>
              <FormRow>
                <FormField md={7}>
                  <TextField select label={`Currency ${index + 1}`} fullWidth value={currency.curr} disabled={!editable}
                    onChange={(event) => {
                      const next = [...jc.currencies];
                      next[index] = { ...currency, curr: event.target.value };
                      apply({ currencies: next });
                    }}>
                    <MenuItem value="">Select Currency Code</MenuItem>
                    {currency.curr && !currencies.some((item) => item.code === currency.curr) && <MenuItem value={currency.curr}>{currency.curr}</MenuItem>}
                    {currencies.map((item) => <MenuItem key={item.code} value={item.code}>{item.code} — {item.name}</MenuItem>)}
                  </TextField>
                </FormField>
                <FormField md={5}>
                  <TextField label="Ex. Rate" type="number" fullWidth value={currency.exRate} disabled={!editable}
                    onChange={(event) => {
                      const next = [...jc.currencies];
                      next[index] = { ...currency, exRate: Number(event.target.value) };
                      apply({ currencies: next });
                    }} />
                </FormField>
              </FormRow>
            </Grid>
          ))}
        </Grid>
      </WorkflowSection>

      <WorkflowSection
        title="Job Context"
        subtitle="Read-only customer and route details from the job entry"
        open={openSections.context}
        onToggle={() => toggleSection('context')}
      >
        <Grid container spacing={1.5}>
          {context.map(([label, value]) => (
            <Grid item xs={12} sm={6} md={3} key={label}>
              <Typography variant="caption" color="text.secondary">{label}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{value}</Typography>
            </Grid>
          ))}
        </Grid>
      </WorkflowSection>

      <WorkflowSection
        title="Other Charges"
        subtitle="Select charge codes and enter sell and buy amounts in foreign currency"
        open={openSections.charges}
        onToggle={() => toggleSection('charges')}
      >
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 1.5 }}>
          <Button variant="contained" startIcon={<AddIcon />} disabled={!editable} onClick={addLine}>Add Charge</Button>
        </Stack>
        <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 1040, '& .MuiTableCell-root': { borderRight: '1px solid', borderColor: 'divider', whiteSpace: 'nowrap' } }}>
            <TableHead>
              <TableRow>
                <TableCell rowSpan={2}>Action</TableCell>
                <TableCell rowSpan={2}>Code</TableCell>
                <TableCell rowSpan={2}>Description</TableCell>
                <TableCell rowSpan={2}>Curr</TableCell>
                <TableCell colSpan={2} align="center">Sell</TableCell>
                <TableCell colSpan={2} align="center">Buy</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>F/Amount</TableCell><TableCell>PKR Amount</TableCell>
                <TableCell>F/Amount</TableCell><TableCell>PKR Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jc.lines.map((line) => {
                const sellPkr = toPkr(line.sellFAmount, line.curr);
                const buyPkr = toPkr(line.buyFAmount, line.curr);
                return (
                  <TableRow key={line.id} hover>
                    <TableCell>
                      <Button size="small" color="error" aria-label="Delete charge" disabled={!editable} onClick={() => removeLine(line.id)}><DeleteOutlineIcon fontSize="small" /></Button>
                    </TableCell>
                    <TableCell sx={{ minWidth: 150 }}>
                      <TextField select size="small" label="Code" value={line.code} disabled={!editable} onChange={(event) => {
                        const selected = chargeCodes.find((item) => item.code === event.target.value);
                        updateLine(line.id, { code: event.target.value, description: selected?.description || selected?.name || '' });
                      }}>
                        <MenuItem value="">Select Code</MenuItem>
                        {line.code && !chargeCodes.some((item) => item.code === line.code) && <MenuItem value={line.code}>{line.code}</MenuItem>}
                        {chargeCodes.map((item) => <MenuItem key={item.code} value={item.code}>{item.code} — {item.name}</MenuItem>)}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 220 }}><TextField size="small" fullWidth value={line.description} disabled={!editable} onChange={(event) => updateLine(line.id, { description: event.target.value })} /></TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField select size="small" label="Curr" value={line.curr} disabled={!editable} onChange={(event) => updateLine(line.id, { curr: event.target.value })}>
                        <MenuItem value="">Select</MenuItem>
                        {line.curr && !jc.currencies.some((item) => item.curr === line.curr) && <MenuItem value={line.curr}>{line.curr}</MenuItem>}
                        {jc.currencies.filter((item) => item.curr).map((item, index) => <MenuItem key={`${item.curr}-${index}`} value={item.curr}>{item.curr}</MenuItem>)}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 125 }}><TextField size="small" type="number" value={line.sellFAmount} disabled={!editable} onChange={(event) => updateLine(line.id, { sellFAmount: Number(event.target.value) })} /></TableCell>
                    <TableCell align="right">{money(sellPkr)}</TableCell>
                    <TableCell sx={{ minWidth: 125 }}><TextField size="small" type="number" value={line.buyFAmount} disabled={!editable} onChange={(event) => updateLine(line.id, { buyFAmount: Number(event.target.value) })} /></TableCell>
                    <TableCell align="right">{money(buyPkr)}</TableCell>
                  </TableRow>
                );
              })}
              {jc.lines.length === 0 && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 3 }}>No other charges added.</TableCell></TableRow>}
              <TableRow>
                <TableCell colSpan={5} sx={{ fontWeight: 700 }}>Total Charges (PKR)</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{money(totalSellPkr)}</TableCell>
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 700 }}>{money(totalBuyPkr)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </WorkflowSection>

      <WorkflowSection
        title="Profit Summary"
        subtitle="Calculated from sell and buy charge totals"
        open={openSections.profit}
        onToggle={() => toggleSection('profit')}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Total G/P Amount</Typography>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>{money(totalGp)}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="caption" color="text.secondary">Total G/P Less KB</Typography>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>{money(totalGp)}</Typography>
            </Paper>
          </Grid>
        </Grid>
      </WorkflowSection>
    </Box>
  );
}

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { Job, KbFreightLine, KbOtherChargeLine } from '../../../domain/job';
import { SectionCard } from '../../../components/SectionCard';
import { navyTrustColors } from '../../../theme/navyTrustTheme';
import { recomputeJobTotals } from '../jobCalculations';

interface KbTabProps {
  job: Job;
  editable: boolean;
  onChange: (job: Job) => void;
}

function recomputeKbLine(line: KbFreightLine, exRate: number, ownerCommPercent = 0): KbFreightLine {
  const totalFreight = line.rate * line.chargeWeight;
  const totalFreightPkr = line.ratePkr * line.chargeWeight;
  const agreedFreight = line.agreedRate * line.chargeWeight;
  const freightDifference = totalFreight - agreedFreight;
  const commissionDeduction = line.lessCommission === 'Y'
    ? totalFreight * (ownerCommPercent / 100)
    : 0;
  const kbFreight = freightDifference - commissionDeduction;
  // In the legacy screen a blank K.B. rate means 100%, so K.B. Amount
  // follows K.B. Freight until a rate percentage is entered.
  const kbAmount = line.kbRatePercent ? kbFreight * (line.kbRatePercent / 100) : kbFreight;
  return { ...line, totalFreight, totalFreightPkr, agreedFreight, freightDifference, kbFreight, kbFreightPkr: kbFreight * exRate, kbAmount, kbAmountPkr: kbAmount * exRate };
}

export function KbTab({ job, editable, onChange }: KbTabProps) {
  const entryDerivedLines = job.kb.lines.map((line, index) => {
    const entryLine = job.chargeLines[index];
    if (!entryLine) return recomputeKbLine(line, job.exRate, job.kb.ownerCommPercent);
    return recomputeKbLine({
      ...line,
      pcs: entryLine.pcs,
      cl: entryLine.cl,
      commodity: entryLine.comdty,
      grossWeight: entryLine.grossWt,
      chargeWeight: entryLine.chargeWt,
      rate: entryLine.rate,
      ratePkr: entryLine.ratePkr,
    }, job.exRate, job.kb.ownerCommPercent);
  });

  const applyKb = (nextKb: Job['kb']) => {
    const lines = nextKb.lines.map((line, index) => {
      const entryLine = job.chargeLines[index];
      return recomputeKbLine(entryLine ? {
        ...line,
        pcs: entryLine.pcs,
        cl: entryLine.cl,
        commodity: entryLine.comdty,
        grossWeight: entryLine.grossWt,
        chargeWeight: entryLine.chargeWt,
        rate: entryLine.rate,
        ratePkr: entryLine.ratePkr,
      } : line, job.exRate, nextKb.ownerCommPercent);
    });
    const totalKbAmount = lines.reduce((total, line) => total + line.kbAmount, 0);
    const totalOtherChargesPayable = nextKb.otherCharges.reduce((total, line) => total + (line.foreign || 0), 0);
    const totalOtherChargesPayablePkr = nextKb.otherCharges.reduce((total, line) => total + (line.pkr || 0), 0);
    const netPayable = job.totals.freight + job.totals.dueCarrier + job.totals.dueAgent - totalKbAmount - totalOtherChargesPayable;
    const netPayablePkr = job.totals.freightPkr + job.totals.dueCarrierPkr + job.totals.dueAgentPkr - lines.reduce((total, line) => total + line.kbAmountPkr, 0) - totalOtherChargesPayablePkr;
    const commissionBase = nextKb.ownerCommOnNet === 'Y' ? netPayable : job.totals.freight;
    const commission = commissionBase * (nextKb.ownerCommPercent / 100);
    const whtAmount = commission * (nextKb.ownerWhtPercent / 100);
    const updatedJob: Job = {
      ...job,
      kb: { ...nextKb, lines, totalOtherChargesPayable, totalOtherChargesPayablePkr, netPayable, netPayablePkr },
      totals: { ...job.totals, totalKbAmount, commission, whtAmount },
    };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  const updateLine = (id: string, patch: Partial<KbFreightLine>) => {
    applyKb({ ...job.kb, lines: job.kb.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)) });
  };

  return (
    <Box>
      <Alert severity="warning" sx={{ display: 'none' }}>
        "K.B." business meaning (rate-reconciliation / broker-commission calculation) should be confirmed with the
        business owner — see docs/screens-phase.md Section 2.10.
      </Alert>

      <Grid container spacing={1.5} alignItems="flex-start">
        <Grid item xs={12} md={8}>
      <SectionCard number="3.1" title="Line-wise Freight (Line No. 1–3)" tint="blue">
      <LegacyKbFreightGrid lines={entryDerivedLines} currency={job.currency} />
      <KbCalculationGrid lines={entryDerivedLines} currency={job.currency} exRate={job.exRate} editable={editable} onUpdate={updateLine} />
      <Paper variant="outlined" sx={{ display: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Line</TableCell>
              <TableCell>Pcs</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Commodity</TableCell>
              <TableCell>New Commodity</TableCell>
              <TableCell>Gross Wt.</TableCell>
              <TableCell>Charge Wt.</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Rate PKR</TableCell>
              <TableCell>Total Freight</TableCell>
              <TableCell>Comm. Y/N</TableCell>
              <TableCell>Net Rate Y/N</TableCell>
              <TableCell>Agreed Rate</TableCell>
              <TableCell>Agreed Freight</TableCell>
              <TableCell>Freight Diff.</TableCell>
              <TableCell>K.B. Freight</TableCell>
              <TableCell>Less: Comm. Y/N</TableCell>
              <TableCell>KB Rate %</TableCell>
              <TableCell>KB Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entryDerivedLines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>{line.lineNo}</TableCell>
                <TableCell sx={{ minWidth: 60 }}>
                  <TextField variant="standard" type="number" value={line.pcs} disabled />
                </TableCell>
                <TableCell sx={{ minWidth: 60 }}>
                  <TextField variant="standard" value={line.cl} disabled />
                </TableCell>
                <TableCell sx={{ minWidth: 90 }}>
                  <TextField variant="standard" value={line.commodity} disabled />
                </TableCell>
                <TableCell sx={{ minWidth: 90 }}>
                  <TextField variant="standard" value={line.newCommodity ?? ''} disabled={!editable} onChange={(e) => updateLine(line.id, { newCommodity: e.target.value })} />
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TextField variant="standard" type="number" value={line.grossWeight} disabled />
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TextField variant="standard" type="number" value={line.chargeWeight} disabled />
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TextField variant="standard" type="number" value={line.rate} disabled />
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TextField variant="standard" type="number" value={line.ratePkr} disabled />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 130 }}>{line.totalFreight.toFixed(2)} / {line.totalFreightPkr.toFixed(2)} PKR</TableCell>
                <TableCell sx={{ minWidth: 70 }}>
                  <TextField select variant="standard" value={line.commissionApplies} disabled={!editable} onChange={(e) => updateLine(line.id, { commissionApplies: e.target.value as 'Y' | 'N' })}>
                    <MenuItem value="N">N</MenuItem>
                    <MenuItem value="Y">Y</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell sx={{ minWidth: 70 }}>
                  <TextField select variant="standard" value={line.netRate} disabled={!editable} onChange={(e) => updateLine(line.id, { netRate: e.target.value as 'Y' | 'N' })}>
                    <MenuItem value="N">N</MenuItem>
                    <MenuItem value="Y">Y</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TextField variant="standard" type="number" value={line.agreedRate} disabled={!editable} onChange={(e) => updateLine(line.id, { agreedRate: Number(e.target.value) })} />
                </TableCell>
                <TableCell sx={{ minWidth: 90 }}>
                  <TextField variant="standard" type="number" value={line.agreedFreight} disabled={!editable} onChange={(e) => updateLine(line.id, { agreedFreight: Number(e.target.value) })} />
                </TableCell>
                <TableCell sx={{ minWidth: 90 }}>{line.freightDifference.toFixed(2)}</TableCell>
                <TableCell sx={{ minWidth: 130 }}>{line.kbFreight.toFixed(2)} / {(line.kbFreightPkr ?? 0).toFixed(2)} PKR</TableCell>
                <TableCell sx={{ minWidth: 90 }}>
                  <TextField select variant="standard" value={line.lessCommission} disabled={!editable} onChange={(e) => updateLine(line.id, { lessCommission: e.target.value as 'Y' | 'N' })}>
                    <MenuItem value="N">N</MenuItem>
                    <MenuItem value="Y">Y</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell sx={{ minWidth: 70 }}>
                  <TextField variant="standard" type="number" value={line.kbRatePercent} disabled={!editable} onChange={(e) => updateLine(line.id, { kbRatePercent: Number(e.target.value) })} />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 130 }}>{line.kbAmount.toFixed(2)} / {(line.kbAmountPkr ?? 0).toFixed(2)} PKR</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}><TextField label="Currency" fullWidth value={job.currency} disabled /></Grid>
        <Grid item xs={12} sm={4}><TextField label="Calculation Ex. Rate" fullWidth value={job.exRate} disabled /></Grid>
        <Grid item xs={12} sm={4}><TextField label="Printable Ex. Rate" fullWidth value={job.printableExRate} disabled /></Grid>
      </Grid>
      </SectionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <SectionCard number="3.2" title="Other Charges Payable" tint="mint">
          <LegacyOtherChargesGrid
            charges={job.kb.otherCharges}
            editable={editable}
            onChange={(otherCharges) => applyKb({ ...job.kb, otherCharges })}
          />
          <Paper variant="outlined" sx={{ display: 'none' }}>
            <Grid container spacing={1}>
              {job.kb.otherCharges.map((c, i) => (
                <Grid container item spacing={1} key={c.id} alignItems="center">
                  <Grid item xs={6}>
                    {i === 0 ? <Typography variant="body2">{c.label}</Typography> : <TextField variant="standard" placeholder="Charge description" value={c.label} disabled={!editable} onChange={(e) => {
                      const otherCharges = [...job.kb.otherCharges];
                      otherCharges[i] = { ...c, label: e.target.value };
                      applyKb({ ...job.kb, otherCharges });
                    }} />}
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      variant="standard"
                      type="number"
                      value={c.foreign}
                      disabled={!editable}
                      onChange={(e) => {
                        const otherCharges = [...job.kb.otherCharges];
                        otherCharges[i] = { ...c, foreign: Number(e.target.value) };
                        applyKb({ ...job.kb, otherCharges });
                      }}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      variant="standard"
                      type="number"
                      value={c.pkr}
                      disabled={!editable}
                      onChange={(e) => {
                        const otherCharges = [...job.kb.otherCharges];
                        otherCharges[i] = { ...c, pkr: Number(e.target.value) };
                        applyKb({ ...job.kb, otherCharges });
                      }}
                    />
                  </Grid>
                </Grid>
              ))}
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Total Other Charges Payable
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {job.kb.totalOtherChargesPayable.toFixed(2)} / {(job.kb.totalOtherChargesPayablePkr ?? 0).toFixed(2)} PKR
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          </SectionCard>

          <SectionCard number="3.3" title="Owner Panel" tint="lavender">
          <LegacyOwnerGrid job={job} editable={editable} onChange={(patch) => applyKb({ ...job.kb, ...patch })} />
          <Paper variant="outlined" sx={{ display: 'none' }}>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Comm. On Net (Y/N)"
                  fullWidth
                  value={job.kb.ownerCommOnNet}
                  disabled={!editable}
                  onChange={(e) => applyKb({ ...job.kb, ownerCommOnNet: e.target.value as 'Y' | 'N' })}
                >
                  <MenuItem value="N">N</MenuItem>
                  <MenuItem value="Y">Y</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="Comm. %"
                  type="number"
                  fullWidth
                  value={job.kb.ownerCommPercent}
                  disabled={!editable}
                  onChange={(e) => applyKb({ ...job.kb, ownerCommPercent: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="WHT %"
                  type="number"
                  fullWidth
                  value={job.kb.ownerWhtPercent}
                  disabled={!editable}
                  onChange={(e) => applyKb({ ...job.kb, ownerWhtPercent: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}><Typography variant="body2" sx={{ fontWeight: 700 }}>Commission Amount: {job.totals.commission.toFixed(2)} / {(job.totals.commission * job.exRate).toFixed(2)} PKR</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" sx={{ fontWeight: 700 }}>WHT Amount: {job.totals.whtAmount.toFixed(2)} / {(job.totals.whtAmount * job.exRate).toFixed(2)} PKR</Typography></Grid>
            </Grid>
          </Paper>
          </SectionCard>

          <Box>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderColor: navyTrustColors.border }}>
            <LegacyNetPayableGrid job={job} />
            <LegacyKbAdjustmentGrid job={job} editable={editable} onChange={(patch) => applyKb({ ...job.kb, ...patch })} />
            <Grid container spacing={1} sx={{ display: 'none' }}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="K.B. Adj. Y/N"
                  fullWidth
                  value={job.kb.kbAdjustment}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, kb: { ...job.kb, kbAdjustment: e.target.value as 'Y' | 'N' } })}
                >
                  <MenuItem value="N">N</MenuItem>
                  <MenuItem value="Y">Y</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="K.B. Adj. Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={job.kb.kbAdjustmentDate}
                  disabled={!editable || job.kb.kbAdjustment === 'N'}
                  onChange={(e) => onChange({ ...job, kb: { ...job.kb, kbAdjustmentDate: e.target.value } })}
                />
              </Grid>
            </Grid>
          </Paper>
          </Box>

          <Box sx={{ display: 'none' }}>
          <SectionCard number="3.5" title="Inter Line Revenue & Deductions" tint="slate">
            <Grid container spacing={1.5}>
              <Grid item xs={6}><TextField label="Inter Line Revenue" type="number" fullWidth value={job.kb.interLineRevenue} disabled={!editable} onChange={(e) => applyKb({ ...job.kb, interLineRevenue: Number(e.target.value) })} /></Grid>
              <Grid item xs={6}><TextField label="Total Deduction" type="number" fullWidth value={job.kb.totalDeduction} disabled={!editable} onChange={(e) => applyKb({ ...job.kb, totalDeduction: Number(e.target.value) })} /></Grid>
            </Grid>
          </SectionCard>
          </Box>

          <SectionCard number="3.6" title="Shipper Agreed and Invoiced Rates" tint="purple">
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderColor: navyTrustColors.border }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>Shipper</TableCell>
                  <TableCell>Invoiced</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Agreed Rate</TableCell>
                  <TableCell>
                    <TextField
                      variant="standard"
                      type="number"
                      value={job.kb.shipperAgreedRate}
                      disabled={!editable}
                      onChange={(e) => onChange({ ...job, kb: { ...job.kb, shipperAgreedRate: Number(e.target.value) } })}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      variant="standard"
                      type="number"
                      value={job.kb.invoicedRate}
                      disabled={!editable}
                      onChange={(e) => onChange({ ...job, kb: { ...job.kb, invoicedRate: Number(e.target.value) } })}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Agreed Freight</TableCell>
                  <TableCell>
                    <TextField
                      variant="standard"
                      type="number"
                      value={job.kb.shipperAgreedFreight}
                      disabled={!editable}
                      onChange={(e) => onChange({ ...job, kb: { ...job.kb, shipperAgreedFreight: Number(e.target.value) } })}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      variant="standard"
                      type="number"
                      value={job.kb.invoicedFreight}
                      disabled={!editable}
                      onChange={(e) => onChange({ ...job, kb: { ...job.kb, invoicedFreight: Number(e.target.value) } })}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Freight Difference</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell>{(job.kb.invoicedFreight - job.kb.shipperAgreedFreight).toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
          </SectionCard>

          <SectionCard number="3.7" title="Printable Remarks" tint="peach">
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={job.kb.printableRemarks}
            disabled={!editable}
            onChange={(e) => onChange({ ...job, kb: { ...job.kb, printableRemarks: e.target.value } })}
          />
          </SectionCard>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function LegacyNetPayableGrid({ job }: { job: Job }) {
  const rows = [
    { label: 'Freight', pkr: job.totals.freightPkr, foreign: job.totals.freight },
    { label: 'Due Carrier', pkr: job.totals.dueCarrierPkr, foreign: job.totals.dueCarrier },
    { label: 'Due Agent', pkr: job.totals.dueAgentPkr, foreign: job.totals.dueAgent },
    { label: 'Total K.B. Amount', pkr: job.kb.lines.reduce((total, line) => total + (line.kbAmountPkr ?? 0), 0), foreign: job.totals.totalKbAmount },
    { label: 'Other Payable', pkr: job.kb.totalOtherChargesPayablePkr ?? 0, foreign: job.kb.totalOtherChargesPayable },
    { label: 'Net Payable', pkr: job.kb.netPayablePkr ?? 0, foreign: job.kb.netPayable, total: true },
  ];
  return (
    <Box sx={{ bgcolor: '#0f1c33', borderRadius: 2, p: 1.25, color: '#e6ebf5', mb: 1 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1.15fr 0.9fr 0.9fr', columnGap: 1, mb: 0.5 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Calculation totals</Typography>
        <Typography align="right" sx={{ fontSize: 11, fontWeight: 800, color: '#ff8b9a' }}>PKR</Typography>
        <Typography align="right" sx={{ fontSize: 11, fontWeight: 800, color: '#a5e66d' }}>{job.currency}</Typography>
      </Box>
      {rows.map((row) => <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '1.15fr 0.9fr 0.9fr', columnGap: 1, alignItems: 'center', py: row.total ? 0.6 : 0.3, px: row.total ? 0.75 : 0, borderRadius: 1, bgcolor: row.total ? 'rgba(57,157,255,0.2)' : 'transparent' }}><Typography sx={{ fontSize: 12, fontWeight: row.total ? 800 : 400, color: row.total ? '#fff' : 'rgba(230,235,245,0.82)' }}>{row.label}</Typography><Typography align="right" sx={{ fontSize: row.total ? 14 : 12, fontWeight: 800, color: row.total ? '#5fd0ff' : '#fff' }}>{row.pkr.toFixed(2)}</Typography><Typography align="right" sx={{ fontSize: row.total ? 14 : 12, fontWeight: 800, color: row.total ? '#5fd0ff' : '#fff' }}>{row.foreign.toFixed(2)}</Typography></Box>)}
    </Box>
  );
}

function LegacyKbAdjustmentGrid({ job, editable, onChange }: { job: Job; editable: boolean; onChange: (patch: Partial<Job['kb']>) => void }) {
  const amountRow = (label: string, key: 'interLineRevenue' | 'totalDeduction') => (
    <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc', py: 0.25, px: 0.5, borderColor: navyTrustColors.border } }}>
      <TableCell>{label}</TableCell>
      <TableCell><TextField variant="standard" type="number" fullWidth value={job.kb[key] * job.exRate} disabled /></TableCell>
      <TableCell><TextField variant="standard" type="number" fullWidth value={job.kb[key]} disabled={!editable} onChange={(e) => onChange({ [key]: Number(e.target.value) })} /></TableCell>
    </TableRow>
  );
  return (
    <Table size="small" sx={{ '& .MuiTableCell-root': { borderColor: navyTrustColors.border } }}>
      <TableBody>
        <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc', py: 0.25, px: 0.5 } }}>
          <TableCell>K.B. Adj. Y/N</TableCell>
          <TableCell><TextField select variant="standard" size="small" value={job.kb.kbAdjustment} disabled={!editable} onChange={(e) => onChange({ kbAdjustment: e.target.value as 'Y' | 'N' })}><MenuItem value="N">N</MenuItem><MenuItem value="Y">Y</MenuItem></TextField></TableCell>
          <TableCell><TextField label="K.B. Adj. Date" variant="standard" type="date" size="small" InputLabelProps={{ shrink: true }} value={job.kb.kbAdjustmentDate} disabled={!editable || job.kb.kbAdjustment === 'N'} onChange={(e) => onChange({ kbAdjustmentDate: e.target.value })} /></TableCell>
        </TableRow>
        {amountRow('Inter Line Revenue', 'interLineRevenue')}
        {amountRow('Total Deduction', 'totalDeduction')}
      </TableBody>
    </Table>
  );
}

function LegacyOwnerGrid({ job, editable, onChange }: { job: Job; editable: boolean; onChange: (patch: Partial<Job['kb']>) => void }) {
  const commissionPkr = job.totals.commission * job.exRate;
  const whtPkr = job.totals.whtAmount * job.exRate;
  return (
    <Paper variant="outlined" sx={{ overflowX: 'auto', borderColor: navyTrustColors.border }}>
      <Table size="small" sx={{ '& .MuiTableCell-root': { py: 0.25, px: 0.5, borderColor: navyTrustColors.border } }}>
        <TableHead><TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#d9f5d4', fontWeight: 800, textAlign: 'center' } }}><TableCell colSpan={4}>OWNER</TableCell></TableRow></TableHead>
        <TableBody>
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc' } }}><TableCell>Comm. On Net</TableCell><TableCell colSpan={3}><TextField select variant="standard" size="small" value={job.kb.ownerCommOnNet} disabled={!editable} onChange={(e) => onChange({ ownerCommOnNet: e.target.value as 'Y' | 'N' })}><MenuItem value="N">N</MenuItem><MenuItem value="Y">Y</MenuItem></TextField></TableCell></TableRow>
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc', fontWeight: 800, textAlign: 'center' } }}><TableCell /><TableCell /><TableCell>PKR</TableCell><TableCell>{job.currency}</TableCell></TableRow>
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc' } }}><TableCell>Comm. %</TableCell><TableCell><TextField variant="standard" type="number" fullWidth value={job.kb.ownerCommPercent} disabled={!editable} onChange={(e) => onChange({ ownerCommPercent: Number(e.target.value) })} /></TableCell><TableCell>{commissionPkr.toFixed(2)}</TableCell><TableCell>{job.totals.commission.toFixed(2)}</TableCell></TableRow>
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc' } }}><TableCell>WHT %</TableCell><TableCell><TextField variant="standard" type="number" fullWidth value={job.kb.ownerWhtPercent} disabled={!editable} onChange={(e) => onChange({ ownerWhtPercent: Number(e.target.value) })} /></TableCell><TableCell>{whtPkr.toFixed(2)}</TableCell><TableCell>{job.totals.whtAmount.toFixed(2)}</TableCell></TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}

function SummaryLine({ label, value, pkr, highlight }: { label: string; value: number; pkr?: number; highlight?: boolean }) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <Typography variant="body2" sx={{ fontWeight: highlight ? 700 : 400 }}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body2" align="right" sx={{ fontWeight: highlight ? 700 : 400, color: highlight ? navyTrustColors.navy : 'inherit' }}>
          {value.toFixed(2)}{pkr !== undefined && ` / ${pkr.toFixed(2)} PKR`}
        </Typography>
      </Grid>
    </Grid>
  );
}

function LegacyKbFreightGrid({ lines, currency }: { lines: KbFreightLine[]; currency: string }) {
  const valueCell = (value: string | number) => (
    <TextField variant="standard" size="small" value={value} disabled inputProps={{ style: { textAlign: 'right' } }} />
  );
  const rows: { label: string; value: (line: KbFreightLine) => string | number }[] = [
    { label: 'Pcs.', value: (line) => line.pcs },
    { label: 'Class', value: (line) => line.cl },
    { label: 'Commodity', value: (line) => line.commodity },
    { label: 'Gross Weight', value: (line) => line.grossWeight.toFixed(2) },
    { label: 'Charge Weight', value: (line) => line.chargeWeight.toFixed(2) },
  ];

  return (
    <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2, borderColor: navyTrustColors.border }}>
      <Table size="small" sx={{ minWidth: 860, '& .MuiTableCell-root': { py: 0.3, px: 0.75, borderColor: navyTrustColors.border } }}>
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#d9f5d4', fontWeight: 800, textAlign: 'center' } }}>
            <TableCell />
            {lines.map((line) => <TableCell key={line.id} colSpan={2}>LINE No.{line.lineNo}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.label} sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc' } }}>
              <TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>
              {lines.map((line) => <TableCell key={line.id} colSpan={2}>{valueCell(row.value(line))}</TableCell>)}
            </TableRow>
          ))}
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc', fontWeight: 800, textAlign: 'center' } }}>
            <TableCell />
            {lines.map((line) => <TableCell key={line.id} colSpan={2}>PKR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{currency}</TableCell>)}
          </TableRow>
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc' } }}>
            <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
            {lines.flatMap((line) => [<TableCell key={`${line.id}-rate-pkr`}>{valueCell(line.ratePkr.toFixed(4))}</TableCell>, <TableCell key={`${line.id}-rate`}>{valueCell(line.rate.toFixed(4))}</TableCell>])}
          </TableRow>
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dceefa', fontWeight: 800 } }}>
            <TableCell>Total Freight</TableCell>
            {lines.flatMap((line) => [<TableCell key={`${line.id}-total-pkr`}>{line.totalFreightPkr.toFixed(2)}</TableCell>, <TableCell key={`${line.id}-total`}>{line.totalFreight.toFixed(2)}</TableCell>])}
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}

function KbCalculationGrid({ lines, currency, exRate, editable, onUpdate }: { lines: KbFreightLine[]; currency: string; exRate: number; editable: boolean; onUpdate: (id: string, patch: Partial<KbFreightLine>) => void }) {
  const numberField = (line: KbFreightLine, key: 'agreedRate' | 'agreedFreight' | 'kbRatePercent') => <TextField variant="standard" type="number" value={line[key]} disabled={!editable} onChange={(e) => onUpdate(line.id, { [key]: Number(e.target.value) })} />;
  const selectField = (line: KbFreightLine, key: 'commissionApplies' | 'netRate' | 'lessCommission') => <TextField select variant="standard" value={line[key]} disabled={!editable} onChange={(e) => onUpdate(line.id, { [key]: e.target.value as 'Y' | 'N' })}><MenuItem value="N">N</MenuItem><MenuItem value="Y">Y</MenuItem></TextField>;
  const optionRows: { label: string; render: (line: KbFreightLine) => React.ReactNode }[] = [
    { label: 'Comm. [Y/N]', render: (line) => selectField(line, 'commissionApplies') },
    { label: 'New Commodity', render: (line) => <TextField select variant="standard" value={line.newCommodity ?? ''} disabled={!editable} onChange={(e) => onUpdate(line.id, { newCommodity: e.target.value })}><MenuItem value="">—</MenuItem><MenuItem value="NEW">NEW</MenuItem></TextField> },
    { label: 'Net Rate [Y/N]', render: (line) => selectField(line, 'netRate') },
    { label: 'Less: Commission', render: (line) => selectField(line, 'lessCommission') },
  ];
  const amountRows: { label: string; render: (line: KbFreightLine) => [React.ReactNode, React.ReactNode] }[] = [
    { label: 'Agreed Rate', render: (line) => [<TextField key="pkr" variant="standard" type="number" value={line.agreedRate * exRate} disabled />, numberField(line, 'agreedRate')] },
    { label: 'Agreed Freight', render: (line) => [<TextField key="pkr" variant="standard" type="number" value={line.agreedFreight * exRate} disabled />, <TextField key="foreign" variant="standard" type="number" value={line.agreedFreight} disabled />] },
    { label: 'Freight Difference', render: (line) => [(line.freightDifference * exRate).toFixed(2), line.freightDifference.toFixed(2)] },
    { label: 'KB Freight', render: (line) => [(line.kbFreightPkr ?? line.kbFreight * exRate).toFixed(2), line.kbFreight.toFixed(2)] },
    { label: 'KB Rate %', render: (line) => ['', numberField(line, 'kbRatePercent')] },
    { label: 'KB Amount', render: (line) => [(line.kbAmountPkr ?? line.kbAmount * exRate).toFixed(2), line.kbAmount.toFixed(2)] },
  ];
  return <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2, borderColor: navyTrustColors.border }}><Table size="small" sx={{ minWidth: 850, '& .MuiTableCell-root': { py: 0.25, px: 0.5, borderColor: navyTrustColors.border } }}><TableHead><TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#d9f5d4', fontWeight: 800, textAlign: 'center' } }}><TableCell /><TableCell colSpan={6}>AIRLINE K.B.</TableCell></TableRow></TableHead><TableBody>{optionRows.slice(0, 3).map((row) => <TableRow key={row.label} sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc' } }}><TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>{lines.map((line) => <TableCell key={line.id} colSpan={2}>{row.render(line)}</TableCell>)}</TableRow>)}<TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc', fontWeight: 800, textAlign: 'center' } }}><TableCell />{lines.map((line) => <TableCell key={line.id} colSpan={2}>PKR&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{currency}</TableCell>)}</TableRow>{amountRows.slice(0, 3).map((row) => <TableRow key={row.label} sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc' } }}><TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>{lines.flatMap((line) => { const [pkr, foreign] = row.render(line); return [<TableCell key={`${line.id}-pkr`}>{pkr}</TableCell>, <TableCell key={`${line.id}-foreign`}>{foreign}</TableCell>]; })}</TableRow>)}<TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc' } }}><TableCell sx={{ fontWeight: 600 }}>{optionRows[3].label}</TableCell>{lines.map((line) => <TableCell key={line.id} colSpan={2}>{optionRows[3].render(line)}</TableCell>)}</TableRow>{amountRows.slice(3).map((row) => <TableRow key={row.label} sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc' } }}><TableCell sx={{ fontWeight: 600 }}>{row.label}</TableCell>{lines.flatMap((line) => { const [pkr, foreign] = row.render(line); return [<TableCell key={`${line.id}-pkr`}>{pkr}</TableCell>, <TableCell key={`${line.id}-foreign`}>{foreign}</TableCell>]; })}</TableRow>)}</TableBody></Table></Paper>;
}

function LegacyOtherChargesGrid({ charges, editable, onChange }: { charges: KbOtherChargeLine[]; editable: boolean; onChange: (charges: KbOtherChargeLine[]) => void }) {
  const rows = Array.from({ length: 6 }, (_, index) => charges[index] ?? { id: `blank-${index}`, label: '', foreign: 0, pkr: 0 });
  const update = (index: number, patch: Partial<KbOtherChargeLine>) => onChange(rows.map((charge, i) => i === index ? { ...charge, ...patch } : charge));
  return (
    <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2, borderColor: navyTrustColors.border }}>
      <Table size="small" sx={{ minWidth: 480, '& .MuiTableCell-root': { py: 0.25, px: 0.4, borderColor: navyTrustColors.border } }}>
        <TableHead>
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#d9f5d4', fontWeight: 800, textAlign: 'center' } }}><TableCell colSpan={4}>OTHER CHARGES PAYABLE</TableCell></TableRow>
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc', fontWeight: 800, textAlign: 'center' } }}><TableCell /><TableCell /><TableCell>PKR</TableCell><TableCell>Foreign</TableCell></TableRow>
        </TableHead>
        <TableBody>
          {rows.map((charge, index) => (
            <TableRow key={charge.id} sx={{ '& .MuiTableCell-root': { bgcolor: '#eef7fc' } }}>
              <TableCell sx={{ width: 28 }} />
              <TableCell>{index === 0 ? <Typography variant="body2" align="right" sx={{ fontWeight: 700 }}>AWB Fee</Typography> : <TextField variant="standard" fullWidth value={charge.label} disabled={!editable} onChange={(e) => update(index, { label: e.target.value })} />}</TableCell>
              <TableCell><TextField variant="standard" type="number" fullWidth value={charge.pkr} disabled={!editable} onChange={(e) => update(index, { pkr: Number(e.target.value) })} /></TableCell>
              <TableCell><TextField variant="standard" type="number" fullWidth value={charge.foreign} disabled={!editable} onChange={(e) => update(index, { foreign: Number(e.target.value) })} /></TableCell>
            </TableRow>
          ))}
          <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#c4e0f1', fontWeight: 800 } }}><TableCell colSpan={2} align="right">Total Other Charges Payable</TableCell><TableCell>{charges.reduce((total, charge) => total + (charge.pkr || 0), 0).toFixed(2)}</TableCell><TableCell>{charges.reduce((total, charge) => total + (charge.foreign || 0), 0).toFixed(2)}</TableCell></TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
}

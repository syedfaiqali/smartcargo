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
import { Job, KbFreightLine } from '../../../domain/job';
import { SectionCard } from '../../../components/SectionCard';
import { navyTrustColors } from '../../../theme/navyTrustTheme';
import { recomputeJobTotals } from '../jobCalculations';

interface KbTabProps {
  job: Job;
  editable: boolean;
  onChange: (job: Job) => void;
}

function recomputeKbLine(line: KbFreightLine): KbFreightLine {
  const totalFreight = line.rate * line.chargeWeight;
  const totalFreightPkr = line.ratePkr * line.chargeWeight;
  const freightDifference = line.agreedFreight - totalFreight;
  const kbFreight = line.lessCommission === 'Y' ? freightDifference * 0.95 : freightDifference;
  const kbAmount = kbFreight * (line.kbRatePercent / 100);
  return { ...line, totalFreight, totalFreightPkr, freightDifference, kbFreight, kbAmount };
}

export function KbTab({ job, editable, onChange }: KbTabProps) {
  const updateLine = (id: string, patch: Partial<KbFreightLine>) => {
    const lines = job.kb.lines.map((l) => (l.id === id ? recomputeKbLine({ ...l, ...patch }) : l));
    const totalKbAmount = lines.reduce((a, l) => a + l.kbAmount, 0);
    const netPayable =
      job.totals.freight + job.totals.dueCarrier + job.totals.dueAgent - totalKbAmount - job.kb.totalOtherChargesPayable;
    const updatedJob: Job = {
      ...job,
      kb: { ...job.kb, lines, netPayable },
      totals: { ...job.totals, totalKbAmount },
    };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  return (
    <Box>
      <Alert severity="warning" sx={{ mb: 2 }}>
        "K.B." business meaning (rate-reconciliation / broker-commission calculation) should be confirmed with the
        business owner — see docs/screens-phase.md Section 2.10.
      </Alert>

      <SectionCard number="3.1" title="Line-wise Freight (Line No. 1–3)" tint="blue">
      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2, borderColor: navyTrustColors.border }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Line</TableCell>
              <TableCell>Pcs</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Commodity</TableCell>
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
              <TableCell>Less: Comm. Y/N</TableCell>
              <TableCell>KB Rate %</TableCell>
              <TableCell>KB Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {job.kb.lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>{line.lineNo}</TableCell>
                <TableCell sx={{ minWidth: 60 }}>
                  <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateLine(line.id, { pcs: Number(e.target.value) })} />
                </TableCell>
                <TableCell sx={{ minWidth: 60 }}>
                  <TextField variant="standard" value={line.cl} disabled={!editable} onChange={(e) => updateLine(line.id, { cl: e.target.value })} />
                </TableCell>
                <TableCell sx={{ minWidth: 90 }}>
                  <TextField variant="standard" value={line.commodity} disabled={!editable} onChange={(e) => updateLine(line.id, { commodity: e.target.value })} />
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TextField variant="standard" type="number" value={line.grossWeight} disabled={!editable} onChange={(e) => updateLine(line.id, { grossWeight: Number(e.target.value) })} />
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TextField variant="standard" type="number" value={line.chargeWeight} disabled={!editable} onChange={(e) => updateLine(line.id, { chargeWeight: Number(e.target.value) })} />
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateLine(line.id, { rate: Number(e.target.value) })} />
                </TableCell>
                <TableCell sx={{ minWidth: 80 }}>
                  <TextField variant="standard" type="number" value={line.ratePkr} disabled={!editable} onChange={(e) => updateLine(line.id, { ratePkr: Number(e.target.value) })} />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 90 }}>{line.totalFreight.toFixed(2)}</TableCell>
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
                <TableCell sx={{ minWidth: 90 }}>
                  <TextField select variant="standard" value={line.lessCommission} disabled={!editable} onChange={(e) => updateLine(line.id, { lessCommission: e.target.value as 'Y' | 'N' })}>
                    <MenuItem value="N">N</MenuItem>
                    <MenuItem value="Y">Y</MenuItem>
                  </TextField>
                </TableCell>
                <TableCell sx={{ minWidth: 70 }}>
                  <TextField variant="standard" type="number" value={line.kbRatePercent} disabled={!editable} onChange={(e) => updateLine(line.id, { kbRatePercent: Number(e.target.value) })} />
                </TableCell>
                <TableCell sx={{ fontWeight: 700, minWidth: 90 }}>{line.kbAmount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      </SectionCard>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionCard number="3.2" title="Other Charges Payable" tint="mint">
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderColor: navyTrustColors.border }}>
            <Grid container spacing={1}>
              {job.kb.otherCharges.map((c, i) => (
                <Grid container item spacing={1} key={c.id} alignItems="center">
                  <Grid item xs={6}>
                    <Typography variant="body2">{c.label}</Typography>
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
                        const totalOtherChargesPayable = otherCharges.reduce((a, x) => a + x.foreign, 0);
                        onChange({ ...job, kb: { ...job.kb, otherCharges, totalOtherChargesPayable } });
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
                        onChange({ ...job, kb: { ...job.kb, otherCharges } });
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
                  {job.kb.totalOtherChargesPayable.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
          </SectionCard>

          <SectionCard number="3.3" title="Owner Panel" tint="lavender">
          <Paper variant="outlined" sx={{ p: 1.5, borderColor: navyTrustColors.border }}>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <TextField
                  select
                  label="Comm. On Net (Y/N)"
                  fullWidth
                  value={job.kb.ownerCommOnNet}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, kb: { ...job.kb, ownerCommOnNet: e.target.value as 'Y' | 'N' } })}
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
                  onChange={(e) => onChange({ ...job, kb: { ...job.kb, ownerCommPercent: Number(e.target.value) } })}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  label="WHT %"
                  type="number"
                  fullWidth
                  value={job.kb.ownerWhtPercent}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, kb: { ...job.kb, ownerWhtPercent: Number(e.target.value) } })}
                />
              </Grid>
            </Grid>
          </Paper>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionCard number="3.4" title="Net Payable Summary" tint="cyan">
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, borderColor: navyTrustColors.border }}>
            <SummaryLine label="Freight" value={job.totals.freight} />
            <SummaryLine label="Due Carrier" value={job.totals.dueCarrier} />
            <SummaryLine label="Due Agent" value={job.totals.dueAgent} />
            <SummaryLine label="Total K.B. Amount" value={job.totals.totalKbAmount} />
            <SummaryLine label="Other Payable" value={job.kb.totalOtherChargesPayable} />
            <SummaryLine label="Net Payable" value={job.kb.netPayable} highlight />
            <Grid container spacing={1} sx={{ mt: 1 }}>
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
          </SectionCard>

          <SectionCard number="3.5" title="Shipper Agreed and Invoiced Rates" tint="purple">
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

          <SectionCard number="3.6" title="Printable Remarks" tint="peach">
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={job.kb.printableRemarks}
            disabled={!editable}
            onChange={(e) => onChange({ ...job, kb: { ...job.kb, printableRemarks: e.target.value } })}
          />
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryLine({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Grid container spacing={1}>
      <Grid item xs={8}>
        <Typography variant="body2" sx={{ fontWeight: highlight ? 700 : 400 }}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="body2" align="right" sx={{ fontWeight: highlight ? 700 : 400, color: highlight ? navyTrustColors.navy : 'inherit' }}>
          {value.toFixed(2)}
        </Typography>
      </Grid>
    </Grid>
  );
}

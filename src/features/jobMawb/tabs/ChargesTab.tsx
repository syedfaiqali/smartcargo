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
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import { Job } from '../../../domain/job';
import { SectionCard } from '../../../components/SectionCard';
import { navyTrustColors, navyTrustHeadingFontFamily } from '../../../theme/navyTrustTheme';
import { recomputeChargesTotals, recomputeJobTotals } from '../jobCalculations';

interface ChargesTabProps {
  job: Job;
  editable: boolean;
  onChange: (job: Job) => void;
}

export function ChargesTab({ job, editable, onChange }: ChargesTabProps) {
  const updateDueCarrier = (id: string, patch: Partial<Job['charges']['dueCarrierLines'][number]>) => {
    const charges = {
      ...job.charges,
      dueCarrierLines: job.charges.dueCarrierLines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    };
    const recomputed = recomputeChargesTotals(charges);
    const updatedJob = { ...job, charges: recomputed };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  const updateDueAgent = (id: string, patch: Partial<Job['charges']['dueAgentLines'][number]>) => {
    const charges = {
      ...job.charges,
      dueAgentLines: job.charges.dueAgentLines.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    };
    const recomputed = recomputeChargesTotals(charges);
    const updatedJob = { ...job, charges: recomputed };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  const updateAdditionalDueCarrier = (id: string, patch: Partial<Job['charges']['dueCarrierLines'][number]>) => {
    const relevantChargeLines = job.chargeLines.slice(0, 3);
    const grossWeight = relevantChargeLines.reduce((total, line) => total + line.grossWt, 0);
    const chargeableWeight = relevantChargeLines.reduce((total, line) => total + line.chargeWt, 0);
    const charges = {
      ...job.charges,
      additionalDueCarrierLines: (job.charges.additionalDueCarrierLines ?? []).map((line) => {
        if (line.id !== id) return line;
        const updated = { ...line, ...patch };
        const weight = updated.cwGwBasis === 'GW' ? grossWeight : chargeableWeight;
        const amount = updated.rate * weight;
        return { ...updated, charges: amount, chargesPkr: amount * job.exRate };
      }),
    };
    const recomputed = recomputeChargesTotals(charges);
    const updatedJob = { ...job, charges: recomputed };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Populated largely from Entry-tab data and Airline master charges; opened in edit mode to adjust computed values.
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <SectionCard number="2.1" title="Due Carrier Panel" tint="rose">
          <Paper variant="outlined" sx={{ overflowX: 'auto', borderColor: navyTrustColors.border }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Charge Head</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>CW/GW</TableCell>
                  <TableCell>Charges</TableCell>
                  <TableCell>Charges (PKR)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.charges.dueCarrierLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 140 }}>
                      {line.editableLabel && editable ? (
                        <TextField variant="standard" value={line.label} onChange={(e) => updateDueCarrier(line.id, { label: e.target.value })} />
                      ) : (
                        line.label
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.rate}
                        disabled={!editable}
                        onChange={(e) => updateDueCarrier(line.id, { rate: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        select
                        variant="standard"
                        value={line.cwGwBasis}
                        disabled={!editable}
                        onChange={(e) => updateDueCarrier(line.id, { cwGwBasis: e.target.value as 'CW' | 'GW' })}
                      >
                        <MenuItem value="CW">CW</MenuItem>
                        <MenuItem value="GW">GW</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.charges}
                        disabled={!editable}
                        onChange={(e) => updateDueCarrier(line.id, { charges: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.chargesPkr}
                        disabled={!editable}
                        onChange={(e) => updateDueCarrier(line.id, { chargesPkr: Number(e.target.value) })}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ overflowX: 'auto', mt: 1.5, borderColor: navyTrustColors.border }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Charge Head</TableCell><TableCell>Rate (PKR)</TableCell><TableCell>CW/GW</TableCell><TableCell>Charges</TableCell><TableCell>Charges (PKR)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(job.charges.additionalDueCarrierLines ?? []).map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 140 }}><TextField variant="standard" placeholder="Charge head" value={line.label} disabled={!editable} onChange={(e) => updateAdditionalDueCarrier(line.id, { label: e.target.value })} /></TableCell>
                    <TableCell sx={{ minWidth: 90 }}><TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateAdditionalDueCarrier(line.id, { rate: Number(e.target.value) })} /></TableCell>
                    <TableCell sx={{ minWidth: 80 }}><TextField select variant="standard" value={line.cwGwBasis} disabled={!editable} onChange={(e) => updateAdditionalDueCarrier(line.id, { cwGwBasis: e.target.value as 'CW' | 'GW' })}><MenuItem value="CW">CW</MenuItem><MenuItem value="GW">GW</MenuItem></TextField></TableCell>
                    <TableCell sx={{ minWidth: 90 }}><TextField variant="standard" value={line.charges.toFixed(2)} InputProps={{ readOnly: true }} /></TableCell>
                    <TableCell sx={{ minWidth: 90 }}><TextField variant="standard" value={line.chargesPkr.toFixed(2)} InputProps={{ readOnly: true }} /></TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 800, bgcolor: '#dbeeff' }}>Total Due Carrier</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#1259a7', color: '#fff' }}>{job.charges.totalDueCarrier.toFixed(2)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, bgcolor: '#1259a7', color: '#fff' }}>{job.charges.totalDueCarrierPkr.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            Calculator rows use the first three Charge Grid records: CW = Chargeable Weight; GW = Gross Weight; Charges (PKR) = Charges × Ex. Rate.
          </Typography>

          <Paper variant="outlined" sx={{ overflowX: 'auto', mt: 1.5, borderColor: navyTrustColors.border }}>
            <Table size="small">
              <TableHead><TableRow><TableCell>Gross Weight</TableCell><TableCell>Chargeable Weight</TableCell><TableCell>Rate</TableCell><TableCell>Rate (PKR)</TableCell></TableRow></TableHead>
              <TableBody>
                {job.chargeLines.slice(0, 3).map((line) => (
                  <TableRow key={line.id}>
                    <TableCell><TextField variant="standard" value={line.grossWt.toFixed(2)} InputProps={{ readOnly: true }} /></TableCell>
                    <TableCell><TextField variant="standard" value={line.chargeWt.toFixed(2)} InputProps={{ readOnly: true }} /></TableCell>
                    <TableCell><TextField variant="standard" value={line.rate.toFixed(4)} InputProps={{ readOnly: true }} /></TableCell>
                    <TableCell><TextField variant="standard" value={line.ratePkr.toFixed(4)} InputProps={{ readOnly: true }} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, mt: 1.5, borderColor: navyTrustColors.border }}>
            <Typography variant="caption" color="text.secondary">
              Gross Weight: {job.chargeLines.reduce((a, l) => a + l.grossWt, 0)} kg &nbsp;|&nbsp; Chargeable Weight:{' '}
              {job.chargeLines.reduce((a, l) => a + l.chargeWt, 0)} kg &nbsp;|&nbsp; Rate: {job.exRate} ({job.currency})
            </Typography>
          </Paper>
          </SectionCard>

          <SectionCard number="2.2" title="Due Agent Panel" tint="peach">
          <Paper variant="outlined" sx={{ overflowX: 'auto', borderColor: navyTrustColors.border }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Due Agent</TableCell>
                  <TableCell>Charges</TableCell>
                  <TableCell>Charges (PKR)</TableCell>
                  <TableCell>Print on AWB</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.charges.dueAgentLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 140 }}>
                      {line.editableLabel && editable ? (
                        <TextField variant="standard" value={line.label} placeholder="Charge description" onChange={(e) => updateDueAgent(line.id, { label: e.target.value })} />
                      ) : (
                        line.label
                      )}
                      {line.manualInput && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          (Local Currency Not Calculated with Ex.Rate)
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.chargesForeign}
                        disabled={!editable}
                        onChange={(e) => updateDueAgent(line.id, { chargesForeign: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.chargesPkr}
                        disabled={!editable}
                        onChange={(e) => updateDueAgent(line.id, { chargesPkr: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox size="small" checked={line.printOnAwb} disabled={!editable} onChange={(e) => updateDueAgent(line.id, { printOnAwb: e.target.checked })} />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total Due Agent</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{job.charges.totalDueAgent.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{job.charges.totalDueAgentPkr.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <SectionCard number="2.3" title="Summary Totals Panel" tint="slate">
          <Paper variant="outlined" sx={{ p: 1.5, borderColor: navyTrustColors.border }}>
            <Grid container spacing={1} sx={{ mb: 1 }}>
              <Grid item xs={8}>
                <Typography variant="body2">CC Scaning Payable (Y/N)</Typography>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  select
                  variant="standard"
                  fullWidth
                  value={job.charges.ccScanningPayable}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, charges: { ...job.charges, ccScanningPayable: e.target.value as 'Y' | 'N' } })}
                >
                  <MenuItem value="N">N</MenuItem>
                  <MenuItem value="Y">Y</MenuItem>
                </TextField>
              </Grid>
            </Grid>
            <Box sx={{ bgcolor: '#0f1c33', borderRadius: 2, px: 1.25, py: 1, mt: 1.5, color: '#e6ebf5' }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1.15fr 0.9fr 0.9fr', columnGap: 1, alignItems: 'center', mb: 0.75 }}>
                <Typography sx={{ fontFamily: navyTrustHeadingFontFamily, fontWeight: 700, fontSize: 12.5, color: '#fff' }}>Calculation totals</Typography>
                <Typography align="right" sx={{ fontSize: 11, fontWeight: 800, color: '#ff8b9a' }}>PKR</Typography>
                <Typography align="right" sx={{ fontSize: 11, fontWeight: 800, color: '#a5e66d' }}>PKR</Typography>
              </Box>
              <SummaryRow label="Total Due Carrier" foreign={job.totals.dueCarrier} pkr={job.totals.dueCarrierPkr} />
              <SummaryRow label="Total Due Agent" foreign={job.totals.dueAgent} pkr={job.totals.dueAgentPkr} />
              <SummaryRow label="Total Freight Amount" foreign={job.totals.freight} pkr={job.totals.freightPkr} />
              <SummaryRow label="Total AWB Amount" foreign={job.totals.totalAwbAmount} pkr={job.totals.totalAwbAmountPkr} highlight />
              <SummaryRow label="Total K.B. Amount" foreign={job.totals.totalKbAmount} pkr={job.totals.totalKbAmount} dividerBefore />
              <SummaryRow label="Commission" foreign={job.totals.commission} pkr={job.totals.commission} />
              <SummaryRow label="WHT Amount" foreign={job.totals.whtAmount} pkr={job.totals.whtAmount} />
              <SummaryRow label="Payable to Airline" foreign={job.totals.payableToAirline} pkr={job.totals.payableToAirlinePkr} highlight />
            </Box>
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <Typography variant="caption">Currency: {job.currency}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption">Calc. Ex. Rate: {job.exRate}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption">Printable Ex. Rate: {job.printableExRate}</Typography>
              </Grid>
            </Grid>
          </Paper>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

function SummaryRow({ label, foreign, pkr, highlight, dividerBefore }: { label: string; foreign: number; pkr: number; highlight?: boolean; dividerBefore?: boolean }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1.15fr 0.9fr 0.9fr', columnGap: 1, alignItems: 'center', mt: dividerBefore ? 0.75 : 0, pt: dividerBefore ? 0.75 : 0, py: highlight ? 0.55 : 0.3, px: highlight ? 0.5 : 0, borderTop: dividerBefore ? '1px solid rgba(255,255,255,0.16)' : undefined, borderRadius: highlight ? 1 : 0, bgcolor: highlight ? 'rgba(57, 157, 255, 0.18)' : 'transparent' }}>
      <Typography sx={{ fontSize: 12.5, fontWeight: highlight ? 800 : 400, color: highlight ? '#fff' : 'rgba(230,235,245,0.78)' }}>{label}</Typography>
      <Typography align="right" sx={{ fontSize: highlight ? 14 : 12.5, fontWeight: 800, color: highlight ? '#5fd0ff' : '#e6ebf5' }}>{foreign.toFixed(2)}</Typography>
      <Typography align="right" sx={{ fontSize: highlight ? 14 : 12.5, fontWeight: 800, color: highlight ? '#5fd0ff' : '#e6ebf5' }}>{pkr.toFixed(2)}</Typography>
    </Box>
  );
}

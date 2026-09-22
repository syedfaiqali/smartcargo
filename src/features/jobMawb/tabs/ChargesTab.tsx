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
import { navyTrustColors } from '../../../theme/navyTrustTheme';
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
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total Due Carrier</TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell sx={{ fontWeight: 700 }}>{job.charges.totalDueCarrier.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{job.charges.totalDueCarrierPkr.toFixed(2)}</TableCell>
                </TableRow>
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
                      {line.label}
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
            <SummaryRow label="Total Due Carrier" value={job.totals.dueCarrier} />
            <SummaryRow label="Total Due Agent" value={job.totals.dueAgent} />
            <SummaryRow label="Total Freight Amount" value={job.totals.freight} />
            <SummaryRow label="Total AWB Amount" value={job.totals.totalAwbAmount} highlight />
            <SummaryRow label="Total K.B. Amount" value={job.totals.totalKbAmount} />
            <SummaryRow label="Commission" value={job.totals.commission} />
            <SummaryRow label="WHT Amount" value={job.totals.whtAmount} />
            <SummaryRow label="Payable to Airline" value={job.totals.payableToAirline} highlight />
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

function SummaryRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
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

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
import Alert from '@mui/material/Alert';
import { DocStatus, Job } from '../../../domain/job';
import { SectionHeader } from '../../../components/FormGrid';

interface RemarksTabProps {
  job: Job;
  editable: boolean;
  onChange: (job: Job) => void;
}

const yn = (v: 'Y' | 'N') => (
  <MenuItem value={v} key={v}>
    {v}
  </MenuItem>
);

export function RemarksTab({ job, editable, onChange }: RemarksTabProps) {
  const r = job.remarks;
  const setR = (patch: Partial<Job['remarks']>) => onChange({ ...job, remarks: { ...r, ...patch } });

  return (
    <Box>
      <SectionHeader>Shipment Schedule</SectionHeader>
      <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Flight No.</TableCell>
              <TableCell>Flight Date</TableCell>
              <TableCell>Routing</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {r.flightLegs.map((leg, i) => (
              <TableRow key={leg.id}>
                <TableCell sx={{ minWidth: 100 }}>
                  <TextField
                    variant="standard"
                    value={leg.flightNo}
                    disabled={!editable}
                    onChange={(e) => {
                      const flightLegs = [...r.flightLegs];
                      flightLegs[i] = { ...leg, flightNo: e.target.value };
                      setR({ flightLegs });
                    }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 140 }}>
                  <TextField
                    variant="standard"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={leg.flightDate}
                    disabled={!editable}
                    onChange={(e) => {
                      const flightLegs = [...r.flightLegs];
                      flightLegs[i] = { ...leg, flightDate: e.target.value };
                      setR({ flightLegs });
                    }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 160 }}>
                  <TextField
                    variant="standard"
                    fullWidth
                    value={leg.routing}
                    disabled={!editable}
                    onChange={(e) => {
                      const flightLegs = [...r.flightLegs];
                      flightLegs[i] = { ...leg, routing: e.target.value };
                      setR({ flightLegs });
                    }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 120 }}>
                  <TextField
                    variant="standard"
                    fullWidth
                    value={leg.status}
                    disabled={!editable}
                    onChange={(e) => {
                      const flightLegs = [...r.flightLegs];
                      flightLegs[i] = { ...leg, status: e.target.value };
                      setR({ flightLegs });
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SectionHeader>Milestone Dates</SectionHeader>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Grid container spacing={1.5}>
              <Grid item xs={6}>
                <TextField label="Received On" type="date" fullWidth InputLabelProps={{ shrink: true }} value={r.receivedOn} disabled={!editable} onChange={(e) => setR({ receivedOn: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Arrival Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={r.arrivalDate} disabled={!editable} onChange={(e) => setR({ arrivalDate: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Arrival Time" fullWidth value={r.arrivalTime} disabled={!editable} onChange={(e) => setR({ arrivalTime: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Forwarded On" type="date" fullWidth InputLabelProps={{ shrink: true }} value={r.forwardedOn} disabled={!editable} onChange={(e) => setR({ forwardedOn: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Vehicle No." fullWidth value={r.vehicleNo} disabled={!editable} onChange={(e) => setR({ vehicleNo: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField select label="Delivered Y/N" fullWidth value={r.delivered} disabled={!editable} onChange={(e) => setR({ delivered: e.target.value as 'Y' | 'N' })}>
                  {['N', 'Y'].map((v) => yn(v as 'Y' | 'N'))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField label="Held Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={r.heldDate} disabled={!editable} onChange={(e) => setR({ heldDate: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField label="Release Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={r.releaseDate} disabled={!editable} onChange={(e) => setR({ releaseDate: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField select label="Pending Shipment Y/N" fullWidth value={r.pendingShipment} disabled={!editable} onChange={(e) => setR({ pendingShipment: e.target.value as 'Y' | 'N' })}>
                  {['N', 'Y'].map((v) => yn(v as 'Y' | 'N'))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField select label="Handed Over to A/L Y/N" fullWidth value={r.handedOverToAirline} disabled={!editable} onChange={(e) => setR({ handedOverToAirline: e.target.value as 'Y' | 'N' })}>
                  {['N', 'Y'].map((v) => yn(v as 'Y' | 'N'))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField select label="Received from Shipper Y/N" fullWidth value={r.receivedFromShipper} disabled={!editable} onChange={(e) => setR({ receivedFromShipper: e.target.value as 'Y' | 'N' })}>
                  {['N', 'Y'].map((v) => yn(v as 'Y' | 'N'))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField select label="Delivery Required Y/N" fullWidth value={r.deliveryRequired} disabled={!editable} onChange={(e) => setR({ deliveryRequired: e.target.value as 'Y' | 'N' })}>
                  {['N', 'Y'].map((v) => yn(v as 'Y' | 'N'))}
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Delivery Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={r.deliveryDate}
                  disabled={!editable || r.deliveryRequired === 'N'}
                  onChange={(e) => setR({ deliveryDate: e.target.value })}
                />
              </Grid>
            </Grid>
          </Paper>

          <SectionHeader>Process Milestones</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Milestone</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Done</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {r.milestones.map((m, i) => (
                  <TableRow key={m.key}>
                    <TableCell sx={{ minWidth: 200 }}>{m.label}</TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <TextField
                        variant="standard"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={m.date}
                        disabled={!editable}
                        onChange={(e) => {
                          const milestones = [...r.milestones];
                          milestones[i] = { ...m, date: e.target.value };
                          setR({ milestones });
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        value={m.time}
                        disabled={!editable}
                        onChange={(e) => {
                          const milestones = [...r.milestones];
                          milestones[i] = { ...m, time: e.target.value };
                          setR({ milestones });
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        size="small"
                        checked={m.confirmed}
                        disabled={!editable}
                        onChange={(e) => {
                          const milestones = [...r.milestones];
                          milestones[i] = { ...m, confirmed: e.target.checked };
                          setR({ milestones });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <SectionHeader>Document Checklist — Airline / Party</SectionHeader>
          <Alert severity="warning" sx={{ mb: 1 }}>
            FEC, APC, IPB, C/M, Encash codes should be confirmed with the business owner — see docs/screens-phase.md
            Section 2.11.
          </Alert>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Item</TableCell>
                  <TableCell>Airline</TableCell>
                  <TableCell>Party</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {r.docChecklist.map((item, i) => (
                  <TableRow key={item.code}>
                    <TableCell>{item.code}</TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        select
                        variant="standard"
                        value={item.airline}
                        disabled={!editable}
                        onChange={(e) => {
                          const docChecklist = [...r.docChecklist];
                          docChecklist[i] = { ...item, airline: e.target.value as DocStatus };
                          setR({ docChecklist });
                        }}
                      >
                        <MenuItem value="N">N</MenuItem>
                        <MenuItem value="Y">Y</MenuItem>
                        <MenuItem value="P">P</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        select
                        variant="standard"
                        value={item.party}
                        disabled={!editable}
                        onChange={(e) => {
                          const docChecklist = [...r.docChecklist];
                          docChecklist[i] = { ...item, party: e.target.value as DocStatus };
                          setR({ docChecklist });
                        }}
                      >
                        <MenuItem value="N">N</MenuItem>
                        <MenuItem value="Y">Y</MenuItem>
                        <MenuItem value="P">P</MenuItem>
                      </TextField>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Grid container spacing={1.5} sx={{ p: 1.5 }}>
              <Grid item xs={6}>
                <TextField
                  label="No. Of Copies (Airline)"
                  type="number"
                  fullWidth
                  value={r.airlineNoOfCopies}
                  disabled={!editable}
                  onChange={(e) => setR({ airlineNoOfCopies: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Remarks (Party)"
                  fullWidth
                  value={r.partyChecklistRemarks}
                  disabled={!editable}
                  onChange={(e) => setR({ partyChecklistRemarks: e.target.value })}
                />
              </Grid>
            </Grid>
          </Paper>

          <SectionHeader>Remarks &amp; Instructions</SectionHeader>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <TextField
                label="Non Printable Remarks"
                fullWidth
                multiline
                minRows={2}
                value={r.nonPrintableRemarks}
                disabled={!editable}
                onChange={(e) => setR({ nonPrintableRemarks: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Printable Remarks / Additional Instruction for Label"
                fullWidth
                multiline
                minRows={2}
                value={r.printableRemarks}
                disabled={!editable}
                onChange={(e) => setR({ printableRemarks: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Extra Sheets" fullWidth multiline minRows={3} value={r.extraSheets} disabled={!editable} onChange={(e) => setR({ extraSheets: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Label Additional Instructions"
                fullWidth
                multiline
                minRows={2}
                value={r.labelAdditionalInstructions}
                disabled={!editable}
                onChange={(e) => setR({ labelAdditionalInstructions: e.target.value })}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

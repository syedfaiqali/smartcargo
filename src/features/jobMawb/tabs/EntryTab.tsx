import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { v4 as uuid } from 'uuid';
import { Job } from '../../../domain/job';
import { FormRow, FormField, SectionHeader } from '../../../components/FormGrid';
import { airportRepo, currencyRepo, ownerRepo, partyRepo, foreignAgentRepo, agentRepo, spoRepo } from '../../../data/masterDataService';
import { jobRepo } from '../../../data/jobService';
import { recomputeChargeLineTotal, recomputeJobTotals } from '../jobCalculations';

interface EntryTabProps {
  job: Job;
  editable: boolean;
  onChange: (job: Job) => void;
}

export function EntryTab({ job, editable, onChange }: EntryTabProps) {
  const owners = ownerRepo.list();
  const parties = partyRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const airports = airportRepo.list();
  const currencies = currencyRepo.list();
  const clearingAgents = agentRepo.find((a) => a.kind === 'CLEARING');
  const deliveryAgents = agentRepo.find((a) => a.kind === 'DELIVERY');
  const spoCodes = spoRepo.list();
  const masterJobs = job.kind === 'HAWB' ? jobRepo.find((j) => j.kind === 'MAWB') : [];

  const set = <K extends keyof Job>(key: K, value: Job[K]) => onChange({ ...job, [key]: value });

  const setParty = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    onChange({
      ...job,
      party: { ...job.party, partyCode, name: p?.name ?? '', address: p?.address ?? '', creditLimit: p?.creditLimit ?? 0 },
    });
  };

  const setConsigneeCode = (code: string) => {
    const a = foreignAgents.find((x) => x.code === code);
    onChange({ ...job, consignee: { ...job.consignee, code, name: a?.name ?? '', address: a?.address ?? '' } });
  };

  const setParentJobNo = (parentJobNo: string) => {
    const master = masterJobs.find((m) => m.jobNo === parentJobNo);
    onChange({
      ...job,
      parentJobNo,
      mawbNo: master?.mawbNo ?? job.mawbNo,
      awbDate: master?.awbDate ?? job.awbDate,
    });
  };

  const addChargeLine = () => {
    onChange({
      ...job,
      chargeLines: [
        ...job.chargeLines,
        {
          id: uuid(),
          rcp: '',
          pcs: 0,
          grossWt: 0,
          cl: '',
          comdty: '',
          chargeWt: 0,
          dimensionWt: 0,
          rate: 0,
          ratePkr: 0,
          total: 0,
          totalPkr: 0,
        },
      ],
    });
  };

  const updateChargeLine = (id: string, patch: Partial<Job['chargeLines'][number]>) => {
    const lines = job.chargeLines.map((l) => {
      if (l.id !== id) return l;
      const updated = { ...l, ...patch };
      return recomputeChargeLineTotal(updated, job.exRate);
    });
    const updatedJob = { ...job, chargeLines: lines };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  const removeChargeLine = (id: string) => {
    const updatedJob = { ...job, chargeLines: job.chargeLines.filter((l) => l.id !== id) };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  return (
    <Box
      sx={{
        '& .MuiInputBase-input, & .MuiSelect-select': { fontWeight: 600, color: '#172554' },
        '& .MuiInputLabel-root': { fontWeight: 600, color: '#475569' },
        '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#172554', opacity: 1, fontWeight: 600 },
      }}
    >
      <Grid container spacing={2}>
        {/* LEFT COLUMN — 2.3 Job Identification / Party / Consignee / Routing / Agents / Shipment */}
        <Grid item xs={12} md={6}>
          <FormRow>
            <FormField md={3}>
              <TextField label="Branch" fullWidth value={job.branch} disabled={!editable} onChange={(e) => set('branch', e.target.value)} />
            </FormField>
            <FormField md={4}>
              <TextField label="Job No." fullWidth value={job.jobNo} disabled />
            </FormField>
            <FormField md={5}>
              <TextField
                label="Job Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.jobDate}
                disabled={!editable}
                onChange={(e) => set('jobDate', e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Job Type" select fullWidth value={job.jobType} disabled={!editable} onChange={(e) => set('jobType', e.target.value)}>
                <MenuItem value="EXPORT">Export</MenuItem>
                <MenuItem value="TRANSSHIPMENT">Transshipment</MenuItem>
                <MenuItem value="CONSOLIDATION">Consolidation</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Nomination (Y/N)" select fullWidth value={job.nomination} disabled={!editable} onChange={(e) => set('nomination', e.target.value as 'Y' | 'N')}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Quot.Ref.No." fullWidth value={job.quotRefNo} disabled={!editable} onChange={(e) => set('quotRefNo', e.target.value)} />
            </FormField>
          </FormRow>
          {job.kind === 'HAWB' && (
            <FormRow>
              <FormField md={12}>
                <TextField
                  select
                  label="Master Job No. (MAWB)"
                  fullWidth
                  value={job.parentJobNo ?? ''}
                  disabled={!editable}
                  onChange={(e) => setParentJobNo(e.target.value)}
                  helperText="A House job is always created against a parent Job (MAWB) — docs Section 3"
                >
                  {masterJobs.map((m) => (
                    <MenuItem key={m.jobNo} value={m.jobNo}>
                      {m.jobNo} — MAWB {m.mawbNo || '(unassigned)'}
                    </MenuItem>
                  ))}
                </TextField>
              </FormField>
            </FormRow>
          )}
          <FormRow>
            <FormField md={6}>
              {job.kind === 'HAWB' ? (
                <TextField label="HAWB No." fullWidth value={job.hawbNo ?? ''} disabled />
              ) : (
                <TextField label="MAWB No." fullWidth value={job.mawbNo} disabled={!editable} onChange={(e) => set('mawbNo', e.target.value)} placeholder="From AWB Stock" />
              )}
            </FormField>
            <FormField md={6}>
              <TextField
                label="AWB Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.awbDate}
                disabled={!editable || job.kind === 'HAWB'}
                onChange={(e) => set('awbDate', e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Sale Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.saleDate}
                disabled={!editable}
                onChange={(e) => set('saleDate', e.target.value)}
              />
            </FormField>
            <FormField md={6}>
              <TextField select label="Owner" fullWidth value={job.owner} disabled={!editable} onChange={(e) => set('owner', e.target.value)}>
                {owners.map((o) => (
                  <MenuItem key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="Charge Code" fullWidth value={job.chargeCode} disabled={!editable} onChange={(e) => set('chargeCode', e.target.value)} />
            </FormField>
            <FormField md={4}>
              <TextField label="Station" fullWidth value={job.station} disabled={!editable} onChange={(e) => set('station', e.target.value)} />
            </FormField>
            <FormField md={4}>
              <TextField label="IncoTerm" fullWidth value={job.incoTerm} disabled={!editable} onChange={(e) => set('incoTerm', e.target.value)} />
            </FormField>
          </FormRow>

          <SectionHeader>{job.kind === 'HAWB' ? 'PARTY (Actual Shipper)' : 'PARTY'}</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField label="Credit Limit" fullWidth value={job.party.creditLimit} disabled />
            </FormField>
            <FormField md={4}>
              <TextField select label="Party Code" fullWidth value={job.party.partyCode} disabled={!editable} onChange={(e) => setParty(e.target.value)}>
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField label="Agent Party" fullWidth value={job.party.agentParty} disabled={!editable} onChange={(e) => onChange({ ...job, party: { ...job.party, agentParty: e.target.value } })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Name" fullWidth value={job.party.name} disabled />
            </FormField>
            <FormField md={6}>
              <TextField label="Address" fullWidth value={job.party.address} disabled />
            </FormField>
          </FormRow>

          <SectionHeader>{job.kind === 'HAWB' ? 'CONSIGNEE (Actual Consignee)' : 'CONSIGNEE'}</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField
                select
                label="Consolidation (Y/N)"
                fullWidth
                value={job.consignee.consolidation}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, consignee: { ...job.consignee, consolidation: e.target.value as 'Y' | 'N' } })}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={8}>
              <TextField select label="Code (Foreign Agent)" fullWidth value={job.consignee.code} disabled={!editable} onChange={(e) => setConsigneeCode(e.target.value)}>
                {foreignAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Name" fullWidth value={job.consignee.name} disabled />
            </FormField>
            <FormField md={6}>
              <TextField label="Address" fullWidth value={job.consignee.address} disabled />
            </FormField>
          </FormRow>

          <SectionHeader>Routing &amp; Shipment Details</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField label="CC Port" fullWidth value={job.routing.ccPort} disabled={!editable} onChange={(e) => onChange({ ...job, routing: { ...job.routing, ccPort: e.target.value } })} />
            </FormField>
            <FormField md={6}>
              <TextField
                select
                label="Airport of Departure"
                fullWidth
                value={job.routing.airportOfDeparture}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, routing: { ...job.routing, airportOfDeparture: e.target.value } })}
              >
                {airports.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          {job.routing.legs.map((leg, i) => (
            <FormRow key={i}>
              <FormField md={8}>
                <TextField
                  select
                  label={`To (leg ${i + 1})`}
                  fullWidth
                  value={leg.to}
                  disabled={!editable}
                  onChange={(e) => {
                    const legs = [...job.routing.legs];
                    legs[i] = { ...legs[i], to: e.target.value };
                    onChange({ ...job, routing: { ...job.routing, legs } });
                  }}
                >
                  {airports.map((a) => (
                    <MenuItem key={a.code} value={a.code}>
                      {a.code} — {a.name}
                    </MenuItem>
                  ))}
                </TextField>
              </FormField>
              <FormField md={4}>
                <TextField
                  label="By"
                  fullWidth
                  value={leg.by}
                  disabled={!editable}
                  onChange={(e) => {
                    const legs = [...job.routing.legs];
                    legs[i] = { ...legs[i], by: e.target.value };
                    onChange({ ...job, routing: { ...job.routing, legs } });
                  }}
                />
              </FormField>
            </FormRow>
          ))}
          <FormRow>
            <FormField md={12}>
              <TextField
                label="Destination"
                fullWidth
                value={job.routing.destination}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, routing: { ...job.routing, destination: e.target.value } })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Account No."
                fullWidth
                value={job.routing.accountNo}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, routing: { ...job.routing, accountNo: e.target.value } })}
              />
            </FormField>
            <FormField md={6}>
              <TextField label="HS Code" fullWidth value={job.routing.hsCode} disabled={!editable} onChange={(e) => onChange({ ...job, routing: { ...job.routing, hsCode: e.target.value } })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField
                label="Flight No. 1"
                fullWidth
                value={job.routing.flightNo1}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, routing: { ...job.routing, flightNo1: e.target.value } })}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Flight No. 2"
                fullWidth
                value={job.routing.flightNo2}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, routing: { ...job.routing, flightNo2: e.target.value } })}
              />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.routing.flightDate}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, routing: { ...job.routing, flightDate: e.target.value } })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Form E No." fullWidth value={job.routing.formENo} disabled={!editable} onChange={(e) => onChange({ ...job, routing: { ...job.routing, formENo: e.target.value } })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.routing.formEDate}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, routing: { ...job.routing, formEDate: e.target.value } })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Shipper Invoice No."
                fullWidth
                value={job.routing.shipperInvoiceNo}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, routing: { ...job.routing, shipperInvoiceNo: e.target.value } })}
              />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.routing.shipperInvoiceDate}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, routing: { ...job.routing, shipperInvoiceDate: e.target.value } })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="S/B No." fullWidth value={job.routing.sbNo} disabled={!editable} onChange={(e) => onChange({ ...job, routing: { ...job.routing, sbNo: e.target.value } })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="S/B Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.routing.sbDate}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, routing: { ...job.routing, sbDate: e.target.value } })}
              />
            </FormField>
          </FormRow>

          <SectionHeader>Agents &amp; References</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Clearing Agent"
                fullWidth
                value={job.agents.clearingAgent}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, agents: { ...job.agents, clearingAgent: e.target.value } })}
              >
                {clearingAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField
                select
                label="Delivery Agent"
                fullWidth
                value={job.agents.deliveryAgent}
                disabled={!editable}
                onChange={(e) => onChange({ ...job, agents: { ...job.agents, deliveryAgent: e.target.value } })}
              >
                {deliveryAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField select label="SPO Code" fullWidth value={job.agents.spoCode} disabled={!editable} onChange={(e) => onChange({ ...job, agents: { ...job.agents, spoCode: e.target.value } })}>
                {spoCodes.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={2}>
              <TextField label="Run No." fullWidth value={job.agents.runNo} disabled={!editable} onChange={(e) => onChange({ ...job, agents: { ...job.agents, runNo: e.target.value } })} />
            </FormField>
            <FormField md={2}>
              <TextField label="Prefix" fullWidth value={job.agents.prefix} disabled={!editable} onChange={(e) => onChange({ ...job, agents: { ...job.agents, prefix: e.target.value } })} />
            </FormField>
            <FormField md={4}>
              <TextField label="RO No." fullWidth value={job.agents.roNo} disabled={!editable} onChange={(e) => onChange({ ...job, agents: { ...job.agents, roNo: e.target.value } })} />
            </FormField>
          </FormRow>

          <SectionHeader>Shipment</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Status" fullWidth value={job.shipmentStatus} disabled={!editable} onChange={(e) => set('shipmentStatus', e.target.value)}>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
                <MenuItem value="CLOSED">Closed</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={job.shipmentStatusDate}
                disabled={!editable}
                onChange={(e) => set('shipmentStatusDate', e.target.value)}
              />
            </FormField>
          </FormRow>
        </Grid>

        {/* RIGHT COLUMN — 2.4 Insurance/Handling/Currency, 2.5 Charges grid, 2.6 Totals, 2.7 Notes, 2.8 Linked grids */}
        <Grid item xs={12} md={6}>
          <FormRow>
            <FormField md={6}>
              <TextField label="Insurance" type="number" fullWidth value={job.insurance} disabled={!editable} onChange={(e) => set('insurance', Number(e.target.value))} />
            </FormField>
            <FormField md={6}>
              <TextField label="Declared Val Carraige" type="number" fullWidth value={job.declaredValCarriage} disabled={!editable} onChange={(e) => set('declaredValCarriage', Number(e.target.value))} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Declared Val Customs" type="number" fullWidth value={job.declaredValCustoms} disabled={!editable} onChange={(e) => set('declaredValCustoms', Number(e.target.value))} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField
                label="Handling Information"
                fullWidth
                multiline
                minRows={2}
                value={job.handlingInformation}
                disabled={!editable}
                onChange={(e) => set('handlingInformation', e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField select label="Currency" fullWidth value={job.currency} disabled={!editable} onChange={(e) => set('currency', e.target.value)}>
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField label="Ex. Rate" type="number" fullWidth value={job.exRate} disabled={!editable} onChange={(e) => set('exRate', Number(e.target.value))} />
            </FormField>
            <FormField md={4}>
              <TextField label="Printable Ex. Rate" type="number" fullWidth value={job.printableExRate} disabled={!editable} onChange={(e) => set('printableExRate', Number(e.target.value))} />
            </FormField>
          </FormRow>

          <SectionHeader>2.5 Charges Grid</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>RCP</TableCell>
                  <TableCell>Pcs</TableCell>
                  <TableCell>Gross Wt.</TableCell>
                  <TableCell>Cl</TableCell>
                  <TableCell>Comdty</TableCell>
                  <TableCell>Charge Wt.</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Total PKR</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {job.chargeLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField
                        variant="standard"
                        value={line.rcp}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { rcp: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 60 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.pcs}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { pcs: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.grossWt}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { grossWt: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 50 }}>
                      <TextField variant="standard" value={line.cl} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { cl: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" value={line.comdty} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { comdty: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.chargeWt}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { chargeWt: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.rate}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { rate: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>{line.total.toFixed(2)}</TableCell>
                    <TableCell>{line.totalPkr.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeChargeLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addChargeLine} sx={{ m: 1 }}>
              Add Charge Line
            </Button>
          </Paper>

          <SectionHeader>2.6 Totals</SectionHeader>
          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Grid container spacing={1}>
              <TotalRow label="Freight" value={job.totals.freight} valuePkr={job.totals.freightPkr} />
              <TotalRow label="Due Carrier" value={job.totals.dueCarrier} valuePkr={job.totals.dueCarrierPkr} />
              <TotalRow label="Due Agent" value={job.totals.dueAgent} valuePkr={job.totals.dueAgentPkr} />
              <TotalRow label="Total AWB Amount" value={job.totals.totalAwbAmount} valuePkr={job.totals.totalAwbAmountPkr} highlight />
              <TotalRow label="Total K.B. Amount" value={job.totals.totalKbAmount} />
              <TotalRow label="Commission" value={job.totals.commission} />
              <TotalRow label="WHT Amount" value={job.totals.whtAmount} />
              <TotalRow label="Payable To Airline" value={job.totals.payableToAirline} valuePkr={job.totals.payableToAirlinePkr} highlight />
            </Grid>
          </Paper>

          <SectionHeader>2.7 Notes Blocks &amp; Invoice Flag</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField
                label="Accounting Information / Notify"
                fullWidth
                multiline
                minRows={2}
                value={job.accountingInformationNotify}
                disabled={!editable}
                onChange={(e) => set('accountingInformationNotify', e.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Said To Contain" fullWidth multiline minRows={2} value={job.saidToContain} disabled={!editable} onChange={(e) => set('saidToContain', e.target.value)} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Other Information" fullWidth multiline minRows={2} value={job.otherInformation} disabled={!editable} onChange={(e) => set('otherInformation', e.target.value)} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Invoice Required" fullWidth value={job.invoiceRequired} disabled={!editable} onChange={(e) => set('invoiceRequired', e.target.value as 'Y' | 'N')}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Local Invoice (Y/N)" fullWidth value={job.localInvoice} disabled={!editable} onChange={(e) => set('localInvoice', e.target.value as 'Y' | 'N')}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </FormRow>

          <SectionHeader>2.8 Linked Records</SectionHeader>
          <LinkedGrid title="Local/International Invoices" empty={job.linkedInvoices.length === 0}>
            <TableHead>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Curr</TableCell>
                <TableCell>F/Amount</TableCell>
                <TableCell>PKR Amount</TableCell>
                <TableCell>Final</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {job.linkedInvoices.map((inv, i) => (
                <TableRow key={i}>
                  <TableCell>{inv.no}</TableCell>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.type}</TableCell>
                  <TableCell>{inv.curr}</TableCell>
                  <TableCell>{inv.fAmount}</TableCell>
                  <TableCell>{inv.pkrAmount}</TableCell>
                  <TableCell>{inv.final ? 'Y' : 'N'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </LinkedGrid>

          {job.kind === 'MAWB' && (
            <LinkedGrid title="House Air Waybills" empty={job.houseAwbs.length === 0}>
              <TableHead>
                <TableRow>
                  <TableCell>Job No.</TableCell>
                  <TableCell>HAWB No.</TableCell>
                  <TableCell>RUN No.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {job.houseAwbs.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell>{h.jobNo}</TableCell>
                    <TableCell>{h.hawbNo}</TableCell>
                    <TableCell>{h.runNo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </LinkedGrid>
          )}

          <LinkedGrid title="C/N Details" empty={job.creditNoteDetails.length === 0}>
            <TableHead>
              <TableRow>
                <TableCell>HAWB No.</TableCell>
                <TableCell>RUN No.</TableCell>
                <TableCell>C/N No.</TableCell>
                <TableCell>Manual C/N</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {job.creditNoteDetails.map((creditNote, index) => (
                <TableRow key={index}>
                  <TableCell>{creditNote.hawbNo}</TableCell>
                  <TableCell>{creditNote.runNo}</TableCell>
                  <TableCell>{creditNote.cnNo}</TableCell>
                  <TableCell>{creditNote.manualCn ? 'Y' : 'N'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </LinkedGrid>

          <LinkedGrid title="USED/CLEARED in Vouchers" empty={job.usedClearedVouchers.length === 0}>
            <TableHead>
              <TableRow>
                <TableCell>Voucher No.</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {job.usedClearedVouchers.map((v, i) => (
                <TableRow key={i}>
                  <TableCell>{v.voucherNo}</TableCell>
                  <TableCell>{v.voucherDate}</TableCell>
                  <TableCell>{v.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </LinkedGrid>
        </Grid>
      </Grid>
    </Box>
  );
}

function TotalRow({ label, value, valuePkr, highlight }: { label: string; value: number; valuePkr?: number; highlight?: boolean }) {
  return (
    <>
      <Grid item xs={6}>
        <Typography variant="body2" sx={{ fontWeight: highlight ? 700 : 400 }}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={valuePkr !== undefined ? 3 : 6}>
        <Typography variant="body2" align="right" sx={{ fontWeight: highlight ? 700 : 400, color: highlight ? 'primary.main' : 'inherit' }}>
          {value.toFixed(2)}
        </Typography>
      </Grid>
      {valuePkr !== undefined && (
        <Grid item xs={3}>
          <Typography variant="body2" align="right" sx={{ fontWeight: highlight ? 700 : 400, color: highlight ? 'primary.main' : 'inherit' }}>
            {valuePkr.toFixed(2)}
          </Typography>
        </Grid>
      )}
    </>
  );
}

function LinkedGrid({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small">{children}</Table>
        {empty && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', p: 1 }}>
            No records found.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}

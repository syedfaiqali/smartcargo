import { useEffect, useState } from 'react';
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
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Tooltip from '@mui/material/Tooltip';
import Link from '@mui/material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Job } from '../../../domain/job';
import { SectionCard, SectionCardRow, SectionCardField } from '../../../components/SectionCard';
import { navyTrustColors, navyTrustHeadingFontFamily } from '../../../theme/navyTrustTheme';
import { airportRepo, currencyRepo, ownerRepo, partyRepo, foreignAgentRepo, agentRepo, spoRepo } from '../../../data/masterDataService';
import { jobRepo } from '../../../data/jobService';
import { getLocalInvoiceLinksForJob } from '../../../data/localInvoiceService';
import { recomputeChargeLineTotal, recomputeJobTotals } from '../jobCalculations';
import { useNavigate } from 'react-router-dom';

interface EntryTabProps {
  job: Job;
  editable: boolean;
  onChange: (job: Job) => void;
}

export function EntryTab({ job, editable, onChange }: EntryTabProps) {
  const navigate = useNavigate();
  const [dimensionCalculatorOpen, setDimensionCalculatorOpen] = useState(false);
  const [dimensionTargetLineId, setDimensionTargetLineId] = useState<string | null>(null);
  const owners = ownerRepo.list();
  const parties = partyRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const airports = airportRepo.list();
  const currencies = currencyRepo.list();
  const clearingAgents = agentRepo.find((a) => a.kind === 'CLEARING');
  const deliveryAgents = agentRepo.find((a) => a.kind === 'DELIVERY');
  const spoCodes = spoRepo.list();
  const masterJobs = job.kind === 'HAWB' ? jobRepo.find((j) => j.kind === 'MAWB') : [];
  const linkedInvoices = getLocalInvoiceLinksForJob(job.jobNo);
  const calculationRows = [
    { label: 'Freight', foreign: job.totals.freight, pkr: job.totals.freightPkr },
    { label: 'Due Carrier', foreign: job.totals.dueCarrier, pkr: job.totals.dueCarrierPkr },
    { label: 'Due Agent', foreign: job.totals.dueAgent, pkr: job.totals.dueAgentPkr },
    { label: 'Total AWB Amount', foreign: job.totals.totalAwbAmount, pkr: job.totals.totalAwbAmountPkr, total: true },
    { label: 'Total K.B. Amount', foreign: job.totals.totalKbAmount, pkr: job.totals.totalKbAmount },
    { label: 'Commission', foreign: job.totals.commission, pkr: job.totals.commission },
    { label: 'WHT Amount', foreign: job.totals.whtAmount, pkr: job.totals.whtAmount },
    { label: 'Payable To Airline', foreign: job.totals.payableToAirline, pkr: job.totals.payableToAirlinePkr, total: true },
  ];

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

  const updateChargeLine = (id: string, patch: Partial<Job['chargeLines'][number]>, useDimensionWeight = false) => {
    const lines = job.chargeLines.map((l) => {
      if (l.id !== id) return l;
      const updated = { ...l, ...patch };
      return recomputeChargeLineTotal(updated, job.exRate, useDimensionWeight);
    });
    const updatedJob = { ...job, chargeLines: lines };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  const updateExchangeRate = (exRate: number) => {
    const updatedJob = {
      ...job,
      exRate,
      chargeLines: job.chargeLines.map((line) => recomputeChargeLineTotal(line, exRate)),
    };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  const applyDimensionWeight = (dimensionWt: number) => {
    const targetId = dimensionTargetLineId ?? job.chargeLines[0]?.id;
    const target = job.chargeLines.find((line) => line.id === targetId);
    if (!target || target.dimensionWt === dimensionWt) return;
    updateChargeLine(target.id, { dimensionWt }, true);
  };

  const updateCurrency = (currency: string) => {
    const selectedCurrency = currencies.find((item) => item.code === currency);
    const exRate = selectedCurrency?.defaultExchangeRate ?? job.exRate;
    const updatedJob = {
      ...job,
      currency,
      exRate,
      printableExRate: exRate,
      chargeLines: job.chargeLines.map((line) => recomputeChargeLineTotal(line, exRate)),
    };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  const removeChargeLine = (id: string) => {
    const updatedJob = { ...job, chargeLines: job.chargeLines.filter((l) => l.id !== id) };
    onChange({ ...updatedJob, totals: recomputeJobTotals(updatedJob) });
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={6}>
          <SectionCard number="1.1" title="Primary Identifiers" tint="blue" meta={`SC-ID: ${job.jobNo || '—'}`}>
            <SectionCardRow>
              <SectionCardField md={3}>
                <TextField label="Branch Office" fullWidth value={job.branch} disabled={!editable} onChange={(e) => set('branch', e.target.value)} />
              </SectionCardField>
              <SectionCardField md={3}>
                <TextField label="Job No." fullWidth value={job.jobNo} disabled helperText="System generated" />
              </SectionCardField>
              <SectionCardField md={3}>
                <TextField
                  label="Job Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={job.jobDate}
                  disabled={!editable}
                  onChange={(e) => set('jobDate', e.target.value)}
                />
              </SectionCardField>
              <SectionCardField md={3}>
                <TextField label="Nomination" select fullWidth value={job.nomination} disabled={!editable} onChange={(e) => set('nomination', e.target.value as 'Y' | 'N')}>
                  <MenuItem value="N">N - Standard</MenuItem>
                  <MenuItem value="Y">Y - Nominated</MenuItem>
                </TextField>
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={6}>
                {job.kind === 'HAWB' ? (
                  <TextField label="HAWB No." fullWidth value={job.hawbNo ?? ''} disabled />
                ) : (
                  <TextField label="MAWB Serial Number" fullWidth value={job.mawbNo} disabled={!editable} onChange={(e) => set('mawbNo', e.target.value)} placeholder="From AWB Stock" />
                )}
              </SectionCardField>
              <SectionCardField md={6}>
                <TextField label="Quotation Reference" fullWidth value={job.quotRefNo} disabled={!editable} onChange={(e) => set('quotRefNo', e.target.value)} />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField select label="Owner" fullWidth value={job.owner} disabled={!editable} onChange={(e) => set('owner', e.target.value)}>
                  {owners.map((o) => (
                    <MenuItem key={o.code} value={o.code}>
                      {o.code} — {o.name}
                    </MenuItem>
                  ))}
                </TextField>
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField
                  label="Sales Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={job.saleDate}
                  disabled={!editable}
                  onChange={(e) => set('saleDate', e.target.value)}
                />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={12}>
                <TextField label="Job Type" select fullWidth value={job.jobType} disabled={!editable} onChange={(e) => set('jobType', e.target.value)}>
                  <MenuItem value="EXPORT">Export</MenuItem>
                  <MenuItem value="TRANSSHIPMENT">Transshipment</MenuItem>
                  <MenuItem value="CONSOLIDATION">Consolidation</MenuItem>
                </TextField>
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={4}>
                <TextField
                  label="AWB Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={job.awbDate}
                  disabled={!editable || job.kind === 'HAWB'}
                  onChange={(e) => set('awbDate', e.target.value)}
                />
              </SectionCardField>
              <SectionCardField md={3}>
                <TextField label="Charge Code" fullWidth value={job.chargeCode} disabled={!editable} onChange={(e) => set('chargeCode', e.target.value)} />
              </SectionCardField>
              <SectionCardField md={5}>
                <TextField label="Station" fullWidth value={job.station} disabled={!editable} onChange={(e) => set('station', e.target.value)} />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={job.kind === 'HAWB' ? 4 : 12}>
                <TextField label="IncoTerm" fullWidth value={job.incoTerm} disabled={!editable} onChange={(e) => set('incoTerm', e.target.value)} />
              </SectionCardField>
              {job.kind === 'HAWB' && (
                <SectionCardField md={8}>
                  <TextField
                    select
                    label="Master Job No. (MAWB)"
                    fullWidth
                    value={job.parentJobNo ?? ''}
                    disabled={!editable}
                    onChange={(e) => setParentJobNo(e.target.value)}
                    helperText="A House job is always created against a parent Job (MAWB)"
                  >
                    {masterJobs.map((m) => (
                      <MenuItem key={m.jobNo} value={m.jobNo}>
                        {m.jobNo} — MAWB {m.mawbNo || '(unassigned)'}
                      </MenuItem>
                    ))}
                  </TextField>
                </SectionCardField>
              )}
            </SectionCardRow>
          </SectionCard>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <SectionCard number="1.2" title={job.kind === 'HAWB' ? 'Shipper (Actual)' : 'Shipper / Consignor'} tint="mint">
                <SectionCardRow>
                  <SectionCardField md={8}>
                    <TextField select label="Party Code" fullWidth value={job.party.partyCode} disabled={!editable} onChange={(e) => setParty(e.target.value)}>
                      {parties.map((p) => (
                        <MenuItem key={p.code} value={p.code}>
                          {p.code} — {p.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </SectionCardField>
                  <SectionCardField md={4}>
                    <TextField label="Credit Limit" fullWidth value={job.party.creditLimit} disabled />
                  </SectionCardField>
                </SectionCardRow>
                <SectionCardRow>
                  <SectionCardField md={12}>
                    <TextField
                      select
                      label="Agent Party"
                      fullWidth
                      value={job.party.agentParty}
                      disabled={!editable}
                      onChange={(e) => onChange({ ...job, party: { ...job.party, agentParty: e.target.value } })}
                    >
                      <MenuItem value="">— Select Agent Party —</MenuItem>
                      {parties.map((party) => (
                        <MenuItem key={party.code} value={party.code}>
                          {party.code} — {party.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </SectionCardField>
                </SectionCardRow>
                <SectionCardRow>
                  <SectionCardField md={12}>
                    <TextField label="Full Name" fullWidth value={job.party.name} disabled />
                  </SectionCardField>
                </SectionCardRow>
                <SectionCardRow>
                  <SectionCardField md={12}>
                    <TextField label="Address" fullWidth multiline minRows={2} value={job.party.address} disabled />
                  </SectionCardField>
                </SectionCardRow>
              </SectionCard>
            </Grid>

            <Grid item xs={12} sm={6}>
              <SectionCard number="1.3" title={job.kind === 'HAWB' ? 'Consignee (Actual)' : 'Consignee'} tint="lavender">
                <SectionCardRow>
                  <SectionCardField md={5}>
                    <TextField
                      select
                      label="Consolidation"
                      fullWidth
                      value={job.consignee.consolidation}
                      disabled={!editable}
                      onChange={(e) => onChange({ ...job, consignee: { ...job.consignee, consolidation: e.target.value as 'Y' | 'N' } })}
                    >
                      <MenuItem value="N">N</MenuItem>
                      <MenuItem value="Y">Y</MenuItem>
                    </TextField>
                  </SectionCardField>
                  <SectionCardField md={7}>
                    <TextField select label="Foreign Agent Code" fullWidth value={job.consignee.code} disabled={!editable || job.consignee.consolidation !== 'Y'} onChange={(e) => setConsigneeCode(e.target.value)}>
                      {foreignAgents.map((a) => (
                        <MenuItem key={a.code} value={a.code}>
                          {a.code} — {a.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </SectionCardField>
                </SectionCardRow>
                <SectionCardRow>
                  <SectionCardField md={12}>
                    <TextField label="Full Name" fullWidth value={job.consignee.name} disabled />
                  </SectionCardField>
                </SectionCardRow>
                <SectionCardRow>
                  <SectionCardField md={12}>
                    <TextField label="Address" fullWidth multiline minRows={2} value={job.consignee.address} disabled />
                  </SectionCardField>
                </SectionCardRow>
              </SectionCard>
            </Grid>
          </Grid>

          <SectionCard number="1.4" title="Routing &amp; Shipment Details" tint="cyan">
            <SectionCardRow>
              <SectionCardField md={4}>
                <TextField label="CC Port" fullWidth value={job.routing.ccPort} disabled={!editable} onChange={(e) => onChange({ ...job, routing: { ...job.routing, ccPort: e.target.value } })} />
              </SectionCardField>
              <SectionCardField md={8}>
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
              </SectionCardField>
            </SectionCardRow>
            {job.routing.legs.map((leg, i) => (
              <SectionCardRow key={i}>
                <SectionCardField md={8}>
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
                </SectionCardField>
                <SectionCardField md={4}>
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
                </SectionCardField>
              </SectionCardRow>
            ))}
            <SectionCardRow>
              <SectionCardField md={12}>
                <TextField
                  label="Destination"
                  fullWidth
                  value={job.routing.destination}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, routing: { ...job.routing, destination: e.target.value } })}
                />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField
                  label="Account No."
                  fullWidth
                  value={job.routing.accountNo}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, routing: { ...job.routing, accountNo: e.target.value } })}
                />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField label="HS Code" fullWidth value={job.routing.hsCode} disabled={!editable} onChange={(e) => onChange({ ...job, routing: { ...job.routing, hsCode: e.target.value } })} />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={4}>
                <TextField
                  label="Flight No. 1"
                  fullWidth
                  value={job.routing.flightNo1}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, routing: { ...job.routing, flightNo1: e.target.value } })}
                />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField
                  label="Flight No. 2"
                  fullWidth
                  value={job.routing.flightNo2}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, routing: { ...job.routing, flightNo2: e.target.value } })}
                />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={job.routing.flightDate}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, routing: { ...job.routing, flightDate: e.target.value } })}
                />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField label="Form E No." fullWidth value={job.routing.formENo} disabled={!editable} onChange={(e) => onChange({ ...job, routing: { ...job.routing, formENo: e.target.value } })} />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={job.routing.formEDate}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, routing: { ...job.routing, formEDate: e.target.value } })}
                />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField
                  label="Shipper Invoice No."
                  fullWidth
                  value={job.routing.shipperInvoiceNo}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, routing: { ...job.routing, shipperInvoiceNo: e.target.value } })}
                />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={job.routing.shipperInvoiceDate}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, routing: { ...job.routing, shipperInvoiceDate: e.target.value } })}
                />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField label="S/B No." fullWidth value={job.routing.sbNo} disabled={!editable} onChange={(e) => onChange({ ...job, routing: { ...job.routing, sbNo: e.target.value } })} />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField
                  label="S/B Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={job.routing.sbDate}
                  disabled={!editable}
                  onChange={(e) => onChange({ ...job, routing: { ...job.routing, sbDate: e.target.value } })}
                />
              </SectionCardField>
            </SectionCardRow>
          </SectionCard>

          <SectionCard number="1.5" title="Agents &amp; References" tint="purple">
            <SectionCardRow>
              <SectionCardField md={6}>
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
              </SectionCardField>
              <SectionCardField md={6}>
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
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={5}>
                <TextField select label="SPO Code" fullWidth value={job.agents.spoCode} disabled={!editable} onChange={(e) => onChange({ ...job, agents: { ...job.agents, spoCode: e.target.value } })}>
                  {spoCodes.map((s) => (
                    <MenuItem key={s.code} value={s.code}>
                      {s.code} — {s.description}
                    </MenuItem>
                  ))}
                </TextField>
              </SectionCardField>
              <SectionCardField md={2}>
                <TextField label="Run No." fullWidth value={job.agents.runNo} disabled={!editable} onChange={(e) => onChange({ ...job, agents: { ...job.agents, runNo: e.target.value } })} />
              </SectionCardField>
              <SectionCardField md={2}>
                <TextField label="Prefix" fullWidth value={job.agents.prefix} disabled={!editable} onChange={(e) => onChange({ ...job, agents: { ...job.agents, prefix: e.target.value } })} />
              </SectionCardField>
              <SectionCardField md={3}>
                <TextField label="RO No." fullWidth value={job.agents.roNo} disabled={!editable} onChange={(e) => onChange({ ...job, agents: { ...job.agents, roNo: e.target.value } })} />
              </SectionCardField>
            </SectionCardRow>
          </SectionCard>

          <SectionCard number="1.6" title="Shipment Status" tint="slate">
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField select label="Status" fullWidth value={job.shipmentStatus} disabled={!editable} onChange={(e) => set('shipmentStatus', e.target.value)}>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_TRANSIT">In Transit</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                </TextField>
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={job.shipmentStatusDate}
                  disabled={!editable}
                  onChange={(e) => set('shipmentStatusDate', e.target.value)}
                />
              </SectionCardField>
            </SectionCardRow>
          </SectionCard>
        </Grid>

        {/* RIGHT COLUMN */}
        <Grid item xs={12} md={6}>
          <SectionCard number="1.7" title="Insurance, Handling &amp; Currency" tint="peach">
            <SectionCardRow>
              <SectionCardField md={6}>
                <TextField label="Insurance" fullWidth value={job.insurance} disabled={!editable} onChange={(e) => set('insurance', e.target.value)} />
              </SectionCardField>
              <SectionCardField md={6}>
                <TextField label="Declared Val Carraige" fullWidth value={job.declaredValCarriage} disabled={!editable} onChange={(e) => set('declaredValCarriage', e.target.value)} />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={12}>
                <TextField label="Declared Val Customs" fullWidth value={job.declaredValCustoms} disabled={!editable} onChange={(e) => set('declaredValCustoms', e.target.value)} />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={12}>
                <TextField
                  label="Handling Information"
                  fullWidth
                  multiline
                  minRows={2}
                  value={job.handlingInformation}
                  disabled={!editable}
                  onChange={(e) => set('handlingInformation', e.target.value)}
                />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={6}>
                <TextField select label="Currency" fullWidth value={job.currency} disabled={!editable} onChange={(e) => updateCurrency(e.target.value)}>
                  {currencies.map((c) => (
                    <MenuItem key={c.code} value={c.code}>
                      {c.code} - {c.name.toUpperCase()}
                    </MenuItem>
                  ))}
                </TextField>
              </SectionCardField>
              <SectionCardField md={3}>
                <TextField label="Ex. Rate" type="number" fullWidth value={formatNumber(job.exRate, 6)} disabled={!editable} inputProps={{ step: '0.000001' }} onChange={(e) => updateExchangeRate(Number(e.target.value))} />
              </SectionCardField>
              <SectionCardField md={3}>
                <TextField label="Printable Ex. Rate" type="number" fullWidth value={formatNumber(job.printableExRate, 6)} disabled={!editable} inputProps={{ step: '0.000001' }} onChange={(e) => set('printableExRate', Number(e.target.value))} />
              </SectionCardField>
            </SectionCardRow>
          </SectionCard>

          <SectionCard number="1.8" title="Charges Grid" tint="rose">
            <Paper variant="outlined" sx={{ overflowX: 'auto', borderColor: navyTrustColors.border }}>
            <Table size="small" sx={chargesGridTableSx}>
              <TableHead>
                <TableRow>
                  <TableCell>RCP</TableCell>
                  <TableCell>Pcs</TableCell>
                  <TableCell>Gross Wt.</TableCell>
                  <TableCell>Cl</TableCell>
                  <TableCell>Comdty</TableCell>
                  <TableCell sx={{ minWidth: 130 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                      Charge Wt.
                      <Tooltip title="Open Dimension Calculator">
                        <IconButton size="small" color="primary" onClick={() => { setDimensionTargetLineId(dimensionTargetLineId ?? job.chargeLines[0]?.id ?? null); setDimensionCalculatorOpen(true); }} sx={{ ml: 0.5, p: 0.25 }}>
                          <ViewInArIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{job.currency === 'PKR' ? 'Rate (Foreign)' : `Rate ${job.currency}`}</TableCell>
                  <TableCell>Rate PKR</TableCell>
                  <TableCell>{job.currency === 'PKR' ? 'Total (Foreign)' : `Total ${job.currency}`}</TableCell>
                  <TableCell>Total PKR</TableCell>
                  <TableCell>Dimension Wt.</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {job.chargeLines.map((line, index) => (
                  <TableRow key={line.id} onClick={() => setDimensionTargetLineId(line.id)} onBlur={() => updateChargeLine(line.id, {})}>
                    <TableCell sx={{ minWidth: 70 }}>
                      {index === 0 ? (
                        <TextField
                          variant="standard"
                          value={line.rcp}
                          disabled={!editable}
                          onChange={(e) => updateChargeLine(line.id, { rcp: e.target.value })}
                        />
                      ) : (
                        <TextField
                          select
                          variant="standard"
                          value={line.rcp || 'NEW'}
                          disabled={!editable}
                          onChange={(e) => updateChargeLine(line.id, { rcp: e.target.value })}
                        >
                          {['NEW', 'INT', 'D/C', 'FAR', 'SCN'].map((rcp) => <MenuItem key={rcp} value={rcp}>{rcp}</MenuItem>)}
                        </TextField>
                      )}
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
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={formatNumber(line.grossWt, 2)}
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
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={formatNumber(line.chargeWt, 2)}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { chargeWt: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={formatNumber(line.rate, 4)}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { rate: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={formatNumber(line.ratePkr, 4)}
                        InputProps={{ readOnly: true }}
                      />
                    </TableCell>
                    <TableCell>{formatAmount(line.total, 4)}</TableCell>
                    <TableCell>{formatAmount(line.totalPkr, 2)}</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={formatNumber(line.dimensionWt, 2)}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { dimensionWt: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeChargeLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
            {job.chargeLines.some((line) => line.dimensionWt > 0 && line.dimensionWt < line.chargeWt) && (
              <Typography variant="body2" color="error" sx={{ mt: 0.75, fontWeight: 700 }}>
                ★ Dimension Weight is less than Charge Weight.
              </Typography>
            )}
          </SectionCard>

          <Box sx={{ bgcolor: '#0f1c33', borderRadius: '14px', p: 2.5, mb: 2, color: '#e6ebf5' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1.15fr 0.9fr 0.9fr', alignItems: 'center', columnGap: 1, mb: 1.5 }}>
              <Typography sx={{ fontFamily: navyTrustHeadingFontFamily, fontSize: 13.5, fontWeight: 700, color: '#fff' }}>Shipment financials</Typography>
              <Typography align="right" sx={{ fontSize: 11.5, fontWeight: 800, color: '#ff8b9a' }}>PKR</Typography>
              <Typography align="right" sx={{ fontSize: 11.5, fontWeight: 800, color: '#a5e66d' }}>PKR</Typography>
            </Box>
            {calculationRows.map((row, index) => (
              <Box
                key={row.label}
                sx={{
                  display: 'grid', gridTemplateColumns: '1.15fr 0.9fr 0.9fr', alignItems: 'center', columnGap: 1,
                  py: row.total ? 0.9 : 0.55,
                  mt: index === 4 ? 1 : 0,
                  borderTop: index === 4 ? '1px solid rgba(255,255,255,0.16)' : undefined,
                  borderRadius: row.total ? 1 : 0,
                  px: row.total ? 1 : 0,
                  bgcolor: row.total ? 'rgba(57, 157, 255, 0.18)' : 'transparent',
                }}
              >
                <Typography sx={{ fontSize: 13, fontWeight: row.total ? 800 : 400, color: row.total ? '#fff' : 'rgba(230,235,245,0.78)' }}>{row.label}</Typography>
                <Typography align="right" sx={{ fontFamily: row.total ? navyTrustHeadingFontFamily : undefined, fontSize: row.total ? 16 : 13, fontWeight: 800, color: row.total ? '#5fd0ff' : '#e6ebf5' }}>
                  {formatAmount(row.foreign, 2)}
                </Typography>
                <Typography align="right" sx={{ fontFamily: row.total ? navyTrustHeadingFontFamily : undefined, fontSize: row.total ? 16 : 13, fontWeight: 800, color: row.total ? '#5fd0ff' : '#e6ebf5' }}>
                  {formatAmount(row.pkr, 2)}
                </Typography>
              </Box>
            ))}
          </Box>

          <SectionCard number="1.10" title="Notes &amp; Invoice Flags" tint="green">
          <SectionCardRow>
            <SectionCardField md={12}>
              <TextField
                label="Accounting Information / Notify"
                fullWidth
                multiline
                minRows={2}
                value={job.accountingInformationNotify}
                disabled={!editable}
                onChange={(e) => set('accountingInformationNotify', e.target.value)}
              />
            </SectionCardField>
          </SectionCardRow>
          <SectionCardRow>
            <SectionCardField md={12}>
              <TextField label="Said To Contain" fullWidth multiline minRows={2} value={job.saidToContain} disabled={!editable} onChange={(e) => set('saidToContain', e.target.value)} />
            </SectionCardField>
          </SectionCardRow>
          <SectionCardRow>
            <SectionCardField md={12}>
              <TextField label="Other Information" fullWidth multiline minRows={2} value={job.otherInformation} disabled={!editable} onChange={(e) => set('otherInformation', e.target.value)} />
            </SectionCardField>
          </SectionCardRow>
          <SectionCardRow>
            <SectionCardField md={3}>
              <TextField select label="Invoice Required" fullWidth value={job.invoiceRequired} disabled={!editable} onChange={(e) => set('invoiceRequired', e.target.value as 'Y' | 'N')}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </SectionCardField>
            <SectionCardField md={3}>
              <TextField select label="Local Invoice (Y/N)" fullWidth value={job.localInvoice} disabled={!editable} onChange={(e) => set('localInvoice', e.target.value as 'Y' | 'N')}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </SectionCardField>
          </SectionCardRow>
          </SectionCard>

          <SectionCard number="1.11" title="Linked Records" tint="slate">
          <LinkedGrid title="Local/International Invoices" empty={linkedInvoices.length === 0}>
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
              {linkedInvoices.map((inv, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Link component="button" type="button" onClick={() => navigate('/freight/air-export/local-invoices', { state: { invoiceId: inv.invoiceId } })} sx={{ fontWeight: 700, textAlign: 'left' }}>
                      {inv.no}
                    </Link>
                  </TableCell>
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
          </SectionCard>
        </Grid>
      </Grid>
      <DimensionCalculatorDialog open={dimensionCalculatorOpen} onClose={() => setDimensionCalculatorOpen(false)} onWeightChange={applyDimensionWeight} />
    </Box>
  );
}

/**
 * Keeps the Charges Grid's header cells and underlined inputs vertically aligned:
 * fixed row height, top-aligned multi-line headers, and a stable hover tint
 * instead of the old click-to-"select" row highlight (which made rows look
 * randomly shaded rather than consistently laid out).
 */
const chargesGridTableSx = {
  tableLayout: 'auto',
  '& .MuiTableCell-root': {
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    borderColor: navyTrustColors.border,
  },
  '& .MuiTableHead-root .MuiTableCell-root': {
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
    lineHeight: 1.3,
  },
  '& .MuiTableBody-root .MuiTableRow-root:hover': {
    backgroundColor: '#fafbfc',
  },
  '& .MuiInput-underline:before': { borderBottomColor: navyTrustColors.border },
} as const;

function formatNumber(value: number, decimals: number): string {
  return Number(value || 0).toFixed(decimals);
}

function formatAmount(value: number, decimals: number): string {
  return Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

interface DimensionLine {
  id: string;
  pcs: number;
  length: number;
  width: number;
  height: number;
}

function DimensionCalculatorDialog({ open, onClose, onWeightChange }: { open: boolean; onClose: () => void; onWeightChange: (weight: number) => void }) {
  const [divisor, setDivisor] = useState(6000);
  const [lines, setLines] = useState<DimensionLine[]>([]);

  const updateLine = (id: string, patch: Partial<DimensionLine>) => {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  };
  // The legacy calculator labels this as CBM, but derives it from the selected
  // air-cargo divisor (for example: pcs × L × W × H ÷ 6,000,000 for divisor 6000).
  const totalCbm = lines.reduce((total, line) => total + (line.pcs * line.length * line.width * line.height) / (divisor * 1000), 0);
  const totalWeight = lines.reduce((total, line) => total + (line.pcs * line.length * line.width * line.height) / divisor, 0);

  useEffect(() => {
    if (open && lines.length > 0) onWeightChange(totalWeight);
  }, [lines.length, onWeightChange, open, totalWeight]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'primary.dark', fontWeight: 700 }}>
        Dimension Calculator
        <IconButton aria-label="Close dimension calculator" onClick={onClose} color="error"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item><Typography variant="body2" sx={{ fontWeight: 700 }}>Select Type</Typography></Grid>
          <Grid item xs={12} sm={4}>
            <TextField select size="small" fullWidth value={divisor} onChange={(event) => setDivisor(Number(event.target.value))}>
              <MenuItem value={6000}>Air Cargo (Cm) - 6000</MenuItem>
              <MenuItem value={5000}>Air Cargo (Cm) - 5000</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Pcs.</TableCell>
                <TableCell>Length (cm)</TableCell>
                <TableCell>Width (cm)</TableCell>
                <TableCell>Height (cm)</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Total (Weight Kg)</TableCell>
                <TableCell>CBM</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((line) => {
                const volume = line.length * line.width * line.height;
                const weight = (line.pcs * volume) / divisor;
                const cbm = weight / 1000;
                return (
                  <TableRow key={line.id}>
                    <TableCell><IconButton size="small" color="error" onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))}><DeleteIcon fontSize="small" /></IconButton></TableCell>
                    {(['pcs', 'length', 'width', 'height'] as const).map((field) => <TableCell key={field}><TextField size="small" type="number" value={line[field]} inputProps={{ min: 0 }} onChange={(event) => updateLine(line.id, { [field]: Number(event.target.value) })} /></TableCell>)}
                    <TableCell>{formatNumber(volume, 2)}</TableCell>
                    <TableCell>{formatNumber(weight, 2)}</TableCell>
                    <TableCell>{formatNumber(cbm, 2)}</TableCell>
                  </TableRow>
                );
              })}
              {lines.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center" sx={{ color: 'text.secondary' }}>No dimension lines added.</TableCell></TableRow>
              )}
              <TableRow sx={{ '& td': { fontWeight: 700 } }}>
                <TableCell colSpan={5}>Total</TableCell>
                <TableCell />
                <TableCell>{formatNumber(totalWeight, 2)}</TableCell>
                <TableCell>{formatNumber(totalCbm, 3)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
        <Button startIcon={<AddIcon />} onClick={() => setLines((current) => [...current, { id: crypto.randomUUID(), pcs: 1, length: 0, width: 0, height: 0 }])} sx={{ mt: 1 }}>Add Dimension Line</Button>
      </DialogContent>
    </Dialog>
  );
}


function LinkedGrid({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: navyTrustColors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.3 }}>
        {title}
      </Typography>
      {empty ? (
        <Box sx={{ textAlign: 'center', py: 3, color: navyTrustColors.textSecondary }}>
          <DescriptionOutlinedIcon sx={{ fontSize: 26, opacity: 0.5, mb: 0.75 }} />
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: navyTrustColors.textPrimary }}>No records found</Typography>
          <Typography sx={{ fontSize: 12 }}>Linked {title.toLowerCase()} will appear here.</Typography>
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ overflowX: 'auto', borderColor: navyTrustColors.border, mt: 0.5 }}>
          <Table size="small">{children}</Table>
        </Paper>
      )}
    </Box>
  );
}

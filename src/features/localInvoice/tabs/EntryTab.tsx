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
import Typography from '@mui/material/Typography';
import { SectionCard, SectionCardRow, SectionCardField } from '../../../components/SectionCard';
import { navyTrustColors } from '../../../theme/navyTrustTheme';
import { LocalInvoice } from '../../../domain/localInvoice';
import { jobRepo } from '../../../data/jobService';
import { lookupJobRef } from '../../../data/localInvoiceService';
import {
  airportRepo,
  bankRepo,
  currencyRepo,
  ownerRepo,
  partyRepo,
  spoRepo,
} from '../../../data/masterDataService';
import { recomputeInvoiceLine, recomputeInvoiceTotals } from '../invoiceCalculations';

interface EntryTabProps {
  invoice: LocalInvoice;
  editable: boolean;
  onChange: (invoice: LocalInvoice) => void;
}

export function EntryTab({ invoice, editable, onChange }: EntryTabProps) {
  const owners = ownerRepo.list();
  const parties = partyRepo.list();
  const airports = airportRepo.list();
  const currencies = currencyRepo.list();
  const spoCodes = spoRepo.list();
  const banks = bankRepo.list();
  const masterJobs = jobRepo.find((j) => j.kind === 'MAWB');
  const houseJobs = jobRepo.find((j) => j.kind === 'HAWB');

  const apply = (patch: Partial<LocalInvoice>) => onChange(recomputeInvoiceTotals({ ...invoice, ...patch }));

  const setHouseJobNo = (jobNo: string) => {
    const ref = lookupJobRef(jobNo);
    if (!ref) {
      apply({ house: { jobNo: '', jobDate: '', awbNo: '', awbDate: '', pp: '', refNo: '' } });
      return;
    }
    apply({ house: { jobNo: ref.jobNo, jobDate: ref.jobDate, awbNo: ref.awbNo, awbDate: ref.awbDate, pp: '', refNo: '' } });
  };

  const setMasterJobNo = (jobNo: string) => {
    const ref = lookupJobRef(jobNo);
    if (!ref) {
      apply({ master: { jobNo: '', jobDate: '', awbNo: '', awbDate: '', pp: '', refNo: '' } });
      return;
    }
    const { job } = ref;
    apply({
      master: { jobNo: ref.jobNo, jobDate: ref.jobDate, awbNo: ref.awbNo, awbDate: ref.awbDate, pp: '', refNo: '' },
      jobYear: Number(job.jobDate.slice(0, 4)) || invoice.jobYear,
      jobType: job.jobType,
      ccPort: job.routing.ccPort,
      ownerCode: job.owner,
      partyCode: job.party.partyCode,
      partyName: job.party.name,
      partyAddress: job.party.address,
      agentParty: job.party.agentParty,
      airportOfDeparture: job.routing.airportOfDeparture,
      destination: job.routing.destination,
      formENo: job.routing.formENo,
      formEDate: job.routing.formEDate,
      sbNo: job.routing.sbNo,
      sbDate: job.routing.sbDate,
      shipperInvoiceNo: job.routing.shipperInvoiceNo,
      shipperInvoiceDate: job.routing.shipperInvoiceDate,
      spoCode: job.agents.spoCode,
      postInPkr: job.currency === 'PKR' ? 'Y' : 'N',
      currency1: job.currency,
      exRate1: job.exRate,
      consignee: job.consignee.name,
      dueCarrierLines: job.charges.dueCarrierLines.map((line) => ({ ...line })),
      dueAgentLines: job.charges.dueAgentLines.map((line) => ({ ...line })),
      invoiceLines: job.chargeLines.map((line) => ({
        id: uuid(),
        pcs: line.pcs,
        grossWeight: line.grossWt,
        cl: line.cl,
        comdty: line.comdty,
        chWeight: line.chargeWt,
        curr: job.currency,
        rate: line.rate,
        ratePkr: line.ratePkr,
        freight: line.total,
        freightPkr: line.totalPkr,
      })),
      airwayBillLines: job.chargeLines.map((line) => ({
        id: uuid(),
        pcs: line.pcs,
        grossWeight: line.grossWt,
        cl: line.cl,
        comdty: line.comdty,
        chWeight: line.chargeWt,
        rate: line.rate,
        ratePkr: line.ratePkr,
        freight: line.total,
        freightPkr: line.totalPkr,
        netNet: 0,
        netRate: 0,
        kbPercent: 0,
        kbAmount: 0,
      })),
      awbCommissionAmount: job.totals.commission,
      awbPayableToAirline: job.totals.payableToAirline,
      awbExchangeRate: job.exRate,
      agreedRate: job.kb.shipperAgreedRate,
      agreedFreight: job.kb.shipperAgreedFreight,
      kbRatePercent: job.kb.kbAdjustment === 'Y' ? 100 : 0,
    });
  };

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    apply({ partyCode, partyName: p?.name ?? '', partyAddress: p?.address ?? '' });
  };

  const setBankCode = (bankCode: string) => {
    const b = banks.find((x) => x.code === bankCode);
    apply({ bankCode, bankDetailText: b?.accountDetail ?? '' });
  };

  // --- Invoice grid (4.5) ---
  const updateInvoiceLine = (id: string, patch: Partial<LocalInvoice['invoiceLines'][number]>) => {
    const invoiceLines = invoice.invoiceLines.map((l) => (l.id === id ? recomputeInvoiceLine({ ...l, ...patch }, invoice.exRate1) : l));
    apply({ invoiceLines });
  };

  // --- Airway Bill grid (4.6) ---
  return (
    <Box>
      <Grid container spacing={2}>
        {/* LEFT COLUMN — 4.2 Job Identification & Party */}
        <Grid item xs={12} md={5}>
          <SectionCard number="4.1" title="Invoice Identifiers">
            <SectionCardRow>
              <SectionCardField md={3}>
                <TextField label="Branch" fullWidth value={invoice.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField label="Invoice No." fullWidth value={invoice.invoiceNo} disabled />
              </SectionCardField>
              <SectionCardField md={5}>
                <TextField
                  label="Invoice Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={invoice.invoiceDate}
                  disabled={!editable}
                  onChange={(e) => apply({ invoiceDate: e.target.value })}
                />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={3}>
                <TextField label="Job Year" type="number" fullWidth value={invoice.jobYear} disabled={!editable} onChange={(e) => apply({ jobYear: Number(e.target.value) })} />
              </SectionCardField>
              <SectionCardField md={5}>
                <TextField label="Job Type" fullWidth value={invoice.jobType} disabled={!editable} onChange={(e) => apply({ jobType: e.target.value })} />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField label="CC Port" fullWidth value={invoice.ccPort} disabled={!editable} onChange={(e) => apply({ ccPort: e.target.value })} />
              </SectionCardField>
            </SectionCardRow>
          </SectionCard>

          <SectionCard number="4.2" title="House">
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField select label="Job No. (HAWB)" fullWidth value={invoice.house.jobNo} disabled={!editable} onChange={(e) => setHouseJobNo(e.target.value)}>
                  <MenuItem value="">(none)</MenuItem>
                  {houseJobs.map((j) => (
                    <MenuItem key={j.jobNo} value={j.jobNo}>
                      {j.jobNo} — HAWB {j.hawbNo || '(unassigned)'}
                    </MenuItem>
                  ))}
                </TextField>
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField label="Job Date" fullWidth value={invoice.house.jobDate} disabled />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={5}>
                <TextField label="AWB No." fullWidth value={invoice.house.awbNo} disabled />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField label="AWB Date" fullWidth value={invoice.house.awbDate} disabled />
              </SectionCardField>
              <SectionCardField md={3}>
                <TextField label="PP" fullWidth value={invoice.house.pp} disabled={!editable} onChange={(e) => apply({ house: { ...invoice.house, pp: e.target.value } })} />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={12}>
                <TextField label="Ref No" fullWidth value={invoice.house.refNo} disabled={!editable} onChange={(e) => apply({ house: { ...invoice.house, refNo: e.target.value } })} />
              </SectionCardField>
            </SectionCardRow>
          </SectionCard>

          <SectionCard number="4.3" title="Master">
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField select label="Job No. (MAWB)" fullWidth value={invoice.master.jobNo} disabled={!editable} onChange={(e) => setMasterJobNo(e.target.value)}>
                  <MenuItem value="">(none)</MenuItem>
                  {masterJobs.map((j) => (
                    <MenuItem key={j.jobNo} value={j.jobNo}>
                      {j.jobNo} — MAWB {j.mawbNo || '(unassigned)'}
                    </MenuItem>
                  ))}
                </TextField>
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField label="Job Date" fullWidth value={invoice.master.jobDate} disabled />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={5}>
                <TextField label="AWB No." fullWidth value={invoice.master.awbNo} disabled />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField label="AWB Date" fullWidth value={invoice.master.awbDate} disabled />
              </SectionCardField>
              <SectionCardField md={3}>
                <TextField label="PP" fullWidth value={invoice.master.pp} disabled={!editable} onChange={(e) => apply({ master: { ...invoice.master, pp: e.target.value } })} />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={12}>
                <TextField label="Ref No" fullWidth value={invoice.master.refNo} disabled={!editable} onChange={(e) => apply({ master: { ...invoice.master, refNo: e.target.value } })} />
              </SectionCardField>
            </SectionCardRow>
          </SectionCard>

          <SectionCard number="4.4" title="Party">
            <SectionCardRow>
              <SectionCardField md={12}>
                <TextField
                  select
                  label="Move Charges from Last Party Invoice"
                  fullWidth
                  value={invoice.moveChargesFromLastPartyInvoice ?? 'N'}
                  disabled={!editable}
                  onChange={(e) => apply({ moveChargesFromLastPartyInvoice: e.target.value as 'Y' | 'N' })}
                >
                  <MenuItem value="N">N</MenuItem>
                  <MenuItem value="Y">Y</MenuItem>
                </TextField>
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={6}>
                <TextField select label="Owner Code" fullWidth value={invoice.ownerCode} disabled={!editable} onChange={(e) => apply({ ownerCode: e.target.value })}>
                  {owners.map((o) => (
                    <MenuItem key={o.code} value={o.code}>
                      {o.code} — {o.name}
                    </MenuItem>
                  ))}
                </TextField>
              </SectionCardField>
              <SectionCardField md={6}>
                <TextField select label="Party Code" fullWidth value={invoice.partyCode} disabled={!editable} onChange={(e) => setPartyCode(e.target.value)}>
                  {parties.map((p) => (
                    <MenuItem key={p.code} value={p.code}>
                      {p.code} — {p.name}
                    </MenuItem>
                  ))}
                </TextField>
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={6}>
                <TextField label="Name" fullWidth value={invoice.partyName} disabled />
              </SectionCardField>
              <SectionCardField md={6}>
                <TextField label="Address" fullWidth value={invoice.partyAddress} disabled />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={12}>
                <TextField label="Agent's Party" fullWidth value={invoice.agentParty} disabled={!editable} onChange={(e) => apply({ agentParty: e.target.value })} />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={3}>
                <TextField select label="A/Port of Dep" fullWidth value={invoice.airportOfDeparture} disabled={!editable} onChange={(e) => apply({ airportOfDeparture: e.target.value })}>
                  {airports.map((a) => (
                    <MenuItem key={a.code} value={a.code}>
                      {a.code}
                    </MenuItem>
                  ))}
                </TextField>
              </SectionCardField>
              <SectionCardField md={6}>
                <TextField label="Destination" fullWidth value={invoice.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })} />
              </SectionCardField>
              <SectionCardField md={3}>
                <TextField select label="Spo Code" fullWidth value={invoice.spoCode} disabled={!editable} onChange={(e) => apply({ spoCode: e.target.value })}>
                  {spoCodes.map((s) => (
                    <MenuItem key={s.code} value={s.code}>
                      {s.code}
                    </MenuItem>
                  ))}
                </TextField>
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField label="Form E No." fullWidth value={invoice.formENo} disabled={!editable} onChange={(e) => apply({ formENo: e.target.value })} />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={invoice.formEDate}
                  disabled={!editable}
                  onChange={(e) => apply({ formEDate: e.target.value })}
                />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField label="S/B No." fullWidth value={invoice.sbNo} disabled={!editable} onChange={(e) => apply({ sbNo: e.target.value })} />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField
                  label="S/B Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={invoice.sbDate}
                  disabled={!editable}
                  onChange={(e) => apply({ sbDate: e.target.value })}
                />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={8}>
                <TextField label="Shipper Inv.No." fullWidth value={invoice.shipperInvoiceNo} disabled={!editable} onChange={(e) => apply({ shipperInvoiceNo: e.target.value })} />
              </SectionCardField>
              <SectionCardField md={4}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={invoice.shipperInvoiceDate}
                  disabled={!editable}
                  onChange={(e) => apply({ shipperInvoiceDate: e.target.value })}
                />
              </SectionCardField>
            </SectionCardRow>

            <SectionCardRow>
              <SectionCardField md={4}>
                <TextField select label="Post in PKR Currency (Y/N)" fullWidth value={invoice.postInPkr} disabled={!editable} onChange={(e) => apply({ postInPkr: e.target.value as 'Y' | 'N' })}>
                  <MenuItem value="N">N</MenuItem>
                  <MenuItem value="Y">Y</MenuItem>
                </TextField>
              </SectionCardField>
            </SectionCardRow>
            {[1, 2, 3].map((n) => {
              const currKey = `currency${n}` as 'currency1' | 'currency2' | 'currency3';
              const rateKey = `exRate${n}` as 'exRate1' | 'exRate2' | 'exRate3';
              return (
                <SectionCardRow key={n}>
                  <SectionCardField md={4}>
                    <TextField select label={`Currency ${n}`} fullWidth value={invoice[currKey]} disabled={!editable} onChange={(e) => apply({ [currKey]: e.target.value } as Partial<LocalInvoice>)}>
                      <MenuItem value="">(none)</MenuItem>
                      {currencies.map((c) => (
                        <MenuItem key={c.code} value={c.code}>
                          {c.code}
                        </MenuItem>
                      ))}
                    </TextField>
                  </SectionCardField>
                  <SectionCardField md={8}>
                    <TextField
                      label="Ex.Rate"
                      type="number"
                      fullWidth
                      value={invoice[rateKey]}
                      disabled={!editable}
                      onChange={(e) => apply({ [rateKey]: Number(e.target.value) } as Partial<LocalInvoice>)}
                    />
                  </SectionCardField>
                </SectionCardRow>
              );
            })}

            <SectionCardRow>
              <SectionCardField md={12}>
                <TextField label="Consignee" fullWidth multiline minRows={2} value={invoice.consignee} disabled={!editable} onChange={(e) => apply({ consignee: e.target.value })} />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={12}>
                <TextField
                  label="Printable Remarks"
                  fullWidth
                  multiline
                  minRows={2}
                  value={invoice.printableRemarks}
                  disabled={!editable}
                  onChange={(e) => apply({ printableRemarks: e.target.value })}
                />
              </SectionCardField>
            </SectionCardRow>
            <SectionCardRow>
              <SectionCardField md={7}>
                <TextField select label="Bank Code" fullWidth value={invoice.bankCode} disabled={!editable} onChange={(e) => setBankCode(e.target.value)}>
                  <MenuItem value="">(none)</MenuItem>
                  {banks.map((b) => (
                    <MenuItem key={b.code} value={b.code}>
                      {b.code} — {b.name}
                    </MenuItem>
                  ))}
                </TextField>
              </SectionCardField>
              <SectionCardField md={5}>
                <TextField label="Bank Detail" fullWidth value={invoice.bankDetailText} disabled={!editable} onChange={(e) => apply({ bankDetailText: e.target.value })} />
              </SectionCardField>
            </SectionCardRow>
          </SectionCard>
        </Grid>

        {/* MIDDLE COLUMN — 4.5 Due Carrier/Agent, 4.6/4.7 grids */}
        <Grid item xs={12} md={4}>
          <SectionCard number="4.5" title="Due Carrier Charges">
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2, borderColor: navyTrustColors.border }}>
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
                {invoice.dueCarrierLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 130 }}>{line.label}</TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.rate}
                        disabled={!editable}
                        onChange={(e) => {
                          const dueCarrierLines = invoice.dueCarrierLines.map((l) => (l.id === line.id ? { ...l, rate: Number(e.target.value) } : l));
                          apply({ dueCarrierLines });
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField
                        select
                        variant="standard"
                        value={line.cwGwBasis}
                        disabled={!editable}
                        onChange={(e) => {
                          const dueCarrierLines = invoice.dueCarrierLines.map((l) => (l.id === line.id ? { ...l, cwGwBasis: e.target.value as 'CW' | 'GW' } : l));
                          apply({ dueCarrierLines });
                        }}
                      >
                        <MenuItem value="CW">CW</MenuItem>
                        <MenuItem value="GW">GW</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.charges}
                        disabled={!editable}
                        onChange={(e) => {
                          const dueCarrierLines = invoice.dueCarrierLines.map((l) => (l.id === line.id ? { ...l, charges: Number(e.target.value) } : l));
                          apply({ dueCarrierLines });
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.chargesPkr}
                        disabled={!editable}
                        onChange={(e) => {
                          const dueCarrierLines = invoice.dueCarrierLines.map((l) => (l.id === line.id ? { ...l, chargesPkr: Number(e.target.value) } : l));
                          apply({ dueCarrierLines });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total Due Carrier</TableCell>
                  <TableCell colSpan={3} />
                  <TableCell sx={{ fontWeight: 700 }}>{invoice.totalDueCarrier.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
          </SectionCard>

          <SectionCard number="4.6" title="Due Agent Charges">
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2, borderColor: navyTrustColors.border }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Due Agent</TableCell>
                  <TableCell>Charges</TableCell>
                  <TableCell>Charges (PKR)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.dueAgentLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 130 }}>
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
                        onChange={(e) => {
                          const dueAgentLines = invoice.dueAgentLines.map((l) => (l.id === line.id ? { ...l, chargesForeign: Number(e.target.value) } : l));
                          apply({ dueAgentLines });
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.chargesPkr}
                        disabled={!editable}
                        onChange={(e) => {
                          const dueAgentLines = invoice.dueAgentLines.map((l) => (l.id === line.id ? { ...l, chargesPkr: Number(e.target.value) } : l));
                          apply({ dueAgentLines });
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total Due Agent</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{invoice.totalDueAgent.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </Paper>

          <TextField
            label="Non-Printable Remarks"
            fullWidth
            multiline
            minRows={2}
            value={invoice.nonPrintableRemarks}
            disabled={!editable}
            onChange={(e) => apply({ nonPrintableRemarks: e.target.value })}
          />
          </SectionCard>

          <SectionCard number="4.7" title="Invoice Grid">
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2, borderColor: navyTrustColors.border }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pcs</TableCell>
                  <TableCell>Gr.Wt</TableCell>
                  <TableCell>Cl</TableCell>
                  <TableCell>Comdty</TableCell>
                  <TableCell>Ch.Wt</TableCell>
                  <TableCell>Curr</TableCell>
                  <TableCell>Rate {invoice.currency1 || 'Foreign'}</TableCell>
                  <TableCell>Rate PKR</TableCell>
                  <TableCell>Freight {invoice.currency1 || 'Foreign'}</TableCell>
                  <TableCell>Freight PKR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.invoiceLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 55 }}>
                      <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateInvoiceLine(line.id, { pcs: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.grossWeight} disabled={!editable} onChange={(e) => updateInvoiceLine(line.id, { grossWeight: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 50 }}>
                      <TextField variant="standard" value={line.cl} disabled={!editable} onChange={(e) => updateInvoiceLine(line.id, { cl: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" value={line.comdty} disabled={!editable} onChange={(e) => updateInvoiceLine(line.id, { comdty: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.chWeight} disabled={!editable} onChange={(e) => updateInvoiceLine(line.id, { chWeight: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" value={line.curr} disabled={!editable} onChange={(e) => updateInvoiceLine(line.id, { curr: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateInvoiceLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.ratePkr} disabled={!editable} onChange={(e) => updateInvoiceLine(line.id, { ratePkr: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>{line.freight.toFixed(4)}</TableCell>
                    <TableCell>{line.freightPkr.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          </SectionCard>

          <SectionCard number="4.8" title="Airway Bill Grid (KB Reconciliation)">
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2, borderColor: navyTrustColors.border }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pcs</TableCell>
                  <TableCell>Gross Wt.</TableCell>
                  <TableCell>Cl</TableCell>
                  <TableCell>Comdty</TableCell>
                  <TableCell>Ch.Wt</TableCell>
                  <TableCell>Rate {invoice.currency1 || 'Foreign'}</TableCell>
                  <TableCell>Rate PKR</TableCell>
                  <TableCell>Freight {invoice.currency1 || 'Foreign'}</TableCell>
                  <TableCell>Freight PKR</TableCell>
                  <TableCell>Net Net</TableCell>
                  <TableCell>Net Rate</TableCell>
                  <TableCell>KB %</TableCell>
                  <TableCell>KB Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.airwayBillLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 55 }}>
                      <TextField variant="standard" type="number" value={line.pcs} disabled />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.grossWeight} disabled />
                    </TableCell>
                    <TableCell sx={{ minWidth: 50 }}>
                      <TextField variant="standard" value={line.cl} disabled />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" value={line.comdty} disabled />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.chWeight} disabled />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.ratePkr} disabled />
                    </TableCell>
                    <TableCell>{line.freight.toFixed(4)}</TableCell>
                    <TableCell>{line.freightPkr.toFixed(2)}</TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.netNet} disabled />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.netRate} disabled />
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" type="number" value={line.kbPercent} disabled />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{line.kbAmount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          <Grid container spacing={1.5}>
            <Grid item xs={4}>
              <TextField
                label="Commission Amount"
                type="number"
                fullWidth
                value={invoice.awbCommissionAmount}
                disabled={!editable}
                onChange={(e) => apply({ awbCommissionAmount: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Payable A/L"
                type="number"
                fullWidth
                value={invoice.awbPayableToAirline}
                disabled={!editable}
                onChange={(e) => apply({ awbPayableToAirline: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                label="Exchange Rate"
                type="number"
                fullWidth
                value={invoice.awbExchangeRate}
                disabled={!editable}
                onChange={(e) => apply({ awbExchangeRate: Number(e.target.value) })}
              />
            </Grid>
          </Grid>
          </SectionCard>
        </Grid>

        {/* RIGHT COLUMN — 4.9 Tax, Commission & Totals */}
        <Grid item xs={12} md={3}>
          <SectionCard number="4.9" title="Tax, Commission &amp; Totals">
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <TextField label="Sales Tax (%) / PST" type="number" fullWidth value={invoice.salesTaxPercent} disabled={!editable} onChange={(e) => apply({ salesTaxPercent: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12}>
              <TotalReadout label="Amount" value={invoice.pstAmount} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="PRA / Tax" type="number" fullWidth value={invoice.praTax} disabled={!editable} onChange={(e) => apply({ praTax: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="WHT Sales Tax (%)"
                type="number"
                fullWidth
                value={invoice.whtSalesTaxPercent}
                disabled={!editable}
                onChange={(e) => apply({ whtSalesTaxPercent: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12}>
              <TotalReadout label="Amount" value={invoice.whtSalesTaxAmount} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Sales Tax Invoice No."
                fullWidth
                value={invoice.salesTaxInvoiceNo}
                disabled={!editable}
                onChange={(e) => apply({ salesTaxInvoiceNo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="PRA/SRB Tax Inv. No."
                fullWidth
                value={invoice.praSrbTaxInvoiceNo}
                disabled={!editable}
                onChange={(e) => apply({ praSrbTaxInvoiceNo: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 1.5, borderColor: navyTrustColors.border }}>
                <TotalReadout label="Total Freight" value={invoice.totalFreight} />
                <TotalReadout label="Total Due Carrier" value={invoice.totalDueCarrier} />
                <TotalReadout label="Total Due Agent" value={invoice.totalDueAgent} />
                <TotalReadout label="Gross Invoice Amount" value={invoice.grossInvoiceAmount} highlight />
              </Paper>
            </Grid>

            <Grid item xs={7}>
              <TextField label="Commission (%)" type="number" fullWidth value={invoice.commissionPercent} disabled={!editable} onChange={(e) => apply({ commissionPercent: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={5}>
              <TotalReadout label="Amount" value={invoice.commissionAmount} />
            </Grid>
            <Grid item xs={7}>
              <TextField label="WHT (%)" type="number" fullWidth value={invoice.whtPercent} disabled={!editable} onChange={(e) => apply({ whtPercent: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={5}>
              <TotalReadout label="Amount" value={invoice.whtAmount} />
            </Grid>

            <Grid item xs={6}>
              <TextField select label="Net Rate (Y/N)" fullWidth value={invoice.netRate} disabled={!editable} onChange={(e) => apply({ netRate: e.target.value as 'Y' | 'N' })}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField label="Agreed Rate" type="number" fullWidth value={invoice.agreedRate} disabled={!editable} onChange={(e) => apply({ agreedRate: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Agreed Freight" type="number" fullWidth value={invoice.agreedFreight} disabled={!editable} onChange={(e) => apply({ agreedFreight: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={6}>
              <TotalReadout label="Freight Diff." value={invoice.freightDifference} />
            </Grid>
            <Grid item xs={7}>
              <TextField label="K.B. Rate (%)" type="number" fullWidth value={invoice.kbRatePercent} disabled={!editable} onChange={(e) => apply({ kbRatePercent: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={5}>
              <TotalReadout label="K.B. Amount" value={invoice.kbAmount} highlight />
            </Grid>

            <Grid item xs={12}>
              <TextField label="Total Discount" type="number" fullWidth value={invoice.totalDiscount} disabled={!editable} onChange={(e) => apply({ totalDiscount: Number(e.target.value) })} />
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: navyTrustColors.headerBg, borderColor: navyTrustColors.border }}>
                <TotalReadout label="Invoice Total" value={invoice.invoiceTotal} highlight />
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                label="Print Incentive/Commission/WHT (Y/N)"
                fullWidth
                value={invoice.printIncentiveCommissionWht}
                disabled={!editable}
                onChange={(e) => apply({ printIncentiveCommissionWht: e.target.value as 'Y' | 'N' })}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          </SectionCard>

          <SectionCard number="4.10" title="Receipts">
          <Paper variant="outlined" sx={{ overflowX: 'auto', borderColor: navyTrustColors.border }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Receipt No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.receipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <Typography variant="caption" color="text.secondary">
                        No receipts recorded.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoice.receipts.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.receiptNo}</TableCell>
                      <TableCell>{r.receiptDate}</TableCell>
                      <TableCell>{r.amount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
}

function TotalReadout({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <Grid container sx={{ py: 0.25 }}>
      <Grid item xs={7}>
        <Typography variant="body2" sx={{ fontWeight: highlight ? 700 : 400 }}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={5}>
        <Typography variant="body2" align="right" sx={{ fontWeight: highlight ? 700 : 400, color: highlight ? navyTrustColors.navy : 'inherit' }}>
          {value.toFixed(2)}
        </Typography>
      </Grid>
    </Grid>
  );
}

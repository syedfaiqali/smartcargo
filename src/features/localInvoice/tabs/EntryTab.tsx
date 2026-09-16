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
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormRow, FormField, SectionHeader } from '../../../components/FormGrid';
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
import { recomputeAirwayBillLine, recomputeInvoiceLine, recomputeInvoiceTotals } from '../invoiceCalculations';

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
    apply({
      master: { jobNo: ref.jobNo, jobDate: ref.jobDate, awbNo: ref.awbNo, awbDate: ref.awbDate, pp: '', refNo: '' },
      ccPort: invoice.ccPort || ref.job.routing.ccPort,
      airportOfDeparture: invoice.airportOfDeparture || ref.job.routing.airportOfDeparture,
      destination: invoice.destination || ref.job.routing.destination,
      formENo: invoice.formENo || ref.job.routing.formENo,
      formEDate: invoice.formEDate || ref.job.routing.formEDate,
      sbNo: invoice.sbNo || ref.job.routing.sbNo,
      sbDate: invoice.sbDate || ref.job.routing.sbDate,
      shipperInvoiceNo: invoice.shipperInvoiceNo || ref.job.routing.shipperInvoiceNo,
      shipperInvoiceDate: invoice.shipperInvoiceDate || ref.job.routing.shipperInvoiceDate,
      spoCode: invoice.spoCode || ref.job.agents.spoCode,
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
  const addInvoiceLine = () => {
    apply({
      invoiceLines: [
        ...invoice.invoiceLines,
        { id: uuid(), pcs: 0, grossWeight: 0, cl: '', comdty: '', chWeight: 0, curr: invoice.currency1, rate: 0, ratePkr: 0, freight: 0, freightPkr: 0 },
      ],
    });
  };
  const updateInvoiceLine = (id: string, patch: Partial<LocalInvoice['invoiceLines'][number]>) => {
    const invoiceLines = invoice.invoiceLines.map((l) => (l.id === id ? recomputeInvoiceLine({ ...l, ...patch }, invoice.exRate1) : l));
    apply({ invoiceLines });
  };
  const removeInvoiceLine = (id: string) => apply({ invoiceLines: invoice.invoiceLines.filter((l) => l.id !== id) });

  // --- Airway Bill grid (4.6) ---
  const addAirwayBillLine = () => {
    apply({
      airwayBillLines: [
        ...invoice.airwayBillLines,
        { id: uuid(), pcs: 0, grossWeight: 0, cl: '', comdty: '', chWeight: 0, rate: 0, ratePkr: 0, freight: 0, freightPkr: 0, netNet: 0, netRate: 0, kbPercent: 0, kbAmount: 0 },
      ],
    });
  };
  const updateAirwayBillLine = (id: string, patch: Partial<LocalInvoice['airwayBillLines'][number]>) => {
    const airwayBillLines = invoice.airwayBillLines.map((l) => (l.id === id ? recomputeAirwayBillLine({ ...l, ...patch }) : l));
    apply({ airwayBillLines });
  };
  const removeAirwayBillLine = (id: string) => apply({ airwayBillLines: invoice.airwayBillLines.filter((l) => l.id !== id) });

  return (
    <Box
      sx={{
        '& .MuiInputBase-input, & .MuiSelect-select': { color: '#172554', fontWeight: 700 },
        '& .MuiInputLabel-root': { color: '#475569', fontWeight: 700 },
        '& .MuiInputBase-input.Mui-disabled, & .MuiSelect-select.Mui-disabled': {
          WebkitTextFillColor: '#172554',
          color: '#172554',
          opacity: 1,
          fontWeight: 700,
        },
        '& .MuiInputLabel-root.Mui-disabled': { color: '#475569', opacity: 1, fontWeight: 700 },
        '& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
      }}
    >
      <Grid container spacing={2}>
        {/* LEFT COLUMN — 4.2 Job Identification & Party */}
        <Grid item xs={12} md={5}>
          <FormRow>
            <FormField md={4}>
              <TextField label="Branch" fullWidth value={invoice.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Invoice No." fullWidth value={invoice.invoiceNo} disabled />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Invoice Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={invoice.invoiceDate}
                disabled={!editable}
                onChange={(e) => apply({ invoiceDate: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="Job Year" type="number" fullWidth value={invoice.jobYear} disabled={!editable} onChange={(e) => apply({ jobYear: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Job Type" fullWidth value={invoice.jobType} disabled={!editable} onChange={(e) => apply({ jobType: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label="CC Port" fullWidth value={invoice.ccPort} disabled={!editable} onChange={(e) => apply({ ccPort: e.target.value })} />
            </FormField>
          </FormRow>

          <SectionHeader>HOUSE</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Job No. (HAWB)" fullWidth value={invoice.house.jobNo} disabled={!editable} onChange={(e) => setHouseJobNo(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {houseJobs.map((j) => (
                  <MenuItem key={j.jobNo} value={j.jobNo}>
                    {j.jobNo} — HAWB {j.hawbNo || '(unassigned)'}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Job Date" fullWidth value={invoice.house.jobDate} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="AWB No." fullWidth value={invoice.house.awbNo} disabled />
            </FormField>
            <FormField md={4}>
              <TextField label="AWB Date" fullWidth value={invoice.house.awbDate} disabled />
            </FormField>
            <FormField md={4}>
              <TextField label="PP" fullWidth value={invoice.house.pp} disabled={!editable} onChange={(e) => apply({ house: { ...invoice.house, pp: e.target.value } })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Ref No" fullWidth value={invoice.house.refNo} disabled={!editable} onChange={(e) => apply({ house: { ...invoice.house, refNo: e.target.value } })} />
            </FormField>
          </FormRow>

          <SectionHeader>MASTER</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Job No. (MAWB)" fullWidth value={invoice.master.jobNo} disabled={!editable} onChange={(e) => setMasterJobNo(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {masterJobs.map((j) => (
                  <MenuItem key={j.jobNo} value={j.jobNo}>
                    {j.jobNo} — MAWB {j.mawbNo || '(unassigned)'}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Job Date" fullWidth value={invoice.master.jobDate} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="AWB No." fullWidth value={invoice.master.awbNo} disabled />
            </FormField>
            <FormField md={4}>
              <TextField label="AWB Date" fullWidth value={invoice.master.awbDate} disabled />
            </FormField>
            <FormField md={4}>
              <TextField label="PP" fullWidth value={invoice.master.pp} disabled={!editable} onChange={(e) => apply({ master: { ...invoice.master, pp: e.target.value } })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Ref No" fullWidth value={invoice.master.refNo} disabled={!editable} onChange={(e) => apply({ master: { ...invoice.master, refNo: e.target.value } })} />
            </FormField>
          </FormRow>

          <SectionHeader>Party</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Owner Code" fullWidth value={invoice.ownerCode} disabled={!editable} onChange={(e) => apply({ ownerCode: e.target.value })}>
                {owners.map((o) => (
                  <MenuItem key={o.code} value={o.code}>
                    {o.code} — {o.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Party Code" fullWidth value={invoice.partyCode} disabled={!editable} onChange={(e) => setPartyCode(e.target.value)}>
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Name" fullWidth value={invoice.partyName} disabled />
            </FormField>
            <FormField md={6}>
              <TextField label="Address" fullWidth value={invoice.partyAddress} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Agent's Party" fullWidth value={invoice.agentParty} disabled={!editable} onChange={(e) => apply({ agentParty: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField select label="A/Port of Dep" fullWidth value={invoice.airportOfDeparture} disabled={!editable} onChange={(e) => apply({ airportOfDeparture: e.target.value })}>
                {airports.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField label="Destination" fullWidth value={invoice.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField select label="Spo Code" fullWidth value={invoice.spoCode} disabled={!editable} onChange={(e) => apply({ spoCode: e.target.value })}>
                {spoCodes.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Form E No." fullWidth value={invoice.formENo} disabled={!editable} onChange={(e) => apply({ formENo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={invoice.formEDate}
                disabled={!editable}
                onChange={(e) => apply({ formEDate: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="S/B No." fullWidth value={invoice.sbNo} disabled={!editable} onChange={(e) => apply({ sbNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="S/B Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={invoice.sbDate}
                disabled={!editable}
                onChange={(e) => apply({ sbDate: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Shipper Inv.No." fullWidth value={invoice.shipperInvoiceNo} disabled={!editable} onChange={(e) => apply({ shipperInvoiceNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={invoice.shipperInvoiceDate}
                disabled={!editable}
                onChange={(e) => apply({ shipperInvoiceDate: e.target.value })}
              />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField md={4}>
              <TextField select label="Post in PKR Currency (Y/N)" fullWidth value={invoice.postInPkr} disabled={!editable} onChange={(e) => apply({ postInPkr: e.target.value as 'Y' | 'N' })}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          {[1, 2, 3].map((n) => {
            const currKey = `currency${n}` as 'currency1' | 'currency2' | 'currency3';
            const rateKey = `exRate${n}` as 'exRate1' | 'exRate2' | 'exRate3';
            return (
              <FormRow key={n}>
                <FormField md={6}>
                  <TextField select label={`Currency ${n}`} fullWidth value={invoice[currKey]} disabled={!editable} onChange={(e) => apply({ [currKey]: e.target.value } as Partial<LocalInvoice>)}>
                    <MenuItem value="">(none)</MenuItem>
                    {currencies.map((c) => (
                      <MenuItem key={c.code} value={c.code}>
                        {c.code}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
                <FormField md={6}>
                  <TextField
                    label="Ex.Rate"
                    type="number"
                    fullWidth
                    value={invoice[rateKey]}
                    disabled={!editable}
                    onChange={(e) => apply({ [rateKey]: Number(e.target.value) } as Partial<LocalInvoice>)}
                  />
                </FormField>
              </FormRow>
            );
          })}

          <FormRow>
            <FormField md={12}>
              <TextField label="Consignee" fullWidth multiline minRows={2} value={invoice.consignee} disabled={!editable} onChange={(e) => apply({ consignee: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField
                label="Printable Remarks"
                fullWidth
                multiline
                minRows={2}
                value={invoice.printableRemarks}
                disabled={!editable}
                onChange={(e) => apply({ printableRemarks: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Bank Code" fullWidth value={invoice.bankCode} disabled={!editable} onChange={(e) => setBankCode(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {banks.map((b) => (
                  <MenuItem key={b.code} value={b.code}>
                    {b.code} — {b.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Bank Detail" fullWidth value={invoice.bankDetailText} disabled={!editable} onChange={(e) => apply({ bankDetailText: e.target.value })} />
            </FormField>
          </FormRow>
        </Grid>

        {/* MIDDLE COLUMN — 4.4 Due Carrier/Agent, 4.5/4.6 grids */}
        <Grid item xs={12} md={4}>
          <SectionHeader>4.4 Due Carrier Charges</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
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

          <SectionHeader>Due Agent Charges</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
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
            sx={{ mb: 2 }}
          />

          <SectionHeader>4.5 Invoice Grid</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pcs</TableCell>
                  <TableCell>Gr.Wt</TableCell>
                  <TableCell>Cl</TableCell>
                  <TableCell>Comdty</TableCell>
                  <TableCell>Ch.Wt</TableCell>
                  <TableCell>Curr</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Freight PKR</TableCell>
                  <TableCell />
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
                    <TableCell>{line.freightPkr.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeInvoiceLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addInvoiceLine} sx={{ m: 1 }}>
              Add Invoice Line
            </Button>
          </Paper>

          <SectionHeader>4.6 Airway Bill Grid (KB Reconciliation)</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Pcs</TableCell>
                  <TableCell>Ch.Wt</TableCell>
                  <TableCell>Rate PKR</TableCell>
                  <TableCell>Freight PKR</TableCell>
                  <TableCell>Net Net</TableCell>
                  <TableCell>KB %</TableCell>
                  <TableCell>KB Amount</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.airwayBillLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 55 }}>
                      <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateAirwayBillLine(line.id, { pcs: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.chWeight} disabled={!editable} onChange={(e) => updateAirwayBillLine(line.id, { chWeight: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.ratePkr} disabled={!editable} onChange={(e) => updateAirwayBillLine(line.id, { ratePkr: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>{line.freightPkr.toFixed(2)}</TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.netNet} disabled={!editable} onChange={(e) => updateAirwayBillLine(line.id, { netNet: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" type="number" value={line.kbPercent} disabled={!editable} onChange={(e) => updateAirwayBillLine(line.id, { kbPercent: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{line.kbAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeAirwayBillLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addAirwayBillLine} sx={{ m: 1 }}>
              Add Airway Bill Line
            </Button>
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
        </Grid>

        {/* RIGHT COLUMN — 4.3 Tax, Commission & Totals */}
        <Grid item xs={12} md={3}>
          <SectionHeader>4.3 Tax, Commission &amp; Totals</SectionHeader>
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
              <Paper variant="outlined" sx={{ p: 1.5 }}>
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
              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f0f7ff' }}>
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

          <SectionHeader>Receipts</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
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
        <Typography variant="body2" align="right" sx={{ fontWeight: highlight ? 700 : 400, color: highlight ? 'primary.main' : 'inherit' }}>
          {value.toFixed(2)}
        </Typography>
      </Grid>
    </Grid>
  );
}

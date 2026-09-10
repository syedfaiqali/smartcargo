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
import { ForeignAgentInvoice } from '../../../domain/foreignAgentInvoice';
import { VariantConfig } from '../variantConfig';
import { jobRepo } from '../../../data/jobService';
import { getHouseJobsForMasterInvoice, lookupMasterJobForAgentInvoice } from '../../../data/foreignAgentInvoiceService';
import { airportRepo, bankRepo, currencyRepo, foreignAgentRepo } from '../../../data/masterDataService';
import { recomputeAgentInvoiceTotals } from '../agentInvoiceCalculations';

interface EntryTabProps {
  invoice: ForeignAgentInvoice;
  config: VariantConfig;
  editable: boolean;
  onChange: (invoice: ForeignAgentInvoice) => void;
}

export function EntryTab({ invoice, config, editable, onChange }: EntryTabProps) {
  const foreignAgents = foreignAgentRepo.list();
  const airports = airportRepo.list();
  const currencies = currencyRepo.list();
  const banks = bankRepo.list();
  const masterJobs = jobRepo.find((j) => j.kind === 'MAWB');
  const houseJobs = invoice.mawbJobNo ? getHouseJobsForMasterInvoice(invoice.mawbJobNo) : [];

  const apply = (patch: Partial<ForeignAgentInvoice>) => onChange(recomputeAgentInvoiceTotals({ ...invoice, ...patch }));

  const setMawbJobNo = (jobNo: string) => {
    const ref = lookupMasterJobForAgentInvoice(jobNo);
    if (!ref) {
      apply({ mawbJobNo: '', mawbNo: '', mawbDate: '' });
      return;
    }
    apply({ mawbJobNo: jobNo, mawbNo: ref.mawbNo, mawbDate: ref.mawbDate, mawbJobYear: ref.jobYear, origin: invoice.origin || ref.job.routing.airportOfDeparture, destination: invoice.destination || ref.job.routing.destination });
  };

  const setFAgentCode = (code: string) => {
    const a = foreignAgents.find((x) => x.code === code);
    apply({ fAgentCode: code, fAgentName: a?.name ?? '' });
  };

  const setBankCode = (bankCode: string) => {
    const b = banks.find((x) => x.code === bankCode);
    apply({ bankCode, bankDetailText: b?.accountDetail ?? '' });
  };

  // --- 6.4 Job/HAWB Allocation Grid ---
  const addAllocationLine = () => {
    apply({ allocationLines: [...invoice.allocationLines, { id: uuid(), jobNo: invoice.mawbJobNo, hawbNo: '', pcs: 0, grWeight: 0, chWeight: 0, cost: 0, partyName: '' }] });
  };
  const updateAllocationLine = (id: string, patch: Partial<ForeignAgentInvoice['allocationLines'][number]>) => {
    apply({ allocationLines: invoice.allocationLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeAllocationLine = (id: string) => apply({ allocationLines: invoice.allocationLines.filter((l) => l.id !== id) });
  const allocationTotals = invoice.allocationLines.reduce(
    (acc, l) => ({ pcs: acc.pcs + l.pcs, grWeight: acc.grWeight + l.grWeight, chWeight: acc.chWeight + l.chWeight, cost: acc.cost + l.cost }),
    { pcs: 0, grWeight: 0, chWeight: 0, cost: 0 }
  );

  // --- 6.5 Selling & Buying Charges ---
  const addChargeLine = (side: 'SELLING' | 'BUYING') => {
    apply({ chargeLines: [...invoice.chargeLines, { id: uuid(), side, code: '', description: '', rate: 0, charges: 0 }] });
  };
  const updateChargeLine = (id: string, patch: Partial<ForeignAgentInvoice['chargeLines'][number]>) => {
    apply({ chargeLines: invoice.chargeLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeChargeLine = (id: string) => apply({ chargeLines: invoice.chargeLines.filter((l) => l.id !== id) });
  const sellingLines = invoice.chargeLines.filter((l) => l.side === 'SELLING');
  const buyingLines = invoice.chargeLines.filter((l) => l.side === 'BUYING');

  // --- 6.6 Handling / Service Charges ---
  const addHandlingLine = () => {
    apply({ handlingLines: [...invoice.handlingLines, { id: uuid(), code: '', description: '', rate: 0, charges: 0 }] });
  };
  const updateHandlingLine = (id: string, patch: Partial<ForeignAgentInvoice['handlingLines'][number]>) => {
    apply({ handlingLines: invoice.handlingLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeHandlingLine = (id: string) => apply({ handlingLines: invoice.handlingLines.filter((l) => l.id !== id) });

  // --- 6.7 Auto Calculate Cost ---
  const addAutoCalcLine = () => {
    apply({
      autoCalcLines: [
        ...invoice.autoCalcLines,
        { id: uuid(), year: new Date().getFullYear(), cnNo: '', trackingNo: '', runNo: '', pkgs: 0, weight: 0, cost: 0, partyName: '' },
      ],
    });
  };
  const updateAutoCalcLine = (id: string, patch: Partial<ForeignAgentInvoice['autoCalcLines'][number]>) => {
    apply({ autoCalcLines: invoice.autoCalcLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeAutoCalcLine = (id: string) => apply({ autoCalcLines: invoice.autoCalcLines.filter((l) => l.id !== id) });
  const autoCalcTotal = invoice.autoCalcLines.reduce((sum, l) => sum + l.cost, 0);

  return (
    <Box>
      <Grid container spacing={2}>
        {/* LEFT COLUMN — 6.2 Header & Shipment Ref, 6.3 Currency/Refs/Bank/Receipts */}
        <Grid item xs={12} md={4}>
          <FormRow>
            <FormField md={4}>
              <TextField label="Branch" fullWidth value={invoice.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label={config.entryDocLabel} fullWidth value={invoice.documentNo} disabled />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={invoice.documentDate}
                disabled={!editable}
                onChange={(e) => apply({ documentDate: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="MAWB Job No." fullWidth value={invoice.mawbJobNo} disabled={!editable} onChange={(e) => setMawbJobNo(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {masterJobs.map((j) => (
                  <MenuItem key={j.jobNo} value={j.jobNo}>
                    {j.jobNo} — MAWB {j.mawbNo || '(unassigned)'}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Year" type="number" fullWidth value={invoice.mawbJobYear} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="MAWB No." fullWidth value={invoice.mawbNo} disabled />
            </FormField>
            <FormField md={6}>
              <TextField label="MAWB Date" fullWidth value={invoice.mawbDate} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={invoice.dueDate}
                disabled={!editable}
                onChange={(e) => apply({ dueDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField label="Run No." fullWidth value={invoice.runNo} disabled={!editable} onChange={(e) => apply({ runNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={8}>
              <TextField label="F/Agent Doc. No." fullWidth value={invoice.fAgentDocNo} disabled={!editable} onChange={(e) => apply({ fAgentDocNo: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField select label="M.PP/CC" fullWidth value={invoice.ppCc} disabled={!editable} onChange={(e) => apply({ ppCc: e.target.value as 'PP' | 'CC' })}>
                <MenuItem value="PP">PP</MenuItem>
                <MenuItem value="CC">CC</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="F/Agent Code" fullWidth value={invoice.fAgentCode} disabled={!editable} onChange={(e) => setFAgentCode(e.target.value)}>
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
              <TextField select label="Origin" fullWidth value={invoice.origin} disabled={!editable} onChange={(e) => apply({ origin: e.target.value })}>
                {airports.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Destination" fullWidth value={invoice.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="Pieces" type="number" fullWidth value={invoice.pieces} disabled={!editable} onChange={(e) => apply({ pieces: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Gross Weight" type="number" fullWidth value={invoice.grossWeight} disabled={!editable} onChange={(e) => apply({ grossWeight: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Charge Weight" type="number" fullWidth value={invoice.chargeWeight} disabled={!editable} onChange={(e) => apply({ chargeWeight: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Remarks" fullWidth multiline minRows={2} value={invoice.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} />
            </FormField>
          </FormRow>

          <SectionHeader>Currency, References &amp; Bank</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Post in PKR Currency (Y/N)" fullWidth value={invoice.postInPkr} disabled={!editable} onChange={(e) => apply({ postInPkr: e.target.value as 'Y' | 'N' })}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Currency Code" fullWidth value={invoice.currencyCode} disabled={!editable} onChange={(e) => apply({ currencyCode: e.target.value })}>
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Exchange Rate" type="number" fullWidth value={invoice.exchangeRate} disabled={!editable} onChange={(e) => apply({ exchangeRate: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Reference" fullWidth multiline minRows={2} value={invoice.reference} disabled={!editable} onChange={(e) => apply({ reference: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Consignee" fullWidth multiline minRows={2} value={invoice.consignee} disabled={!editable} onChange={(e) => apply({ consignee: e.target.value })} />
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

        {/* MIDDLE COLUMN — 6.4 Allocation Grid, 6.5 Selling/Buying */}
        <Grid item xs={12} md={4}>
          <SectionHeader>6.4 Job / HAWB Allocation Grid</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job No.</TableCell>
                  <TableCell>HAWB No.</TableCell>
                  <TableCell>Pcs</TableCell>
                  <TableCell>Gr.Wt</TableCell>
                  <TableCell>Ch.Wt</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Party Name</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.allocationLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField select variant="standard" fullWidth value={line.jobNo} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { jobNo: e.target.value })}>
                        <MenuItem value={invoice.mawbJobNo}>{invoice.mawbJobNo} (Master)</MenuItem>
                        {houseJobs.map((h) => (
                          <MenuItem key={h.jobNo} value={h.jobNo}>
                            {h.jobNo} (House)
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={line.hawbNo} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { hawbNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 55 }}>
                      <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { pcs: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.grWeight} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { grWeight: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.chWeight} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { chWeight: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.cost} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { cost: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField variant="standard" value={line.partyName} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { partyName: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeAllocationLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell />
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.pcs}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.grWeight.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.chWeight.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.cost.toFixed(2)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable || !invoice.mawbJobNo} onClick={addAllocationLine} sx={{ m: 1 }}>
              Add Allocation Line
            </Button>
          </Paper>

          <SectionHeader>6.5 Selling Charges</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Charges</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {sellingLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" value={line.code} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { code: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField variant="standard" value={line.description} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { description: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.charges} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { charges: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeChargeLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                    Total Selling
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{invoice.totalSelling.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={() => addChargeLine('SELLING')} sx={{ m: 1 }}>
              Add Selling Line
            </Button>
          </Paper>

          <SectionHeader>Buying Charges</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Charges</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {buyingLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" value={line.code} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { code: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField variant="standard" value={line.description} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { description: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.charges} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { charges: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeChargeLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                    Total Buying
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{invoice.totalBuying.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={() => addChargeLine('BUYING')} sx={{ m: 1 }}>
              Add Buying Line
            </Button>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Grid container spacing={1}>
              <Grid item xs={7}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Difference
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body2" align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {invoice.difference.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={7}>
                <TextField
                  label="Profit Share %"
                  type="number"
                  size="small"
                  fullWidth
                  value={invoice.profitSharePercent}
                  disabled={!editable}
                  onChange={(e) => apply({ profitSharePercent: Number(e.target.value) })}
                />
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body2" align="right" sx={{ mt: 1 }}>
                  {((invoice.difference * invoice.profitSharePercent) / 100).toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN — 6.6 Handling/Service Charges & Invoice Total, 6.7 Auto Calculate Cost */}
        <Grid item xs={12} md={4}>
          <SectionHeader>6.6 Handling / Service Charges</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Charges</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.handlingLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" value={line.code} disabled={!editable} onChange={(e) => updateHandlingLine(line.id, { code: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField variant="standard" value={line.description} disabled={!editable} onChange={(e) => updateHandlingLine(line.id, { description: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateHandlingLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.charges} disabled={!editable} onChange={(e) => updateHandlingLine(line.id, { charges: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeHandlingLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                    Total Other Charges
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{invoice.totalOtherCharges.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addHandlingLine} sx={{ m: 1 }}>
              Add Handling Line
            </Button>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: '#f0f7ff' }}>
            <Grid container spacing={1}>
              <Grid item xs={7}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Total Invoice Amount
                </Typography>
              </Grid>
              <Grid item xs={5}>
                <Typography variant="body2" align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {invoice.totalInvoiceAmount.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <SectionHeader>6.7 Auto Calculate Cost</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField
                select
                label="Auto Calculate Cost"
                fullWidth
                value={invoice.autoCalculateCost}
                disabled={!editable}
                onChange={(e) => apply({ autoCalculateCost: e.target.value as 'Y' | 'N' })}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell>C/N No.</TableCell>
                  <TableCell>Tracking No.</TableCell>
                  <TableCell>Run No.</TableCell>
                  <TableCell>Pkgs</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Party Name</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.autoCalcLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" type="number" value={line.year} disabled={!editable} onChange={(e) => updateAutoCalcLine(line.id, { year: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" value={line.cnNo} disabled={!editable} onChange={(e) => updateAutoCalcLine(line.id, { cnNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={line.trackingNo} disabled={!editable} onChange={(e) => updateAutoCalcLine(line.id, { trackingNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" value={line.runNo} disabled={!editable} onChange={(e) => updateAutoCalcLine(line.id, { runNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 55 }}>
                      <TextField variant="standard" type="number" value={line.pkgs} disabled={!editable} onChange={(e) => updateAutoCalcLine(line.id, { pkgs: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.weight} disabled={!editable} onChange={(e) => updateAutoCalcLine(line.id, { weight: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.cost} disabled={!editable} onChange={(e) => updateAutoCalcLine(line.id, { cost: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 100 }}>
                      <TextField variant="standard" value={line.partyName} disabled={!editable} onChange={(e) => updateAutoCalcLine(line.id, { partyName: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeAutoCalcLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={6} sx={{ fontWeight: 700 }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{autoCalcTotal.toFixed(2)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addAutoCalcLine} sx={{ m: 1 }}>
              Add Cost Line
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

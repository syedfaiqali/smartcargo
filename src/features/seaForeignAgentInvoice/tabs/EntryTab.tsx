import { confirmDelete } from '../../../components/deleteConfirmation';
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
import { SeaForeignAgentInvoice } from '../../../domain/seaForeignAgentInvoice';
import { SeaVariantConfig } from '../variantConfig';
import { seaExportJobRepo } from '../../../data/seaExportJobService';
import { getJobsForConsolAgentInvoice, lookupSeaJobForAgentInvoice } from '../../../data/seaForeignAgentInvoiceService';
import { bankRepo, currencyRepo, foreignAgentRepo } from '../../../data/masterDataService';
import { recomputeSeaAgentInvoiceTotals } from '../agentInvoiceCalculations';

interface EntryTabProps {
  invoice: SeaForeignAgentInvoice;
  config: SeaVariantConfig;
  editable: boolean;
  onChange: (invoice: SeaForeignAgentInvoice) => void;
}

export function EntryTab({ invoice, config, editable, onChange }: EntryTabProps) {
  const foreignAgents = foreignAgentRepo.list();
  const currencies = currencyRepo.list();
  const banks = bankRepo.list();
  const jobs = seaExportJobRepo.list();
  const jobsInConsol = invoice.consolNo ? getJobsForConsolAgentInvoice(invoice.consolNo) : [];

  const apply = (patch: Partial<SeaForeignAgentInvoice>) => onChange(recomputeSeaAgentInvoiceTotals({ ...invoice, ...patch }));

  const setJobNo = (jobNo: string) => {
    const ref = lookupSeaJobForAgentInvoice(jobNo);
    if (!ref) {
      apply({ jobNo: '' });
      return;
    }
    apply({
      jobNo,
      jobYear: ref.jobYear,
      consolNo: invoice.consolNo || ref.consolNo,
      mblNo: ref.mblNo,
      mblDate: ref.mblDate,
      lclFcl: ref.lclFcl,
      grossWeight: ref.grossWeight,
      netWeight: ref.netWeight,
      cbm: ref.cbm,
      vessel: ref.vessel,
      voyage: ref.voyage,
      origin: invoice.origin || ref.portOfLoad,
      destination: invoice.destination || ref.destination,
    });
  };

  const setFAgentCode = (code: string) => {
    const a = foreignAgents.find((x) => x.code === code);
    apply({ fAgentCode: code, fAgentName: a?.name ?? '' });
  };

  const setBankCode = (bankCode: string) => {
    const b = banks.find((x) => x.code === bankCode);
    apply({ bankCode, bankDetailText: b?.accountDetail ?? '' });
  };

  // --- Container Grid ---
  const addContainerLine = () => {
    apply({ containers: [...invoice.containers, { id: uuid(), containerNo: '', type: '', selling: 0, buying: 0 }] });
  };
  const updateContainerLine = (id: string, patch: Partial<SeaForeignAgentInvoice['containers'][number]>) => {
    apply({ containers: invoice.containers.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  };
  const removeContainerLine = (id: string) => apply({ containers: invoice.containers.filter((c) => c.id !== id) });

  // --- Selling & Buying Charges ---
  const addChargeLine = (side: 'SELLING' | 'BUYING') => {
    apply({ chargeLines: [...invoice.chargeLines, { id: uuid(), side, code: '', description: '', rate: 0, charges: 0 }] });
  };
  const updateChargeLine = (id: string, patch: Partial<SeaForeignAgentInvoice['chargeLines'][number]>) => {
    apply({ chargeLines: invoice.chargeLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeChargeLine = (id: string) => apply({ chargeLines: invoice.chargeLines.filter((l) => l.id !== id) });
  const sellingLines = invoice.chargeLines.filter((l) => l.side === 'SELLING');
  const buyingLines = invoice.chargeLines.filter((l) => l.side === 'BUYING');

  // --- Less Expenses ---
  const addLessExpenseLine = () => {
    apply({ lessExpenseLines: [...invoice.lessExpenseLines, { id: uuid(), code: '', description: '', rate: 0, charges: 0 }] });
  };
  const updateLessExpenseLine = (id: string, patch: Partial<SeaForeignAgentInvoice['lessExpenseLines'][number]>) => {
    apply({ lessExpenseLines: invoice.lessExpenseLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeLessExpenseLine = (id: string) => apply({ lessExpenseLines: invoice.lessExpenseLines.filter((l) => l.id !== id) });

  // --- Handling / Other Charges ---
  const addHandlingLine = () => {
    apply({ handlingLines: [...invoice.handlingLines, { id: uuid(), code: '', description: '', rate: 0, charges: 0 }] });
  };
  const updateHandlingLine = (id: string, patch: Partial<SeaForeignAgentInvoice['handlingLines'][number]>) => {
    apply({ handlingLines: invoice.handlingLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeHandlingLine = (id: string) => apply({ handlingLines: invoice.handlingLines.filter((l) => l.id !== id) });

  // --- Auto Calculate Cost (JOB#/HBL No./PCS/GRS.WEIGHT/CBM/COST/PARTY NAME) ---
  const addAutoCalcCostLine = () => {
    apply({
      autoCalcCostLines: [
        ...invoice.autoCalcCostLines,
        { id: uuid(), jobNo: invoice.jobNo, hblNo: '', pcs: 0, grsWeight: 0, cbm: 0, cost: 0, partyName: '' },
      ],
    });
  };
  const updateAutoCalcCostLine = (id: string, patch: Partial<SeaForeignAgentInvoice['autoCalcCostLines'][number]>) => {
    apply({ autoCalcCostLines: invoice.autoCalcCostLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeAutoCalcCostLine = (id: string) => apply({ autoCalcCostLines: invoice.autoCalcCostLines.filter((l) => l.id !== id) });
  const autoCalcCostTotals = invoice.autoCalcCostLines.reduce(
    (acc, l) => ({ pcs: acc.pcs + l.pcs, grsWeight: acc.grsWeight + l.grsWeight, cbm: acc.cbm + l.cbm, cost: acc.cost + l.cost }),
    { pcs: 0, grsWeight: 0, cbm: 0, cost: 0 }
  );

  // --- Year/C-N No./Tracking No./Run No. cost strip ---
  const addAutoCalcLine = () => {
    apply({
      autoCalcLines: [
        ...invoice.autoCalcLines,
        { id: uuid(), year: new Date().getFullYear(), cnNo: '', trackingNo: '', runNo: '', pkgs: 0, weight: 0, cost: 0, partyName: '' },
      ],
    });
  };
  const updateAutoCalcLine = (id: string, patch: Partial<SeaForeignAgentInvoice['autoCalcLines'][number]>) => {
    apply({ autoCalcLines: invoice.autoCalcLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeAutoCalcLine = (id: string) => apply({ autoCalcLines: invoice.autoCalcLines.filter((l) => l.id !== id) });
  const autoCalcTotal = invoice.autoCalcLines.reduce((sum, l) => sum + l.cost, 0);

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
        {/* LEFT COLUMN — Header, Shipment, Currency/Refs/Bank/Receipts */}
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
            <FormField md={4}>
              <TextField select label="Job No." fullWidth value={invoice.jobNo} disabled={!editable} onChange={(e) => setJobNo(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {(invoice.consolNo ? jobsInConsol : jobs).map((j) => (
                  <MenuItem key={j.jobNo} value={j.jobNo}>
                    {j.jobNo}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField label="Year" type="number" fullWidth value={invoice.jobYear} disabled />
            </FormField>
            <FormField md={4}>
              <TextField label="Consol No." fullWidth value={invoice.consolNo} disabled={!editable} onChange={(e) => apply({ consolNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={8}>
              <TextField label="F/Agent Doc. No." fullWidth value={invoice.fAgentDocNo} disabled={!editable} onChange={(e) => apply({ fAgentDocNo: e.target.value })} />
            </FormField>
            <FormField md={4}>
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
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="MBL No." fullWidth value={invoice.mblNo} disabled={!editable} onChange={(e) => apply({ mblNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="MBL Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={invoice.mblDate}
                disabled={!editable}
                onChange={(e) => apply({ mblDate: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="Run No." fullWidth value={invoice.runNo} disabled={!editable} onChange={(e) => apply({ runNo: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField select label="M PP/CC" fullWidth value={invoice.mPpCc} disabled={!editable} onChange={(e) => apply({ mPpCc: e.target.value as 'PP' | 'CC' })}>
                <MenuItem value="PP">PP</MenuItem>
                <MenuItem value="CC">CC</MenuItem>
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField select label="H PP/CC" fullWidth value={invoice.hPpCc} disabled={!editable} onChange={(e) => apply({ hPpCc: e.target.value as 'PP' | 'CC' })}>
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
              <TextField label="Origin" fullWidth value={invoice.origin} disabled={!editable} onChange={(e) => apply({ origin: e.target.value })} />
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
              <TextField label="UOM" fullWidth value={invoice.uom} disabled={!editable} onChange={(e) => apply({ uom: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField select label="LCL/FCL" fullWidth value={invoice.lclFcl} disabled={!editable} onChange={(e) => apply({ lclFcl: e.target.value as 'LCL' | 'FCL' })}>
                <MenuItem value="LCL">LCL</MenuItem>
                <MenuItem value="FCL">FCL</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Gross Weight" type="number" fullWidth value={invoice.grossWeight} disabled={!editable} onChange={(e) => apply({ grossWeight: Number(e.target.value) })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Net Weight" type="number" fullWidth value={invoice.netWeight} disabled={!editable} onChange={(e) => apply({ netWeight: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="CBM" type="number" fullWidth value={invoice.cbm} disabled={!editable} onChange={(e) => apply({ cbm: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Vessel" fullWidth value={invoice.vessel} disabled={!editable} onChange={(e) => apply({ vessel: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Voyage" fullWidth value={invoice.voyage} disabled={!editable} onChange={(e) => apply({ voyage: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Carrier" fullWidth value={invoice.carrier} disabled={!editable} onChange={(e) => apply({ carrier: e.target.value })} />
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
              <TextField select label="Currency" fullWidth value={invoice.currencyCode} disabled={!editable} onChange={(e) => apply({ currencyCode: e.target.value })}>
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
              <TextField label="Reference / Consignee" fullWidth multiline minRows={2} value={invoice.reference} disabled={!editable} onChange={(e) => apply({ reference: e.target.value })} />
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

        {/* MIDDLE COLUMN — Container Grid, Auto Calculate Cost strips */}
        <Grid item xs={12} md={4}>
          <SectionHeader>Container</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Selling</TableCell>
                  <TableCell>Buying</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.containers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={c.containerNo} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { containerNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" value={c.type} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { type: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={c.selling} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { selling: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={c.buying} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { buying: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeContainerLine(c.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addContainerLine} sx={{ m: 1 }}>
              Add Container
            </Button>
          </Paper>

          <SectionHeader>Auto Calculate Cost</SectionHeader>
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
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job#</TableCell>
                  <TableCell>HBL No.</TableCell>
                  <TableCell>Pcs</TableCell>
                  <TableCell>Grs.Weight</TableCell>
                  <TableCell>CBM</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Party Name</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.autoCalcCostLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 100 }}>
                      <TextField
                        select
                        variant="standard"
                        fullWidth
                        value={line.jobNo}
                        disabled={!editable}
                        onChange={(e) => updateAutoCalcCostLine(line.id, { jobNo: e.target.value })}
                      >
                        {invoice.jobNo && <MenuItem value={invoice.jobNo}>{invoice.jobNo}</MenuItem>}
                        {jobsInConsol.map((j) => (
                          <MenuItem key={j.jobNo} value={j.jobNo}>
                            {j.jobNo}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={line.hblNo} disabled={!editable} onChange={(e) => updateAutoCalcCostLine(line.id, { hblNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 55 }}>
                      <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateAutoCalcCostLine(line.id, { pcs: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.grsWeight}
                        disabled={!editable}
                        onChange={(e) => updateAutoCalcCostLine(line.id, { grsWeight: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.cbm} disabled={!editable} onChange={(e) => updateAutoCalcCostLine(line.id, { cbm: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.cost} disabled={!editable} onChange={(e) => updateAutoCalcCostLine(line.id, { cost: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField variant="standard" value={line.partyName} disabled={!editable} onChange={(e) => updateAutoCalcCostLine(line.id, { partyName: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeAutoCalcCostLine(line.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell />
                  <TableCell sx={{ fontWeight: 700 }}>{autoCalcCostTotals.pcs}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{autoCalcCostTotals.grsWeight.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{autoCalcCostTotals.cbm.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{autoCalcCostTotals.cost.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addAutoCalcCostLine} sx={{ m: 1 }}>
              Add Cost Line
            </Button>
          </Paper>

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
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeAutoCalcLine(line.id))}>
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

        {/* RIGHT COLUMN — Selling/Buying, Less Expenses, Handling/Other Charges */}
        <Grid item xs={12} md={4}>
          <SectionHeader>Selling Charges</SectionHeader>
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
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeChargeLine(line.id))}>
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
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeChargeLine(line.id))}>
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

          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
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

          <SectionHeader>Less Expenses</SectionHeader>
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
                {invoice.lessExpenseLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" value={line.code} disabled={!editable} onChange={(e) => updateLessExpenseLine(line.id, { code: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField variant="standard" value={line.description} disabled={!editable} onChange={(e) => updateLessExpenseLine(line.id, { description: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateLessExpenseLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.charges} disabled={!editable} onChange={(e) => updateLessExpenseLine(line.id, { charges: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeLessExpenseLine(line.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                    Total Other Charges
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{invoice.totalLessExpenses.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addLessExpenseLine} sx={{ m: 1 }}>
              Add Expense Line
            </Button>
          </Paper>

          <SectionHeader>Handling / Other Charges</SectionHeader>
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
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeHandlingLine(line.id))}>
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

          <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f0f7ff' }}>
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
        </Grid>
      </Grid>
    </Box>
  );
}

import { confirmDelete } from '../../components/deleteConfirmation';
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
import { FormRow, FormField, SectionHeader } from '../../components/FormGrid';
import { SeaLocalInvoice } from '../../domain/seaLocalInvoice';
import { seaExportJobRepo } from '../../data/seaExportJobService';
import { lookupSeaJobForInvoice } from '../../data/seaLocalInvoiceService';
import { currencyRepo, partyRepo, subAgentPartyRepo, bankRepo, spoRepo, seaPortRepo } from '../../data/masterDataService';
import { recomputeChargeLine, recomputeInvoiceTotals } from './invoiceCalculations';

interface EntryTabProps {
  invoice: SeaLocalInvoice;
  editable: boolean;
  onChange: (invoice: SeaLocalInvoice) => void;
}

export function EntryTab({ invoice, editable, onChange }: EntryTabProps) {
  const parties = partyRepo.list();
  const subAgentParties = subAgentPartyRepo.list();
  const banks = bankRepo.list();
  const spoCodes = spoRepo.list();
  const seaPorts = seaPortRepo.list();
  const currencies = currencyRepo.list();
  const jobs = seaExportJobRepo.list();

  const apply = (patch: Partial<SeaLocalInvoice>) => onChange(recomputeInvoiceTotals({ ...invoice, ...patch }));

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    apply({ partyCode, partyName: p?.name ?? '', partyAddress: p?.address ?? '' });
  };

  const setJobNo = (jobNo: string) => {
    const ref = lookupSeaJobForInvoice(jobNo);
    if (!ref) {
      apply({ jobNo: '' });
      return;
    }
    apply({
      jobNo,
      jobYear: ref.jobYear,
      mblNo: ref.mblNo,
      hblNo: ref.hblNo,
      portOfLoad: ref.portOfLoad,
      destination: ref.destination,
      lclFcl: ref.lclFcl,
      cbm: ref.cbm,
      weightGrs: ref.grossWeight,
      weightNet: ref.netWeight,
      weightVol: ref.volWeight,
      partyCode: invoice.partyCode || ref.partyCode,
      partyName: invoice.partyCode ? invoice.partyName : ref.partyName,
      spoCode: invoice.spoCode || ref.spoCode,
    });
  };

  const setBankCode = (bankCode: string) => {
    const b = banks.find((x) => x.code === bankCode);
    apply({ bankCode, bankDetailText: b?.accountDetail ?? '' });
  };

  // --- Container Grid ---
  const addContainerLine = () => {
    apply({ containers: [...invoice.containers, { id: uuid(), containerNo: '', size: '', rate: 0 }] });
  };
  const updateContainerLine = (id: string, patch: Partial<SeaLocalInvoice['containers'][number]>) => {
    apply({ containers: invoice.containers.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  };
  const removeContainerLine = (id: string) => apply({ containers: invoice.containers.filter((c) => c.id !== id) });

  // --- Shipping Line Charges Grid ---
  const addSLineChargeLine = () => {
    apply({
      shippingLineChargeLines: [
        ...invoice.shippingLineChargeLines,
        { id: uuid(), code: '', description: '', cbmWtBasis: 'CBM', curr: invoice.currency1, qty: 0, rate: 0, fAmount: 0, pkrAmount: 0 },
      ],
    });
  };
  const updateSLineChargeLine = (id: string, patch: Partial<SeaLocalInvoice['shippingLineChargeLines'][number]>) => {
    const shippingLineChargeLines = invoice.shippingLineChargeLines.map((l) => (l.id === id ? recomputeChargeLine({ ...l, ...patch }, invoice.exRate1) : l));
    apply({ shippingLineChargeLines });
  };
  const removeSLineChargeLine = (id: string) => apply({ shippingLineChargeLines: invoice.shippingLineChargeLines.filter((l) => l.id !== id) });

  // --- Other Charges Grid ---
  const addOtherChargeLine = () => {
    apply({
      otherChargeLines: [
        ...invoice.otherChargeLines,
        { id: uuid(), code: '', description: '', cbmWtBasis: 'CBM', curr: invoice.currency1, qty: 0, rate: 0, fAmount: 0, pkrAmount: 0 },
      ],
    });
  };
  const updateOtherChargeLine = (id: string, patch: Partial<SeaLocalInvoice['otherChargeLines'][number]>) => {
    const otherChargeLines = invoice.otherChargeLines.map((l) => (l.id === id ? recomputeChargeLine({ ...l, ...patch }, invoice.exRate1) : l));
    apply({ otherChargeLines });
  };
  const removeOtherChargeLine = (id: string) => apply({ otherChargeLines: invoice.otherChargeLines.filter((l) => l.id !== id) });

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
        {/* LEFT COLUMN — Header + Job/Party fields */}
        <Grid item xs={12} md={4}>
          <FormRow>
            <FormField md={4}>
              <TextField label="Branch" fullWidth value={invoice.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Invoice No." fullWidth value={invoice.invoiceNo} disabled />
            </FormField>
            <FormField md={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={invoice.date}
                disabled={!editable}
                onChange={(e) => apply({ date: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Job No." fullWidth value={invoice.jobNo} disabled={!editable} onChange={(e) => setJobNo(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {jobs.map((j) => (
                  <MenuItem key={j.jobNo} value={j.jobNo}>
                    {j.jobNo}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField label="Year" type="number" fullWidth value={invoice.jobYear} disabled />
            </FormField>
            <FormField md={3}>
              <TextField label="Type" fullWidth value={invoice.type} disabled={!editable} onChange={(e) => apply({ type: e.target.value })} />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField md={12}>
              <TextField label="Quot Ref No." fullWidth value={invoice.quotRefNo} disabled={!editable} onChange={(e) => apply({ quotRefNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Party Code" fullWidth value={invoice.partyCode} disabled={!editable} onChange={(e) => setPartyCode(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Sub Agent's Party" fullWidth value={invoice.subAgentParty} disabled={!editable} onChange={(e) => apply({ subAgentParty: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {subAgentParties.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Mbl No" fullWidth value={invoice.mblNo} disabled={!editable} onChange={(e) => apply({ mblNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Hbl No" fullWidth value={invoice.hblNo} disabled={!editable} onChange={(e) => apply({ hblNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Shipper Invoice No." fullWidth value={invoice.shipperInvoiceNo} disabled={!editable} onChange={(e) => apply({ shipperInvoiceNo: e.target.value })} />
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
            <FormField md={6}>
              <TextField select label="Port of Load" fullWidth value={invoice.portOfLoad} disabled={!editable} onChange={(e) => apply({ portOfLoad: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Destination" fullWidth value={invoice.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="LCL/FCL" fullWidth value={invoice.lclFcl} disabled={!editable} onChange={(e) => apply({ lclFcl: e.target.value as 'LCL' | 'FCL' })}>
                <MenuItem value="LCL">LCL</MenuItem>
                <MenuItem value="FCL">FCL</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Spo Code" fullWidth value={invoice.spoCode} disabled={!editable} onChange={(e) => apply({ spoCode: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {spoCodes.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Consignee" fullWidth value={invoice.consignee} disabled={!editable} onChange={(e) => apply({ consignee: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Remarks" fullWidth multiline minRows={2} value={invoice.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} />
            </FormField>
          </FormRow>

          <FormRow>
            <FormField md={4}>
              <TextField label="CBM" type="number" fullWidth value={invoice.cbm} disabled={!editable} onChange={(e) => apply({ cbm: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="CBM Rate" type="number" fullWidth value={invoice.cbmRate} disabled={!editable} onChange={(e) => apply({ cbmRate: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField select label="FOB/CIF" fullWidth value={invoice.fobCif} disabled={!editable} onChange={(e) => apply({ fobCif: e.target.value as 'FOB' | 'CIF' })}>
                <MenuItem value="FOB">FOB</MenuItem>
                <MenuItem value="CIF">CIF</MenuItem>
              </TextField>
            </FormField>
          </FormRow>

          <SectionHeader>Bank Detail</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Bank Code" fullWidth value={invoice.bankCode} disabled={!editable} onChange={(e) => setBankCode(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {banks.map((b) => (
                  <MenuItem key={b.code} value={b.code}>
                    {b.code} — {b.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField fullWidth multiline minRows={2} value={invoice.bankDetailText} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={3}>
              <TextField label="Pkgs" type="number" fullWidth value={invoice.pkgs} disabled={!editable} onChange={(e) => apply({ pkgs: Number(e.target.value) })} />
            </FormField>
            <FormField md={3}>
              <TextField label="Weight (Grs)" type="number" fullWidth value={invoice.weightGrs} disabled={!editable} onChange={(e) => apply({ weightGrs: Number(e.target.value) })} />
            </FormField>
            <FormField md={3}>
              <TextField label="Weight (Net)" type="number" fullWidth value={invoice.weightNet} disabled={!editable} onChange={(e) => apply({ weightNet: Number(e.target.value) })} />
            </FormField>
            <FormField md={3}>
              <TextField label="Weight (Vol)" type="number" fullWidth value={invoice.weightVol} disabled={!editable} onChange={(e) => apply({ weightVol: Number(e.target.value) })} />
            </FormField>
          </FormRow>

          <SectionHeader>Post in PKR Currency</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Post in PKR (Y/N)" fullWidth value={invoice.postInPkr} disabled={!editable} onChange={(e) => apply({ postInPkr: e.target.value as 'Y' | 'N' })}>
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
                  <TextField
                    select
                    label={`Currency ${n}`}
                    fullWidth
                    value={invoice[currKey]}
                    disabled={!editable}
                    onChange={(e) => apply({ [currKey]: e.target.value } as Partial<SeaLocalInvoice>)}
                  >
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
                    onChange={(e) => apply({ [rateKey]: Number(e.target.value) } as Partial<SeaLocalInvoice>)}
                  />
                </FormField>
              </FormRow>
            );
          })}

          <SectionHeader>Container</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No.</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.containers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell sx={{ minWidth: 100 }}>
                      <TextField variant="standard" value={c.containerNo} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { containerNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" value={c.size} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { size: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={c.rate} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { rate: Number(e.target.value) })} />
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

          <SectionHeader>Local/Intl Documents</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Year</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Curr</TableCell>
                  <TableCell>F/Amount</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Final</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography variant="caption" color="text.secondary">
                        No Record found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoice.documents.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell>{d.no}</TableCell>
                      <TableCell>{d.date}</TableCell>
                      <TableCell>{d.year}</TableCell>
                      <TableCell>{d.type}</TableCell>
                      <TableCell>{d.name}</TableCell>
                      <TableCell>{d.curr}</TableCell>
                      <TableCell>{d.fAmount.toFixed(2)}</TableCell>
                      <TableCell>{d.amount.toFixed(2)}</TableCell>
                      <TableCell>{d.final ? 'Y' : 'N'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

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
                        No records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  invoice.receipts.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.receiptNo}</TableCell>
                      <TableCell>{r.receiptDate}</TableCell>
                      <TableCell>{r.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* MIDDLE COLUMN — Taxes, Charges Summary, Refund */}
        <Grid item xs={12} md={3}>
          <SectionHeader>Taxes &amp; Totals</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField label="Freight" type="number" fullWidth value={invoice.freight1} disabled={!editable} onChange={(e) => apply({ freight1: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Freight" type="number" fullWidth value={invoice.freight2} disabled={!editable} onChange={(e) => apply({ freight2: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Sales Tax (%)" type="number" fullWidth value={invoice.salesTaxPercent} disabled={!editable} onChange={(e) => apply({ salesTaxPercent: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="PST" fullWidth value={invoice.praCode} disabled={!editable} onChange={(e) => apply({ praCode: e.target.value })}>
                <MenuItem value="PST">PST</MenuItem>
                <MenuItem value="PRA">PRA</MenuItem>
                <MenuItem value="SRB">SRB</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Amount" type="number" fullWidth value={invoice.pstAmount} disabled={!editable} onChange={(e) => apply({ pstAmount: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField
                label="WHT Sales Tax (%)"
                type="number"
                fullWidth
                value={invoice.whtSalesTaxPercent}
                disabled={!editable}
                onChange={(e) => apply({ whtSalesTaxPercent: Number(e.target.value) })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField
                label="WHT Sales Tax Amount"
                type="number"
                fullWidth
                value={invoice.whtSalesTaxAmount}
                disabled={!editable}
                onChange={(e) => apply({ whtSalesTaxAmount: Number(e.target.value) })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="PRA" fullWidth value={invoice.praCode} disabled={!editable} onChange={(e) => apply({ praCode: e.target.value })}>
                <MenuItem value="PRA">PRA</MenuItem>
                <MenuItem value="SRB">SRB</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Charges" type="number" fullWidth value={invoice.praCharges} disabled={!editable} onChange={(e) => apply({ praCharges: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Sales Tax Invoice No." fullWidth value={invoice.salesTaxInvoiceNo} disabled={!editable} onChange={(e) => apply({ salesTaxInvoiceNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="PRA/SRB Tax Inv.No." fullWidth value={invoice.praSrbTaxInvoiceNo} disabled={!editable} onChange={(e) => apply({ praSrbTaxInvoiceNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="S/L Charges" fullWidth value={invoice.slCharges.toFixed(2)} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Other Charges" fullWidth value={invoice.otherCharges.toFixed(2)} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Gross Total" fullWidth value={invoice.grossTotal.toFixed(2)} disabled />
            </FormField>
          </FormRow>

          <SectionHeader>Refund</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField label="Refund CBM Rate" type="number" fullWidth value={invoice.refundCbmRate} disabled={!editable} onChange={(e) => apply({ refundCbmRate: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Refund" type="number" fullWidth value={invoice.refund1} disabled={!editable} onChange={(e) => apply({ refund1: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Refund Ex.Rate" type="number" fullWidth value={invoice.refundExRate} disabled={!editable} onChange={(e) => apply({ refundExRate: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Refund" type="number" fullWidth value={invoice.refund2} disabled={!editable} onChange={(e) => apply({ refund2: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Refund" type="number" fullWidth value={invoice.refund3} disabled={!editable} onChange={(e) => apply({ refund3: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Total Refund" fullWidth value={invoice.totalRefund.toFixed(2)} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Invoice Total" fullWidth value={invoice.invoiceTotal.toFixed(2)} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField
                select
                label="Print Refund on Invoice"
                fullWidth
                value={invoice.printRefundOnInvoice}
                disabled={!editable}
                onChange={(e) => apply({ printRefundOnInvoice: e.target.value as 'Y' | 'N' })}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
        </Grid>

        {/* RIGHT COLUMN — Shipping Line Charges, Other Charges */}
        <Grid item xs={12} md={5}>
          <SectionHeader>Shipping Line Charges</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>CBM/WT</TableCell>
                  <TableCell>Curr</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>F/Amount</TableCell>
                  <TableCell>PKR</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.shippingLineChargeLines.map((line, i) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        value={line.code}
                        disabled={!editable || i === 0}
                        onChange={(e) => updateSLineChargeLine(line.id, { code: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField
                        variant="standard"
                        value={line.description}
                        disabled={!editable || i === 0}
                        onChange={(e) => updateSLineChargeLine(line.id, { description: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField
                        select
                        variant="standard"
                        value={line.cbmWtBasis}
                        disabled={!editable}
                        onChange={(e) => updateSLineChargeLine(line.id, { cbmWtBasis: e.target.value as 'CBM' | 'WT' })}
                      >
                        <MenuItem value="CBM">CBM</MenuItem>
                        <MenuItem value="WT">WT</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" value={line.curr} disabled={!editable} onChange={(e) => updateSLineChargeLine(line.id, { curr: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 60 }}>
                      <TextField variant="standard" type="number" value={line.qty} disabled={!editable} onChange={(e) => updateSLineChargeLine(line.id, { qty: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateSLineChargeLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>{line.fAmount.toFixed(2)}</TableCell>
                    <TableCell>{line.pkrAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable || i === 0} onClick={() => confirmDelete(() => removeSLineChargeLine(line.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={7} sx={{ fontWeight: 700 }}>
                    Total S/Line Charges
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{invoice.totalSLineCharges.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addSLineChargeLine} sx={{ m: 1 }}>
              Add Charge Line
            </Button>
          </Paper>

          <SectionHeader>Other Charges</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>CBM/WT</TableCell>
                  <TableCell>Curr</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>F/Amount</TableCell>
                  <TableCell>PKR</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.otherChargeLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={line.code} disabled={!editable} onChange={(e) => updateOtherChargeLine(line.id, { code: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField variant="standard" value={line.description} disabled={!editable} onChange={(e) => updateOtherChargeLine(line.id, { description: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField
                        select
                        variant="standard"
                        value={line.cbmWtBasis}
                        disabled={!editable}
                        onChange={(e) => updateOtherChargeLine(line.id, { cbmWtBasis: e.target.value as 'CBM' | 'WT' })}
                      >
                        <MenuItem value="CBM">CBM</MenuItem>
                        <MenuItem value="WT">WT</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" value={line.curr} disabled={!editable} onChange={(e) => updateOtherChargeLine(line.id, { curr: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 60 }}>
                      <TextField variant="standard" type="number" value={line.qty} disabled={!editable} onChange={(e) => updateOtherChargeLine(line.id, { qty: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateOtherChargeLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>{line.fAmount.toFixed(2)}</TableCell>
                    <TableCell>{line.pkrAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeOtherChargeLine(line.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={7} sx={{ fontWeight: 700 }}>
                    Total Other Charges
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{invoice.totalOtherCharges.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addOtherChargeLine} sx={{ m: 1 }}>
              Add Charge Line
            </Button>
          </Paper>

          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Invoice Total</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right' }}>{invoice.invoiceTotal.toFixed(2)}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Invoice Total PKR</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', color: 'primary.main' }}>{invoice.invoiceTotalPkr.toFixed(2)}</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

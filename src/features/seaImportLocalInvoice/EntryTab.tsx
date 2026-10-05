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
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormField, SectionHeader } from '../../components/FormGrid';
import { SeaImportLocalInvoice } from '../../domain/seaImportLocalInvoice';
import { seaImportJobRepo } from '../../data/seaImportJobService';
import { lookupSeaImportJobForInvoice } from '../../data/seaImportLocalInvoiceService';
import { currencyRepo, partyRepo, subAgentPartyRepo, bankRepo, spoRepo, foreignAgentRepo } from '../../data/masterDataService';
import { recomputeChargeLine, recomputeInvoiceTotals } from './invoiceCalculations';

interface EntryTabProps {
  invoice: SeaImportLocalInvoice;
  editable: boolean;
  onChange: (invoice: SeaImportLocalInvoice) => void;
}

export function EntryTab({ invoice, editable, onChange }: EntryTabProps) {
  const jobs = seaImportJobRepo.list();
  const parties = partyRepo.list();
  const subAgentParties = subAgentPartyRepo.list();
  const spoCodes = spoRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const banks = bankRepo.list();
  const currencies = currencyRepo.list();

  const apply = (patch: Partial<SeaImportLocalInvoice>) => onChange(recomputeInvoiceTotals({ ...invoice, ...patch }));

  const setJobNo = (jobNo: string) => {
    const ref = lookupSeaImportJobForInvoice(jobNo);
    if (!ref) {
      apply({ jobNo: '' });
      return;
    }
    apply({
      jobNo,
      jobYear: ref.jobYear,
      jobType: ref.jobType,
      mblNo: ref.mblNo,
      mblDate: ref.mblDate,
      mblPpCc: ref.mblPpCc,
      mblPcs: ref.mblPcs,
      mblCbm: ref.mblCbm,
      mblGrossWeight: ref.mblGrossWeight,
      mblNetWeight: ref.mblNetWeight,
      hblNo: ref.hblNo,
      hblDate: ref.hblDate,
      hblPpCc: ref.hblPpCc,
      hblPcs: ref.hblPcs,
      hblCbm: ref.hblCbm,
      hblGrossWeight: ref.hblGrossWeight,
      hblNetWeight: ref.hblNetWeight,
      partyCode: invoice.partyCode || ref.partyCode,
      partyName: invoice.partyCode ? invoice.partyName : ref.partyName,
      subAgentParty: invoice.subAgentParty || ref.subAgentParty,
      spoCode: invoice.spoCode || ref.spoCode,
      foreignAgent: invoice.foreignAgent || ref.foreignAgent,
      commodity: ref.commodity,
      origin: ref.origin,
      destination: ref.destination,
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

  const setCurrencyRow = (index: number, patch: Partial<SeaImportLocalInvoice['currencies'][number]>) => {
    apply({ currencies: invoice.currencies.map((c, i) => (i === index ? { ...c, ...patch } : c)) });
  };

  // --- Charges Grid ---
  const addChargeLine = () => {
    apply({
      chargeLines: [
        ...invoice.chargeLines,
        { id: uuid(), description: '', cbmWtBasis: 'WT', curr: '', qty: 0, rate: 0, fAmount: 0, editableDescription: true },
      ],
    });
  };
  const updateChargeLine = (id: string, patch: Partial<SeaImportLocalInvoice['chargeLines'][number]>) => {
    apply({ chargeLines: invoice.chargeLines.map((l) => (l.id === id ? recomputeChargeLine({ ...l, ...patch }) : l)) });
  };
  const removeChargeLine = (id: string) => apply({ chargeLines: invoice.chargeLines.filter((l) => l.id !== id) });

  // --- Container Grid ---
  const addContainerLine = () => {
    apply({ containers: [...invoice.containers, { id: uuid(), containerNo: '', size: '', rate: 0 }] });
  };
  const updateContainerLine = (id: string, patch: Partial<SeaImportLocalInvoice['containers'][number]>) => {
    apply({ containers: invoice.containers.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  };
  const removeContainerLine = (id: string) => apply({ containers: invoice.containers.filter((c) => c.id !== id) });

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
      <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
        <FormField md={2}>
          <TextField label="Branch" fullWidth value={invoice.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
        </FormField>
        <FormField md={2}>
          <TextField label="Invoice No." fullWidth value={invoice.invoiceNo} disabled />
        </FormField>
        <FormField md={2}>
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
        <FormField md={3}>
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
          <TextField select label="Job Type" fullWidth value={invoice.jobType} disabled={!editable} onChange={(e) => apply({ jobType: e.target.value })}>
            <MenuItem value="">Select Job Type</MenuItem>
          </TextField>
        </FormField>
      </Grid>

      <Grid container spacing={0} sx={{ mb: 1.5, border: '1px solid #cbd5e1', borderRadius: 1, overflow: 'hidden' }}>
        <Grid item xs={6} sx={{ borderRight: '1px solid #cbd5e1' }}>
          <Box sx={{ bgcolor: '#dbeafe', textAlign: 'center', fontWeight: 700, py: 0.5 }}>MASTER Bill of Lading</Box>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={1}>
              {([
                ['MBL No', 'mblNo', 'text'],
                ['Date', 'mblDate', 'date'],
                ['PP/CC', 'mblPpCc', 'text'],
                ['Pcs', 'mblPcs', 'number'],
                ['CBM', 'mblCbm', 'number'],
                ['Gross Weight', 'mblGrossWeight', 'number'],
                ['Net Weight', 'mblNetWeight', 'number'],
              ] as const).map(([label, key, type]) => (
                <FormField key={key} md={12}>
                  <TextField
                    label={label}
                    type={type}
                    fullWidth
                    size="small"
                    InputLabelProps={type === 'date' ? { shrink: true } : undefined}
                    value={(invoice as unknown as Record<string, string | number>)[key]}
                    disabled={!editable}
                    onChange={(e) => apply({ [key]: type === 'number' ? Number(e.target.value) : e.target.value } as Partial<SeaImportLocalInvoice>)}
                  />
                </FormField>
              ))}
            </Grid>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box sx={{ bgcolor: '#dbeafe', textAlign: 'center', fontWeight: 700, py: 0.5 }}>HOUSE Bill of Lading</Box>
          <Box sx={{ p: 1 }}>
            <Grid container spacing={1}>
              {([
                ['HBL No.', 'hblNo', 'text'],
                ['Date', 'hblDate', 'date'],
                ['PP/CC', 'hblPpCc', 'text'],
                ['Pcs', 'hblPcs', 'number'],
                ['CBM', 'hblCbm', 'number'],
                ['Gross Weight', 'hblGrossWeight', 'number'],
                ['Net Weight', 'hblNetWeight', 'number'],
              ] as const).map(([label, key, type]) => (
                <FormField key={key} md={12}>
                  <TextField
                    label={label}
                    type={type}
                    fullWidth
                    size="small"
                    InputLabelProps={type === 'date' ? { shrink: true } : undefined}
                    value={(invoice as unknown as Record<string, string | number>)[key]}
                    disabled={!editable}
                    onChange={(e) => apply({ [key]: type === 'number' ? Number(e.target.value) : e.target.value } as Partial<SeaImportLocalInvoice>)}
                  />
                </FormField>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={1.5}>
            <FormField md={12}>
              <TextField label="Qout Ref#:" fullWidth value={invoice.quotRefNo} disabled={!editable} onChange={(e) => apply({ quotRefNo: e.target.value })} />
            </FormField>
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
            <FormField md={12}>
              <TextField select label="Sub Agent Party" fullWidth value={invoice.subAgentParty} disabled={!editable} onChange={(e) => apply({ subAgentParty: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {subAgentParties.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="SPO Code" fullWidth value={invoice.spoCode} disabled={!editable} onChange={(e) => apply({ spoCode: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {spoCodes.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Foreign Agent" fullWidth value={invoice.foreignAgent} disabled={!editable} onChange={(e) => apply({ foreignAgent: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {foreignAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField label="Commodity" fullWidth value={invoice.commodity} disabled={!editable} onChange={(e) => apply({ commodity: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Origin" fullWidth value={invoice.origin} disabled={!editable} onChange={(e) => apply({ origin: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Destination" fullWidth value={invoice.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })} />
            </FormField>
          </Grid>

          <SectionHeader>Post in PKR Currency</SectionHeader>
          <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
            <FormField md={12}>
              <TextField select label="Post in PKR Currency" fullWidth value={invoice.postInPkr} disabled={!editable} onChange={(e) => apply({ postInPkr: e.target.value as 'Y' | 'N' })}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            {invoice.currencies.map((c, i) => (
              <Grid item xs={12} key={i} container spacing={1.5}>
                <FormField md={8}>
                  <TextField select label="Currency" fullWidth value={c.currencyCode} disabled={!editable} onChange={(e) => setCurrencyRow(i, { currencyCode: e.target.value })}>
                    <MenuItem value="">(none)</MenuItem>
                    {currencies.map((cur) => (
                      <MenuItem key={cur.code} value={cur.code}>
                        {cur.code}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormField>
                <FormField md={4}>
                  <TextField
                    label="Ex.Rate"
                    type="number"
                    fullWidth
                    value={c.exRate}
                    disabled={!editable}
                    onChange={(e) => setCurrencyRow(i, { exRate: Number(e.target.value) })}
                  />
                </FormField>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <SectionHeader>Remarks</SectionHeader>
              <TextField fullWidth multiline minRows={3} value={invoice.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <SectionHeader>Receipts</SectionHeader>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Receipt No.</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.receipts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2}>
                          <Typography variant="caption" color="text.secondary">
                            None.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      invoice.receipts.map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>{r.receiptNo}</TableCell>
                          <TableCell>{r.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>

          <SectionHeader>Bank Detail</SectionHeader>
          <Grid container spacing={1.5}>
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
            <FormField md={12}>
              <TextField fullWidth multiline minRows={2} value={invoice.bankDetailText} disabled />
            </FormField>
          </Grid>
        </Grid>

        {/* RIGHT COLUMN — Charges grid, Container + Refund */}
        <Grid item xs={12} md={7}>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2, maxHeight: 560, overflowY: 'auto' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>CBM/WT</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Currency</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Rate</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>F/Amount</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.chargeLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 150 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        value={line.description}
                        disabled={!editable || !line.editableDescription}
                        onChange={(e) => updateChargeLine(line.id, { description: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField
                        select
                        variant="standard"
                        value={line.cbmWtBasis}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { cbmWtBasis: e.target.value as 'CBM' | 'WT' })}
                      >
                        <MenuItem value="CBM">CBM</MenuItem>
                        <MenuItem value="WT">WT</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" value={line.curr} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { curr: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 55 }}>
                      <TextField variant="standard" type="number" value={line.qty} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { qty: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>{line.fAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable || !line.editableDescription} onClick={() => confirmDelete(() => removeChargeLine(line.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TextField select variant="standard" label="PST" value="PST" disabled sx={{ width: 70 }}>
                        <MenuItem value="PST">PST</MenuItem>
                      </TextField>
                      <TextField
                        label="%"
                        variant="standard"
                        type="number"
                        value={invoice.salesTaxPercent}
                        disabled={!editable}
                        onChange={(e) => apply({ salesTaxPercent: Number(e.target.value) })}
                        sx={{ width: 60 }}
                      />
                      <TextField
                        label="S/Tax Inv No."
                        variant="standard"
                        value={invoice.salesTaxInvoiceNo}
                        disabled={!editable}
                        onChange={(e) => apply({ salesTaxInvoiceNo: e.target.value })}
                      />
                    </Box>
                  </TableCell>
                  <TableCell colSpan={4} />
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      WHT Sales Tax % (Not included in Invoice Totals)
                    </Typography>
                  </TableCell>
                  <TableCell colSpan={5}>
                    <TextField
                      variant="standard"
                      type="number"
                      value={invoice.whtSalesTaxPercent}
                      disabled={!editable}
                      onChange={(e) => apply({ whtSalesTaxPercent: Number(e.target.value) })}
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} sx={{ fontWeight: 700 }}>
                    Invoice Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{invoice.invoiceTotal.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addChargeLine} sx={{ m: 1 }}>
              Add Charge Line
            </Button>
          </TableContainer>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SectionHeader>Container</SectionHeader>
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
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
                        <TableCell sx={{ minWidth: 70 }}>
                          <TextField variant="standard" value={c.containerNo} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { containerNo: e.target.value })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 70 }}>
                          <TextField variant="standard" value={c.size} disabled={!editable} onChange={(e) => updateContainerLine(c.id, { size: e.target.value })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 70 }}>
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
                  Add
                </Button>
              </TableContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <SectionHeader>Refund</SectionHeader>
              <Paper variant="outlined" sx={{ p: 1.5 }}>
                <Grid container spacing={1.5}>
                  <FormField md={6}>
                    <TextField label="Refund" type="number" fullWidth value={invoice.refund} disabled={!editable} onChange={(e) => apply({ refund: Number(e.target.value) })} />
                  </FormField>
                  <FormField md={6}>
                    <TextField
                      label="Refund Ex.Rate"
                      type="number"
                      fullWidth
                      value={invoice.refundExRate}
                      disabled={!editable}
                      onChange={(e) => apply({ refundExRate: Number(e.target.value) })}
                    />
                  </FormField>
                  <FormField md={12}>
                    <TextField label="Total Refund Amount" fullWidth value={invoice.totalRefundAmount.toFixed(2)} disabled />
                  </FormField>
                  <FormField md={12}>
                    <TextField label="Invoice Total" fullWidth value={invoice.invoiceTotalPkr.toFixed(2)} disabled />
                  </FormField>
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
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

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
import { AirImportForeignAgentInvoice } from '../../domain/airImportForeignAgentInvoice';
import { AirImportVariantConfig } from './variantConfig';
import { airImportJobRepo } from '../../data/airImportJobService';
import { lookupAirImportJobForAgentInvoice } from '../../data/airImportForeignAgentInvoiceService';
import { bankRepo, currencyRepo, foreignAgentRepo } from '../../data/masterDataService';
import { recomputeAgentInvoiceTotals, recomputeChargeLine } from './agentInvoiceCalculations';

interface MainScreenTabProps {
  invoice: AirImportForeignAgentInvoice;
  config: AirImportVariantConfig;
  editable: boolean;
  onChange: (invoice: AirImportForeignAgentInvoice) => void;
}

export function MainScreenTab({ invoice, config, editable, onChange }: MainScreenTabProps) {
  const jobs = airImportJobRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const currencies = currencyRepo.list();
  const banks = bankRepo.list();

  const apply = (patch: Partial<AirImportForeignAgentInvoice>) => onChange(recomputeAgentInvoiceTotals({ ...invoice, ...patch }));

  const setJobNo = (jobNo: string) => {
    const ref = lookupAirImportJobForAgentInvoice(jobNo);
    if (!ref) {
      apply({ jobNo: '' });
      return;
    }
    apply({
      jobNo,
      jobYear: ref.jobYear,
      mawbNo: ref.mawbNo,
      mawbDate: ref.mawbDate,
      fAgentCode: invoice.fAgentCode || ref.foreignAgent,
      commodity: ref.commodity,
      origin: ref.origin,
      destination: ref.destination,
      grossWeight: ref.grossWeight,
      chargeableWeight: ref.chargeableWeight,
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

  // --- Auto Calculate Cost Grid ---
  const addCostLine = () => {
    apply({
      costLines: [
        ...invoice.costLines,
        {
          id: uuid(),
          year: invoice.jobYear,
          jobNo: invoice.jobNo,
          hawbNo: '',
          hawbDate: '',
          ppCc: 'PP',
          pcs: 0,
          uom: '',
          grossWeight: 0,
          chargeableWeight: 0,
          cost: 0,
          freightAmount: 0,
        },
      ],
    });
  };
  const updateCostLine = (id: string, patch: Partial<AirImportForeignAgentInvoice['costLines'][number]>) => {
    apply({ costLines: invoice.costLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeCostLine = (id: string) => apply({ costLines: invoice.costLines.filter((l) => l.id !== id) });
  const costTotals = invoice.costLines.reduce(
    (acc, l) => ({
      pcs: acc.pcs + l.pcs,
      grossWeight: acc.grossWeight + l.grossWeight,
      chargeableWeight: acc.chargeableWeight + l.chargeableWeight,
      cost: acc.cost + l.cost,
      freightAmount: acc.freightAmount + l.freightAmount,
    }),
    { pcs: 0, grossWeight: 0, chargeableWeight: 0, cost: 0, freightAmount: 0 }
  );

  // --- Charges Grid ---
  const addChargeLine = () => {
    apply({ chargeLines: [...invoice.chargeLines, { id: uuid(), description: '', rate: 0, amount: 0, editableDescription: true }] });
  };
  const updateChargeLine = (id: string, patch: Partial<AirImportForeignAgentInvoice['chargeLines'][number]>) => {
    apply({ chargeLines: invoice.chargeLines.map((l) => (l.id === id ? recomputeChargeLine({ ...l, ...patch }) : l)) });
  };
  const removeChargeLine = (id: string) => apply({ chargeLines: invoice.chargeLines.filter((l) => l.id !== id) });

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
      <Grid container spacing={2} sx={{ mb: 1.5 }}>
        <FormField md={2}>
          <TextField label="Branch" fullWidth value={invoice.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
        </FormField>
        <FormField md={3}>
          <TextField label={config.entryDocLabel} fullWidth value={invoice.documentNo} disabled />
        </FormField>
        <FormField md={3}>
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
      </Grid>
      <Grid container spacing={2} sx={{ mb: 1.5 }}>
        <FormField md={4}>
          <TextField label="F/Agent Doc. No." fullWidth value={invoice.fAgentDocNo} disabled={!editable} onChange={(e) => apply({ fAgentDocNo: e.target.value })} />
        </FormField>
        <FormField md={4}>
          <TextField
            label="F/Agent Doc. Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={invoice.fAgentDocDate}
            disabled={!editable}
            onChange={(e) => apply({ fAgentDocDate: e.target.value })}
          />
        </FormField>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 1.5 }}>
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
        <FormField md={2}>
          <TextField label="Year" type="number" fullWidth value={invoice.jobYear} disabled />
        </FormField>
        <FormField md={3}>
          <TextField label="Record No." fullWidth value={invoice.recordNo} disabled={!editable} onChange={(e) => apply({ recordNo: e.target.value })} />
        </FormField>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 1.5 }}>
        <FormField md={4}>
          <TextField label="MAWB No." fullWidth value={invoice.mawbNo} disabled={!editable} onChange={(e) => apply({ mawbNo: e.target.value })} />
        </FormField>
        <FormField md={4}>
          <TextField
            label="MAWB Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={invoice.mawbDate}
            disabled={!editable}
            onChange={(e) => apply({ mawbDate: e.target.value })}
          />
        </FormField>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 1.5 }}>
        <FormField md={12}>
          <TextField select label="F/Agent Code" fullWidth value={invoice.fAgentCode} disabled={!editable} onChange={(e) => setFAgentCode(e.target.value)}>
            {foreignAgents.map((a) => (
              <MenuItem key={a.code} value={a.code}>
                {a.code} — {a.name}
              </MenuItem>
            ))}
          </TextField>
        </FormField>
      </Grid>
      <Grid container spacing={2} sx={{ mb: 1.5 }}>
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
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <FormField md={3}>
          <TextField select label="Post in PKR Currency" fullWidth value={invoice.postInPkr} disabled={!editable} onChange={(e) => apply({ postInPkr: e.target.value as 'Y' | 'N' })}>
            <MenuItem value="N">N</MenuItem>
            <MenuItem value="Y">Y</MenuItem>
          </TextField>
        </FormField>
        <FormField md={3}>
          <TextField label="Pieces" type="number" fullWidth value={invoice.pieces} disabled={!editable} onChange={(e) => apply({ pieces: Number(e.target.value) })} />
        </FormField>
        <FormField md={3}>
          <TextField label="Unit" fullWidth value={invoice.unit} disabled={!editable} onChange={(e) => apply({ unit: e.target.value })} />
        </FormField>
        <FormField md={3}>
          <TextField select label="Currency" fullWidth value={invoice.currencyCode} disabled={!editable} onChange={(e) => apply({ currencyCode: e.target.value })}>
            <MenuItem value="">(none)</MenuItem>
            {currencies.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {c.code}
              </MenuItem>
            ))}
          </TextField>
        </FormField>
        <FormField md={3}>
          <TextField label="Gross Weight (kg)" type="number" fullWidth value={invoice.grossWeight} disabled={!editable} onChange={(e) => apply({ grossWeight: Number(e.target.value) })} />
        </FormField>
        <FormField md={3}>
          <TextField
            label="Chargeable Weight (kg)"
            type="number"
            fullWidth
            value={invoice.chargeableWeight}
            disabled={!editable}
            onChange={(e) => apply({ chargeableWeight: Number(e.target.value) })}
          />
        </FormField>
        <FormField md={3}>
          <TextField
            label="Exchange Rate"
            type="number"
            fullWidth
            value={invoice.exchangeRate}
            disabled={!editable}
            onChange={(e) => apply({ exchangeRate: Number(e.target.value) })}
          />
        </FormField>
      </Grid>

      <Grid container spacing={2}>
        {/* LEFT — Auto Calculate Cost grid */}
        <Grid item xs={12} md={7}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main' }}>
              Auto Calculate Cost
            </Typography>
            <TextField
              select
              size="small"
              value={invoice.autoCalculateCost}
              disabled={!editable}
              onChange={(e) => apply({ autoCalculateCost: e.target.value as 'Y' | 'N' })}
              sx={{ width: 80 }}
            >
              <MenuItem value="N">N</MenuItem>
              <MenuItem value="Y">Y</MenuItem>
            </TextField>
          </Box>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Job No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>HAWB No.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>PP/CC</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Pcs</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Uom</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Gross Wt.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Chg. Wt.</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Cost</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Freight Amt.</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.costLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={line.jobNo} disabled={!editable} onChange={(e) => updateCostLine(line.id, { jobNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={line.hawbNo} disabled={!editable} onChange={(e) => updateCostLine(line.id, { hawbNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField
                        type="date"
                        variant="standard"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={line.hawbDate}
                        disabled={!editable}
                        onChange={(e) => updateCostLine(line.id, { hawbDate: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField select variant="standard" value={line.ppCc} disabled={!editable} onChange={(e) => updateCostLine(line.id, { ppCc: e.target.value as 'PP' | 'CC' })}>
                        <MenuItem value="PP">PP</MenuItem>
                        <MenuItem value="CC">CC</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 50 }}>
                      <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateCostLine(line.id, { pcs: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" value={line.uom} disabled={!editable} onChange={(e) => updateCostLine(line.id, { uom: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 75 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.grossWeight}
                        disabled={!editable}
                        onChange={(e) => updateCostLine(line.id, { grossWeight: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 75 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.chargeableWeight}
                        disabled={!editable}
                        onChange={(e) => updateCostLine(line.id, { chargeableWeight: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.cost} disabled={!editable} onChange={(e) => updateCostLine(line.id, { cost: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.freightAmount}
                        disabled={!editable}
                        onChange={(e) => updateCostLine(line.id, { freightAmount: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeCostLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 700 }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{costTotals.pcs}</TableCell>
                  <TableCell />
                  <TableCell sx={{ fontWeight: 700 }}>{costTotals.grossWeight.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{costTotals.chargeableWeight.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{costTotals.cost.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{costTotals.freightAmount.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addCostLine}>
            Add Cost Line
          </Button>
        </Grid>

        {/* RIGHT — Charges grid, Bank Detail, Receipts, Remarks */}
        <Grid item xs={12} md={5}>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#dcfce7' }}>CHARGES</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#dcfce7' }}>RATE</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#dcfce7' }}>AMOUNT</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.chargeLines.map((line, i) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        value={line.description}
                        disabled={!editable || !line.editableDescription}
                        onChange={(e) => updateChargeLine(line.id, { description: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>{line.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable || i === 0} onClick={() => removeChargeLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{invoice.totalAmount.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addChargeLine} sx={{ m: 1 }}>
              Add Charge Line
            </Button>
          </TableContainer>

          <SectionHeader>Bank Detail</SectionHeader>
          <Grid container spacing={1.5} sx={{ mb: 2 }}>
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

          <SectionHeader>Receipts</SectionHeader>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
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
          </TableContainer>

          <SectionHeader>Remarks</SectionHeader>
          <TextField fullWidth multiline minRows={3} value={invoice.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} />
        </Grid>
      </Grid>
    </Box>
  );
}

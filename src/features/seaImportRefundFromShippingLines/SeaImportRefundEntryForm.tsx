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
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormRow, FormField, SectionHeader } from '../../components/FormGrid';
import { SeaImportRefundFromShippingLines } from '../../domain/seaImportRefundFromShippingLines';
import { seaImportJobRepo } from '../../data/seaImportJobService';
import { lookupSeaImportJobForRefund } from '../../data/seaImportRefundFromShippingLinesService';
import { currencyRepo, partyRepo } from '../../data/masterDataService';
import { recomputeChargeLine, recomputeRefundTotals } from './refundCalculations';

interface SeaImportRefundEntryFormProps {
  refund: SeaImportRefundFromShippingLines;
  editable: boolean;
  onChange: (refund: SeaImportRefundFromShippingLines) => void;
}

export function SeaImportRefundEntryForm({ refund, editable, onChange }: SeaImportRefundEntryFormProps) {
  const jobs = seaImportJobRepo.list();
  const parties = partyRepo.list();
  const currencies = currencyRepo.list();

  const apply = (patch: Partial<SeaImportRefundFromShippingLines>) => onChange(recomputeRefundTotals({ ...refund, ...patch }));

  const setJobNo = (jobNo: string) => {
    const ref = lookupSeaImportJobForRefund(jobNo);
    if (!ref) {
      apply({ jobNo: '' });
      return;
    }
    apply({
      jobNo,
      jobYear: ref.jobYear,
      lclFcl: ref.lclFcl,
      mblNo: ref.mblNo,
      hblNo: ref.hblNo,
      vessel: ref.vessel,
      origin: ref.origin,
      destination: ref.destination,
      cbm: ref.cbm,
      partyCode: ref.partyCode,
      partyName: ref.partyName,
      sLineAgent: ref.sLineAgent,
    });
  };

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    apply({ partyCode, partyName: p?.name ?? '' });
  };

  // --- Charges Grid ---
  const addChargeLine = () => {
    apply({ chargeLines: [...refund.chargeLines, { id: uuid(), description: '', ratePerCbm: 0, amount1: 0, amount2: 0 }] });
  };
  const updateChargeLine = (id: string, patch: Partial<SeaImportRefundFromShippingLines['chargeLines'][number]>) => {
    const chargeLines = refund.chargeLines.map((l) => (l.id === id ? recomputeChargeLine({ ...l, ...patch }, refund.cbm) : l));
    apply({ chargeLines });
  };
  const removeChargeLine = (id: string) => apply({ chargeLines: refund.chargeLines.filter((l) => l.id !== id) });

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
          <TextField label="Branch" fullWidth value={refund.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
        </FormField>
        <FormField md={2}>
          <TextField label="Document No." fullWidth value={refund.documentNo} disabled />
        </FormField>
        <FormField md={2}>
          <TextField
            label="Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={refund.date}
            disabled={!editable}
            onChange={(e) => apply({ date: e.target.value })}
          />
        </FormField>
        <FormField md={3}>
          <TextField select label="Job No." fullWidth value={refund.jobNo} disabled={!editable} onChange={(e) => setJobNo(e.target.value)}>
            <MenuItem value="">(none)</MenuItem>
            {jobs.map((j) => (
              <MenuItem key={j.jobNo} value={j.jobNo}>
                {j.jobNo}
              </MenuItem>
            ))}
          </TextField>
        </FormField>
        <FormField md={3}>
          <TextField select label="LCL/FCL" fullWidth value={refund.lclFcl} disabled={!editable} onChange={(e) => apply({ lclFcl: e.target.value as 'LCL' | 'FCL' })}>
            <MenuItem value="LCL">LCL</MenuItem>
            <MenuItem value="FCL">FCL</MenuItem>
          </TextField>
        </FormField>
      </Grid>

      <Grid container spacing={2}>
        {/* LEFT COLUMN — JOB Information */}
        <Grid item xs={12} md={5}>
          <SectionHeader>JOB Information</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField label="S/L Agent" fullWidth value={refund.sLineAgent} disabled={!editable} onChange={(e) => apply({ sLineAgent: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="PKR Currency"
                fullWidth
                value={refund.postInPkrCurrency}
                disabled={!editable}
                onChange={(e) => apply({ postInPkrCurrency: e.target.value as 'Y' | 'N' })}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField label="Bill No" fullWidth value={refund.billNo} disabled={!editable} onChange={(e) => apply({ billNo: e.target.value })} />
            </FormField>
            <FormField md={3}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={refund.billDate}
                disabled={!editable}
                onChange={(e) => apply({ billDate: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Currency" fullWidth value={refund.currency} disabled={!editable} onChange={(e) => apply({ currency: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {currencies.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField label="Ex.Rate" type="number" fullWidth value={refund.exRate} disabled={!editable} onChange={(e) => apply({ exRate: Number(e.target.value) })} />
            </FormField>
            <FormField md={3}>
              <TextField label="CBM" type="number" fullWidth value={refund.cbm} disabled={!editable} onChange={(e) => apply({ cbm: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Party Code" fullWidth value={refund.partyCode} disabled={!editable} onChange={(e) => setPartyCode(e.target.value)}>
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
              <TextField label="Agent Party" fullWidth value={refund.agentParty} disabled={!editable} onChange={(e) => apply({ agentParty: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="MBL No." fullWidth value={refund.mblNo} disabled={!editable} onChange={(e) => apply({ mblNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="HBL No." fullWidth value={refund.hblNo} disabled={!editable} onChange={(e) => apply({ hblNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Vessel" fullWidth value={refund.vessel} disabled={!editable} onChange={(e) => apply({ vessel: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Origin" fullWidth value={refund.origin} disabled={!editable} onChange={(e) => apply({ origin: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Destination" fullWidth value={refund.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })} />
            </FormField>
          </FormRow>

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={8}>
              <SectionHeader>Remarks</SectionHeader>
              <TextField fullWidth multiline minRows={4} value={refund.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} />
            </Grid>
            <Grid item xs={4}>
              <SectionHeader>Doc No</SectionHeader>
              <TextField fullWidth multiline minRows={4} value={refund.docNo} disabled={!editable} onChange={(e) => apply({ docNo: e.target.value })} />
            </Grid>
          </Grid>
        </Grid>

        {/* RIGHT COLUMN — Charges Detail */}
        <Grid item xs={12} md={7}>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }} colSpan={2}>
                    Rate / CBM
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} />
                  <TableCell sx={{ fontWeight: 700 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                    Ocean Freight
                  </TableCell>
                  <TableCell />
                  <TableCell />
                </TableRow>
                {refund.chargeLines.map((line, i) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 160 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        value={line.description}
                        disabled={!editable || i === 0}
                        onChange={(e) => updateChargeLine(line.id, { description: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.ratePerCbm}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { ratePerCbm: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 100 }}>{line.amount1.toFixed(2)}</TableCell>
                    <TableCell sx={{ minWidth: 100 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.amount2}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { amount2: Number(e.target.value) })}
                      />
                      <IconButton size="small" disabled={!editable || i === 0} onClick={() => confirmDelete(() => removeChargeLine(line.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                    Total Amount
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{refund.totalAmount.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addChargeLine} sx={{ m: 1 }}>
              Add Charge Line
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

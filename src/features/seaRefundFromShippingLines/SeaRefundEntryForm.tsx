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
import { SeaRefundFromShippingLines } from '../../domain/seaRefundFromShippingLines';
import { seaExportJobRepo } from '../../data/seaExportJobService';
import { getJobsForConsolRefund, lookupSeaJobForRefund } from '../../data/seaRefundFromShippingLinesService';
import { currencyRepo } from '../../data/masterDataService';
import { recomputeChargeLine, recomputeRefundTotals } from './refundCalculations';

interface SeaRefundEntryFormProps {
  refund: SeaRefundFromShippingLines;
  editable: boolean;
  onChange: (refund: SeaRefundFromShippingLines) => void;
}

export function SeaRefundEntryForm({ refund, editable, onChange }: SeaRefundEntryFormProps) {
  const currencies = currencyRepo.list();
  const consolJobs = seaExportJobRepo.find((j) => !!j.consolNo);
  const jobsInConsol = refund.consolNo ? getJobsForConsolRefund(refund.consolNo) : [];

  const apply = (patch: Partial<SeaRefundFromShippingLines>) => onChange(recomputeRefundTotals({ ...refund, ...patch }));

  const setConsolNo = (consolNo: string) => {
    if (!consolNo) {
      apply({ consolNo: '', jobNo: '', sLineAgent: '', cbm: 0 });
      return;
    }
    const jobs = getJobsForConsolRefund(consolNo);
    const first = jobs[0];
    apply({
      consolNo,
      jobNo: first?.jobNo ?? '',
      jobYear: first ? new Date(first.date).getFullYear() : refund.jobYear,
      sLineAgent: first?.sLineAgent ?? '',
      cbm: first?.cbm ?? 0,
    });
  };

  // --- Job Allocation Grid ---
  const addAllocationLine = () => {
    const ref = refund.jobNo ? lookupSeaJobForRefund(refund.jobNo) : null;
    apply({
      allocationLines: [
        ...refund.allocationLines,
        {
          id: uuid(),
          year: refund.jobYear,
          jobNo: refund.jobNo,
          mblNo: ref?.mblNo ?? '',
          hblNo: ref?.hblNo ?? '',
          pcs: 0,
          grossWeight: 0,
          cbm: 0,
          cost: 0,
          partyName: '',
        },
      ],
    });
  };
  const updateAllocationLine = (id: string, patch: Partial<SeaRefundFromShippingLines['allocationLines'][number]>) => {
    apply({ allocationLines: refund.allocationLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeAllocationLine = (id: string) => apply({ allocationLines: refund.allocationLines.filter((l) => l.id !== id) });

  /** Selecting a job on an allocation line also syncs the header Job No./S/L Agent/CBM and pulls that job's MBL/HBL. */
  const setAllocationLineJob = (id: string, jobNo: string) => {
    const ref = lookupSeaJobForRefund(jobNo);
    apply({
      allocationLines: refund.allocationLines.map((l) => (l.id === id ? { ...l, jobNo, mblNo: ref?.mblNo ?? '', hblNo: ref?.hblNo ?? '' } : l)),
      jobNo,
      jobYear: ref?.jobYear ?? refund.jobYear,
      sLineAgent: ref?.sLineAgent ?? refund.sLineAgent,
      cbm: ref?.cbm ?? refund.cbm,
      consolNo: ref?.consolNo || refund.consolNo,
    });
  };

  const allocationTotals = refund.allocationLines.reduce(
    (acc, l) => ({ pcs: acc.pcs + l.pcs, grossWeight: acc.grossWeight + l.grossWeight, cbm: acc.cbm + l.cbm, cost: acc.cost + l.cost }),
    { pcs: 0, grossWeight: 0, cbm: 0, cost: 0 }
  );

  // --- Charges Detail Grid ---
  const addChargeLine = () => {
    apply({
      chargeLines: [
        ...refund.chargeLines,
        { id: uuid(), code: '', description: '', ratePerCbm: 0, curr: refund.currency, fAmount: 0, pkrAmount: 0 },
      ],
    });
  };
  const updateChargeLine = (id: string, patch: Partial<SeaRefundFromShippingLines['chargeLines'][number]>) => {
    const chargeLines = refund.chargeLines.map((l) => (l.id === id ? recomputeChargeLine({ ...l, ...patch }, refund.cbm, refund.exRate) : l));
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
      <Grid container spacing={2}>
        {/* LEFT COLUMN — Header Fields + Allocation Grid */}
        <Grid item xs={12} md={5}>
          <FormRow>
            <FormField md={4}>
              <TextField label="Branch" fullWidth value={refund.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Document No." fullWidth value={refund.documentNo} disabled />
            </FormField>
            <FormField md={4}>
              <TextField label="Year" type="number" fullWidth value={refund.year} disabled={!editable} onChange={(e) => apply({ year: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
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
            <FormField md={6}>
              <TextField select label="Consol Job No." fullWidth value={refund.consolNo} disabled={!editable} onChange={(e) => setConsolNo(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {Array.from(new Set(consolJobs.map((j) => j.consolNo))).map((consolNo) => (
                  <MenuItem key={consolNo} value={consolNo}>
                    {consolNo}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>

          <SectionHeader>Job Allocation Grid</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell>Job No.</TableCell>
                  <TableCell>MBL No.</TableCell>
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
                {refund.allocationLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.year} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { year: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 130 }}>
                      <TextField
                        select
                        variant="standard"
                        fullWidth
                        value={line.jobNo}
                        disabled={!editable}
                        onChange={(e) => setAllocationLineJob(line.id, e.target.value)}
                      >
                        {refund.jobNo && <MenuItem value={refund.jobNo}>{refund.jobNo}</MenuItem>}
                        {jobsInConsol.map((j) => (
                          <MenuItem key={j.jobNo} value={j.jobNo}>
                            {j.jobNo}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 100 }}>
                      <TextField variant="standard" value={line.mblNo} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { mblNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 100 }}>
                      <TextField variant="standard" value={line.hblNo} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { hblNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 55 }}>
                      <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { pcs: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.grossWeight}
                        disabled={!editable}
                        onChange={(e) => updateAllocationLine(line.id, { grossWeight: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.cbm} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { cbm: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField variant="standard" type="number" value={line.cost} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { cost: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField variant="standard" value={line.partyName} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { partyName: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeAllocationLine(line.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.pcs}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.grossWeight.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.cbm.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.cost.toFixed(2)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addAllocationLine} sx={{ m: 1 }}>
              Add Allocation Line
            </Button>
          </Paper>

          <FormRow>
            <FormField md={12}>
              <TextField label="S/L Agent" fullWidth value={refund.sLineAgent} disabled={!editable} onChange={(e) => apply({ sLineAgent: e.target.value })} />
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
            <FormField md={6}>
              <TextField label="Ex.Rate" type="number" fullWidth value={refund.exRate} disabled={!editable} onChange={(e) => apply({ exRate: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Bill No" fullWidth value={refund.billNo} disabled={!editable} onChange={(e) => apply({ billNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Bill Date"
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
              <TextField label="CBM" type="number" fullWidth value={refund.cbm} disabled={!editable} onChange={(e) => apply({ cbm: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Remarks" fullWidth multiline minRows={3} value={refund.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField
                select
                label="Post in Local Currency (Y/N)"
                fullWidth
                value={refund.postInLocalCurrency}
                disabled={!editable}
                onChange={(e) => apply({ postInLocalCurrency: e.target.value as 'Y' | 'N' })}
              >
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
        </Grid>

        {/* RIGHT COLUMN — Charges Detail, Job History */}
        <Grid item xs={12} md={7}>
          <SectionHeader>Charges Detail</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Rate / CBM</TableCell>
                  <TableCell>Curr</TableCell>
                  <TableCell>F/Amount</TableCell>
                  <TableCell>PKR/Amount</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {refund.chargeLines.map((line, i) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        value={line.code}
                        disabled={!editable || i === 0}
                        onChange={(e) => updateChargeLine(line.id, { code: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 140 }}>
                      <TextField
                        variant="standard"
                        value={line.description}
                        disabled={!editable || i === 0}
                        onChange={(e) => updateChargeLine(line.id, { description: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.ratePerCbm}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { ratePerCbm: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" value={line.curr} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { curr: e.target.value })} />
                    </TableCell>
                    <TableCell>{line.fAmount.toFixed(2)}</TableCell>
                    <TableCell>{line.pkrAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable || i === 0} onClick={() => confirmDelete(() => removeChargeLine(line.id))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} sx={{ fontWeight: 700 }}>
                    Total Amount
                  </TableCell>
                  <TableCell colSpan={2} sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {refund.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addChargeLine} sx={{ m: 1 }}>
              Add Charge Line
            </Button>
          </Paper>

          <SectionHeader>Job History</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Job No.</TableCell>
                  <TableCell>Job Party</TableCell>
                  <TableCell>Credit Party</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {refund.jobHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="caption" color="text.secondary">
                        No records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  refund.jobHistory.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell>{h.no}</TableCell>
                      <TableCell>{h.date}</TableCell>
                      <TableCell>{h.jobNo}</TableCell>
                      <TableCell>
                        {h.jobPartyCode} — {h.jobPartyName}
                      </TableCell>
                      <TableCell>
                        {h.creditPartyCode} — {h.creditPartyName}
                      </TableCell>
                      <TableCell>{h.amount.toFixed(2)}</TableCell>
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

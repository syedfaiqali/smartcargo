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
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { FormRow, FormField, SectionHeader } from '../../components/FormGrid';
import { OtherChargesPayable } from '../../domain/otherChargesPayable';
import { jobRepo } from '../../data/jobService';
import { getHouseJobsForMaster, lookupMasterJob } from '../../data/otherChargesPayableService';
import { currencyRepo, partyRepo, payableTypeRepo } from '../../data/masterDataService';
import { recomputeChargeLine, recomputePayableTotals } from './payableCalculations';

interface PayableEntryFormProps {
  payable: OtherChargesPayable;
  editable: boolean;
  onChange: (payable: OtherChargesPayable) => void;
}

export function PayableEntryForm({ payable, editable, onChange }: PayableEntryFormProps) {
  const parties = partyRepo.list();
  const payableTypes = payableTypeRepo.list();
  const currencies = currencyRepo.list();
  const masterJobs = jobRepo.find((j) => j.kind === 'MAWB');
  const houseJobs = payable.mJobNo ? getHouseJobsForMaster(payable.mJobNo) : [];

  const apply = (patch: Partial<OtherChargesPayable>) => onChange(recomputePayableTotals({ ...payable, ...patch }));

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    apply({ partyCode, partyName: p?.name ?? '', partyAddress: p?.address ?? '' });
  };

  const setMasterJobNo = (mJobNo: string) => {
    const ref = lookupMasterJob(mJobNo);
    if (!ref) {
      apply({ mJobNo: '', mawbNo: '', grossWeight: 0, chargeWeight: 0 });
      return;
    }
    apply({ mJobNo, mawbNo: ref.mawbNo, jobYear: ref.jobYear, grossWeight: ref.grossWeight, chargeWeight: ref.chargeWeight });
  };

  // --- 5.3 Job/HAWB Allocation Grid ---
  const addAllocationLine = () => {
    apply({
      allocationLines: [
        ...payable.allocationLines,
        { id: uuid(), jobNo: payable.mJobNo, hawbNo: '', pcs: 0, grossWeight: 0, chargeWeight: 0, cost: 0, partyName: payable.partyName },
      ],
    });
  };
  const updateAllocationLine = (id: string, patch: Partial<OtherChargesPayable['allocationLines'][number]>) => {
    apply({ allocationLines: payable.allocationLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeAllocationLine = (id: string) => apply({ allocationLines: payable.allocationLines.filter((l) => l.id !== id) });

  const allocationTotals = payable.allocationLines.reduce(
    (acc, l) => ({ pcs: acc.pcs + l.pcs, grossWeight: acc.grossWeight + l.grossWeight, chargeWeight: acc.chargeWeight + l.chargeWeight, cost: acc.cost + l.cost }),
    { pcs: 0, grossWeight: 0, chargeWeight: 0, cost: 0 }
  );

  // --- 5.4 Other Charges Grid ---
  const addChargeLine = () => {
    apply({
      chargeLines: [
        ...payable.chargeLines,
        { id: uuid(), code: '', description: '', wtPcBasis: 'WT', curr: payable.currency1, qty: 0, rate: 0, fAmount: 0, pkrAmount: 0 },
      ],
    });
  };
  const updateChargeLine = (id: string, patch: Partial<OtherChargesPayable['chargeLines'][number]>) => {
    const chargeLines = payable.chargeLines.map((l) => (l.id === id ? recomputeChargeLine({ ...l, ...patch }, payable.exRate1) : l));
    apply({ chargeLines });
  };
  const removeChargeLine = (id: string) => apply({ chargeLines: payable.chargeLines.filter((l) => l.id !== id) });

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
        {/* LEFT COLUMN — 5.2 Header Fields */}
        <Grid item xs={12} md={5}>
          <FormRow>
            <FormField md={4}>
              <TextField label="Branch" fullWidth value={payable.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Credit Note No." fullWidth value={payable.creditNoteNo} disabled />
            </FormField>
            <FormField md={4}>
              <TextField label="Year" type="number" fullWidth value={payable.year} disabled={!editable} onChange={(e) => apply({ year: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={payable.date}
                disabled={!editable}
                onChange={(e) => apply({ date: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField select label="Payable Type" fullWidth value={payable.payableType} disabled={!editable} onChange={(e) => apply({ payableType: e.target.value })}>
                {payableTypes.map((t) => (
                  <MenuItem key={t.code} value={t.code}>
                    {t.code} — {t.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={payable.dueDate}
                disabled={!editable}
                onChange={(e) => apply({ dueDate: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField select label="Party (Vendor)" fullWidth value={payable.partyCode} disabled={!editable} onChange={(e) => setPartyCode(e.target.value)}>
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
              <TextField label="Name" fullWidth value={payable.partyName} disabled />
            </FormField>
            <FormField md={6}>
              <TextField label="Address" fullWidth value={payable.partyAddress} disabled />
            </FormField>
          </FormRow>

          <SectionHeader>Linked Master Job</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField select label="M/Job No." fullWidth value={payable.mJobNo} disabled={!editable} onChange={(e) => setMasterJobNo(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {masterJobs.map((j) => (
                  <MenuItem key={j.jobNo} value={j.jobNo}>
                    {j.jobNo} — MAWB {j.mawbNo || '(unassigned)'}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="MAWB No." fullWidth value={payable.mawbNo} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="Job Year" type="number" fullWidth value={payable.jobYear} disabled />
            </FormField>
            <FormField md={4}>
              <TextField label="Gross Weight" fullWidth value={payable.grossWeight} disabled />
            </FormField>
            <FormField md={4}>
              <TextField label="Charge Weight" fullWidth value={payable.chargeWeight} disabled />
            </FormField>
          </FormRow>

          <SectionHeader>Currency &amp; Bill</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField
                select
                label="Post in Local Currency (Y/N)"
                fullWidth
                value={payable.postInLocalCurrency}
                disabled={!editable}
                onChange={(e) => apply({ postInLocalCurrency: e.target.value as 'Y' | 'N' })}
              >
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
                    value={payable[currKey]}
                    disabled={!editable}
                    onChange={(e) => apply({ [currKey]: e.target.value } as Partial<OtherChargesPayable>)}
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
                    label="Ex Rate"
                    type="number"
                    fullWidth
                    value={payable[rateKey]}
                    disabled={!editable}
                    onChange={(e) => apply({ [rateKey]: Number(e.target.value) } as Partial<OtherChargesPayable>)}
                  />
                </FormField>
              </FormRow>
            );
          })}
          <FormRow>
            <FormField md={6}>
              <TextField label="Bill No." fullWidth value={payable.billNo} disabled={!editable} onChange={(e) => apply({ billNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Bill Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={payable.billDate}
                disabled={!editable}
                onChange={(e) => apply({ billDate: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Remarks" fullWidth multiline minRows={2} value={payable.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} />
            </FormField>
          </FormRow>
        </Grid>

        {/* MIDDLE COLUMN — 5.3 Allocation Grid, 5.4 Other Charges Grid */}
        <Grid item xs={12} md={7}>
          <SectionHeader>5.3 Job/HAWB Allocation Grid</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job No.</TableCell>
                  <TableCell>HAWB No.</TableCell>
                  <TableCell>Pcs</TableCell>
                  <TableCell>Gr.Weight</TableCell>
                  <TableCell>Ch.Weight</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Party Name</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {payable.allocationLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 130 }}>
                      <TextField
                        select
                        variant="standard"
                        fullWidth
                        value={line.jobNo}
                        disabled={!editable}
                        onChange={(e) => updateAllocationLine(line.id, { jobNo: e.target.value })}
                      >
                        <MenuItem value={payable.mJobNo}>{payable.mJobNo} (Master)</MenuItem>
                        {houseJobs.map((h) => (
                          <MenuItem key={h.jobNo} value={h.jobNo}>
                            {h.jobNo} (House)
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 100 }}>
                      <TextField variant="standard" value={line.hawbNo} disabled={!editable} onChange={(e) => updateAllocationLine(line.id, { hawbNo: e.target.value })} />
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
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.chargeWeight}
                        disabled={!editable}
                        onChange={(e) => updateAllocationLine(line.id, { chargeWeight: Number(e.target.value) })}
                      />
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
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell />
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.pcs}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.grossWeight.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.chargeWeight.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{allocationTotals.cost.toFixed(2)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable || !payable.mJobNo} onClick={addAllocationLine} sx={{ m: 1 }}>
              Add Allocation Line
            </Button>
          </Paper>

          <SectionHeader>5.4 Other Charges Grid</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>WT/PC</TableCell>
                  <TableCell>Curr</TableCell>
                  <TableCell>Qty</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>F/Amount</TableCell>
                  <TableCell>PKR/Amount</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {payable.chargeLines.map((line, i) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField
                        variant="standard"
                        value={line.code}
                        disabled={!editable || i === 0}
                        onChange={(e) => updateChargeLine(line.id, { code: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField
                        variant="standard"
                        value={line.description}
                        disabled={!editable || i === 0}
                        onChange={(e) => updateChargeLine(line.id, { description: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField
                        select
                        variant="standard"
                        value={line.wtPcBasis}
                        disabled={!editable}
                        onChange={(e) => updateChargeLine(line.id, { wtPcBasis: e.target.value as 'WT' | 'PC' })}
                      >
                        <MenuItem value="WT">WT</MenuItem>
                        <MenuItem value="PC">PC</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" value={line.curr} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { curr: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 60 }}>
                      <TextField variant="standard" type="number" value={line.qty} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { qty: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { rate: Number(e.target.value) })} />
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
                  <TableCell colSpan={6} sx={{ fontWeight: 700 }}>
                    Grand Total / Total Charges
                  </TableCell>
                  <TableCell colSpan={2} sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {payable.totalCharges.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addChargeLine} sx={{ m: 1 }}>
              Add Charge Line
            </Button>
          </Paper>

          <SectionHeader>5.5 Job History / Credit Note Grid</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Payable Type</TableCell>
                  <TableCell>H/JOB No.</TableCell>
                  <TableCell>Job Party</TableCell>
                  <TableCell>Credit Party</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payable.jobHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="caption" color="text.secondary">
                        No records found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  payable.jobHistory.map((h, i) => (
                    <TableRow key={i}>
                      <TableCell>{h.no}</TableCell>
                      <TableCell>{h.date}</TableCell>
                      <TableCell>{h.payableType}</TableCell>
                      <TableCell>{h.hJobNo}</TableCell>
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

          <SectionHeader>5.6 Voucher Clearance &amp; Attachment</SectionHeader>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Voucher No.</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {payable.usedClearedVouchers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3}>
                          <Typography variant="caption" color="text.secondary">
                            No records found.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      payable.usedClearedVouchers.map((v, i) => (
                        <TableRow key={i}>
                          <TableCell>{v.voucherNo}</TableCell>
                          <TableCell>{v.voucherDate}</TableCell>
                          <TableCell>{v.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button variant="outlined" size="small" startIcon={<AttachFileIcon />} disabled={!editable}>
                  Attach Bill/Receipt
                </Button>
                <TextField
                  label="Attachment Note"
                  fullWidth
                  multiline
                  minRows={2}
                  value={payable.attachmentNote}
                  disabled={!editable}
                  onChange={(e) => apply({ attachmentNote: e.target.value })}
                />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}

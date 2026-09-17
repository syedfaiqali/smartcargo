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
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import { FormRow, FormField, SectionHeader } from '../../components/FormGrid';
import { SeaImportOtherChargesPayable } from '../../domain/seaImportOtherChargesPayable';
import { seaImportJobRepo } from '../../data/seaImportJobService';
import { getJobsForSeaImportConsole, lookupSeaImportConsoleJob } from '../../data/seaImportOtherChargesPayableService';
import { currencyRepo, partyRepo, payableTypeRepo } from '../../data/masterDataService';
import { recomputeChargeLine, recomputePayableTotals } from './payableCalculations';

interface SeaImportPayableEntryFormProps {
  payable: SeaImportOtherChargesPayable;
  editable: boolean;
  onChange: (payable: SeaImportOtherChargesPayable) => void;
}

export function SeaImportPayableEntryForm({ payable, editable, onChange }: SeaImportPayableEntryFormProps) {
  const parties = partyRepo.list();
  const payableTypes = payableTypeRepo.list();
  const currencies = currencyRepo.list();
  const consoleJobs = Array.from(new Set(seaImportJobRepo.find((j) => !!j.consoleJob).map((j) => j.consoleJob)));
  const jobsInConsole = payable.consoleJobNo ? getJobsForSeaImportConsole(payable.consoleJobNo) : [];

  const apply = (patch: Partial<SeaImportOtherChargesPayable>) => onChange(recomputePayableTotals({ ...payable, ...patch }));

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    apply({ partyCode, partyName: p?.name ?? '', partyAddress: p?.address ?? '' });
  };

  const setConsoleJobNo = (consoleJobNo: string) => {
    const ref = lookupSeaImportConsoleJob(consoleJobNo);
    apply({ consoleJobNo, jobYear: ref?.jobYear ?? payable.jobYear, cbm: ref?.cbm ?? payable.cbm });
  };

  const setCurrencyRow = (index: number, patch: Partial<SeaImportOtherChargesPayable['currencies'][number]>) => {
    apply({ currencies: payable.currencies.map((c, i) => (i === index ? { ...c, ...patch } : c)) });
  };

  // --- Container Grid ---
  const addContainerLine = () => {
    apply({ containers: [...payable.containers, { id: uuid(), containerNo: '', size: '', rate: 0 }] });
  };
  const updateContainerLine = (id: string, patch: Partial<SeaImportOtherChargesPayable['containers'][number]>) => {
    apply({ containers: payable.containers.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  };
  const removeContainerLine = (id: string) => apply({ containers: payable.containers.filter((c) => c.id !== id) });

  // --- Auto Calculate Cost Grid ---
  const addCostLine = () => {
    apply({
      costLines: [
        ...payable.costLines,
        { id: uuid(), jobNo: '', hblNo: '', pcs: 0, grossWeight: 0, cbm: 0, cost: 0, partyName: payable.partyName },
      ],
    });
  };
  const updateCostLine = (id: string, patch: Partial<SeaImportOtherChargesPayable['costLines'][number]>) => {
    apply({ costLines: payable.costLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeCostLine = (id: string) => apply({ costLines: payable.costLines.filter((l) => l.id !== id) });
  const costTotals = payable.costLines.reduce(
    (acc, l) => ({ pcs: acc.pcs + l.pcs, grossWeight: acc.grossWeight + l.grossWeight, cbm: acc.cbm + l.cbm, cost: acc.cost + l.cost }),
    { pcs: 0, grossWeight: 0, cbm: 0, cost: 0 }
  );

  // --- Other Charges Grid ---
  const primaryCurrency = payable.currencies[0]?.currencyCode ?? '';
  const primaryExRate = payable.currencies[0]?.exRate ?? 0;
  const addChargeLine = () => {
    apply({ chargeLines: [...payable.chargeLines, { id: uuid(), code: '', description: '', curr: primaryCurrency, fAmount: 0, pkrAmount: 0 }] });
  };
  const updateChargeLine = (id: string, patch: Partial<SeaImportOtherChargesPayable['chargeLines'][number]>) => {
    const chargeLines = payable.chargeLines.map((l) => (l.id === id ? recomputeChargeLine({ ...l, ...patch }, primaryExRate) : l));
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
        {/* LEFT COLUMN — Header Fields */}
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
          </FormRow>
          <FormRow>
            <FormField md={12}>
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
            <FormField md={12}>
              <TextField select label="Party" fullWidth value={payable.partyCode} disabled={!editable} onChange={(e) => setPartyCode(e.target.value)}>
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
              <TextField
                select
                label="Take Effect in G.P"
                fullWidth
                value={payable.takeEffectInGp}
                disabled={!editable}
                onChange={(e) => apply({ takeEffectInGp: e.target.value as 'Y' | 'N' })}
              >
                <MenuItem value="Y">Yes</MenuItem>
                <MenuItem value="N">No</MenuItem>
              </TextField>
            </FormField>
          </FormRow>

          <SectionHeader>Linked Console Job</SectionHeader>
          <FormRow>
            <FormField md={8}>
              <TextField select label="Console Job No." fullWidth value={payable.consoleJobNo} disabled={!editable} onChange={(e) => setConsoleJobNo(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {consoleJobs.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField label="Year" type="number" fullWidth value={payable.jobYear} disabled />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="CBM" type="number" fullWidth value={payable.cbm} disabled={!editable} onChange={(e) => apply({ cbm: Number(e.target.value) })} />
            </FormField>
            <FormField md={6}>
              <TextField label="CBM Rate" type="number" fullWidth value={payable.cbmRate} disabled={!editable} onChange={(e) => apply({ cbmRate: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Bill No" fullWidth value={payable.billNo} disabled={!editable} onChange={(e) => apply({ billNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
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

          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={5}>
              <SectionHeader>Curr / Ex.Rate</SectionHeader>
              {payable.currencies.map((c, i) => (
                <FormRow key={i}>
                  <FormField md={7}>
                    <TextField select label="Curr" fullWidth value={c.currencyCode} disabled={!editable} onChange={(e) => setCurrencyRow(i, { currencyCode: e.target.value })}>
                      <MenuItem value="">(none)</MenuItem>
                      {currencies.map((cur) => (
                        <MenuItem key={cur.code} value={cur.code}>
                          {cur.code}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormField>
                  <FormField md={5}>
                    <TextField label="Ex.Rate" type="number" fullWidth value={c.exRate} disabled={!editable} onChange={(e) => setCurrencyRow(i, { exRate: Number(e.target.value) })} />
                  </FormField>
                </FormRow>
              ))}
            </Grid>
            <Grid item xs={12} md={7}>
              <SectionHeader>Container</SectionHeader>
              <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 1 }}>
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
                    {payable.containers.map((c) => (
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
                          <IconButton size="small" disabled={!editable} onClick={() => removeContainerLine(c.id)}>
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
              </Paper>
            </Grid>
          </Grid>

          <SectionHeader>Remarks</SectionHeader>
          <TextField fullWidth multiline minRows={3} value={payable.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} sx={{ mb: 2 }} />

          <SectionHeader>Auto Calculate Cost</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job No.</TableCell>
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
                {payable.costLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 110 }}>
                      <TextField select variant="standard" fullWidth value={line.jobNo} disabled={!editable} onChange={(e) => updateCostLine(line.id, { jobNo: e.target.value })}>
                        <MenuItem value="">(none)</MenuItem>
                        {jobsInConsole.map((j) => (
                          <MenuItem key={j.jobNo} value={j.jobNo}>
                            {j.jobNo}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={line.hblNo} disabled={!editable} onChange={(e) => updateCostLine(line.id, { hblNo: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 55 }}>
                      <TextField variant="standard" type="number" value={line.pcs} disabled={!editable} onChange={(e) => updateCostLine(line.id, { pcs: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={line.grossWeight}
                        disabled={!editable}
                        onChange={(e) => updateCostLine(line.id, { grossWeight: Number(e.target.value) })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.cbm} disabled={!editable} onChange={(e) => updateCostLine(line.id, { cbm: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.cost} disabled={!editable} onChange={(e) => updateCostLine(line.id, { cost: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField variant="standard" value={line.partyName} disabled={!editable} onChange={(e) => updateCostLine(line.id, { partyName: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeCostLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell />
                  <TableCell sx={{ fontWeight: 700 }}>{costTotals.pcs}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{costTotals.grossWeight.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{costTotals.cbm.toFixed(2)}</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{costTotals.cost.toFixed(2)}</TableCell>
                  <TableCell colSpan={2} />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addCostLine} sx={{ m: 1 }}>
              Add Cost Line
            </Button>
          </Paper>

          <SectionHeader>Job History</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Payable Type</TableCell>
                  <TableCell>Job No.</TableCell>
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

        {/* RIGHT COLUMN — Other Charges Grid, Used/Cleared Vouchers */}
        <Grid item xs={12} md={7}>
          <SectionHeader>Other Charges</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Curr</TableCell>
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
                    <TableCell sx={{ minWidth: 150 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        value={line.description}
                        disabled={!editable || i === 0}
                        onChange={(e) => updateChargeLine(line.id, { description: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" value={line.curr} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { curr: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" type="number" value={line.fAmount} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { fAmount: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>{line.pkrAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable || i === 0} onClick={() => removeChargeLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                    Grand Total
                  </TableCell>
                  <TableCell colSpan={2} sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {payable.grandTotal.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                    Total Charges
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

          <SectionHeader>Voucher Clearance &amp; Attachment</SectionHeader>
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
              <Paper variant="outlined" sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, bgcolor: '#f8fafc' }}>
                <ImageOutlinedIcon sx={{ fontSize: 40, color: '#cbd5e1' }} />
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

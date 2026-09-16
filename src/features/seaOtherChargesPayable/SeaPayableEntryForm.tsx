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
import { SeaOtherChargesPayable } from '../../domain/seaOtherChargesPayable';
import { seaExportJobRepo } from '../../data/seaExportJobService';
import { getJobsForConsol, lookupSeaJob } from '../../data/seaOtherChargesPayableService';
import { currencyRepo, partyRepo, payableTypeRepo } from '../../data/masterDataService';
import { recomputeChargeLine, recomputePayableTotals } from './payableCalculations';

interface SeaPayableEntryFormProps {
  payable: SeaOtherChargesPayable;
  editable: boolean;
  onChange: (payable: SeaOtherChargesPayable) => void;
}

export function SeaPayableEntryForm({ payable, editable, onChange }: SeaPayableEntryFormProps) {
  const parties = partyRepo.list();
  const payableTypes = payableTypeRepo.list();
  const currencies = currencyRepo.list();
  const consolJobs = seaExportJobRepo.find((j) => !!j.consolNo);
  const jobsInConsol = payable.consolNo ? getJobsForConsol(payable.consolNo) : [];

  const apply = (patch: Partial<SeaOtherChargesPayable>) => onChange(recomputePayableTotals({ ...payable, ...patch }));

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    apply({ partyCode, partyName: p?.name ?? '', partyAddress: p?.address ?? '' });
  };

  const setConsolNo = (consolNo: string) => {
    if (!consolNo) {
      apply({ consolNo: '', jobNo: '', mblNo: '', lclFcl: 'LCL', cbm: 0 });
      return;
    }
    const jobs = getJobsForConsol(consolNo);
    const first = jobs[0];
    apply({
      consolNo,
      jobNo: first?.jobNo ?? '',
      mblNo: first?.mblNo ?? '',
      jobYear: first ? new Date(first.date).getFullYear() : payable.jobYear,
      lclFcl: first?.lclFcl ?? 'LCL',
      cbm: first?.cbm ?? 0,
    });
  };

  const setJobNo = (jobNo: string) => {
    const ref = lookupSeaJob(jobNo);
    if (!ref) {
      apply({ jobNo: '' });
      return;
    }
    apply({ jobNo, mblNo: ref.mblNo, jobYear: ref.jobYear, lclFcl: ref.lclFcl, cbm: ref.cbm });
  };

  // --- Container Grid ---
  const addContainerLine = () => {
    apply({ containers: [...payable.containers, { id: uuid(), containerNo: '', size: '', rate: 0 }] });
  };
  const updateContainerLine = (id: string, patch: Partial<SeaOtherChargesPayable['containers'][number]>) => {
    apply({ containers: payable.containers.map((c) => (c.id === id ? { ...c, ...patch } : c)) });
  };
  const removeContainerLine = (id: string) => apply({ containers: payable.containers.filter((c) => c.id !== id) });

  // --- Auto Calculate Cost Grid ---
  const addCostLine = () => {
    apply({
      costLines: [
        ...payable.costLines,
        { id: uuid(), jobNo: payable.jobNo, hblNo: '', pcs: 0, grossWeight: 0, cbm: 0, cost: 0, partyName: payable.partyName },
      ],
    });
  };
  const updateCostLine = (id: string, patch: Partial<SeaOtherChargesPayable['costLines'][number]>) => {
    apply({ costLines: payable.costLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeCostLine = (id: string) => apply({ costLines: payable.costLines.filter((l) => l.id !== id) });

  const costTotals = payable.costLines.reduce(
    (acc, l) => ({ pcs: acc.pcs + l.pcs, grossWeight: acc.grossWeight + l.grossWeight, cbm: acc.cbm + l.cbm, cost: acc.cost + l.cost }),
    { pcs: 0, grossWeight: 0, cbm: 0, cost: 0 }
  );

  // --- Other Charges Grid ---
  const addChargeLine = () => {
    apply({
      chargeLines: [
        ...payable.chargeLines,
        { id: uuid(), code: '', description: '', cbmWtBasis: 'CBM', curr: payable.currency1, qty: 0, rate: 0, fAmount: 0, pkrAmount: 0 },
      ],
    });
  };
  const updateChargeLine = (id: string, patch: Partial<SeaOtherChargesPayable['chargeLines'][number]>) => {
    const chargeLines = payable.chargeLines.map((l) => (l.id === id ? recomputeChargeLine({ ...l, ...patch }, payable.exRate1) : l));
    apply({ chargeLines });
  };
  const removeChargeLine = (id: string) => apply({ chargeLines: payable.chargeLines.filter((l) => l.id !== id) });

  // --- Less Charges Grid ---
  const addLessChargeLine = () => {
    apply({
      lessChargeLines: [
        ...payable.lessChargeLines,
        { id: uuid(), code: '', description: '', cbmWtBasis: 'CBM', curr: payable.currency1, qty: 0, rate: 0, fAmount: 0, pkrAmount: 0 },
      ],
    });
  };
  const updateLessChargeLine = (id: string, patch: Partial<SeaOtherChargesPayable['lessChargeLines'][number]>) => {
    const lessChargeLines = payable.lessChargeLines.map((l) => (l.id === id ? recomputeChargeLine({ ...l, ...patch }, payable.exRate1) : l));
    apply({ lessChargeLines });
  };
  const removeLessChargeLine = (id: string) => apply({ lessChargeLines: payable.lessChargeLines.filter((l) => l.id !== id) });

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

          <SectionHeader>Linked Job</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField select label="Consol No." fullWidth value={payable.consolNo} disabled={!editable} onChange={(e) => setConsolNo(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {Array.from(new Set(consolJobs.map((j) => j.consolNo))).map((consolNo) => (
                  <MenuItem key={consolNo} value={consolNo}>
                    {consolNo}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Job No." fullWidth value={payable.jobNo} disabled={!editable} onChange={(e) => setJobNo(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {(payable.consolNo ? jobsInConsol : seaExportJobRepo.list()).map((j) => (
                  <MenuItem key={j.jobNo} value={j.jobNo}>
                    {j.jobNo}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="Job Year" type="number" fullWidth value={payable.jobYear} disabled />
            </FormField>
            <FormField md={8}>
              <TextField label="MBL No." fullWidth value={payable.mblNo} disabled={!editable} onChange={(e) => apply({ mblNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField select label="LCL/FCL" fullWidth value={payable.lclFcl} disabled={!editable} onChange={(e) => apply({ lclFcl: e.target.value as 'LCL' | 'FCL' })}>
                <MenuItem value="LCL">LCL</MenuItem>
                <MenuItem value="FCL">FCL</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="FOB/CIF" fullWidth value={payable.fobCif} disabled={!editable} onChange={(e) => apply({ fobCif: e.target.value as 'FOB' | 'CIF' })}>
                <MenuItem value="FOB">FOB</MenuItem>
                <MenuItem value="CIF">CIF</MenuItem>
              </TextField>
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

          <SectionHeader>Currency</SectionHeader>
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
                    onChange={(e) => apply({ [currKey]: e.target.value } as Partial<SeaOtherChargesPayable>)}
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
                    onChange={(e) => apply({ [rateKey]: Number(e.target.value) } as Partial<SeaOtherChargesPayable>)}
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
                {payable.containers.map((c) => (
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
                      <IconButton size="small" disabled={!editable} onClick={() => removeContainerLine(c.id)}>
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
        </Grid>

        {/* MIDDLE COLUMN — Auto Calculate Cost, Other Charges, Less Charges */}
        <Grid item xs={12} md={7}>
          <SectionHeader>Auto Calculate Cost</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Job No.</TableCell>
                  <TableCell>HBL No.</TableCell>
                  <TableCell>Pcs</TableCell>
                  <TableCell>Gr.Weight</TableCell>
                  <TableCell>CBM</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Party Name</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {payable.costLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 130 }}>
                      <TextField
                        select
                        variant="standard"
                        fullWidth
                        value={line.jobNo}
                        disabled={!editable}
                        onChange={(e) => updateCostLine(line.id, { jobNo: e.target.value })}
                      >
                        {payable.jobNo && <MenuItem value={payable.jobNo}>{payable.jobNo}</MenuItem>}
                        {jobsInConsol.map((j) => (
                          <MenuItem key={j.jobNo} value={j.jobNo}>
                            {j.jobNo}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 100 }}>
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
                    <TableCell sx={{ minWidth: 80 }}>
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
                    <TableCell sx={{ minWidth: 60 }}>
                      <TextField variant="standard" type="number" value={line.qty} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { qty: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateChargeLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>{line.fAmount.toFixed(2)}</TableCell>
                    <TableCell>{line.pkrAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable || i === 0} onClick={() => removeChargeLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={6} sx={{ fontWeight: 700 }}>
                    Sub Total
                  </TableCell>
                  <TableCell colSpan={2} sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {payable.subTotal.toFixed(2)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addChargeLine} sx={{ m: 1 }}>
              Add Charge Line
            </Button>
          </Paper>

          <SectionHeader>Less Charges</SectionHeader>
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
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {payable.lessChargeLines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" value={line.code} disabled={!editable} onChange={(e) => updateLessChargeLine(line.id, { code: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 120 }}>
                      <TextField
                        variant="standard"
                        value={line.description}
                        disabled={!editable}
                        onChange={(e) => updateLessChargeLine(line.id, { description: e.target.value })}
                      />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField
                        select
                        variant="standard"
                        value={line.cbmWtBasis}
                        disabled={!editable}
                        onChange={(e) => updateLessChargeLine(line.id, { cbmWtBasis: e.target.value as 'CBM' | 'WT' })}
                      >
                        <MenuItem value="CBM">CBM</MenuItem>
                        <MenuItem value="WT">WT</MenuItem>
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField variant="standard" value={line.curr} disabled={!editable} onChange={(e) => updateLessChargeLine(line.id, { curr: e.target.value })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 60 }}>
                      <TextField variant="standard" type="number" value={line.qty} disabled={!editable} onChange={(e) => updateLessChargeLine(line.id, { qty: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={line.rate} disabled={!editable} onChange={(e) => updateLessChargeLine(line.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell>{line.fAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeLessChargeLine(line.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={6} sx={{ fontWeight: 700 }}>
                    Less Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'error.main' }}>{payable.lessTotal.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell colSpan={6} sx={{ fontWeight: 700 }}>
                    Grand Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{payable.grandTotal.toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addLessChargeLine} sx={{ m: 1 }}>
              Add Less Charge Line
            </Button>
          </Paper>

          <SectionHeader>Job History / Credit Note Grid</SectionHeader>
          <Paper variant="outlined" sx={{ overflowX: 'auto', mb: 2 }}>
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

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
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { FormField } from '../../components/FormGrid';
import { SeaImportQuotation, QuotationVendorInfo } from '../../domain/seaImportQuotation';
import {
  airlineRepo,
  chargeableRepo,
  currencyRepo,
  foreignAgentRepo,
  partyRepo,
  seaPortRepo,
  signatoryRepo,
  spoRepo,
  termsRepo,
} from '../../data/masterDataService';
import { recomputeDimensionRow, recomputeQuotationTotals } from './quotationCalculations';

interface SeaImportQuotationEntryFormProps {
  quotation: SeaImportQuotation;
  editable: boolean;
  onChange: (quotation: SeaImportQuotation) => void;
}

const CLOSING_REASONS = ['Price too high', 'Lost to competitor', 'Customer cancelled', 'No response'];

export function SeaImportQuotationEntryForm({ quotation, editable, onChange }: SeaImportQuotationEntryFormProps) {
  const parties = partyRepo.list();
  const foreignAgents = foreignAgentRepo.list();
  const spoCodes = spoRepo.list();
  const seaPorts = seaPortRepo.list();
  const currencies = currencyRepo.list();
  const chargeableCodes = chargeableRepo.list();
  const signatories = signatoryRepo.list();
  const terms = termsRepo.list();
  const airlines = airlineRepo.list();

  const apply = (patch: Partial<SeaImportQuotation>) => onChange(recomputeQuotationTotals({ ...quotation, ...patch }));

  const setPartyCode = (partyCode: string) => {
    const p = parties.find((x) => x.code === partyCode);
    apply({ partyCode, name: p?.name ?? '', address: p?.address ?? '' });
  };

  const setCurrencyRow = (index: number, patch: Partial<SeaImportQuotation['currencies'][number]>) => {
    apply({ currencies: quotation.currencies.map((c, i) => (i === index ? { ...c, ...patch } : c)) });
  };

  // --- Job Info Grid ---
  const addJobInfoRow = () => apply({ jobInfo: [...quotation.jobInfo, { jobNo: '', date: quotation.date, type: '' }] });
  const updateJobInfoRow = (index: number, patch: Partial<SeaImportQuotation['jobInfo'][number]>) => {
    apply({ jobInfo: quotation.jobInfo.map((row, i) => (i === index ? { ...row, ...patch } : row)) });
  };
  const removeJobInfoRow = (index: number) => apply({ jobInfo: quotation.jobInfo.filter((_, i) => i !== index) });

  // --- Airline Rate Grid ---
  const addAirlineRateRow = () => apply({ airlineRates: [...quotation.airlineRates, { id: uuid(), airlineCode: '', rate: 0, currencyCode: '' }] });
  const updateAirlineRateRow = (id: string, patch: Partial<SeaImportQuotation['airlineRates'][number]>) => {
    apply({ airlineRates: quotation.airlineRates.map((row) => (row.id === id ? { ...row, ...patch } : row)) });
  };
  const removeAirlineRateRow = (id: string) => apply({ airlineRates: quotation.airlineRates.filter((row) => row.id !== id) });

  // --- Vendor Quote Details (Service Solicitor/Provider, Place of Acceptance, CO2, Issued By, Not Included, Terms) ---
  const emptyVendorInfo = (): QuotationVendorInfo => ({
    serviceSolicitorName: '',
    serviceSolicitorAddress: '',
    serviceSolicitorContact: '',
    serviceProviderName: '',
    serviceProviderAddress: '',
    issuedByName: '',
    issuedByCompany: '',
    issuedByPhone: '',
    issuedByEmail: '',
    co2EmissionsKg: 0,
    originCity: '',
    destinationCity: '',
    placeOfAcceptance: '',
    notIncluded: [],
    termsText: '',
  });
  const vendorInfo: QuotationVendorInfo = quotation.vendorInfo ?? emptyVendorInfo();
  const setVendorInfo = (patch: Partial<QuotationVendorInfo>) => {
    apply({ vendorInfo: { ...vendorInfo, ...patch } });
  };

  // --- Not Included list (one point per line) ---
  const notIncludedText = vendorInfo.notIncluded.join('\n');
  const setNotIncludedText = (text: string) => {
    setVendorInfo({ notIncluded: text.split('\n') });
  };

  // --- Local Charges Grid ---
  const addLocalCharge = () => apply({ localCharges: [...quotation.localCharges, { id: uuid(), description: '', amount: 0, currencyCode: quotation.currencies[0]?.currencyCode || 'EUR' }] });
  const updateLocalCharge = (id: string, patch: Partial<SeaImportQuotation['localCharges'][number]>) => {
    apply({ localCharges: quotation.localCharges.map((row) => (row.id === id ? { ...row, ...patch } : row)) });
  };
  const removeLocalCharge = (id: string) => apply({ localCharges: quotation.localCharges.filter((row) => row.id !== id) });
  const localChargesSubtotal = quotation.localCharges.reduce((sum, l) => sum + (l.amount || 0), 0);

  // --- Carrier Options Grid ---
  const addCarrierOption = () =>
    apply({
      carrierOptions: [
        ...quotation.carrierOptions,
        { id: uuid(), optionCode: '', carrierName: '', routing: '', scheduleNote: '', ratePerKg: 0, currencyCode: quotation.currencies[0]?.currencyCode || 'EUR' },
      ],
    });
  const updateCarrierOption = (id: string, patch: Partial<SeaImportQuotation['carrierOptions'][number]>) => {
    apply({ carrierOptions: quotation.carrierOptions.map((row) => (row.id === id ? { ...row, ...patch } : row)) });
  };
  const removeCarrierOption = (id: string) => apply({ carrierOptions: quotation.carrierOptions.filter((row) => row.id !== id) });

  // --- Service Charges (Origin / Destination) ---
  const addServiceChargeLine = (side: 'serviceChargesOrigin' | 'serviceChargesDestination') => {
    apply({ [side]: [...quotation[side], { id: uuid(), description: '', buyingCurr: '', buyingAmount: 0, sellingCurr: '', sellingAmount: 0 }] } as Partial<SeaImportQuotation>);
  };
  const updateServiceChargeLine = (
    side: 'serviceChargesOrigin' | 'serviceChargesDestination',
    id: string,
    patch: Partial<SeaImportQuotation['serviceChargesOrigin'][number]>
  ) => {
    apply({ [side]: quotation[side].map((l) => (l.id === id ? { ...l, ...patch } : l)) } as Partial<SeaImportQuotation>);
  };
  const removeServiceChargeLine = (side: 'serviceChargesOrigin' | 'serviceChargesDestination', id: string) => {
    apply({ [side]: quotation[side].filter((l) => l.id !== id) } as Partial<SeaImportQuotation>);
  };

  // --- Refund Amount Grid ---
  const addRefundLine = () => apply({ refundLines: [...quotation.refundLines, { id: uuid(), curr: '', amountFcr: 0, amount: 0 }] });
  const updateRefundLine = (id: string, patch: Partial<SeaImportQuotation['refundLines'][number]>) => {
    apply({ refundLines: quotation.refundLines.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  };
  const removeRefundLine = (id: string) => apply({ refundLines: quotation.refundLines.filter((l) => l.id !== id) });

  // --- Dimension Calculation Grid ---
  const updateDimensionRow = (index: number, patch: Partial<SeaImportQuotation['dimensions'][number]>) => {
    const dimensions = quotation.dimensions.map((row, i) => (i === index ? recomputeDimensionRow({ ...row, ...patch }) : row));
    apply({ dimensions });
  };
  const dimWeightTotal = quotation.dimensions.reduce((sum, r) => sum + r.total, 0);

  const renderServiceChargeGrid = (side: 'serviceChargesOrigin' | 'serviceChargesDestination', label: string) => (
    <Box sx={{ mb: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>{label}</TableCell>
            <TableCell sx={{ fontWeight: 700 }} colSpan={2}>Buying</TableCell>
            <TableCell sx={{ fontWeight: 700 }} colSpan={2}>Selling</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {quotation[side].map((line) => (
            <TableRow key={line.id}>
              <TableCell sx={{ minWidth: 150 }}>
                <TextField variant="standard" fullWidth value={line.description} disabled={!editable} onChange={(e) => updateServiceChargeLine(side, line.id, { description: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 65 }}>
                <TextField variant="standard" value={line.buyingCurr} disabled={!editable} onChange={(e) => updateServiceChargeLine(side, line.id, { buyingCurr: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={line.buyingAmount} disabled={!editable} onChange={(e) => updateServiceChargeLine(side, line.id, { buyingAmount: Number(e.target.value) })} />
              </TableCell>
              <TableCell sx={{ minWidth: 65 }}>
                <TextField variant="standard" value={line.sellingCurr} disabled={!editable} onChange={(e) => updateServiceChargeLine(side, line.id, { sellingCurr: e.target.value })} />
              </TableCell>
              <TableCell sx={{ minWidth: 90 }}>
                <TextField variant="standard" type="number" value={line.sellingAmount} disabled={!editable} onChange={(e) => updateServiceChargeLine(side, line.id, { sellingAmount: Number(e.target.value) })} />
              </TableCell>
              <TableCell>
                <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeServiceChargeLine(side, line.id))}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={() => addServiceChargeLine(side)} sx={{ mt: 0.5 }}>
        Add Line
      </Button>
    </Box>
  );

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
        {/* LEFT COLUMN — Header fields */}
        <Grid item xs={12} md={5}>
          <Grid container spacing={1.5}>
            <FormField md={6}>
              <TextField label="Branch" fullWidth value={quotation.branch} disabled={!editable} onChange={(e) => apply({ branch: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField select label="Transport Mode" fullWidth value={quotation.transportMode} disabled={!editable} onChange={(e) => apply({ transportMode: e.target.value as SeaImportQuotation['transportMode'] })}>
                <MenuItem value="">(none)</MenuItem>
                <MenuItem value="AIR">Air</MenuItem>
                <MenuItem value="SEA">Sea</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={quotation.date}
                disabled={!editable}
                onChange={(e) => apply({ date: e.target.value })}
              />
            </FormField>
            <FormField md={6}>
              <TextField label="Validity" fullWidth value={quotation.validity} disabled={!editable} onChange={(e) => apply({ validity: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Quotation No." fullWidth value={quotation.quotationNo} disabled />
            </FormField>
            <FormField md={3}>
              <TextField select label="Call Type" fullWidth value={quotation.callType} disabled={!editable} onChange={(e) => apply({ callType: e.target.value })}>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Specific">Specific</MenuItem>
              </TextField>
            </FormField>
            <FormField md={3}>
              <TextField label="" fullWidth value={quotation.callTypeRef} disabled={!editable} onChange={(e) => apply({ callTypeRef: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Suppl.Quote No." fullWidth value={quotation.supplQuoteNo} disabled={!editable} onChange={(e) => apply({ supplQuoteNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Related Quote No." fullWidth value={quotation.relatedQuoteNo} disabled />
            </FormField>
            <FormField md={12}>
              <TextField select label="Local/Int'l Quotation" fullWidth value={quotation.localIntl} disabled={!editable} onChange={(e) => apply({ localIntl: e.target.value as 'Local' | "Int'l" })}>
                <MenuItem value="Local">Local</MenuItem>
                <MenuItem value="Int'l">Int'l</MenuItem>
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Customer" fullWidth value={quotation.customerCode} disabled={!editable} onChange={(e) => apply({ customerCode: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="Party Code" fullWidth value={quotation.partyCode} disabled={!editable} onChange={(e) => setPartyCode(e.target.value)}>
                <MenuItem value="">(none)</MenuItem>
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField label="Name" fullWidth value={quotation.name} disabled />
            </FormField>
            <FormField md={12}>
              <TextField label="Address" fullWidth multiline minRows={3} value={quotation.address} disabled />
            </FormField>
            <FormField md={12}>
              <TextField select label="Foreign Agent's" fullWidth value={quotation.foreignAgentCode} disabled={!editable} onChange={(e) => apply({ foreignAgentCode: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {foreignAgents.map((a) => (
                  <MenuItem key={a.code} value={a.code}>
                    {a.code} — {a.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField select label="SPO Code" fullWidth value={quotation.spoCode} disabled={!editable} onChange={(e) => apply({ spoCode: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {spoCodes.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Origin" fullWidth value={quotation.origin} disabled={!editable} onChange={(e) => apply({ origin: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Destination" fullWidth value={quotation.destination} disabled={!editable} onChange={(e) => apply({ destination: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {seaPorts.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField label="Commodity" fullWidth value={quotation.commodity} disabled={!editable} onChange={(e) => apply({ commodity: e.target.value })} />
            </FormField>
            <FormField md={8}>
              <TextField label="CC Port" fullWidth value={quotation.ccPort} disabled={!editable} onChange={(e) => apply({ ccPort: e.target.value })} />
            </FormField>
            <FormField md={4}>
              <TextField
                label="CC Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={quotation.ccDate}
                disabled={!editable}
                onChange={(e) => apply({ ccDate: e.target.value })}
              />
            </FormField>
            <FormField md={12}>
              <TextField label="Customer Ref. No." fullWidth value={quotation.customerRefNo} disabled={!editable} onChange={(e) => apply({ customerRefNo: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="Pick Up Location" fullWidth value={quotation.pickUpLocation} disabled={!editable} onChange={(e) => apply({ pickUpLocation: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="Drop Off Location" fullWidth value={quotation.dropOffLocation} disabled={!editable} onChange={(e) => apply({ dropOffLocation: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="No. Of Pkgs" type="number" fullWidth value={quotation.noOfPkgs} disabled={!editable} onChange={(e) => apply({ noOfPkgs: Number(e.target.value) })} />
            </FormField>
            <FormField md={6}>
              <TextField label="UOM" fullWidth value={quotation.uom} disabled={!editable} onChange={(e) => apply({ uom: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Package Type" fullWidth value={quotation.packageType} disabled={!editable} onChange={(e) => apply({ packageType: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Gross Weight" type="number" fullWidth value={quotation.grossWeight} disabled={!editable} onChange={(e) => apply({ grossWeight: Number(e.target.value) })} />
            </FormField>
            <FormField md={6}>
              <TextField
                label="Ch. Weight"
                type="number"
                fullWidth
                value={quotation.chWeight}
                disabled={!editable}
                helperText={quotation.dimensions[0]?.length ? 'Auto-calculated from Dimension Calculation (IATA volumetric vs. Gross Weight)' : undefined}
                onChange={(e) => apply({ chWeight: Number(e.target.value) })}
              />
            </FormField>
            <FormField md={6}>
              <TextField label="Inco Term" fullWidth value={quotation.incoTerm} disabled={!editable} onChange={(e) => apply({ incoTerm: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField select label="Cargo Type" fullWidth value={quotation.cargoType} disabled={!editable} onChange={(e) => apply({ cargoType: e.target.value })}>
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Hazardous">Hazardous</MenuItem>
                <MenuItem value="Perishable">Perishable</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField label="Cargo Value" type="number" fullWidth value={quotation.cargoValue} disabled={!editable} onChange={(e) => apply({ cargoValue: Number(e.target.value) })} />
            </FormField>
            <FormField md={6}>
              <TextField select label="Cargo Curr" fullWidth value={quotation.cargoCurr} disabled={!editable} onChange={(e) => apply({ cargoCurr: e.target.value })}>
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
                label="C.B.M"
                type="number"
                fullWidth
                value={quotation.cbm}
                disabled={!editable}
                helperText={quotation.dimensions[0]?.length ? 'Auto-calculated: Pieces × (L × W × H)' : undefined}
                onChange={(e) => apply({ cbm: Number(e.target.value) })}
              />
            </FormField>
            <FormField md={6}>
              <TextField select label="Charge Code" fullWidth value={quotation.chargeCode} disabled={!editable} onChange={(e) => apply({ chargeCode: e.target.value })}>
                <MenuItem value="">(none)</MenuItem>
                {chargeableCodes.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code} — {c.description}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="All-in" fullWidth value={quotation.allIn} disabled={!editable} onChange={(e) => apply({ allIn: e.target.value as 'Y' | 'N' })}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField select label="Win" fullWidth value={quotation.win} disabled={!editable} onChange={(e) => apply({ win: e.target.value as 'Y' | 'N' })}>
                <MenuItem value="N">N</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
              </TextField>
            </FormField>
            <FormField md={12}>
              <TextField label="Reason" fullWidth multiline minRows={3} value={quotation.reason} disabled={!editable} onChange={(e) => apply({ reason: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="HS Code" fullWidth value={quotation.hsCode} disabled={!editable} onChange={(e) => apply({ hsCode: e.target.value })} />
            </FormField>
            <FormField md={12}>
              <TextField label="Prepared By" fullWidth value={quotation.preparedBy} disabled={!editable} onChange={(e) => apply({ preparedBy: e.target.value })} />
            </FormField>
            <FormField md={8}>
              <TextField select label="Approved By" fullWidth value={quotation.approvedBy} disabled={!editable} onChange={(e) => apply({ approvedBy: e.target.value })}>
                <MenuItem value="">Select Signatory</MenuItem>
                {signatories.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={quotation.approvedByDate}
                disabled={!editable}
                onChange={(e) => apply({ approvedByDate: e.target.value })}
              />
            </FormField>
            <FormField md={8}>
              <TextField select label="Closing Reason" fullWidth value={quotation.closingReason} disabled={!editable} onChange={(e) => apply({ closingReason: e.target.value })}>
                <MenuItem value="">Select Reason</MenuItem>
                {CLOSING_REASONS.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
            <FormField md={4}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={quotation.closingReasonDate}
                disabled={!editable}
                onChange={(e) => apply({ closingReasonDate: e.target.value })}
              />
            </FormField>
            <FormField md={12}>
              <TextField label="Remarks" fullWidth value={quotation.remarks} disabled={!editable} onChange={(e) => apply({ remarks: e.target.value })} />
            </FormField>
          </Grid>

          {/* Dimension Calculation grid */}
          <Paper variant="outlined" sx={{ mt: 2, overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dcfce7', fontWeight: 700 } }}>
                  <TableCell colSpan={5}>Dimension Calculation</TableCell>
                </TableRow>
                <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dcfce7', fontWeight: 700 } }}>
                  <TableCell />
                  <TableCell>Length</TableCell>
                  <TableCell>Width</TableCell>
                  <TableCell>Height</TableCell>
                  <TableCell>No.of Ctns.</TableCell>
                  <TableCell>Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotation.dimensions.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell sx={{ fontWeight: 700, minWidth: 60 }}>CM({i + 1})</TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={row.length} disabled={!editable} onChange={(e) => updateDimensionRow(i, { length: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={row.width} disabled={!editable} onChange={(e) => updateDimensionRow(i, { width: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={row.height} disabled={!editable} onChange={(e) => updateDimensionRow(i, { height: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 70 }}>
                      <TextField variant="standard" type="number" value={row.noOfCtns} disabled={!editable} onChange={(e) => updateDimensionRow(i, { noOfCtns: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 80 }}>{row.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                    Dim-Weight
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{dimWeightTotal.toFixed(2)}</TableCell>
                  <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                    / {quotation.dimWeightDivisor || 0}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{quotation.dimWeight.toFixed(2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={2} sx={{ fontWeight: 700 }}>
                    Dim-CBM
                  </TableCell>
                  <TableCell colSpan={3} sx={{ fontWeight: 700 }}>
                    / {quotation.dimCbmDivisor || 0}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>{quotation.dimCbm.toFixed(2)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN — Currency/Job Info, Terms, Service Charges, Refund */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={0} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dcfce7', fontWeight: 700 } }}>
                    <TableCell>Currency</TableCell>
                    <TableCell>Ex.Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotation.currencies.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <TextField select variant="standard" fullWidth value={c.currencyCode} disabled={!editable} onChange={(e) => setCurrencyRow(i, { currencyCode: e.target.value })}>
                          <MenuItem value="">(none)</MenuItem>
                          {currencies.map((cur) => (
                            <MenuItem key={cur.code} value={cur.code}>
                              {cur.code}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell>
                        <TextField variant="standard" type="number" value={c.exRate} disabled={!editable} onChange={(e) => setCurrencyRow(i, { exRate: Number(e.target.value) })} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Grid>
            <Grid item xs={6}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dcfce7', fontWeight: 700 } }}>
                    <TableCell colSpan={3}>Job Info.</TableCell>
                  </TableRow>
                  <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dcfce7', fontWeight: 700 } }}>
                    <TableCell>Job No.</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {quotation.jobInfo.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <TextField variant="standard" value={row.jobNo} disabled={!editable} onChange={(e) => updateJobInfoRow(i, { jobNo: e.target.value })} />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="date"
                          variant="standard"
                          InputLabelProps={{ shrink: true }}
                          value={row.date}
                          disabled={!editable}
                          onChange={(e) => updateJobInfoRow(i, { date: e.target.value })}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField variant="standard" value={row.type} disabled={!editable} onChange={(e) => updateJobInfoRow(i, { type: e.target.value })} />
                        <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeJobInfoRow(i))}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addJobInfoRow}>
                Add Job
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dcfce7', fontWeight: 700 } }}>
                  <TableCell colSpan={4}>Airline Rate</TableCell>
                </TableRow>
                <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dcfce7', fontWeight: 700 } }}>
                  <TableCell>Airline</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Curr</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {quotation.airlineRates.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ minWidth: 150 }}>
                      <TextField select variant="standard" fullWidth value={row.airlineCode} disabled={!editable} onChange={(e) => updateAirlineRateRow(row.id, { airlineCode: e.target.value })}>
                        <MenuItem value="">(none)</MenuItem>
                        {airlines.map((a) => (
                          <MenuItem key={a.code} value={a.code}>
                            {a.code} — {a.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell sx={{ minWidth: 90 }}>
                      <TextField variant="standard" type="number" value={row.rate} disabled={!editable} onChange={(e) => updateAirlineRateRow(row.id, { rate: Number(e.target.value) })} />
                    </TableCell>
                    <TableCell sx={{ minWidth: 65 }}>
                      <TextField select variant="standard" fullWidth value={row.currencyCode} disabled={!editable} onChange={(e) => updateAirlineRateRow(row.id, { currencyCode: e.target.value })}>
                        <MenuItem value="">(none)</MenuItem>
                        {currencies.map((cur) => (
                          <MenuItem key={cur.code} value={cur.code}>
                            {cur.code}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled={!editable} onClick={() => removeAirlineRateRow(row.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addAirlineRateRow} sx={{ mt: 0.5 }}>
              Add Airline Rate
            </Button>
          </Box>

          <Accordion defaultExpanded sx={{ mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#075a9d', color: 'white', fontWeight: 700, '& .MuiSvgIcon-root': { color: 'white' } }}>
              Pricing Air Export — Vendor Quote Details
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={1.5}>
                <Grid item xs={12}>
                  <Box sx={{ fontWeight: 700, fontSize: 13, color: '#075a9d', mb: 0.5 }}>Service Solicitor</Box>
                </Grid>
                <FormField md={6}>
                  <TextField label="Name" fullWidth value={vendorInfo.serviceSolicitorName} disabled={!editable} onChange={(e) => setVendorInfo({ serviceSolicitorName: e.target.value })} />
                </FormField>
                <FormField md={6}>
                  <TextField label="Contact Person" fullWidth value={vendorInfo.serviceSolicitorContact} disabled={!editable} onChange={(e) => setVendorInfo({ serviceSolicitorContact: e.target.value })} />
                </FormField>
                <FormField md={12}>
                  <TextField label="Address" fullWidth multiline minRows={2} value={vendorInfo.serviceSolicitorAddress} disabled={!editable} onChange={(e) => setVendorInfo({ serviceSolicitorAddress: e.target.value })} />
                </FormField>

                <Grid item xs={12}>
                  <Box sx={{ fontWeight: 700, fontSize: 13, color: '#075a9d', mb: 0.5, mt: 1 }}>Service Provider</Box>
                </Grid>
                <FormField md={12}>
                  <TextField label="Name" fullWidth value={vendorInfo.serviceProviderName} disabled={!editable} onChange={(e) => setVendorInfo({ serviceProviderName: e.target.value })} />
                </FormField>
                <FormField md={12}>
                  <TextField label="Address" fullWidth multiline minRows={2} value={vendorInfo.serviceProviderAddress} disabled={!editable} onChange={(e) => setVendorInfo({ serviceProviderAddress: e.target.value })} />
                </FormField>

                <Grid item xs={12}>
                  <Box sx={{ fontWeight: 700, fontSize: 13, color: '#075a9d', mb: 0.5, mt: 1 }}>Transport Details</Box>
                </Grid>
                <FormField md={6}>
                  <TextField label="Departure City" fullWidth value={vendorInfo.originCity} disabled={!editable} onChange={(e) => setVendorInfo({ originCity: e.target.value })} helperText={`Shown as "${quotation.origin || 'CODE'} - ${vendorInfo.originCity || 'City'}"`} />
                </FormField>
                <FormField md={6}>
                  <TextField label="Destination City" fullWidth value={vendorInfo.destinationCity} disabled={!editable} onChange={(e) => setVendorInfo({ destinationCity: e.target.value })} helperText={`Shown as "${quotation.destination || 'CODE'} - ${vendorInfo.destinationCity || 'City'}"`} />
                </FormField>
                <FormField md={6}>
                  <TextField label="Place of Acceptance" fullWidth value={vendorInfo.placeOfAcceptance} disabled={!editable} onChange={(e) => setVendorInfo({ placeOfAcceptance: e.target.value })} />
                </FormField>
                <FormField md={6}>
                  <TextField label="Total CO2 Emissions (kg)" type="number" fullWidth value={vendorInfo.co2EmissionsKg} disabled={!editable} onChange={(e) => setVendorInfo({ co2EmissionsKg: Number(e.target.value) })} />
                </FormField>

                <Grid item xs={12}>
                  <Box sx={{ fontWeight: 700, fontSize: 13, color: '#075a9d', mb: 0.5, mt: 1 }}>Issued By</Box>
                </Grid>
                <FormField md={6}>
                  <TextField label="Name" fullWidth value={vendorInfo.issuedByName} disabled={!editable} onChange={(e) => setVendorInfo({ issuedByName: e.target.value })} />
                </FormField>
                <FormField md={6}>
                  <TextField label="Company" fullWidth value={vendorInfo.issuedByCompany} disabled={!editable} onChange={(e) => setVendorInfo({ issuedByCompany: e.target.value })} />
                </FormField>
                <FormField md={6}>
                  <TextField label="Phone" fullWidth value={vendorInfo.issuedByPhone} disabled={!editable} onChange={(e) => setVendorInfo({ issuedByPhone: e.target.value })} />
                </FormField>
                <FormField md={6}>
                  <TextField label="Email" fullWidth value={vendorInfo.issuedByEmail} disabled={!editable} onChange={(e) => setVendorInfo({ issuedByEmail: e.target.value })} />
                </FormField>

                <Grid item xs={12}>
                  <Box sx={{ fontWeight: 700, fontSize: 13, color: '#075a9d', mb: 0.5, mt: 1 }}>Not Included in this Quotation</Box>
                </Grid>
                <FormField md={12}>
                  <TextField
                    label="One point per line"
                    fullWidth
                    multiline
                    minRows={2}
                    value={notIncludedText}
                    disabled={!editable}
                    onChange={(e) => setNotIncludedText(e.target.value)}
                  />
                </FormField>

                <Grid item xs={12}>
                  <Box sx={{ fontWeight: 700, fontSize: 13, color: '#075a9d', mb: 0.5, mt: 1 }}>Terms and Conditions</Box>
                </Grid>
                <FormField md={12}>
                  <TextField
                    label="Terms text"
                    fullWidth
                    multiline
                    minRows={4}
                    value={vendorInfo.termsText}
                    disabled={!editable}
                    onChange={(e) => setVendorInfo({ termsText: e.target.value })}
                  />
                </FormField>
              </Grid>

              {/* Local Charges grid */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ fontWeight: 700, fontSize: 13, color: '#075a9d', mb: 0.5 }}>Local Charges</Box>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dcfce7', fontWeight: 700 } }}>
                      <TableCell>Description</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Curr</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {quotation.localCharges.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell sx={{ minWidth: 150 }}>
                          <TextField variant="standard" fullWidth value={row.description} disabled={!editable} onChange={(e) => updateLocalCharge(row.id, { description: e.target.value })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 90 }}>
                          <TextField variant="standard" type="number" value={row.amount} disabled={!editable} onChange={(e) => updateLocalCharge(row.id, { amount: Number(e.target.value) })} />
                        </TableCell>
                        <TableCell sx={{ minWidth: 65 }}>
                          <TextField select variant="standard" fullWidth value={row.currencyCode} disabled={!editable} onChange={(e) => updateLocalCharge(row.id, { currencyCode: e.target.value })}>
                            <MenuItem value="">(none)</MenuItem>
                            {currencies.map((cur) => (
                              <MenuItem key={cur.code} value={cur.code}>
                                {cur.code}
                              </MenuItem>
                            ))}
                          </TextField>
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" disabled={!editable} onClick={() => removeLocalCharge(row.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Subtotal</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{localChargesSubtotal.toFixed(2)}</TableCell>
                      <TableCell colSpan={2} />
                    </TableRow>
                  </TableBody>
                </Table>
                <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addLocalCharge} sx={{ mt: 0.5 }}>
                  Add Local Charge
                </Button>
              </Box>

              {/* Carrier Options grid */}
              <Box sx={{ mt: 2 }}>
                <Box sx={{ fontWeight: 700, fontSize: 13, color: '#075a9d', mb: 0.5 }}>Carrier Options</Box>
                {quotation.carrierOptions.map((opt, i) => (
                  <Paper key={opt.id} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={11}>
                        <Box sx={{ fontWeight: 700, fontSize: 12, color: '#5a6270' }}>Option {i + 1}</Box>
                      </Grid>
                      <Grid item xs={1} sx={{ textAlign: 'right' }}>
                        <IconButton size="small" disabled={!editable} onClick={() => removeCarrierOption(opt.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                      <FormField md={6}>
                        <TextField
                          label="Option Code & Carrier (e.g. TK - Turkish Airlines)"
                          fullWidth
                          size="small"
                          value={opt.optionCode}
                          disabled={!editable}
                          onChange={(e) => updateCarrierOption(opt.id, { optionCode: e.target.value })}
                        />
                      </FormField>
                      <FormField md={6}>
                        <TextField label="Carrier Name" fullWidth size="small" value={opt.carrierName} disabled={!editable} onChange={(e) => updateCarrierOption(opt.id, { carrierName: e.target.value })} />
                      </FormField>
                      <FormField md={6}>
                        <TextField label="Routing (e.g. OTP-IST-KHI)" fullWidth size="small" value={opt.routing} disabled={!editable} onChange={(e) => updateCarrierOption(opt.id, { routing: e.target.value })} />
                      </FormField>
                      <FormField md={3}>
                        <TextField label="Rate / kg" type="number" fullWidth size="small" value={opt.ratePerKg} disabled={!editable} onChange={(e) => updateCarrierOption(opt.id, { ratePerKg: Number(e.target.value) })} />
                      </FormField>
                      <FormField md={3}>
                        <TextField select label="Curr" fullWidth size="small" value={opt.currencyCode} disabled={!editable} onChange={(e) => updateCarrierOption(opt.id, { currencyCode: e.target.value })}>
                          <MenuItem value="">(none)</MenuItem>
                          {currencies.map((cur) => (
                            <MenuItem key={cur.code} value={cur.code}>
                              {cur.code}
                            </MenuItem>
                          ))}
                        </TextField>
                      </FormField>
                      <FormField md={12}>
                        <TextField
                          label="Routing remarks (DEP / ETA / transit note)"
                          fullWidth
                          size="small"
                          multiline
                          minRows={2}
                          value={opt.scheduleNote}
                          disabled={!editable}
                          onChange={(e) => updateCarrierOption(opt.id, { scheduleNote: e.target.value })}
                        />
                      </FormField>
                    </Grid>
                  </Paper>
                ))}
                <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addCarrierOption}>
                  Add Carrier Option
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded={false} sx={{ mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#d97706', color: 'white', fontWeight: 700, '& .MuiSvgIcon-root': { color: 'white' } }}>
              Terms And Condition
            </AccordionSummary>
            <AccordionDetails>
              <TextField select label="Terms Code" fullWidth value={quotation.termsAndConditions} disabled={!editable} onChange={(e) => apply({ termsAndConditions: e.target.value })} sx={{ mb: 1 }}>
                <MenuItem value="">(none)</MenuItem>
                {terms.map((t) => (
                  <MenuItem key={t.code} value={t.code}>
                    {t.code} — {t.description}
                  </MenuItem>
                ))}
              </TextField>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#d97706', color: 'white', fontWeight: 700, '& .MuiSvgIcon-root': { color: 'white' } }}>
              Extra Sheet
            </AccordionSummary>
            <AccordionDetails>
              <TextField fullWidth multiline minRows={3} value={quotation.extraSheet} disabled={!editable} onChange={(e) => apply({ extraSheet: e.target.value })} />
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#d97706', color: 'white', fontWeight: 700, '& .MuiSvgIcon-root': { color: 'white' } }}>
              Service Charges At Origin
            </AccordionSummary>
            <AccordionDetails>{renderServiceChargeGrid('serviceChargesOrigin', 'Description')}</AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded sx={{ mb: 2, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#d97706', color: 'white', fontWeight: 700, '& .MuiSvgIcon-root': { color: 'white' } }}>
              Service Charges At Destination
            </AccordionSummary>
            <AccordionDetails>{renderServiceChargeGrid('serviceChargesDestination', 'Description')}</AccordionDetails>
          </Accordion>

          <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
            <Grid container spacing={1}>
              <Grid item xs={8}>
                <Box sx={{ fontWeight: 700 }}>Grand Total (Buying)</Box>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right', fontWeight: 700 }}>
                PKR {quotation.grandTotalBuying.toFixed(2)}
              </Grid>
              <Grid item xs={8}>
                <Box sx={{ fontWeight: 700 }}>Grand Total (Selling)</Box>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right', fontWeight: 700 }}>
                PKR {quotation.grandTotalSelling.toFixed(2)}
              </Grid>
              <Grid item xs={8}>
                <Box sx={{ fontWeight: 700, color: 'primary.main' }}>Difference (Selling - Buying)</Box>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right', fontWeight: 700, color: 'primary.main' }}>
                PKR {quotation.difference.toFixed(2)}
              </Grid>
            </Grid>
          </Paper>

          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dcfce7', fontWeight: 700 } }}>
                <TableCell colSpan={4}>Refund Amount</TableCell>
              </TableRow>
              <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#dcfce7', fontWeight: 700 } }}>
                <TableCell>Curr</TableCell>
                <TableCell>Amount (FCR)</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {quotation.refundLines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell sx={{ minWidth: 70 }}>
                    <TextField variant="standard" value={line.curr} disabled={!editable} onChange={(e) => updateRefundLine(line.id, { curr: e.target.value })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <TextField variant="standard" type="number" value={line.amountFcr} disabled={!editable} onChange={(e) => updateRefundLine(line.id, { amountFcr: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 90 }}>
                    <TextField variant="standard" type="number" value={line.amount} disabled={!editable} onChange={(e) => updateRefundLine(line.id, { amount: Number(e.target.value) })} />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" disabled={!editable} onClick={() => confirmDelete(() => removeRefundLine(line.id))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button size="small" startIcon={<AddIcon />} disabled={!editable} onClick={addRefundLine}>
            Add Refund Line
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

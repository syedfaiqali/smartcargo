import { useState } from 'react';
import { v4 as uuid } from 'uuid';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { PageShell } from '../../layout/PageShell';
import { EditableCodeTable } from './EditableCodeTable';
import { airlineRepo } from '../../data/masterDataService';
import { airportRepo, currencyRepo } from '../../data/masterDataService';
import { AirlineCode } from '../../domain/masterData';

const breadcrumbs = ['Freight', 'Initial Setup', 'Airline Codes'];
const emptyDraft = (): Omit<AirlineCode, 'id' | 'createdAt' | 'updatedAt'> => ({
  code: '', name: '', flightName: '', standardAwb: 'Y', airlineCass: '', address: '', attention: '', phoneNo: '', faxNo: '', email: '', website: '', gsaName: '', gsaIataCode: '', uaiCode: '', aisCharges: 0, awbFee: 0, exchangeRate: 0, printSecuritySurcharge: '', printFuelSurcharge: '', printScanningCharges: '', printCaaCharges: '', commissionPercent: 0, whtPercent: 0, logoName: '', airportOfDeparture: '', effectiveFrom: '', chargesCurrency: '',
  dueCarrierCharges: ['Security Charges', 'Fuel Charges', 'Scanning Charges', 'C.A.A Charges', 'AWC Charges'].map((label, index) => ({ id: String(index), label, rate: 0, cwGw: 'CW', fixAmount: 0, ppCc: 'BOTH' })),
});

export function AirlineCodesPage() {
  const [version, setVersion] = useState(0);
  const [isNew, setIsNew] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const airports = airportRepo.list();
  const currencies = currencyRepo.list();

  const save = () => {
    if (!draft.code.trim()) return;
    const now = new Date().toISOString();
    airlineRepo.save({ ...draft, code: draft.code.trim(), name: draft.name.trim(), id: uuid(), createdAt: now, updatedAt: now });
    setVersion((value) => value + 1);
    setIsNew(false);
  };

  if (isNew) {
    return (
      <PageShell breadcrumbs={breadcrumbs} title="Airline code entry" actions={<Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => setIsNew(false)}>Back to Airline Codes</Button>}>
        <Typography variant="overline" color="primary.main" sx={{ fontWeight: 700 }}>AIR EXPORT · INITIAL SETUP</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Add the airline identification and AWB configuration.</Typography>
        <Paper variant="outlined" sx={{ maxWidth: 1280, p: 2.5 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1.45fr' }, gap: 2.5 }}>
          <Box sx={{ display: 'grid', gap: 1.5 }}>
            <TextField label="Code" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required fullWidth />
            <TextField label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} fullWidth />
            <TextField label="Address" value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} multiline minRows={2} fullWidth />
            <TextField label="Flight Name" value={draft.flightName} onChange={(e) => setDraft({ ...draft, flightName: e.target.value })} fullWidth />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}><TextField label="Attention" value={draft.attention} onChange={(e) => setDraft({ ...draft, attention: e.target.value })} /><TextField label="Phone No." value={draft.phoneNo} onChange={(e) => setDraft({ ...draft, phoneNo: e.target.value })} /><TextField label="Fax No." value={draft.faxNo} onChange={(e) => setDraft({ ...draft, faxNo: e.target.value })} /><TextField label="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /><TextField label="Website" value={draft.website} onChange={(e) => setDraft({ ...draft, website: e.target.value })} /><TextField label="GSA Name" value={draft.gsaName} onChange={(e) => setDraft({ ...draft, gsaName: e.target.value })} /><TextField label="GSA IATA Code" value={draft.gsaIataCode} onChange={(e) => setDraft({ ...draft, gsaIataCode: e.target.value })} /><TextField label="UAI Code" value={draft.uaiCode} onChange={(e) => setDraft({ ...draft, uaiCode: e.target.value })} /></Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5 }}><TextField label="AIS Charges" type="number" value={draft.aisCharges} onChange={(e) => setDraft({ ...draft, aisCharges: Number(e.target.value) })} /><TextField label="AWB Fee" type="number" value={draft.awbFee} onChange={(e) => setDraft({ ...draft, awbFee: Number(e.target.value) })} /><TextField label="Exchange Rate" type="number" value={draft.exchangeRate} onChange={(e) => setDraft({ ...draft, exchangeRate: Number(e.target.value) })} /></Box>
            <TextField select label="Standard AWB" value={draft.standardAwb} onChange={(e) => setDraft({ ...draft, standardAwb: e.target.value as 'Y' | 'N' })} fullWidth><MenuItem value="Y">Y</MenuItem><MenuItem value="N">N</MenuItem></TextField>
            <TextField select label="Airline CASS Y/N" value={draft.airlineCass} onChange={(e) => setDraft({ ...draft, airlineCass: e.target.value as 'Y' | 'N' | '' })} fullWidth><MenuItem value="">Not set</MenuItem><MenuItem value="Y">Y</MenuItem><MenuItem value="N">N</MenuItem></TextField>
          </Box>
          <Box><Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Airport / Due Carrier Charges</Typography><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1.5, mb: 2 }}><TextField select label="Airport of Departure" value={draft.airportOfDeparture} onChange={(e) => setDraft({ ...draft, airportOfDeparture: e.target.value })}>{airports.map((airport) => <MenuItem key={airport.code} value={airport.code}>{airport.code} — {airport.name}</MenuItem>)}</TextField><TextField label="With Effect From" type="date" InputLabelProps={{ shrink: true }} value={draft.effectiveFrom} onChange={(e) => setDraft({ ...draft, effectiveFrom: e.target.value })} /><TextField select label="Charges Currency" value={draft.chargesCurrency} onChange={(e) => setDraft({ ...draft, chargesCurrency: e.target.value })}>{currencies.map((currency) => <MenuItem key={currency.code} value={currency.code}>{currency.code}</MenuItem>)}</TextField></Box>{draft.dueCarrierCharges?.map((charge, index) => <Box key={charge.id} sx={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr .8fr 1fr 1fr', gap: 1, mb: 1 }}><TextField size="small" value={charge.label} disabled /><TextField size="small" label="Rate" type="number" value={charge.rate} onChange={(e) => setDraft({ ...draft, dueCarrierCharges: draft.dueCarrierCharges?.map((row, rowIndex) => rowIndex === index ? { ...row, rate: Number(e.target.value) } : row) })} /><TextField size="small" select label="CW/GW" value={charge.cwGw} onChange={(e) => setDraft({ ...draft, dueCarrierCharges: draft.dueCarrierCharges?.map((row, rowIndex) => rowIndex === index ? { ...row, cwGw: e.target.value as 'CW' | 'GW' } : row) })}><MenuItem value="CW">CW</MenuItem><MenuItem value="GW">GW</MenuItem></TextField><TextField size="small" label="Fix Amount" type="number" value={charge.fixAmount} onChange={(e) => setDraft({ ...draft, dueCarrierCharges: draft.dueCarrierCharges?.map((row, rowIndex) => rowIndex === index ? { ...row, fixAmount: Number(e.target.value) } : row) })} /><TextField size="small" select label="PP/CC" value={charge.ppCc} onChange={(e) => setDraft({ ...draft, dueCarrierCharges: draft.dueCarrierCharges?.map((row, rowIndex) => rowIndex === index ? { ...row, ppCc: e.target.value as 'PP' | 'CC' | 'BOTH' } : row) })}><MenuItem value="BOTH">Both</MenuItem><MenuItem value="PP">PP</MenuItem><MenuItem value="CC">CC</MenuItem></TextField></Box>)}</Box>
          </Box>
          <Box sx={{ mt: 2.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 1.5 }}><Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Text for Charges on Airway Bill Printing</Typography><Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}><TextField size="small" label="Security Surcharge" value={draft.printSecuritySurcharge} onChange={(e) => setDraft({ ...draft, printSecuritySurcharge: e.target.value })} /><TextField size="small" label="Fuel Surcharge" value={draft.printFuelSurcharge} onChange={(e) => setDraft({ ...draft, printFuelSurcharge: e.target.value })} /><TextField size="small" label="Scanning Charges" value={draft.printScanningCharges} onChange={(e) => setDraft({ ...draft, printScanningCharges: e.target.value })} /><TextField size="small" label="CAA Charges" value={draft.printCaaCharges} onChange={(e) => setDraft({ ...draft, printCaaCharges: e.target.value })} /><TextField size="small" label="Commission %" type="number" value={draft.commissionPercent} onChange={(e) => setDraft({ ...draft, commissionPercent: Number(e.target.value) })} /><TextField size="small" label="WHT %" type="number" value={draft.whtPercent} onChange={(e) => setDraft({ ...draft, whtPercent: Number(e.target.value) })} /></Box></Paper>
            <Paper variant="outlined" sx={{ p: 1.5 }}><Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Airline Logo</Typography><Button component="label" variant="outlined">Choose File<input hidden type="file" accept="image/*" onChange={(e) => setDraft({ ...draft, logoName: e.target.files?.[0]?.name ?? '' })} /></Button><Typography variant="caption" display="block" sx={{ mt: 1 }}>{draft.logoName || 'No image selected'}</Typography></Paper>
          </Box>
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}><Button variant="contained" onClick={save}>Save</Button><Button onClick={() => setIsNew(false)}>Cancel</Button></Stack>
        </Paper>
      </PageShell>
    );
  }

  return (
    <PageShell breadcrumbs={breadcrumbs} title="Airline Codes" actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setDraft(emptyDraft()); setIsNew(true); }}>New</Button>}>
      <EditableCodeTable
        title="Airline Codes"
        fields={[
          { key: 'code', label: 'Code' }, { key: 'name', label: 'Name' }, { key: 'flightName', label: 'Flight Name' },
          { key: 'standardAwb', label: 'Standard AWB', type: 'select', options: [{ value: 'Y', label: 'Y' }, { value: 'N', label: 'N' }] },
          { key: 'airlineCass', label: 'Airline CASS Y/N', type: 'select', options: [{ value: 'Y', label: 'Y' }, { value: 'N', label: 'N' }] },
        ]}
        repo={airlineRepo}
        emptyItem={{ code: '', name: '', flightName: '', standardAwb: 'Y', airlineCass: '' }}
        version={version}
        onChange={() => setVersion((value) => value + 1)}
        showAddButton={false}
      />
    </PageShell>
  );
}

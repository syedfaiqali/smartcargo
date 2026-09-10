import { useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import { PageShell } from '../../layout/PageShell';
import { FormRow, FormField, SectionHeader } from '../../components/FormGrid';
import { airlineRepo, ownerRepo } from '../../data/masterDataService';
import { getStockSummary } from '../../data/awbStockService';

export function LetterOfIssuancePage() {
  const airlines = airlineRepo.list();
  const owners = ownerRepo.list();

  const [airlineCode, setAirlineCode] = useState('');
  const [airlineName, setAirlineName] = useState('');
  const [address, setAddress] = useState(['', '', '']);
  const [attentionPerson, setAttentionPerson] = useState('');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().slice(0, 10));
  const [noOfAwbs, setNoOfAwbs] = useState(0);
  const [bearerOfLetter, setBearerOfLetter] = useState('');
  const [cnic, setCnic] = useState('');
  const [signatoryCode, setSignatoryCode] = useState('');
  const [ownerCode, setOwnerCode] = useState('');
  const [printOn, setPrintOn] = useState<'LETTER_PAD' | 'PLAIN_PAGE'>('PLAIN_PAGE');
  const [message, setMessage] = useState<string | null>(null);

  const setAirline = (code: string) => {
    const a = airlines.find((x) => x.code === code);
    setAirlineCode(code);
    setAirlineName(a?.name ?? '');
    if (code) {
      const summary = getStockSummary(code);
      setNoOfAwbs(summary.unused);
    } else {
      setNoOfAwbs(0);
    }
  };

  // Signatory Code / Owner Code enable once an Airline is selected — docs 11.2 notes these
  // appear disabled in the reference screenshot with the enabling condition unclear; this
  // implementation assumes Airline Code selection is what enables them.
  const detailsEnabled = !!airlineCode;

  const handleExport = (format: 'PDF' | 'Excel') => {
    setMessage(`${format} export is not wired up in this milestone — would export the Letter of Issuance of Stock addressed to ${airlineName || '(no airline selected)'}.`);
  };

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Letter of Issuance of Stock']} title="Letter of Issuance of Stock">
      <Alert severity="info" sx={{ mb: 2 }}>
        This is a single-screen report generator, not a transaction — no SEARCH/NEW/EDIT toolbar or saved records, per
        docs Section 11.
      </Alert>

      <Paper variant="outlined" sx={{ p: 2, maxWidth: 640 }}>
        <FormRow>
          <FormField md={12}>
            <TextField select label="Airline Code" fullWidth value={airlineCode} onChange={(e) => setAirline(e.target.value)}>
              <MenuItem value="">(select)</MenuItem>
              {airlines.map((a) => (
                <MenuItem key={a.code} value={a.code}>
                  {a.code} — {a.name}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
        </FormRow>

        <SectionHeader>Addressee</SectionHeader>
        <FormRow>
          <FormField md={12}>
            <TextField label="Recipient" fullWidth value="THE CARGO MANAGER" disabled />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={12}>
            <TextField label="Airline Name" fullWidth value={airlineName} onChange={(e) => setAirlineName(e.target.value)} />
          </FormField>
        </FormRow>
        {address.map((line, i) => (
          <FormRow key={i}>
            <FormField md={12}>
              <TextField
                label={`Address line ${i + 1}`}
                fullWidth
                value={line}
                onChange={(e) => {
                  const next = [...address];
                  next[i] = e.target.value;
                  setAddress(next);
                }}
              />
            </FormField>
          </FormRow>
        ))}
        <FormRow>
          <FormField md={12}>
            <TextField label="Attention Person" fullWidth value={attentionPerson} onChange={(e) => setAttentionPerson(e.target.value)} />
          </FormField>
        </FormRow>

        <SectionHeader>Letter Details</SectionHeader>
        <FormRow>
          <FormField md={6}>
            <TextField
              label="Letter Date"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={letterDate}
              onChange={(e) => setLetterDate(e.target.value)}
            />
          </FormField>
          <FormField md={6}>
            <TextField label="No. Of AWBs" type="number" fullWidth value={noOfAwbs} onChange={(e) => setNoOfAwbs(Number(e.target.value))} helperText={airlineCode ? 'Defaulted from Un-Used AWB Stock count' : ''} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={6}>
            <TextField label="Bearer Of Letter" fullWidth value={bearerOfLetter} onChange={(e) => setBearerOfLetter(e.target.value)} />
          </FormField>
          <FormField md={6}>
            <TextField label="CNIC" fullWidth value={cnic} onChange={(e) => setCnic(e.target.value)} />
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={6}>
            <TextField
              select
              label="Signatory Code"
              fullWidth
              value={signatoryCode}
              disabled={!detailsEnabled}
              onChange={(e) => setSignatoryCode(e.target.value)}
              helperText={!detailsEnabled ? 'Select an Airline Code first' : ''}
            >
              <MenuItem value="">(none)</MenuItem>
            </TextField>
          </FormField>
          <FormField md={6}>
            <TextField
              select
              label="Owner Code"
              fullWidth
              value={ownerCode}
              disabled={!detailsEnabled}
              onChange={(e) => setOwnerCode(e.target.value)}
              helperText={!detailsEnabled ? 'Select an Airline Code first' : ''}
            >
              {owners.map((o) => (
                <MenuItem key={o.code} value={o.code}>
                  {o.code} — {o.name}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
        </FormRow>
        <FormRow>
          <FormField md={6}>
            <TextField select label="Print On" fullWidth value={printOn} onChange={(e) => setPrintOn(e.target.value as 'LETTER_PAD' | 'PLAIN_PAGE')}>
              <MenuItem value="LETTER_PAD">Letter Pad</MenuItem>
              <MenuItem value="PLAIN_PAGE">Plain Page</MenuItem>
            </TextField>
          </FormField>
        </FormRow>

        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={() => handleExport('PDF')}>
            PDF
          </Button>
          <Button variant="outlined" startIcon={<GridOnIcon />} onClick={() => handleExport('Excel')}>
            Excel
          </Button>
        </Stack>
      </Paper>

      {message && (
        <Alert severity="success" sx={{ mt: 2, maxWidth: 640 }} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      <Alert severity="warning" sx={{ mt: 2, maxWidth: 640 }}>
        Open question per docs 11.2: this implementation assumes selecting an Airline Code enables Signatory Code and
        Owner Code, and that No. Of AWBs defaults from the Un-Used AWB Stock count for that airline — confirm both
        with the business owner before build.
      </Alert>
    </PageShell>
  );
}

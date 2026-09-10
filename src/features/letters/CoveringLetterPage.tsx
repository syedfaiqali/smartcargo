import { useState } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { PageShell } from '../../layout/PageShell';
import { FormRow, FormField } from '../../components/FormGrid';

const BRANCHES = ['KHI', 'LHE', 'ISB'];

type LetterType = 'CHEQUES_TO_AIRLINE' | 'SALES_REPORT_COVERING';

export function CoveringLetterPage() {
  const [branch, setBranch] = useState('KHI');
  const [letterType, setLetterType] = useState<LetterType>('SALES_REPORT_COVERING');
  const [message, setMessage] = useState<string | null>(null);

  const handleGenerate = () => {
    setMessage(
      `PDF generation is not wired up in this milestone — would export the "${
        letterType === 'CHEQUES_TO_AIRLINE' ? 'Letter For Sales Report Cheques To Airline' : 'Sales Report Covering Letter'
      }" for branch ${branch}.`
    );
  };

  return (
    <PageShell breadcrumbs={['Freight', 'Transactions Menu (Air Export)', 'Letter for Sales Report/Covering Letter']} title="Letter for Sales Report/Covering Letter">
      <Alert severity="info" sx={{ mb: 2 }}>
        This is a single-screen report generator, not a transaction — no SEARCH/NEW/EDIT toolbar or saved records, per
        docs Section 10.
      </Alert>

      <Paper variant="outlined" sx={{ p: 2, maxWidth: 520 }}>
        <FormRow>
          <FormField md={12}>
            <TextField select label="Branch" fullWidth value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCHES.map((b) => (
                <MenuItem key={b} value={b}>
                  {b}
                </MenuItem>
              ))}
            </TextField>
          </FormField>
        </FormRow>

        <RadioGroup value={letterType} onChange={(e) => setLetterType(e.target.value as LetterType)} sx={{ mb: 2 }}>
          <FormControlLabel value="CHEQUES_TO_AIRLINE" control={<Radio />} label="Letter For Sales Report Cheques To Airline" />
          <FormControlLabel value="SALES_REPORT_COVERING" control={<Radio />} label="Sales Report Covering Letter" />
        </RadioGroup>

        <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={handleGenerate}>
          PDF
        </Button>
      </Paper>

      {message && (
        <Alert severity="success" sx={{ mt: 2, maxWidth: 520 }} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      <Alert severity="warning" sx={{ mt: 2, maxWidth: 520 }}>
        Open question per docs 10.2: the screen does not show which sales report or date range the letter covers —
        confirm the scope/period logic with the business owner before wiring real PDF generation.
      </Alert>
    </PageShell>
  );
}

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { SeaForeignAgentInvoice } from '../../../domain/seaForeignAgentInvoice';
import { SeaVariantConfig } from '../variantConfig';
import { SectionHeader } from '../../../components/FormGrid';

interface PrintingTabProps {
  invoice: SeaForeignAgentInvoice;
  config: SeaVariantConfig;
  editable: boolean;
  onChange: (invoice: SeaForeignAgentInvoice) => void;
}

export function PrintingTab({ invoice, config, editable, onChange }: PrintingTabProps) {
  const p = invoice.printing;
  const setP = (patch: Partial<SeaForeignAgentInvoice['printing']>) => onChange({ ...invoice, printing: { ...p, ...patch } });

  return (
    <Box>
      <SectionHeader>Selection &amp; Output</SectionHeader>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField label="Branch" fullWidth value={invoice.branch} disabled />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label={config.printingDocLabel} fullWidth value={invoice.documentNo} disabled />
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => window.print()}>
            PDF
          </Button>
        </Grid>
      </Grid>

      <SectionHeader>Print Options</SectionHeader>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <FormControl>
            <FormLabel>Print On</FormLabel>
            <RadioGroup value={p.printOn} onChange={(e) => setP({ printOn: e.target.value as 'LETTER_PAD' | 'PLAIN_PAPER' })}>
              <FormControlLabel value="LETTER_PAD" control={<Radio size="small" />} label="Letter Pad" disabled={!editable} />
              <FormControlLabel value="PLAIN_PAPER" control={<Radio size="small" />} label="Plain Paper" disabled={!editable} />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl>
            <FormLabel>Print In</FormLabel>
            <RadioGroup value={p.printIn} onChange={(e) => setP({ printIn: e.target.value as 'PKR' | 'FOREIGN' })}>
              <FormControlLabel value="PKR" control={<Radio size="small" />} label="PKR Currency" disabled={!editable} />
              <FormControlLabel value="FOREIGN" control={<Radio size="small" />} label="Foreign Currency" disabled={!editable} />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <FormControl>
            <FormLabel>Print Heading As</FormLabel>
            <RadioGroup value={p.printHeadingAs} onChange={(e) => setP({ printHeadingAs: e.target.value as 'INVOICE' | 'DEBIT_NOTE' })}>
              <FormControlLabel value="INVOICE" control={<Radio size="small" />} label="Invoice" disabled={!editable} />
              <FormControlLabel value="DEBIT_NOTE" control={<Radio size="small" />} label="Debit Note" disabled={!editable} />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            select
            label="Print Signatorys"
            fullWidth
            value={p.printSignatorys}
            disabled={!editable}
            onChange={(e) => setP({ printSignatorys: e.target.value as 'Y' | 'N' })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="N">No</MenuItem>
            <MenuItem value="Y">Yes</MenuItem>
          </TextField>
          <TextField
            select
            label="Print"
            fullWidth
            value={p.printCopyType}
            disabled={!editable}
            onChange={(e) => setP({ printCopyType: e.target.value as SeaForeignAgentInvoice['printing']['printCopyType'] })}
          >
            <MenuItem value="ORIGINAL">Original</MenuItem>
            <MenuItem value="REVISED">Revised</MenuItem>
            <MenuItem value="DUPLICATE">Duplicate</MenuItem>
            <MenuItem value="OFFICE_COPY">Office Copy</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 2 }}>
        Print output rendering is not wired up in this milestone — options here are captured and persisted with the
        record, ready to feed a real print/PDF pipeline.
      </Alert>
    </Box>
  );
}

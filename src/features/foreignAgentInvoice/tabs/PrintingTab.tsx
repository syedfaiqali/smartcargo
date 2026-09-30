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
import { ForeignAgentInvoice } from '../../../domain/foreignAgentInvoice';
import { VariantConfig } from '../variantConfig';
import { SectionHeader } from '../../../components/FormGrid';
import { printForeignAgentInvoice } from '../foreignAgentInvoiceReport';

interface PrintingTabProps {
  invoice: ForeignAgentInvoice;
  config: VariantConfig;
  editable: boolean;
  onChange: (invoice: ForeignAgentInvoice) => void;
}

export function PrintingTab({ invoice, config, editable, onChange }: PrintingTabProps) {
  const p = invoice.printing;
  const setP = (patch: Partial<ForeignAgentInvoice['printing']>) => onChange({ ...invoice, printing: { ...p, ...patch } });

  return (
    <Box>
      <SectionHeader>6.10.1 Selection &amp; Output</SectionHeader>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField label="Branch" fullWidth value={invoice.branch} disabled />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label={config.printingDocLabel} fullWidth value={invoice.documentNo} disabled />
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => printForeignAgentInvoice(invoice, config)}>
          {/* <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={() => printForeignAgentInvoice(invoice)}> */}
            PDF
          </Button>
        </Grid>
      </Grid>

      <SectionHeader>6.10.2 Print Options</SectionHeader>
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
          <FormControl>
            <FormLabel>Print</FormLabel>
            <RadioGroup value={p.printCopyType} onChange={(e) => setP({ printCopyType: e.target.value as ForeignAgentInvoice['printing']['printCopyType'] })}>
              <FormControlLabel value="ORIGINAL" control={<Radio size="small" />} label="Original" />
              <FormControlLabel value="REVISED" control={<Radio size="small" />} label="Revised" />
              <FormControlLabel value="DUPLICATE" control={<Radio size="small" />} label="Duplicate" />
              <FormControlLabel value="OFFICE_COPY" control={<Radio size="small" />} label="Office Copy" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 2 }}>
        Per docs Sections 7.1/9.1, this tab keeps the "{config.printingDocLabel}" label even on Credit Note variants
        — an observed quirk in the reference system, replicated faithfully rather than corrected.
      </Alert>
    </Box>
  );
}

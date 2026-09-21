import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { LocalInvoice } from '../../../domain/localInvoice';
import { SectionCard } from '../../../components/SectionCard';
import { navyTrustColors, navyTrustFontFamily } from '../../../theme/navyTrustTheme';

interface PrintingTabProps {
  invoice: LocalInvoice;
  editable: boolean;
  onChange: (invoice: LocalInvoice) => void;
}

const DOCUMENT_TYPES = [
  ['INVOICE', 'Invoice'],
  ['CREDIT_NOTE_DISCOUNTS_ONLY', 'Credit Note For Discounts Only'],
  ['SALES_TAX_INVOICE', 'Sales Tax Invoice'],
  ['PRA_TAX_INVOICE', 'PRA Tax Invoice'],
] as const;

const CONTENT_TOGGLES: { key: keyof LocalInvoice['printing']; label: string }[] = [
  { key: 'printQuotationNo', label: 'Print Quotation No. on Invoice' },
  { key: 'printDueDate', label: 'Print Due Date' },
  { key: 'printConsignee', label: 'Print Consignee' },
  { key: 'printSpoCodeName', label: 'Print SPO Code/Name' },
  { key: 'printExRate', label: 'Print Ex. Rate' },
  { key: 'printReceivedBy', label: 'Print Received By' },
  { key: 'printSignatorys', label: 'Print Signatorys' },
  { key: 'printNtnNo', label: 'Print NTN No.' },
];

export function PrintingTab({ invoice, editable, onChange }: PrintingTabProps) {
  const p = invoice.printing;
  const setP = (patch: Partial<LocalInvoice['printing']>) => onChange({ ...invoice, printing: { ...p, ...patch } });
  const toggle = (key: keyof LocalInvoice['printing']) => setP({ [key]: p[key] === 'Y' ? 'N' : 'Y' } as Partial<LocalInvoice['printing']>);

  return (
    <Box>
      <SectionCard number="5.1" title="Print Target">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="Branch" fullWidth value={invoice.branch} disabled />
          </Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button variant="outlined" startIcon={<PictureAsPdfIcon />} sx={{ fontFamily: navyTrustFontFamily, borderColor: navyTrustColors.border }}>
              PDF
            </Button>
          </Grid>
        </Grid>
      </SectionCard>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <SectionCard number="5.2" title="Document Type">
          <FormControl>
            <RadioGroup value={p.documentType} onChange={(e) => setP({ documentType: e.target.value as LocalInvoice['printing']['documentType'] })}>
              {DOCUMENT_TYPES.map(([value, label]) => (
                <FormControlLabel key={value} value={value} control={<Radio size="small" />} label={label} />
              ))}
            </RadioGroup>
          </FormControl>

          <TextField
            select
            label="Print Invoice Heading as"
            fullWidth
            sx={{ mt: 2 }}
            value={p.printHeadingAs}
            disabled={!editable}
            onChange={(e) => setP({ printHeadingAs: e.target.value as 'INVOICE' | 'SALE_TAX_INVOICE' })}
          >
            <MenuItem value="INVOICE">Invoice</MenuItem>
            <MenuItem value="SALE_TAX_INVOICE">Sale Tax Invoice</MenuItem>
          </TextField>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionCard number="5.3" title="Batch &amp; Layout Options">
          <Grid container spacing={1.5}>
            <Grid item xs={6}>
              <TextField
                label="Starting Invoice No."
                fullWidth
                value={p.startingInvoiceNo}
                disabled={!editable}
                onChange={(e) => setP({ startingInvoiceNo: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Ending Invoice No."
                fullWidth
                value={p.endingInvoiceNo}
                disabled={!editable}
                onChange={(e) => setP({ endingInvoiceNo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField select label="Print On" fullWidth value={p.printOn} disabled={!editable} onChange={(e) => setP({ printOn: e.target.value as 'LETTER_PAD' | 'PLAIN_PAPER' })}>
                <MenuItem value="LETTER_PAD">Letter Pad</MenuItem>
                <MenuItem value="PLAIN_PAPER">Plain Paper</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField select label="Print In" fullWidth value={p.printIn} disabled={!editable} onChange={(e) => setP({ printIn: e.target.value as 'PKR' | 'FOREIGN' })}>
                <MenuItem value="PKR">PKR Currency</MenuItem>
                <MenuItem value="FOREIGN">Foreign Currency</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Print (copy type)"
                fullWidth
                value={p.printCopyType}
                disabled={!editable}
                onChange={(e) => setP({ printCopyType: e.target.value as LocalInvoice['printing']['printCopyType'] })}
              >
                <MenuItem value="ORIGINAL">Original</MenuItem>
                <MenuItem value="REVISED">Revised</MenuItem>
                <MenuItem value="DUPLICATE">Duplicate</MenuItem>
                <MenuItem value="OFFICE_COPY">Office Copy</MenuItem>
                <MenuItem value="ADDITIONAL">Additional</MenuItem>
                <MenuItem value="CORRECTED">Corrected</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionCard number="5.4" title="Content Toggles">
          <Grid container spacing={0.5}>
            {CONTENT_TOGGLES.map(({ key, label }) => (
              <Grid item xs={12} key={key}>
                <FormControlLabel
                  control={<Checkbox size="small" checked={p[key] === 'Y'} disabled={!editable} onChange={() => toggle(key)} />}
                  label={<Typography variant="body2">{label}</Typography>}
                />
              </Grid>
            ))}
          </Grid>
          </SectionCard>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 2 }}>
        Print output rendering is not wired up in this milestone — options here are captured and persisted with the
        invoice, ready to feed a real print/PDF pipeline. Per docs Section 4.8, there may be additional options below
        "Print NTN No." not yet captured (reference screenshot was scrolled to top).
      </Alert>
    </Box>
  );
}

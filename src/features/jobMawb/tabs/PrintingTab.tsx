import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
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
import GridOnIcon from '@mui/icons-material/GridOn';
import { Job } from '../../../domain/job';
import { SectionHeader } from '../../../components/FormGrid';

interface PrintingTabProps {
  job: Job;
  editable: boolean;
  onChange: (job: Job) => void;
}

const DOCUMENT_TYPES = [
  ['AIR_WAYBILL', 'Air Waybill'],
  ['UNDER_TAKING_LETTER', 'Under Taking Letter'],
  ['CARGO_MANIFEST', 'Cargo Manifest'],
  ['LABEL_PRINTING', 'Label Printing'],
  ['EXTRA_SHEET_PRINTING', 'Extra Sheet Printing'],
  ['SHIPMENT_PRE_ALERT', 'Shipment Pre-Alert'],
  ['OUTER', 'Outer'],
  ['SECURITY_CERTIFICATE', 'Security Certificate'],
  ['AWB_BACK_SIDE', 'AirwayBill - Back Side'],
  ['MAWB_ACCEPTANCE_STATEMENT', 'Master Air Waybill Acceptance Statement (US-Bound)'],
] as const;

const YES_NO_TOGGLES: { key: keyof Job['printing']; label: string }[] = [
  { key: 'printAwbNo', label: 'Print Air Waybill No.' },
  { key: 'printAsAgreed', label: 'Print "As Agreed"' },
  { key: 'printChargeableCode', label: 'Print Chargeable Code' },
  { key: 'printPartyNameAtBottom', label: 'Print Party Name at Bottom' },
  { key: 'printAgentPartyNameAtBottom', label: 'Print Agent Party Name at Bottom' },
  { key: 'printWeight', label: 'Print Weight' },
  { key: 'printCompanyName', label: "Print Company's Name" },
  { key: 'printExRate', label: 'Print Ex.Rate' },
  { key: 'printStamp', label: 'Print Stamp' },
  { key: 'printConsigneeNameAddress', label: 'Print Consignee Name/Address' },
  { key: 'printShipperNameAddress', label: "Print Shipper's Name/Address" },
  { key: 'printAirlineAddress', label: 'Print Airline Address' },
  { key: 'printMemberOfIata', label: 'Print "MEMBER OF IATA"' },
  { key: 'printBarCode', label: 'Print Bar Code' },
];

export function PrintingTab({ job, editable, onChange }: PrintingTabProps) {
  const p = job.printing;
  const setP = (patch: Partial<Job['printing']>) => onChange({ ...job, printing: { ...p, ...patch } });
  const toggle = (key: keyof Job['printing']) => setP({ [key]: p[key] === 'Y' ? 'N' : 'Y' } as Partial<Job['printing']>);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 1 }}>
        <Grid item xs={12} md={6}>
          <TextField label="Branch" fullWidth value={job.branch} disabled />
        </Grid>
        <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button variant="outlined" startIcon={<PictureAsPdfIcon />}>
            PDF
          </Button>
          <Button variant="outlined" startIcon={<GridOnIcon />}>
            Excel
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <SectionHeader>Document Type</SectionHeader>
          <FormControl>
            <RadioGroup value={p.documentType} onChange={(e) => setP({ documentType: e.target.value })}>
              {DOCUMENT_TYPES.map(([value, label]) => (
                <FormControlLabel key={value} value={value} control={<Radio size="small" />} label={label} />
              ))}
            </RadioGroup>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={5}>
          <SectionHeader>Air Waybill Print Options</SectionHeader>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <TextField
                select
                label="Print Air Waybill In"
                fullWidth
                value={p.printCurrency}
                disabled={!editable}
                onChange={(e) => setP({ printCurrency: e.target.value as 'LOCAL' | 'FOREIGN' })}
              >
                <MenuItem value="LOCAL">Local Currency</MenuItem>
                <MenuItem value="FOREIGN">Foreign Currency</MenuItem>
              </TextField>
            </Grid>
            {YES_NO_TOGGLES.map(({ key, label }) => (
              <Grid item xs={6} key={key}>
                <FormControlLabel
                  control={<Checkbox size="small" checked={p[key] === 'Y'} disabled={!editable} onChange={() => toggle(key)} />}
                  label={<Typography variant="body2">{label}</Typography>}
                />
              </Grid>
            ))}
            <Grid item xs={12}>
              <TextField
                select
                label="Print (rate basis)"
                fullWidth
                value={p.printRateBasis}
                disabled={!editable}
                onChange={(e) => setP({ printRateBasis: e.target.value as Job['printing']['printRateBasis'] })}
              >
                <MenuItem value="RATE_KG">Rate/Kg</MenuItem>
                <MenuItem value="RATE_KG_AMOUNT">Rate/Kg + Amount</MenuItem>
                <MenuItem value="AMOUNT">Amount</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Print In Issuing Carrier Box"
                fullWidth
                value={p.printIssuingCarrierBox}
                disabled={!editable}
                onChange={(e) => setP({ printIssuingCarrierBox: e.target.value as Job['printing']['printIssuingCarrierBox'] })}
              >
                <MenuItem value="ISSUING_CARRIER">Issuing Carrier</MenuItem>
                <MenuItem value="NOTIFY">Notify</MenuItem>
                <MenuItem value="NOTHING">Print Nothing</MenuItem>
                <MenuItem value="DELIVERY_AGENT">Delivery Agent</MenuItem>
                <MenuItem value="GSA_NAME">GSA Name</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Print (charge type)" fullWidth value={p.printChargeType} disabled={!editable} onChange={(e) => setP({ printChargeType: e.target.value as 'PP' | 'PX' })}>
                <MenuItem value="PP">PP</MenuItem>
                <MenuItem value="PX">PX</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField select label="Print on" fullWidth value={p.printOn} disabled={!editable} onChange={(e) => setP({ printOn: e.target.value as 'PLAIN_PAPER' | 'PRE_PRINTED_AWB' })}>
                <MenuItem value="PLAIN_PAPER">Plain Paper</MenuItem>
                <MenuItem value="PRE_PRINTED_AWB">Pre-Printed AWB</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Signature Line"
                fullWidth
                value={p.signatureLine}
                disabled={!editable}
                onChange={(e) => setP({ signatureLine: e.target.value })}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={3}>
          <SectionHeader>Copy Selection</SectionHeader>
          <Paper variant="outlined" sx={{ p: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={Object.values(p.copies).every(Boolean)}
                  indeterminate={Object.values(p.copies).some(Boolean) && !Object.values(p.copies).every(Boolean)}
                  onChange={(e) => {
                    const copies = Object.fromEntries(Object.keys(p.copies).map((k) => [k, e.target.checked]));
                    setP({ copies });
                  }}
                />
              }
              label={<Typography variant="body2" sx={{ fontWeight: 700 }}>Tick/UnTick All</Typography>}
            />
            {Object.entries(p.copies).map(([label, checked]) => (
              <FormControlLabel
                key={label}
                sx={{ display: 'block' }}
                control={
                  <Checkbox
                    size="small"
                    checked={checked}
                    disabled={!editable}
                    onChange={(e) => setP({ copies: { ...p.copies, [label]: e.target.checked } })}
                  />
                }
                label={<Typography variant="body2">{label}</Typography>}
              />
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 2 }}>
        Print output rendering is not wired up in this milestone — options here are captured and persisted with the
        Job record, ready to feed a real print/PDF pipeline.
      </Alert>
    </Box>
  );
}

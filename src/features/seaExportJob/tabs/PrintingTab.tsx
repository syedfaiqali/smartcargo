import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import { SeaExportJob } from '../../../domain/seaExportJob';
import { SectionHeader } from '../../../components/FormGrid';

interface PrintingTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

const DOCUMENT_GROUPS: { label: string; options: [string, string][] }[] = [
  {
    label: 'Job Documents',
    options: [
      ['SHIPMENT_STATUS_REPORT', 'Shipment Status Report'],
      ['HBL_PRINTING', 'HBL Printing'],
      ['CARGO_MANIFEST', 'Cargo Manifest'],
      ['EXTRA_SHEET', 'Extra Sheet'],
      ['RELEASE_INSTRUCTIONS', 'Release Instructions'],
      ['SHIPMENT_PRE_ALERT_JOB', 'Shipment Pre-Alert (Job)'],
      ['STUFFING_DETAIL_SINGLE', 'Stuffing Detail (Single Job)'],
      ['INSTRUCTION_LETTER', 'Instruction Letter'],
      ['MASTER_BL_SPECIMEN', 'Master B/L Specimen'],
      ['OUTER', 'Outer'],
    ],
  },
  {
    label: 'Customs / Forwarder',
    options: [
      ['LETTER_CUSTOM_CLEARING', 'Letter of Instruction For Custom Clearing'],
      ['FORWARDERS_CARGO_RECEIPT', "Forwarder's Cargo Receipt"],
      ['SURRENDERING_LETTER', 'Surrendering Letter'],
    ],
  },
  {
    label: 'B/L & Costing',
    options: [
      ['BL_BACK_SIDE', 'B/L Back Side Printing'],
      ['JOB_CHARGES_SHEET', 'Job Charges Sheet'],
      ['FMC_RATE_FILING_SHEET', 'FMC Rate Filing Sheet'],
    ],
  },
  {
    label: 'Consolidation',
    options: [
      ['STUFFING_PLAN_CONSOL', 'Stuffing Plan (Consol)'],
      ['SHIPMENT_PRE_ALERT_CONSOL', 'Shipment Pre Alert (Consol)'],
      ['RELEASE_INSTRUCTION_CONSOL', 'Release Instruction (Consol)'],
    ],
  },
];

export function PrintingTab({ job, editable, onChange }: PrintingTabProps) {
  const p = job.printing;
  const setP = (patch: Partial<SeaExportJob['printing']>) => onChange({ ...job, printing: { ...p, ...patch } });

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <TextField label="Branch" fullWidth value={job.branch} disabled />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField label="Job No." fullWidth value={job.jobNo} disabled />
        </Grid>
        <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<PictureAsPdfIcon />}>
              PDF
            </Button>
            <Button variant="outlined" startIcon={<GridOnIcon />}>
              Excel
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {DOCUMENT_GROUPS.map((group) => (
          <Grid item xs={12} md={3} key={group.label}>
            <SectionHeader>{group.label}</SectionHeader>
            <FormControl>
              <RadioGroup value={p.documentType} onChange={(e) => setP({ documentType: e.target.value })}>
                {group.options.map(([value, label]) => (
                  <FormControlLabel key={value} value={value} control={<Radio size="small" />} label={label} disabled={!editable} />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>
        ))}
      </Grid>

      {p.documentType === 'SHIPMENT_STATUS_REPORT' && (
        <>
          <SectionHeader>Shipment Status Report Options</SectionHeader>
          <Grid container spacing={2} sx={{ maxWidth: 700 }}>
            <Grid item xs={12} md={4}>
              <TextField select label="Print On" fullWidth value={p.printOn} disabled={!editable} onChange={(e) => setP({ printOn: e.target.value as 'LETTER_PAD' | 'PLAIN_PAPER' })}>
                <MenuItem value="LETTER_PAD">Letter Pad</MenuItem>
                <MenuItem value="PLAIN_PAPER">Plain Paper</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Today's Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={p.todaysDate}
                disabled={!editable}
                onChange={(e) => setP({ todaysDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Attention" fullWidth value={p.attention} disabled={!editable} onChange={(e) => setP({ attention: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Note" fullWidth multiline minRows={2} value={p.note} disabled={!editable} onChange={(e) => setP({ note: e.target.value })} />
            </Grid>
          </Grid>
        </>
      )}

      <Alert severity="info" sx={{ mt: 2 }}>
        Print output rendering is not wired up in this milestone — the selected document type and options are
        captured and persisted with the job, ready to feed a real print/PDF/Excel pipeline.
      </Alert>
    </Box>
  );
}

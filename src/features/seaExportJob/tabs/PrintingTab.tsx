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
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useState } from 'react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import { jsPDF } from 'jspdf';
import { signatoryRepo } from '../../../data/masterDataService';
import { SeaExportJob } from '../../../domain/seaExportJob';
import { SectionHeader } from '../../../components/FormGrid';
import { createShipmentStatusExcel, createShipmentStatusPdf } from '../shipmentStatusReport';
import { createHblPrintingExcel, createHblPrintingPdf } from '../hblPrintingReport';
import { createCargoManifestExcel, createCargoManifestPdf } from '../cargoManifestReport';
import {
  createExtraSheetExcel, createExtraSheetPdf, createReleaseInstructionsExcel, createReleaseInstructionsPdf,
  createStuffingDetailExcel, createStuffingDetailPdf,
} from '../additionalPrintingReports';
import { createMasterBlSpecimenExcel, createMasterBlSpecimenPdf, createOuterExcel, createOuterPdf } from '../outerAndMasterBlReports';

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
  const [printError, setPrintError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewDoc, setPreviewDoc] = useState<jsPDF | null>(null);
  const [previewName, setPreviewName] = useState('');
  const h = p.hbl ?? {
    printContainerSize: true, watermark: 'NONE' as const, nonNegotiableText: '',
    copies: { original: false, firstOriginal: true, secondOriginal: true, thirdOriginal: true, nonNegotiable: true, extra: 0 },
    stamp: 'ON_BOARD' as const, printExtraSheet: false, printContainersOnExtraSheet: false,
    printCarrierName: false, paper: 'PLAIN_PAPER' as const, printBelowStamp: true,
    stampText: ["ALL TERMINAL CHARGES, DEMURAGE THC/ETC", 'AT THE PORT OF DISCHARGE / DESTINATION', "AS PER LINE'S TARIFF AND ON ACCOUNT", 'OF CONSIGNEE.'],
    additionalPrintText: '"Shipper Load, Stow and Count"', signatoryCode: '', stampDate: '',
  };
  const stuffing = p.stuffingDetail ?? { printSpoName: true };
  const outer = p.outer ?? { paper: 'PLAIN_PAPER' as const };
  const master = p.masterBlSpecimen ?? { shipperAs: 'COMPANY_NAME' as const, consigneeAs: 'CONSIGNEE_NAME' as const, notifyAs: 'NOTIFY_NAME' as const, paper: 'PLAIN_PAPER' as const };
  const setP = (patch: Partial<SeaExportJob['printing']>) => onChange({ ...job, printing: { ...p, ...patch } });
  const setH = (patch: Partial<typeof h>) => setP({ hbl: { ...h, ...patch } });
  const setStuffing = (printSpoName: boolean) => setP({ stuffingDetail: { ...stuffing, printSpoName } });
  const setOuter = (paper: typeof outer.paper) => setP({ outer: { ...outer, paper } });
  const setMaster = (patch: Partial<typeof master>) => setP({ masterBlSpecimen: { ...master, ...patch } });

  const downloadExcel = () => {
    const isHbl = p.documentType === 'HBL_PRINTING';
    const isManifest = p.documentType === 'CARGO_MANIFEST';
    const isExtra = p.documentType === 'EXTRA_SHEET';
    const isRelease = p.documentType === 'RELEASE_INSTRUCTIONS';
    const isStuffing = p.documentType === 'STUFFING_DETAIL_SINGLE';
    const isOuter = p.documentType === 'OUTER';
    const isMasterBl = p.documentType === 'MASTER_BL_SPECIMEN';
    const filename = `${isManifest ? 'Cargo-Manifest' : isHbl ? 'HBL' : isExtra ? 'Extra-Sheet' : isRelease ? 'Release-Instructions' : isStuffing ? 'Stuffing-Detail' : isOuter ? 'Outer-Sea-Export' : isMasterBl ? 'Master-BL-Specimen' : 'Shipment-Status'}-${job.jobNo || 'Report'}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const bytes = isManifest ? createCargoManifestExcel(job) : isHbl ? createHblPrintingExcel(job) : isExtra ? createExtraSheetExcel(job) : isRelease ? createReleaseInstructionsExcel(job) : isStuffing ? createStuffingDetailExcel(job) : isOuter ? createOuterExcel(job) : isMasterBl ? createMasterBlSpecimenExcel({ ...job, printing: { ...job.printing, masterBlSpecimen: master } }) : createShipmentStatusExcel(job);
    const url = URL.createObjectURL(new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${filename}.xlsx`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const createSelectedPdf = async () => {
    const isHbl = p.documentType === 'HBL_PRINTING';
    const isManifest = p.documentType === 'CARGO_MANIFEST';
    const isExtra = p.documentType === 'EXTRA_SHEET';
    const isRelease = p.documentType === 'RELEASE_INSTRUCTIONS';
    const isStuffing = p.documentType === 'STUFFING_DETAIL_SINGLE';
    const isOuter = p.documentType === 'OUTER';
    const isMasterBl = p.documentType === 'MASTER_BL_SPECIMEN';
    const configuredJob = { ...job, printing: { ...job.printing, hbl: h, outer, masterBlSpecimen: master } };
    const doc = isManifest ? await createCargoManifestPdf(job) : isHbl ? await createHblPrintingPdf(configuredJob) : isExtra ? await createExtraSheetPdf(job) : isRelease ? await createReleaseInstructionsPdf(job) : isStuffing ? await createStuffingDetailPdf(job) : isOuter ? await createOuterPdf(configuredJob) : isMasterBl ? await createMasterBlSpecimenPdf(configuredJob) : await createShipmentStatusPdf(job);
    const name = isManifest ? 'Cargo-Manifest' : isHbl ? 'HBL' : isExtra ? 'Extra-Sheet' : isRelease ? 'Release-Instructions' : isStuffing ? 'Stuffing-Detail' : isOuter ? 'Outer-Sea-Export' : isMasterBl ? 'Master-BL-Specimen' : 'Shipment-Status';
    return { doc, name };
  };

  const previewPdf = async () => {
    setPrintError('');
    try {
      const { doc, name } = await createSelectedPdf();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewName(`${name}-${job.jobNo || 'Report'}.pdf`);
      setPreviewDoc(doc);
      setPreviewUrl(URL.createObjectURL(doc.output('blob')));
    } catch {
      const title = p.documentType === 'CARGO_MANIFEST' ? 'Cargo Manifest' : p.documentType === 'HBL_PRINTING' ? 'HBL' : p.documentType === 'EXTRA_SHEET' ? 'Extra Sheet' : p.documentType === 'RELEASE_INSTRUCTIONS' ? 'Release Instructions' : p.documentType === 'STUFFING_DETAIL_SINGLE' ? 'Stuffing Detail' : p.documentType === 'OUTER' ? 'Outer' : p.documentType === 'MASTER_BL_SPECIMEN' ? 'Master B/L Specimen' : 'Shipment Status';
      setPrintError(`Could not create the ${title} report. Please try again.`);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setPreviewDoc(null);
  };

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
            <Button variant="outlined" startIcon={<PictureAsPdfIcon />} disabled={!['SHIPMENT_STATUS_REPORT', 'HBL_PRINTING', 'CARGO_MANIFEST', 'EXTRA_SHEET', 'RELEASE_INSTRUCTIONS', 'STUFFING_DETAIL_SINGLE', 'OUTER', 'MASTER_BL_SPECIMEN'].includes(p.documentType)} onClick={previewPdf}>
              Preview PDF
            </Button>
            <Button variant="outlined" startIcon={<GridOnIcon />} disabled={!['SHIPMENT_STATUS_REPORT', 'HBL_PRINTING', 'CARGO_MANIFEST', 'EXTRA_SHEET', 'RELEASE_INSTRUCTIONS', 'STUFFING_DETAIL_SINGLE', 'OUTER', 'MASTER_BL_SPECIMEN'].includes(p.documentType)} onClick={downloadExcel}>
              Excel
            </Button>
          </Stack>
        </Grid>
      </Grid>

      <Dialog open={Boolean(previewUrl)} onClose={closePreview} fullWidth maxWidth="xl" PaperProps={{ sx: { height: '92vh' } }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.25 }}>
          {previewName}
          <Button size="small" onClick={closePreview} startIcon={<CloseIcon />}>Close</Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, overflow: 'hidden' }}>
          {previewUrl && <Box component="iframe" title={`${previewName} preview`} src={previewUrl} sx={{ display: 'block', width: '100%', height: '100%', border: 0 }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={closePreview}>Close</Button>
          <Button variant="contained" startIcon={<DownloadIcon />} disabled={!previewDoc} onClick={() => previewDoc?.save(previewName)}>Download PDF</Button>
        </DialogActions>
      </Dialog>

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

      {p.documentType === 'HBL_PRINTING' && <>
        <SectionHeader>HBL Printing Options</SectionHeader>
        <Grid container spacing={1.5} sx={{ maxWidth: 1040 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <FormControlLabel control={<Checkbox size="small" checked={h.printContainerSize} disabled={!editable} onChange={(event) => setH({ printContainerSize: event.target.checked })} />} label="Print Container Size" />
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <TextField select size="small" label="Print as Water Mark" fullWidth value={h.watermark} disabled={!editable} onChange={(event) => setH({ watermark: event.target.value as typeof h.watermark })}>
              {[["DRAFT_COPY", 'Draft Copy'], ['CERTIFIED_TRUE_COPY', 'Certified True Copy'], ['NON_NEGOTIABLE_COPY', 'Non Negotiable Copy'], ['ORIGINAL', 'Original'], ['BL_SURRENDER', 'B/L Surrender'], ['EXPRESS_RELEASED', 'Express Released'], ['TELEX_RELEASED', 'Telex Released'], ['RECEIVED_FOR_SHIPMENT', 'Received for Shipment'], ['NONE', 'None']].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
            </TextField>
          </Grid>
          {h.watermark === 'NON_NEGOTIABLE_COPY' && <Grid item xs={12} md={6}><TextField size="small" fullWidth label="Text With Non Negotiable" value={h.nonNegotiableText} disabled={!editable} onChange={(event) => setH({ nonNegotiableText: event.target.value })} /></Grid>}

          <Grid item xs={12} md={4}>
            <SectionHeader>Print Copies</SectionHeader>
            {([['original', 'Original'], ['firstOriginal', 'First Original'], ['secondOriginal', 'Second Original'], ['thirdOriginal', 'Third Original'], ['nonNegotiable', 'Non-Negotiable']] as const).map(([key, label]) => <FormControlLabel key={key} control={<Checkbox size="small" checked={h.copies[key]} disabled={!editable} onChange={(event) => setH({ copies: { ...h.copies, [key]: event.target.checked } })} />} label={label} sx={{ display: 'flex', m: 0, height: 25 }} />)}
            <TextField size="small" type="number" label="Additional Copies" value={h.copies.extra} disabled={!editable} inputProps={{ min: 0, max: 20 }} onChange={(event) => setH({ copies: { ...h.copies, extra: Math.max(0, Number(event.target.value)) } })} />
          </Grid>
          <Grid item xs={12} md={4}>
            <SectionHeader>Print Stamp</SectionHeader>
            <RadioGroup value={h.stamp} onChange={(event) => setH({ stamp: event.target.value as typeof h.stamp })}>
              {([['ON_BOARD', 'On Board'], ['SHIPPED_ON_BOARD', 'Shipped On Board'], ['CLEAN_ON_BOARD', 'Clean on Board'], ['DO_NOT_PRINT', 'Do Not Print Stamp']] as const).map(([value, label]) => <FormControlLabel key={value} value={value} control={<Radio size="small" />} label={label} disabled={!editable} sx={{ m: 0, height: 26 }} />)}
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={4}>
            <SectionHeader>Stamp Date</SectionHeader>
            <TextField size="small" fullWidth type="date" InputLabelProps={{ shrink: true }} value={h.stampDate} disabled={!editable} onChange={(event) => setH({ stampDate: event.target.value })} />
          </Grid>

          {([['printExtraSheet', 'Print Extra Sheet'], ['printContainersOnExtraSheet', 'Print Containers Detail in Extra Sheet'], ['printCarrierName', 'Print Carrier Name'], ['printBelowStamp', 'Print Below Stamp/Text']] as const).map(([key, label]) => <Grid item xs={12} md={6} key={key}>
            <TextField select size="small" fullWidth label={label} value={h[key] ? 'Y' : 'N'} disabled={!editable} onChange={(event) => setH({ [key]: event.target.value === 'Y' })}>
              <MenuItem value="Y">Yes</MenuItem><MenuItem value="N">No</MenuItem>
            </TextField>
          </Grid>)}
          <Grid item xs={12} md={6}>
            <TextField select size="small" fullWidth label="Print" value={h.paper} disabled={!editable} onChange={(event) => setH({ paper: event.target.value as typeof h.paper })}>
              <MenuItem value="PRE_PRINTED">Pre-Printed</MenuItem><MenuItem value="PLAIN_PAPER">Plain Paper</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField select size="small" fullWidth label="Signatory" value={h.signatoryCode} disabled={!editable} onChange={(event) => setH({ signatoryCode: event.target.value })}>
              <MenuItem value="">Select Signatory Code</MenuItem>{signatoryRepo.list().map((item) => <MenuItem key={item.code} value={item.code}>{item.code} - {item.name}</MenuItem>)}
            </TextField>
          </Grid>
          {h.printBelowStamp && <Grid item xs={12} md={8}>
            <SectionHeader>Stamp / Text</SectionHeader>
            <Grid container spacing={1}>{h.stampText.map((line, index) => <Grid item xs={12} key={index}><TextField size="small" fullWidth value={line} disabled={!editable} onChange={(event) => { const stampText = [...h.stampText]; stampText[index] = event.target.value; setH({ stampText }); }} /></Grid>)}</Grid>
          </Grid>}
          <Grid item xs={12} md={8}><TextField size="small" fullWidth label="Additional Print Text" value={h.additionalPrintText} disabled={!editable} onChange={(event) => setH({ additionalPrintText: event.target.value })} /></Grid>
        </Grid>
      </>}

      {p.documentType === 'EXTRA_SHEET' && <>
        <SectionHeader>Extra Sheet</SectionHeader>
        <Alert severity="info">This report prints the B/L rider fields and cargo description as an attached sheet.</Alert>
      </>}

      {p.documentType === 'RELEASE_INSTRUCTIONS' && <>
        <SectionHeader>Printing Release Instruction</SectionHeader>
        <Grid container spacing={1.5} sx={{ maxWidth: 700 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth><RadioGroup value={p.printOn} onChange={(event) => setP({ printOn: event.target.value as 'LETTER_PAD' | 'PLAIN_PAPER' })}>
              <FormControlLabel value="LETTER_PAD" control={<Radio size="small" />} label="Letter Pad" disabled={!editable} sx={{ m: 0, height: 26 }} />
              <FormControlLabel value="PLAIN_PAPER" control={<Radio size="small" />} label="Plain Paper" disabled={!editable} sx={{ m: 0, height: 26 }} />
            </RadioGroup></FormControl>
          </Grid>
          <Grid item xs={12} md={4}><TextField label="Give Today's Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={p.todaysDate} disabled={!editable} onChange={(event) => setP({ todaysDate: event.target.value })} /></Grid>
          <Grid item xs={12} md={4}><TextField label="Attention" fullWidth value={p.attention} disabled={!editable} onChange={(event) => setP({ attention: event.target.value })} /></Grid>
          <Grid item xs={12}><TextField label="Note" fullWidth multiline minRows={4} value={p.note} disabled={!editable} onChange={(event) => setP({ note: event.target.value })} /></Grid>
        </Grid>
      </>}

      {p.documentType === 'STUFFING_DETAIL_SINGLE' && <>
        <SectionHeader>Stuffing Detail Printing</SectionHeader>
        <Grid container spacing={1.5} sx={{ maxWidth: 700 }}>
          <Grid item xs={12} md={4}><FormControl fullWidth><RadioGroup value={p.printOn} onChange={(event) => setP({ printOn: event.target.value as 'LETTER_PAD' | 'PLAIN_PAPER' })}>
            <FormControlLabel value="LETTER_PAD" control={<Radio size="small" />} label="Letter Pad" disabled={!editable} sx={{ m: 0, height: 26 }} />
            <FormControlLabel value="PLAIN_PAPER" control={<Radio size="small" />} label="Plain Paper" disabled={!editable} sx={{ m: 0, height: 26 }} />
          </RadioGroup></FormControl></Grid>
          <Grid item xs={12} md={4}><FormControl fullWidth><RadioGroup value={stuffing.printSpoName ? 'Y' : 'N'} onChange={(event) => setStuffing(event.target.value === 'Y')}>
            <FormControlLabel value="N" control={<Radio size="small" />} label="Print SPO Name: No" disabled={!editable} sx={{ m: 0, height: 26 }} />
            <FormControlLabel value="Y" control={<Radio size="small" />} label="Print SPO Name: Yes" disabled={!editable} sx={{ m: 0, height: 26 }} />
          </RadioGroup></FormControl></Grid>
          <Grid item xs={12} md={4}><TextField label="Give Today's Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={p.todaysDate} disabled={!editable} onChange={(event) => setP({ todaysDate: event.target.value })} /></Grid>
        </Grid>
      </>}

      {p.documentType === 'OUTER' && <>
        <SectionHeader>Outer Printing</SectionHeader>
        <Grid container spacing={1.5} sx={{ maxWidth: 700 }}>
          <Grid item xs={12} md={4}><FormControl fullWidth><RadioGroup value={outer.paper} onChange={(event) => setOuter(event.target.value as typeof outer.paper)}>
            <FormControlLabel value="LETTER_PAD" control={<Radio size="small" />} label="Letter Pad" disabled={!editable} sx={{ m: 0, height: 26 }} />
            <FormControlLabel value="PLAIN_PAPER" control={<Radio size="small" />} label="Plain Paper" disabled={!editable} sx={{ m: 0, height: 26 }} />
          </RadioGroup></FormControl></Grid>
          <Grid item xs={12} md={4}><TextField label="Give Today's Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={p.todaysDate} disabled={!editable} onChange={(event) => setP({ todaysDate: event.target.value })} /></Grid>
        </Grid>
      </>}

      {p.documentType === 'MASTER_BL_SPECIMEN' && <>
        <SectionHeader>Master B/L Specimen Printing</SectionHeader>
        <Grid container spacing={1.5} sx={{ maxWidth: 900 }}>
          <Grid item xs={12} md={6}>
            <SectionHeader>Print Shipper Name / Address As</SectionHeader>
            <RadioGroup value={master.shipperAs} onChange={(event) => setMaster({ shipperAs: event.target.value as typeof master.shipperAs })}>
              <FormControlLabel value="COMPANY_NAME" control={<Radio size="small" />} label="Company Name" disabled={!editable} sx={{ m: 0, height: 26 }} />
              <FormControlLabel value="SHIPPER_NAME" control={<Radio size="small" />} label="Shipper Name" disabled={!editable} sx={{ m: 0, height: 26 }} />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionHeader>Print Consignee Name / Address As</SectionHeader>
            <RadioGroup value={master.consigneeAs} onChange={(event) => setMaster({ consigneeAs: event.target.value as typeof master.consigneeAs })}>
              <FormControlLabel value="CONSIGNEE_NAME" control={<Radio size="small" />} label="Consignee Name" disabled={!editable} sx={{ m: 0, height: 26 }} />
              <FormControlLabel value="DELIVERY_AGENT" control={<Radio size="small" />} label="Delivery Agent" disabled={!editable} sx={{ m: 0, height: 26 }} />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionHeader>Print Notify Name / Address As</SectionHeader>
            <RadioGroup value={master.notifyAs} onChange={(event) => setMaster({ notifyAs: event.target.value as typeof master.notifyAs })}>
              <FormControlLabel value="NOTIFY_NAME" control={<Radio size="small" />} label="Notify Name" disabled={!editable} sx={{ m: 0, height: 26 }} />
              <FormControlLabel value="DELIVERY_AGENT" control={<Radio size="small" />} label="Delivery Agent" disabled={!editable} sx={{ m: 0, height: 26 }} />
            </RadioGroup>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionHeader>Print On</SectionHeader>
            <RadioGroup value={master.paper} onChange={(event) => setMaster({ paper: event.target.value as typeof master.paper })}>
              <FormControlLabel value="LETTER_PAD" control={<Radio size="small" />} label="Letter Pad" disabled={!editable} sx={{ m: 0, height: 26 }} />
              <FormControlLabel value="PLAIN_PAPER" control={<Radio size="small" />} label="Plain Paper" disabled={!editable} sx={{ m: 0, height: 26 }} />
            </RadioGroup>
          </Grid>
        </Grid>
      </>}

      {printError && <Alert severity="error" sx={{ mt: 2 }}>{printError}</Alert>}
      {!['SHIPMENT_STATUS_REPORT', 'HBL_PRINTING', 'CARGO_MANIFEST', 'EXTRA_SHEET', 'RELEASE_INSTRUCTIONS', 'STUFFING_DETAIL_SINGLE', 'OUTER', 'MASTER_BL_SPECIMEN'].includes(p.documentType) && <Alert severity="info" sx={{ mt: 2 }}>
        The selected document format will be added separately. Shipment Status Report, HBL, Cargo Manifest, Extra Sheet, Release Instructions, Stuffing Detail, Outer, and Master B/L Specimen PDF and Excel are available now.
      </Alert>}
    </Box>
  );
}

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { FormRow, FormField, SectionHeader } from '../../../components/FormGrid';
import { SeaExportJob } from '../../../domain/seaExportJob';
import { partyRepo } from '../../../data/masterDataService';

interface InstructionLetterTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

export function InstructionLetterTab({ job, editable, onChange }: InstructionLetterTabProps) {
  const parties = partyRepo.list();
  const il = job.instructionLetter;
  const setIl = (patch: Partial<SeaExportJob['instructionLetter']>) => onChange({ ...job, instructionLetter: { ...il, ...patch } });

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <SectionHeader>Identification</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField label="MBL No." fullWidth value={il.mblNo} disabled={!editable} onChange={(e) => setIl({ mblNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="HBL No." fullWidth value={il.hblNo} disabled={!editable} onChange={(e) => setIl({ hblNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Doc/Ref. #" fullWidth value={il.docRefNo} disabled={!editable} onChange={(e) => setIl({ docRefNo: e.target.value })} />
            </FormField>
          </FormRow>

          <SectionHeader>Party</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Party Code" fullWidth value={il.partyCode} disabled={!editable} onChange={(e) => setIl({ partyCode: e.target.value })}>
                {parties.map((p) => (
                  <MenuItem key={p.code} value={p.code}>
                    {p.code} — {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Agent Party" fullWidth value={il.agentParty} disabled={!editable} onChange={(e) => setIl({ agentParty: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Address" fullWidth multiline minRows={2} value={il.address} disabled={!editable} onChange={(e) => setIl({ address: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Consignee" fullWidth multiline minRows={2} value={il.consignee} disabled={!editable} onChange={(e) => setIl({ consignee: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Notify" fullWidth multiline minRows={2} value={il.notify} disabled={!editable} onChange={(e) => setIl({ notify: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Also Notify" fullWidth multiline minRows={2} value={il.alsoNotify} disabled={!editable} onChange={(e) => setIl({ alsoNotify: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Delivery Agent" fullWidth value={il.deliveryAgent} disabled={!editable} onChange={(e) => setIl({ deliveryAgent: e.target.value })} />
            </FormField>
          </FormRow>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionHeader>Export &amp; Voyage</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField label="Form E No." fullWidth value={il.formENo} disabled={!editable} onChange={(e) => setIl({ formENo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={il.formEDate} disabled={!editable} onChange={(e) => setIl({ formEDate: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Vessel" fullWidth value={il.vessel} disabled={!editable} onChange={(e) => setIl({ vessel: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Voyage" fullWidth value={il.voyage} disabled={!editable} onChange={(e) => setIl({ voyage: e.target.value })} />
            </FormField>
          </FormRow>

          <SectionHeader>Movement Route</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField label="Place of Receipt" fullWidth value={il.placeOfReceipt} disabled={!editable} onChange={(e) => setIl({ placeOfReceipt: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Place of Loading" fullWidth value={il.placeOfLoading} disabled={!editable} onChange={(e) => setIl({ placeOfLoading: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Place of Discharge" fullWidth value={il.placeOfDischarge} disabled={!editable} onChange={(e) => setIl({ placeOfDischarge: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Place of Delivery" fullWidth value={il.placeOfDelivery} disabled={!editable} onChange={(e) => setIl({ placeOfDelivery: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Freight Payable At" fullWidth value={il.freightPayableAt} disabled={!editable} onChange={(e) => setIl({ freightPayableAt: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="No. of Orig B/Ls" type="number" fullWidth value={il.noOfOrigBLs} disabled={!editable} onChange={(e) => setIl({ noOfOrigBLs: Number(e.target.value) })} />
            </FormField>
          </FormRow>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionHeader>Measurements &amp; Booking</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField label="CBM" type="number" fullWidth value={il.cbm} disabled={!editable} onChange={(e) => setIl({ cbm: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Gross Weight" type="number" fullWidth value={il.grossWeight} disabled={!editable} onChange={(e) => setIl({ grossWeight: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Vol. Weight" type="number" fullWidth value={il.volWeight} disabled={!editable} onChange={(e) => setIl({ volWeight: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Net Weight" type="number" fullWidth value={il.netWeight} disabled={!editable} onChange={(e) => setIl({ netWeight: Number(e.target.value) })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Booking No." fullWidth value={il.bookingNo} disabled={!editable} onChange={(e) => setIl({ bookingNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Reference" fullWidth value={il.reference} disabled={!editable} onChange={(e) => setIl({ reference: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="MOP" fullWidth value={il.mop} disabled={!editable} onChange={(e) => setIl({ mop: e.target.value })} />
            </FormField>
          </FormRow>

          <SectionHeader>Instructions</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField label="Marks &amp; Nos." fullWidth multiline minRows={3} value={il.marksAndNos} disabled={!editable} onChange={(e) => setIl({ marksAndNos: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField
                label="Description of Packages and Goods"
                fullWidth
                multiline
                minRows={3}
                value={il.descriptionOfGoods}
                disabled={!editable}
                onChange={(e) => setIl({ descriptionOfGoods: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Sheet (continuation)" fullWidth multiline minRows={2} value={il.sheet} disabled={!editable} onChange={(e) => setIl({ sheet: e.target.value })} />
            </FormField>
          </FormRow>
        </Grid>
      </Grid>
    </Box>
  );
}

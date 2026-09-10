import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { FormRow, FormField, SectionHeader } from '../../../components/FormGrid';
import { SeaExportJob } from '../../../domain/seaExportJob';
import { partyRepo } from '../../../data/masterDataService';

interface BlScreenTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

export function BlScreenTab({ job, editable, onChange }: BlScreenTabProps) {
  const parties = partyRepo.list();
  const bl = job.bl;
  const setBl = (patch: Partial<SeaExportJob['bl']>) => onChange({ ...job, bl: { ...bl, ...patch } });

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <SectionHeader>Identification</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField label="HBL Type" fullWidth value={bl.hblType} disabled={!editable} onChange={(e) => setBl({ hblType: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="MBL No." fullWidth value={bl.mblNo} disabled={!editable} onChange={(e) => setBl({ mblNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="HBL No." fullWidth value={bl.hblNo} disabled={!editable} onChange={(e) => setBl({ hblNo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Doc/Ref. #" fullWidth value={bl.docRefNo} disabled={!editable} onChange={(e) => setBl({ docRefNo: e.target.value })} />
            </FormField>
          </FormRow>

          <SectionHeader>Party</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField select label="Party Code" fullWidth value={bl.partyCode} disabled={!editable} onChange={(e) => setBl({ partyCode: e.target.value })}>
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
              <TextField label="Agent Party" fullWidth value={bl.agentParty} disabled={!editable} onChange={(e) => setBl({ agentParty: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Address" fullWidth multiline minRows={2} value={bl.address} disabled={!editable} onChange={(e) => setBl({ address: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Consignee" fullWidth multiline minRows={2} value={bl.consignee} disabled={!editable} onChange={(e) => setBl({ consignee: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Notify" fullWidth multiline minRows={2} value={bl.notify} disabled={!editable} onChange={(e) => setBl({ notify: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Also Notify" fullWidth multiline minRows={2} value={bl.alsoNotify} disabled={!editable} onChange={(e) => setBl({ alsoNotify: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Delivery Agent" fullWidth value={bl.deliveryAgent} disabled={!editable} onChange={(e) => setBl({ deliveryAgent: e.target.value })} />
            </FormField>
          </FormRow>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionHeader>Export Document &amp; Voyage</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField label="Form E No." fullWidth value={bl.formENo} disabled={!editable} onChange={(e) => setBl({ formENo: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={bl.formEDate} disabled={!editable} onChange={(e) => setBl({ formEDate: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Vessel" fullWidth value={bl.vessel} disabled={!editable} onChange={(e) => setBl({ vessel: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Voyage" fullWidth value={bl.voyage} disabled={!editable} onChange={(e) => setBl({ voyage: e.target.value })} />
            </FormField>
          </FormRow>

          <SectionHeader>Movement Route</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField label="Place of Receipt" fullWidth value={bl.placeOfReceipt} disabled={!editable} onChange={(e) => setBl({ placeOfReceipt: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Place of Loading" fullWidth value={bl.placeOfLoading} disabled={!editable} onChange={(e) => setBl({ placeOfLoading: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Place of Discharge" fullWidth value={bl.placeOfDischarge} disabled={!editable} onChange={(e) => setBl({ placeOfDischarge: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Place of Delivery" fullWidth value={bl.placeOfDelivery} disabled={!editable} onChange={(e) => setBl({ placeOfDelivery: e.target.value })} />
            </FormField>
          </FormRow>

          <SectionHeader>Issue &amp; Freight Terms</SectionHeader>
          <FormRow>
            <FormField md={6}>
              <TextField label="Freight Payable At" fullWidth value={bl.freightPayableAt} disabled={!editable} onChange={(e) => setBl({ freightPayableAt: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="No. of Orig B/Ls" type="number" fullWidth value={bl.noOfOrigBLs} disabled={!editable} onChange={(e) => setBl({ noOfOrigBLs: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Country of Origin" fullWidth value={bl.countryOfOrigin} disabled={!editable} onChange={(e) => setBl({ countryOfOrigin: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Place of Issue" fullWidth value={bl.placeOfIssue} disabled={!editable} onChange={(e) => setBl({ placeOfIssue: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="HBL Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={bl.hblDate} disabled={!editable} onChange={(e) => setBl({ hblDate: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField select label="FOB/CIF" fullWidth value={bl.fobCif} disabled={!editable} onChange={(e) => setBl({ fobCif: e.target.value as 'FOB' | 'CIF' })}>
                <MenuItem value="FOB">FOB</MenuItem>
                <MenuItem value="CIF">CIF</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
        </Grid>

        <Grid item xs={12} md={4}>
          <SectionHeader>Measurements &amp; Booking</SectionHeader>
          <FormRow>
            <FormField md={4}>
              <TextField label="CBM" type="number" fullWidth value={bl.cbm} disabled={!editable} onChange={(e) => setBl({ cbm: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Gross Weight" type="number" fullWidth value={bl.grossWeight} disabled={!editable} onChange={(e) => setBl({ grossWeight: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Vol. Weight" type="number" fullWidth value={bl.volWeight} disabled={!editable} onChange={(e) => setBl({ volWeight: Number(e.target.value) })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Net Weight" type="number" fullWidth value={bl.netWeight} disabled={!editable} onChange={(e) => setBl({ netWeight: Number(e.target.value) })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Booking No." fullWidth value={bl.bookingNo} disabled={!editable} onChange={(e) => setBl({ bookingNo: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="Loading Pier" fullWidth value={bl.loadingPier} disabled={!editable} onChange={(e) => setBl({ loadingPier: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="Reference" fullWidth value={bl.reference} disabled={!editable} onChange={(e) => setBl({ reference: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField label="B/L Released At" fullWidth value={bl.blReleasedAt} disabled={!editable} onChange={(e) => setBl({ blReleasedAt: e.target.value })} />
            </FormField>
            <FormField md={6}>
              <TextField label="MOP" fullWidth value={bl.mop} disabled={!editable} onChange={(e) => setBl({ mop: e.target.value })} helperText="Mode/method of payment — confirm exact meaning" />
            </FormField>
          </FormRow>

          <SectionHeader>Freight Charges</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField
                label="Freight Charges Text"
                fullWidth
                multiline
                minRows={2}
                value={bl.freightChargesText}
                disabled={!editable}
                onChange={(e) => setBl({ freightChargesText: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={4}>
              <TextField label="Rate" type="number" fullWidth value={bl.rate} disabled={!editable} onChange={(e) => setBl({ rate: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Prepaid" type="number" fullWidth value={bl.prepaid} disabled={!editable} onChange={(e) => setBl({ prepaid: Number(e.target.value) })} />
            </FormField>
            <FormField md={4}>
              <TextField label="Collect" type="number" fullWidth value={bl.collect} disabled={!editable} onChange={(e) => setBl({ collect: Number(e.target.value) })} />
            </FormField>
          </FormRow>

          <SectionHeader>Cargo Description</SectionHeader>
          <FormRow>
            <FormField md={12}>
              <TextField label="Marks &amp; Nos." fullWidth multiline minRows={3} value={bl.marksAndNos} disabled={!editable} onChange={(e) => setBl({ marksAndNos: e.target.value })} />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField
                label="Description of Packages and Goods"
                fullWidth
                multiline
                minRows={3}
                value={bl.descriptionOfGoods}
                disabled={!editable}
                onChange={(e) => setBl({ descriptionOfGoods: e.target.value })}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={12}>
              <TextField label="Sheet (continuation)" fullWidth multiline minRows={2} value={bl.sheet} disabled={!editable} onChange={(e) => setBl({ sheet: e.target.value })} />
            </FormField>
          </FormRow>
        </Grid>
      </Grid>
    </Box>
  );
}

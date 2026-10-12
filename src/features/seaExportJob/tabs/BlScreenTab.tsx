import { ReactNode, useState } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { FormField, FormRow } from '../../../components/FormGrid';
import { WorkflowSection } from '../../../components/WorkflowSection';
import { SeaExportJob } from '../../../domain/seaExportJob';
import { agentRepo, foreignAgentRepo, seaPortRepo } from '../../../data/masterDataService';

interface BlScreenTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

export function BlScreenTab({ job, editable, onChange }: BlScreenTabProps) {
  const [openSection, setOpenSection] = useState('identification');
  const bl = job.bl;
  const foreignAgents = foreignAgentRepo.list();
  const deliveryAgents = agentRepo.find((agent) => agent.kind === 'DELIVERY');
  const selectedDeliveryAgent = deliveryAgents.find((agent) => agent.code === bl.deliveryAgent);
  const seaPorts = seaPortRepo.list();
  const formETypes = [
    { code: '001', name: 'Form E No.' },
    { code: '002', name: 'Fin. Inst. No.' },
    { code: '003', name: 'EPZ NOC No.' },
    { code: '004', name: 'GD No.' },
  ];
  const hblTypes = [
    { code: 'GEN - 01', name: 'General Format' },
    { code: 'MSL - 01', name: 'Masum Logistics' },
  ];
  const setBl = (patch: Partial<SeaExportJob['bl']>) =>
    onChange({ ...job, bl: { ...bl, ...patch } });

  const section = (id: string, title: string, subtitle: string, children: ReactNode) => (
    <WorkflowSection
      key={id}
      title={title}
      subtitle={subtitle}
      open={openSection === id}
      onToggle={() => setOpenSection(openSection === id ? '' : id)}
    >
      {children}
    </WorkflowSection>
  );

  return (
    <Box>
      {section('identification', 'B/L Identification', 'Enter the bill of lading references and document type', <>
        <FormRow>
          <FormField><TextField select label="HBL Type" fullWidth value={bl.hblType} disabled={!editable} onChange={(e) => setBl({ hblType: e.target.value })}>
            <MenuItem value="">Select HBL Type</MenuItem>
            {bl.hblType && !hblTypes.some((type) => type.code === bl.hblType) && <MenuItem value={bl.hblType}>{bl.hblType}</MenuItem>}
            {hblTypes.map((type) => <MenuItem key={type.code} value={type.code}>{type.code} - {type.name}</MenuItem>)}
          </TextField></FormField>
          <FormField><TextField label="MBL No." fullWidth value={bl.mblNo} disabled={!editable} onChange={(e) => setBl({ mblNo: e.target.value })} /></FormField>
          <FormField><TextField label="HBL No." fullWidth value={bl.hblNo} disabled={!editable} onChange={(e) => setBl({ hblNo: e.target.value })} /></FormField>
        </FormRow>
        <FormRow>
          <FormField><TextField label="Doc/Ref. #" fullWidth value={bl.docRefNo} disabled={!editable} onChange={(e) => setBl({ docRefNo: e.target.value })} /></FormField>
          <FormField><TextField label="Booking No." fullWidth value={bl.bookingNo} disabled={!editable} onChange={(e) => setBl({ bookingNo: e.target.value })} /></FormField>
          <FormField><TextField label="Reference" fullWidth value={bl.reference} disabled={!editable} onChange={(e) => setBl({ reference: e.target.value })} /></FormField>
        </FormRow>
      </>)}

      {section('parties', 'Parties', 'Maintain the shipper, consignee, notify and agent details', <>
        <FormRow>
          <FormField><TextField label="Party Code" fullWidth value={bl.partyCode} disabled={!editable} onChange={(e) => setBl({ partyCode: e.target.value })} /></FormField>
          <FormField><TextField select label="Agent Party" fullWidth value={bl.agentParty} disabled={!editable} onChange={(e) => {
            const agent = foreignAgents.find((item) => item.code === e.target.value);
            setBl({ agentParty: e.target.value, ...(agent ? { address: agent.address } : {}) });
          }}>
            <MenuItem value="">Select Agent Party</MenuItem>
            {bl.agentParty && !foreignAgents.some((agent) => agent.code === bl.agentParty) && <MenuItem value={bl.agentParty}>{bl.agentParty}</MenuItem>}
            {foreignAgents.map((agent) => <MenuItem key={agent.code} value={agent.code}>{agent.code} - {agent.name}</MenuItem>)}
          </TextField></FormField>
        </FormRow>
        <FormRow>
          <FormField><TextField label="Address" fullWidth multiline minRows={3} value={bl.address} disabled={!editable} onChange={(e) => setBl({ address: e.target.value })} /></FormField>
          <FormField><TextField label="Consignee" fullWidth multiline minRows={3} value={bl.consignee} disabled={!editable} onChange={(e) => setBl({ consignee: e.target.value })} /></FormField>
          <FormField><TextField label="Notify" fullWidth multiline minRows={3} value={bl.notify} disabled={!editable} onChange={(e) => setBl({ notify: e.target.value })} /></FormField>
        </FormRow>
        <FormRow>
          <FormField><TextField label="Also Notify" fullWidth multiline minRows={2} value={bl.alsoNotify} disabled={!editable} onChange={(e) => setBl({ alsoNotify: e.target.value })} /></FormField>
        </FormRow>
        <FormRow>
          <FormField><TextField select label="Delivery Agent" fullWidth value={bl.deliveryAgent} disabled={!editable} onChange={(e) => setBl({ deliveryAgent: e.target.value })}>
            <MenuItem value="">Select Delivery Agent</MenuItem>
            {bl.deliveryAgent && !deliveryAgents.some((agent) => agent.code === bl.deliveryAgent) && <MenuItem value={bl.deliveryAgent}>{bl.deliveryAgent}</MenuItem>}
            {deliveryAgents.map((agent) => <MenuItem key={agent.code} value={agent.code}>{agent.code} - {agent.name}</MenuItem>)}
          </TextField></FormField>
        </FormRow>
        {selectedDeliveryAgent && <FormRow>
          <FormField md={12}><TextField
            label="Delivery Agent Contact Details"
            fullWidth
            multiline
            minRows={3}
            value={[selectedDeliveryAgent.name, selectedDeliveryAgent.address, selectedDeliveryAgent.phoneNo && `Tel: ${selectedDeliveryAgent.phoneNo}`, selectedDeliveryAgent.contactPerson && `POC: ${selectedDeliveryAgent.contactPerson}`, selectedDeliveryAgent.email && `Email: ${selectedDeliveryAgent.email}`].filter(Boolean).join('\n')}
            InputProps={{ readOnly: true }}
          /></FormField>
        </FormRow>}
      </>)}

      {section('voyage', 'Export Document & Voyage', 'Enter export document, vessel and voyage information', <FormRow>
        <FormField><TextField select label="Form E Type" fullWidth value={job.selectFromE} disabled={!editable} onChange={(e) => onChange({ ...job, selectFromE: e.target.value })}>
          <MenuItem value="">Select Type</MenuItem>
          {formETypes.map((type) => <MenuItem key={type.code} value={type.code}>{type.code} — {type.name}</MenuItem>)}
        </TextField></FormField>
        <FormField><TextField label="Form E No." fullWidth value={bl.formENo} disabled={!editable} onChange={(e) => setBl({ formENo: e.target.value })} /></FormField>
        <FormField><TextField label="Form E Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={bl.formEDate} disabled={!editable} onChange={(e) => setBl({ formEDate: e.target.value })} /></FormField>
        <FormField><TextField label="Vessel" fullWidth value={bl.vessel} disabled={!editable} onChange={(e) => setBl({ vessel: e.target.value })} /></FormField>
        <FormField><TextField label="Voyage" fullWidth value={bl.voyage} disabled={!editable} onChange={(e) => setBl({ voyage: e.target.value })} /></FormField>
      </FormRow>)}

      {section('route', 'Movement Route', 'Set the cargo receipt, loading, discharge and delivery locations', <FormRow>
        <FormField><TextField label="Place of Receipt" fullWidth value={bl.placeOfReceipt} disabled={!editable} onChange={(e) => setBl({ placeOfReceipt: e.target.value })} /></FormField>
        <FormField><TextField select label="Place of Loading" fullWidth value={bl.placeOfLoading} disabled={!editable} onChange={(e) => setBl({ placeOfLoading: e.target.value })}>
          <MenuItem value="">Select Place of Loading</MenuItem>
          {bl.placeOfLoading && !seaPorts.some((port) => port.code === bl.placeOfLoading) && <MenuItem value={bl.placeOfLoading}>{bl.placeOfLoading}</MenuItem>}
          {seaPorts.map((port) => <MenuItem key={port.code} value={port.code}>{port.code} — {port.name}</MenuItem>)}
        </TextField></FormField>
        <FormField><TextField select label="Port of Discharge" fullWidth value={bl.placeOfDischarge} disabled={!editable} onChange={(e) => setBl({ placeOfDischarge: e.target.value })}>
          <MenuItem value="">Select Port of Discharge</MenuItem>
          {bl.placeOfDischarge && !seaPorts.some((port) => port.code === bl.placeOfDischarge) && <MenuItem value={bl.placeOfDischarge}>{bl.placeOfDischarge}</MenuItem>}
          {seaPorts.map((port) => <MenuItem key={port.code} value={port.code}>{port.code} — {port.name}</MenuItem>)}
        </TextField></FormField>
        <FormField><TextField select label="Place of Delivery" fullWidth value={bl.placeOfDelivery} disabled={!editable} onChange={(e) => setBl({ placeOfDelivery: e.target.value })}>
          <MenuItem value="">Select Place of Delivery</MenuItem>
          {bl.placeOfDelivery && !seaPorts.some((port) => port.code === bl.placeOfDelivery) && <MenuItem value={bl.placeOfDelivery}>{bl.placeOfDelivery}</MenuItem>}
          {seaPorts.map((port) => <MenuItem key={port.code} value={port.code}>{port.code} — {port.name}</MenuItem>)}
        </TextField></FormField>
      </FormRow>)}

      {section('issue', 'Issue & Freight Terms', 'Record B/L issuance details and freight payment terms', <>
        <FormRow>
          <FormField><TextField select label="Freight Payable At" fullWidth value={bl.freightPayableAt} disabled={!editable} onChange={(e) => setBl({ freightPayableAt: e.target.value })}>
            <MenuItem value="">Select Place</MenuItem>
            {bl.freightPayableAt && !seaPorts.some((port) => port.code === bl.freightPayableAt) && <MenuItem value={bl.freightPayableAt}>{bl.freightPayableAt}</MenuItem>}
            {seaPorts.map((port) => <MenuItem key={port.code} value={port.code}>{port.code} — {port.name}</MenuItem>)}
          </TextField></FormField>
          <FormField><TextField label="No. of Orig B/Ls" type="number" fullWidth value={bl.noOfOrigBLs} disabled={!editable} onChange={(e) => setBl({ noOfOrigBLs: Number(e.target.value) })} /></FormField>
          <FormField><TextField label="Country of Origin" fullWidth value={bl.countryOfOrigin} disabled={!editable} onChange={(e) => setBl({ countryOfOrigin: e.target.value })} /></FormField>
        </FormRow>
        <FormRow>
          <FormField><TextField label="Place of Issue" fullWidth value={bl.placeOfIssue} disabled={!editable} onChange={(e) => setBl({ placeOfIssue: e.target.value })} /></FormField>
          <FormField><TextField label="HBL Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={bl.hblDate} disabled={!editable} onChange={(e) => setBl({ hblDate: e.target.value })} /></FormField>
          <FormField><TextField select label="FOB/CIF" fullWidth value={bl.fobCif} disabled={!editable} onChange={(e) => setBl({ fobCif: e.target.value as 'FOB' | 'CIF' })}><MenuItem value="FOB">FOB</MenuItem><MenuItem value="CIF">CIF</MenuItem></TextField></FormField>
        </FormRow>
      </>)}

      {section('measurements', 'Measurements & Booking', 'Enter shipment measurements and booking references', <>
        <FormRow>
          <FormField><TextField label="CBM" type="number" fullWidth value={bl.cbm} disabled={!editable} onChange={(e) => setBl({ cbm: Number(e.target.value) })} /></FormField>
          <FormField><TextField label="Gross Weight" type="number" fullWidth value={bl.grossWeight} disabled={!editable} onChange={(e) => setBl({ grossWeight: Number(e.target.value) })} /></FormField>
          <FormField><TextField label="Vol. Weight" type="number" fullWidth value={bl.volWeight} disabled={!editable} onChange={(e) => setBl({ volWeight: Number(e.target.value) })} /></FormField>
        </FormRow>
        <FormRow>
          <FormField><TextField label="Net Weight" type="number" fullWidth value={bl.netWeight} disabled={!editable} onChange={(e) => setBl({ netWeight: Number(e.target.value) })} /></FormField>
          <FormField><TextField label="Loading Pier" fullWidth value={bl.loadingPier} disabled={!editable} onChange={(e) => setBl({ loadingPier: e.target.value })} /></FormField>
          <FormField><TextField label="B/L Released At" fullWidth value={bl.blReleasedAt} disabled={!editable} onChange={(e) => setBl({ blReleasedAt: e.target.value })} /></FormField>
        </FormRow>
        <FormRow>
          <FormField><TextField select label="MOP" fullWidth value={bl.mop} disabled={!editable} onChange={(e) => setBl({ mop: e.target.value })}>
            <MenuItem value="">Select MOP</MenuItem>
            {bl.mop && !['PP', 'CC'].includes(bl.mop) && <MenuItem value={bl.mop}>{bl.mop}</MenuItem>}
            <MenuItem value="PP">PP</MenuItem>
            <MenuItem value="CC">CC</MenuItem>
          </TextField></FormField>
        </FormRow>
      </>)}

      {section('freight', 'Freight Charges', 'Enter freight description and prepaid or collect amounts', <>
        <FormRow><FormField md={12}><TextField label="Freight Charges Text" fullWidth multiline minRows={2} value={bl.freightChargesText} disabled={!editable} onChange={(e) => setBl({ freightChargesText: e.target.value })} /></FormField></FormRow>
        <FormRow>
          <FormField><TextField label="Rate" type="number" fullWidth value={bl.rate} disabled={!editable} onChange={(e) => setBl({ rate: Number(e.target.value) })} /></FormField>
          <FormField><TextField label="Prepaid" type="number" fullWidth value={bl.prepaid} disabled={!editable} onChange={(e) => setBl({ prepaid: Number(e.target.value) })} /></FormField>
          <FormField><TextField label="Collect" type="number" fullWidth value={bl.collect} disabled={!editable} onChange={(e) => setBl({ collect: Number(e.target.value) })} /></FormField>
        </FormRow>
      </>)}

      {section('cargo', 'Cargo Description', 'Describe cargo marks, packages and goods for the B/L', <>
        <FormRow><FormField md={12}><TextField label="Marks & Nos." fullWidth multiline minRows={3} value={bl.marksAndNos} disabled={!editable} onChange={(e) => setBl({ marksAndNos: e.target.value })} /></FormField></FormRow>
        <FormRow><FormField md={12}><TextField label="Description of Packages and Goods" fullWidth multiline minRows={3} value={bl.descriptionOfGoods} disabled={!editable} onChange={(e) => setBl({ descriptionOfGoods: e.target.value })} /></FormField></FormRow>
        <FormRow><FormField md={12}><TextField label="Sheet (continuation)" fullWidth multiline minRows={2} value={bl.sheet} disabled={!editable} onChange={(e) => setBl({ sheet: e.target.value })} /></FormField></FormRow>
      </>)}
    </Box>
  );
}

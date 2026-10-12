import { ReactNode, useState } from 'react';
import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { FormField, FormRow } from '../../../components/FormGrid';
import { WorkflowSection } from '../../../components/WorkflowSection';
import { agentRepo, partyRepo, seaPortRepo } from '../../../data/masterDataService';
import { SeaExportJob } from '../../../domain/seaExportJob';

interface InstructionLetterTabProps {
  job: SeaExportJob;
  editable: boolean;
  onChange: (job: SeaExportJob) => void;
}

const formETypes = [
  { code: '001', name: 'Form E No.' },
  { code: '002', name: 'Fin. Inst. No.' },
  { code: '003', name: 'EPZ NOC No.' },
  { code: '004', name: 'GD No.' },
];

export function InstructionLetterTab({ job, editable, onChange }: InstructionLetterTabProps) {
  const [openSection, setOpenSection] = useState('identification');
  const il = job.instructionLetter;
  const parties = partyRepo.list();
  const deliveryAgents = agentRepo.find((agent) => agent.kind === 'DELIVERY');
  const ports = seaPortRepo.list();
  const selectedDeliveryAgent = deliveryAgents.find((agent) => agent.code === il.deliveryAgent);
  const setIl = (patch: Partial<SeaExportJob['instructionLetter']>) =>
    onChange({ ...job, instructionLetter: { ...il, ...patch } });
  const section = (id: string, title: string, subtitle: string, children: ReactNode) => (
    <WorkflowSection key={id} title={title} subtitle={subtitle} open={openSection === id} onToggle={() => setOpenSection(openSection === id ? '' : id)}>
      {children}
    </WorkflowSection>
  );
  const portSelect = (label: string, value: string, onSelect: (next: string) => void) => (
    <TextField select label={label} fullWidth value={value} disabled={!editable} onChange={(event) => onSelect(event.target.value)}>
      <MenuItem value="">Select {label}</MenuItem>
      {value && !ports.some((port) => port.code === value) && <MenuItem value={value}>{value}</MenuItem>}
      {ports.map((port) => <MenuItem key={port.code} value={port.code}>{port.code} — {port.name}</MenuItem>)}
    </TextField>
  );

  return (
    <Box>
      {section('identification', 'B/L Identification', 'Enter master, house and document reference numbers', <FormRow>
        <FormField><TextField label="MBL No." fullWidth value={il.mblNo} disabled={!editable} onChange={(event) => setIl({ mblNo: event.target.value })} /></FormField>
        <FormField><TextField label="HBL No." fullWidth value={il.hblNo} disabled={!editable} onChange={(event) => setIl({ hblNo: event.target.value })} /></FormField>
        <FormField><TextField label="Doc/Ref. #" fullWidth value={il.docRefNo} disabled={!editable} onChange={(event) => setIl({ docRefNo: event.target.value })} /></FormField>
      </FormRow>)}

      {section('parties', 'Parties & Addresses', 'Select the party and agent, then complete the letter recipients', <>
        <FormRow>
          <FormField><TextField select label="Party Code" fullWidth value={il.partyCode} disabled={!editable} onChange={(event) => {
            const party = parties.find((item) => item.code === event.target.value);
            setIl({ partyCode: event.target.value, ...(party ? { address: party.address } : {}) });
          }}>
            <MenuItem value="">Select Party Code</MenuItem>
            {il.partyCode && !parties.some((party) => party.code === il.partyCode) && <MenuItem value={il.partyCode}>{il.partyCode}</MenuItem>}
            {parties.map((party) => <MenuItem key={party.code} value={party.code}>{party.code} — {party.name}</MenuItem>)}
          </TextField></FormField>
          <FormField><TextField select label="Agent Party" fullWidth value={il.agentParty} disabled={!editable} onChange={(event) => setIl({ agentParty: event.target.value })}>
            <MenuItem value="">Select Agent Party</MenuItem>
            {il.agentParty && !parties.some((party) => party.code === il.agentParty) && <MenuItem value={il.agentParty}>{il.agentParty}</MenuItem>}
            {parties.map((party) => <MenuItem key={party.code} value={party.code}>{party.code} — {party.name}</MenuItem>)}
          </TextField></FormField>
          <FormField><TextField label="Address" fullWidth multiline minRows={2} value={il.address} disabled={!editable} onChange={(event) => setIl({ address: event.target.value })} /></FormField>
        </FormRow>
        <FormRow>
          <FormField><TextField label="Consignee" fullWidth multiline minRows={3} value={il.consignee} disabled={!editable} onChange={(event) => setIl({ consignee: event.target.value })} /></FormField>
          <FormField><TextField label="Notify" fullWidth multiline minRows={3} value={il.notify} disabled={!editable} onChange={(event) => setIl({ notify: event.target.value })} /></FormField>
          <FormField><TextField label="Also Notify" fullWidth multiline minRows={3} value={il.alsoNotify} disabled={!editable} onChange={(event) => setIl({ alsoNotify: event.target.value })} /></FormField>
        </FormRow>
        <FormRow>
          <FormField><TextField select label="Delivery Agent" fullWidth value={il.deliveryAgent} disabled={!editable} onChange={(event) => setIl({ deliveryAgent: event.target.value })}>
            <MenuItem value="">Select Delivery Agent</MenuItem>
            {il.deliveryAgent && !deliveryAgents.some((agent) => agent.code === il.deliveryAgent) && <MenuItem value={il.deliveryAgent}>{il.deliveryAgent}</MenuItem>}
            {deliveryAgents.map((agent) => <MenuItem key={agent.code} value={agent.code}>{agent.code} — {agent.name}</MenuItem>)}
          </TextField></FormField>
        </FormRow>
        {selectedDeliveryAgent && <FormRow>
          <FormField md={12}><TextField label="Delivery Agent Contact Details" fullWidth multiline minRows={3} value={[
            selectedDeliveryAgent.name,
            selectedDeliveryAgent.address,
            selectedDeliveryAgent.phoneNo && `Tel: ${selectedDeliveryAgent.phoneNo}`,
            selectedDeliveryAgent.contactPerson && `POC: ${selectedDeliveryAgent.contactPerson}`,
            selectedDeliveryAgent.email && `Email: ${selectedDeliveryAgent.email}`,
          ].filter(Boolean).join('\n')} InputProps={{ readOnly: true }} /></FormField>
        </FormRow>}
      </>)}

      {section('voyage', 'Export Document & Voyage', 'Enter Form E, vessel and voyage information', <FormRow>
        <FormField><TextField select label="Form E Type" fullWidth value={job.selectFromE} disabled={!editable} onChange={(event) => onChange({ ...job, selectFromE: event.target.value })}>
          <MenuItem value="">Select Form E Type</MenuItem>
          {formETypes.map((type) => <MenuItem key={type.code} value={type.code}>{type.code} — {type.name}</MenuItem>)}
        </TextField></FormField>
        <FormField><TextField label="Form E No." fullWidth value={il.formENo} disabled={!editable} onChange={(event) => setIl({ formENo: event.target.value })} /></FormField>
        <FormField><TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={il.formEDate} disabled={!editable} onChange={(event) => setIl({ formEDate: event.target.value })} /></FormField>
        <FormField><TextField label="Vessel" fullWidth value={il.vessel} disabled={!editable} onChange={(event) => setIl({ vessel: event.target.value })} /></FormField>
        <FormField><TextField label="Voyage" fullWidth value={il.voyage} disabled={!editable} onChange={(event) => setIl({ voyage: event.target.value })} /></FormField>
      </FormRow>)}

      {section('route', 'Movement Route & Freight Terms', 'Set the shipment route and B/L freight terms', <>
        <FormRow>
          <FormField><TextField label="Place of Receipt" fullWidth value={il.placeOfReceipt} disabled={!editable} onChange={(event) => setIl({ placeOfReceipt: event.target.value })} /></FormField>
          <FormField>{portSelect('Place of Loading', il.placeOfLoading, (value) => setIl({ placeOfLoading: value }))}</FormField>
          <FormField>{portSelect('Port of Discharge', il.placeOfDischarge, (value) => setIl({ placeOfDischarge: value }))}</FormField>
          <FormField>{portSelect('Place of Delivery', il.placeOfDelivery, (value) => setIl({ placeOfDelivery: value }))}</FormField>
        </FormRow>
        <FormRow>
          <FormField>{portSelect('Freight Payable At', il.freightPayableAt, (value) => setIl({ freightPayableAt: value }))}</FormField>
          <FormField><TextField label="No. of Orig B/Ls" type="number" fullWidth value={il.noOfOrigBLs} disabled={!editable} onChange={(event) => setIl({ noOfOrigBLs: Number(event.target.value) })} /></FormField>
        </FormRow>
      </>)}

      {section('measurements', 'Measurements & Booking', 'Enter cargo measurements, booking reference and payment method', <>
        <FormRow>
          <FormField><TextField label="CBM" type="number" fullWidth value={il.cbm} disabled={!editable} onChange={(event) => setIl({ cbm: Number(event.target.value) })} /></FormField>
          <FormField><TextField label="Gross Weight" type="number" fullWidth value={il.grossWeight} disabled={!editable} onChange={(event) => setIl({ grossWeight: Number(event.target.value) })} /></FormField>
          <FormField><TextField label="Vol. Weight" type="number" fullWidth value={il.volWeight} disabled={!editable} onChange={(event) => setIl({ volWeight: Number(event.target.value) })} /></FormField>
        </FormRow>
        <FormRow>
          <FormField><TextField label="Net Weight" type="number" fullWidth value={il.netWeight} disabled={!editable} onChange={(event) => setIl({ netWeight: Number(event.target.value) })} /></FormField>
          <FormField><TextField label="Booking No." fullWidth value={il.bookingNo} disabled={!editable} onChange={(event) => setIl({ bookingNo: event.target.value })} /></FormField>
          <FormField><TextField label="Reference" fullWidth value={il.reference} disabled={!editable} onChange={(event) => setIl({ reference: event.target.value })} /></FormField>
        </FormRow>
        <FormRow><FormField><TextField select label="MOP" fullWidth value={il.mop} disabled={!editable} onChange={(event) => setIl({ mop: event.target.value })}>
          <MenuItem value="">Select MOP</MenuItem>
          {il.mop && !['PP', 'CC'].includes(il.mop) && <MenuItem value={il.mop}>{il.mop}</MenuItem>}
          <MenuItem value="PP">PP</MenuItem><MenuItem value="CC">CC</MenuItem>
        </TextField></FormField></FormRow>
      </>)}

      {section('instructions', 'Cargo Instructions', 'Enter marks, package and goods descriptions for the letter', <>
        <FormRow><FormField md={12}><TextField label="Marks & Nos." fullWidth multiline minRows={3} value={il.marksAndNos} disabled={!editable} onChange={(event) => setIl({ marksAndNos: event.target.value })} /></FormField></FormRow>
        <FormRow><FormField md={12}><TextField label="Description of Packages and Goods" fullWidth multiline minRows={4} value={il.descriptionOfGoods} disabled={!editable} onChange={(event) => setIl({ descriptionOfGoods: event.target.value })} /></FormField></FormRow>
      </>)}

      {section('sheet', 'Sheet', 'Enter any continuation text for the instruction letter', <FormRow>
        <FormField md={12}><TextField label="Sheet (continuation)" fullWidth multiline minRows={6} value={il.sheet} disabled={!editable} onChange={(event) => setIl({ sheet: event.target.value })} /></FormField>
      </FormRow>)}
    </Box>
  );
}

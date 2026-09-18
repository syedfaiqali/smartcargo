import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import { SeaImportJob } from '../../domain/seaImportJob';

export function PrintingTab({ job }: { job: SeaImportJob }) {
  const [printOn, setPrintOn] = useState<'PLAIN' | 'LETTER'>('PLAIN');
  const [printType, setPrintType] = useState('DELIVERY_ORDER');
  const [officeCopy, setOfficeCopy] = useState(true);
  const [customerCopy, setCustomerCopy] = useState(true);
  const [duplicateCopy, setDuplicateCopy] = useState(false);

  return (
    <Box sx={{ maxWidth: 620 }}>
      <Typography component="div" sx={{ display: 'inline-block', px: 1.5, py: 0.7, mb: 0.75, borderRadius: 1, bgcolor: '#075a9d', color: 'white', fontSize: 20, fontWeight: 700, boxShadow: 2 }}>
        INBOND SHIPMENT (SEA-IMPORT)
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}><Paper variant="outlined" sx={{ width: 440, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '185px 1fr', '& > *': { minHeight: 38, borderBottom: '1px solid #d7dee8' }, '& > :nth-last-of-type(-n+2)': { borderBottom: 0 } }}>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Branch</Box>
          <Box sx={{ p: 0.35 }}><TextField select size="small" value={job.branch} sx={{ width: 90 }}><MenuItem value={job.branch}>{job.branch}</MenuItem></TextField></Box>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Job No.</Box>
          <Box sx={{ p: 0.35 }}><TextField size="small" value={job.jobNo} InputProps={{ readOnly: true }} sx={{ width: 150 }} /></Box>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print</Box>
          <RadioGroup value={printType} onChange={(event) => setPrintType(event.target.value)} sx={{ py: 0.25 }}>{[['DELIVERY_ORDER','Delivery Order'],['SHIPMENT_PRE_ALERT','Shipment Pre-Alert'],['RELEASE_DELIVERY_ORDER','Release Delivery Order'],['ARRIVAL_NOTIFICATION','Arrival Notification'],['ARRIVAL_NOTIFICATION_BACK','Arrival Notification (Back Side)'],['AMENDMENT_MANIFEST','Amendment Manifest'],['CARGO_RECEIPT_ACK','Cargo Receipt Acknowledgement'],['CONTAINER_LIST','List of Containers (Vessel/Voyage)'],['CARGO_BOOK','Cargo Book'],['IMPORT_GENERAL_MANIFEST','Import General Manifest'],['OUTER','Outer'],['CONTAINER_SECURITY_RECEIPT','Container Security Receipt'],['SURRENDER_LETTER','Surrender Letter']].map(([value,label])=><FormControlLabel key={value} value={value} control={<Radio size="small" sx={{ py: 0.35 }}/>} label={label} sx={{ minHeight: 27, height: 'auto', alignItems: 'flex-start', m: 0, '& .MuiFormControlLabel-label': { fontWeight: 700, fontSize: 14, lineHeight: 1.35, py: 0.3 } }}/>)}</RadioGroup>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Letter Date</Box>
          <Box sx={{ p: 0.35 }}><TextField size="small" type="date" defaultValue={job.jobDate} sx={{width:160}}/></Box>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print D/O</Box>
          <Box sx={{py:0.15}}><FormControlLabel control={<Checkbox size="small" checked={officeCopy} onChange={e=>setOfficeCopy(e.target.checked)}/>} label="Office Copy" sx={{display:'flex',height:23,m:0,fontWeight:700}}/><FormControlLabel control={<Checkbox size="small" checked={customerCopy} onChange={e=>setCustomerCopy(e.target.checked)}/>} label="Customer Copy" sx={{display:'flex',height:23,m:0,fontWeight:700}}/><FormControlLabel control={<Checkbox size="small" checked={duplicateCopy} onChange={e=>setDuplicateCopy(e.target.checked)}/>} label="Duplicate Copy" sx={{display:'flex',height:23,m:0,fontWeight:700}}/></Box>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print On</Box>
          <RadioGroup value={printOn} onChange={(event) => setPrintOn(event.target.value as 'PLAIN' | 'LETTER')}>
            <FormControlLabel value="PLAIN" control={<Radio size="small" />} label="Plain Page" sx={{ height: 28, m: 0 }} />
            <FormControlLabel value="LETTER" control={<Radio size="small" />} label="Letter Head" sx={{ height: 28, m: 0 }} />
          </RadioGroup>
        </Box>
      </Paper>
      <Box sx={{display:'flex',gap:1,pt:0.5}}><Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />} onClick={() => window.print()}>PDF</Button><Button variant="outlined" color="success" startIcon={<TableViewIcon />}>CSV</Button></Box></Box>
    </Box>
  );
}

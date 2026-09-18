import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import { SeaImportForeignAgentInvoice } from '../../domain/seaImportForeignAgentInvoice';
import { SeaImportVariantConfig } from './variantConfig';

export function PrintingTab({ invoice, config }: { invoice: SeaImportForeignAgentInvoice; config: SeaImportVariantConfig }) {
  const [printOn, setPrintOn] = useState<'PLAIN' | 'LETTER'>('PLAIN');
  const [printIn, setPrintIn] = useState<'LOCAL' | 'FOREIGN'>('LOCAL');
  const [heading, setHeading] = useState('INVOICE');
  const [signatories, setSignatories] = useState('N');
  const [copy, setCopy] = useState('ORIGINAL');

  return (
    <Box sx={{ maxWidth: 620 }}>
      <Typography component="div" sx={{ display: 'inline-block', px: 1.5, py: 0.7, mb: 0.75, borderRadius: 1, bgcolor: '#075a9d', color: 'white', fontSize: 20, fontWeight: 700, boxShadow: 2 }}>
        {config.title.toUpperCase()}
      </Typography>
      <Box sx={{display:'flex',alignItems:'flex-start',gap:1.5}}><Paper variant="outlined" sx={{ width: 410, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '200px 1fr', '& > *': { minHeight: 38, borderBottom: '1px solid #d7dee8' }, '& > :nth-last-of-type(-n+2)': { borderBottom: 0 } }}>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Branch</Box>
          <Box sx={{ p: 0.35 }}><TextField select size="small" value={invoice.branch} sx={{ width: 90 }}><MenuItem value={invoice.branch}>{invoice.branch}</MenuItem></TextField></Box>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>{config.printingDocLabel}</Box>
          <Box sx={{ p: 0.35 }}><TextField size="small" value={invoice.documentNo} InputProps={{ readOnly: true }} sx={{ width: 150 }} /></Box>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print On</Box>
          <RadioGroup value={printOn} onChange={(event) => setPrintOn(event.target.value as 'PLAIN' | 'LETTER')}>
            <FormControlLabel value="PLAIN" control={<Radio size="small" />} label="Plain Page" sx={{ height: 28, m: 0 }} />
            <FormControlLabel value="LETTER" control={<Radio size="small" />} label="Letter Head" sx={{ height: 28, m: 0 }} />
          </RadioGroup>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print In</Box>
          <RadioGroup value={printIn} onChange={(event) => setPrintIn(event.target.value as 'LOCAL' | 'FOREIGN')}>
            <FormControlLabel value="LOCAL" control={<Radio size="small" />} label="PKR Currency" sx={{ height: 28, m: 0 }} />
            <FormControlLabel value="FOREIGN" control={<Radio size="small" />} label="Foreign Currency" sx={{ height: 28, m: 0 }} />
          </RadioGroup>
          <Box sx={{p:.75,bgcolor:'#f1f5f9',fontWeight:700}}>Print Heading As</Box><RadioGroup value={heading} onChange={e=>setHeading(e.target.value)}>{[['INVOICE','Invoice'],['FREIGHT_MEMO','Freight Memo'],['DEBIT_NOTE','Debit Note']].map(([v,l])=><FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={l} sx={{height:23,m:0,fontWeight:700}}/>)}</RadioGroup>
          <Box sx={{p:.75,bgcolor:'#f1f5f9',fontWeight:700}}>Print Signatories</Box><RadioGroup value={signatories} onChange={e=>setSignatories(e.target.value)}><FormControlLabel value="Y" control={<Radio size="small"/>} label="Yes" sx={{height:23,m:0,fontWeight:700}}/><FormControlLabel value="N" control={<Radio size="small"/>} label="No" sx={{height:23,m:0,fontWeight:700}}/></RadioGroup>
          <Box sx={{p:.75,bgcolor:'#f1f5f9',fontWeight:700}}>Print</Box><RadioGroup value={copy} onChange={e=>setCopy(e.target.value)}>{['ORIGINAL','REVISED','DUPLICATE','OFFICE_COPY'].map(v=><FormControlLabel key={v} value={v} control={<Radio size="small"/>} label={v.replace('_',' ')} sx={{height:23,m:0,fontWeight:700}}/>)}</RadioGroup>
        </Box>
      </Paper>
      <Box sx={{display:'flex',gap:1,pt:.5}}><Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />} onClick={() => window.print()}>PDF</Button><Button variant="outlined" color="success" startIcon={<TableViewIcon/>}>Excel</Button></Box></Box>
    </Box>
  );
}

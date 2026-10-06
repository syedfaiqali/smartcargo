import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import { SeaImportQuotation } from '../../domain/seaImportQuotation';
import { printSeaImportQuotation } from './seaImportQuotationReport';

export function SeaImportQuotationPrintingTab({ quotation }: { quotation: SeaImportQuotation }) {
  const [print, setPrint] = useState<'QUOTATION' | 'EXTRA_SHEET'>('QUOTATION');
  const [printOn, setPrintOn] = useState<'LETTER' | 'PLAIN'>('PLAIN');
  const [printIn, setPrintIn] = useState<'PKR' | 'FOREIGN'>('PKR');
  const [printGrandTotal, setPrintGrandTotal] = useState<'Y' | 'N'>('Y');
  const [printTariff, setPrintTariff] = useState<'Y' | 'N'>('Y');
  const [printSignatorys, setPrintSignatorys] = useState<'Y' | 'N'>('N');
  const [attention, setAttention] = useState('');

  return (
    <Box sx={{ maxWidth: 620 }}>
      <Typography component="div" sx={{ display: 'inline-block', px: 1.5, py: 0.7, mb: 0.75, borderRadius: 1, bgcolor: '#075a9d', color: 'white', fontSize: 20, fontWeight: 700, boxShadow: 2 }}>
        QUOTATIONS
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Paper variant="outlined" sx={{ width: 400, overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', '& > *': { minHeight: 38, borderBottom: '1px solid #d7dee8' }, '& > :nth-last-of-type(-n+2)': { borderBottom: 0 } }}>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Branch</Box>
            <Box sx={{ p: 0.35 }}><TextField select size="small" value={quotation.branch} sx={{ width: 90 }}><MenuItem value={quotation.branch}>{quotation.branch}</MenuItem></TextField></Box>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Refrence No.</Box>
            <Box sx={{ p: 0.35 }}><TextField size="small" value={quotation.quotationNo} InputProps={{ readOnly: true }} sx={{ width: 150 }} /></Box>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print</Box>
            <RadioGroup value={print} onChange={(event) => setPrint(event.target.value as 'QUOTATION' | 'EXTRA_SHEET')}>
              <FormControlLabel value="QUOTATION" control={<Radio size="small" />} label="Quotation" sx={{ height: 28, m: 0 }} />
              <FormControlLabel value="EXTRA_SHEET" control={<Radio size="small" />} label="Extra Sheet" sx={{ height: 28, m: 0 }} />
            </RadioGroup>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print On</Box>
            <RadioGroup value={printOn} onChange={(event) => setPrintOn(event.target.value as 'LETTER' | 'PLAIN')}>
              <FormControlLabel value="LETTER" control={<Radio size="small" />} label="Letter Pad" sx={{ height: 28, m: 0 }} />
              <FormControlLabel value="PLAIN" control={<Radio size="small" />} label="Plain Paper" sx={{ height: 28, m: 0 }} />
            </RadioGroup>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print In</Box>
            <RadioGroup value={printIn} onChange={(event) => setPrintIn(event.target.value as 'PKR' | 'FOREIGN')}>
              <FormControlLabel value="PKR" control={<Radio size="small" />} label="PKR Currency" sx={{ height: 28, m: 0 }} />
              <FormControlLabel value="FOREIGN" control={<Radio size="small" />} label="Foreign Currency" sx={{ height: 28, m: 0 }} />
            </RadioGroup>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print Grand Total</Box>
            <RadioGroup row value={printGrandTotal} onChange={(event) => setPrintGrandTotal(event.target.value as 'Y' | 'N')}>
              <FormControlLabel value="Y" control={<Radio size="small" />} label="Yes" sx={{ height: 28, m: 0, mr: 2 }} />
              <FormControlLabel value="N" control={<Radio size="small" />} label="No" sx={{ height: 28, m: 0 }} />
            </RadioGroup>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print Tariff</Box>
            <RadioGroup row value={printTariff} onChange={(event) => setPrintTariff(event.target.value as 'Y' | 'N')}>
              <FormControlLabel value="Y" control={<Radio size="small" />} label="Yes" sx={{ height: 28, m: 0, mr: 2 }} />
              <FormControlLabel value="N" control={<Radio size="small" />} label="No" sx={{ height: 28, m: 0 }} />
            </RadioGroup>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Attention</Box>
            <Box sx={{ p: 0.35 }}><TextField size="small" fullWidth value={attention} onChange={(event) => setAttention(event.target.value)} /></Box>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print Signatorys</Box>
            <RadioGroup row value={printSignatorys} onChange={(event) => setPrintSignatorys(event.target.value as 'Y' | 'N')}>
              <FormControlLabel value="Y" control={<Radio size="small" />} label="Yes" sx={{ height: 28, m: 0, mr: 2 }} />
              <FormControlLabel value="N" control={<Radio size="small" />} label="No" sx={{ height: 28, m: 0 }} />
            </RadioGroup>
          </Box>
        </Paper>
        <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
          <ButtonBase
            onClick={() => printSeaImportQuotation(quotation)}
            sx={{ width: 60, height: 60, borderRadius: 1.5, bgcolor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <PictureAsPdfIcon sx={{ color: 'white', fontSize: 32 }} />
          </ButtonBase>
          <ButtonBase
            sx={{ width: 60, height: 60, borderRadius: 1.5, border: '2px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <TableViewIcon sx={{ color: '#16a34a', fontSize: 32 }} />
          </ButtonBase>
        </Box>
      </Box>
    </Box>
  );
}

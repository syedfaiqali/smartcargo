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
import { SeaRefundFromShippingLines } from '../../domain/seaRefundFromShippingLines';

export function SeaRefundPrintingTab({ refund }: { refund: SeaRefundFromShippingLines }) {
  const [printOn, setPrintOn] = useState<'PLAIN' | 'LETTER'>('PLAIN');
  const [printIn, setPrintIn] = useState<'LOCAL' | 'FOREIGN'>('LOCAL');

  return (
    <Box sx={{ maxWidth: 620 }}>
      <Typography component="div" sx={{ display: 'inline-block', px: 1.5, py: 0.7, mb: 0.75, borderRadius: 1, bgcolor: '#075a9d', color: 'white', fontSize: 20, fontWeight: 700, boxShadow: 2 }}>
        REFUND FROM SHIPPING LINES (SEA-EXPORT)
      </Typography>
      <Paper variant="outlined" sx={{ width: 410, overflow: 'hidden' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', '& > *': { minHeight: 38, borderBottom: '1px solid #d7dee8' }, '& > :nth-last-of-type(-n+2)': { borderBottom: 0 } }}>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Branch</Box>
          <Box sx={{ p: 0.35 }}><TextField select size="small" value={refund.branch} sx={{ width: 90 }}><MenuItem value={refund.branch}>{refund.branch}</MenuItem></TextField></Box>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Document No.</Box>
          <Box sx={{ p: 0.35 }}><TextField size="small" value={refund.documentNo} InputProps={{ readOnly: true }} sx={{ width: 150 }} /></Box>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print On</Box>
          <RadioGroup value={printOn} onChange={(event) => setPrintOn(event.target.value as 'PLAIN' | 'LETTER')}>
            <FormControlLabel value="PLAIN" control={<Radio size="small" />} label="Plain Page" sx={{ height: 28, m: 0 }} />
            <FormControlLabel value="LETTER" control={<Radio size="small" />} label="Letter Head" sx={{ height: 28, m: 0 }} />
          </RadioGroup>
          <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print In</Box>
          <RadioGroup value={printIn} onChange={(event) => setPrintIn(event.target.value as 'LOCAL' | 'FOREIGN')}>
            <FormControlLabel value="LOCAL" control={<Radio size="small" />} label="Local Currency" sx={{ height: 28, m: 0 }} />
            <FormControlLabel value="FOREIGN" control={<Radio size="small" />} label="Foreign Currency" sx={{ height: 28, m: 0 }} />
          </RadioGroup>
        </Box>
      </Paper>
      <Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />} onClick={() => window.print()} sx={{ mt: 1.5 }}>
        PDF
      </Button>
    </Box>
  );
}

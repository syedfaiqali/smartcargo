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
import { SeaImportOtherChargesPayable } from '../../domain/seaImportOtherChargesPayable';
import { signatoryRepo } from '../../data/masterDataService';

export function SeaImportPayablePrintingTab({ payable }: { payable: SeaImportOtherChargesPayable }) {
  const [printOn, setPrintOn] = useState<'PLAIN' | 'LETTER'>('PLAIN');
  const [signatoryCode, setSignatoryCode] = useState('');
  const signatories = signatoryRepo.list();

  return (
    <Box sx={{ maxWidth: 620 }}>
      <Typography component="div" sx={{ display: 'inline-block', px: 1.5, py: 0.7, mb: 0.75, borderRadius: 1, bgcolor: '#075a9d', color: 'white', fontSize: 20, fontWeight: 700, boxShadow: 2 }}>
        OTHER CHARGES PAYABLE (SEA-IMPORT)
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <Paper variant="outlined" sx={{ width: 330, overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr', '& > *': { minHeight: 38, borderBottom: '1px solid #d7dee8' }, '& > :nth-last-of-type(-n+2)': { borderBottom: 0 } }}>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Branch</Box>
            <Box sx={{ p: 0.35 }}><TextField select size="small" value={payable.branch} sx={{ width: 90 }}><MenuItem value={payable.branch}>{payable.branch}</MenuItem></TextField></Box>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Credit Note No.</Box>
            <Box sx={{ p: 0.35 }}><TextField size="small" value={payable.creditNoteNo} InputProps={{ readOnly: true }} sx={{ width: 150 }} /></Box>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Print On</Box>
            <RadioGroup value={printOn} onChange={(event) => setPrintOn(event.target.value as 'PLAIN' | 'LETTER')}>
              <FormControlLabel value="PLAIN" control={<Radio size="small" />} label="Plain Page" sx={{ height: 28, m: 0 }} />
              <FormControlLabel value="LETTER" control={<Radio size="small" />} label="Letter Pad" sx={{ height: 28, m: 0 }} />
            </RadioGroup>
            <Box sx={{ p: 0.75, bgcolor: '#f1f5f9', fontWeight: 700 }}>Signatory (Authorised By)</Box>
            <Box sx={{ p: 0.35 }}>
              <TextField select size="small" fullWidth value={signatoryCode} onChange={(event) => setSignatoryCode(event.target.value)} SelectProps={{ displayEmpty: true }}>
                <MenuItem value="">Select Signatory Code</MenuItem>
                {signatories.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.code} — {s.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
        </Paper>
        <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
          <ButtonBase
            onClick={() => window.print()}
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

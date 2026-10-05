import { useState } from 'react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Voucher } from '../../domain/voucher';

type PrintDocument = 'VOUCHER' | 'DEBIT_NOTE' | 'CREDIT_NOTE' | 'CHEQUE';

export function VoucherPrintingTab({ voucher }: { voucher: Voucher }) {
  const [document, setDocument] = useState<PrintDocument>('VOUCHER');

  return (
    <Box sx={{ maxWidth: 950, mx: 'auto' }}>
      <Paper variant="outlined" sx={{ overflow: 'hidden', borderColor: '#26384a', bgcolor: '#eefaff' }}>
        <Typography component="h2" sx={{ px: 1.5, py: 0.75, color: '#0645ad', fontFamily: 'serif', fontSize: 24 }}>
          Printing.....
        </Typography>
        <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '315px 1fr' }, gap: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 98px', alignContent: 'start', bgcolor: '#e6f3ff' }}>
            <TextField label="Branch" select size="small" value={voucher.branch} disabled sx={{ bgcolor: 'white', '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#172b4d' } }}>
              <MenuItem value={voucher.branch}>{voucher.branch || '—'}</MenuItem>
            </TextField>
            <Box />
            <TextField label="Voucher No." size="small" value={voucher.voucherNo} disabled sx={{ mt: 1, bgcolor: 'white', gridColumn: '1 / -1', '& .MuiInputBase-input.Mui-disabled': { WebkitTextFillColor: '#172b4d' } }} />
            <Box sx={{ gridColumn: '1 / -1', mt: 1, p: 1, border: '1px solid #cbd5e1', borderRadius: 0.5, bgcolor: '#f8fafc' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>Print</Typography>
              <RadioGroup value={document} onChange={(event) => setDocument(event.target.value as PrintDocument)}>
                <FormControlLabel value="VOUCHER" control={<Radio size="small" />} label="Voucher" sx={{ my: -0.45, '& .MuiTypography-root': { fontWeight: 700, fontSize: 14 } }} />
                <FormControlLabel value="DEBIT_NOTE" control={<Radio size="small" />} label="Debit Note" sx={{ my: -0.45, '& .MuiTypography-root': { fontWeight: 700, fontSize: 14 } }} />
                <FormControlLabel value="CREDIT_NOTE" control={<Radio size="small" />} label="Credit Note" sx={{ my: -0.45, '& .MuiTypography-root': { fontWeight: 700, fontSize: 14 } }} />
                <FormControlLabel value="CHEQUE" control={<Radio size="small" />} label="Cheque" sx={{ my: -0.45, '& .MuiTypography-root': { fontWeight: 700, fontSize: 14 } }} />
              </RadioGroup>
            </Box>
          </Box>
        </Box>
        <Box sx={{ borderTop: '1px solid #26384a', p: 1, display: 'flex', justifyContent: 'center', gap: 1, bgcolor: '#dcf7ff' }}>
          <Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />} onClick={() => window.print()}>PDF</Button>
          <Button variant="outlined" color="success" startIcon={<TableViewIcon />} onClick={() => window.print()}>Excel</Button>
        </Box>
      </Paper>
    </Box>
  );
}

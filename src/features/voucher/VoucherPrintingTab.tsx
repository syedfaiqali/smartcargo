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
import { printVoucherReport } from './voucherReport';

type PrintDocument = 'VOUCHER' | 'DEBIT_NOTE' | 'CREDIT_NOTE' | 'CHEQUE';

export function VoucherPrintingTab({ voucher }: { voucher: Voucher }) {
  const [document, setDocument] = useState<PrintDocument>('VOUCHER');
  const [printCurrency, setPrintCurrency] = useState<'PKR' | 'FOREIGN'>('PKR');
  const [chequePayTo, setChequePayTo] = useState(voucher.receivedFrom || voucher.partyName || voucher.partyCode || '');
  const [printPayeeAccountOnly, setPrintPayeeAccountOnly] = useState<'Y' | 'N'>('Y');
  const [printStamp, setPrintStamp] = useState<'Y' | 'N'>('N');
  const [signatoryOne, setSignatoryOne] = useState('');
  const [signatoryTwo, setSignatoryTwo] = useState('');

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
            {(document === 'DEBIT_NOTE' || document === 'CREDIT_NOTE') && (
              <Box sx={{ gridColumn: '1 / -1', mt: 0.5, display: 'grid', gridTemplateColumns: '1fr 122px', alignItems: 'stretch', bgcolor: '#e6f3ff' }}>
                <Box sx={{ minHeight: 49, p: 0.75, border: '1px solid #cbd5e1', borderRadius: 0.5, bgcolor: '#f8fafc', fontWeight: 700, fontSize: 14 }}>
                  Print Currency
                </Box>
                <RadioGroup value={printCurrency} onChange={(event) => setPrintCurrency(event.target.value as 'PKR' | 'FOREIGN')} sx={{ pl: 0.5 }}>
                  <FormControlLabel value="PKR" control={<Radio size="small" />} label="PKR" sx={{ height: 25, my: -0.2, '& .MuiTypography-root': { fontWeight: 700, fontSize: 14 } }} />
                  <FormControlLabel value="FOREIGN" control={<Radio size="small" />} label="Foreign Currency" sx={{ height: 25, my: -0.2, '& .MuiTypography-root': { fontWeight: 700, fontSize: 14 } }} />
                </RadioGroup>
              </Box>
            )}
            {document === 'CHEQUE' && (
              <Box sx={{ gridColumn: '1 / -1', mt: 0.5, display: 'grid', gridTemplateColumns: '200px 1fr', gap: 0.75, alignItems: 'center', bgcolor: '#e6f3ff', p: 0.25 }}>
                <Box sx={{ minHeight: 27, px: 0.75, display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 0.5, bgcolor: '#f8fafc', fontWeight: 700, fontSize: 14 }}>Pay To</Box>
                <TextField size="small" value={chequePayTo} onChange={(event) => setChequePayTo(event.target.value)} sx={{ bgcolor: 'white', '& .MuiInputBase-input': { py: 0.45, fontWeight: 700 } }} />
                <Box sx={{ minHeight: 49, px: 0.75, display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 0.5, bgcolor: '#f8fafc', fontWeight: 700, fontSize: 14 }}>Print Payees A/c Only</Box>
                <RadioGroup value={printPayeeAccountOnly} onChange={(event) => setPrintPayeeAccountOnly(event.target.value as 'Y' | 'N')}>
                  <FormControlLabel value="Y" control={<Radio size="small" />} label="Yes" sx={{ height: 25, my: -0.2, '& .MuiTypography-root': { fontWeight: 700, fontSize: 14 } }} />
                  <FormControlLabel value="N" control={<Radio size="small" />} label="No" sx={{ height: 25, my: -0.2, '& .MuiTypography-root': { fontWeight: 700, fontSize: 14 } }} />
                </RadioGroup>
                <Box sx={{ minHeight: 49, px: 0.75, display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 0.5, bgcolor: '#f8fafc', fontWeight: 700, fontSize: 14 }}>Print Stamp</Box>
                <RadioGroup value={printStamp} onChange={(event) => setPrintStamp(event.target.value as 'Y' | 'N')}>
                  <FormControlLabel value="Y" control={<Radio size="small" />} label="Yes" sx={{ height: 25, my: -0.2, '& .MuiTypography-root': { fontWeight: 700, fontSize: 14 } }} />
                  <FormControlLabel value="N" control={<Radio size="small" />} label="No" sx={{ height: 25, my: -0.2, '& .MuiTypography-root': { fontWeight: 700, fontSize: 14 } }} />
                </RadioGroup>
                <Box sx={{ minHeight: 27, px: 0.75, display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 0.5, bgcolor: '#f8fafc', fontWeight: 700, fontSize: 14 }}>Signatory (1) Designation</Box>
                <TextField size="small" value={signatoryOne} onChange={(event) => setSignatoryOne(event.target.value)} sx={{ bgcolor: 'white', '& .MuiInputBase-input': { py: 0.45 } }} />
                <Box sx={{ minHeight: 27, px: 0.75, display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 0.5, bgcolor: '#f8fafc', fontWeight: 700, fontSize: 14 }}>Signatory (2) Designation</Box>
                <TextField size="small" value={signatoryTwo} onChange={(event) => setSignatoryTwo(event.target.value)} sx={{ bgcolor: 'white', '& .MuiInputBase-input': { py: 0.45 } }} />
              </Box>
            )}
          </Box>
        </Box>
        <Box sx={{ borderTop: '1px solid #26384a', p: 1, display: 'flex', justifyContent: 'center', gap: 1, bgcolor: '#dcf7ff' }}>
          <Button variant="contained" color="error" startIcon={<PictureAsPdfIcon />} onClick={() => printVoucherReport(voucher, document, printCurrency, { payTo: chequePayTo, printPayeeAccountOnly: printPayeeAccountOnly === 'Y', printStamp: printStamp === 'Y', signatoryOne, signatoryTwo })}>PDF</Button>
          <Button variant="outlined" color="success" startIcon={<TableViewIcon />} onClick={() => window.print()}>Excel</Button>
        </Box>
      </Paper>
    </Box>
  );
}

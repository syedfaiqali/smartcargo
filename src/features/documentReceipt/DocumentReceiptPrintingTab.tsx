import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableViewIcon from '@mui/icons-material/TableView';
import { DocumentReceipt } from '../../domain/documentReceipt';

export function DocumentReceiptPrintingTab({ document }: { document: DocumentReceipt }) {
  return (
    <Box sx={{ maxWidth: 620 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#0f5788', color: 'white', px: 2, py: 1, mb: 0, borderRadius: '4px 4px 0 0' }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}>Document Receipt Printing</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ButtonBase
            onClick={() => window.print()}
            sx={{ width: 34, height: 34, borderRadius: 1, bgcolor: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <PictureAsPdfIcon sx={{ color: 'white', fontSize: 20 }} />
          </ButtonBase>
          <ButtonBase
            sx={{ width: 34, height: 34, borderRadius: 1, border: '2px solid #16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <TableViewIcon sx={{ color: '#16a34a', fontSize: 20 }} />
          </ButtonBase>
        </Box>
      </Box>
      <Paper variant="outlined" sx={{ borderTop: 0 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '140px 1fr', '& > *': { minHeight: 40, borderBottom: '1px solid #d7dee8' }, '& > :nth-last-of-type(-n+2)': { borderBottom: 0 } }}>
          <Box sx={{ p: 0.9, bgcolor: '#f1f5f9', fontWeight: 700 }}>Branch</Box>
          <Box sx={{ p: 0.5 }}><TextField select size="small" value={document.branch} sx={{ width: 90 }}><MenuItem value={document.branch}>{document.branch}</MenuItem></TextField></Box>
          <Box sx={{ p: 0.9, bgcolor: '#f1f5f9', fontWeight: 700 }}>Record No.</Box>
          <Box sx={{ p: 0.5 }}><TextField size="small" value={document.recordNo} InputProps={{ readOnly: true }} sx={{ width: 150 }} /></Box>
        </Box>
      </Paper>
    </Box>
  );
}

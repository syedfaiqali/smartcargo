import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import { DocumentReceipt, DocumentReceiptLine, DocumentReceiptType } from '../../domain/documentReceipt';

interface DocumentReceiptEntryFormProps {
  document: DocumentReceipt;
  editable: boolean;
  onChange: (document: DocumentReceipt) => void;
}

const typeOptions: DocumentReceiptType[] = ['Air M/JOB', 'Sea M/JOB', 'Air H/JOB', 'Sea H/JOB'];

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40, borderBottom: '1px solid #e2e8f0' }}>
      <Box sx={{ width: 160, flexShrink: 0, fontWeight: 600, fontSize: 13.5 }}>{label}</Box>
      <Box sx={{ flex: 1, py: 0.5 }}>{children}</Box>
    </Box>
  );
}

export function DocumentReceiptEntryForm({ document, editable, onChange }: DocumentReceiptEntryFormProps) {
  const update = <K extends keyof DocumentReceipt>(key: K, value: DocumentReceipt[K]) => {
    onChange({ ...document, [key]: value });
  };

  const updateLine = (id: string, patch: Partial<DocumentReceiptLine>) => {
    onChange({ ...document, lines: document.lines.map((line) => (line.id === id ? { ...line, ...patch } : line)) });
  };

  const updateLineLabel = (id: string, label: string) => {
    onChange({ ...document, lines: document.lines.map((line) => (line.id === id ? { ...line, label } : line)) });
  };

  return (
    <Box>
      <Box sx={{ display: 'inline-block', px: 2, py: 1, mb: 1.5, borderRadius: 1, bgcolor: '#075a9d', color: 'white', fontSize: 18, fontWeight: 700 }}>
        Document Receipt Entry
      </Box>

      <Paper variant="outlined" sx={{ maxWidth: 900, p: 1.5, mb: 2 }}>
        <FieldRow label="Branch">
          <TextField select size="small" value={document.branch} disabled={!editable} onChange={(e) => update('branch', e.target.value)} sx={{ width: 110 }}>
            <MenuItem value="KHI">KHI</MenuItem>
            <MenuItem value="LHE">LHE</MenuItem>
            <MenuItem value="ISB">ISB</MenuItem>
          </TextField>
        </FieldRow>
        <FieldRow label="Record No.">
          <TextField size="small" value={document.recordNo} InputProps={{ readOnly: true }} sx={{ width: 160 }} />
        </FieldRow>
        <FieldRow label="Date">
          <TextField size="small" type="date" value={document.date} disabled={!editable} onChange={(e) => update('date', e.target.value)} sx={{ width: 180 }} />
        </FieldRow>
        <FieldRow label="Type">
          <TextField select size="small" value={document.type} disabled={!editable} onChange={(e) => update('type', e.target.value as DocumentReceiptType)} sx={{ width: 180 }}>
            {typeOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
        </FieldRow>
        <FieldRow label="Job No.">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField size="small" value={document.jobNo} disabled={!editable} onChange={(e) => update('jobNo', e.target.value)} sx={{ width: 140 }} />
            <TextField size="small" value={document.jobNoSuffix} disabled={!editable} onChange={(e) => update('jobNoSuffix', e.target.value)} sx={{ width: 90 }} />
          </Box>
        </FieldRow>
        <FieldRow label="Party Code">
          <TextField size="small" fullWidth placeholder="Select Party Code ...." value={document.partyCode ? `${document.partyCode} - ${document.partyName}` : ''} disabled={!editable}
            onChange={(e) => update('partyCode', e.target.value)} />
        </FieldRow>
        <FieldRow label="Sub Agent Code">
          <TextField size="small" fullWidth placeholder="Select Sub Agent Code ...." value={document.subAgentCode ? `${document.subAgentCode} - ${document.subAgentName}` : ''} disabled={!editable}
            onChange={(e) => update('subAgentCode', e.target.value)} />
        </FieldRow>
        <FieldRow label="No. Of Pkgs">
          <TextField size="small" type="number" value={document.noOfPkgs} disabled={!editable} onChange={(e) => update('noOfPkgs', Number(e.target.value))} sx={{ width: 110 }} />
        </FieldRow>
        <FieldRow label="Origin">
          <TextField size="small" fullWidth placeholder="Select Origin ...." value={document.origin} disabled={!editable} onChange={(e) => update('origin', e.target.value)} />
        </FieldRow>
        <FieldRow label="Destination">
          <TextField size="small" fullWidth placeholder="Select Destination ...." value={document.destination} disabled={!editable} onChange={(e) => update('destination', e.target.value)} />
        </FieldRow>
      </Paper>

      <TableContainer component={Paper} variant="outlined" sx={{ maxWidth: 1200 }}>
        <Table size="small" sx={{ '& .MuiTableCell-root': { borderRight: '1px solid #d7dee8', borderBottom: '1px solid #d7dee8', py: 0.6, px: 1 }, '& .MuiTableCell-root:last-child': { borderRight: 0 } }}>
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { bgcolor: '#eaf3e0', fontWeight: 700 } }}>
              <TableCell sx={{ width: 220 }} />
              <TableCell sx={{ width: 190 }}>Document No.</TableCell>
              <TableCell sx={{ width: 160 }}>Date</TableCell>
              <TableCell align="center">Original</TableCell>
              <TableCell align="center">Duplicate</TableCell>
              <TableCell align="center">Triplicate</TableCell>
              <TableCell align="center">Quadruplicate</TableCell>
              <TableCell align="center">Custom Attested</TableCell>
              <TableCell align="center">Exporter&apos;s Copy</TableCell>
              <TableCell align="center">Other</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {document.lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell sx={{ p: 0 }}>
                  {line.label ? (
                    <Box sx={{ px: 1, py: 0.9 }}>{line.label}</Box>
                  ) : (
                    <TextField size="small" fullWidth variant="standard" value={line.label} disabled={!editable}
                      onChange={(e) => updateLineLabel(line.id, e.target.value)} sx={{ px: 1 }} InputProps={{ disableUnderline: true }} />
                  )}
                </TableCell>
                <TableCell sx={{ p: 0.35 }}>
                  <TextField size="small" fullWidth value={line.documentNo} disabled={!editable} onChange={(e) => updateLine(line.id, { documentNo: e.target.value })} />
                </TableCell>
                <TableCell sx={{ p: 0.35 }}>
                  <TextField size="small" fullWidth type="date" value={line.date} disabled={!editable} onChange={(e) => updateLine(line.id, { date: e.target.value })} />
                </TableCell>
                <TableCell align="center"><Checkbox size="small" checked={line.original} disabled={!editable} onChange={(e) => updateLine(line.id, { original: e.target.checked })} /></TableCell>
                <TableCell align="center"><Checkbox size="small" checked={line.duplicate} disabled={!editable} onChange={(e) => updateLine(line.id, { duplicate: e.target.checked })} /></TableCell>
                <TableCell align="center"><Checkbox size="small" checked={line.triplicate} disabled={!editable} onChange={(e) => updateLine(line.id, { triplicate: e.target.checked })} /></TableCell>
                <TableCell align="center"><Checkbox size="small" checked={line.quadruplicate} disabled={!editable} onChange={(e) => updateLine(line.id, { quadruplicate: e.target.checked })} /></TableCell>
                <TableCell align="center"><Checkbox size="small" checked={line.customAttested} disabled={!editable} onChange={(e) => updateLine(line.id, { customAttested: e.target.checked })} /></TableCell>
                <TableCell align="center"><Checkbox size="small" checked={line.exportersCopy} disabled={!editable} onChange={(e) => updateLine(line.id, { exportersCopy: e.target.checked })} /></TableCell>
                <TableCell align="center"><Checkbox size="small" checked={line.other} disabled={!editable} onChange={(e) => updateLine(line.id, { other: e.target.checked })} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

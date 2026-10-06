import { useState } from "react";
import { Box, Button, Chip, FormControl, FormControlLabel, Grid, MenuItem, Paper, Radio, RadioGroup, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from "@mui/material";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import TableViewOutlinedIcon from "@mui/icons-material/TableViewOutlined";
import { jsPDF } from "jspdf";
import { PageShell } from "../../layout/PageShell";
import { WorkflowSection } from "../../components/WorkflowSection";
import { FormField, FormRow } from "../../components/FormGrid";
import { bankRepo, partyRepo } from "../../data/masterDataService";
import { controlCodeRepo } from "../../data/financeSetupService";
import { getAccountsLedger, getAccountsLedgerOpeningBalance } from "../../data/financeReportsService";

const RadioChoice = ({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: string[] }) => (
  <FormControl component="fieldset" fullWidth>
    <RadioGroup row value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}>
      {options.map((option) => <FormControlLabel key={option} value={option} control={<Radio size="small" />} label={option} />)}
    </RadioGroup>
  </FormControl>
);

export function AccountsLedgerPage() {
  const parties = partyRepo.list();
  const banks = bankRepo.list();
  const controls = controlCodeRepo.list();
  const [form, setForm] = useState({ branch: "KHI", associateCode: "", controlCode: "", range: "Single", accountCode: "", fromDate: new Date().toISOString().slice(0, 10), toDate: new Date().toISOString().slice(0, 10), currency: "Local Currency", printPdc: "No", checkPdcDate: "No", pdcDate: new Date().toISOString().slice(0, 10), openingBalance: "Yes", clearedInvoices: "No", bankCode: "", printSpo: "No" });
  const [showReport, setShowReport] = useState(false);
  const set = <K extends keyof typeof form>(key: K, value: typeof form[K]) => setForm((current) => ({ ...current, [key]: value }));
  const reportRows = getAccountsLedger({ branch: form.branch, fromDate: form.fromDate, toDate: form.toDate, associateCode: form.associateCode });
  const openingBalance = getAccountsLedgerOpeningBalance({ branch: form.branch, fromDate: form.fromDate, associateCode: form.associateCode });
  const totalDebit = reportRows.reduce((total, row) => total + row.debit, 0);
  const totalCredit = reportRows.reduce((total, row) => total + row.credit, 0);
  const closingBalance = reportRows.at(-1)?.balance ?? openingBalance;
  const downloadPdf = () => {
    const account = controls.find((code) => code.code === form.accountCode);
    const associate = parties.find((party) => party.code === form.associateCode);
    const bank = banks.find((item) => item.code === form.bankCode);
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("ACCOUNTS LEDGER", 14, 18);
    doc.setFontSize(10);
    const rows = [
      ["Branch", form.branch],
      ["Associate Code", associate ? `${associate.code} - ${associate.name}` : "All Associates"],
      ["Control Code", form.controlCode || "All Control Codes"],
      ["Account Code Range", form.range],
      ["Account", account ? `${account.code} - ${account.name}` : "All Accounts"],
      ["Period", `${form.fromDate} to ${form.toDate}`],
      ["Report Currency", form.currency],
      ["Print PDC Cheques", form.printPdc],
      ["Check PDC Cheque Date", form.checkPdcDate],
      ["PDC Cheque Up To", form.pdcDate],
      ["Print Opening Balance", form.openingBalance],
      ["Print Cleared Documents", form.clearedInvoices],
      ["Bank Detail", bank ? `${bank.code} - ${bank.name}` : "Not selected"],
      ["Print SPO Name", form.printSpo],
    ];
    let y = 32;
    rows.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(value), 72, y);
      y += 9;
    });
    y += 4;
    doc.setFont("helvetica", "bold");
    doc.text("Date", 14, y);
    doc.text("Type", 40, y);
    doc.text("Voucher / Particulars", 63, y);
    doc.text("Debit", 146, y);
    doc.text("Credit", 168, y);
    doc.text("Balance", 188, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    reportRows.forEach((entry) => {
      if (y > 275) {
        doc.addPage();
        y = 18;
      }
      doc.text(entry.date, 14, y);
      doc.text(entry.type, 40, y);
      doc.text(`${entry.no} ${entry.particulars}`.slice(0, 48), 63, y);
      doc.text(entry.debit ? entry.debit.toFixed(2) : "", 146, y, { align: "right" });
      doc.text(entry.credit ? entry.credit.toFixed(2) : "", 168, y, { align: "right" });
      doc.text(entry.balance.toFixed(2), 198, y, { align: "right" });
      y += 7;
    });
    doc.setDrawColor(180);
    doc.line(14, y + 3, 196, y + 3);
    doc.setFontSize(9);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, y + 12);
    doc.save(`accounts-ledger-${form.fromDate}-to-${form.toDate}.pdf`);
  };
  if (showReport) return (
    <PageShell breadcrumbs={["Finance", "Reports (Finance)", "Accounts Ledger", "Report"]} title="Accounts Ledger Report" actions={<Button variant="outlined" onClick={() => setShowReport(false)}>Back to Filters</Button>}>
      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}><Button variant="contained" startIcon={<PictureAsPdfOutlinedIcon />} onClick={downloadPdf}>Download PDF</Button></Stack>
      <Paper variant="outlined" sx={{ p: { xs: 1, md: 2 }, overflowX: "auto" }}>
        <Box sx={{ minWidth: 1120, color: "#000", fontFamily: "Arial, sans-serif" }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", alignItems: "center", mb: 1.5 }}><Typography variant="caption">Date : {new Date().toLocaleString()}<br />Page : 1 / 2<br />User : Supervisor<br />Branch : {form.branch}</Typography><Box textAlign="center"><Typography fontWeight={800}>Masum Logistics</Typography><Typography fontWeight={700}>Ledger Accounting System</Typography><Typography variant="body2">General Ledger For: {form.fromDate.split("-").reverse().join("/")} To {form.toDate.split("-").reverse().join("/")}</Typography></Box><Box textAlign="center"><Typography fontWeight={800} color="primary.main">MASUM LOGISTICS</Typography></Box></Box>
          <Table size="small" sx={{ "& .MuiTableCell-root": { border: "1px solid #111", color: "#000", px: 0.55, py: 0.35, fontSize: 10, lineHeight: 1.2 }, "& .MuiTableHead-root .MuiTableCell-root": { fontWeight: 800, textAlign: "center" } }}><TableHead><TableRow><TableCell colSpan={5}>VOUCHER</TableCell><TableCell rowSpan={2}>Orig</TableCell><TableCell rowSpan={2}>Dest</TableCell><TableCell rowSpan={2}>Pcs</TableCell><TableCell rowSpan={2}>Weight</TableCell><TableCell rowSpan={2}>Job No.</TableCell><TableCell colSpan={3}>AMOUNT</TableCell></TableRow><TableRow><TableCell>Date</TableCell><TableCell>Type</TableCell><TableCell>No.</TableCell><TableCell>Br.</TableCell><TableCell>Particulars</TableCell><TableCell>Debit</TableCell><TableCell>Credit</TableCell><TableCell>Balance&nbsp;&nbsp;D/C</TableCell></TableRow></TableHead><TableBody><TableRow><TableCell colSpan={13} sx={{ fontWeight: 800 }}>Account Code: {form.accountCode || "All Accounts"} &nbsp; {controls.find((item) => item.code === form.accountCode)?.name || ""} &nbsp;&nbsp; Curr: PKR</TableCell></TableRow>{form.openingBalance === "Yes" && <TableRow><TableCell colSpan={10} /><TableCell colSpan={3} align="right">*** Opening Balance ***&nbsp;&nbsp; {Math.abs(openingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}&nbsp;&nbsp; {openingBalance >= 0 ? "Dr" : "Cr"}</TableCell></TableRow>}{reportRows.length === 0 ? <TableRow><TableCell colSpan={13} align="center" sx={{ py: 3 }}>No finalized Local Invoices or Bank Receipt Vouchers match the selected filters.</TableCell></TableRow> : <>{reportRows.map((row) => <TableRow key={`${row.type}-${row.no}`}><TableCell>{row.date.split("-").reverse().join("/")}</TableCell><TableCell sx={{ color: "#0000ee !important" }}>{row.type}</TableCell><TableCell>{row.no}</TableCell><TableCell>{row.branch}</TableCell><TableCell sx={{ maxWidth: 205 }}>{row.particulars}</TableCell><TableCell /><TableCell /><TableCell /><TableCell /><TableCell>{row.jobNo}</TableCell><TableCell align="right">{row.debit ? row.debit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}</TableCell><TableCell align="right">{row.credit ? row.credit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : ""}</TableCell><TableCell align="right">{Math.abs(row.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}&nbsp;&nbsp;{row.dc}</TableCell></TableRow>)}<TableRow sx={{ "& .MuiTableCell-root": { fontWeight: 800, borderTop: "2px solid #111" } }}><TableCell colSpan={10} align="right">TOTAL</TableCell><TableCell align="right">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell><TableCell align="right">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell><TableCell align="right">{Math.abs(closingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}&nbsp;&nbsp;{closingBalance >= 0 ? "Dr" : "Cr"}</TableCell></TableRow><TableRow sx={{ "& .MuiTableCell-root": { fontWeight: 800 } }}><TableCell colSpan={10} align="right">GRAND TOTAL</TableCell><TableCell align="right">{totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell><TableCell align="right">{totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</TableCell><TableCell align="right">{Math.abs(closingBalance).toLocaleString(undefined, { minimumFractionDigits: 2 })}&nbsp;&nbsp;{closingBalance >= 0 ? "Dr" : "Cr"}</TableCell></TableRow></>}</TableBody></Table>
        </Box>
      </Paper>
    </PageShell>
  );

  return (
    <PageShell breadcrumbs={["Finance", "Reports (Finance)", "Accounts Ledger"]} title="Accounts Ledger">
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}><Chip color="primary" label="Accounts Ledger" /><Chip variant="outlined" label="Report Filters" /></Stack>
      <WorkflowSection title="Accounts Ledger" subtitle="Choose account, date, currency, and cheque options before generating the report" open onToggle={() => undefined}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={8}>
            <FormRow>
              <FormField md={4}><TextField select label="Branch" fullWidth value={form.branch} onChange={(event) => set("branch", event.target.value)}><MenuItem value="KHI">KHI</MenuItem></TextField></FormField>
              <FormField md={8}><TextField select label="Give Associate Code" fullWidth value={form.associateCode} onChange={(event) => set("associateCode", event.target.value)}><MenuItem value="">Empty For All</MenuItem>{parties.map((party) => <MenuItem key={party.code} value={party.code}>{party.code} — {party.name}</MenuItem>)}</TextField></FormField>
            </FormRow>
            <FormRow><FormField md={12}><TextField select label="Give Control Code" fullWidth value={form.controlCode} onChange={(event) => set("controlCode", event.target.value)}><MenuItem value="">Empty For All</MenuItem>{controls.map((code) => <MenuItem key={code.code} value={code.code}>{code.code} — {code.name}</MenuItem>)}</TextField></FormField></FormRow>
            <FormRow><FormField md={4}><TextField label="Give Account Code Range" fullWidth disabled value={form.range} /></FormField><FormField md={8}><RadioChoice label="Account code range" value={form.range} onChange={(value) => set("range", value)} options={["Single", "Multiple"]} /></FormField></FormRow>
            <FormRow><FormField md={12}><TextField select label={form.range === "Single" ? "Give Starting Account Code" : "Give Starting Account Code"} fullWidth value={form.accountCode} onChange={(event) => set("accountCode", event.target.value)}><MenuItem value="">Select Account Code</MenuItem>{controls.map((code) => <MenuItem key={code.code} value={code.code}>{code.code} — {code.name}</MenuItem>)}</TextField></FormField></FormRow>
            <FormRow><FormField md={6}><TextField label="Give Starting Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.fromDate} onChange={(event) => set("fromDate", event.target.value)} /></FormField><FormField md={6}><TextField label="Give Ending Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.toDate} onChange={(event) => set("toDate", event.target.value)} /></FormField></FormRow>
            <FormRow><FormField md={4}><TextField label="Print Report In" fullWidth disabled value="" /></FormField><FormField md={8}><RadioChoice label="Print report in" value={form.currency} onChange={(value) => set("currency", value)} options={["Local Currency", "Foreign Currency", "Foreign Currency Local Currency Only"]} /></FormField></FormRow>
            <FormRow><FormField md={4}><TextField label="Print PDC Cheques" fullWidth disabled value="" /></FormField><FormField md={8}><RadioChoice label="Print PDC Cheques" value={form.printPdc} onChange={(value) => set("printPdc", value)} options={["Yes", "No"]} /></FormField></FormRow>
            <FormRow><FormField md={4}><TextField label="Check PDC Cheque Date" fullWidth disabled value="" /></FormField><FormField md={8}><RadioChoice label="Check PDC Cheque Date" value={form.checkPdcDate} onChange={(value) => set("checkPdcDate", value)} options={["Yes", "No"]} /></FormField></FormRow>
            <FormRow><FormField md={6}><TextField label="Give PDC Cheque Upto Date" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.pdcDate} onChange={(event) => set("pdcDate", event.target.value)} /></FormField></FormRow>
            <FormRow><FormField md={4}><TextField label="Print Opening Balance" fullWidth disabled value="" /></FormField><FormField md={8}><RadioChoice label="Print Opening Balance" value={form.openingBalance} onChange={(value) => set("openingBalance", value)} options={["Yes", "No"]} /></FormField></FormRow>
            <FormRow><FormField md={4}><TextField label="Print Cleared Invoices/Documents Detail" fullWidth disabled value="" /></FormField><FormField md={8}><RadioChoice label="Print cleared invoices" value={form.clearedInvoices} onChange={(value) => set("clearedInvoices", value)} options={["Yes", "No"]} /></FormField></FormRow>
            <FormRow><FormField md={12}><TextField select label="Bank Detail" fullWidth value={form.bankCode} onChange={(event) => set("bankCode", event.target.value)}><MenuItem value="">Select Bank Code</MenuItem>{banks.map((bank) => <MenuItem key={bank.code} value={bank.code}>{bank.code} — {bank.name}</MenuItem>)}</TextField></FormField></FormRow>
            <FormRow><FormField md={4}><TextField label="Print SPO Name" fullWidth disabled value="" /></FormField><FormField md={8}><RadioChoice label="Print SPO Name" value={form.printSpo} onChange={(value) => set("printSpo", value)} options={["Yes", "No"]} /></FormField></FormRow>
          </Grid>
          <Grid item xs={12} lg={4}><Box sx={{ display: "grid", gap: 1.5, alignContent: "start", height: "100%" }}><Button variant="contained" startIcon={<PictureAsPdfOutlinedIcon />} onClick={() => setShowReport(true)}>Generate PDF</Button><Button variant="outlined" startIcon={<TableViewOutlinedIcon />}>Export Excel</Button></Box></Grid>
        </Grid>
      </WorkflowSection>
    </PageShell>
  );
}

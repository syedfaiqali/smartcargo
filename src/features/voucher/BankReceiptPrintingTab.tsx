import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  TextField,
  MenuItem,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { FormRow, FormField } from "../../components/FormGrid";
import { WorkflowSection } from "../../components/WorkflowSection";
import { Voucher } from "../../domain/voucher";
import { bankRepo, partyRepo } from "../../data/masterDataService";
import { loadVoucherReportHeader } from "./voucherReportPdf";
import {
  buildVoucherPrintReport,
  createVoucherExcel,
  createVoucherPdf,
  VoucherPrintReport,
  VoucherPrintSettings,
  VoucherPrintType,
} from "./voucherPrinting";

export function BankReceiptPrintingTab({ voucher }: { voucher: Voucher }) {
  const [open, setOpen] = useState(true);
  const [settings, setSettings] = useState<VoucherPrintSettings>({
    type: "Voucher",
    currency: "PKR",
    payTo: voucher.partyName || voucher.receivedFrom || "",
    payeeAccountOnly: true,
    stamp: false,
    signatory1: "",
    signatory2: "",
  });
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<VoucherPrintReport | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const pdf = async (result: VoucherPrintReport) => createVoucherPdf(result,
    result.layout.type.includes("Note") ? await loadVoucherReportHeader() : undefined);
  useEffect(() => {
    if (!preview) { setPreviewUrl(""); return; }
    let active = true;
    let url = "";
    setPreviewUrl("");
    pdf(preview).then(document => {
      if (!active) return;
      url = URL.createObjectURL(document.output("blob"));
      setPreviewUrl(url);
    }).catch(() => { if (active) setError("The report preview could not be loaded. Please try again."); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [preview]);
  const change = <K extends keyof VoucherPrintSettings>(
    key: K,
    value: VoucherPrintSettings[K],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setError("");
    setPreview(null);
  };
  const report = () => {
    try {
      const result = buildVoucherPrintReport(voucher, settings, {
        partyAddress: partyRepo.list().find(party => party.code === voucher.partyCode)?.address,
        bankDetail: bankRepo.list().find(bank => bank.code === voucher.bankCode)?.accountDetail,
      });
      setError("");
      return result;
    } catch (exception) {
      setError((exception as Error).message);
      return null;
    }
  };
  const filename =
    `${voucher.voucherNo}-${settings.type.replace(/ /g, "-")}${settings.type.includes("Note") ? `-${settings.currency}` : ""}`.replace(
      /[^a-zA-Z0-9_-]/g,
      "_",
    );
  const download = async (excel: boolean) => {
    const result = report();
    if (!result) return;
    setBusy(true);
    try {
      if (!excel) (await pdf(result)).save(`${filename}.pdf`);
      else {
        const blob = new Blob([createVoucherExcel(result)], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${filename}.xlsx`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      setError("The document could not be exported. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  const print = async () => {
    const result = report();
    if (!result) return;
    // Open synchronously during the click so loading the letterhead cannot
    // cause the browser to reject the later print window as an unsolicited popup.
    const tab = window.open("", "_blank");
    if (!tab) { setError("Allow popups to open the print document, or download the PDF and print it."); return; }
    tab.opener = null;
    setBusy(true);
    try {
      const document = await pdf(result);
      document.autoPrint();
      const url = URL.createObjectURL(document.output("blob"));
      tab.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      tab.close();
      setError(
        "The print document could not be opened. Download the PDF to print it.",
      );
    } finally {
      setBusy(false);
    }
  };
  const actions = (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      <Button
        variant="outlined"
        startIcon={<VisibilityOutlinedIcon />}
        onClick={() => {
          const result = report();
          if (result) setPreview(result);
        }}
      >
        Preview
      </Button>
      <Button
        disabled={busy}
        variant="contained"
        startIcon={<PictureAsPdfIcon />}
        onClick={() => download(false)}
      >
        Download PDF
      </Button>
      <Button
        disabled={busy}
        variant="outlined"
        color="success"
        startIcon={<TableViewIcon />}
        onClick={() => download(true)}
      >
        Export Excel
      </Button>
      <Button disabled={busy} variant="outlined" startIcon={<PrintIcon />} onClick={print}>
        Print
      </Button>
    </Stack>
  );
  return (
    <>
      <WorkflowSection
        title="Printing"
        subtitle="Choose the document and print settings"
        open={open}
        onToggle={() => setOpen(!open)}
      >
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Branch"
                fullWidth
                value={voucher.branch}
                disabled
              >
                <MenuItem value={voucher.branch}>{voucher.branch}</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <TextField
                label="Voucher No."
                fullWidth
                value={voucher.voucherNo}
                InputProps={{ readOnly: true }}
              />
            </FormField>
          </FormRow>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <FormLabel>Print</FormLabel>
            <RadioGroup
              sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }, gap: 1.5, mt: 1 }}
              value={settings.type}
              onChange={(event) =>
                change("type", event.target.value as VoucherPrintType)
              }
            >
              {["Voucher", "Debit Note", "Credit Note", "Cheque"].map(
                (type) => (
                  <FormControlLabel
                    sx={{
                      m: 0, p: 1.5, minHeight: 66, border: "1px solid", borderRadius: 2,
                      borderColor: settings.type === type ? "primary.main" : "divider",
                      bgcolor: settings.type === type ? "action.selected" : "background.paper",
                      transition: "border-color 160ms, background-color 160ms",
                      "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                      "&:focus-within": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                      "& .MuiFormControlLabel-label": { fontWeight: settings.type === type ? 700 : 500 },
                    }}
                    key={type}
                    value={type}
                    control={<Radio />}
                    label={type}
                  />
                ),
              )}
            </RadioGroup>
          </FormControl>
          {(settings.type === "Debit Note" ||
            settings.type === "Credit Note") && (
            <Box>
              <FormControl sx={{ mb: 2 }}>
                <FormLabel>Print Currency</FormLabel>
                <RadioGroup
                  row
                  value={settings.currency}
                  onChange={(event) =>
                    change(
                      "currency",
                      event.target.value as VoucherPrintSettings["currency"],
                    )
                  }
                >
                  <FormControlLabel
                    value="PKR"
                    control={<Radio />}
                    label="PKR"
                  />
                  <FormControlLabel
                    value="FOREIGN"
                    control={<Radio />}
                    label="Foreign Currency"
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          )}
          {settings.type === "Cheque" && (
            <>
              <FormRow>
                <FormField md={12} sm={12}>
                  <TextField
                    label="Pay To"
                    fullWidth
                    required
                    value={settings.payTo}
                    onChange={(event) => change("payTo", event.target.value)}
                  />
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={6}>
                  <FormControl>
                    <FormLabel>Print Payees A/C Only</FormLabel>
                    <RadioGroup
                      row
                      value={settings.payeeAccountOnly ? "Y" : "N"}
                      onChange={(event) =>
                        change("payeeAccountOnly", event.target.value === "Y")
                      }
                    >
                      <FormControlLabel
                        value="Y"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="N"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                </FormField>
                <FormField md={6}>
                  <FormControl>
                    <FormLabel>Print Stamp</FormLabel>
                    <RadioGroup
                      row
                      value={settings.stamp ? "Y" : "N"}
                      onChange={(event) =>
                        change("stamp", event.target.value === "Y")
                      }
                    >
                      <FormControlLabel
                        value="Y"
                        control={<Radio />}
                        label="Yes"
                      />
                      <FormControlLabel
                        value="N"
                        control={<Radio />}
                        label="No"
                      />
                    </RadioGroup>
                  </FormControl>
                </FormField>
              </FormRow>
              <FormRow>
                <FormField md={6}>
                  <TextField
                    label="Signatory (1) Designation"
                    fullWidth
                    value={settings.signatory1}
                    onChange={(event) =>
                      change("signatory1", event.target.value)
                    }
                  />
                </FormField>
                <FormField md={6}>
                  <TextField
                    label="Signatory (2) Designation"
                    fullWidth
                    value={settings.signatory2}
                    onChange={(event) =>
                      change("signatory2", event.target.value)
                    }
                  />
                </FormField>
              </FormRow>
            </>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2, pt: 2.5, borderTop: "1px solid", borderColor: "divider", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: "primary.main" }}>{settings.type === "Voucher" ? "Bank Payment Voucher" : settings.type === "Cheque" ? "Payee's Account Only" : `${settings.type} - ${voucher.branch}`}</Typography>
              <Typography variant="body2" color="text.secondary">Preview the report, then print or download.</Typography>
            </Box>
            {actions}
          </Box>
        </Paper>
      </WorkflowSection>
      <Dialog
        open={!!preview}
        onClose={() => setPreview(null)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          {preview?.title} — {preview?.reference}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {previewUrl ? <Box component="iframe" title="Report PDF preview" src={previewUrl} sx={{ width: "100%", height: "70vh", border: 0 }} /> : <Typography sx={{ mb: 2 }}>Loading report preview…</Typography>}
          {preview && (
            <Box component="details" sx={{ mt: 2 }}>
              <Box component="summary" sx={{ cursor: "pointer", fontWeight: 600 }}>Report data</Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Masum Logistics
              </Typography>
              {preview.metadata.map(([label, value], index) => (
                <Typography key={index} sx={{ mb: 0.5 }}>
                  <strong>{label}:</strong>{" "}
                  {typeof value === "number"
                    ? value.toLocaleString("en-PK", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : value}
                </Typography>
              ))}
              {preview.tables.map((table, index) => (
                <Box key={index} sx={{ mt: 3 }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>
                    {table.title}
                  </Typography>
                  <Paper variant="outlined" sx={{ overflowX: "auto" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {table.headers.map((header) => (
                            <TableCell key={header}>{header}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {table.rows.map((row, r) => (
                          <TableRow key={r}>
                            {row.map((cell, c) => (
                              <TableCell key={c}>
                                {typeof cell === "number"
                                  ? cell.toLocaleString("en-PK", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  : cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Paper>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          {actions}
          <Button onClick={() => setPreview(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

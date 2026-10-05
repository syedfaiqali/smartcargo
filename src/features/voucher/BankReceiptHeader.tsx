import { confirmDelete } from '../../components/deleteConfirmation';
import { Dispatch, SetStateAction, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { DateField } from "../../components/DateField";
import { NumberField } from "../../components/NumberField";
import { FormRow, FormField, SectionHeader } from "../../components/FormGrid";
import { WorkflowSection } from "../../components/WorkflowSection";
import { Voucher } from "../../domain/voucher";

interface Props {
  voucher: Voucher;
  editable: boolean;
  clearedTotal: number;
  onChange: Dispatch<SetStateAction<Voucher | null>>;
}

export function BankReceiptHeader({
  voucher,
  editable,
  clearedTotal,
  onChange,
}: Props) {
  const [open, setOpen] = useState(true);
  const [attachmentError, setAttachmentError] = useState("");
  const set = <K extends keyof Voucher>(key: K, value: Voucher[K]) =>
    onChange((current) =>
      current?.id === voucher.id ? { ...current, [key]: value } : current,
    );
  const debit = voucher.journalLines.reduce((sum, line) => sum + line.debit, 0);
  const credit = voucher.journalLines.reduce(
    (sum, line) => sum + line.credit,
    0,
  );

  const attach = (file?: File) => {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(
        file.type,
      ) ||
      file.size > 2 * 1024 * 1024
    ) {
      setAttachmentError("Choose a PNG, JPG, WebP or PDF file up to 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      set("attachment", { name: file.name, dataUrl: String(reader.result) });
      setAttachmentError("");
    };
    reader.onerror = () =>
      setAttachmentError("The file could not be read. Please try again.");
    reader.readAsDataURL(file);
  };

  return (
    <WorkflowSection
      title="Receipt Details"
      subtitle="Enter receipt and cheque details, and attach a supporting document"
      open={open}
      onToggle={() => setOpen(!open)}
    >
      <Grid container spacing={2} alignItems="stretch">
        <Grid item xs={12} lg={5}>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Branch"
                fullWidth
                value={voucher.branch}
                disabled={!editable}
                onChange={(event) => set("branch", event.target.value)}
              >
                <MenuItem value="KHI">KHI</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <DateField
                label="Entry Date"
                value={voucher.entryDate ?? voucher.createdAt.slice(0, 10)}
                disabled={!editable}
                onChange={(value) => set("entryDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <NumberField
                 label="Voucher No."
                 fullWidth
                 value={voucher.voucherNo}
                 disabled={!editable}
                 onChange={(event) => set("voucherNo", event.target.value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Voucher Date"
                value={voucher.voucherDate}
                disabled={!editable}
                onChange={(value) => set("voucherDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField sm={12} md={12}>
              <TextField
                label="Received From"
                fullWidth
                value={voucher.receivedFrom ?? voucher.partyName}
                disabled={!editable}
                onChange={(event) => set("receivedFrom", event.target.value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                label="Cheque No."
                fullWidth
                value={voucher.chequeNo ?? ""}
                disabled={!editable}
                onChange={(event) => set("chequeNo", event.target.value)}
              />
            </FormField>
            <FormField md={6}>
              <DateField
                label="Cheque Date"
                value={voucher.chequeDate ?? ""}
                disabled={!editable}
                onChange={(value) => set("chequeDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Cheque Status"
                fullWidth
                value={voucher.chequeStatus ?? "UNCLEARED"}
                disabled={!editable}
                onChange={(event) =>
                  set(
                    "chequeStatus",
                    event.target.value as Voucher["chequeStatus"],
                  )
                }
              >
                <MenuItem value="UNCLEARED">Un Cleared</MenuItem>
                <MenuItem value="CLEARED">Cleared</MenuItem>
                <MenuItem value="RETURNED">Returned</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                <MenuItem value="BOUNCED">Bounced</MenuItem>
              </TextField>
            </FormField>
            <FormField md={6}>
              <DateField
                label="Clearing Date"
                value={voucher.clearingDate ?? ""}
                disabled={!editable}
                onChange={(value) => set("clearingDate", value)}
              />
            </FormField>
          </FormRow>
          <FormRow>
            <FormField md={6}>
              <TextField
                select
                label="Cheque Type"
                fullWidth
                value={voucher.chequeType ?? "OPEN"}
                disabled={!editable}
                onChange={(event) =>
                  set("chequeType", event.target.value as Voucher["chequeType"])
                }
              >
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="PAYEE_ACCOUNT_ONLY">Payee A/C Only</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="ONLINE_TRANSFER">Online Transfer</MenuItem>
                <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                <MenuItem value="PO">PO</MenuItem>
                <MenuItem value="TT">TT</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="PERSONAL_CHEQUE">Personal Cheque</MenuItem>
                <MenuItem value="ONLINE_PERSONAL">Online Personal</MenuItem>
                <MenuItem value="DIGITAL_WALLET">Digital Wallet</MenuItem>
                <MenuItem value="ATM_TRANSFER">ATM Transfer</MenuItem>
                <MenuItem value="RTGS">RTGS</MenuItem>
                <MenuItem value="IBFT">IBFT</MenuItem>
                <MenuItem value="CROSSED">Crossed</MenuItem>
              </TextField>
            </FormField>
          </FormRow>
        </Grid>
        <Grid item xs={12} sm={5} lg={3}>
          <Paper
            variant="outlined"
            sx={{ p: 1.5, "& > :first-of-type": { mt: 0 } }}
          >
            <SectionHeader>Voucher Total</SectionHeader>
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <NumberField
                label="Debit"
                fullWidth
                value={debit.toFixed(2)}
                InputProps={{ readOnly: true }}
              />
              <NumberField
                label="Credit"
                fullWidth
                value={credit.toFixed(2)}
                InputProps={{ readOnly: true }}
              />
              <NumberField
                label="Difference"
                fullWidth
                value={(debit - credit).toFixed(2)}
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                  "& .MuiInputLabel-root": { color: "primary.main" },
                }}
              />
            </Box>
            <SectionHeader>Cleared Invoices Total</SectionHeader>
            <NumberField
              label="Cleared Amount"
              fullWidth
              value={clearedTotal.toFixed(2)}
              InputProps={{ readOnly: true }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={7} lg={4}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              minHeight: 280,
              height: "100%",
              boxSizing: "border-box",
              borderStyle: "dashed",
              borderColor: "primary.light",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
              textAlign: "center",
            }}
          >
            {voucher.attachment?.dataUrl.startsWith("data:image/") ? (
              <Box
                component="img"
                src={voucher.attachment.dataUrl}
                alt={voucher.attachment.name}
                sx={{ maxWidth: "100%", height: 160, objectFit: "contain" }}
              />
            ) : (
              <ImageOutlinedIcon
                sx={{ fontSize: 80, color: "action.disabled" }}
              />
            )}
            <Typography sx={{ fontWeight: 700 }}>Attachment</Typography>
            {voucher.attachment ? (
              <Typography
                component="a"
                href={voucher.attachment.dataUrl}
                download={voucher.attachment.name}
                variant="body2"
                sx={{ overflowWrap: "anywhere", maxWidth: "100%" }}
              >
                {voucher.attachment.name}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                Attach a cheque image or supporting document.
              </Typography>
            )}
            <Button
              component="label"
              variant="outlined"
              startIcon={<AttachFileOutlinedIcon />}
              disabled={!editable}
            >
              {voucher.attachment ? "Replace File" : "Choose File"}
              <input
                hidden
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(event) => {
                  void attach(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </Button>
            {voucher.attachment && (
              <Button
                color="error"
                disabled={!editable}
                onClick={() => confirmDelete(() => set("attachment", undefined))}
              >
                Remove
              </Button>
            )}
            <Typography variant="caption" color="text.secondary">
              PNG, JPG, WebP or PDF · Up to 2 MB
            </Typography>
            {attachmentError && (
              <Alert severity="error">{attachmentError}</Alert>
            )}
          </Paper>
        </Grid>
      </Grid>
    </WorkflowSection>
  );
}

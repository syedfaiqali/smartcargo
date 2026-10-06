import { confirmDelete } from "../../components/deleteConfirmation";
import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import { NumberField } from "../../components/NumberField";
import { SectionHeader } from "../../components/FormGrid";
import { Voucher } from "../../domain/voucher";

import type { Dispatch, SetStateAction } from "react";

export interface VoucherDetailsProps {
  voucher: Voucher;
  editable: boolean;
  clearedTotal: number;
  onChange: Dispatch<SetStateAction<Voucher | null>>;
}

export function VoucherDetailsTotals({
  voucher,
  clearedTotal,
}: Pick<VoucherDetailsProps, "voucher" | "clearedTotal">) {
  const debit = voucher.journalLines.reduce((sum, line) => sum + line.debit, 0);
  const credit = voucher.journalLines.reduce(
    (sum, line) => sum + line.credit,
    0,
  );

  return (
    <Paper variant="outlined" sx={{ p: 1.5, "& > :first-of-type": { mt: 0 } }}>
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
  );
}

export function VoucherAttachment({
  voucher,
  editable,
  onChange,
  emptyMessage,
}: Omit<VoucherDetailsProps, "clearedTotal"> & { emptyMessage: string }) {
  const [attachmentError, setAttachmentError] = useState("");
  const set = <K extends keyof Voucher>(key: K, value: Voucher[K]) =>
    onChange((current) =>
      current?.id === voucher.id ? { ...current, [key]: value } : current,
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
        <ImageOutlinedIcon sx={{ fontSize: 80, color: "action.disabled" }} />
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
          {emptyMessage}
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
      {attachmentError && <Alert severity="error">{attachmentError}</Alert>}
    </Paper>
  );
}

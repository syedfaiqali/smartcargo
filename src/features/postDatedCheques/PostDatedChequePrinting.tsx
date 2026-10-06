import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableViewIcon from "@mui/icons-material/TableView";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { WorkflowSection } from "../../components/WorkflowSection";
import { FormRow, FormField } from "../../components/FormGrid";
import { PostDatedCheque } from "../../domain/postDatedCheque";
import {
  createPostDatedChequeExcel,
  createPostDatedChequePdf,
} from "./postDatedChequeReports";

export function PostDatedChequePrinting({
  cheque,
}: {
  cheque: PostDatedCheque;
}) {
  const [open, setOpen] = useState(true);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );
  const run = (action: "preview" | "pdf" | "excel") => {
    setError("");
    try {
      const filename = cheque.receiptNo.replace(/[^a-zA-Z0-9_-]/g, "_");
      if (action === "pdf")
        createPostDatedChequePdf(cheque).save(`${filename}.pdf`);
      else if (action === "preview")
        setPreviewUrl(
          URL.createObjectURL(createPostDatedChequePdf(cheque).output("blob")),
        );
      else {
        const url = URL.createObjectURL(
          new Blob([createPostDatedChequeExcel(cheque)], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          }),
        );
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `${filename}.xlsx`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch {
      setError(
        "The cheque receipt report could not be generated. Please try again.",
      );
    }
  };
  return (
    <WorkflowSection
      title="Printing"
      subtitle="Preview or export this cheque receipt"
      open={open}
      onToggle={() => setOpen(!open)}
    >
      <FormRow>
        <FormField>
          <TextField
            label="Branch"
            fullWidth
            value={cheque.branch}
            InputProps={{ readOnly: true }}
          />
        </FormField>
        <FormField>
          <TextField
            label="Receipt No."
            fullWidth
            value={cheque.receiptNo}
            InputProps={{ readOnly: true }}
          />
        </FormField>
      </FormRow>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {[
          {
            action: "preview" as const,
            label: "Preview",
            icon: <VisibilityOutlinedIcon />,
          },
          {
            action: "pdf" as const,
            label: "Download PDF",
            icon: <PictureAsPdfIcon />,
          },
          {
            action: "excel" as const,
            label: "Download Excel",
            icon: <TableViewIcon />,
          },
        ].map((item) => (
          <Tooltip key={item.action} title={item.label}>
            <IconButton
              aria-label={item.label}
              color="primary"
              onClick={() => run(item.action)}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
              }}
            >
              {item.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Stack>
      {error && <Alert severity="error">{error}</Alert>}
      <Dialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl("")}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Cheque Receipt Preview — {cheque.receiptNo}</DialogTitle>
        <DialogContent>
          <Box
            component="iframe"
            title="Cheque receipt PDF preview"
            src={previewUrl}
            sx={{ width: "100%", height: "70vh", border: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewUrl("")}>Close</Button>
        </DialogActions>
      </Dialog>
    </WorkflowSection>
  );
}

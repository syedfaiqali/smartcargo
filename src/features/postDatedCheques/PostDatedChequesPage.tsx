import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Chip, Snackbar, Stack, Tab, Tabs } from "@mui/material";
import { PageShell } from "../../layout/PageShell";
import {
  TransactionToolbar,
  ToolbarAction,
} from "../../components/TransactionToolbar";
import { confirmDelete } from "../../components/deleteConfirmation";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  patchPostDatedChequesState,
  updatePostDatedChequeDraft,
} from "../../store/postDatedChequesSlice";
import { patchBankReceiptState } from "../../store/bankReceiptSlice";
import { voucherRepo } from "../../data/voucherService";
import {
  createPostDatedCheque,
  filterPostDatedCheques,
  postDatedChequeRepo,
  savePostDatedCheque,
} from "../../data/postDatedChequeService";
import {
  chequeStatuses,
  chequeToDraft,
  emptyChequeFilters,
  PostDatedCheque,
} from "../../domain/postDatedCheque";
import { PostDatedChequeEntry } from "./PostDatedChequeEntry";
import { PostDatedChequeInvoices } from "./PostDatedChequeInvoices";
import { PostDatedChequeFilters } from "./PostDatedChequeFilters";
import { PostDatedChequeGrid } from "./PostDatedChequeGrid";
import { PostDatedChequePrinting } from "./PostDatedChequePrinting";

export function PostDatedChequesPage() {
  const state = useAppSelector((root) => root.postDatedCheques);
  const dispatch = useAppDispatch(),
    navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { draft, view, editable, tab, selected, filters, appliedFilters } =
    state;
  const all = postDatedChequeRepo.list();
  const rows = filterPostDatedCheques(all, appliedFilters);
  const patch = (value: Parameters<typeof patchPostDatedChequesState>[0]) =>
    dispatch(patchPostDatedChequesState(value));
  const refresh = () => patch({ revision: state.revision + 1 });
  const back = () => {
    patch({ view: "list", editable: false, selected: [] });
    setMessage(null);
  };
  const load = (cheque: PostDatedCheque, editing = false, printing = false) => {
    patch({
      draft: chequeToDraft(cheque),
      editable: editing,
      view: printing ? "printing" : "entry",
      tab: 0,
    });
    setMessage(null);
  };
  const startNew = (branch = "KHI") => {
    patch({
      draft: createPostDatedCheque(branch),
      editable: true,
      view: "entry",
      tab: 0,
      selected: [],
    });
    setMessage(null);
  };
  const remove = (cheque: PostDatedCheque) => {
    try {
      postDatedChequeRepo.remove(cheque.id);
      patch({
        revision: state.revision + 1,
        selected: selected.filter((id) => id !== cheque.id),
        ...(draft?.id === cheque.id
          ? { draft: null, view: "list" as const, editable: false }
          : {}),
      });
      setToast(`Receipt ${cheque.receiptNo} deleted.`);
    } catch {
      setMessage("The receipt could not be deleted. Please try again.");
    }
  };
  const action = (action: ToolbarAction) => {
    if (action === "new") startNew();
    else if (action === "search") back();
    else if (action === "edit") patch({ editable: true });
    else if (action === "cancel") {
      const saved = draft && postDatedChequeRepo.get(draft.id);
      if (saved) load(saved);
      else back();
    } else if (action === "save" && draft && editable) {
      try {
        const saved = savePostDatedCheque(draft);
        refresh();
        startNew(saved.branch);
        setToast(`Receipt ${saved.receiptNo} saved successfully.`);
      } catch (error) {
        setMessage((error as Error).message);
      }
    } else if (action === "delete" && draft) {
      const saved = postDatedChequeRepo.get(draft.id);
      if (saved) remove(saved);
    } else if (
      ["top", "bottom", "prev", "next"].includes(action) &&
      all.length
    ) {
      const index = all.findIndex((row) => row.id === draft?.id);
      const target =
        action === "top"
          ? 0
          : action === "bottom"
            ? all.length - 1
            : action === "prev"
              ? Math.max(0, index - 1)
              : Math.min(all.length - 1, index + 1);
      load(all[target]);
    }
  };
  const openBankReceipt = () => {
    if (!draft) return;
    const receipt = voucherRepo.find(
      (row) =>
        row.kind === "RECEIPT" &&
        row.branch === draft.branch &&
        (row.voucherNo === draft.bankReceiptNo.trim() ||
          row.voucherNo.endsWith(`-${draft.bankReceiptNo.trim()}`)) &&
        (!draft.bankReceiptYear ||
          row.voucherDate.slice(0, 4) === draft.bankReceiptYear),
    )[0];
    if (!receipt) {
      setMessage(
        "No matching bank receipt was found for this branch, receipt number and year.",
      );
      return;
    }
    dispatch(
      patchBankReceiptState({
        voucher: receipt,
        editable: false,
        isPrintingView: false,
        tab: 0,
        message: null,
      }),
    );
    navigate("/finance/bank-receipt-voucher");
  };
  return (
    <PageShell
      title="Post Dated Cheques Received"
      breadcrumbs={["Finance", "Post Dated Cheques Received"]}
      actions={
        view !== "list" ? (
          <Button variant="outlined" onClick={back}>
            Back to List
          </Button>
        ) : undefined
      }
    >
      <Snackbar
        open={!!toast}
        autoHideDuration={4500}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        onClose={(_, reason) => {
          if (reason !== "clickaway") setToast(null);
        }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setToast(null)}
        >
          {toast}
        </Alert>
      </Snackbar>
      {message && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}
      {view !== "printing" && (
        <Stack direction="row" flexWrap="wrap" spacing={1}>
          <TransactionToolbar
            actions={
              view === "list"
                ? ["new"]
                : [
                    "search",
                    "top",
                    "bottom",
                    "prev",
                    "next",
                    "new",
                    "save",
                    "edit",
                    "delete",
                    "cancel",
                  ]
            }
            disabledActions={[
              ...(!editable ? ["save" as const] : []),
              ...(!draft || !postDatedChequeRepo.get(draft.id)
                ? ["delete" as const]
                : []),
              ...(!all.length
                ? [
                    "top" as const,
                    "bottom" as const,
                    "prev" as const,
                    "next" as const,
                  ]
                : []),
            ]}
            onAction={action}
          />
          {view === "entry" && (
            <Button
              variant="outlined"
              disabled={!draft?.bankReceiptNo.trim()}
              onClick={openBankReceipt}
              sx={{ alignSelf: "flex-start", mb: 2 }}
            >
              BRV
            </Button>
          )}
        </Stack>
      )}
      {view === "list" ? (
        <>
          <PostDatedChequeFilters
            filters={filters}
            onChange={(filters) => patch({ filters })}
            onApply={() => {
              if (
                filters.startDate &&
                filters.endDate &&
                filters.startDate > filters.endDate
              ) {
                setMessage("Starting Date cannot be after Ending Date.");
                return;
              }
              patch({ appliedFilters: { ...filters }, selected: [] });
              setMessage(null);
            }}
            onClear={() => {
              patch({
                filters: emptyChequeFilters(),
                appliedFilters: emptyChequeFilters(),
                selected: [],
              });
              setMessage(null);
            }}
          />
          {selected.length > 0 && (
            <Button
              color="error"
              variant="outlined"
              sx={{ mb: 2 }}
              onClick={() =>
                confirmDelete(() => {
                  try {
                    for (const row of all.filter((row) =>
                      selected.includes(row.id),
                    ))
                      postDatedChequeRepo.remove(row.id);
                    patch({
                      selected: [],
                      revision: state.revision + 1,
                      ...(draft && selected.includes(draft.id)
                        ? { draft: null }
                        : {}),
                    });
                    setToast("Selected cheque receipts deleted.");
                  } catch {
                    refresh();
                    setMessage(
                      "Some receipts could not be deleted. Please try again.",
                    );
                  }
                }, `Delete ${selected.length} selected cheque receipts?`)
              }
            >
              Delete Selected ({selected.length})
            </Button>
          )}
          <PostDatedChequeGrid
            rows={rows}
            selected={selected}
            onSelect={(selected) => patch({ selected })}
            onOpen={(row) => load(row)}
            onEdit={(row) => load(row, true)}
            onDelete={remove}
            onPrint={(row) => load(row, false, true)}
          />
        </>
      ) : (
        draft && (
          <>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Chip color="primary" label={draft.receiptNo} />
              <Chip
                label={chequeStatuses[draft.chequeStatus]}
                variant="outlined"
              />
              {editable && (
                <Chip color="info" label="EDITING" variant="outlined" />
              )}
            </Stack>
            {view === "printing" ? (
              <PostDatedChequePrinting
                key={draft.id}
                cheque={{
                  ...draft,
                  amount: Number(draft.amount),
                  exchangeRate: Number(draft.exchangeRate),
                }}
              />
            ) : (
              <>
                <Tabs
                  value={tab}
                  onChange={(_, nextTab) => patch({ tab: nextTab })}
                  aria-label="Cheque receipt tabs"
                  sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
                >
                  <Tab label="Entry" />
                  <Tab label="Invoices" />
                </Tabs>
                {tab === 0 ? (
                  <PostDatedChequeEntry
                    key={draft.id}
                    draft={draft}
                    editable={editable}
                    onChange={(value) =>
                      dispatch(updatePostDatedChequeDraft(value))
                    }
                  />
                ) : (
                  <PostDatedChequeInvoices
                    key={draft.id}
                    draft={draft}
                    editable={editable}
                    onChange={(value) =>
                      dispatch(updatePostDatedChequeDraft(value))
                    }
                  />
                )}
              </>
            )}
          </>
        )
      )}
    </PageShell>
  );
}

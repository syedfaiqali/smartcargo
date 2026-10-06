import { isValid, parseISO } from "date-fns";
import { Repository } from "./repository";
import { findReceivableSources } from "./voucherService";
import {
  bankRepo,
  currencyRepo,
  foreignAgentRepo,
  partyRepo,
} from "./masterDataService";
import {
  chequeStatuses,
  chequeTypes,
  chequeToDraft,
  PostDatedCheque,
  PostDatedChequeDraft,
  ChequeDetailFilters,
} from "../domain/postDatedCheque";

export const postDatedChequeRepo = new Repository<PostDatedCheque>(
  "postDatedChequesReceived",
);
export const nextChequeReceiptNo = (branch: string) => {
  const numbers = postDatedChequeRepo
    .find((row) => row.branch === branch)
    .map((row) => Number(row.receiptNo.split("-").pop()))
    .filter(Number.isFinite);
  return `${branch}-PDC-${Math.max(100, ...numbers) + 1}`;
};
export function createPostDatedCheque(branch = "KHI"): PostDatedChequeDraft {
  const now = new Date().toISOString();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return chequeToDraft({
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    branch,
    receiptNo: nextChequeReceiptNo(branch),
    receiptDate: today,
    chequeNo: "",
    chequeDate: "",
    amount: 0,
    partyCode: "",
    partyName: "",
    remarks: "",
    bankCode: "",
    depositedDate: "",
    slipNo: "",
    chequeType: "OPEN",
    chequeStatus: "UNCLEARED",
    clearedDate: "",
    bankReceiptNo: "",
    bankReceiptYear: "",
    currencyCode: "PKR",
    exchangeRate: 1,
    invoices: [],
  });
}
export const chequePartyOptions = () =>
  [...partyRepo.list(), ...foreignAgentRepo.list()].map((party) => ({
    value: party.code,
    label: `${party.code} — ${party.name}`,
    name: party.name,
  }));
const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value));
export const invoiceTotal = (cheque: Pick<PostDatedCheque, "invoices">) =>
  cheque.invoices.reduce((sum, line) => sum + line.amountCleared, 0);

export function validatePostDatedCheque(
  draft: PostDatedChequeDraft,
): string | null {
  if (
    !draft.branch ||
    !draft.chequeNo.trim() ||
    !draft.partyCode ||
    !draft.bankCode
  )
    return "Complete Branch, Cheque No., Party Code and Bank Code before saving.";
  if (!validDate(draft.receiptDate) || !validDate(draft.chequeDate))
    return "Enter valid Receipt Date and Cheque Date values.";
  const amount = Number(draft.amount),
    rate = Number(draft.exchangeRate);
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Number.isFinite(rate) ||
    rate <= 0
  )
    return "Enter a positive Cheque Amount and Exchange Rate.";
  if (
    !chequePartyOptions().some((party) => party.value === draft.partyCode) ||
    !bankRepo.list().some((bank) => bank.code === draft.bankCode) ||
    !currencyRepo
      .list()
      .some((currency) => currency.code === draft.currencyCode)
  )
    return "Select a valid party, bank and currency.";
  if (
    !(draft.chequeStatus in chequeStatuses) ||
    !(draft.chequeType in chequeTypes)
  )
    return "Select a valid cheque status and type.";
  if (
    (draft.depositedDate && !validDate(draft.depositedDate)) ||
    (draft.clearedDate && !validDate(draft.clearedDate))
  )
    return "Enter valid Deposited Date and Cleared Date values.";
  if (
    ["DEPOSITED", "CLEARED"].includes(draft.chequeStatus) &&
    !draft.depositedDate
  )
    return "Enter the Deposited Date for a deposited or cleared cheque.";
  if (draft.chequeStatus === "CLEARED" && !draft.clearedDate)
    return "Enter the Cleared Date for a cleared cheque.";
  if (
    draft.depositedDate &&
    (draft.depositedDate < draft.receiptDate ||
      draft.depositedDate < draft.chequeDate)
  )
    return "Deposited Date cannot be before Receipt Date or Cheque Date.";
  if (
    draft.clearedDate &&
    (!draft.depositedDate || draft.clearedDate < draft.depositedDate)
  )
    return "Cleared Date must be on or after Deposited Date.";
  if (draft.bankReceiptYear && !/^\d{4}$/.test(draft.bankReceiptYear))
    return "Enter a four-digit BRV Year.";
  if (
    postDatedChequeRepo
      .list()
      .some(
        (row) =>
          row.id !== draft.id &&
          row.branch === draft.branch &&
          row.bankCode === draft.bankCode &&
          row.chequeNo === draft.chequeNo.trim(),
      )
  )
    return "This cheque number already exists for the selected branch and bank.";
  if (invoiceTotal(draft) > amount + 0.005)
    return "Invoice allocations cannot exceed the Cheque Amount.";
  const sources = findReceivableSources(draft.partyCode);
  const previous = postDatedChequeRepo.get(draft.id);
  const keys = new Set<string>();
  for (const line of draft.invoices) {
    const key = `${line.sourceType}:${line.sourceId}`;
    const source = sources.find(
      (row) => row.id === line.sourceId && row.type === line.sourceType,
    );
    const savedLine =
      previous?.partyCode === draft.partyCode
        ? previous.invoices.find(
            (item) =>
              item.sourceId === line.sourceId &&
              item.sourceType === line.sourceType,
          )
        : undefined;
    // A linked BRV may have settled an invoice after this cheque was recorded.
    const allowedAmount = Math.max(
      source?.balance ?? 0,
      savedLine?.amountCleared ?? 0,
    );
    if (
      keys.has(key) ||
      (!source && !savedLine) ||
      !Number.isFinite(line.amountCleared) ||
      line.amountCleared <= 0 ||
      line.amountCleared > allowedAmount + 0.005
    )
      return `Check the outstanding balance and allocation for ${line.sourceDocNo}.`;
    keys.add(key);
  }
  return null;
}
export function savePostDatedCheque(
  draft: PostDatedChequeDraft,
): PostDatedCheque {
  const error = validatePostDatedCheque(draft);
  if (error) throw new Error(error);
  const existing = postDatedChequeRepo.get(draft.id);
  return postDatedChequeRepo.save({
    ...draft,
    receiptNo: existing?.receiptNo ?? nextChequeReceiptNo(draft.branch),
    chequeNo: draft.chequeNo.trim(),
    amount: Number(draft.amount),
    exchangeRate: Number(draft.exchangeRate),
  });
}
export function filterPostDatedCheques(
  rows: PostDatedCheque[],
  filters: ChequeDetailFilters,
) {
  return rows.filter(
    (row) =>
      (!filters.branch || row.branch === filters.branch) &&
      (!filters.partyCode || row.partyCode === filters.partyCode) &&
      (!filters.chequeNo.trim() ||
        row.chequeNo
          .toLowerCase()
          .includes(filters.chequeNo.trim().toLowerCase())) &&
      (filters.status === "ALL" || row.chequeStatus === filters.status) &&
      (!filters.startDate || row[filters.dateField] >= filters.startDate) &&
      (!filters.endDate || row[filters.dateField] <= filters.endDate),
  );
}

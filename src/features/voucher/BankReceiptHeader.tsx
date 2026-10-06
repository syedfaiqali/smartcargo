import { JournalDetails } from "./JournalDetails";
import { ReceiptDetails } from "./ReceiptDetails";
import type { VoucherDetailsProps } from "./VoucherDetailsShared";

/** Compatibility entry point for callers of the former combined header. */
export function BankReceiptHeader(props: VoucherDetailsProps) {
  return props.voucher.kind === "JOURNAL" ? (
    <JournalDetails {...props} />
  ) : (
    <ReceiptDetails {...props} />
  );
}

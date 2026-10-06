import { VoucherWorkflowPage } from "./VoucherWorkflowPage";

export function JournalVoucherPage({
  title = "JVR - Journal Voucher",
}: {
  title?: string;
}) {
  return <VoucherWorkflowPage kind="JOURNAL" title={title} />;
}

import { analysisCodeRepo } from "./financeSetupService";
import { voucherRepo } from "./voucherService";
import type { SearchFieldOption } from "../components/SearchField";

/** Include previously saved codes so existing vouchers remain selectable. */
export function getAnalysisCodeOptions(): SearchFieldOption[] {
  const options = new Map<string, SearchFieldOption>();
  for (const analysis of analysisCodeRepo.list()) {
    options.set(analysis.code, {
      value: analysis.code,
      label: `${analysis.code} — ${analysis.name}`,
      description: analysis.name,
    });
  }
  for (const voucher of voucherRepo.list()) {
    for (const code of [
      voucher.analysisCode,
      ...(voucher.receiptEntryLines ?? []).map((line) => line.analysisCode),
    ]) {
      if (code && !options.has(code))
        options.set(code, { value: code, label: code });
    }
  }
  return [...options.values()];
}

const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');

// Use isolated in-memory storage: this check never touches app data.
const storage = new Map();
global.window = { localStorage: {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
} };
require.extensions['.ts'] = (module, filename) => {
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  module._compile(compiled.outputText, filename);
};

const { createEmptyVoucher } = require('../src/domain/voucherFactory.ts');
const { receiptLineComplete, withReceiptEntryLines, getReceiptEntryLines } = require('../src/domain/receiptEntry.ts');
const { createEmptyLocalInvoice } = require('../src/domain/localInvoiceFactory.ts');
const { localInvoiceRepo } = require('../src/data/localInvoiceService.ts');
const { voucherRepo, finalizeVoucher, unfinalizeVoucher, findReceivableSources } = require('../src/data/voucherService.ts');
const invoice = createEmptyLocalInvoice();
Object.assign(invoice, { invoiceNo: 'INV-TEST', partyCode: 'PARTY-TEST', invoiceTotal: 1000, status: { final: true, void: false } });
localInvoiceRepo.save(invoice);
const voucher = createEmptyVoucher('RECEIPT');
Object.assign(voucher, {
  voucherNo: 'KHI-RV-TEST', partyCode: invoice.partyCode, amount: 250,
  entryDate: '2026-10-05', receivedFrom: 'Test Customer', chequeNo: '00123',
  attachment: { name: 'test.png', dataUrl: 'data:image/png;base64,AA==' },
  costLines: [{ id: 'cost-test', accountCode: 'OPEX-CTRL', amount: 25 }],
  clearingLines: [{ id: 'clear-test', sourceType: 'LOCAL_INVOICE', sourceId: invoice.id, sourceDocNo: invoice.invoiceNo, jobNo: '', amountCleared: 250 }],
});
voucherRepo.save(voucher);
assert.equal(voucherRepo.get(voucher.id).chequeNo, '00123');
assert.deepEqual(voucherRepo.get(voucher.id).attachment, voucher.attachment);
assert.equal(voucherRepo.get(voucher.id).costLines[0].amount, 25);
finalizeVoucher(voucher.id);
assert.equal(findReceivableSources(invoice.partyCode)[0].balance, 750);
assert.equal(localInvoiceRepo.get(invoice.id).receipts.length, 1);
finalizeVoucher(voucher.id);
assert.equal(localInvoiceRepo.get(invoice.id).receipts.length, 1, 'Repeated finalization must not duplicate a receipt');
unfinalizeVoucher(voucher.id);
assert.equal(findReceivableSources(invoice.partyCode)[0].balance, 1000);
assert.equal(localInvoiceRepo.get(invoice.id).receipts.length, 0);
finalizeVoucher(voucher.id);
assert.equal(findReceivableSources(invoice.partyCode)[0].balance, 750);
voucherRepo.save({ ...voucherRepo.get(voucher.id), posted: true });
unfinalizeVoucher(voucher.id);
assert.equal(voucherRepo.get(voucher.id).final, true, 'Posted vouchers must remain final');
const row = { id: 'entry-1', dc: 'DEBIT', accountCode: '', accountDescription: '', particulars: '', analysisCode: '', billNo: '', billDate: '', currencyCode: 'USD', exchangeRate: '280', amount: '' };
assert.equal(receiptLineComplete(row), false, 'Empty row must prevent adding another row');
assert.equal(receiptLineComplete({ ...row, accountCode: 'BANK', amount: '0' }), false);
assert.equal(receiptLineComplete({ ...row, accountCode: 'BANK', amount: 'abc' }), false);
assert.equal(receiptLineComplete({ ...row, accountCode: 'BANK', amount: '250', exchangeRate: '' }), false);
const debitRow = { ...row, accountCode: 'BANK', amount: '250' };
assert.equal(receiptLineComplete(debitRow), true);
const creditRow = { ...debitRow, id: 'entry-2', dc: 'CREDIT', accountCode: 'PARTY', currencyCode: 'PKR', exchangeRate: '1', amount: '70000' };
const updated = withReceiptEntryLines(createEmptyVoucher('RECEIPT'), [debitRow, creditRow]);
assert.equal(updated.amount, 250);
assert.equal(updated.journalLines[0].debit, 70000);
assert.equal(updated.journalLines[1].credit, 70000);
assert.deepEqual(getReceiptEntryLines(updated), [debitRow, creditRow]);
voucherRepo.save(updated);
assert.deepEqual(voucherRepo.get(updated.id).receiptEntryLines, [debitRow, creditRow]);
assert.equal(withReceiptEntryLines(updated, []).amount, 0, 'Deleting all rows must clear the totals');
console.log('Bank receipt checks passed: row validation, FC/PKR totals, persistence, allocation, repeated finalization, un-finalization and posted protection.');

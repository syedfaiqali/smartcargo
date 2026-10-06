const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'http://localhost/' });
global.window = dom.window;
global.document = dom.window.document;
Object.defineProperty(global, 'navigator', { value: dom.window.navigator, configurable: true });
for (const key of ['HTMLElement', 'Element', 'Node', 'MutationObserver']) global[key] = dom.window[key];
for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => module._compile(
    ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText, filename,
  );
}
const React = require('react');
const { Provider } = require('react-redux');
const { render, act, cleanup } = require('@testing-library/react');
const { createAppStore } = require('../src/store/store.ts');
const { patchJournalVoucherState, resetJournalVoucherState } = require('../src/store/journalVoucherSlice.ts');
const { patchBankReceiptState, resetBankReceiptState } = require('../src/store/bankReceiptSlice.ts');
const { useVoucherWorkflowState } = require('../src/features/voucher/useVoucherWorkflowState.ts');
const { createEmptyVoucher } = require('../src/domain/voucherFactory.ts');

const store = createAppStore();
const journal = { ...createEmptyVoucher('JOURNAL'), voucherNo: 'JV-TEST' };
const receipt = { ...createEmptyVoucher('RECEIPT'), voucherNo: 'RV-TEST' };
const journalPatch = {
  voucher: journal, editable: true, tab: 2, selected: [journal.id],
  message: { severity: 'success', text: 'Journal saved' },
  invoiceDialog: true, invoiceId: 'journal-invoice', invoiceAmount: 25,
};
const receiptPatch = {
  voucher: receipt, editable: false, tab: 1, selected: [receipt.id],
  isPrintingView: true, message: { severity: 'warning', text: 'Receipt only' },
  invoiceDialog: false, invoiceId: 'receipt-invoice', invoiceAmount: 50,
};
let controllers = {};
function Harness({ kind }) {
  controllers[kind] = useVoucherWorkflowState(kind);
  return null;
}
const view = (kind) => React.createElement(Provider, { store }, React.createElement(Harness, { kind }));
try {
  const untouchedReceipt = store.getState().bankReceipt;
  store.dispatch(patchJournalVoucherState(journalPatch));
  assert.strictEqual(store.getState().bankReceipt, untouchedReceipt);
  const savedJournal = store.getState().journalVoucher;
  store.dispatch(patchBankReceiptState(receiptPatch));
  assert.strictEqual(store.getState().journalVoucher, savedJournal);
  assert.deepEqual(store.getState().journalVoucher.selected, [journal.id]);
  assert.deepEqual(store.getState().bankReceipt.selected, [receipt.id]);
  assert.equal(store.getState().journalVoucher.invoiceAmount, 25);
  assert.equal(store.getState().bankReceipt.invoiceAmount, 50);

  const beforeInvalid = store.getState();
  store.dispatch(patchJournalVoucherState({ voucher: receipt, tab: 99 }));
  store.dispatch(patchBankReceiptState({ voucher: journal, tab: 99 }));
  assert.strictEqual(store.getState(), beforeInvalid, 'Cross-kind drafts must be rejected');

  const mounted = render(view('JOURNAL'));
  const updateJournal = controllers.JOURNAL.setVoucher;
  act(() => {
    updateJournal(current => ({ ...current, remarks: 'First edit' }));
    updateJournal(current => ({ ...current, receivedFrom: 'Second edit' }));
    controllers.JOURNAL.setRevision(value => value + 1);
    controllers.JOURNAL.setRevision(value => value + 1);
  });
  assert.equal(store.getState().journalVoucher.voucher.remarks, 'First edit');
  assert.equal(store.getState().journalVoucher.voucher.receivedFrom, 'Second edit');
  assert.equal(store.getState().journalVoucher.revision, 2, 'Batched updates must use current Redux state');
  assert.deepEqual(store.getState().bankReceipt.voucher, receipt);
  mounted.rerender(view('RECEIPT'));
  assert.equal(controllers.RECEIPT.voucher.voucherNo, 'RV-TEST');
  assert.equal(controllers.RECEIPT.tab, 1);
  act(() => controllers.RECEIPT.setVoucher(current => ({ ...current, receivedFrom: 'Receipt edit' })));
  const receiptAfterEdit = store.getState().bankReceipt;
  mounted.rerender(view('JOURNAL'));
  assert.equal(controllers.JOURNAL.voucher.remarks, 'First edit', 'Returning to Journal must retain its draft');
  assert.equal(controllers.JOURNAL.tab, 2);
  act(() => store.dispatch(resetJournalVoucherState()));
  assert.equal(store.getState().journalVoucher.voucher, null);
  assert.strictEqual(store.getState().bankReceipt, receiptAfterEdit, 'Journal reset must leave Receipt unchanged');
  act(() => store.dispatch(resetBankReceiptState()));
  assert.equal(store.getState().bankReceipt.voucher, null);
  assert.deepEqual(store.getState().bankReceipt.selected, []);
  assert.equal(createAppStore().getState().journalVoucher.voucher, null, 'Fresh stores must be independent');
  console.log('Voucher Redux checks passed: independent drafts, selections, tabs, printing/messages/invoices, cross-kind guards, batched updates, route switching and independent resets.');
} finally {
  cleanup();
  dom.window.close();
}

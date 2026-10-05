const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const { unzipSync, strFromU8 } = require('fflate');
const { JSDOM } = require('jsdom');
require.extensions['.ts'] = (module, filename) => {
  const result = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } });
  module._compile(result.outputText, filename);
};
const { buildVoucherPrintReport, createVoucherPdf, createVoucherExcel, amountInWords } = require('../src/features/voucher/voucherPrinting.ts');
const { createEmptyVoucher } = require('../src/domain/voucherFactory.ts');
const { withReceiptEntryLines } = require('../src/domain/receiptEntry.ts');
const debit = { id: 'debit', dc: 'DEBIT', accountCode: 'BANK', accountDescription: 'Bank Account', particulars: '=HYPERLINK("test") & receipt <test>', analysisCode: 'OPS', billNo: 'B-1', billDate: '2026-10-05', currencyCode: 'USD', exchangeRate: '280', amount: '100' };
const credit = { ...debit, id: 'credit', dc: 'CREDIT', accountCode: 'PARTY', accountDescription: 'Customer', currencyCode: 'PKR', exchangeRate: '1', amount: '28000' };
const voucher = withReceiptEntryLines({ ...createEmptyVoucher('RECEIPT'), voucherNo: 'KHI-RV-TEST', voucherDate: '2026-10-05', chequeNo: '000123', chequeDate: '2026-10-05', partyName: 'Customer' }, [debit, credit]);
const settings = { type: 'Voucher', currency: 'PKR', payTo: 'Test Payee & Company', payeeAccountOnly: true, stamp: true, signatory1: 'Director', signatory2: 'Manager' };
const report = buildVoucherPrintReport(voucher, settings);
assert.equal(report.title, 'BANK PAYMENT VOUCHER');
assert.equal(report.layout.branch, 'Karachi');
assert.equal(report.tables[0].rows.length, 2);
assert.deepEqual(report.tables[1].rows[0], [28000, 28000, 0]);
const pkrNote = buildVoucherPrintReport(voucher, { ...settings, type: 'Debit Note' });
assert.equal(pkrNote.tables[0].rows.length, 1);
assert.equal(pkrNote.tables[0].rows[0][5], 'PKR');
assert.equal(pkrNote.tables[0].rows[0][6], 28000);
const foreignNote = buildVoucherPrintReport(voucher, { ...settings, type: 'Debit Note', currency: 'FOREIGN' });
assert.equal(foreignNote.tables[0].rows[0][5], 'USD');
assert.equal(foreignNote.tables[0].rows[0][6], 100);
const creditNote = buildVoucherPrintReport(voucher, { ...settings, type: 'Credit Note' });
assert.equal(creditNote.tables[0].rows[0][0], 'PARTY');
const multi = withReceiptEntryLines(voucher, [debit, credit, { ...credit, id: 'eur', currencyCode: 'EUR', amount: '10', exchangeRate: '300' }]);
const multiNote = buildVoucherPrintReport(multi, { ...settings, type: 'Credit Note', currency: 'FOREIGN' });
assert.deepEqual(multiNote.tables[1].rows, [['PKR', 28000], ['EUR', 10]], 'Foreign currencies must have separate totals');
const cheque = buildVoucherPrintReport(voucher, { ...settings, type: 'Cheque' });
assert.equal(pkrNote.title, 'DEBIT NOTE - KHI');
assert.equal(creditNote.title, 'CREDIT NOTE - KHI');
assert.equal(cheque.title, "Payee's Account Only");
assert.equal(cheque.cheque.amount, 28000);
assert.equal(cheque.cheque.accountOnly, true);
assert.equal(cheque.cheque.stamp, true);
assert.equal(cheque.cheque.signatory1, 'Director');
assert.equal(amountInWords(999.999), 'One Thousand Rupees Only');
const plainCheque = buildVoucherPrintReport(voucher, { ...settings, type: 'Cheque', payeeAccountOnly: false, stamp: false });
assert.equal(plainCheque.cheque.accountOnly, false);
assert.equal(plainCheque.cheque.stamp, false);
assert.throws(() => buildVoucherPrintReport(voucher, { ...settings, type: 'Cheque', payTo: '' }), /Pay To/);
assert.throws(() => buildVoucherPrintReport({ ...voucher, chequeNo: '' }, { ...settings, type: 'Cheque' }), /cheque number/);
assert.throws(() => buildVoucherPrintReport(createEmptyVoucher('RECEIPT'), settings), /Complete/);
const dom = new JSDOM();
for (const result of [report, pkrNote, foreignNote, creditNote, cheque]) {
  const header = 'data:image/png;base64,' + fs.readFileSync(require('node:path').join(__dirname, '../public/masum-logistics-header.png')).toString('base64');
  const pdf = createVoucherPdf(result, header);
  assert.ok(pdf.output().startsWith('%PDF-'));
  const content = pdf.output();
  assert.equal(content.includes('SmartCargo'), false, 'Report branding must match the supplied Masum layout');
  const portrait = result.layout.type.includes('Note');
  assert.equal(pdf.internal.pageSize.getHeight() > pdf.internal.pageSize.getWidth(), portrait);
  if (result.cheque) {
    assert.ok(content.includes("Payee's Account Only"));
    assert.equal(content.includes('Cheque No.'), false, 'Cheque must be the stationery overlay rather than a metadata report');
  } else {
    assert.ok(content.includes('Prepared By'));
    assert.ok(content.includes('Checked By'));
    if (portrait) { assert.ok(content.includes('/Subtype /Image')); assert.ok(content.includes('Manager Finance')); }
    else assert.ok(content.includes('Received By'));
  }
  const files = unzipSync(createVoucherExcel(result));
  assert.ok(files['xl/workbook.xml']);
  for (const [name, contents] of Object.entries(files)) {
    if (!name.endsWith('.xml') && !name.endsWith('.rels')) continue;
    const text = strFromU8(contents);
    const parsed = new dom.window.DOMParser().parseFromString(text, 'application/xml');
    assert.equal(parsed.getElementsByTagName('parsererror').length, 0, `Invalid workbook XML: ${name}`);
    assert.equal(text.includes('<f>'), false, 'User text must not become an Excel formula');
  }
}
assert.equal(createVoucherPdf(multiNote).getNumberOfPages(), 2, 'Separate currency notes need separate pages');
const overflowNote = { ...pkrNote, tables: [{ ...pkrNote.tables[0], rows: [[...pkrNote.tables[0].rows[0].slice(0, 2), 'Long remarks '.repeat(300), ...pkrNote.tables[0].rows[0].slice(3)]] }, pkrNote.tables[1]] };
assert.ok(createVoucherPdf(overflowNote).getNumberOfPages() > 1, 'Long note remarks must continue without covering the signatures');
const longReport = { ...report, tables: [{ ...report.tables[0], rows: Array.from({ length: 100 }, () => report.tables[0].rows[0]) }] };
assert.ok(createVoucherPdf(longReport).getNumberOfPages() > 1, 'Long voucher tables must paginate');
dom.window.close();
console.log('Printing checks passed: all four PDFs/XLSX files, PKR/foreign amounts, per-currency totals, cheque settings, validation, safe spreadsheet text and pagination.');

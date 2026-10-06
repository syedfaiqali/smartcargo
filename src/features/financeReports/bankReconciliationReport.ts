import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { BankReconciliationData, ReconciliationChequeRow } from '../../data/financeReportsService';

const html = (value: string | number | undefined) =>
  String(value ?? '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (value: number) => (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateTime = (d: Date) =>
  `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()} ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}`;
const dateOnly = (iso: string) => {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
};

const SHEET_STYLE = `
#bank-recon-sheet *{box-sizing:border-box}
.masthead{text-align:center;border-bottom:2px solid #111;padding-bottom:6px;margin-bottom:10px;position:relative}
.masthead h1{margin:0;font-size:18px;font-weight:700}
.masthead h2{margin:2px 0 0;font-size:13px;font-weight:700}
.masthead h3{margin:2px 0 0;font-size:11px;font-weight:700}
.meta-box{position:absolute;left:0;top:0;text-align:left;font-size:9px;line-height:1.5}
.currency-box{position:absolute;right:0;top:6px;border:2px solid #111;padding:6px 14px;font-size:11px;font-weight:700}
.bank-bar{display:flex;justify-content:space-between;align-items:center;border:2px solid #111;padding:6px 10px;margin-bottom:6px;font-size:11px;font-weight:700}
.balance-line{font-size:10.5px;margin-bottom:10px}
.section-title{border:1px solid #111;border-bottom:0;background:#fff;font-weight:700;font-size:10.5px;padding:5px 8px}
table.recon{width:100%;border-collapse:collapse;margin-bottom:14px}
table.recon th{border:1px solid #111;background:#fff;font-weight:700;font-size:9.5px;padding:4px 6px;text-align:center}
table.recon td{border:1px solid #111;font-size:9.5px;padding:4px 6px}
table.recon td.num{text-align:right}
table.recon td.center{text-align:center}
table.recon tfoot td{font-weight:700;background:#fff}
.summary-wrap{display:flex;justify-content:flex-end}
table.summary{border-collapse:collapse;width:300px;font-size:10px}
table.summary td{border:1px solid #111;padding:5px 8px}
table.summary td.label{font-weight:700}
table.summary td.amt{text-align:right;min-width:90px}
table.summary tr.total td{background:#bcd3ec}
`;

function renderGridRows(rows: ReconciliationChequeRow[]): string {
  if (!rows.length) {
    return `<tr><td colspan="9" class="center">No entries.</td></tr>`;
  }
  return rows
    .map(
      (row) => `<tr>
        <td class="center">${html(row.voucherDate.slice(0, 4))}</td>
        <td class="center">${html(row.type)}</td>
        <td>${html(row.voucherNo)}</td>
        <td class="center">${html(dateOnly(row.voucherDate))}</td>
        <td class="center">${html(row.branch)}</td>
        <td>${html(row.particulars)}</td>
        <td class="center">${html(row.chequeNo || '—')}</td>
        <td class="center">${html(row.chequeDate ? dateOnly(row.chequeDate) : '—')}</td>
        <td class="num">${money(row.amount)}</td>
      </tr>`
    )
    .join('');
}

function gridTable(heading: string, rows: ReconciliationChequeRow[]): string {
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  return `
  <div class="section-title">${html(heading)}</div>
  <table class="recon">
    <thead>
      <tr>
        <th>Year</th><th>Type</th><th>Voc. No</th><th>Voc. Date</th><th>Br.</th><th>Particulars</th><th>Cheque No</th><th>Chq. Date</th><th>Amount</th>
      </tr>
    </thead>
    <tbody>${renderGridRows(rows)}</tbody>
    <tfoot>
      <tr><td colspan="8" style="text-align:right">Total</td><td class="num">${money(total)}</td></tr>
    </tfoot>
  </table>`;
}

interface ReportMeta {
  branch: string;
  bankCode: string;
  bankName: string;
  asOnDate: string;
  currencyCode: string;
  userName: string;
}

function buildReportHtml(data: BankReconciliationData, meta: ReportMeta, addTotal: number, lessTotal: number): string {
  const now = new Date();
  const asOnLabel = dateOnly(meta.asOnDate);

  return `<div id="bank-recon-sheet" style="width:960px;background:#fff;padding:30px 36px;color:#111;font:11px Arial,Helvetica,sans-serif;box-sizing:border-box">
<style>${SHEET_STYLE}</style>

<div class="masthead">
  <div class="meta-box">
    Date : ${html(dateTime(now))}<br/>
    Page : 1 / 1<br/>
    User : ${html(meta.userName)}<br/>
    Branch : ${html(meta.branch)}
  </div>
  <h1>Masum Logistics ${html(meta.branch === 'LHE' ? 'Lahore' : meta.branch === 'ISB' ? 'Islamabad' : 'Karachi')}</h1>
  <h2>Bank Reconciliation Statement</h2>
  <h3>As on Date: ${html(asOnLabel)}</h3>
  <div class="currency-box">Currency : ${html(meta.currencyCode)}</div>
</div>

<div class="bank-bar">
  <span>Bank Code : ${html(meta.bankCode)} &nbsp; ${html(meta.bankName)}</span>
  <span>Amount</span>
</div>
<div class="balance-line">Balance as on <b>${html(asOnLabel)}</b> as per Books</div>

${gridTable('Add: Cheque issued but not presented / Debited by Bank', data.issuedUncleared)}
${gridTable('Less: Cheque Deposited but not yet credited by Bank', data.depositedUncleared)}

<div class="summary-wrap">
  <table class="summary">
    <tr><td class="label">Balance as on ${html(asOnLabel)} as per Books</td><td class="amt">${money(data.bookBalance)}</td></tr>
    <tr><td class="label">Add: Cheques issued but not presented</td><td class="amt">${money(addTotal)}</td></tr>
    <tr class="total"><td style="text-align:right">Total</td><td class="amt">${money(data.bookBalance + addTotal)}</td></tr>
    <tr><td class="label">Less: Cheques Deposited but not yet credited</td><td class="amt">${money(lessTotal)}</td></tr>
    <tr class="total"><td style="text-align:right">Total</td><td class="amt">${money(data.bookBalance + addTotal - lessTotal)}</td></tr>
  </table>
</div>

</div>`;
}

const CONTAINER_WIDTH_PX = 960;
const A4_WIDTH_PT = 841.89; // landscape A4 width

/**
 * Renders the Bank Reconciliation Statement as a real PDF (matching the legacy printed layout) and opens it
 * inline in a new tab. The tab is opened synchronously, before the async rendering work, and only navigated
 * once the PDF is ready — opening it after an `await` gets silently popup-blocked otherwise.
 */
export async function printBankReconciliation(data: BankReconciliationData, meta: ReportMeta): Promise<void> {
  const previewTab = window.open('', '_blank');
  if (previewTab) {
    previewTab.document.write('<title>Generating PDF…</title><body style="font:14px sans-serif;padding:24px;color:#444">Generating PDF…</body>');
  }

  const addTotal = data.issuedUncleared.reduce((sum, r) => sum + r.amount, 0);
  const lessTotal = data.depositedUncleared.reduce((sum, r) => sum + r.amount, 0);

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.zIndex = '-1000';
  container.innerHTML = buildReportHtml(data, meta, addTotal, lessTotal);
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true, windowWidth: CONTAINER_WIDTH_PX });
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const heightPt = (canvas.height / canvas.width) * A4_WIDTH_PT;
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, A4_WIDTH_PT, heightPt);

    const blobUrl = doc.output('bloburl').toString();
    if (previewTab && !previewTab.closed) {
      previewTab.location.href = blobUrl;
    } else {
      window.open(blobUrl, '_blank');
    }
  } finally {
    document.body.removeChild(container);
  }
}

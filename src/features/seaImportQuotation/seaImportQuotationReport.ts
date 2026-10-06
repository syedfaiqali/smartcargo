import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { SeaImportQuotation, QuotationCarrierOption } from '../../domain/seaImportQuotation';

const html = (value: string | number | undefined) =>
  String(value ?? '—').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nl2br = (value: string) => html(value).replace(/\n/g, '<br/>');
const money = (value: number, currency: string) =>
  `${(Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${html(currency)}`;
const date = (value: string) =>
  value ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '—';

/**
 * Footer bank/registration details are fixed presentation chrome (like the logo and header), not quotation
 * data — they never change per-record, so they are hardcoded here rather than editable in the Data Entry tab.
 */
const BANK_FOOTER = {
  bankName: 'UniCredit Bank Austria AG',
  bankAddress: 'AT · 1020 Wien · Rothschildplatz 1',
  iban: 'AT45 1200 0100 2404 2219',
  swiftBic: 'BKAUATWW',
  headOffice: 'Otopeni, Ilfov county',
  cif: 'RO38938500 · J2018000897234/2025',
};

/** How many carrier options are shown on page 1 before the rest flow onto page 2 (matches the reference document). */
const OPTIONS_ON_PAGE_1 = 2;

const SHEET_STYLE = `
#quotation-report-sheet *{box-sizing:border-box}
.masthead{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:10px;border-bottom:1px solid #d9dde3}
.tagline{font:italic 15px 'Brush Script MT',cursive;color:#3a3f47;padding-top:6px}
.brand{display:flex;align-items:center;gap:8px}
.brand img{width:34px;height:34px;object-fit:contain}
.brand b{font-size:21px;letter-spacing:.3px;color:#14181f}
.doc-title-row{display:flex;justify-content:space-between;margin-top:16px}
.doc-title-row h1{margin:0;font-size:14px;font-weight:700;color:#14181f}
.doc-title-row .ref{text-align:right;font-size:11px;color:#14181f}
.doc-title-row .ref b{font-weight:700}
.doc-title-row .page{text-align:right;color:#5a6270;margin-top:2px;font-size:10.5px}
.parties{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:14px}
.party h4{margin:0 0 4px;font-size:10px;color:#5a6270;font-weight:700}
.party .name{font-weight:700;font-size:11.5px;margin-bottom:2px}
.party .addr{color:#30343b;line-height:1.45}
.party .contact{margin-top:6px}
.party .contact span{color:#5a6270;display:block;font-size:10px}
.meta-row{display:flex;justify-content:space-between;margin-top:14px}
.meta-row div{font-size:11px}
.meta-row .lbl{color:#5a6270;font-size:10px;display:block}
.section{margin-top:16px}
.section h2{margin:0 0 6px;font-size:11.5px;font-weight:700;border-bottom:1px solid #20242b;padding-bottom:3px}
table{width:100%;border-collapse:collapse}
.transport-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px 16px;font-size:11px}
.transport-grid .lbl{display:block;color:#5a6270;font-size:9.5px;margin-bottom:2px}
.shipment-table th,.shipment-table td{text-align:left;padding:4px 6px;font-size:10.5px}
.shipment-table thead th{color:#5a6270;font-weight:400;font-size:9.5px;border-bottom:1px dotted #c7ccd3}
.shipment-table tbody td{border-bottom:1px solid #20242b;padding-bottom:6px;font-weight:700}
.charges{margin-top:4px}
.charges thead th{text-align:left;color:#5a6270;font-weight:400;font-size:9.5px;border-bottom:1px dotted #c7ccd3;padding:3px 6px}
.charges thead th.num,.charges td.num{text-align:right}
.charges td{padding:4px 6px;font-size:10.5px;border-bottom:1px solid #eceef1}
.subtotal-row{display:flex;justify-content:flex-end;gap:40px;margin-top:4px;padding:4px 6px;font-weight:700;border-top:1px solid #20242b}
.option{margin-top:18px;padding-top:4px}
.option-head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid #20242b;padding-bottom:4px}
.option-head h3{margin:0;font-size:11.5px;font-weight:700}
.option-head .carrier-label{font-size:9px;color:#5a6270}
.option-row{display:flex;justify-content:space-between;align-items:flex-start;margin-top:6px}
.field-label{display:block;font-size:9px;color:#5a6270}
.routing-text{font-weight:700;font-size:11px;margin-top:2px}
.schedule-note{margin-top:2px;color:#30343b;font-size:10px}
.carrier-name{font-weight:700;font-size:11px;text-align:right}
.option-total{display:flex;justify-content:space-between;align-items:baseline;margin-top:6px;padding-top:4px;border-top:1px solid #20242b}
.option-total div{font-size:10.5px}
.option-total span{display:block;font-size:9px;color:#5a6270;font-weight:400}
.total-amt{font-size:12px}
.not-included{margin-top:18px}
.not-included h3,.terms h3{margin:0 0 6px;font-size:11px;font-weight:700}
.not-included ul,.terms-text{margin:0;padding-left:16px;color:#30343b;line-height:1.5;font-size:10.5px}
.terms{margin-top:16px}
.terms-text{padding-left:0;line-height:1.55}
.issued{display:flex;justify-content:space-between;margin-top:22px}
.issued div{font-size:10.5px}
.issued .lbl{color:#5a6270;font-size:9.5px;display:block;margin-bottom:2px}
.issued b{display:block}
.issued .contact-row{margin-top:4px;color:#30343b}
.footer{margin-top:auto;padding-top:38px;border-top:1px solid #d9dde3;display:flex;justify-content:space-between;font-size:9px;color:#5a6270}
.footer b{color:#20242b;font-weight:700}
.footer .col{flex:1}
.footer .col + .col{border-left:1px solid #d9dde3;padding-left:14px;margin-left:14px}
`;

function renderHeader(record: SeaImportQuotation, logoUrl: string, pageLabel: string): string {
  return `
<header class="masthead">
  <div class="tagline">We put a lot of thought in all we do.</div>
  <div class="brand"><img src="${logoUrl}" alt="Masum Logistics" /><b>Masum Logistics</b></div>
</header>

<div class="doc-title-row">
  <h1>Pricing Air Export</h1>
  <div>
    <div class="ref"><b>${html(record.quotationNo)}</b></div>
    <div class="page">${html(pageLabel)}</div>
  </div>
</div>`;
}

function renderOptionBlock(opt: QuotationCarrierOption, chWeight: number, localChargesSubtotal: number): string {
  const airfreight = opt.ratePerKg * chWeight;
  const totalNet = airfreight + localChargesSubtotal;
  return `
  <section class="option">
    <div class="option-head">
      <h3>Option: ${html(opt.optionCode)}</h3>
      <span class="carrier-label">Carrier</span>
    </div>
    <div class="option-row">
      <div class="routing">
        <span class="field-label">Routing</span>
        <div class="routing-text">${html(opt.routing)}</div>
        ${opt.scheduleNote ? `<div class="schedule-note">${nl2br(opt.scheduleNote)}</div>` : ''}
      </div>
      <div class="carrier-name">${html(opt.carrierName)}</div>
    </div>
    <table class="charges">
      <thead><tr><th>Service Description</th><th class="num">Calculation</th><th class="num">Net Amount</th></tr></thead>
      <tbody>
        <tr><td>Airfreight</td><td class="num">${html(chWeight)} kg * ${opt.ratePerKg.toFixed(2)} ${html(opt.currencyCode)}</td><td class="num">${money(airfreight, opt.currencyCode)}</td></tr>
      </tbody>
    </table>
    <div class="option-total">
      <div><b>Total Amount Net</b><span>(incl. Local Charges)</span></div>
      <b class="total-amt">${money(totalNet, opt.currencyCode)}</b>
    </div>
  </section>`;
}

const A4_PAGE_HEIGHT_PX = 1123; // 794px wide / A4's √2 aspect ratio

/**
 * `pinFooterToBottom` gives the sheet a fixed one-A4-page height and lays it out as a flex column, so the
 * trailing `.footer` (given `margin-top:auto` in SHEET_STYLE) is pushed down to the page's bottom edge instead
 * of floating right under whatever content precedes it — used for the last page, which is otherwise shorter
 * than a full page.
 */
function wrapSheet(bodyHtml: string, pinFooterToBottom = false): string {
  const sheetStyle = pinFooterToBottom
    ? `width:794px;min-height:${A4_PAGE_HEIGHT_PX}px;background:#fff;padding:53px 45px;color:#20242b;font:11px Arial,Helvetica,sans-serif;box-sizing:border-box;display:flex;flex-direction:column`
    : `width:794px;background:#fff;padding:53px 45px;color:#20242b;font:11px Arial,Helvetica,sans-serif;box-sizing:border-box`;
  return `<div id="quotation-report-sheet" style="${sheetStyle}">
<style>${SHEET_STYLE}</style>
${bodyHtml}
</div>`;
}

/** Builds page 1: header, parties, transport/shipment details, local charges, and the first N carrier options. */
function buildPage1Html(record: SeaImportQuotation, logoUrl: string, totalPages: number): string {
  const v = record.vendorInfo;
  const currency = record.currencies[0]?.currencyCode || 'EUR';
  const localChargesSubtotal = record.localCharges.reduce((sum, l) => sum + (l.amount || 0), 0);

  const localChargesRows = record.localCharges
    .map((l) => `<tr><td>${html(l.description)}</td><td class="num"></td><td class="num">${money(l.amount, l.currencyCode || currency)}</td></tr>`)
    .join('');

  const page1Options = record.carrierOptions
    .slice(0, OPTIONS_ON_PAGE_1)
    .map((opt) => renderOptionBlock(opt, record.chWeight, localChargesSubtotal))
    .join('');

  return wrapSheet(`
${renderHeader(record, logoUrl, `Page 1/${totalPages}`)}

<div class="parties">
  <div class="party">
    <h4>Service Solicitor</h4>
    <div class="name">${html(v?.serviceSolicitorName)}</div>
    <div class="addr">${nl2br(v?.serviceSolicitorAddress || '')}</div>
    <div class="contact"><span>Contact</span>${html(v?.serviceSolicitorContact)}</div>
  </div>
  <div class="party">
    <h4>Service Provider</h4>
    <div class="name">${html(v?.serviceProviderName)}</div>
    <div class="addr">${nl2br(v?.serviceProviderAddress || '')}</div>
  </div>
</div>

<div class="meta-row">
  <div><span class="lbl">Valid</span>${html(record.validity)}</div>
  <div><span class="lbl">Date of Issue</span>${date(record.date)}</div>
</div>

<div class="section">
  <h2>Transport Details</h2>
  <div class="transport-grid">
    <div><span class="lbl">Departure Airport</span>${html(v?.originCity ? `${record.origin} - ${v.originCity}` : record.origin)}</div>
    <div><span class="lbl">Place of Acceptance</span>${html(v?.placeOfAcceptance) === '—' ? '&nbsp;' : html(v?.placeOfAcceptance)}</div>
    <div><span class="lbl">Total CO&#8322; Emissions</span>${html(v?.co2EmissionsKg?.toLocaleString('en-US'))} kg</div>
    <div><span class="lbl">Destination Airport</span>${html(v?.destinationCity ? `${record.destination} - ${v.destinationCity}` : record.destination)}</div>
    <div></div>
    <div><span class="lbl">Incoterms</span>${html(record.incoTerm)}</div>
  </div>
</div>

<div class="section">
  <h2>Shipment Details</h2>
  <table class="shipment-table">
    <thead><tr><th>Pieces</th><th>Package Type</th><th>Dimensions</th><th>Nature of Goods</th><th>Weight</th></tr></thead>
    <tbody>
      <tr><td>${html(record.noOfPkgs)}</td><td>${record.packageType ? html(record.packageType) : '&nbsp;'}</td><td>${html(record.dimensions[0] ? `${record.dimensions[0].length} x ${record.dimensions[0].width} x ${record.dimensions[0].height} cm` : '—')}</td><td>${html(record.commodity)}</td><td>${html(record.grossWeight.toLocaleString('en-US'))} kg</td></tr>
    </tbody>
    <thead><tr><th>Total</th><th>Volume</th><th>Chargeable Weight</th><th>Total Weight</th><th></th></tr></thead>
    <tbody>
      <tr><td>${html(record.noOfPkgs)}</td><td>${html(record.cbm)} m&sup3;</td><td>${html(record.chWeight.toLocaleString('en-US'))} kg</td><td>${html(record.grossWeight.toLocaleString('en-US'))} kg</td><td></td></tr>
    </tbody>
  </table>
</div>

<div class="section">
  <h2>Local Charges</h2>
  <table class="charges">
    <thead><tr><th>Service Description</th><th class="num">Calculation</th><th class="num">Net Amount</th></tr></thead>
    <tbody>${localChargesRows}</tbody>
  </table>
  <div class="subtotal-row"><span>Subtotal</span><b>${money(localChargesSubtotal, currency)}</b></div>
</div>

${page1Options}
`);
}

/** Builds page 2 (and beyond, if ever needed): repeats the header, then the remaining carrier options, terms, and footer. */
function buildPage2Html(record: SeaImportQuotation, logoUrl: string, totalPages: number): string {
  const v = record.vendorInfo;
  const localChargesSubtotal = record.localCharges.reduce((sum, l) => sum + (l.amount || 0), 0);

  const remainingOptions = record.carrierOptions
    .slice(OPTIONS_ON_PAGE_1)
    .map((opt) => renderOptionBlock(opt, record.chWeight, localChargesSubtotal))
    .join('');

  return wrapSheet(`
${renderHeader(record, logoUrl, `Page 2/${totalPages}`)}

${remainingOptions}

<div class="not-included">
  <h3>Not included in this quotation:</h3>
  <ul>${(v?.notIncluded ?? []).map((item) => `<li>${html(item)}</li>`).join('')}</ul>
</div>

<div class="terms">
  <h3>Terms and Conditions</h3>
  <p class="terms-text">${html(v?.termsText)}</p>
</div>

<div class="issued">
  <div>
    <span class="lbl">Issued by</span>
    <b>${html(v?.issuedByName)}</b>
    <div>${html(v?.issuedByCompany)}</div>
  </div>
  <div>
    <span class="lbl">Contact Details</span>
    <div class="contact-row">${html(v?.issuedByPhone)}</div>
    <div class="contact-row">${html(v?.issuedByEmail)}</div>
  </div>
</div>

<footer class="footer">
  <div class="col"><b>${html(BANK_FOOTER.bankName)}</b><br/>${html(BANK_FOOTER.bankAddress)}</div>
  <div class="col">IBAN ${html(BANK_FOOTER.iban)}<br/>SWIFT/BIC ${html(BANK_FOOTER.swiftBic)}</div>
  <div class="col">Head Office ${html(BANK_FOOTER.headOffice)}<br/>C.I.F. ${html(BANK_FOOTER.cif)}</div>
</footer>
`, true);
}

const CONTAINER_WIDTH_PX = 794; // ~A4 width at 96dpi
const A4_WIDTH_PT = 595.28;

/** Rasterizes one page's HTML (rendered off-DOM-flow but visible to html2canvas) and adds it as a full PDF page. */
async function renderPageIntoDoc(doc: jsPDF, pageHtml: string, isFirstPage: boolean): Promise<void> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.zIndex = '-1000';
  container.innerHTML = pageHtml;
  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, { scale: 2, backgroundColor: '#ffffff', useCORS: true, windowWidth: CONTAINER_WIDTH_PX });
    const heightPt = (canvas.height / canvas.width) * A4_WIDTH_PT;
    if (!isFirstPage) doc.addPage();
    doc.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, A4_WIDTH_PT, heightPt);
  } finally {
    document.body.removeChild(container);
  }
}

/**
 * Renders the vendor rate quotation as a real PDF (Cargomind "Pricing Air Export" layout) and opens it inline
 * in a new tab. The tab is opened synchronously (before the async rendering work) and only navigated once the
 * PDF is ready — opening it after an `await` gets silently popup-blocked by the browser because the call no
 * longer happens inside the original click's user-gesture stack.
 */
export async function printSeaImportQuotation(record: SeaImportQuotation): Promise<void> {
  const previewTab = window.open('', '_blank');
  if (previewTab) {
    previewTab.document.write('<title>Generating PDF…</title><body style="font:14px sans-serif;padding:24px;color:#444">Generating PDF…</body>');
  }

  const logoUrl = `${window.location.origin}${import.meta.env.BASE_URL}masum-logo.png`;
  const totalPages = record.carrierOptions.length > OPTIONS_ON_PAGE_1 ? 2 : 1;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  await renderPageIntoDoc(doc, buildPage1Html(record, logoUrl, totalPages), true);
  if (totalPages > 1) {
    await renderPageIntoDoc(doc, buildPage2Html(record, logoUrl, totalPages), false);
  }

  const blobUrl = doc.output('bloburl').toString();
  if (previewTab && !previewTab.closed) {
    previewTab.location.href = blobUrl;
  } else {
    window.open(blobUrl, '_blank');
  }
}

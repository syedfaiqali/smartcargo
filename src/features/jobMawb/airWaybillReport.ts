import { jsPDF } from 'jspdf';
import { Job } from '../../domain/job';
import { airlineRepo } from '../../data/masterDataService';

const money = (value: number) => Number(value || 0).toFixed(2);
const date = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '';
const formatAwb = (awb: string) => awb.replace(/[^A-Za-z0-9]/g, '').replace(/^(.{3})(.{3})(.{4})(.*)$/, '$1 $2 $3 $4').trim() || awb;
const loadImage = (source: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error(`Unable to load ${source}`));
  image.src = source;
});

export async function printAirWaybill(job: Job) {
  const airlinePrefix = job.mawbNo.split('-')[0];
  const airlineName = airlineRepo.list().find((airline) => airline.code === airlinePrefix)?.name || job.owner || 'ISSUING CARRIER';
  const ethiopianLogo = airlinePrefix === '071' ? await loadImage('/ethiopian-airlines-logo.png') : undefined;
  const awbNumber = formatAwb(job.mawbNo);
  const awbDigits = job.mawbNo.replace(/\D/g, '');
  const waybillNo = (awbDigits.slice(3).match(/.{1,4}/g) ?? []).join(' ');
  const topLeftAwbHeader = [airlinePrefix, job.branch, waybillNo].filter(Boolean).join(' | ');
  const topRightAwbHeader = airlinePrefix && waybillNo ? `${airlinePrefix}-${waybillNo}` : awbNumber;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  doc.setProperties({ title: 'AirWayBillPrint', subject: `Air Waybill ${awbNumber}` });
  doc.setDisplayMode('fullwidth', 'continuous', 'UseOutlines');
  const selectedCopies = Object.keys(job.printing.copies).map((copy) => copy === 'Dummy' ? 'Copy 12 (Extra Copy)' : copy);
  const line = job.chargeLines[0];

  selectedCopies.forEach((copy, page) => {
    if (page) doc.addPage();
    const x = 7; const y = 7; const w = 196; const h = 278;
    const box = (left: number, top: number, width: number, height: number, label = '', value = '', align: 'left' | 'center' | 'right' = 'left', drawRightBorder = true) => {
      if (drawRightBorder) {
        doc.rect(left, top, width, height);
      } else {
        doc.line(left, top, left + width, top);
        doc.line(left, top, left, top + height);
        doc.line(left, top + height, left + width, top + height);
      }
      doc.setFont('helvetica', 'normal').setFontSize(5.3).text(label, left + 1, top + 2.3);
      if (value) {
        doc.setFont('courier', 'bold').setFontSize(6.5);
        const lines = doc.splitTextToSize(value, width - 2);
        const valueTop = top + 4.2 + label.split('\n').length * 2.2;
        doc.text(lines, align === 'left' ? left + 1 : align === 'right' ? left + width - 1 : left + width / 2, valueTop, { align });
      }
    };
    const label = (text: string, left: number, top: number, size = 5.5) => doc.setFont('helvetica', 'normal').setFontSize(size).text(text, left, top);
    const value = (text: string, left: number, top: number, size = 6.5) => doc.setFont('courier', 'bold').setFontSize(size).text(text, left, top);
    const topBox = (left: number, width: number, heading: string, content: string, drawRightBorder = true) => {
      if (drawRightBorder) {
        doc.rect(left, y + 6, width, 24);
      } else {
        doc.line(left, y + 6, left + width, y + 6);
        doc.line(left, y + 6, left, y + 30);
        doc.line(left, y + 30, left + width, y + 30);
      }
      doc.setFont('helvetica', 'normal').setFontSize(8).text(heading, left + 1, y + 10);
      if (content) {
        // Fit variable-length shipper data within the fixed header box so it cannot overlap Consignee.
        let fontSize = 8;
        let lines: string[] = [];
        do {
          doc.setFont('courier', 'bold').setFontSize(fontSize);
          lines = doc.splitTextToSize(content, width - 2);
          fontSize -= 0.25;
        } while (lines.length * (fontSize + 0.25) * 0.405 * 1.05 > 14 && fontSize >= 4);
        doc.setFont('courier', 'bold').setFontSize(Math.max(fontSize + 0.25, 4)).text(lines, left + 1, y + 15, { lineHeightFactor: 1.05 });
      }
    };
    const slantedLabel = (left: number, top: number, width: number, text: string) => {
      doc.line(left, top, left + 5, top + 4);
      doc.line(left + 5, top + 4, left + width - 5, top + 4);
      doc.line(left + width - 5, top + 4, left + width, top);
      doc.setFont('helvetica', 'normal').setFontSize(5.4).text(text, left + width / 2, top + 3.2, { align: 'center' });
    };

    doc.setLineWidth(.35); doc.rect(x, y, w, h); doc.setLineWidth(.18);
    value(topLeftAwbHeader, x + 2, y + 4, 8);
    doc.setFont('courier', 'bold').setFontSize(8).text(topRightAwbHeader, x + w - 2, y + 4, { align: 'right' });
    topBox(x, 58, "Shipper's Name and Address", job.printing.printShipperNameAddress === 'Y' ? `${job.party.name}\n${job.party.address}` : '', false);
    // The account-number field on the AWB is a compact header cell, not a full
    // address-height box. Keep any entered account number on the same line.
    doc.rect(x + 58, y + 6, 44, 4.5);
    doc.setFont('helvetica', 'normal').setFontSize(5.3).text("Shipper's Account Number", x + 59, y + 8.9);
    if (job.routing.accountNo) {
      doc.setFont('courier', 'bold').setFontSize(5.3).text(job.routing.accountNo, x + 101, y + 8.9, { align: 'right' });
    }
    doc.rect(x + 102, y + 6, 94, 24);
    doc.setFont('helvetica', 'normal').setFontSize(8).text('Not negotiable', x + 103, y + 10);
    doc.setFont('helvetica', 'bold').setFontSize(11).text('Air Waybill', x + 103, y + 14);
    doc.setFont('helvetica', 'normal').setFontSize(8).text('issued by', x + 103, y + 18);
    doc.setFont('helvetica', 'bold').setFontSize(9).text(airlineName, x + 103, y + 24);
    if (ethiopianLogo) {
      doc.addImage(ethiopianLogo, 'PNG', x + 157, y + 10, 37, 14);
    } else {
      doc.setFont('helvetica', 'bold').setFontSize(13).setTextColor(130, 20, 35).text(airlineName, x + 164, y + 20, { align: 'center' });
    }
    doc.setTextColor(0, 0, 0);
    // Keep this lower address area continuous; the compact account-number cell
    // above it supplies the only required separation in this section.
    box(x, y + 30, 58, 27, "Consignee's Name and Address", job.printing.printConsigneeNameAddress === 'Y' ? `${job.consignee.name}\n${job.consignee.address}` : '', 'left', false);
    doc.rect(x + 58, y + 30, 44, 4.5);
    doc.setFont('helvetica', 'normal').setFontSize(5.3).text("Consignee's Account Number", x + 59, y + 32.9);
    box(x + 102, y + 30, 94, 27, 'Copies 1, 2 and 3 of this Air Waybill are originals and have the same validity.', 'It is agreed that the goods described herein are accepted in apparent good order and condition for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. All goods may be carried by any other means including road or any other carrier.');
    // Align this split with the upper header division and keep the accounting
    // area open through the agent/account row (no internal horizontal rule).
    box(x, y + 57, 102, 22, "Issuing Carrier's Agent Name and City", job.agents.clearingAgent || job.owner);
    box(x + 102, y + 57, 94, 30, 'Accounting Information', job.accountingInformationNotify || `${job.printing.printChargeType === 'PP' ? 'FREIGHT PREPAID' : 'FREIGHT COLLECT'}\nJOB NO. ${job.jobNo}`);
    box(x, y + 79, 45, 8, "Agent's IATA Code", job.agents.spoCode);
    box(x + 45, y + 79, 57, 8, 'Account No', job.routing.accountNo);
    box(x, y + 87, 102, 12, 'Airport of Departure/Addr. of First Carrier and Requested Routing', job.routing.airportOfDeparture);
    box(x + 102, y + 87, 53, 12, 'Reference Number', job.jobNo);
    box(x + 155, y + 87, 41, 12, 'Optional Shipping Information', '');
    const routingTop = y + 99;
    const routingColumns = [
      { width: 8, label: 'To', value: 'ADD' },
      // Fill the left half continuously through the centre divider; the
      // routing fields absorb the space previously left as a blank cell.
      { width: 12, label: 'To', value: job.routing.legs[0]?.to ?? '' },
      { width: 11, label: 'By', value: job.routing.legs[0]?.by ?? '' },
      { width: 12, label: 'To', value: '' },
      { width: 11, label: 'By', value: '' },
      { width: 14, label: 'Currency', value: job.currency },
      { width: 9, label: 'CHGS\ncode', value: job.printing.printChargeType },
      { width: 25, label: 'Declared Value\nfor Carriage', value: job.declaredValCarriage },
      { width: 22, label: 'Declared Value\nfor Customs', value: job.declaredValCustoms },
    ];
    const legacyCarrierRoutingCell = (left: number) => {
      const carrierWidth = 20;
      const destinationWidth = 28;
      const width = carrierWidth + destinationWidth;
      const tabInset = 5;
      const tabDepth = 4;

      // The legacy AWB has one continuous cell for these two routing fields.
      // Its destination heading is an inset tab, rather than a second box
      // with a straight top border and a vertical divider.
      doc.line(left, routingTop, left + carrierWidth, routingTop);
      doc.line(left + carrierWidth, routingTop, left + carrierWidth + tabInset, routingTop + tabDepth);
      doc.line(left + carrierWidth + tabInset, routingTop + tabDepth, left + width - tabInset, routingTop + tabDepth);
      doc.line(left + width - tabInset, routingTop + tabDepth, left + width, routingTop);
      doc.line(left, routingTop, left, routingTop + 12);
      doc.line(left, routingTop + 12, left + width, routingTop + 12);
      doc.line(left + width, routingTop, left + width, routingTop + 12);

      doc.setFont('helvetica', 'normal').setFontSize(5.3).text('By First Carrier', left + 1, routingTop + 7.2);
      doc.setFont('helvetica', 'normal').setFontSize(5.3).text('Routing and Destination', left + carrierWidth + destinationWidth / 2, routingTop + 3.2, { align: 'center' });
      doc.setFont('courier', 'bold').setFontSize(6.5).text(job.routing.flightNo1, left + carrierWidth / 2, routingTop + 10.2, { align: 'center' });
      doc.setFont('courier', 'bold').setFontSize(6.5).text(job.routing.destination, left + carrierWidth + destinationWidth / 2, routingTop + 10.2, { align: 'center' });
    };
    const chargeStatusCell = (left: number, width: number, heading: string) => {
      const split = width / 2;
      const isPrepaid = job.printing.printChargeType === 'PP';

      // The AWB charge-status area uses a merged group heading with PPD and
      // COLL sub-cells below it. Drawing these explicitly keeps both groups
      // identical, rather than letting each render as a single tall cell.
      doc.rect(left, routingTop, width, 12);
      doc.line(left, routingTop + 4.5, left + width, routingTop + 4.5);
      doc.line(left + split, routingTop + 4.5, left + split, routingTop + 12);
      doc.setFont('helvetica', 'normal').setFontSize(5.3).text(heading, left + width / 2, routingTop + 2.8, { align: 'center' });
      doc.text('PPD', left + split / 2, routingTop + 7.2, { align: 'center' });
      doc.text('COLL', left + split + split / 2, routingTop + 7.2, { align: 'center' });
      doc.setFont('courier', 'bold').setFontSize(6.5).text('P', left + (isPrepaid ? split / 2 : split + split / 2), routingTop + 10.8, { align: 'center' });
    };

    // "To" remains its own field; the next two fields use the original
    // connected, slanted-header cell from the legacy form.
    let routingLeft = x;
    const [firstRoutingColumn, ...remainingRoutingColumns] = routingColumns;
    box(routingLeft, routingTop, firstRoutingColumn.width, 12, firstRoutingColumn.label, firstRoutingColumn.value, 'center');
    routingLeft += firstRoutingColumn.width;
    legacyCarrierRoutingCell(routingLeft);
    routingLeft += 48;
    remainingRoutingColumns.slice(0, 4).forEach((column) => {
      box(routingLeft, routingTop, column.width, 12, column.label, column.value, 'center');
      routingLeft += column.width;
    });
    chargeStatusCell(routingLeft, 11, 'WT/VAL');
    routingLeft += 11;
    chargeStatusCell(routingLeft, 13, 'Other');
    routingLeft += 13;
    remainingRoutingColumns.slice(4).forEach((column) => {
      box(routingLeft, routingTop, column.width, 12, column.label, column.value, 'center');
      routingLeft += column.width;
    });
    const requestedFlight = job.routing.flightNo2 || job.routing.flightNo1;
    const requestedDate = date(job.routing.flightDate2 || job.routing.flightDate);
    box(x, y + 111, 58, 10, 'Airport of Destination', job.routing.destination);
    doc.rect(x + 58, y + 111, 44, 10);
    doc.line(x + 80, y + 115, x + 80, y + 121);
    doc.setFont('helvetica', 'normal').setFontSize(5.3).text('Requested Flight / Date', x + 80, y + 113.3, { align: 'center' });
    doc.setFont('courier', 'bold').setFontSize(6.5).text(requestedFlight, x + 69, y + 118.6, { align: 'center' });
    doc.setFont('courier', 'bold').setFontSize(6.5).text(requestedDate, x + 91, y + 118.6, { align: 'center' });
    box(x + 102, y + 111, 30, 10, 'Amount of Insurance', job.insurance, 'center');
    doc.rect(x + 132, y + 111, 64, 10);
    const insuranceTitle = 'INSURANCE:';
    const insuranceText = 'If Carrier Offers Insurance and Such Insurance is requested in accordance with the Conditions noted in the amount to be insured in figures in box marked “Amount of insurance”.';
    doc.setFont('helvetica', 'bold').setFontSize(4.4);
    const insuranceTitleWidth = doc.getTextWidth(insuranceTitle);
    doc.text(insuranceTitle, x + 133, y + 113);
    doc.setFont('helvetica', 'normal').setFontSize(4.4);
    const firstLine = doc.splitTextToSize(insuranceText, 60 - insuranceTitleWidth)[0] ?? '';
    const remainingInsuranceText = insuranceText.slice(firstLine.length).trim();
    doc.text(firstLine, x + 133 + insuranceTitleWidth + 0.6, y + 113);
    doc.text(doc.splitTextToSize(remainingInsuranceText, 62), x + 133, y + 114.8, { lineHeightFactor: 1.02 });
    box(x, y + 121, 196, 16, 'Handling Information', job.handlingInformation);
    const top = y + 145;
    const cargoColumns = { pieces: 13, gross: 19, unit: 5, rateClass: 26, chargeable: 25, rate: 23, total: 22, nature: 63 };
    const cargoCell = (left: number, width: number, heading: string, content: string) => {
      doc.rect(left, top, width, 62);
      doc.setFont('helvetica', 'normal').setFontSize(5.3).text(heading, left + width / 2, top + 2.5, { align: 'center' });
      doc.line(left, top + 11, left + width, top + 11);
      doc.setFont('courier', 'bold').setFontSize(6.5).text(content, left + width / 2, top + 16, { align: 'center' });
    };
    let left = x;
    cargoCell(left, cargoColumns.pieces, 'No of\npieces\nRCP', String(line?.pcs ?? ''));
    doc.setFont('courier', 'bold').setFontSize(5.5).text('MARKS & NOS:-\n---------------', left + 1, top + 28);
    left += cargoColumns.pieces;
    cargoCell(left, cargoColumns.gross, 'Gross\nWeight', money(line?.grossWt ?? 0));
    left += cargoColumns.gross;
    cargoCell(left, cargoColumns.unit, 'kg\n\nlb', 'K');
    left += cargoColumns.unit;
    doc.rect(left, top, cargoColumns.rateClass, 62);
    doc.setFont('helvetica', 'normal').setFontSize(5.3).text('Rate Class', left + cargoColumns.rateClass / 2, top + 2.5, { align: 'center' });
    doc.line(left, top + 6, left + cargoColumns.rateClass, top + 6);
    doc.line(left + 5, top + 6, left + 5, top + 62);
    doc.setFont('helvetica', 'normal').setFontSize(5).text('Commodity\nItem No', left + 5 + (cargoColumns.rateClass - 5) / 2, top + 7.5, { align: 'center' });
    doc.line(left, top + 11, left + cargoColumns.rateClass, top + 11);
    doc.setFont('courier', 'bold').setFontSize(6.5).text(line?.cl ?? '', left + 2.5, top + 16, { align: 'center' });
    doc.setFont('courier', 'bold').setFontSize(6.5).text(line?.comdty ?? '', left + 5 + (cargoColumns.rateClass - 5) / 2, top + 16, { align: 'center' });
    left += cargoColumns.rateClass;
    cargoCell(left, cargoColumns.chargeable, 'Chargeable\nWeight', money(line?.chargeWt ?? 0));
    left += cargoColumns.chargeable;
    doc.rect(left, top, cargoColumns.rate, 62);
    doc.line(left, top + 11, left + cargoColumns.rate * 0.72, top + 2);
    doc.setFont('helvetica', 'normal').setFontSize(6).text('Rate', left + 5, top + 4.5);
    doc.setFont('helvetica', 'normal').setFontSize(6).text('Charge', left + cargoColumns.rate - 5, top + 9, { align: 'right' });
    doc.line(left, top + 11, left + cargoColumns.rate, top + 11);
    doc.setFont('courier', 'bold').setFontSize(6.5).text(money(line?.rate ?? 0), left + cargoColumns.rate / 2, top + 16, { align: 'center' });
    left += cargoColumns.rate;
    cargoCell(left, cargoColumns.total, 'Total', money(line?.total ?? 0));
    left += cargoColumns.total;
    doc.rect(left, top, cargoColumns.nature, 62);
    doc.setFont('helvetica', 'normal').setFontSize(6).text('Nature and Quantity of Goods\n(incl. Dimension or Volume)', left + cargoColumns.nature / 2, top + 3, { align: 'center' });
    doc.line(left, top + 11, left + cargoColumns.nature, top + 11);
    doc.setFont('courier', 'bold').setFontSize(6.5).text(job.saidToContain || line?.comdty || '', left + 2, top + 16);
    if (job.otherInformation) doc.setFont('courier', 'bold').setFontSize(6).text(doc.splitTextToSize(job.otherInformation, cargoColumns.nature - 4), left + 2, top + 50);
    const chargeTop = top + 62;
    const chargeWidth = 85;
    const signatureLeft = x + chargeWidth;
    const signatureWidth = 196 - chargeWidth;
    // Left: prepaid / collect and other-charge form columns.
    [8, 7, 7, 7, 7].forEach((height, index) => doc.rect(x, chargeTop + [0, 8, 15, 22, 29][index], chargeWidth, height));
    // Use the full charge block: the three legacy tabs are equal-width columns.
    const chargeTabWidth = chargeWidth / 3;
    slantedLabel(x, chargeTop, chargeTabWidth, 'Prepaid');
    slantedLabel(x + chargeTabWidth, chargeTop, chargeTabWidth, 'Weight Charge');
    slantedLabel(x + chargeTabWidth * 2, chargeTop, chargeTabWidth, 'Collect');
    // One divider directly under the middle Weight Charge tab.
    const weightChargeCenter = x + chargeWidth / 2;
    doc.line(weightChargeCenter, chargeTop + 4, weightChargeCenter, chargeTop + 8);
    const centeredChargeLabelWidth = 27;
    const centeredChargeLabelLeft = x + (chargeWidth - centeredChargeLabelWidth) / 2;
    slantedLabel(centeredChargeLabelLeft, chargeTop + 8, centeredChargeLabelWidth, 'Valuation Charge');
    doc.line(weightChargeCenter, chargeTop + 12, weightChargeCenter, chargeTop + 15);
    slantedLabel(centeredChargeLabelLeft, chargeTop + 15, centeredChargeLabelWidth, 'Tax');
    doc.line(weightChargeCenter, chargeTop + 19, weightChargeCenter, chargeTop + 22);
    const otherChargeLabelWidth = 66;
    const otherChargeLabelLeft = x + (chargeWidth - otherChargeLabelWidth) / 2;
    slantedLabel(otherChargeLabelLeft, chargeTop + 22, otherChargeLabelWidth, 'Total Other Charges Due Agent');
    doc.line(weightChargeCenter, chargeTop + 26, weightChargeCenter, chargeTop + 29);
    slantedLabel(otherChargeLabelLeft, chargeTop + 29, otherChargeLabelWidth, 'Total Other Charges Due Carrier');
    doc.line(weightChargeCenter, chargeTop + 33, weightChargeCenter, chargeTop + 36);
    doc.setFillColor(210, 210, 210).rect(x, chargeTop + 36, chargeWidth, 7, 'F');
    doc.rect(x, chargeTop + 36, chargeWidth, 7);
    doc.rect(x, chargeTop + 43, chargeWidth, 8);
    slantedLabel(x, chargeTop + 43, chargeWidth / 2, 'Total Prepaid');
    slantedLabel(x + chargeWidth / 2, chargeTop + 43, chargeWidth / 2, 'Total Collect');
    doc.line(weightChargeCenter, chargeTop + 47, weightChargeCenter, chargeTop + 51);
    doc.rect(x, chargeTop + 51, chargeWidth, 8);
    slantedLabel(x, chargeTop + 51, chargeWidth / 2, 'Currency Conversion Rates');
    slantedLabel(x + chargeWidth / 2, chargeTop + 51, chargeWidth / 2, 'CC Charges in Dest Currency');
    doc.line(weightChargeCenter, chargeTop + 55, weightChargeCenter, chargeTop + 60);
    // Legacy destination strip: 3 distinct cells, with tabs on the gray charge cells.
    const carrierUseWidth = chargeWidth / 2;
    const destinationChargeWidth = chargeWidth / 2;
    const totalCollectWidth = 34;
    doc.rect(x, chargeTop + 60, carrierUseWidth, 9);
    doc.setFillColor(210, 210, 210).rect(x + carrierUseWidth, chargeTop + 60, destinationChargeWidth, 9, 'F');
    doc.rect(x + carrierUseWidth, chargeTop + 60, destinationChargeWidth, 9);
    doc.setFillColor(210, 210, 210).rect(x + carrierUseWidth + destinationChargeWidth, chargeTop + 60, totalCollectWidth, 9, 'F');
    doc.rect(x + carrierUseWidth + destinationChargeWidth, chargeTop + 60, totalCollectWidth, 9);
    slantedLabel(x + carrierUseWidth, chargeTop + 60, destinationChargeWidth, 'Charges at Destination');
    slantedLabel(x + carrierUseWidth + destinationChargeWidth, chargeTop + 60, totalCollectWidth, 'Total Collect Charges');
    doc.setFont('helvetica', 'normal').setFontSize(5.5).text("For Carrier's Use only at Destination", x + 2, chargeTop + 64.5);
    doc.setFont('courier', 'bold').setFontSize(6.5).text(money(job.totals.totalAwbAmount), x + chargeWidth / 4, chargeTop + 49, { align: 'center' });
    doc.setFont('courier', 'bold').setFontSize(6.5).text(job.printing.printExRate === 'Y' ? money(job.printableExRate) : '', x + chargeWidth / 4, chargeTop + 57, { align: 'center' });

    // Right: other charges, certification, and carrier signature section.
    doc.rect(signatureLeft, chargeTop, signatureWidth, 22);
    doc.setFont('helvetica', 'bold').setFontSize(6).text('Other Charges', signatureLeft + 1, chargeTop + 3);
    doc.rect(signatureLeft, chargeTop + 22, signatureWidth, 21);
    const certification = 'Shipper certifies that the particulars on the face hereof are correct and that the goods are properly described and are in proper condition for carriage by air according to applicable national governmental regulations.';
    doc.setFont('helvetica', 'normal').setFontSize(4.2).text(doc.splitTextToSize(certification, signatureWidth - 3), signatureLeft + 1, chargeTop + 25, { lineHeightFactor: 1.02 });
    doc.setFont('courier', 'bold').setFontSize(7).text(job.printing.signatureLine || job.party.name, signatureLeft + signatureWidth / 2, chargeTop + 36, { align: 'center' });
    doc.setFont('helvetica', 'normal').setFontSize(6).text('Signature of Shipper or his Agent', signatureLeft + signatureWidth / 2, chargeTop + 41, { align: 'center' });
    doc.setLineDashPattern([1, 1], 0).line(signatureLeft, chargeTop + 40, signatureLeft + signatureWidth, chargeTop + 40).setLineDashPattern([], 0);
    doc.rect(signatureLeft, chargeTop + 43, signatureWidth, 8);
    doc.setFont('helvetica', 'normal').setFontSize(6.5).text('SIGNED BY THE AGENT ON BEHALF OF CARRIER', signatureLeft + 1, chargeTop + 47);
    doc.rect(signatureLeft, chargeTop + 51, signatureWidth, 9);
    doc.setFont('courier', 'bold').setFontSize(7).text(date(job.awbDate || job.jobDate), signatureLeft + 9, chargeTop + 56, { align: 'center' });
    doc.setFont('courier', 'bold').setFontSize(7).text(job.branch, signatureLeft + signatureWidth / 2, chargeTop + 56, { align: 'center' });
    doc.setFont('helvetica', 'normal').setFontSize(5.5).text('Executed on (Date)', signatureLeft + 9, chargeTop + 59, { align: 'center' });
    doc.setFont('helvetica', 'normal').setFontSize(5.5).text('at (Place)                 Signature of issuing Carrier or its Agent', signatureLeft + signatureWidth * 0.62, chargeTop + 59, { align: 'center' });
    doc.setFont('courier', 'bold').setFontSize(8).text(topLeftAwbHeader.replaceAll(' | ', ' '), x + w - 2, y + h - 7, { align: 'right' });
    doc.setFont('helvetica', 'bold').setFontSize(8).text(copy, x + w / 2, y + h + 4, { align: 'center' });
  });
  window.open(doc.output('bloburl'), '_blank');
}

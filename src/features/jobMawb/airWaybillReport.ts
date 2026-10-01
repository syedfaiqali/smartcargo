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
    const box = (left: number, top: number, width: number, height: number, label = '', value = '', align: 'left' | 'center' | 'right' = 'left') => {
      doc.rect(left, top, width, height);
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
    const topBox = (left: number, width: number, heading: string, content: string) => {
      doc.rect(left, y + 6, width, 24);
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
      doc.line(left, top, left + 5, top + 4); doc.line(left + 5, top + 4, left + width - 5, top + 4); doc.line(left + width - 5, top + 4, left + width, top); doc.line(left + 5, top + 4, left + 5, top + 6); doc.line(left + width - 5, top + 4, left + width - 5, top + 6);
      doc.setFont('helvetica', 'normal').setFontSize(5.4).text(text, left + width / 2, top + 3.2, { align: 'center' });
    };

    doc.setLineWidth(.35); doc.rect(x, y, w, h); doc.setLineWidth(.18);
    value(topLeftAwbHeader, x + 2, y + 4, 8);
    doc.setFont('courier', 'bold').setFontSize(8).text(topRightAwbHeader, x + w - 2, y + 4, { align: 'right' });
    topBox(x, 58, "Shipper's Name and Address", job.printing.printShipperNameAddress === 'Y' ? `${job.party.name}\n${job.party.address}` : '');
    topBox(x + 58, 44, "Shipper's Account Number", job.routing.accountNo);
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
    box(x, y + 30, 92, 27, "Consignee's Name and Address", job.printing.printConsigneeNameAddress === 'Y' ? `${job.consignee.name}\n${job.consignee.address}` : '');
    box(x + 92, y + 30, 44, 27, "Consignee's Account Number", '');
    box(x + 136, y + 30, 60, 27, 'Copies 1, 2 and 3 of this Air Waybill are originals and have the same validity.', 'It is agreed that the goods described herein are accepted in apparent good order and condition for carriage SUBJECT TO THE CONDITIONS OF CONTRACT ON THE REVERSE HEREOF. All goods may be carried by any other means including road or any other carrier.');
    box(x, y + 57, 92, 22, "Issuing Carrier's Agent Name and City", job.agents.clearingAgent || job.owner);
    box(x + 92, y + 57, 104, 22, 'Accounting Information', job.accountingInformationNotify || `${job.printing.printChargeType === 'PP' ? 'FREIGHT PREPAID' : 'FREIGHT COLLECT'}\nJOB NO. ${job.jobNo}`);
    box(x, y + 79, 45, 8, "Agent's IATA Code", job.agents.spoCode);
    box(x + 45, y + 79, 47, 8, 'Account No', job.routing.accountNo);
    box(x + 92, y + 79, 104, 8, '');
    box(x, y + 87, 100, 12, 'Airport of Departure/Addr. of First Carrier and Requested Routing', job.routing.airportOfDeparture);
    box(x + 100, y + 87, 55, 12, 'Reference Number', job.jobNo);
    box(x + 155, y + 87, 41, 12, 'Optional Shipping Information', '');
    const routingTop = y + 99;
    const routingColumns = [
      { width: 8, label: 'To', value: 'ADD' },
      { width: 20, label: 'By First Carrier', value: job.routing.flightNo1 },
      { width: 28, label: 'Routing and Destination', value: job.routing.destination },
      { width: 8, label: 'To', value: job.routing.legs[0]?.to ?? '' },
      { width: 8, label: 'By', value: job.routing.legs[0]?.by ?? '' },
      { width: 8, label: 'To', value: '' },
      { width: 8, label: 'By', value: '' },
      { width: 12, label: 'Currency', value: job.currency },
      { width: 9, label: 'CHGS\ncode', value: job.printing.printChargeType },
      { width: 11, label: 'WT/VAL\nPPD', value: job.printing.printChargeType === 'PP' ? 'P' : '' },
      { width: 13, label: 'Other\nCOLL', value: job.printing.printChargeType === 'PP' ? '' : 'P' },
      { width: 32, label: 'Declared Value for Carriage', value: job.declaredValCarriage },
      { width: 31, label: 'Declared Value for Customs', value: job.declaredValCustoms },
    ];
    let routingLeft = x;
    routingColumns.forEach((column) => {
      box(routingLeft, routingTop, column.width, 12, column.label, column.value, 'center');
      routingLeft += column.width;
    });
    const requestedFlight = job.routing.flightNo2 || job.routing.flightNo1;
    const requestedDate = date(job.routing.flightDate2 || job.routing.flightDate);
    box(x, y + 111, 58, 10, 'Airport of Destination', job.routing.destination);
    doc.rect(x + 58, y + 111, 40, 10);
    doc.line(x + 78, y + 115, x + 78, y + 121);
    doc.setFont('helvetica', 'normal').setFontSize(5.3).text('Requested Flight / Date', x + 78, y + 113.3, { align: 'center' });
    doc.setFont('courier', 'bold').setFontSize(6.5).text(requestedFlight, x + 68, y + 118.6, { align: 'center' });
    doc.setFont('courier', 'bold').setFontSize(6.5).text(requestedDate, x + 88, y + 118.6, { align: 'center' });
    box(x + 98, y + 111, 34, 10, 'Amount of Insurance', job.insurance, 'center');
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
    const top = y + 145; const cols = [12, 18, 22, 22, 18, 22, 82]; const heads = ['No. of\npieces\nRCP', 'Gross\nWeight', 'Rate Class\nCommodity', 'Chargeable\nWeight', 'Rate /\nCharge', 'Total', 'Nature and Quantity of Goods\n(incl. Dimensions or Volume)'];
    let left = x; cols.forEach((width, index) => { box(left, top, width, 62, heads[index], index === 0 ? String(line?.pcs ?? '') : index === 1 ? `${line?.grossWt ?? ''} kg` : index === 2 ? `${line?.cl ?? ''}\n${line?.comdty ?? ''}` : index === 3 ? String(line?.chargeWt ?? '') : index === 4 ? money(line?.rate ?? 0) : index === 5 ? money(line?.total ?? 0) : `${job.saidToContain || line?.comdty || ''}\n\n${job.otherInformation || ''}` , index === 6 ? 'left' : 'center'); left += width; });
    box(x, top + 62, 98, 10, '', `${money(job.totals.freight)}   ${money(job.totals.dueAgent)}`, 'center');
    box(x + 98, top + 62, 98, 30, 'Shipper certifies that the particulars on the face hereof are correct and that the goods are properly described and in proper condition for carriage by air.', `${job.printing.signatureLine || job.party.name}\nSignature of Shipper or his Agent`);
    box(x, top + 72, 98, 10, '', ''); box(x, top + 82, 98, 10, '', ''); box(x, top + 92, 98, 10, '', money(job.totals.dueAgent), 'right'); box(x, top + 102, 98, 10, '', money(job.totals.dueCarrier), 'right');
    slantedLabel(x, top + 62, 25, 'Prepaid'); slantedLabel(x + 25, top + 62, 27, 'Weight Charge'); slantedLabel(x + 52, top + 62, 24, 'Collect'); slantedLabel(x, top + 72, 58, 'Valuation Charge'); slantedLabel(x, top + 82, 58, 'Tax'); slantedLabel(x, top + 92, 88, 'Total Other Charges Due Agent'); slantedLabel(x, top + 102, 88, 'Total Other Charges Due Carrier');
    box(x, top + 112, 98, 10, 'Total Prepaid', money(job.totals.totalAwbAmount), 'center'); box(x + 98, top + 92, 98, 30, 'SIGNED BY THE AGENT ON BEHALF OF CARRIER', `${date(job.awbDate || job.jobDate)}\nExecuted on (Date)                         Signature of Issuing Carrier or its Agent`);
    box(x, top + 122, 98, 9, 'Currency Conversion Rates', job.printing.printExRate === 'Y' ? money(job.printableExRate) : ''); box(x + 98, top + 122, 98, 9, 'Total Collect Charges', '');
    value(awbNumber, x + w - 2, y + h - 7, 8); doc.text(awbNumber, x + w - 2, y + h - 7, { align: 'right' });
    doc.setFont('helvetica', 'bold').setFontSize(8).text(copy, x + w / 2, y + h + 4, { align: 'center' });
  });
  window.open(doc.output('bloburl'), '_blank');
}

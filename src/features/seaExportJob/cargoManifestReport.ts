import { jsPDF } from 'jspdf';
import { agentRepo, shippingLineRepo } from '../../data/masterDataService';
import { seaExportJobRepo } from '../../data/seaExportJobService';
import { SeaExportJob } from '../../domain/seaExportJob';
import { createExcelWorkbook } from '../../utils/excelWorkbook';

const clean = (value: unknown) => String(value ?? '').trim();
const date = (value: string) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('en-GB') : '';
const resolveCode = (value: string, rows: { code: string; name: string }[]) => {
  const code = value.split(' - ')[0].trim();
  return rows.find((row) => row.code === code)?.name || value;
};

async function loadHeader() {
  const response = await fetch(`${import.meta.env.BASE_URL}masum-logistics-header.png`);
  if (!response.ok) throw new Error('Could not load the company letterhead.');
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function manifestJobs(job: SeaExportJob) {
  if (!job.consolNo) return [job];
  const matches = seaExportJobRepo.find((item) => item.branch === job.branch && item.consolNo === job.consolNo && !item.status.void);
  return matches.some((item) => item.id === job.id) ? matches : [job, ...matches];
}

function cargoRows(jobs: SeaExportJob[]) {
  return jobs.flatMap((item) => {
    const bl = item.bl;
    const containers = item.containers.filter((row) => row.containerNo || row.sealNo);
    return (containers.length ? containers : [undefined]).map((container) => ({
      hblNo: clean(bl.hblNo || item.hblNo),
      packages: [container?.noOfPkgs || item.noOfPackages, container?.unit || item.unit].filter((part) => part !== '' && part !== 0).join(' '),
      description: clean(bl.descriptionOfGoods || item.commodity),
      notify: clean(bl.notify || bl.consignee),
      grossWeight: container?.grossWeight || item.grossWeight,
      netWeight: container?.netWeight || item.netWeight,
      measurement: container?.cbm || item.cbm,
      containerNo: clean(container?.containerNo),
      size: clean(container?.sizeType),
      sealNo: clean(container?.sealNo),
      jobNo: item.jobNo,
    }));
  });
}

export async function createCargoManifestPdf(job: SeaExportJob) {
  const header = await loadHeader();
  const jobs = manifestJobs(job);
  const rows = cargoRows(jobs);
  const deliveryAgent = agentRepo.list().find((agent) => agent.code === job.deliveryAgent.split(' - ')[0]);
  const shippingLine = resolveCode(job.shippingLine, shippingLineRepo.list());
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210, x = 12, right = 198;
  doc.addImage(header, 'PNG', x, 4, pageW - x * 2, 31, undefined, 'FAST');
  const text = (value: string, xx: number, yy: number, size = 7, bold = false, align: 'left' | 'center' | 'right' = 'left') => {
    if (!value) return;
    doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size).text(value, xx, yy, { align, maxWidth: 180 });
  };
  const box = (xx: number, yy: number, w: number, h: number, value: string, size = 6.5, bold = false) => {
    doc.rect(xx, yy, w, h);
    const lines = value ? doc.splitTextToSize(value, w - 2) as string[] : [];
    if (lines.length) {
      doc.setFont('helvetica', bold ? 'bold' : 'normal').setFontSize(size);
      doc.text(lines.slice(0, Math.max(1, Math.floor((h - 1) / 3))), xx + 1, yy + 3.5);
    }
  };
  let y = 42;
  doc.setLineWidth(.3).line(x, y - 4, right, y - 4);
  text(`Job No. : ${job.jobNo}`, x + 1, y, 8, true);
  text(`Consol No. : ${job.consolNo}`, x + 1, y + 6, 8, true);
  text('CONSOLE MANIFEST', 105, y + 4, 14, true, 'center');
  doc.rect(65, y - 4, 80, 11);
  text(`Date : ${date(job.date)}`, right - 1, y, 8, true, 'right');
  y += 15;

  const agentName = deliveryAgent?.name || job.deliveryAgent || job.foreignAgent;
  const agentLines = [agentName, deliveryAgent?.address || '', deliveryAgent?.phoneNo ? `Tel: ${deliveryAgent.phoneNo}` : ''].filter(Boolean);
  box(x, y, 82, 29, '', 7);
  text('M/S.', x + 2, y + 5, 8, true);
  agentLines.forEach((line, index) => text(line, x + 2, y + 10 + index * 4, 7.3, index === 0));
  const summary = [
    ['HBL No.', clean(job.bl.hblNo || job.hblNo)],
    ['MBL No.', clean(job.bl.mblNo || job.mblNo)],
    ['Vessel', clean(job.bl.vessel || job.vessel)],
    ['Sailing Date', date(job.sailingDate)],
    ['ETA', date(job.etaAtDest)],
    ['Shipping Line', shippingLine],
    ['Port of Load.', clean(job.bl.placeOfLoading || job.portOfLoad)],
    ['Destination', clean(job.bl.placeOfDischarge || job.destination)],
    ['Container No.', job.containers.map((item) => item.containerNo).filter(Boolean).join(', ')],
  ];
  let sy = y + 2;
  summary.forEach(([label, val]) => { text(label, 101, sy, 6.5, true); text(':', 126, sy, 6.5, true); text(val, 129, sy, 6.5); sy += 3.5; });
  y += 34;

  const widths = [26, 34, 42, 39, 26, 19];
  const headings = ['HBL No.', 'Pkgs & Unit', 'Description', 'Notify', 'Weight (Kg)', 'Measurement'];
  const drawTableHeader = () => {
    let xx = x;
    headings.forEach((heading, index) => { box(xx, y, widths[index], 8, heading, 6.3, true); xx += widths[index]; });
    y += 8;
  };
  drawTableHeader();
  let cx = x;
  rows.forEach((row) => {
    if (y + 12 > 260) {
      doc.addPage();
      doc.addImage(header, 'PNG', x, 4, pageW - x * 2, 31, undefined, 'FAST');
      y = 42;
      text(`CONSOLE MANIFEST - ${job.consolNo || job.jobNo}`, 105, y, 12, true, 'center');
      y += 6;
      drawTableHeader();
    }
    const values = [row.hblNo, row.packages, row.description, row.notify, row.grossWeight ? `${row.grossWeight} / ${row.netWeight}` : '', row.measurement ? `${row.measurement} CBM` : ''];
    const h = 12;
    cx = x; values.forEach((value, index) => { box(cx, y, widths[index], h, value, 6.1); cx += widths[index]; });
    y += h;
  });
  if (!rows.length) { cx = x; widths.forEach((w) => { box(cx, y, w, 12, ''); cx += w; }); y += 12; }
  if (y + 62 > 280) {
    doc.addPage();
    doc.addImage(header, 'PNG', x, 4, pageW - x * 2, 31, undefined, 'FAST');
    y = 42;
    text(`CONSOLE MANIFEST - ${job.consolNo || job.jobNo}`, 105, y, 12, true, 'center');
    y += 8;
  }
  cx = x;
  const totalPackages = rows.reduce((sum, row) => sum + (Number(row.packages.match(/^\d+(?:\.\d+)?/)?.[0]) || 0), 0);
  const totalGross = rows.reduce((sum, row) => sum + row.grossWeight, 0);
  const totalNet = rows.reduce((sum, row) => sum + row.netWeight, 0);
  const totalCbm = rows.reduce((sum, row) => sum + row.measurement, 0);
  box(cx, y, widths[0] + widths[1] + widths[2] + widths[3], 8, 'Total', 7, true); cx += widths[0] + widths[1] + widths[2] + widths[3];
  box(cx, y, widths[4], 8, `${totalGross.toFixed(2)} / ${totalNet.toFixed(2)}`, 6.3, true); cx += widths[4];
  box(cx, y, widths[5], 8, totalCbm.toFixed(4), 6.3, true);
  y += 13;

  box(x, y, 56, 38, '', 7);
  doc.setFillColor(230, 230, 230).rect(x, y, 56, 7, 'F');
  text('Docs Enclosed:', x + 2, y + 5, 7, true);
  const enclosed = ['MBL Copy/Original', 'HBL Copy/Original', 'TELEX RELEASE', 'SURRENDERED', 'ORIGINAL ISSUED', 'DRAFT HBL / MBL'];
  enclosed.forEach((line, index) => text(`-${line}`, x + 2, y + 12 + index * 4.2, 6.3));
  text('*** This is System generated Manifest, does not require any signature ***', 105, 287, 8, true, 'center');
  doc.setProperties({ title: `Cargo Manifest - ${job.consolNo || job.jobNo}`, subject: `Cargo manifest for ${job.consolNo || job.jobNo}` });
  return doc;
}

export function createCargoManifestExcel(job: SeaExportJob) {
  const rows = cargoRows(manifestJobs(job));
  return createExcelWorkbook([{ name: 'Cargo Manifest', rows: [
    ['CONSOLE MANIFEST', ''], ['Branch', job.branch], ['Job No.', job.jobNo], ['Consol No.', job.consolNo], ['Date', date(job.date)],
    ['Shipping Line', resolveCode(job.shippingLine, shippingLineRepo.list())], ['Vessel', job.bl.vessel || job.vessel], ['Sailing Date', date(job.sailingDate)],
    ['ETA', date(job.etaAtDest)], ['Port of Load', job.bl.placeOfLoading || job.portOfLoad], ['Destination', job.bl.placeOfDischarge || job.destination],
    [], ['HBL No.', 'Packages', 'Description', 'Notify', 'Gross Weight', 'Net Weight', 'Measurement', 'Container No.', 'Size / Type', 'Seal No.', 'Job No.'],
    ...rows.map((row) => [row.hblNo, row.packages, row.description, row.notify, row.grossWeight, row.netWeight, row.measurement, row.containerNo, row.size, row.sealNo, row.jobNo]),
  ], headerRows: [0, 12] }]);
}

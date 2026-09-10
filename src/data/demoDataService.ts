import { v4 as uuid } from 'uuid';
import { isSeeded, markSeeded } from './localStore';
import { awbStockRepo } from './awbStockService';
import { jobRepo, nextJobNo, nextHawbNo, syncHouseAwbsOnMaster } from './jobService';
import { createEmptyJob } from '../domain/jobFactory';
import { recomputeChargeLineTotal, recomputeChargesTotals, recomputeJobTotals } from '../features/jobMawb/jobCalculations';
import { localInvoiceRepo, nextInvoiceNo, lookupJobRef } from './localInvoiceService';
import { createEmptyLocalInvoice } from '../domain/localInvoiceFactory';
import { recomputeInvoiceLine, recomputeInvoiceTotals } from '../features/localInvoice/invoiceCalculations';
import { payableRepo, nextCreditNoteNo, lookupMasterJob } from './otherChargesPayableService';
import { createEmptyOtherChargesPayable } from '../domain/otherChargesPayableFactory';
import { recomputeChargeLine, recomputePayableTotals } from '../features/otherChargesPayable/payableCalculations';
import { foreignAgentInvoiceRepo, nextDocumentNo } from './foreignAgentInvoiceService';
import { createEmptyForeignAgentInvoice } from '../domain/foreignAgentInvoiceFactory';
import { recomputeAgentInvoiceTotals } from '../features/foreignAgentInvoice/agentInvoiceCalculations';
import { seaExportJobRepo, nextSeaJobNo } from './seaExportJobService';
import { createEmptySeaExportJob } from '../domain/seaExportJobFactory';
import { recomputeJobChargesTotals } from '../features/seaExportJob/seaJobCalculations';
import { voucherRepo, nextVoucherNo, finalizeVoucher } from './voucherService';
import { createEmptyVoucher } from '../domain/voucherFactory';

function seedDemoData() {
  if (isSeeded('demoData')) return;

  const branch = 'KHI';

  // --- 1. Air Waybill Stock ---
  const awbNos = ['214-50001001', '214-50001002', '214-50001003', '214-50001004'];
  awbNos.forEach((awbNo, i) => {
    awbStockRepo.save({
      id: uuid(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      awbNo,
      airlineCode: 'PK',
      receiptDate: '2026-08-01',
      ownerCode: 'KHI-OWN',
      awbUsed: 'N',
      awbDate: '',
    });
  });

  // --- 2. Job (MAWB) — finalized, with charge lines ---
  const masterJob = createEmptyJob('MAWB', branch);
  masterJob.jobNo = nextJobNo('MAWB', branch);
  masterJob.jobDate = '2026-08-05';
  masterJob.jobType = 'EXPORT';
  masterJob.mawbNo = awbNos[0];
  masterJob.awbDate = '2026-08-05';
  masterJob.owner = 'KHI-OWN';
  masterJob.party = { creditLimit: 500000, partyCode: 'P-1001', agentParty: '', name: 'Al Baraka Textiles Ltd', address: 'Site Area, Karachi' };
  masterJob.consignee = { consolidation: 'Y', code: 'FA-201', name: 'Gulf Cargo Partners LLC', address: 'Dubai, UAE' };
  masterJob.routing = {
    ...masterJob.routing,
    airportOfDeparture: 'KHI',
    destination: 'DXB',
    legs: [{ to: 'DXB', by: 'PK-302' }, { to: '', by: '' }, { to: '', by: '' }],
    formENo: 'FE-2026-0088',
    sbNo: 'SB-99881',
  };
  masterJob.agents = { ...masterJob.agents, clearingAgent: 'CA-01', deliveryAgent: 'DA-01', spoCode: 'SPO-01', runNo: 'R-101' };
  masterJob.currency = 'USD';
  masterJob.exRate = 278.5;
  masterJob.printableExRate = 278.5;
  masterJob.chargeLines = [
    recomputeChargeLineTotal({ id: uuid(), rcp: 'Q', pcs: 12, grossWt: 480, cl: 'M', comdty: 'TEXTILES', chargeWt: 500, dimensionWt: 0, rate: 3.2, ratePkr: 0, total: 0, totalPkr: 0 }, 278.5),
  ];
  masterJob.charges = recomputeChargesTotals({
    ...masterJob.charges,
    dueCarrierLines: masterJob.charges.dueCarrierLines.map((l, i) => (i === 0 ? { ...l, rate: 45, charges: 45, chargesPkr: 45 * 278.5 } : l)),
  });
  masterJob.totals = recomputeJobTotals(masterJob);
  masterJob.status = { final: true, void: false, posted: false };
  jobRepo.save(masterJob);
  awbStockRepo.save({ ...awbStockRepo.get(awbStockRepo.find((a) => a.awbNo === awbNos[0])[0].id)!, awbUsed: 'Y', awbDate: '2026-08-05', usedByJobNo: masterJob.jobNo });

  // --- 3. Job (HAWB) linked to the Master, finalized ---
  const houseJob = createEmptyJob('HAWB', branch);
  houseJob.jobNo = nextJobNo('HAWB', branch);
  houseJob.hawbNo = nextHawbNo(branch);
  houseJob.parentJobNo = masterJob.jobNo;
  houseJob.jobDate = '2026-08-06';
  houseJob.jobType = 'EXPORT';
  houseJob.mawbNo = masterJob.mawbNo;
  houseJob.awbDate = masterJob.awbDate;
  houseJob.owner = 'KHI-OWN';
  houseJob.party = { creditLimit: 250000, partyCode: 'P-1002', agentParty: '', name: 'Indus Garments (Pvt) Ltd', address: 'SITE-II, Karachi' };
  houseJob.consignee = { consolidation: 'N', code: 'FA-202', name: 'Far East Freight Co.', address: 'Hong Kong' };
  houseJob.routing = { ...houseJob.routing, airportOfDeparture: 'KHI', destination: 'DXB' };
  houseJob.currency = 'USD';
  houseJob.exRate = 278.5;
  houseJob.chargeLines = [recomputeChargeLineTotal({ id: uuid(), rcp: 'Q', pcs: 6, grossWt: 200, cl: 'M', comdty: 'GARMENTS', chargeWt: 210, dimensionWt: 0, rate: 3.5, ratePkr: 0, total: 0, totalPkr: 0 }, 278.5)];
  houseJob.totals = recomputeJobTotals(houseJob);
  houseJob.status = { final: true, void: false, posted: false };
  jobRepo.save(houseJob);
  syncHouseAwbsOnMaster(masterJob.jobNo);

  // --- 4. Local Invoice against the Master, finalized ---
  let invoice = createEmptyLocalInvoice(branch);
  invoice.invoiceNo = nextInvoiceNo(branch);
  invoice.invoiceDate = '2026-08-07';
  const masterRef = lookupJobRef(masterJob.jobNo);
  if (masterRef) invoice.master = { jobNo: masterRef.jobNo, jobDate: masterRef.jobDate, awbNo: masterRef.awbNo, awbDate: masterRef.awbDate, pp: 'PP', refNo: '' };
  invoice.ownerCode = 'KHI-OWN';
  invoice.partyCode = 'P-1001';
  invoice.partyName = 'Al Baraka Textiles Ltd';
  invoice.partyAddress = 'Site Area, Karachi';
  invoice.airportOfDeparture = 'KHI';
  invoice.destination = 'DXB';
  invoice.spoCode = 'SPO-01';
  invoice.currency1 = 'USD';
  invoice.exRate1 = 278.5;
  invoice.bankCode = 'BNK-01';
  invoice.bankDetailText = 'A/C 001-234567-01, Main Branch, Karachi';
  invoice.invoiceLines = [
    recomputeInvoiceLine({ id: uuid(), pcs: 12, grossWeight: 480, cl: 'M', comdty: 'TEXTILES', chWeight: 500, curr: 'USD', rate: 3.2, ratePkr: 0, freight: 0, freightPkr: 0 }, 278.5),
  ];
  invoice.salesTaxPercent = 0;
  invoice.commissionPercent = 5;
  invoice.whtPercent = 4;
  invoice = recomputeInvoiceTotals(invoice);
  invoice.status = { final: true, void: false, posted: false };
  localInvoiceRepo.save(invoice);

  // --- 5. Other Charges Payable against the Master, finalized ---
  let payable = createEmptyOtherChargesPayable(branch);
  payable.creditNoteNo = nextCreditNoteNo(branch);
  payable.date = '2026-08-08';
  payable.payableType = 'TRUCKING';
  payable.partyCode = 'P-1003';
  payable.partyName = 'Sindh Rice Exporters';
  payable.partyAddress = 'Korangi, Karachi';
  const masterLookup = lookupMasterJob(masterJob.jobNo);
  if (masterLookup) {
    payable.mJobNo = masterJob.jobNo;
    payable.mawbNo = masterLookup.mawbNo;
    payable.jobYear = masterLookup.jobYear;
    payable.grossWeight = masterLookup.grossWeight;
    payable.chargeWeight = masterLookup.chargeWeight;
  }
  payable.currency1 = 'PKR';
  payable.exRate1 = 1;
  payable.billNo = 'BILL-7788';
  payable.billDate = '2026-08-08';
  payable.chargeLines = [
    recomputeChargeLine({ ...payable.chargeLines[0], qty: 1, rate: 15000 }, 1),
    recomputeChargeLine({ id: uuid(), code: 'TERMINAL', description: 'Terminal Handling', wtPcBasis: 'WT', curr: 'PKR', qty: 500, rate: 8, fAmount: 0, pkrAmount: 0 }, 1),
  ];
  payable.allocationLines = [{ id: uuid(), jobNo: masterJob.jobNo, hawbNo: houseJob.hawbNo ?? '', pcs: 12, grossWeight: 480, chargeWeight: 500, cost: 19000, partyName: 'Al Baraka Textiles Ltd' }];
  payable = recomputePayableTotals(payable);
  payable.status = { final: true };
  payableRepo.save(payable);

  // --- 6. Invoices To Foreign Agents against the Master, finalized ---
  const agentInvoice = createEmptyForeignAgentInvoice('INVOICE_TO', branch);
  agentInvoice.documentNo = nextDocumentNo('INVOICE_TO', branch);
  agentInvoice.documentDate = '2026-08-09';
  agentInvoice.mawbJobNo = masterJob.jobNo;
  agentInvoice.mawbNo = masterJob.mawbNo;
  agentInvoice.mawbDate = masterJob.awbDate;
  agentInvoice.mawbJobYear = 2026;
  agentInvoice.fAgentCode = 'FA-201';
  agentInvoice.fAgentName = 'Gulf Cargo Partners LLC';
  agentInvoice.origin = 'KHI';
  agentInvoice.destination = 'DXB';
  agentInvoice.pieces = 12;
  agentInvoice.grossWeight = 480;
  agentInvoice.chargeWeight = 500;
  agentInvoice.currencyCode = 'USD';
  agentInvoice.exchangeRate = 278.5;
  agentInvoice.allocationLines = [{ id: uuid(), jobNo: masterJob.jobNo, hawbNo: '', pcs: 12, grWeight: 480, chWeight: 500, cost: 1600, partyName: 'Al Baraka Textiles Ltd' }];
  agentInvoice.chargeLines = [
    { id: uuid(), side: 'SELLING', code: 'FRT', description: 'Freight Selling', rate: 1600, charges: 1600 },
    { id: uuid(), side: 'BUYING', code: 'FRT', description: 'Freight Buying', rate: 1200, charges: 1200 },
  ];
  agentInvoice.profitSharePercent = 50;
  agentInvoice.handlingLines = [{ id: uuid(), code: 'HDL', description: 'Handling Charges', rate: 50, charges: 50 }];
  const finalAgentInvoice = { ...recomputeAgentInvoiceTotals(agentInvoice), status: { final: true, void: false, posted: false } };
  foreignAgentInvoiceRepo.save(finalAgentInvoice);

  // --- 6b. Credit Note To Foreign Agent — adjustment against the invoice above, finalized ---
  const creditNoteTo = createEmptyForeignAgentInvoice('CREDIT_NOTE_TO', branch);
  creditNoteTo.documentNo = nextDocumentNo('CREDIT_NOTE_TO', branch);
  creditNoteTo.documentDate = '2026-08-11';
  creditNoteTo.mawbJobNo = masterJob.jobNo;
  creditNoteTo.mawbNo = masterJob.mawbNo;
  creditNoteTo.mawbDate = masterJob.awbDate;
  creditNoteTo.mawbJobYear = 2026;
  creditNoteTo.fAgentCode = 'FA-201';
  creditNoteTo.fAgentName = 'Gulf Cargo Partners LLC';
  creditNoteTo.origin = 'KHI';
  creditNoteTo.destination = 'DXB';
  creditNoteTo.pieces = 12;
  creditNoteTo.grossWeight = 480;
  creditNoteTo.chargeWeight = 500;
  creditNoteTo.currencyCode = 'USD';
  creditNoteTo.exchangeRate = 278.5;
  creditNoteTo.remarks = 'Rate adjustment — Freight Selling overcharged on original invoice';
  creditNoteTo.chargeLines = [{ id: uuid(), side: 'SELLING', code: 'ADJ', description: 'Freight Rate Adjustment', rate: -80, charges: -80 }];
  const finalCreditNoteTo = { ...recomputeAgentInvoiceTotals(creditNoteTo), status: { final: true, void: false, posted: false } };
  foreignAgentInvoiceRepo.save(finalCreditNoteTo);

  // --- 6c. Invoice/Dr. Note Received From Foreign Agent — agent billing the company back, finalized ---
  const invoiceReceived = createEmptyForeignAgentInvoice('INVOICE_RECEIVED', branch);
  invoiceReceived.documentNo = nextDocumentNo('INVOICE_RECEIVED', branch);
  invoiceReceived.documentDate = '2026-08-12';
  invoiceReceived.mawbJobNo = masterJob.jobNo;
  invoiceReceived.mawbNo = masterJob.mawbNo;
  invoiceReceived.mawbDate = masterJob.awbDate;
  invoiceReceived.mawbJobYear = 2026;
  invoiceReceived.fAgentCode = 'FA-202';
  invoiceReceived.fAgentName = 'Far East Freight Co.';
  invoiceReceived.origin = 'KHI';
  invoiceReceived.destination = 'HKG';
  invoiceReceived.pieces = 6;
  invoiceReceived.grossWeight = 200;
  invoiceReceived.chargeWeight = 210;
  invoiceReceived.currencyCode = 'USD';
  invoiceReceived.exchangeRate = 278.5;
  invoiceReceived.chargeLines = [
    { id: uuid(), side: 'BUYING', code: 'FRT', description: 'Freight Buying', rate: 700, charges: 700 },
    { id: uuid(), side: 'SELLING', code: 'FRT', description: 'Freight Selling', rate: 900, charges: 900 },
  ];
  invoiceReceived.handlingLines = [{ id: uuid(), code: 'HDL', description: 'Handling Charges', rate: 30, charges: 30 }];
  const finalInvoiceReceived = { ...recomputeAgentInvoiceTotals(invoiceReceived), status: { final: true, void: false, posted: false } };
  foreignAgentInvoiceRepo.save(finalInvoiceReceived);

  // --- 6d. Credit Note Received From Foreign Agent — adjustment against the invoice above, finalized ---
  const creditNoteReceived = createEmptyForeignAgentInvoice('CREDIT_NOTE_RECEIVED', branch);
  creditNoteReceived.documentNo = nextDocumentNo('CREDIT_NOTE_RECEIVED', branch);
  creditNoteReceived.documentDate = '2026-08-13';
  creditNoteReceived.mawbJobNo = masterJob.jobNo;
  creditNoteReceived.mawbNo = masterJob.mawbNo;
  creditNoteReceived.mawbDate = masterJob.awbDate;
  creditNoteReceived.mawbJobYear = 2026;
  creditNoteReceived.fAgentCode = 'FA-202';
  creditNoteReceived.fAgentName = 'Far East Freight Co.';
  creditNoteReceived.origin = 'KHI';
  creditNoteReceived.destination = 'HKG';
  creditNoteReceived.pieces = 6;
  creditNoteReceived.grossWeight = 200;
  creditNoteReceived.chargeWeight = 210;
  creditNoteReceived.currencyCode = 'USD';
  creditNoteReceived.exchangeRate = 278.5;
  creditNoteReceived.remarks = 'Credit for short-shipment on House job';
  creditNoteReceived.chargeLines = [{ id: uuid(), side: 'BUYING', code: 'ADJ', description: 'Freight Buying Adjustment', rate: -50, charges: -50 }];
  const finalCreditNoteReceived = { ...recomputeAgentInvoiceTotals(creditNoteReceived), status: { final: true, void: false, posted: false } };
  foreignAgentInvoiceRepo.save(finalCreditNoteReceived);

  // --- 7. Sea Export Job, finalized ---
  const seaJob = createEmptySeaExportJob(branch);
  seaJob.jobNo = nextSeaJobNo(branch);
  seaJob.date = '2026-08-10';
  seaJob.jobType = 'EXPORT';
  seaJob.partyCode = 'P-1003';
  seaJob.partyName = 'Sindh Rice Exporters';
  seaJob.commodity = 'RICE';
  seaJob.shippingLine = 'MAERSK';
  seaJob.portOfLoad = 'PKKHI';
  seaJob.destination = 'AEJEA';
  seaJob.lclFcl = 'FCL';
  seaJob.bookingNo = 'BKG-5541';
  seaJob.mblNo = 'MBL-8890021';
  seaJob.hblNo = 'HBL-100221';
  seaJob.vessel = 'MSC ISABELLA';
  seaJob.voyage = 'V.221E';
  seaJob.grossWeight = 18000;
  seaJob.netWeight = 17500;
  seaJob.cbm = 32;
  seaJob.currencyCode = 'USD';
  seaJob.exchangeRate = 278.5;
  seaJob.jobCharges = {
    ...seaJob.jobCharges,
    lines: [
      { id: uuid(), code: 'OFR', description: 'Ocean Freight', curr: 'USD', sellFAmount: 2200, buyFAmount: 1800 },
      { id: uuid(), code: 'THC', description: 'Terminal Handling', curr: 'USD', sellFAmount: 150, buyFAmount: 100 },
    ],
  };
  const finalSeaJob = { ...recomputeJobChargesTotals(seaJob), status: { final: true, void: false, posted: false, closed: false } };
  seaExportJobRepo.save(finalSeaJob);

  // --- 8. Vouchers: a Receipt Voucher clearing part of the Local Invoice, a Payment Voucher clearing the Payable, a balanced Journal Voucher ---
  const receiptVoucher = createEmptyVoucher('RECEIPT', branch);
  receiptVoucher.voucherNo = nextVoucherNo('RECEIPT', branch);
  receiptVoucher.voucherDate = '2026-08-15';
  receiptVoucher.partyCode = invoice.partyCode;
  receiptVoucher.partyName = invoice.partyName;
  receiptVoucher.bankCode = 'BNK-01';
  receiptVoucher.currencyCode = 'PKR';
  receiptVoucher.exchangeRate = 1;
  const partialAmount = Math.round(invoice.invoiceTotal * 0.6);
  receiptVoucher.clearingLines = [
    { id: uuid(), sourceType: 'LOCAL_INVOICE', sourceId: invoice.id, sourceDocNo: invoice.invoiceNo, jobNo: masterJob.jobNo, amountCleared: partialAmount },
  ];
  receiptVoucher.amount = partialAmount;
  const savedReceiptVoucher = voucherRepo.save(receiptVoucher);
  finalizeVoucher(savedReceiptVoucher.id);

  const paymentVoucher = createEmptyVoucher('PAYMENT', branch);
  paymentVoucher.voucherNo = nextVoucherNo('PAYMENT', branch);
  paymentVoucher.voucherDate = '2026-08-16';
  paymentVoucher.partyCode = payable.partyCode;
  paymentVoucher.partyName = payable.partyName;
  paymentVoucher.bankCode = 'BNK-02';
  paymentVoucher.currencyCode = 'PKR';
  paymentVoucher.exchangeRate = 1;
  paymentVoucher.clearingLines = [
    { id: uuid(), sourceType: 'OTHER_CHARGES_PAYABLE', sourceId: payable.id, sourceDocNo: payable.creditNoteNo, jobNo: masterJob.jobNo, amountCleared: payable.totalCharges },
  ];
  paymentVoucher.amount = payable.totalCharges;
  const savedPaymentVoucher = voucherRepo.save(paymentVoucher);
  finalizeVoucher(savedPaymentVoucher.id);

  const journalVoucher = createEmptyVoucher('JOURNAL', branch);
  journalVoucher.voucherNo = nextVoucherNo('JOURNAL', branch);
  journalVoucher.voucherDate = '2026-08-17';
  journalVoucher.remarks = 'Commission income recognition for August exports';
  journalVoucher.journalLines = [
    { id: uuid(), accountHead: 'Commission Income', description: 'Job ' + masterJob.jobNo, debit: 0, credit: 5000 },
    { id: uuid(), accountHead: 'WHT Receivable', description: 'Job ' + masterJob.jobNo, debit: 5000, credit: 0 },
  ];
  journalVoucher.amount = 5000;
  journalVoucher.final = true;
  voucherRepo.save(journalVoucher);

  markSeeded('demoData');
}

seedDemoData();

import { v4 as uuid } from 'uuid';
import { AwbRangeCheckResult, AwbStock, AwbStockSummary } from '../domain/awbStock';
import { Repository } from './repository';

export const awbStockRepo = new Repository<AwbStock>('awbStock');

const nowIso = () => new Date().toISOString();

export interface AwbStockFilter {
  airlineCode?: string;
  ownerCode?: string;
  startReceiptDate?: string;
  endReceiptDate?: string;
  awbUsed?: 'BOTH' | 'Y' | 'N';
}

export function searchAwbStock(filter: AwbStockFilter): AwbStock[] {
  return awbStockRepo.find((item) => {
    if (filter.airlineCode && item.airlineCode !== filter.airlineCode) return false;
    if (filter.ownerCode && item.ownerCode !== filter.ownerCode) return false;
    if (filter.startReceiptDate && item.receiptDate < filter.startReceiptDate) return false;
    if (filter.endReceiptDate && item.receiptDate > filter.endReceiptDate) return false;
    if (filter.awbUsed && filter.awbUsed !== 'BOTH' && item.awbUsed !== filter.awbUsed) return false;
    return true;
  });
}

export function getStockSummary(airlineCode: string): AwbStockSummary {
  const items = awbStockRepo.find((i) => i.airlineCode === airlineCode);
  const used = items.filter((i) => i.awbUsed === 'Y').length;
  return { total: items.length, used, unused: items.length - used };
}

export function createSingleAwb(input: {
  awbNo: string;
  airlineCode: string;
  receiptDate: string;
  ownerCode: string;
  awbUsed: 'Y' | 'N';
  awbDate: string;
}): AwbStock {
  const record: AwbStock = {
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    ...input,
  };
  return awbStockRepo.save(record);
}

/** Zero-pads and increments the numeric suffix of an AWB number, keeping any non-numeric prefix intact. */
function incrementAwbNo(awbNo: string): string | null {
  const match = awbNo.match(/^(.*?)(\d+)$/);
  if (!match) return null;
  const [, prefix, digits] = match;
  const next = (parseInt(digits, 10) + 1).toString().padStart(digits.length, '0');
  return `${prefix}${next}`;
}

function enumerateRange(start: string, end: string): string[] {
  const result: string[] = [];
  let current = start;
  let guard = 0;
  while (guard < 100000) {
    result.push(current);
    if (current === end) break;
    const next = incrementAwbNo(current);
    if (!next) break;
    current = next;
    guard += 1;
  }
  return result;
}

/**
 * IATA AWB numbers have a seven-digit serial and a final check digit.  The
 * check digit is the serial number's remainder when divided by seven.
 */
export function calculateAwbCheckDigit(serial: string): string {
  if (!/^\d{7}$/.test(serial)) return '';
  return String(Number(serial) % 7);
}

export function formatAirwayBillNumber(airlineCode: string, serial: string): string {
  const checkDigit = calculateAwbCheckDigit(serial);
  return checkDigit ? `${airlineCode}-${serial}${checkDigit}` : '';
}

function enumerateIataAwbRange(airlineCode: string, startSerial: string, endSerial: string): string[] {
  const start = Number(startSerial);
  const end = Number(endSerial);
  if (end < start) return [];

  const count = Math.min(end - start + 1, 100000);
  return Array.from({ length: count }, (_, index) => {
    const serial = String(start + index).padStart(7, '0');
    return formatAirwayBillNumber(airlineCode, serial);
  });
}

export function checkAwbRange(input: {
  airlineCode: string;
  startAwbNo: string;
  endAwbNo: string;
}): AwbRangeCheckResult {
  const candidates = /^\d{7}$/.test(input.startAwbNo) && /^\d{7}$/.test(input.endAwbNo)
    ? enumerateIataAwbRange(input.airlineCode, input.startAwbNo, input.endAwbNo)
    : enumerateRange(input.startAwbNo, input.endAwbNo);
  const existing = new Set(
    awbStockRepo.find((i) => i.airlineCode === input.airlineCode).map((i) => i.awbNo)
  );
  const duplicateAwbNos = candidates.filter((no) => existing.has(no));
  const newAwbNos = candidates.filter((no) => !existing.has(no));
  return {
    given: candidates.length,
    duplicate: duplicateAwbNos.length,
    toBeWritten: newAwbNos.length,
    duplicateAwbNos,
    newAwbNos,
  };
}

export function writeAwbRange(input: {
  airlineCode: string;
  ownerCode: string;
  receiptDate: string;
  newAwbNos: string[];
}): AwbStock[] {
  const records: AwbStock[] = input.newAwbNos.map((awbNo) => ({
    id: uuid(),
    createdAt: nowIso(),
    updatedAt: nowIso(),
    awbNo,
    airlineCode: input.airlineCode,
    ownerCode: input.ownerCode,
    receiptDate: input.receiptDate,
    awbUsed: 'N',
    awbDate: '',
  }));
  return awbStockRepo.saveAll(records);
}

/** Marks an AWB Stock record as used against a given job, called when Job (MAWB) Entry assigns it. */
export function consumeAwb(awbNo: string, airlineCode: string, jobNo: string, awbDate: string): AwbStock | null {
  const record = awbStockRepo.find((i) => i.awbNo === awbNo && i.airlineCode === airlineCode)[0];
  if (!record) return null;
  return awbStockRepo.save({ ...record, awbUsed: 'Y', awbDate, usedByJobNo: jobNo });
}

export function releaseAwb(awbNo: string, airlineCode: string): AwbStock | null {
  const record = awbStockRepo.find((i) => i.awbNo === awbNo && i.airlineCode === airlineCode)[0];
  if (!record) return null;
  return awbStockRepo.save({ ...record, awbUsed: 'N', awbDate: '', usedByJobNo: undefined });
}

export function isAwbAvailable(awbNo: string, airlineCode: string): boolean {
  const record = awbStockRepo.find((i) => i.awbNo === awbNo && i.airlineCode === airlineCode)[0];
  return !!record && record.awbUsed === 'N';
}

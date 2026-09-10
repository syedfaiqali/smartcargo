export type YesNo = 'Y' | 'N';

export type RecordStatus = {
  final: boolean;
  void: boolean;
  posted?: boolean;
};

export const emptyStatus = (): RecordStatus => ({ final: false, void: false, posted: false });

/** ISO date string (yyyy-MM-dd), or empty string when not yet set. */
export type IsoDate = string;

export interface AuditFields {
  id: string;
  createdAt: string;
  updatedAt: string;
}

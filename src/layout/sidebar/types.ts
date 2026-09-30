export interface SearchIndexEntry {
  path: string;
  label: string;
  moduleKey: string;
  moduleLabel: string;
  /** Null for a bare NavLeaf directly under a module (e.g. Quotations under Freight). */
  groupLabel: string | null;
  /** Display string for the "parent" column in search results/flyout headers, e.g. "Freight Forwarding" or "Initial Setup". */
  parentPathLabel: string;
  disabled: boolean;
}

export interface OpenFlyoutState {
  moduleKey: string;
  groupLabel: string;
  /** Vertical position of the menu trigger, used to align its flyout beside it. */
  anchorTop?: number;
}

import { useMemo } from 'react';
import { sidebarModules } from '../navConfig';
import { SearchIndexEntry } from './types';

function flattenModules(): SearchIndexEntry[] {
  const entries: SearchIndexEntry[] = [];

  for (const mod of sidebarModules) {
    if (!mod.submenu) continue;

    for (const entry of mod.submenu) {
      if ('items' in entry) {
        for (const item of entry.items) {
          entries.push({
            path: item.path,
            label: item.label,
            moduleKey: mod.key,
            moduleLabel: mod.label,
            groupLabel: entry.label,
            parentPathLabel: entry.label,
            disabled: !!mod.disabled,
          });
        }
      } else {
        entries.push({
          path: entry.path,
          label: entry.label,
          moduleKey: mod.key,
          moduleLabel: mod.label,
          groupLabel: null,
          parentPathLabel: mod.label,
          disabled: !!mod.disabled,
        });
      }
    }
  }

  return entries;
}

/** Flat, searchable list of every leaf page in the sidebar, built once from the static navConfig data. */
export function useMenuSearchIndex(): SearchIndexEntry[] {
  return useMemo(() => flattenModules(), []);
}

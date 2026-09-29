import { useCallback, useMemo, useState } from 'react';
import {
  MenuPreferencesData,
  getFavorites as serviceGetFavorites,
  getPins as serviceGetPins,
  reorderPins as serviceReorderPins,
  togglePin as serviceTogglePin,
  toggleFavorite as serviceToggleFavorite,
  writePreferences,
} from './menuPreferences.service';
import { useMenuSearchIndex } from './useMenuSearchIndex';

function resolveAgainstValidPaths(paths: string[], validPaths: Set<string>): string[] {
  return paths.filter((p) => validPaths.has(p));
}

export function useMenuPreferences() {
  const searchIndex = useMenuSearchIndex();
  const validPaths = useMemo(() => {
    const set = new Set<string>();
    for (const entry of searchIndex) {
      if (!entry.disabled) set.add(entry.path);
    }
    return set;
  }, [searchIndex]);

  const [pins, setPinsState] = useState<string[]>(() => {
    const rawPins = serviceGetPins();
    const cleaned = resolveAgainstValidPaths(rawPins, validPaths);
    if (cleaned.length !== rawPins.length) {
      writePreferences({ version: 1, pins: cleaned, favorites: serviceGetFavorites() } as MenuPreferencesData);
    }
    return cleaned;
  });

  const [favorites, setFavoritesState] = useState<string[]>(() => {
    const rawFavorites = serviceGetFavorites();
    const cleaned = resolveAgainstValidPaths(rawFavorites, validPaths);
    if (cleaned.length !== rawFavorites.length) {
      writePreferences({ version: 1, pins: serviceGetPins(), favorites: cleaned } as MenuPreferencesData);
    }
    return cleaned;
  });

  const [limitToastOpen, setLimitToastOpen] = useState(false);

  const togglePin = useCallback((path: string) => {
    const result = serviceTogglePin(path);
    if (result.limitReached) {
      setLimitToastOpen(true);
      return;
    }
    setPinsState(result.data.pins);
  }, []);

  const reorderPins = useCallback((orderedPaths: string[]) => {
    const data = serviceReorderPins(orderedPaths);
    setPinsState(data.pins);
  }, []);

  const toggleFavorite = useCallback((path: string) => {
    const result = serviceToggleFavorite(path);
    setFavoritesState(result.data.favorites);
  }, []);

  const isPinned = useCallback((path: string) => pins.includes(path), [pins]);
  const isFavorite = useCallback((path: string) => favorites.includes(path), [favorites]);

  const dismissLimitToast = useCallback(() => setLimitToastOpen(false), []);

  return {
    pins,
    favorites,
    isPinned,
    isFavorite,
    togglePin,
    reorderPins,
    toggleFavorite,
    limitToastOpen,
    dismissLimitToast,
  };
}

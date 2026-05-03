export const SYMBOLS = {
  success: '✓',

  error: '✗',

  inProgress: '⟳',

  nearest: '⭐',

  download: '↓',

  upload: '↑',

  distanceNear: '●●●',

  distanceMedium: '●●○',

  distanceFar: '●○○',
} as const;

export type SymbolValue = (typeof SYMBOLS)[keyof typeof SYMBOLS];

export function getDistanceSymbol(km: number): string {
  if (km < 500) return SYMBOLS.distanceNear;
  if (km < 2000) return SYMBOLS.distanceMedium;
  return SYMBOLS.distanceFar;
}

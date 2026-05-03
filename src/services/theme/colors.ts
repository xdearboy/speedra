export const COLORS = {
  success: '#00ff00',

  warning: '#ffff00',

  error: '#ff0000',

  info: '#00ffff',

  muted: '#888888',

  speedExcellent: '#00ff00',

  speedGood: '#ffff00',

  speedPoor: '#ff0000',

  distanceNear: '#00ff00',

  distanceMedium: '#ffff00',

  distanceFar: '#ff0000',
} as const;

export type ColorValue = (typeof COLORS)[keyof typeof COLORS];

export function getSpeedColor(mbps: number): string {
  if (mbps >= 100) return COLORS.speedExcellent;
  if (mbps >= 10) return COLORS.speedGood;
  return COLORS.speedPoor;
}

export function getDistanceColor(km: number): string {
  if (km < 500) return COLORS.distanceNear;
  if (km < 2000) return COLORS.distanceMedium;
  return COLORS.distanceFar;
}

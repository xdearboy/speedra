export const IPERF3_OPTIONS = {
  port: 5201,
  parallel: 8,
  time: 10,
  format: 'json' as const,
} as const;

export const MIN_TERMINAL_WIDTH = 80;

export const MIN_TERMINAL_HEIGHT = 24;

export const SPEED_THRESHOLDS = {
  excellent: 100,
  good: 10,
} as const;

export const DISTANCE_THRESHOLDS = {
  near: 500,
  medium: 2000,
} as const;

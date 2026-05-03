import type { ServerConfig } from './config/servers.js';

export type { ServerConfig } from './config/servers.js';
export type { Location } from './services/geolocation/ip-lookup.js';

export type AppView = 'selection' | 'testing' | 'results';

export type KeyboardAction =
  | 'up'
  | 'down'
  | 'enter'
  | 'escape'
  | 'space'
  | 'quit'
  | 'reset'
  | 'nearest';

export interface EnrichedServer extends ServerConfig {
  ping: number | null;
  score: number | null;

  status: 'checking' | 'online' | 'offline';
}

export interface CurrentTest {
  server: ServerConfig;

  progress: number;

  currentBandwidth: number;

  elapsed: number;

  intervalData: number[];

  testIndex: number;

  totalTests: number;

  direction: 'upload' | 'download';
}

export interface TestMetrics {
  bandwidth: { normalized: number };
  latency?: { normalized: number };
}

export interface DirectionResult {
  server: ServerConfig;

  metrics: TestMetrics | null;

  success: boolean;

  error: string | null;

  duration: number;

  timestamp: string;
}

export interface CombinedResult {
  server: ServerConfig;

  upload?: DirectionResult;

  download?: DirectionResult;

  success: boolean;
}

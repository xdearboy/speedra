import { parseJSON } from './json-parser.js';
import { formatMetrics } from './printer.js';
import type { ParsedMetrics } from './schemas.js';
import { parseText } from './text-parser.js';

export type {
  BandwidthMetric,
  IntervalReport,
  JitterMetric,
  LatencyMetric,
  ParsedMetrics,
} from './schemas.js';
export {
  BandwidthMetricSchema,
  IntervalReportSchema,
  JitterMetricSchema,
  LatencyMetricSchema,
  ParsedMetricsSchema,
} from './schemas.js';

export class Parser {
  parse(
    output: string,
    format: 'auto' | 'json' | 'text' = 'auto'
  ): { success: true; data: ParsedMetrics } | { success: false; error: string } {
    const resolvedFormat = format === 'auto' ? this._detectFormat(output) : format;

    if (resolvedFormat === 'json') {
      return parseJSON(output);
    }

    return parseText(output);
  }

  print(metrics: ParsedMetrics): string {
    return formatMetrics(metrics);
  }

  private _detectFormat(output: string): 'json' | 'text' {
    return output.trimStart().startsWith('{') ? 'json' : 'text';
  }
}

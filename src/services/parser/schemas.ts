import { z } from 'zod';

export const BandwidthMetricSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(['bits/sec', 'Kbits/sec', 'Mbits/sec', 'Gbits/sec']),
  normalized: z.number(),
});

export type BandwidthMetric = z.infer<typeof BandwidthMetricSchema>;

export const LatencyMetricSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(['ms', 'us']),
  normalized: z.number(),
});

export type LatencyMetric = z.infer<typeof LatencyMetricSchema>;

export const JitterMetricSchema = z.object({
  value: z.number().nonnegative(),
  unit: z.enum(['ms', 'us']),
  normalized: z.number(),
});

export type JitterMetric = z.infer<typeof JitterMetricSchema>;

export const IntervalReportSchema = z.object({
  timestamp: z.number(),
  bandwidth: BandwidthMetricSchema,
  retransmits: z.number().optional(),
});

export type IntervalReport = z.infer<typeof IntervalReportSchema>;

export const ParsedMetricsSchema = z.object({
  bandwidth: BandwidthMetricSchema,
  latency: LatencyMetricSchema.optional(),
  jitter: JitterMetricSchema.optional(),
  intervals: z.array(IntervalReportSchema),
  summary: z.object({
    totalBytes: z.number(),
    duration: z.number(),
    retransmits: z.number().optional(),
  }),
  timestamp: z.string().datetime(),
});

export type ParsedMetrics = z.infer<typeof ParsedMetricsSchema>;

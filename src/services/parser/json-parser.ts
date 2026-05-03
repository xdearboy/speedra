import { type ParsedMetrics, ParsedMetricsSchema } from './schemas.js';

interface Iperf3IntervalSum {
  start: number;
  bits_per_second: number;
  retransmits?: number;
}

interface Iperf3Interval {
  sum: Iperf3IntervalSum;
}

interface Iperf3StreamSender {
  mean_rtt?: number;
}

interface Iperf3Stream {
  sender: Iperf3StreamSender;
}

interface Iperf3SumSent {
  bits_per_second: number;
  bytes: number;
  seconds: number;
  retransmits?: number;
}

interface Iperf3End {
  streams: Iperf3Stream[];
  sum_sent: Iperf3SumSent;
}

interface Iperf3Output {
  intervals: Iperf3Interval[];
  end: Iperf3End;
}

const BITS_PER_SEC_TO_MBITS = 1_000_000;

const MICROSECONDS_TO_MS = 1000;

export function parseJSON(
  jsonString: string
): { success: true; data: ParsedMetrics } | { success: false; error: string } {
  let raw: Iperf3Output;
  try {
    raw = JSON.parse(jsonString) as Iperf3Output;
  } catch (err) {
    return {
      success: false,
      error: `Failed to parse JSON: ${err instanceof Error ? err.message : String(err)}`,
    };
  }

  if (!raw || typeof raw !== 'object') {
    return { success: false, error: 'Invalid iperf3 output: root value is not an object' };
  }

  if (!raw.end || typeof raw.end !== 'object') {
    return { success: false, error: 'Invalid iperf3 output: missing "end" section' };
  }

  if (!raw.end.sum_sent || typeof raw.end.sum_sent !== 'object') {
    return { success: false, error: 'Invalid iperf3 output: missing "end.sum_sent" section' };
  }

  if (typeof raw.end.sum_sent.bits_per_second !== 'number') {
    return {
      success: false,
      error: 'Invalid iperf3 output: "end.sum_sent.bits_per_second" is not a number',
    };
  }

  if (!Array.isArray(raw.intervals)) {
    return { success: false, error: 'Invalid iperf3 output: "intervals" is not an array' };
  }

  const bitsPerSec = raw.end.sum_sent.bits_per_second;
  const bandwidthMbps = bitsPerSec / BITS_PER_SEC_TO_MBITS;

  const intervals = raw.intervals
    .filter(interval => interval?.sum && typeof interval.sum.bits_per_second === 'number')
    .map(interval => {
      const intervalMbps = interval.sum.bits_per_second / BITS_PER_SEC_TO_MBITS;
      return {
        timestamp: typeof interval.sum.start === 'number' ? interval.sum.start : 0,
        bandwidth: {
          value: intervalMbps,
          unit: 'Mbits/sec' as const,
          normalized: intervalMbps,
        },
        ...(typeof interval.sum.retransmits === 'number'
          ? { retransmits: interval.sum.retransmits }
          : {}),
      };
    });

  let latency: ParsedMetrics['latency'];

  const stream0 = Array.isArray(raw.end.streams) ? raw.end.streams[0] : undefined;
  const rttUs =
    (stream0 as Iperf3Stream & { receiver?: Iperf3StreamSender })?.sender?.mean_rtt ??
    (stream0 as Iperf3Stream & { receiver?: Iperf3StreamSender })?.receiver?.mean_rtt ??
    null;

  if (typeof rttUs === 'number' && rttUs > 0) {
    const latencyMs = rttUs / MICROSECONDS_TO_MS;
    latency = { value: rttUs, unit: 'us', normalized: latencyMs };
  }

  const summary: ParsedMetrics['summary'] = {
    totalBytes: raw.end.sum_sent.bytes,
    duration: raw.end.sum_sent.seconds,
    ...(typeof raw.end.sum_sent.retransmits === 'number'
      ? { retransmits: raw.end.sum_sent.retransmits }
      : {}),
  };

  const metrics: ParsedMetrics = {
    bandwidth: {
      value: bandwidthMbps,
      unit: 'Mbits/sec',
      normalized: bandwidthMbps,
    },
    ...(latency !== undefined ? { latency } : {}),
    intervals,
    summary,
    timestamp: new Date().toISOString(),
  };

  const validation = ParsedMetricsSchema.safeParse(metrics);
  if (!validation.success) {
    return {
      success: false,
      error: `Parsed metrics failed schema validation: ${validation.error.message}`,
    };
  }

  return { success: true, data: validation.data };
}

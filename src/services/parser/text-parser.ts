import { type ParsedMetrics, ParsedMetricsSchema } from './schemas.js';

const INTERVAL_LINE_RE =
  /\[\s*\d+\]\s+[\d.]+-[\d.]+\s+sec\s+[\d.]+\s+\w*Bytes\s+([\d.]+)\s+(Mbits\/sec|Kbits\/sec|Gbits\/sec|bits\/sec)/;

const SENDER_LINE_RE =
  /\[\s*\d+\]\s+[\d.]+-[\d.]+\s+sec\s+[\d.]+\s+\w*Bytes\s+([\d.]+)\s+(Mbits\/sec|Kbits\/sec|Gbits\/sec|bits\/sec).*\bsender\b/;

const RECEIVER_LINE_RE =
  /\[\s*\d+\]\s+[\d.]+-[\d.]+\s+sec\s+[\d.]+\s+\w*Bytes\s+([\d.]+)\s+(Mbits\/sec|Kbits\/sec|Gbits\/sec|bits\/sec).*\breceiver\b/;

const SEPARATOR_RE = /^-\s+-\s+-/;

type BitrateUnit = 'bits/sec' | 'Kbits/sec' | 'Mbits/sec' | 'Gbits/sec';

function toMbitsPerSec(value: number, unit: BitrateUnit): number {
  switch (unit) {
    case 'bits/sec':
      return value / 1_000_000;
    case 'Kbits/sec':
      return value / 1_000;
    case 'Mbits/sec':
      return value;
    case 'Gbits/sec':
      return value * 1_000;
  }
}

export function parseText(
  textOutput: string
): { success: true; data: ParsedMetrics } | { success: false; error: string } {
  if (!textOutput || typeof textOutput !== 'string') {
    return { success: false, error: 'Invalid input: expected a non-empty string' };
  }

  const lines = textOutput.split('\n');

  const intervalLines: string[] = [];
  const summaryLines: string[] = [];
  let inSummary = false;

  for (const line of lines) {
    if (SEPARATOR_RE.test(line.trim())) {
      inSummary = true;
      continue;
    }
    if (inSummary) {
      summaryLines.push(line);
    } else {
      intervalLines.push(line);
    }
  }

  const intervals: ParsedMetrics['intervals'] = [];
  let intervalIndex = 0;

  for (const line of intervalLines) {
    const match = INTERVAL_LINE_RE.exec(line);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2] as BitrateUnit;
      const normalizedMbps = toMbitsPerSec(value, unit);

      intervals.push({
        timestamp: intervalIndex,
        bandwidth: {
          value,
          unit,
          normalized: normalizedMbps,
        },
      });
      intervalIndex++;
    }
  }

  let overallBandwidthMbps: number | null = null;
  let overallUnit: BitrateUnit = 'Mbits/sec';
  let overallValue = 0;

  for (const line of summaryLines) {
    const senderMatch = SENDER_LINE_RE.exec(line);
    if (senderMatch) {
      overallValue = parseFloat(senderMatch[1]);
      overallUnit = senderMatch[2] as BitrateUnit;
      overallBandwidthMbps = toMbitsPerSec(overallValue, overallUnit);
      break;
    }
  }

  if (overallBandwidthMbps === null) {
    if (intervals.length > 0) {
      const last = intervals[intervals.length - 1];
      overallValue = last.bandwidth.value;
      overallUnit = last.bandwidth.unit as BitrateUnit;
      overallBandwidthMbps = last.bandwidth.normalized;
    } else {
      return {
        success: false,
        error: 'No bandwidth data found in iperf3 text output',
      };
    }
  }

  let totalBytes = 0;
  let duration = 0;

  const SUMMARY_DETAIL_RE = /\[\s*\d+\]\s+([\d.]+)-([\d.]+)\s+sec\s+([\d.]+)\s+(\w*Bytes)/;

  const BYTES_UNIT_MULTIPLIERS: Record<string, number> = {
    Bytes: 1,
    KBytes: 1_024,
    MBytes: 1_024 * 1_024,
    GBytes: 1_024 * 1_024 * 1_024,
  };

  for (const line of summaryLines) {
    const isSender = SENDER_LINE_RE.test(line);
    const isReceiver = RECEIVER_LINE_RE.test(line);
    if (isSender || isReceiver) {
      const detailMatch = SUMMARY_DETAIL_RE.exec(line);
      if (detailMatch) {
        const startSec = parseFloat(detailMatch[1]);
        const endSec = parseFloat(detailMatch[2]);
        const transferValue = parseFloat(detailMatch[3]);
        const transferUnit = detailMatch[4];
        duration = endSec - startSec;
        const multiplier = BYTES_UNIT_MULTIPLIERS[transferUnit] ?? 1;
        totalBytes = Math.round(transferValue * multiplier);
      }
      if (isSender) break;
    }
  }

  const metrics: ParsedMetrics = {
    bandwidth: {
      value: overallValue,
      unit: overallUnit,
      normalized: overallBandwidthMbps,
    },
    intervals,
    summary: {
      totalBytes,
      duration,
    },
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

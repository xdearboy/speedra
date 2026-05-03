import type { ParsedMetrics } from './schemas.js';

const SEPARATOR = '- - - - - - - - - - - - - - - - - - - - - - - - -';

const IPERF_DONE = 'iperf Done.';

const STREAM_ID = '  5';

function toFixed2(n: number): string {
  return n.toFixed(2);
}

function transferMBytes(bandwidthMbps: number, durationSec: number): number {
  return (bandwidthMbps * durationSec) / 8;
}

function formatIntervalLine(start: number, end: number, bandwidthMbps: number): string {
  const transfer = transferMBytes(bandwidthMbps, end - start);
  return (
    `[${STREAM_ID}]   ${toFixed2(start)}-${toFixed2(end)}   sec` +
    `  ${toFixed2(transfer)} MBytes   ${toFixed2(bandwidthMbps)} Mbits/sec    0    256 KBytes`
  );
}

function formatSenderLine(duration: number, bandwidthMbps: number): string {
  const transfer = transferMBytes(bandwidthMbps, duration);
  return (
    `[${STREAM_ID}]   0.00-${toFixed2(duration)}  sec   ${toFixed2(transfer)} MBytes` +
    `   ${toFixed2(bandwidthMbps)} Mbits/sec   0             sender`
  );
}

function formatReceiverLine(duration: number, bandwidthMbps: number): string {
  const transfer = transferMBytes(bandwidthMbps, duration);
  return (
    `[${STREAM_ID}]   0.00-${toFixed2(duration)}  sec   ${toFixed2(transfer)} MBytes` +
    `   ${toFixed2(bandwidthMbps)} Mbits/sec                  receiver`
  );
}

export function formatMetrics(metrics: ParsedMetrics): string {
  const lines: string[] = [];

  lines.push('Connecting to host 0.0.0.0, port 5201');
  lines.push(`[${STREAM_ID}] local 0.0.0.0 port 0 connected to 0.0.0.0 port 5201`);
  lines.push('[ ID] Interval           Transfer     Bitrate         Retr  Cwnd');

  for (let i = 0; i < metrics.intervals.length; i++) {
    const interval = metrics.intervals[i];
    const start = i;
    const end = i + 1;
    lines.push(formatIntervalLine(start, end, interval.bandwidth.normalized));
  }

  lines.push(SEPARATOR);
  lines.push('[ ID] Interval           Transfer     Bitrate         Retr');

  const duration =
    metrics.summary.duration > 0 ? metrics.summary.duration : metrics.intervals.length;
  const bandwidthMbps = metrics.bandwidth.normalized;

  lines.push(formatSenderLine(duration, bandwidthMbps));
  lines.push(formatReceiverLine(duration, bandwidthMbps));

  lines.push('');
  lines.push(IPERF_DONE);

  return lines.join('\n');
}

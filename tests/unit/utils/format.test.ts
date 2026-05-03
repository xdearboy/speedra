import { describe, expect, it } from 'vitest';
import {
  formatBandwidth,
  formatBytes,
  formatDuration,
  formatLatency,
} from '../../../src/utils/format.js';

describe('formatBandwidth', () => {
  it('formats a typical bandwidth value with one decimal place', () => {
    expect(formatBandwidth(842.3)).toBe('842.3 Mbits/s');
  });

  it('appends the correct unit "Mbits/s"', () => {
    expect(formatBandwidth(100)).toMatch(/Mbits\/s$/);
  });

  it('always shows one decimal place for whole numbers', () => {
    expect(formatBandwidth(100)).toBe('100.0 Mbits/s');
  });

  it('rounds to one decimal place', () => {
    expect(formatBandwidth(99.95)).toBe('100.0 Mbits/s');
    expect(formatBandwidth(99.94)).toBe('99.9 Mbits/s');
  });

  it('handles sub-1 Mbps values', () => {
    expect(formatBandwidth(0.5)).toBe('0.5 Mbits/s');
  });

  it('handles zero', () => {
    expect(formatBandwidth(0)).toBe('0.0 Mbits/s');
  });

  it('handles very large values', () => {
    expect(formatBandwidth(10000)).toBe('10000.0 Mbits/s');
  });
});

describe('formatLatency', () => {
  it('formats a typical latency value with one decimal place', () => {
    expect(formatLatency(12.5)).toBe('12.5 ms');
  });

  it('appends the correct unit "ms"', () => {
    expect(formatLatency(50)).toMatch(/ms$/);
  });

  it('always shows one decimal place for whole numbers', () => {
    expect(formatLatency(100)).toBe('100.0 ms');
  });

  it('rounds to one decimal place', () => {
    expect(formatLatency(12.46)).toBe('12.5 ms');
    expect(formatLatency(12.44)).toBe('12.4 ms');
  });

  it('handles sub-1 ms values', () => {
    expect(formatLatency(0.3)).toBe('0.3 ms');
  });

  it('handles zero', () => {
    expect(formatLatency(0)).toBe('0.0 ms');
  });

  it('handles large latency values', () => {
    expect(formatLatency(1000)).toBe('1000.0 ms');
  });
});

describe('formatDuration', () => {
  it('formats seconds less than a minute with zero-padded seconds', () => {
    expect(formatDuration(8)).toBe('0:08');
  });

  it('formats exactly one minute', () => {
    expect(formatDuration(60)).toBe('1:00');
  });

  it('formats 68 seconds as "1:08"', () => {
    expect(formatDuration(68)).toBe('1:08');
  });

  it('formats zero seconds', () => {
    expect(formatDuration(0)).toBe('0:00');
  });

  it('formats 59 seconds', () => {
    expect(formatDuration(59)).toBe('0:59');
  });

  it('formats 10 minutes exactly', () => {
    expect(formatDuration(600)).toBe('10:00');
  });

  it('formats large durations correctly', () => {
    expect(formatDuration(3661)).toBe('61:01');
  });

  it('truncates fractional seconds', () => {
    expect(formatDuration(8.9)).toBe('0:08');
    expect(formatDuration(59.99)).toBe('0:59');
  });

  it('zero-pads single-digit seconds', () => {
    expect(formatDuration(65)).toBe('1:05');
  });

  it('does not zero-pad minutes', () => {
    expect(formatDuration(120)).toBe('2:00');
  });
});

describe('formatBytes', () => {
  it('formats bytes below 1 KB without decimals', () => {
    expect(formatBytes(512)).toBe('512 B');
  });

  it('formats exactly 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 B');
  });

  it('formats exactly 1023 bytes as B', () => {
    expect(formatBytes(1023)).toBe('1023 B');
  });

  it('formats exactly 1 KB (1024 bytes)', () => {
    expect(formatBytes(1024)).toBe('1.0 KB');
  });

  it('formats 4 KB', () => {
    expect(formatBytes(4096)).toBe('4.0 KB');
  });

  it('formats values just below 1 MB as KB', () => {
    expect(formatBytes(1024 * 1024 - 1)).toBe('1024.0 KB');
  });

  it('formats exactly 1 MB', () => {
    expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
  });

  it('formats 512 MB', () => {
    expect(formatBytes(512 * 1024 * 1024)).toBe('512.0 MB');
  });

  it('formats values just below 1 GB as MB', () => {
    expect(formatBytes(1024 * 1024 * 1024 - 1)).toBe('1024.0 MB');
  });

  it('formats exactly 1 GB', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
  });

  it('formats approximately 1.2 GB', () => {
    expect(formatBytes(Math.round(1.2 * 1024 * 1024 * 1024))).toBe('1.2 GB');
  });

  it('formats large GB values', () => {
    expect(formatBytes(10 * 1024 * 1024 * 1024)).toBe('10.0 GB');
  });
});

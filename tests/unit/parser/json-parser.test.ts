import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parseJSON } from '../../../src/services/parser/json-parser.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '../../fixtures/iperf3-outputs');

function loadFixture(name: string): string {
  return readFileSync(join(FIXTURES_DIR, name), 'utf-8');
}

function buildMinimalOutput(overrides: Record<string, unknown> = {}): string {
  const base = {
    intervals: [
      {
        sum: {
          start: 0,
          bits_per_second: 500_000_000,
          retransmits: 0,
        },
      },
    ],
    end: {
      streams: [
        {
          sender: {
            mean_rtt: 12500,
          },
        },
      ],
      sum_sent: {
        bits_per_second: 500_000_000,
        bytes: 625_000_000,
        seconds: 10,
        retransmits: 0,
      },
    },
  };
  return JSON.stringify({ ...base, ...overrides });
}

describe('parseJSON – valid fixture', () => {
  it('parses the valid-output.json fixture successfully', () => {
    const json = loadFixture('valid-output.json');
    const result = parseJSON(json);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { data } = result;

    expect(data.bandwidth.unit).toBe('Mbits/sec');
    expect(data.bandwidth.normalized).toBeCloseTo(6710.8864, 2);
    expect(data.bandwidth.value).toBeCloseTo(6710.8864, 2);

    expect(data.latency).toBeDefined();
    expect(data.latency?.unit).toBe('us');
    expect(data.latency?.value).toBe(12500);
    expect(data.latency?.normalized).toBeCloseTo(12.5, 3);

    expect(data.intervals).toHaveLength(2);
    expect(data.intervals[0].bandwidth.normalized).toBeCloseTo(838.8608, 2);
    expect(data.intervals[0].retransmits).toBe(0);
    expect(data.intervals[1].retransmits).toBe(2);

    expect(data.summary.totalBytes).toBe(8388608000);
    expect(data.summary.duration).toBeCloseTo(10.0001, 4);
    expect(data.summary.retransmits).toBe(96);

    expect(() => new Date(data.timestamp)).not.toThrow();
    expect(data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

describe('parseJSON – bandwidth normalization', () => {
  it('converts bits/sec to Mbits/sec correctly', () => {
    const json = buildMinimalOutput({
      end: {
        streams: [],
        sum_sent: {
          bits_per_second: 1_000_000_000,
          bytes: 1_250_000_000,
          seconds: 10,
        },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.bandwidth.normalized).toBeCloseTo(1000, 5);
    expect(result.data.bandwidth.unit).toBe('Mbits/sec');
  });

  it('handles very small bandwidth values', () => {
    const json = buildMinimalOutput({
      end: {
        streams: [],
        sum_sent: {
          bits_per_second: 1000,
          bytes: 1250,
          seconds: 10,
        },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.bandwidth.normalized).toBeCloseTo(0.001, 6);
  });
});

describe('parseJSON – latency extraction', () => {
  it('converts mean_rtt from microseconds to milliseconds', () => {
    const json = buildMinimalOutput({
      end: {
        streams: [{ sender: { mean_rtt: 25000 } }],
        sum_sent: {
          bits_per_second: 500_000_000,
          bytes: 625_000_000,
          seconds: 10,
        },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.latency?.value).toBe(25000);
    expect(result.data.latency?.unit).toBe('us');
    expect(result.data.latency?.normalized).toBeCloseTo(25, 3);
  });

  it('omits latency when streams array is empty', () => {
    const json = buildMinimalOutput({
      end: {
        streams: [],
        sum_sent: {
          bits_per_second: 500_000_000,
          bytes: 625_000_000,
          seconds: 10,
        },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.latency).toBeUndefined();
  });

  it('omits latency when mean_rtt is absent from sender', () => {
    const json = buildMinimalOutput({
      end: {
        streams: [{ sender: {} }],
        sum_sent: {
          bits_per_second: 500_000_000,
          bytes: 625_000_000,
          seconds: 10,
        },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.latency).toBeUndefined();
  });

  it('handles zero mean_rtt gracefully', () => {
    const json = buildMinimalOutput({
      end: {
        streams: [{ sender: { mean_rtt: 0 } }],
        sum_sent: {
          bits_per_second: 500_000_000,
          bytes: 625_000_000,
          seconds: 10,
        },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.latency).toBeUndefined();
  });
});

describe('parseJSON – per-interval data', () => {
  it('extracts bandwidth for each interval', () => {
    const json = JSON.stringify({
      intervals: [
        { sum: { start: 0, bits_per_second: 100_000_000, retransmits: 0 } },
        { sum: { start: 1, bits_per_second: 200_000_000, retransmits: 1 } },
        { sum: { start: 2, bits_per_second: 300_000_000 } },
      ],
      end: {
        streams: [],
        sum_sent: {
          bits_per_second: 200_000_000,
          bytes: 250_000_000,
          seconds: 3,
        },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.intervals).toHaveLength(3);
    expect(result.data.intervals[0].bandwidth.normalized).toBeCloseTo(100, 3);
    expect(result.data.intervals[1].bandwidth.normalized).toBeCloseTo(200, 3);
    expect(result.data.intervals[2].bandwidth.normalized).toBeCloseTo(300, 3);
  });

  it('preserves interval timestamps', () => {
    const json = JSON.stringify({
      intervals: [
        { sum: { start: 0, bits_per_second: 100_000_000 } },
        { sum: { start: 1.0001, bits_per_second: 100_000_000 } },
      ],
      end: {
        streams: [],
        sum_sent: {
          bits_per_second: 100_000_000,
          bytes: 125_000_000,
          seconds: 2,
        },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.intervals[0].timestamp).toBe(0);
    expect(result.data.intervals[1].timestamp).toBeCloseTo(1.0001, 4);
  });

  it('includes retransmits when present in interval', () => {
    const json = JSON.stringify({
      intervals: [{ sum: { start: 0, bits_per_second: 100_000_000, retransmits: 5 } }],
      end: {
        streams: [],
        sum_sent: { bits_per_second: 100_000_000, bytes: 125_000_000, seconds: 1 },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.intervals[0].retransmits).toBe(5);
  });

  it('omits retransmits when absent from interval', () => {
    const json = JSON.stringify({
      intervals: [{ sum: { start: 0, bits_per_second: 100_000_000 } }],
      end: {
        streams: [],
        sum_sent: { bits_per_second: 100_000_000, bytes: 125_000_000, seconds: 1 },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.intervals[0].retransmits).toBeUndefined();
  });

  it('handles an empty intervals array', () => {
    const json = JSON.stringify({
      intervals: [],
      end: {
        streams: [],
        sum_sent: { bits_per_second: 100_000_000, bytes: 125_000_000, seconds: 1 },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.intervals).toHaveLength(0);
  });
});

describe('parseJSON – summary extraction', () => {
  it('extracts totalBytes, duration, and retransmits from sum_sent', () => {
    const json = buildMinimalOutput();
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.summary.totalBytes).toBe(625_000_000);
    expect(result.data.summary.duration).toBe(10);
    expect(result.data.summary.retransmits).toBe(0);
  });

  it('omits retransmits from summary when absent', () => {
    const json = JSON.stringify({
      intervals: [],
      end: {
        streams: [],
        sum_sent: { bits_per_second: 100_000_000, bytes: 125_000_000, seconds: 1 },
      },
    });
    const result = parseJSON(json);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.summary.retransmits).toBeUndefined();
  });
});

describe('parseJSON – error handling', () => {
  it('returns failure for non-JSON input', () => {
    const result = parseJSON('not json at all');
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toMatch(/Failed to parse JSON/i);
  });

  it('returns failure for empty string', () => {
    const result = parseJSON('');
    expect(result.success).toBe(false);
  });

  it('returns failure when "end" section is missing', () => {
    const result = parseJSON(JSON.stringify({ intervals: [] }));
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toMatch(/end/i);
  });

  it('returns failure when "end.sum_sent" is missing', () => {
    const result = parseJSON(JSON.stringify({ intervals: [], end: { streams: [] } }));
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toMatch(/sum_sent/i);
  });

  it('returns failure when "end.sum_sent.bits_per_second" is not a number', () => {
    const result = parseJSON(
      JSON.stringify({
        intervals: [],
        end: { streams: [], sum_sent: { bits_per_second: 'fast', bytes: 0, seconds: 0 } },
      })
    );
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toMatch(/bits_per_second/i);
  });

  it('returns failure when "intervals" is not an array', () => {
    const result = parseJSON(
      JSON.stringify({
        intervals: 'not-an-array',
        end: {
          streams: [],
          sum_sent: { bits_per_second: 100_000_000, bytes: 0, seconds: 0 },
        },
      })
    );
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error).toMatch(/intervals/i);
  });

  it('returns failure for a JSON null value', () => {
    const result = parseJSON('null');
    expect(result.success).toBe(false);
  });

  it('returns failure for a JSON array at root', () => {
    const result = parseJSON('[]');
    expect(result.success).toBe(false);
  });

  it('returns a descriptive error string on failure', () => {
    const result = parseJSON('{ "bad": true }');
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(typeof result.error).toBe('string');
    expect(result.error.length).toBeGreaterThan(0);
  });
});

describe('parseJSON – return shape', () => {
  it('returns { success: true, data } on valid input', () => {
    const result = parseJSON(buildMinimalOutput());
    expect(result).toHaveProperty('success', true);
    expect(result).toHaveProperty('data');
  });

  it('returns { success: false, error } on invalid input', () => {
    const result = parseJSON('bad');
    expect(result).toHaveProperty('success', false);
    expect(result).toHaveProperty('error');
  });

  it('data passes ParsedMetricsSchema validation', () => {
    const result = parseJSON(buildMinimalOutput());
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.bandwidth).toBeDefined();
    expect(result.data.intervals).toBeDefined();
    expect(result.data.summary).toBeDefined();
    expect(result.data.timestamp).toBeDefined();
  });

  it('timestamp is a valid ISO 8601 datetime string', () => {
    const before = new Date();
    const result = parseJSON(buildMinimalOutput());
    const after = new Date();

    expect(result.success).toBe(true);
    if (!result.success) return;

    const ts = new Date(result.data.timestamp);
    expect(ts.getTime()).toBeGreaterThanOrEqual(before.getTime() - 1000);
    expect(ts.getTime()).toBeLessThanOrEqual(after.getTime() + 1000);
  });
});

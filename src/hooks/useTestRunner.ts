import { useCallback, useRef, useState } from 'react';
import type { ServerConfig } from '../config/servers.js';
import type { TestComplete } from '../services/network/queue.js';
import { TestQueue } from '../services/network/queue.js';
import { Parser } from '../services/parser/index.js';
import type { CombinedResult, CurrentTest, DirectionResult, TestMetrics } from '../types.js';

function buildTestResult(completion: TestComplete): DirectionResult {
  const { server, result } = completion;
  const parser = new Parser();

  const success = result.exitCode === 0;
  let metrics: TestMetrics | null = null;
  let error: string | null = null;

  if (success && result.stdout) {
    const parsed = parser.parse(result.stdout);
    if (parsed.success) {
      metrics = {
        bandwidth: { normalized: parsed.data.bandwidth.normalized },
        latency: parsed.data.latency ? { normalized: parsed.data.latency.normalized } : undefined,
      };
    } else {
      error = parsed.error;
    }
  } else if (!success) {
    error = result.stderr || `iperf3 exited with code ${result.exitCode}`;
  }

  return {
    server,
    metrics,
    success: success && metrics !== null,
    error,
    duration: result.duration,
    timestamp: new Date().toISOString(),
  };
}

interface TestRunnerState {
  running: boolean;
  currentTest: CurrentTest | null;
  results: Map<string, CombinedResult>;
}

export interface UseTestRunnerReturn {
  running: boolean;
  currentTest: CurrentTest | null;
  results: Map<string, CombinedResult>;
  runTests: (servers: ReadonlyArray<ServerConfig>) => Promise<void>;
  cancelTests: () => void;
}

export function useTestRunner(): UseTestRunnerReturn {
  const [state, setState] = useState<TestRunnerState>({
    running: false,
    currentTest: null,
    results: new Map<string, CombinedResult>(),
  });

  const queueRef = useRef<TestQueue | null>(null);

  const runTests = useCallback(async (servers: ReadonlyArray<ServerConfig>): Promise<void> => {
    if (queueRef.current !== null) return;
    if (!servers || servers.length === 0) return;

    const queue = new TestQueue();
    queueRef.current = queue;

    for (const server of servers) {
      queue.enqueue({ server, options: { reverse: true }, direction: 'download' });
      queue.enqueue({ server, direction: 'upload' });
    }

    setState(s => ({ ...s, running: true, currentTest: null }));

    const TEST_DURATION = 10;

    await queue.processQueue(
      progress => {
        const { server, update, testIndex, totalTests, direction } = progress;
        const { intervalBandwidthMbps, elapsed } = update;
        const pct = Math.min(100, Math.round((elapsed / TEST_DURATION) * 100));

        setState(s => {
          const prevIntervalData =
            s.currentTest?.server?.ip === server.ip && s.currentTest?.direction === direction
              ? s.currentTest.intervalData
              : [];

          return {
            ...s,
            currentTest: {
              server,
              progress: pct,
              currentBandwidth: intervalBandwidthMbps,
              elapsed,
              intervalData: [...prevIntervalData, intervalBandwidthMbps],
              testIndex,
              totalTests,
              direction,
            },
          };
        });
      },

      completion => {
        const testResult = buildTestResult(completion);

        setState(s => {
          const prev = s.results.get(completion.server.ip) ?? {
            server: completion.server,
            success: false,
          };
          const updated: CombinedResult = {
            ...prev,
            server: completion.server,
            [completion.direction]: testResult,
            success:
              completion.direction === 'download'
                ? (prev.upload?.success ?? false) && testResult.success
                : testResult.success,
          };
          return {
            ...s,
            results: new Map(s.results).set(completion.server.ip, updated),
          };
        });
      }
    );

    queueRef.current = null;
    setState(s => ({ ...s, running: false, currentTest: null }));
  }, []);

  const cancelTests = useCallback((): void => {
    if (queueRef.current) {
      queueRef.current.cancel();
      queueRef.current = null;
    }
    setState(s => ({ ...s, running: false, currentTest: null }));
  }, []);

  return {
    running: state.running,
    currentTest: state.currentTest,
    results: state.results,
    runTests,
    cancelTests,
  };
}

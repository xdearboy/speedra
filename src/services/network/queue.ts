import type { ServerConfig } from '../../config/servers.js';
import type { ExecutorOptions, ExecutorResult, ProgressUpdate } from './executor.js';
import { Iperf3Executor } from './executor.js';

export interface QueuedTest {
  server: ServerConfig;

  options?: ExecutorOptions;

  direction?: 'upload' | 'download';
}

export interface TestProgress {
  server: ServerConfig;

  update: ProgressUpdate;

  testIndex: number;

  totalTests: number;

  direction: 'upload' | 'download';
}

export interface TestComplete {
  server: ServerConfig;

  result: ExecutorResult;

  testIndex: number;

  totalTests: number;

  direction: 'upload' | 'download';
}

export class TestQueue {
  private queue: QueuedTest[] = [];

  private running = false;

  private cancelled = false;

  private currentExecutor: Iperf3Executor | null = null;

  get size(): number {
    return this.queue.length;
  }

  get isRunning(): boolean {
    return this.running;
  }

  enqueue(test: QueuedTest): void {
    this.queue.push(test);
  }

  async processQueue(
    onProgress: (progress: TestProgress) => void,
    onComplete: (result: TestComplete) => void
  ): Promise<void> {
    if (this.running) {
      return;
    }

    this.running = true;
    this.cancelled = false;

    const totalTests = this.queue.length;

    for (let testIndex = 0; testIndex < totalTests; testIndex++) {
      if (this.cancelled) {
        break;
      }

      const test = this.queue[testIndex];

      const executor = new Iperf3Executor();
      this.currentExecutor = executor;

      const result = await executor.executeWithProgress(
        test.server,
        test.options ?? {},
        (update: ProgressUpdate) => {
          onProgress({
            server: test.server,
            update,
            testIndex,
            totalTests,
            direction: test.direction ?? 'upload',
          });
        }
      );

      this.currentExecutor = null;

      onComplete({
        server: test.server,
        result,
        testIndex,
        totalTests,
        direction: test.direction ?? 'upload',
      });

      if (this.cancelled) {
        break;
      }
    }

    this.running = false;
  }

  cancel(): void {
    this.cancelled = true;

    if (this.currentExecutor) {
      this.currentExecutor.cancel();
      this.currentExecutor = null;
    }
  }
}

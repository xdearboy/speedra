import { execa, type Subprocess } from 'execa';
import type { ServerConfig } from '../../config/servers.js';

export interface ExecutorOptions {
  port?: number;

  parallel?: number;

  time?: number;

  reverse?: boolean;
}

export interface ExecutorResult {
  stdout: string;

  stderr: string;

  exitCode: number;

  duration: number;
}

export interface ProgressUpdate {
  intervalBandwidthMbps: number;

  elapsed: number;
}

const DEFAULT_PORT = 5201;
const DEFAULT_PARALLEL = 8;
const DEFAULT_TIME = 10;
const BITS_PER_MBIT = 1_000_000;

function buildArgs(server: ServerConfig, options: Required<ExecutorOptions>): string[] {
  const args = [
    '-c',
    server.ip,
    '-p',
    String(options.port),
    '-P',
    String(options.parallel),
    '-t',
    String(options.time),
    '-J',
  ];
  if (options.reverse) {
    args.push('-R');
  }
  return args;
}

function resolveOptions(options?: ExecutorOptions): Required<ExecutorOptions> {
  return {
    port: options?.port ?? DEFAULT_PORT,
    parallel: options?.parallel ?? DEFAULT_PARALLEL,
    time: options?.time ?? DEFAULT_TIME,
    reverse: options?.reverse ?? false,
  };
}

class IntervalStreamParser {
  private inSumBlock = false;

  feed(line: string): number | null {
    const trimmed = line.trim();

    if (!this.inSumBlock && /^"sum"\s*:\s*\{/.test(trimmed)) {
      this.inSumBlock = true;
      return null;
    }

    if (this.inSumBlock) {
      if (trimmed.includes('"bits_per_second"')) {
        const match = trimmed.match(/"bits_per_second"\s*:\s*([\d.]+)/);
        if (match) {
          const bps = parseFloat(match[1]);
          this.inSumBlock = false;
          if (Number.isFinite(bps) && bps > 0) {
            return bps / BITS_PER_MBIT;
          }
        }
      }
      if (trimmed === '}' || trimmed === '},') {
        this.inSumBlock = false;
      }
    }

    return null;
  }
}

export class Iperf3Executor {
  private currentProcess: Subprocess | null = null;

  async execute(server: ServerConfig, options?: ExecutorOptions): Promise<ExecutorResult> {
    const resolved = resolveOptions(options);
    const args = buildArgs(server, resolved);
    const startTime = Date.now();

    const proc = execa('iperf3', args);
    this.currentProcess = proc;

    try {
      const { stdout, stderr, exitCode } = await proc;
      const duration = (Date.now() - startTime) / 1000;

      return {
        stdout: stdout ?? '',
        stderr: stderr ?? '',
        exitCode: exitCode ?? 0,
        duration,
      };
    } catch (err: unknown) {
      const duration = (Date.now() - startTime) / 1000;
      const execaErr = err as { stdout?: string; stderr?: string; exitCode?: number };

      return {
        stdout: execaErr.stdout ?? '',
        stderr: execaErr.stderr ?? '',
        exitCode: execaErr.exitCode ?? 1,
        duration,
      };
    } finally {
      this.currentProcess = null;
    }
  }

  async executeWithProgress(
    server: ServerConfig,
    options: ExecutorOptions,
    onProgress: (update: ProgressUpdate) => void
  ): Promise<ExecutorResult> {
    const resolved = resolveOptions(options);
    const args = buildArgs(server, resolved);
    const startTime = Date.now();

    const proc = execa('iperf3', args);
    this.currentProcess = proc;

    const stdoutChunks: string[] = [];
    const stderrChunks: string[] = [];
    const intervalParser = new IntervalStreamParser();

    if (proc.stdout) {
      let buffer = '';

      proc.stdout.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        stdoutChunks.push(text);
        buffer += text;

        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const mbps = intervalParser.feed(line);
          if (mbps !== null) {
            const elapsed = (Date.now() - startTime) / 1000;
            onProgress({ intervalBandwidthMbps: mbps, elapsed });
          }
        }
      });
    }

    if (proc.stderr) {
      proc.stderr.on('data', (chunk: Buffer) => {
        stderrChunks.push(chunk.toString());
      });
    }

    try {
      await proc;
      const duration = (Date.now() - startTime) / 1000;

      return {
        stdout: stdoutChunks.join(''),
        stderr: stderrChunks.join(''),
        exitCode: proc.exitCode ?? 0,
        duration,
      };
    } catch (err: unknown) {
      const duration = (Date.now() - startTime) / 1000;
      const execaErr = err as { stdout?: string; stderr?: string; exitCode?: number };

      return {
        stdout: stdoutChunks.join('') || (execaErr.stdout ?? ''),
        stderr: stderrChunks.join('') || (execaErr.stderr ?? ''),
        exitCode: execaErr.exitCode ?? 1,
        duration,
      };
    } finally {
      this.currentProcess = null;
    }
  }

  cancel(): void {
    if (this.currentProcess) {
      this.currentProcess.kill();
      this.currentProcess = null;
    }
  }
}

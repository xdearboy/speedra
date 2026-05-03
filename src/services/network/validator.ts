import { execa } from 'execa';

export interface Iperf3ValidationResult {
  available: boolean;

  version: string | null;
}

function parseVersion(stdout: string): string | null {
  const match = stdout.match(/iperf\s+(\d+\.\d+(?:\.\d+)*)/i);
  return match ? match[1] : null;
}

export async function validateIperf3(): Promise<Iperf3ValidationResult> {
  try {
    const { stdout } = await execa('iperf3', ['--version']);
    const version = parseVersion(stdout);
    return { available: true, version };
  } catch {
    return { available: false, version: null };
  }
}

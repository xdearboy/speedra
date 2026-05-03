import { createRequire } from 'node:module';
import { createInterface } from 'node:readline';
import { Application } from './app.js';
import { autoInstallIperf3 } from './services/network/installer.js';
import { validateIperf3 } from './services/network/validator.js';
import type { AutoStartMode } from './types.js';

interface PackageJson {
  version?: string;
}

function getPackageVersion(): string {
  const require = createRequire(import.meta.url);
  try {
    const pkg = require('../package.json') as PackageJson;
    return pkg.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

function ask(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const autoStartMode: AutoStartMode | null = args.includes('--nearest-asn')
    ? 'nearest-asn'
    : args.includes('--nearest')
      ? 'nearest'
      : null;

  if (args.includes('--version') || args.includes('-v')) {
    process.stdout.write(`speedra v${getPackageVersion()}\n`);
    process.exit(0);
  }

  let validation = await validateIperf3();

  if (!validation.available) {
    process.stdout.write('\n  ?  iperf3 is not installed or not found in PATH.\n\n');

    const answer = await ask('  Install iperf3 automatically? [Y/n] ');

    if (answer === '' || answer === 'y' || answer === 'yes') {
      process.stdout.write('\n');

      const result = await autoInstallIperf3(msg => {
        process.stdout.write(`  ${msg}\n`);
      });

      if (result.success) {
        process.stdout.write('\n  ?  iperf3 installed successfully.\n\n');
        validation = await validateIperf3();
      } else {
        process.stdout.write(`\n  ?  Installation failed: ${result.error ?? 'unknown error'}\n`);
        process.stdout.write('  Please install iperf3 manually and try again.\n\n');
        process.exit(1);
      }
    } else {
      process.stdout.write('  Skipping installation. Please install iperf3 manually.\n\n');
      process.exit(1);
    }

    if (!validation.available) {
      process.stdout.write('  ?  iperf3 still not found after installation.\n');
      process.stdout.write('  Try restarting your terminal and running speedra again.\n\n');
      process.exit(1);
    }
  }

  const app = new Application({ autoStartMode });

  try {
    await app.initialize();
    await app.run();
    process.exit(0);
  } catch (err) {
    await app.shutdown().catch(() => undefined);
    const message = err instanceof Error ? err.message : String(err);
    process.stderr.write(`\n  ?  Fatal error: ${message}\n\n`);
    process.exit(1);
  }
}

void main();

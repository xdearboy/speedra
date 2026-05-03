import { render } from 'ink';
import { createElement } from 'react';
import { App } from './components/App.js';
import type { ServerConfig } from './config/servers.js';
import { DEFAULT_SERVERS } from './config/servers.js';
import type { AutoStartMode } from './types.js';
import { exitAlternateScreen } from './utils/terminal.js';

interface InkInstance {
  unmount: () => void;
  waitUntilExit: () => Promise<unknown>;
}

interface Cancellable {
  cancel: () => void;
}

interface ApplicationOptions {
  servers?: ServerConfig[];
  autoStartMode?: AutoStartMode | null;
}

export class Application {
  private readonly servers: ServerConfig[];
  private readonly autoStartMode: AutoStartMode | null;
  private _inkInstance: InkInstance | null = null;
  private _activeProcesses: Set<Cancellable> = new Set();
  private _shuttingDown: boolean = false;
  private readonly _onSIGINT: () => void;
  private readonly _onSIGTERM: () => void;

  constructor(options: ApplicationOptions = {}) {
    this.servers = options.servers ?? DEFAULT_SERVERS;
    this.autoStartMode = options.autoStartMode ?? null;
    this._onSIGINT = () => {
      void this._handleSignal('SIGINT');
    };
    this._onSIGTERM = () => {
      void this._handleSignal('SIGTERM');
    };
  }

  async initialize(): Promise<void> {
    process.on('SIGINT', this._onSIGINT);
    process.on('SIGTERM', this._onSIGTERM);
  }

  async run(): Promise<void> {
    this._inkInstance = render(createElement(App, { autoStartMode: this.autoStartMode })) as InkInstance;
    await this._inkInstance.waitUntilExit();
    await this.shutdown();
  }

  async shutdown(): Promise<void> {
    if (this._shuttingDown) return;
    this._shuttingDown = true;

    for (const proc of this._activeProcesses) {
      try {
        proc.cancel();
      } catch {}
    }
    this._activeProcesses.clear();

    if (this._inkInstance) {
      try {
        this._inkInstance.unmount();
      } catch {}
      this._inkInstance = null;
    }

    try {
      exitAlternateScreen();
    } catch {}

    process.off('SIGINT', this._onSIGINT);
    process.off('SIGTERM', this._onSIGTERM);
  }

  trackProcess(proc: Cancellable): void {
    this._activeProcesses.add(proc);
  }

  untrackProcess(proc: Cancellable): void {
    this._activeProcesses.delete(proc);
  }

  private async _handleSignal(_signal: 'SIGINT' | 'SIGTERM'): Promise<void> {
    if (this._shuttingDown) return;
    await this.shutdown();
    process.exit(0);
  }
}

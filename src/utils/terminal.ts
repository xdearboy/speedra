import { MIN_TERMINAL_HEIGHT, MIN_TERMINAL_WIDTH } from './constants.js';

export interface TerminalSize {
  columns: number;

  rows: number;
}

export const ANSI = {
  ENTER_ALTERNATE_SCREEN: '\x1b[?1049h',

  EXIT_ALTERNATE_SCREEN: '\x1b[?1049l',

  SHOW_CURSOR: '\x1b[?25h',

  HIDE_CURSOR: '\x1b[?25l',

  CURSOR_HOME: '\x1b[H',

  CLEAR_SCREEN: '\x1b[2J',

  CLEAR_ALTERNATE_SCREEN: '\x1b[2J\x1b[H',
} as const;

export function getTerminalSize(): TerminalSize {
  const columns =
    typeof process.stdout.columns === 'number' && process.stdout.columns > 0
      ? process.stdout.columns
      : MIN_TERMINAL_WIDTH;

  const rows =
    typeof process.stdout.rows === 'number' && process.stdout.rows > 0
      ? process.stdout.rows
      : MIN_TERMINAL_HEIGHT;

  return { columns, rows };
}

export function isTerminalSupported(): boolean {
  if (!process.stdout.isTTY) {
    return false;
  }

  const { columns, rows } = getTerminalSize();
  return columns >= MIN_TERMINAL_WIDTH && rows >= MIN_TERMINAL_HEIGHT;
}

function writeToStdout(sequence: string): void {
  process.stdout.write(sequence);
}

export function enterAlternateScreen(): void {
  writeToStdout(ANSI.ENTER_ALTERNATE_SCREEN);
  writeToStdout(ANSI.HIDE_CURSOR);
}

export function exitAlternateScreen(): void {
  writeToStdout(ANSI.CLEAR_ALTERNATE_SCREEN);
  writeToStdout(ANSI.SHOW_CURSOR);
  writeToStdout(ANSI.EXIT_ALTERNATE_SCREEN);
}

export function restoreTerminal(): void {
  writeToStdout(ANSI.SHOW_CURSOR);
  writeToStdout(ANSI.CURSOR_HOME);
}

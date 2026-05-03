import { useInput } from 'ink';
import type { KeyboardAction } from '../types.js';

export function useKeyboard(onKeyPress: (action: KeyboardAction) => void): void {
  useInput((input, key) => {
    if (key.upArrow) onKeyPress('up');
    if (key.downArrow) onKeyPress('down');
    if (key.return) onKeyPress('enter');
    if (key.escape) onKeyPress('escape');
    if (input === ' ') onKeyPress('space');
    if (input === 'q') onKeyPress('quit');
    if (input === 'r') onKeyPress('reset');
    if (input === 'n') onKeyPress('nearest');
  });
}

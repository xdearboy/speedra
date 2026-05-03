import { Box, Text } from 'ink';
import type React from 'react';
import { Fragment } from 'react';

interface Shortcut {
  readonly key: string;
  readonly label: string;
}

const SHORTCUTS: ReadonlyArray<Shortcut> = [
  { key: '↑↓', label: 'Navigate' },
  { key: 'Space', label: 'Select' },
  { key: 'Enter', label: 'Start' },
  { key: 'n', label: 'Nearest' },
  { key: 'Esc', label: 'Cancel' },
  { key: 'r', label: 'Reset' },
  { key: 'q', label: 'Quit' },
] as const;

export function KeyboardShortcuts(): React.JSX.Element {
  return (
    <Box marginTop={1}>
      {SHORTCUTS.map(({ key, label }, index) => (
        <Fragment key={key}>
          {index > 0 && <Text color="#45475a"> · </Text>}
          <Text color="#cba6f7">{key}</Text>
          <Text color="#6c7086"> {label}</Text>
        </Fragment>
      ))}
    </Box>
  );
}

export default KeyboardShortcuts;

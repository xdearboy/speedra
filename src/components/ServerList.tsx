import { Box, Text } from 'ink';
import type React from 'react';
import type { EnrichedServer } from '../types.js';
import { ServerItem } from './ServerItem.js';

interface Props {
  servers: ReadonlyArray<EnrichedServer>;
  selected: ReadonlySet<string>;
  focusedIndex: number;
  onSelect: (ip: string) => void;
  onFocusChange?: (index: number) => void;
}

export function ServerList({
  servers,
  selected,
  focusedIndex,
  onSelect,
}: Props): React.JSX.Element {
  return (
    <Box flexDirection="column" marginY={1}>
      <Text bold color="#b4befe">
        Available Servers
      </Text>
      <Text color="#45475a">{'─'.repeat(48)}</Text>
      {servers.map((server, index) => (
        <ServerItem
          key={server.ip}
          server={server}
          selected={selected.has(server.ip)}
          focused={index === focusedIndex}
          onSelect={() => onSelect(server.ip)}
        />
      ))}
    </Box>
  );
}

export default ServerList;

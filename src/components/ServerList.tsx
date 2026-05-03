import { Box, Text } from 'ink';
import type React from 'react';
import type { EnrichedServer } from '../types.js';
import { ServerItem } from './ServerItem.js';

const PAGE_SIZE = 5;

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
}: Props): React.JSX.Element {
  const totalPages = Math.ceil(servers.length / PAGE_SIZE);
  const currentPage = Math.floor(focusedIndex / PAGE_SIZE);
  const pageStart = currentPage * PAGE_SIZE;
  const pageEnd = Math.min(pageStart + PAGE_SIZE, servers.length);
  const visibleServers = servers.slice(pageStart, pageEnd);

  return (
    <Box flexDirection="column" marginY={1}>
      <Box flexDirection="row" justifyContent="space-between">
        <Text bold color="#b4befe">
          Available Servers
        </Text>
        {totalPages > 1 && (
          <Text color="#45475a">
            {currentPage + 1}/{totalPages}  ↑↓ to scroll
          </Text>
        )}
      </Box>
      <Text color="#45475a">{'─'.repeat(48)}</Text>
      {visibleServers.map((server, idx) => {
        const globalIndex = pageStart + idx;
        return (
          <ServerItem
            key={server.ip}
            server={server}
            selected={selected.has(server.ip)}
            focused={globalIndex === focusedIndex}
            onSelect={() => { }}
          />
        );
      })}
      {totalPages > 1 && (
        <Box marginTop={0}>
          <Text color="#585b70">
            {pageStart + 1}–{pageEnd} of {servers.length} servers
            {currentPage > 0 ? '  ↑ prev' : ''}
            {currentPage < totalPages - 1 ? '  ↓ next' : ''}
          </Text>
        </Box>
      )}
    </Box>
  );
}

export default ServerList;

import { Box, Text } from 'ink';
import type React from 'react';
import { getDistanceColor } from '../services/theme/colors.js';
import { getDistanceSymbol } from '../services/theme/symbols.js';
import type { EnrichedServer } from '../types.js';

const CAT = {
  mauve: '#cba6f7',
  lavender: '#b4befe',
  blue: '#89b4fa',
  sapphire: '#74c7ec',
  green: '#a6e3a1',
  yellow: '#f9e2af',
  red: '#f38ba8',
  subtext1: '#bac2de',
  overlay1: '#7f849c',
  surface2: '#585b70',
  surface1: '#45475a',
} as const;

export function getFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '';
  const upper = countryCode.toUpperCase();
  const codePoints = [...upper].map(char => 0x1f1e6 + char.charCodeAt(0) - 0x41);
  return String.fromCodePoint(...codePoints);
}

interface Props {
  server: EnrichedServer;
  selected?: boolean;
  focused?: boolean;
  onSelect?: () => void;
}

export function ServerItem({
  server,
  selected = false,
  focused = false,
}: Props): React.JSX.Element {
  const { ip, port, location, asn, distance, ping, isNearest, name, status } = server;

  const flag = location?.countryCode ? `${getFlag(location.countryCode)} ` : '';
  const locationLabel = location
    ? [location.city, location.country].filter(Boolean).join(', ')
    : null;

  const isOffline = status === 'offline';

  const checkboxColor = isOffline ? CAT.surface2 : selected ? CAT.green : CAT.surface2;
  const checkboxChar = selected ? '◉' : '○';
  const nameColor = isOffline ? CAT.surface2 : focused ? CAT.lavender : CAT.subtext1;
  const metaColor = isOffline ? CAT.surface2 : focused ? CAT.sapphire : CAT.overlay1;

  const distColor = distance != null ? getDistanceColor(distance) : CAT.surface2;
  const distSymbol = distance != null ? getDistanceSymbol(distance) : null;

  const pingColor =
    ping == null ? CAT.surface2 : ping < 30 ? CAT.green : ping < 80 ? CAT.yellow : CAT.red;

  const statusBadge =
    status === 'checking' ? (
      <Text color={CAT.surface2}>…</Text>
    ) : status === 'offline' ? (
      <Text color={CAT.red}>✗ offline</Text>
    ) : null;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box flexDirection="row" gap={1} alignItems="center">
        <Text color={checkboxColor}>{checkboxChar}</Text>
        {isNearest && !isOffline ? (
          <Text color={CAT.yellow}>⭐</Text>
        ) : (
          <Text color={CAT.surface1}> </Text>
        )}
        <Text color={nameColor} bold>
          {flag}
          {name ?? ip}
        </Text>
        {locationLabel && (
          <>
            <Text color={CAT.surface2}>·</Text>
            <Text color={metaColor}>{locationLabel}</Text>
          </>
        )}
        {statusBadge && <>{statusBadge}</>}
      </Box>

      <Box flexDirection="row" gap={2} paddingLeft={4}>
        <Text color={CAT.surface2}>
          {ip}:{port}
        </Text>
        {!isOffline && distSymbol && distance != null && (
          <Text color={distColor}>
            {distSymbol} {Math.round(distance)} km
          </Text>
        )}
        {!isOffline && ping != null && <Text color={pingColor}>{ping} ms</Text>}
        {!isOffline && status === 'checking' && <Text color={CAT.surface2}>pinging…</Text>}
        {!isOffline && asn && (
          <Text color={CAT.overlay1}>
            {asn.number} {asn.organization}
          </Text>
        )}
      </Box>
    </Box>
  );
}

export default ServerItem;

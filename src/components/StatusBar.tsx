import { Box, Text } from 'ink';
import type React from 'react';
import type { Location } from '../types.js';

interface Props {
  userLocation: Location | null;
  status: string;
}

export function StatusBar({ userLocation, status }: Props): React.JSX.Element | null {
  const locationStr = userLocation
    ? [userLocation.city, userLocation.country].filter(Boolean).join(', ')
    : null;

  if (!locationStr && (!status || status === 'Ready')) return null;

  return (
    <Box flexDirection="row" gap={2} marginBottom={1}>
      {locationStr && (
        <Box flexDirection="row" gap={1}>
          <Text color="#74c7ec">📍</Text>
          <Text color="#a6adc8">{locationStr}</Text>
        </Box>
      )}
      {status && status !== 'Ready' && <Text color="#6c7086">{status}</Text>}
    </Box>
  );
}

export default StatusBar;

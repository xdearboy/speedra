import { Text } from 'ink';
import type React from 'react';
import { getSpeedColor } from '../services/theme/colors.js';
import { SYMBOLS } from '../services/theme/symbols.js';
import { formatBandwidth } from '../utils/format.js';

interface Props {
  bandwidth: number | null | undefined;
  direction: 'download' | 'upload';
}

export function SpeedIndicator({ bandwidth, direction }: Props): React.JSX.Element | null {
  if (bandwidth === null || bandwidth === undefined) return null;

  const color = getSpeedColor(bandwidth);
  const symbol = direction === 'upload' ? SYMBOLS.upload : SYMBOLS.download;

  return (
    <Text color={color}>
      {symbol} {formatBandwidth(bandwidth)}
    </Text>
  );
}

export default SpeedIndicator;

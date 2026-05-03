import { Text } from 'ink';
import type React from 'react';
import { getDistanceColor } from '../services/theme/colors.js';
import { getDistanceSymbol } from '../services/theme/symbols.js';

interface Props {
  distance: number | null;
}

export function DistanceIndicator({ distance }: Props): React.JSX.Element | null {
  if (distance === null) return null;

  const color = getDistanceColor(distance);
  const symbol = getDistanceSymbol(distance);

  return (
    <Text color={color}>
      {symbol} {Math.round(distance)} km
    </Text>
  );
}

export default DistanceIndicator;

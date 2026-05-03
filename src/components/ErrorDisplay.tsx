import { Box, Text } from 'ink';
import type React from 'react';

interface Props {
  type?: string;
  message: string;
  details?: string;
}

export function ErrorDisplay({ type, message, details }: Props): React.JSX.Element | null {
  if (!message) return null;

  return (
    <Box
      borderStyle="round"
      borderColor="#f38ba8"
      flexDirection="column"
      paddingX={1}
      marginBottom={1}
    >
      <Text color="#f38ba8" bold>
        ✗ {type ? `${type}: ` : ''}
        {message}
      </Text>
      {details && <Text color="#6c7086">{details}</Text>}
    </Box>
  );
}

export default ErrorDisplay;

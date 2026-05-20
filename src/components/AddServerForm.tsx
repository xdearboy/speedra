import { Box, Text, useInput } from 'ink';
import type React from 'react';
import { useCallback, useState } from 'react';

const CAT = {
  lavender: '#b4befe',
  blue: '#89b4fa',
  sapphire: '#74c7ec',
  green: '#a6e3a1',
  red: '#f38ba8',
  subtext1: '#bac2de',
  surface1: '#45475a',
} as const;

type FormField = 'host' | 'port' | 'name' | 'save';

interface AddServerFormProps {
  onSubmit: (ip: string, port: number, name: string, persist: boolean) => Promise<void>;
  onCancel: () => void;
}

export function AddServerForm({ onSubmit, onCancel }: AddServerFormProps): React.JSX.Element {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('5201');
  const [name, setName] = useState('');
  const [savePermanently, setSavePermanently] = useState(true);
  const [focused, setFocused] = useState<FormField>('host');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async (): Promise<void> => {
    setError(null);

    if (!host.trim()) {
      setError('Host cannot be empty.');
      return;
    }
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    const hostnamePattern =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!ipPattern.test(host) && !hostnamePattern.test(host)) {
      setError('Invalid host. Use IP address or hostname.');
      return;
    }

    const portNum = parseInt(port, 10);
    if (Number.isNaN(portNum) || portNum < 1 || portNum > 65535) {
      setError('Invalid port. Use 1-65535.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(host, parseInt(port, 10), name || `${host}:${port}`, savePermanently);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [host, port, name, savePermanently, onSubmit]);

  useInput((input, key) => {
    if (submitting) return;

    if (key.escape) {
      onCancel();
      return;
    }

    if (key.tab || key.return) {
      if (focused === 'host') {
        setFocused('port');
      } else if (focused === 'port') {
        setFocused('name');
      } else if (focused === 'name') {
        setFocused('save');
      } else if (focused === 'save' && key.return) {
        void handleSubmit();
      }
      return;
    }

    if (input === 'y' || input === 'Y') {
      if (focused === 'save') {
        setSavePermanently(true);
      }
      return;
    }

    if (input === 'n' || input === 'N') {
      if (focused === 'save') {
        setSavePermanently(false);
      }
      return;
    }

    if (focused === 'host') {
      if (key.backspace) {
        setHost(h => h.slice(0, -1));
      } else if (input && input.length === 1) {
        setHost(h => h + input);
      }
    } else if (focused === 'port') {
      if (key.backspace) {
        setPort(p => p.slice(0, -1));
      } else if (input && /\d/.test(input)) {
        setPort(p => (p.length < 5 ? p + input : p));
      }
    } else if (focused === 'name') {
      if (key.backspace) {
        setName(n => n.slice(0, -1));
      } else if (input && input.length === 1) {
        setName(n => n + input);
      }
    }
  });

  const hostColor = focused === 'host' ? CAT.lavender : CAT.subtext1;
  const portColor = focused === 'port' ? CAT.lavender : CAT.subtext1;
  const nameColor = focused === 'name' ? CAT.lavender : CAT.subtext1;
  const saveColor = focused === 'save' ? CAT.lavender : CAT.subtext1;

  return (
    <Box flexDirection="column" marginY={1} paddingX={2}>
      <Box marginBottom={1}>
        <Text bold color={CAT.sapphire}>
          ▪ Add Custom Server
        </Text>
      </Box>

      <Box marginBottom={1} flexDirection="row" gap={1}>
        <Text color={hostColor} bold>
          Host:
        </Text>
        <Text>{host}_</Text>
      </Box>

      <Box marginBottom={1} flexDirection="row" gap={1}>
        <Text color={portColor} bold>
          Port:
        </Text>
        <Text>{port}_</Text>
      </Box>

      <Box marginBottom={1} flexDirection="row" gap={1}>
        <Text color={nameColor} bold>
          Name:
        </Text>
        <Text color={CAT.surface1}>(optional) {name}_</Text>
      </Box>

      <Box marginBottom={1} flexDirection="row" gap={1}>
        <Text color={saveColor} bold>
          Save permanently:
        </Text>
        <Text>[{savePermanently ? 'Y' : 'n'}]</Text>
      </Box>

      {error && (
        <Box marginBottom={1}>
          <Text color={CAT.red}>✗ {error}</Text>
        </Box>
      )}

      <Box>
        <Text color={CAT.surface1}>
          {submitting ? 'Saving…' : 'Tab next · Enter confirm · Esc cancel'}
        </Text>
      </Box>
    </Box>
  );
}

export default AddServerForm;

import { Box, Text } from 'ink';
import type React from 'react';
import { getSpeedColor } from '../services/theme/colors.js';
import { SYMBOLS } from '../services/theme/symbols.js';
import type { CombinedResult } from '../types.js';
import { formatBandwidth, formatLatency } from '../utils/format.js';
import { getFlag } from './ServerItem.js';

const CAT = {
  mauve: '#cba6f7',
  blue: '#89b4fa',
  sapphire: '#74c7ec',
  green: '#a6e3a1',
  red: '#f38ba8',
  yellow: '#f9e2af',
  subtext1: '#bac2de',
  overlay2: '#9399b2',
  overlay1: '#7f849c',
  surface2: '#585b70',
  surface1: '#45475a',
} as const;

interface ServerCardProps {
  result: CombinedResult;
}

function ServerCard({ result }: ServerCardProps): React.JSX.Element | null {
  const server = result.server ?? result.upload?.server ?? result.download?.server;
  if (!server) return null;

  const uploadMetrics = result.upload?.metrics ?? null;
  const downloadMetrics = result.download?.metrics ?? null;
  const latency =
    uploadMetrics?.latency?.normalized ?? downloadMetrics?.latency?.normalized ?? null;

  const uploadBw = uploadMetrics?.bandwidth?.normalized ?? null;
  const downloadBw = downloadMetrics?.bandwidth?.normalized ?? null;
  const ping = (server as { ping?: number | null }).ping ?? null;

  const uploadOk = result.upload?.success ?? false;
  const downloadOk = result.download?.success ?? false;
  const bothDone = !!(result.upload && result.download);

  const ok = bothDone && uploadOk && downloadOk;
  const statusIcon = bothDone ? (ok ? SYMBOLS.success : SYMBOLS.error) : SYMBOLS.inProgress;
  const statusColor = bothDone ? (ok ? CAT.green : CAT.red) : CAT.yellow;
  const borderColor = ok ? CAT.surface1 : bothDone ? CAT.red : CAT.surface1;

  const flag = server.location?.countryCode ? getFlag(server.location.countryCode) : '';
  const city = server.location?.city ?? '';
  const country = server.location?.country ?? '';
  const loc = [city, country].filter(Boolean).join(', ');

  const pingDisplay =
    latency !== null && latency > 0 ? formatLatency(latency) : ping !== null ? `${ping} ms` : '—';

  const pingColor =
    ping !== null ? (ping < 30 ? CAT.green : ping < 80 ? CAT.yellow : CAT.red) : CAT.surface2;

  return (
    <Box flexDirection="column" marginBottom={2}>
      <Box
        flexDirection="column"
        borderStyle="round"
        borderColor={borderColor}
        paddingX={2}
        paddingY={1}
        gap={0}
      >
        <Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
          <Text color={CAT.overlay2} bold>
            ✦ RESULT
          </Text>
          <Text color={statusColor}>{statusIcon}</Text>
        </Box>

        <Box flexDirection="row" gap={1}>
          <Text color={CAT.sapphire}>{flag}</Text>
          <Text color={CAT.subtext1} bold>
            {loc}
          </Text>
        </Box>

        <Box flexDirection="row" gap={1} marginBottom={1}>
          <Text color={CAT.overlay2}>🛰</Text>
          <Text color={CAT.overlay2}>{server.asn?.number ?? '—'}</Text>
          <Text color={CAT.overlay1}>{server.asn?.organization ?? ''}</Text>
        </Box>

        <Text color={CAT.surface1}>{'─'.repeat(36)}</Text>

        <Box flexDirection="row" gap={1} marginTop={1}>
          <Text color={CAT.overlay2}>{'📡 Ping     '}</Text>
          <Text color={pingColor}>{pingDisplay}</Text>
        </Box>

        <Box flexDirection="row" gap={1}>
          <Text color={CAT.blue}>{'⬇  Download '}</Text>
          <Text color={downloadBw !== null ? getSpeedColor(downloadBw) : CAT.surface2}>
            {downloadBw !== null ? formatBandwidth(downloadBw) : '—'}
          </Text>
        </Box>

        <Box flexDirection="row" gap={1}>
          <Text color={CAT.mauve}>{'⬆  Upload   '}</Text>
          <Text color={uploadBw !== null ? getSpeedColor(uploadBw) : CAT.surface2}>
            {uploadBw !== null ? formatBandwidth(uploadBw) : '—'}
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

interface Props {
  results: Map<string, CombinedResult>;
  width?: number;
}

export function ResultsTable({ results }: Props): React.JSX.Element {
  if (!results || results.size === 0) {
    return (
      <Box flexDirection="column" marginY={1}>
        <Text bold color={CAT.subtext1}>
          Results:
        </Text>
        <Text color={CAT.overlay2}>No results yet</Text>
      </Box>
    );
  }

  const rows = Array.from(results.values());

  return (
    <Box flexDirection="column" marginY={1}>
      {rows.map(result => {
        const server = result.server ?? result.upload?.server ?? result.download?.server;
        return <ServerCard key={server?.ip ?? 'unknown'} result={result} />;
      })}
    </Box>
  );
}

export default ResultsTable;

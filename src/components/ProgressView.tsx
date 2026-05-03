import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ANIMATIONS } from '../services/theme/animations.js';
import { getSpeedColor } from '../services/theme/colors.js';
import type { CurrentTest } from '../types.js';
import { formatBandwidth, formatDuration } from '../utils/format.js';

const CAT = {
  mauve: '#cba6f7',
  lavender: '#b4befe',
  blue: '#89b4fa',
  sapphire: '#74c7ec',
  green: '#a6e3a1',
  yellow: '#f9e2af',
  peach: '#fab387',
  subtext1: '#bac2de',
  subtext0: '#a6adc8',
  overlay2: '#9399b2',
  overlay1: '#7f849c',
  surface2: '#585b70',
} as const;

const SPARKLINE_CHARS = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'] as const;

interface SparklineProps {
  data: ReadonlyArray<number>;
  color?: string;
}

function Sparkline({ data, color }: SparklineProps): React.JSX.Element | null {
  if (!data || data.length === 0) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;

  const chars = data.map(value => {
    if (range === 0) return SPARKLINE_CHARS[SPARKLINE_CHARS.length - 1];
    const normalized = (value - min) / range;
    const index = Math.min(
      Math.floor(normalized * SPARKLINE_CHARS.length),
      SPARKLINE_CHARS.length - 1
    );
    return SPARKLINE_CHARS[index];
  });

  return <Text color={color ?? CAT.sapphire}>{chars.join('')}</Text>;
}

interface ProgressBarProps {
  percent: number;
}

function ProgressBar({ percent }: ProgressBarProps): React.JSX.Element {
  const { width, complete, incomplete } = ANIMATIONS.progressBar;
  const clamped = Math.max(0, Math.min(100, percent));
  const filled = Math.round((clamped / 100) * width);
  const empty = width - filled;
  const barColor = clamped >= 80 ? CAT.green : clamped >= 40 ? CAT.yellow : CAT.peach;
  const bar = complete.repeat(filled) + incomplete.repeat(empty);

  return (
    <Box flexDirection="row" gap={1}>
      <Text color={barColor}>{bar}</Text>
      <Text color={CAT.subtext1}>{clamped.toFixed(0).padStart(3)}%</Text>
    </Box>
  );
}

interface Props {
  test: CurrentTest;
}

export function ProgressView({ test }: Props): React.JSX.Element {
  const {
    server,
    progress,
    currentBandwidth,
    elapsed,
    intervalData,
    testIndex,
    totalTests,
    direction,
  } = test;

  const [timerElapsed, setTimerElapsed] = useState(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    setTimerElapsed(0);
    const id = setInterval(() => {
      setTimerElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const TEST_DURATION = 10;
  const displayElapsed = elapsed > 0 ? elapsed : timerElapsed;
  const displayProgress =
    progress > 0 ? progress : Math.min(99, Math.round((timerElapsed / TEST_DURATION) * 100));

  const isDownload = direction === 'download';
  const dirLabel = isDownload ? '↓ Download' : '↑ Upload';
  const dirColor = isDownload ? CAT.blue : CAT.mauve;
  const sparkColor = isDownload ? CAT.sapphire : CAT.lavender;
  const bwColor = currentBandwidth != null ? getSpeedColor(currentBandwidth) : CAT.overlay2;

  const serverName = server.name ?? server.ip;
  const locationStr = server.location
    ? [server.location.city, server.location.country].filter(Boolean).join(', ')
    : null;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor={dirColor}
      paddingX={2}
      paddingY={1}
      gap={1}
    >
      <Box flexDirection="row" gap={2} alignItems="center">
        <Text color={CAT.green}>
          <Spinner type={ANIMATIONS.spinner.type} />
        </Text>
        <Text bold color={CAT.subtext1}>
          {serverName}
        </Text>
        {locationStr && <Text color={CAT.overlay1}>{locationStr}</Text>}
        <Text color={CAT.surface2}>·</Text>
        <Text color={dirColor} bold>
          {dirLabel}
        </Text>
        <Text color={CAT.overlay2}>
          ({testIndex}/{totalTests})
        </Text>
      </Box>

      <ProgressBar percent={displayProgress} />

      <Box flexDirection="row" gap={3}>
        <Box flexDirection="row" gap={1}>
          <Text color={CAT.overlay2}>Speed</Text>
          {currentBandwidth != null ? (
            <Text color={bwColor} bold>
              {formatBandwidth(currentBandwidth)}
            </Text>
          ) : (
            <Text color={CAT.surface2}>—</Text>
          )}
        </Box>
        <Box flexDirection="row" gap={1}>
          <Text color={CAT.overlay2}>Elapsed</Text>
          <Text color={CAT.subtext0}>{formatDuration(displayElapsed)}</Text>
        </Box>
        <Box flexDirection="row" gap={1}>
          <Text color={CAT.overlay2}>Remaining</Text>
          <Text color={CAT.subtext0}>
            {formatDuration(Math.max(0, TEST_DURATION - displayElapsed))}
          </Text>
        </Box>
      </Box>

      {intervalData && intervalData.length > 0 && (
        <Box flexDirection="row" gap={1} alignItems="center">
          <Text color={CAT.overlay2}>Trend</Text>
          <Sparkline data={intervalData} color={sparkColor} />
          {intervalData.length >= 2 && (
            <Text color={CAT.overlay1}>
              {(intervalData[intervalData.length - 1] ?? 0) >
              (intervalData[intervalData.length - 2] ?? 0)
                ? '↗'
                : '↘'}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}

export default ProgressView;

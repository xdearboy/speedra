import { Box, Text } from 'ink';
import type React from 'react';

const APP_VERSION = '1.0.0';

const ASCII_RAW = `
                         _           
                        | |          
 ___ _ __   ___  ___  __| |_ __ __ _ 
/ __| '_ \\ / _ \\/ _ \\/ _\` | '__/ _\` |
\\__ \\ |_) |  __/  __/ (_| | | | (_| |
|___/ .__/ \\___|\\___|\\__,_|_|  \\__,_|
    | |                              
    |_|                              
`;

const LINES = ASCII_RAW.split('\n').filter((_, i, arr) => i !== 0 && i !== arr.length - 1);

const STOPS: ReadonlyArray<readonly [number, number, number]> = [
  [203, 166, 247],
  [180, 190, 254],
  [137, 180, 250],
  [116, 199, 236],
  [137, 220, 235],
  [148, 226, 213],
] as const;

function lerpColor(
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number
): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

function sampleGradient(t: number): string {
  const scaled = t * (STOPS.length - 1);
  const idx = Math.min(Math.floor(scaled), STOPS.length - 2);
  const stop = STOPS[idx];
  const nextStop = STOPS[idx + 1];
  if (!stop || !nextStop) return '#cba6f7';
  const [r, g, b] = lerpColor(stop, nextStop, scaled - idx);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const maxWidth = Math.max(...LINES.map(l => l.length));
const totalRows = LINES.length;

export function TitleBar(): React.JSX.Element {
  return (
    <Box flexDirection="column" alignItems="flex-start" marginBottom={1}>
      {LINES.map((line, row) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static art lines never reorder
        <Box key={row} flexDirection="row">
          {[...line].map((char, col) => {
            const t = (row / Math.max(totalRows - 1, 1) + col / Math.max(maxWidth - 1, 1)) / 2;
            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: static art chars never reorder
              <Text key={col} color={sampleGradient(t)} bold>
                {char}
              </Text>
            );
          })}
        </Box>
      ))}
      <Box marginTop={1}>
        <Text color="#6c7086"> v{APP_VERSION} </Text>
        <Text color="#585b70">— </Text>
        <Text color="#a6adc8">network speed test</Text>
      </Box>
    </Box>
  );
}

export default TitleBar;

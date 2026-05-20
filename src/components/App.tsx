import { Box, Text, useApp, useInput, useStdout } from 'ink';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ServerConfig } from '../config/servers.js';
import { DEFAULT_SERVERS } from '../config/servers.js';
import { computeDistances, useGeolocation } from '../hooks/useGeolocation.js';
import { useTestRunner } from '../hooks/useTestRunner.js';
import { saveCustomServer } from '../services/config/custom-servers.js';
import { tcpPing } from '../services/geolocation/ping.js';
import type { AppView, AutoStartMode, EnrichedServer } from '../types.js';
import { AddServerForm } from './AddServerForm.js';
import { ErrorDisplay } from './ErrorDisplay.js';
import { KeyboardShortcuts } from './KeyboardShortcuts.js';
import { ProgressView } from './ProgressView.js';
import { ResultsTable } from './ResultsTable.js';
import { ServerList } from './ServerList.js';
import { StatusBar } from './StatusBar.js';
import { TitleBar } from './TitleBar.js';

interface AppState {
  servers: EnrichedServer[];
  selectedServers: Set<string>;
  userLocation: import('../types.js').Location | null;
  focusedIndex: number;
  view: AppView;
  error: string | null;
  status: string;
}

interface AppProps {
  autoStartMode?: AutoStartMode | null;
  targetAsn?: string | null;
  initialServers?: ServerConfig[];
}

function buildInitialState(servers: ServerConfig[] = DEFAULT_SERVERS): AppState {
  return {
    servers: servers.map(s => ({
      ...s,
      ping: null,
      score: null,
      status: 'checking' as const,
    })),
    selectedServers: new Set<string>(),
    userLocation: null,
    focusedIndex: 0,
    view: 'selection',
    error: null,
    status: 'Ready',
  };
}

export function App({
  autoStartMode = null,
  targetAsn = null,
  initialServers = DEFAULT_SERVERS,
}: AppProps): React.JSX.Element {
  const { exit } = useApp();
  const { stdout } = useStdout();

  const [state, setState] = useState<AppState>(() => buildInitialState(initialServers));

  const {
    running,
    currentTest,
    results: testResults,
    runTests,
    cancelTests: cancelTestRunner,
  } = useTestRunner();

  const stableServers = useRef(initialServers).current;
  const {
    userLocation,
    userASN,
    enrichedServers,
    loading: geoLoading,
  } = useGeolocation(stableServers);

  useEffect(() => {
    if (!geoLoading && enrichedServers.length > 0) {
      setState(s => ({ ...s, servers: enrichedServers, userLocation, status: 'Ready' }));
    }
  }, [geoLoading, enrichedServers, userLocation]);

  const [terminalSize, setTerminalSize] = useState(() => ({
    columns: stdout?.columns ?? 80,
    rows: stdout?.rows ?? 24,
  }));

  useEffect(() => {
    if (!stdout) return;
    function handleResize(): void {
      setTerminalSize({ columns: stdout.columns ?? 80, rows: stdout.rows ?? 24 });
    }
    stdout.on('resize', handleResize);
    return () => {
      stdout.off('resize', handleResize);
    };
  }, [stdout]);

  const setError = useCallback((error: string | null): void => {
    setState(s => ({ ...s, error }));
  }, []);

  const handleServerSelect = useCallback((ip: string): void => {
    setState(s => {
      const next = new Set(s.selectedServers);
      if (next.has(ip)) {
        next.delete(ip);
      } else {
        next.add(ip);
      }
      return { ...s, selectedServers: next };
    });
  }, []);

  const moveFocusUp = useCallback((): void => {
    setState(s => ({ ...s, focusedIndex: Math.max(0, s.focusedIndex - 1) }));
  }, []);

  const moveFocusDown = useCallback((): void => {
    setState(s => ({
      ...s,
      focusedIndex: Math.min(s.servers.length - 1, s.focusedIndex + 1),
    }));
  }, []);

  const startTests = useCallback((): void => {
    setState(s => {
      if (running || s.selectedServers.size === 0) return s;
      return {
        ...s,
        view: 'testing',
        error: null,
        status: `Testing ${s.selectedServers.size} server(s)...`,
      };
    });

    const selectedIps = state.selectedServers;
    if (running || selectedIps.size === 0) return;

    const serversToTest = state.servers.filter(srv => selectedIps.has(srv.ip));
    void runTests(serversToTest).then(() => {
      setState(s => ({ ...s, view: 'results', status: 'Tests complete' }));
    });
  }, [running, state.selectedServers, state.servers, runTests]);

  const cancelTests = useCallback((): void => {
    cancelTestRunner();
    setState(s => ({
      ...s,
      view: testResults.size > 0 ? 'results' : 'selection',
      status: 'Cancelled',
    }));
  }, [cancelTestRunner, testResults.size]);

  const resetResults = useCallback((): void => {
    cancelTestRunner();
    setState(prev => ({
      ...prev,
      servers:
        !geoLoading && enrichedServers.length > 0 ? enrichedServers : buildInitialState().servers,
      selectedServers: new Set<string>(),
      userLocation: !geoLoading ? userLocation : null,
      focusedIndex: 0,
      view: 'selection',
      error: null,
      status: 'Ready',
    }));
  }, [cancelTestRunner, geoLoading, enrichedServers, userLocation]);

  const startSingleServerTest = useCallback(
    (server: EnrichedServer, statusLabel: string): void => {
      if (running) return;

      setState(s => ({
        ...s,
        selectedServers: new Set([server.ip]),
        view: 'testing',
        error: null,
        status: statusLabel,
      }));

      void runTests([server]).then(() => {
        setState(s => ({ ...s, view: 'results', status: 'Tests complete' }));
      });
    },
    [running, runTests]
  );

  const selectNearestAndStart = useCallback((): void => {
    if (running) return;
    const nearest = state.servers.find(srv => srv.isNearest) ?? state.servers[0];
    if (!nearest) return;
    startSingleServerTest(nearest, `Testing nearest server ${nearest.ip}...`);
  }, [running, state.servers, startSingleServerTest]);

  const handleAddServer = useCallback(
    async (ip: string, port: number, name: string, persist: boolean): Promise<void> => {
      const config: ServerConfig = {
        id: `custom-${ip.replace(/\./g, '-')}-${port}`,
        ip,
        port,
        name,
        location: {
          city: 'Custom',
          country: 'Custom',
          countryCode: 'XX',
          latitude: 0,
          longitude: 0,
        },
        asn: {
          number: 'N/A',
          organization: 'Custom',
        },
        distance: null,
        isNearest: false,
      };

      if (persist) {
        try {
          await saveCustomServer(config);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          setError(`Failed to save server: ${message}`);
          return;
        }
      }

      const newEnrichedServer: EnrichedServer = {
        ...config,
        ping: null,
        score: null,
        status: 'checking',
      };

      setState(s => ({
        ...s,
        servers: [...s.servers, newEnrichedServer],
        view: 'selection',
      }));

      void (async () => {
        try {
          const ping = await tcpPing(ip, port);
          const pingMap = new Map([[ip, ping]]);
          const enriched = computeDistances([config], userLocation, pingMap);
          if (enriched.length > 0) {
            setState(s => ({
              ...s,
              servers: s.servers.map(srv =>
                srv.ip === ip && srv.port === port ? enriched[0] : srv
              ),
            }));
          }
        } catch {
          setState(s => ({
            ...s,
            servers: s.servers.map(srv =>
              srv.ip === ip && srv.port === port ? { ...srv, status: 'offline' } : srv
            ),
          }));
        }
      })();
    },
    [userLocation, setError]
  );

  const autoStartedRef = useRef(false);
  useEffect(() => {
    if (autoStartedRef.current) return;
    if (!autoStartMode || geoLoading || running) return;
    if (!state.servers.length) return;
    const stillAllChecking = state.servers.every(s => s.status === 'checking');
    if (stillAllChecking) return;

    if (autoStartMode === 'nearest') {
      const nearest = state.servers.find(srv => srv.isNearest) ?? state.servers[0];
      if (!nearest) return;
      autoStartedRef.current = true;
      startSingleServerTest(nearest, `Auto mode: nearest (${nearest.ip})`);
      return;
    }

    const nearest = state.servers.find(srv => srv.isNearest) ?? state.servers[0];
    const asnToMatch = targetAsn ?? (userASN?.number !== 'AS?' ? userASN?.number : null);
    const matchedByAsn = asnToMatch
      ? state.servers.find(srv => srv.asn.number === asnToMatch && srv.status !== 'offline')
      : undefined;
    const target = matchedByAsn ?? nearest;
    if (!target) return;

    autoStartedRef.current = true;
    if (matchedByAsn) {
      startSingleServerTest(target, `Auto mode: nearest in ${asnToMatch} (${target.ip})`);
    } else {
      startSingleServerTest(
        target,
        `Auto mode: ${asnToMatch} not found, fallback nearest (${target.ip})`
      );
    }
  }, [
    autoStartMode,
    geoLoading,
    running,
    startSingleServerTest,
    state.servers,
    targetAsn,
    userASN,
  ]);

  useInput((input, key) => {
    if (input === 'q' && state.view !== 'add-server') {
      exit();
      return;
    }

    if (state.view === 'selection') {
      if (key.upArrow) {
        moveFocusUp();
        return;
      }
      if (key.downArrow) {
        moveFocusDown();
        return;
      }
      if (input === ' ') {
        const focused = state.servers[state.focusedIndex];
        if (focused && focused.status !== 'offline') handleServerSelect(focused.ip);
        return;
      }
      if (key.return) {
        if (state.selectedServers.size > 0) {
          startTests();
        } else {
          setError('Please select at least one server before starting.');
        }
        return;
      }
      if (input === 'n') {
        selectNearestAndStart();
        return;
      }
      if (input === 'a') {
        setState(s => ({ ...s, view: 'add-server' }));
        return;
      }
    }

    if (key.escape) {
      if (running) {
        cancelTests();
      } else if (state.view === 'add-server') {
        setState(s => ({ ...s, view: 'selection' }));
      } else if (state.view === 'results') {
        setState(s => ({ ...s, view: 'selection', selectedServers: new Set(), status: 'Ready' }));
      }
      return;
    }

    if (input === 'r') {
      resetResults();
      return;
    }
  });

  const { servers, selectedServers, focusedIndex, view, error, status } = state;
  const isNarrow = terminalSize.columns < 80;

  return (
    <Box
      flexDirection="column"
      paddingX={isNarrow ? 0 : 1}
      paddingY={1}
      width={terminalSize.columns}
    >
      <TitleBar />
      <StatusBar userLocation={userLocation} status={status} />
      {error && <ErrorDisplay type="Error" message={error} />}

      {view === 'selection' && (
        <ServerList
          servers={servers}
          selected={selectedServers}
          focusedIndex={focusedIndex}
          onSelect={handleServerSelect}
        />
      )}

      {view === 'testing' && currentTest && <ProgressView test={currentTest} />}
      {view === 'testing' && !currentTest && (
        <Box marginY={1}>
          <Text color="cyan">Preparing tests...</Text>
        </Box>
      )}

      {view === 'results' && (
        <ResultsTable results={testResults} width={terminalSize.columns - (isNarrow ? 0 : 2)} />
      )}

      {view === 'add-server' && (
        <AddServerForm
          onSubmit={handleAddServer}
          onCancel={() => setState(s => ({ ...s, view: 'selection' }))}
        />
      )}

      <KeyboardShortcuts />
    </Box>
  );
}

export default App;

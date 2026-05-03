import { useCallback, useState } from 'react';
import { DEFAULT_SERVERS } from '../config/servers.js';
import type { AppView, EnrichedServer } from '../types.js';

interface ApplicationState {
  servers: EnrichedServer[];
  selectedServers: Set<string>;
  view: AppView;
  error: string | null;
}

function buildInitialState(): ApplicationState {
  return {
    servers: DEFAULT_SERVERS.map(s => ({
      ...s,
      ping: null,
      score: null,
      status: 'checking' as const,
    })),
    selectedServers: new Set<string>(),
    view: 'selection',
    error: null,
  };
}

export interface UseApplicationStateReturn {
  servers: EnrichedServer[];
  selectedServers: Set<string>;
  view: AppView;
  error: string | null;
  selectServer: (ip: string) => void;
  toggleServer: (ip: string) => void;
  setView: (view: AppView) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  setServers: (servers: EnrichedServer[]) => void;
}

export function useApplicationState(): UseApplicationStateReturn {
  const [state, setState] = useState<ApplicationState>(buildInitialState);

  const selectServer = useCallback((ip: string): void => {
    setState(s => {
      if (s.selectedServers.has(ip)) return s;
      const next = new Set(s.selectedServers);
      next.add(ip);
      return { ...s, selectedServers: next };
    });
  }, []);

  const toggleServer = useCallback((ip: string): void => {
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

  const setView = useCallback((view: AppView): void => {
    setState(s => {
      if (s.view === view) return s;
      return { ...s, view };
    });
  }, []);

  const setError = useCallback((error: string | null): void => {
    setState(s => ({ ...s, error }));
  }, []);

  const reset = useCallback((): void => {
    setState(buildInitialState());
  }, []);

  const setServers = useCallback((servers: EnrichedServer[]): void => {
    setState(s => ({ ...s, servers }));
  }, []);

  return {
    servers: state.servers,
    selectedServers: state.selectedServers,
    view: state.view,
    error: state.error,
    selectServer,
    toggleServer,
    setView,
    setError,
    reset,
    setServers,
  };
}

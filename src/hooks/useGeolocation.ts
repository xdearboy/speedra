import { useEffect, useRef, useState } from 'react';
import type { ServerConfig } from '../config/servers.js';
import { haversineDistance } from '../services/geolocation/distance.js';
import type { Location } from '../services/geolocation/ip-lookup.js';
import { getUserLocation } from '../services/geolocation/ip-lookup.js';
import { pingAll } from '../services/geolocation/ping.js';
import type { EnrichedServer } from '../types.js';

export type { Location };

export function computeDistances(
  servers: ReadonlyArray<ServerConfig>,
  userLocation: Location | null,
  pingMap: ReadonlyMap<string, number | null> = new Map()
): EnrichedServer[] {
  const enriched: EnrichedServer[] = servers.map(server => {
    const distance =
      userLocation && server.location
        ? haversineDistance(
            userLocation.latitude,
            userLocation.longitude,
            server.location.latitude,
            server.location.longitude
          )
        : null;

    const ping = pingMap.get(server.ip) ?? null;

    const probed = pingMap.has(server.ip);
    const status: EnrichedServer['status'] = probed
      ? ping !== null
        ? 'online'
        : 'offline'
      : 'checking';

    return { ...server, distance, ping, isNearest: false, score: null, status };
  });

  const distances = enriched.map(s => s.distance).filter((d): d is number => d !== null);
  const pings = enriched.map(s => s.ping).filter((p): p is number => p !== null);

  const maxDist = distances.length > 0 ? Math.max(...distances) : null;
  const maxPing = pings.length > 0 ? Math.max(...pings) : null;

  const withScore: EnrichedServer[] = enriched.map(server => {
    const normDist =
      maxDist !== null && server.distance !== null ? server.distance / maxDist : null;
    const normPing = maxPing !== null && server.ping !== null ? server.ping / maxPing : null;

    let score: number | null = null;
    if (normDist !== null && normPing !== null) {
      score = 0.4 * normDist + 0.6 * normPing;
    } else if (normDist !== null) {
      score = normDist;
    } else if (normPing !== null) {
      score = normPing;
    }

    return { ...server, score };
  });

  withScore.sort((a, b) => {
    if (a.score !== null && b.score !== null) return a.score - b.score;
    if (a.score !== null) return -1;
    if (b.score !== null) return 1;
    return (a.distance ?? Infinity) - (b.distance ?? Infinity);
  });

  if (withScore.length > 0) {
    const first = withScore[0];
    if (first.score !== null || first.distance !== null) {
      withScore[0] = { ...first, isNearest: true };
    }
  }

  return withScore;
}

interface GeolocationState {
  userLocation: Location | null;
  enrichedServers: EnrichedServer[];
  loading: boolean;
}

export function useGeolocation(servers: ReadonlyArray<ServerConfig>): GeolocationState {
  const [data, setData] = useState<GeolocationState>({
    userLocation: null,
    enrichedServers: servers as EnrichedServer[],
    loading: true,
  });

  const serversRef = useRef(servers);

  useEffect(() => {
    let cancelled = false;

    async function load(): Promise<void> {
      const svrs = serversRef.current;

      const [userLocation, pingMap] = await Promise.all([
        getUserLocation(),
        pingAll(svrs as ServerConfig[]),
      ]);

      if (cancelled) return;

      const enrichedServers = computeDistances(svrs, userLocation, pingMap);
      setData({ userLocation, enrichedServers, loading: false });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}

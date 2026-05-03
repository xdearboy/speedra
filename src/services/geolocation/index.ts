import { lookupASN } from './asn-lookup.js';
import { haversineDistance } from './distance.js';
import { getUserLocation as ipGetUserLocation, lookupIP } from './ip-lookup.js';

export type { ASNInfo } from './asn-lookup.js';
export type { Location } from './ip-lookup.js';

import type { ASNInfo } from './asn-lookup.js';
import type { Location } from './ip-lookup.js';

interface IpApiBatchItem {
  status: 'success' | 'fail';
  query?: string;
  lat?: number;
  lon?: number;
  city?: string;
  country?: string;
  countryCode?: string;
  isp?: string;
  org?: string;
  as?: string;
}

async function batchLookup(
  ips: string[]
): Promise<Map<string, { location: Location | null; asn: ASNInfo | null }>> {
  const result = new Map<string, { location: Location | null; asn: ASNInfo | null }>();

  if (ips.length === 0) return result;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(
      'http://ip-api.com/batch?fields=status,query,lat,lon,city,country,countryCode,isp,org,as',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ips.map(ip => ({ query: ip }))),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) return result;

    const data = (await response.json()) as IpApiBatchItem[];

    for (const item of data) {
      const ip = item.query ?? '';
      if (!ip) continue;

      let location: Location | null = null;
      let asn: ASNInfo | null = null;

      if (item.status === 'success' && item.lat != null && item.lon != null) {
        location = {
          latitude: item.lat,
          longitude: item.lon,
          city: item.city ?? '',
          country: item.country ?? '',
          countryCode: item.countryCode ?? '',
        };

        const asField = item.as ?? '';
        const match = asField.match(/^(AS\d+)\s+(.+)$/);
        if (match) {
          asn = { number: match[1], organization: match[2] };
        } else if (item.org ?? item.isp) {
          asn = { number: 'AS?', organization: item.org ?? item.isp ?? '' };
        }
      }

      result.set(ip, { location, asn });
    }
  } catch {}

  return result;
}

export class GeolocationService {
  private cache = new Map<string, { location: Location | null; asn: ASNInfo | null }>();

  async prefetch(ips: string[]): Promise<void> {
    const uncached = ips.filter(ip => !this.cache.has(ip));
    if (uncached.length === 0) return;

    const results = await batchLookup(uncached);
    for (const [ip, data] of results) {
      this.cache.set(ip, data);
    }

    for (const ip of uncached) {
      if (!this.cache.has(ip)) {
        this.cache.set(ip, { location: null, asn: null });
      }
    }
  }

  async getUserLocation(): Promise<Location | null> {
    try {
      return await ipGetUserLocation();
    } catch {
      return null;
    }
  }

  async getServerLocation(ip: string): Promise<Location | null> {
    if (this.cache.has(ip)) {
      return this.cache.get(ip)?.location ?? null;
    }
    try {
      return await lookupIP(ip);
    } catch {
      return null;
    }
  }

  calculateDistance(loc1: Location, loc2: Location): number {
    return haversineDistance(loc1.latitude, loc1.longitude, loc2.latitude, loc2.longitude);
  }

  async getASN(ip: string): Promise<ASNInfo | null> {
    if (this.cache.has(ip)) {
      return this.cache.get(ip)?.asn ?? null;
    }
    try {
      return await lookupASN(ip);
    } catch {
      return null;
    }
  }
}

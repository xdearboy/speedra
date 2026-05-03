export interface Location {
  latitude: number;
  longitude: number;
  city: string;
  country: string;

  countryCode: string;
}

interface IpApiResponse {
  status: 'success' | 'fail';
  lat?: number;
  lon?: number;
  city?: string;
  country?: string;
  countryCode?: string;
  isp?: string;
  org?: string;
  as?: string;
  query?: string;
}

export async function lookupIP(ip: string): Promise<Location | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,lat,lon,city,country,countryCode,isp,org,as`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = (await response.json()) as IpApiResponse;

    if (data.status !== 'success') return null;
    if (data.lat == null || data.lon == null) return null;

    return {
      latitude: data.lat,
      longitude: data.lon,
      city: data.city ?? '',
      country: data.country ?? '',
      countryCode: data.countryCode ?? '',
    };
  } catch {
    return null;
  }
}

export async function getUserPublicIP(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.ipify.org', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const ip = (await response.text()).trim();
    return ip.length > 0 ? ip : null;
  } catch {
    return null;
  }
}

export async function getUserLocation(): Promise<Location | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      'http://ip-api.com/json/?fields=status,lat,lon,city,country,countryCode',
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = (await response.json()) as IpApiResponse;

    if (data.status !== 'success') return null;
    if (data.lat == null || data.lon == null) return null;

    return {
      latitude: data.lat,
      longitude: data.lon,
      city: data.city ?? '',
      country: data.country ?? '',
      countryCode: data.countryCode ?? '',
    };
  } catch {
    return null;
  }
}

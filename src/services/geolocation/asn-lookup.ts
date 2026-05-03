export interface ASNInfo {
  number: string;

  organization: string;
}

interface IpApiResponse {
  status: 'success' | 'fail';
  isp?: string;
  org?: string;
  as?: string;
}

export async function lookupASN(ip: string): Promise<ASNInfo | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,isp,org,as`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = (await response.json()) as IpApiResponse;

    if (data.status !== 'success') return null;

    const asField = data.as ?? '';
    const match = asField.match(/^(AS\d+)\s+(.+)$/);

    if (match) {
      return {
        number: match[1],
        organization: match[2],
      };
    }

    const orgName = data.org ?? data.isp ?? null;
    if (!orgName) return null;

    return {
      number: 'AS?',
      organization: orgName,
    };
  } catch {
    return null;
  }
}

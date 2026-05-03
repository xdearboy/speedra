import { createConnection } from 'node:net';

export function tcpPing(host: string, port = 5201, timeoutMs = 2000): Promise<number | null> {
  return new Promise(resolve => {
    const start = Date.now();
    const socket = createConnection({ host, port });

    const timer = setTimeout(() => {
      socket.destroy();
      resolve(null);
    }, timeoutMs);

    socket.once('connect', () => {
      clearTimeout(timer);
      socket.destroy();
      resolve(Date.now() - start);
    });

    socket.once('error', () => {
      clearTimeout(timer);
      resolve(null);
    });
  });
}

export async function pingAll(
  servers: Array<{ ip: string; port: number }>
): Promise<Map<string, number | null>> {
  const results = await Promise.all(
    servers.map(async s => ({ ip: s.ip, latency: await tcpPing(s.ip, s.port) }))
  );
  return new Map(results.map(r => [r.ip, r.latency]));
}

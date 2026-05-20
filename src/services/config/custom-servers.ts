import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { ServerConfig } from '../../config/servers.js';

function getConfigDir(): string {
  const home = os.homedir();
  const platform = process.platform;

  if (platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'speedra');
  }
  if (platform === 'win32') {
    const appData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    return path.join(appData, 'speedra');
  }
  const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
  return path.join(xdgConfig, 'speedra');
}

const CONFIG_DIR = getConfigDir();
const CONFIG_PATH = path.join(CONFIG_DIR, 'servers.json');

interface StoredServer extends ServerConfig {
  isCustom: true;
}

interface ConfigFile {
  servers: StoredServer[];
}

async function ensureConfigDir(): Promise<void> {
  try {
    await fs.mkdir(CONFIG_DIR, { recursive: true });
  } catch {}
}

export async function loadCustomServers(): Promise<ServerConfig[]> {
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8');
    const data = JSON.parse(content) as ConfigFile;
    return data.servers ?? [];
  } catch {
    return [];
  }
}

export function makeCustomServerConfig(ip: string, port: number, name?: string): ServerConfig {
  const displayName = name || `${ip}:${port}`;
  const id = `custom-${ip.replace(/\./g, '-')}-${port}`;

  return {
    id,
    ip,
    port,
    name: displayName,
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
}

export async function saveCustomServer(config: ServerConfig): Promise<void> {
  await ensureConfigDir();

  let data: ConfigFile = { servers: [] };
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8');
    data = JSON.parse(content) as ConfigFile;
  } catch {}

  const existing = data.servers.findIndex(s => s.ip === config.ip && s.port === config.port);
  if (existing !== -1) {
    data.servers[existing] = { ...config, isCustom: true };
  } else {
    data.servers.push({ ...config, isCustom: true });
  }

  await fs.writeFile(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

export async function removeCustomServer(id: string): Promise<void> {
  try {
    const content = await fs.readFile(CONFIG_PATH, 'utf-8');
    const data = JSON.parse(content) as ConfigFile;

    data.servers = data.servers.filter(s => s.id !== id);

    await fs.writeFile(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

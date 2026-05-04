import { readFileSync } from 'node:fs';
import { execa } from 'execa';

export type Platform = 'darwin' | 'linux' | 'win32';
export type PackageManager =
  | 'brew'
  | 'port'
  | 'apt'
  | 'dnf'
  | 'yum'
  | 'pacman'
  | 'apk'
  | 'zypper'
  | 'winget'
  | 'choco'
  | 'scoop';

interface InstallCommand {
  manager: PackageManager;
  cmd: string;
  args: string[];
}

// Parse /etc/os-release and return key-value map
function readOsRelease(): Record<string, string> {
  try {
    const content = readFileSync('/etc/os-release', 'utf8');
    const result: Record<string, string> = {};
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_]+)="?([^"]*)"?$/);
      if (match?.[1] && match[2] !== undefined) {
        result[match[1]] = match[2];
      }
    }
    return result;
  } catch {
    return {};
  }
}

async function commandExists(cmd: string): Promise<boolean> {
  try {
    const result = await execa('which', [cmd], { reject: false });
    return result.exitCode === 0;
  } catch {
    return false;
  }
}

// Distro families → package manager
const DISTRO_PM: Record<string, InstallCommand> = {
  // Debian / Ubuntu family
  debian:   { manager: 'apt', cmd: 'apt-get', args: ['-y', 'install', 'iperf3'] },
  ubuntu:   { manager: 'apt', cmd: 'apt-get', args: ['-y', 'install', 'iperf3'] },
  linuxmint:{ manager: 'apt', cmd: 'apt-get', args: ['-y', 'install', 'iperf3'] },
  pop:      { manager: 'apt', cmd: 'apt-get', args: ['-y', 'install', 'iperf3'] },
  kali:     { manager: 'apt', cmd: 'apt-get', args: ['-y', 'install', 'iperf3'] },
  raspbian: { manager: 'apt', cmd: 'apt-get', args: ['-y', 'install', 'iperf3'] },

  // RHEL / AlmaLinux / Rocky / CentOS / Fedora family
  fedora:   { manager: 'dnf', cmd: 'dnf', args: ['-y', 'install', 'iperf3'] },
  rhel:     { manager: 'dnf', cmd: 'dnf', args: ['-y', 'install', 'iperf3'] },
  centos:   { manager: 'dnf', cmd: 'dnf', args: ['-y', 'install', 'iperf3'] },
  almalinux:{ manager: 'dnf', cmd: 'dnf', args: ['-y', 'install', 'iperf3'] },
  rocky:    { manager: 'dnf', cmd: 'dnf', args: ['-y', 'install', 'iperf3'] },
  ol:       { manager: 'dnf', cmd: 'dnf', args: ['-y', 'install', 'iperf3'] }, // Oracle Linux

  // Arch family
  arch:     { manager: 'pacman', cmd: 'pacman', args: ['-S', '--noconfirm', 'iperf3'] },
  manjaro:  { manager: 'pacman', cmd: 'pacman', args: ['-S', '--noconfirm', 'iperf3'] },
  endeavouros: { manager: 'pacman', cmd: 'pacman', args: ['-S', '--noconfirm', 'iperf3'] },

  // Alpine
  alpine:   { manager: 'apk', cmd: 'apk', args: ['add', 'iperf3'] },

  // openSUSE
  opensuse: { manager: 'zypper', cmd: 'zypper', args: ['install', '-y', 'iperf3'] },
  sles:     { manager: 'zypper', cmd: 'zypper', args: ['install', '-y', 'iperf3'] },
};

// Managers that need sudo
const NEEDS_SUDO = new Set<PackageManager>(['apt', 'dnf', 'yum', 'pacman', 'zypper', 'port']);

async function detectLinux(): Promise<InstallCommand | null> {
  const os = readOsRelease();

  // Check ID and ID_LIKE fields
  const ids = [
    os['ID'] ?? '',
    ...(os['ID_LIKE'] ?? '').split(/\s+/),
  ].map(s => s.toLowerCase().trim()).filter(Boolean);

  for (const id of ids) {
    const pm = DISTRO_PM[id];
    if (pm && await commandExists(pm.cmd)) {
      return pm;
    }
  }

  // Fallback: probe common package managers in order
  const fallbacks: InstallCommand[] = [
    { manager: 'dnf',    cmd: 'dnf',     args: ['-y', 'install', 'iperf3'] },
    { manager: 'apt',    cmd: 'apt-get', args: ['-y', 'install', 'iperf3'] },
    { manager: 'yum',    cmd: 'yum',     args: ['-y', 'install', 'iperf3'] },
    { manager: 'pacman', cmd: 'pacman',  args: ['-S', '--noconfirm', 'iperf3'] },
    { manager: 'apk',    cmd: 'apk',     args: ['add', 'iperf3'] },
    { manager: 'zypper', cmd: 'zypper',  args: ['install', '-y', 'iperf3'] },
  ];

  for (const fb of fallbacks) {
    if (await commandExists(fb.cmd)) return fb;
  }

  return null;
}

async function detectPackageManager(platform: Platform): Promise<InstallCommand | null> {
  if (platform === 'darwin') {
    if (await commandExists('brew')) {
      return { manager: 'brew', cmd: 'brew', args: ['install', 'iperf3'] };
    }
    if (await commandExists('port')) {
      return { manager: 'port', cmd: 'port', args: ['install', 'iperf3'] };
    }
    return null;
  }

  if (platform === 'linux') {
    return detectLinux();
  }

  if (platform === 'win32') {
    if (await commandExists('winget')) {
      return { manager: 'winget', cmd: 'winget', args: ['install', '--id', 'ESnet.iperf3', '-e', '--silent'] };
    }
    if (await commandExists('choco')) {
      return { manager: 'choco', cmd: 'choco', args: ['install', 'iperf3', '-y'] };
    }
    if (await commandExists('scoop')) {
      return { manager: 'scoop', cmd: 'scoop', args: ['install', 'iperf3'] };
    }
    return null;
  }

  return null;
}

export interface InstallResult {
  success: boolean;
  method: string;
  error?: string;
}

export async function autoInstallIperf3(onProgress: (msg: string) => void): Promise<InstallResult> {
  const platform = process.platform as Platform;
  const pm = await detectPackageManager(platform);

  if (!pm) {
    return { success: false, method: 'none', error: 'No supported package manager found.' };
  }

  const needsSudo = NEEDS_SUDO.has(pm.manager);
  const displayCmd = needsSudo
    ? `sudo ${pm.cmd} ${pm.args.join(' ')}`
    : `${pm.cmd} ${pm.args.join(' ')}`;

  onProgress(`Installing iperf3 via ${pm.manager}…`);
  onProgress(`Running: ${displayCmd}`);

  try {
    if (needsSudo) {
      await execa('sudo', [pm.cmd, ...pm.args], { stdio: 'inherit' });
    } else {
      await execa(pm.cmd, pm.args, { stdio: 'inherit' });
    }
    return { success: true, method: displayCmd };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, method: displayCmd, error: message };
  }
}

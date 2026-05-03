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
  args: string[];
  checkCmd: string;
}

async function commandExists(cmd: string): Promise<boolean> {
  try {
    await execa(cmd, ['--version'], { reject: false });
    return true;
  } catch {
    return false;
  }
}

async function detectPackageManager(platform: Platform): Promise<InstallCommand | null> {
  if (platform === 'darwin') {
    if (await commandExists('brew')) {
      return { manager: 'brew', args: ['install', 'iperf3'], checkCmd: 'brew' };
    }
    if (await commandExists('port')) {
      return { manager: 'port', args: ['install', 'iperf3'], checkCmd: 'port' };
    }
    return null;
  }

  if (platform === 'linux') {
    if (await commandExists('apt-get')) {
      return { manager: 'apt', args: ['-y', 'install', 'iperf3'], checkCmd: 'apt-get' };
    }
    if (await commandExists('dnf')) {
      return { manager: 'dnf', args: ['-y', 'install', 'iperf3'], checkCmd: 'dnf' };
    }
    if (await commandExists('yum')) {
      return { manager: 'yum', args: ['-y', 'install', 'iperf3'], checkCmd: 'yum' };
    }
    if (await commandExists('pacman')) {
      return { manager: 'pacman', args: ['-S', '--noconfirm', 'iperf3'], checkCmd: 'pacman' };
    }
    if (await commandExists('apk')) {
      return { manager: 'apk', args: ['add', 'iperf3'], checkCmd: 'apk' };
    }
    if (await commandExists('zypper')) {
      return { manager: 'zypper', args: ['install', '-y', 'iperf3'], checkCmd: 'zypper' };
    }
    return null;
  }

  if (platform === 'win32') {
    if (await commandExists('winget')) {
      return {
        manager: 'winget',
        args: ['install', '--id', 'ESnet.iperf3', '-e', '--silent'],
        checkCmd: 'winget',
      };
    }
    if (await commandExists('choco')) {
      return { manager: 'choco', args: ['install', 'iperf3', '-y'], checkCmd: 'choco' };
    }
    if (await commandExists('scoop')) {
      return { manager: 'scoop', args: ['install', 'iperf3'], checkCmd: 'scoop' };
    }
    return null;
  }

  return null;
}

function getInstallCmd(cmd: InstallCommand): string {
  const needsSudo =
    cmd.manager === 'apt' ||
    cmd.manager === 'dnf' ||
    cmd.manager === 'yum' ||
    cmd.manager === 'pacman' ||
    cmd.manager === 'zypper' ||
    cmd.manager === 'port';

  const base = `${cmd.checkCmd} ${cmd.args.join(' ')}`;
  return needsSudo ? `sudo ${base}` : base;
}

export interface InstallResult {
  success: boolean;
  method: string;
  error?: string;
}

export async function autoInstallIperf3(onProgress: (msg: string) => void): Promise<InstallResult> {
  const platform = process.platform as Platform;
  const cmd = await detectPackageManager(platform);

  if (!cmd) {
    return {
      success: false,
      method: 'none',
      error: 'No supported package manager found.',
    };
  }

  const displayCmd = getInstallCmd(cmd);
  onProgress(`Installing iperf3 via ${cmd.manager}…`);
  onProgress(`Running: ${displayCmd}`);

  try {
    const needsSudo =
      cmd.manager === 'apt' ||
      cmd.manager === 'dnf' ||
      cmd.manager === 'yum' ||
      cmd.manager === 'pacman' ||
      cmd.manager === 'zypper' ||
      cmd.manager === 'port';

    if (needsSudo) {
      await execa('sudo', [cmd.checkCmd, ...cmd.args], { stdio: 'inherit' });
    } else {
      await execa(cmd.checkCmd, cmd.args, { stdio: 'inherit' });
    }

    return { success: true, method: displayCmd };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, method: displayCmd, error: message };
  }
}

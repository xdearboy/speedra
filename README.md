# speedra

[![npm version](https://img.shields.io/npm/v/speedra.svg)](https://www.npmjs.com/package/speedra)
[![CI](https://github.com/xdearboy/speedra/actions/workflows/release.yml/badge.svg)](https://github.com/xdearboy/speedra/actions/workflows/release.yml)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A beautiful, modern TUI-based CLI tool for network speed testing using iperf3. Test your connection against multiple servers with real-time progress, geolocation-aware server ranking, and Catppuccin Mocha visuals.

```
                         _
                        | |
 ___ _ __   ___  ___  __| |_ __ __ _
/ __| '_ \ / _ \/ _ \/ _` | '__/ _` |
\__ \ |_) |  __/  __/ (_| | | | (_| |
|___/ .__/ \___|\___|\__,_|_|  \__,_|
    | |
    |_|

 v1.0.0  — network speed test

📍 Amsterdam, NL

Available Servers
────────────────────────────────────────────────
◉ ⭐ 🇩🇪 Frankfurt · Frankfurt am Main, Germany
    213.165.53.248:5201  ●●●  312 km  42 ms  AS207567 Intezio
○    🇪🇪 Tallinn · Tallinn, Estonia
    138.124.100.47:5201  ●●●  450 km  61 ms  AS207567 Intezio
○    🇳🇱 Netherlands · Eygelshoven, Netherlands
    138.124.105.21:5201  ●●○  890 km  38 ms  AS207567 Intezio
○    🇵🇱 Warsaw · Warsaw, Poland
    95.85.254.73:5201    ●●●  520 km  55 ms  AS207567 Intezio

↑↓ Navigate · Space Select · Enter Start · n Nearest · Esc Cancel · r Reset · q Quit
```

## Installation

### Linux x64 (run now, no install)

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/xdearboy/speedra/main/scripts/run-linux.sh)
```

### Linux x64 (install one command)

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/xdearboy/speedra/main/scripts/install.sh)
```
### Via npm (requires Node.js ≥ 18)

```bash
npm install -g speedra
```

Or run without installing:

```bash
npx speedra
```

### Standalone binary (no Node.js required)

Download the binary from [GitHub Releases](https://github.com/xdearboy/speedra/releases):

| Platform            | File                  |
| ------------------- | --------------------- |
| Linux x64           | `speedra-linux-x64`   |

Note: right now CI builds only Linux x64 binary due current GitHub runner/workflow limitations.

Make it executable (Linux):

```bash
chmod +x speedra-linux-x64
./speedra-linux-x64
```

## iperf3

speedra requires **iperf3**. If it's not installed, speedra will offer to install it automatically on first run:

```
  ✗  iperf3 is not installed or not found in PATH.

  Install iperf3 automatically? [Y/n]
```

Press Enter and speedra will detect your package manager and install iperf3 for you.

Supported package managers: `brew`, `port`, `apt-get`, `dnf`, `yum`, `pacman`, `apk`, `zypper`, `winget`, `choco`, `scoop`.

To install manually:

```bash
# macOS
brew install iperf3

# Ubuntu / Debian
sudo apt-get install iperf3

# Fedora / RHEL
sudo dnf install iperf3

# Arch Linux
sudo pacman -S iperf3

# Windows (winget)
winget install ESnet.iperf3
```

## Usage

```bash
speedra           # launch TUI
speedra --version # print version
speedra -v        # same
```

### Workflow

1. **Launch** — speedra detects your location and ranks servers by distance + latency
2. **Select** — navigate with `↑↓`, toggle with `Space`
3. **Test** — press `Enter` or `n` to instantly test the nearest server
4. **Results** — color-coded download/upload speeds, latency, ASN info

### Keyboard shortcuts

| Key       | Action                                      |
| --------- | ------------------------------------------- |
| `↑` / `↓` | Navigate server list                        |
| `Space`   | Toggle server selection                     |
| `Enter`   | Start tests for selected servers            |
| `n`       | Select nearest server and start immediately |
| `Esc`     | Cancel running test                         |
| `r`       | Reset results                               |
| `q`       | Quit                                        |

## Features

- **Auto-install iperf3** — detects your package manager and installs on first run
- **Server availability check** — offline servers are marked `✗ offline` and cannot be selected
- **Geolocation ranking** — servers sorted by combined distance + ping score
- **Real-time progress** — animated bar, live bandwidth, sparkline trend
- **Color-coded results** — green ≥100 Mbits/s, yellow ≥10, red <10
- **Distance indicators** — ●●● < 500 km, ●●○ 500–2000 km, ●○○ > 2000 km
- **Standalone binaries** — no Node.js required, download and run

## Test servers

| Name                | IP             | Port | Location    |
| ------------------- | -------------- | ---- | ----------- |
| Frankfurt           | 213.165.53.248 | 5201 | Germany     |
| Tallinn             | 138.124.100.47 | 5201 | Estonia     |
| Netherlands         | 138.124.105.21 | 5201 | Netherlands |
| Warsaw              | 95.85.254.73   | 5201 | Poland      |
| Frankfurt (play2go) | 94.156.114.3   | 5201 | Germany     |
| Amsterdam (play2go) | 144.31.30.177  | 5201 | Netherlands |
| Zurich              | 185.102.218.1  | 5201 | Switzerland |

All tests use 8 parallel TCP streams (`-P 8`) for accurate throughput measurement.

## Requirements

- **Node.js** 18+ (npm install) or no requirements (standalone binary)
- **iperf3** — auto-installed on first run if missing
- Terminal: 80×24 minimum

## Troubleshooting

**`speedra: command not found`** after global install:

```bash
npm bin -g   # find the bin directory
# add it to PATH in ~/.bashrc or ~/.zshrc
export PATH="$(npm bin -g):$PATH"
```

**Connection refused / test fails:**
- Check firewall allows outbound TCP on port 5201
- Verify server is reachable: `iperf3 -c 213.165.53.248 -p 5201`

**Terminal looks garbled after crash:**

```bash
reset
```

## License

[MIT](LICENSE)



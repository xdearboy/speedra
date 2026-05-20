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

To pass flags, use this form instead:

```bash
curl -fsSL https://raw.githubusercontent.com/xdearboy/speedra/main/scripts/run-linux.sh | bash -s -- --nearest
curl -fsSL https://raw.githubusercontent.com/xdearboy/speedra/main/scripts/run-linux.sh | bash -s -- --nearest-asn
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

| Platform  | File                |
| --------- | ------------------- |
| Linux x64 | `speedra-linux-x64` |

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
speedra --nearest # auto-start nearest server test
speedra --nearest-asn          # auto-start nearest server in your own ASN (fallback to nearest)
speedra --nearest-asn as207567 # auto-start nearest server matching a specific ASN
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
| `a`       | Add custom iperf3 server interactively      |
| `Esc`     | Cancel running test                         |
| `r`       | Reset results                               |
| `q`       | Quit                                        |

### Custom Servers

Add your own iperf3 servers for testing (home lab, corporate network, specific regions):

#### Via command line

```bash
# Add single custom server
speedra --server 192.168.1.100:5201

# With custom name
speedra --server 192.168.1.100:5201 "My Home Server"

# Multiple servers
speedra --server 10.0.0.1:5201 "Office" --server 192.168.0.50:5201 "Lab"
```

#### Interactively in TUI

Press `a` in the server list to add a custom server:
- **Host**: IP address or hostname (required)
- **Port**: iperf3 port, default 5201
- **Name**: Display name (optional, auto-generated if empty)
- **Save permanently**: `[Y/n]` — persists to config file for future sessions

#### Persistent storage

Custom servers are saved to:
- **macOS**: `~/Library/Application Support/speedra/servers.json`
- **Windows**: `C:\Users\<user>\AppData\Local\speedra\servers.json`
- **Linux**: `~/.config/speedra/servers.json`

Custom servers are marked with ✦ and appear alongside built-in servers. They are automatically pinged and ranked by distance + latency.

## Features

- **Auto-install iperf3** — detects your package manager and installs on first run
- **Server availability check** — offline servers are marked `✗ offline` and cannot be selected
- **Geolocation ranking** — servers sorted by combined distance + ping score
- **Real-time progress** — animated bar, live bandwidth, sparkline trend
- **Color-coded results** — green ≥100 Mbits/s, yellow ≥10, red <10
- **Distance indicators** — ●●● < 500 km, ●●○ 500–2000 km, ●○○ > 2000 km
- **Standalone binaries** — no Node.js required, download and run

## Test servers

27 servers across Europe, Russia, and the US — sorted by distance + latency automatically.

### Europe

| Name                    | IP             | Port | Location    | ASN                 |
| ----------------------- | -------------- | ---- | ----------- | ------------------- |
| Frankfurt               | 213.165.53.248 | 5201 | Germany     | AS207567 Intezio    |
| Tallinn                 | 138.124.100.47 | 5201 | Estonia     | AS207567 Intezio    |
| Netherlands             | 138.124.105.21 | 5201 | Netherlands | AS207567 Intezio    |
| Warsaw                  | 95.85.254.73   | 5201 | Poland      | AS207567 Intezio    |
| Frankfurt (play2go)     | 94.156.114.3   | 5201 | Germany     | AS215439 PLAY2GO    |
| Kerkrade (play2go)      | 144.31.30.177  | 5201 | Netherlands | AS215439 PLAY2GO    |
| Amsterdam (Datacamp)    | 185.102.218.1  | 5201 | Netherlands | AS60068 Datacamp    |
| Frankfurt (Clouvider)   | 91.199.118.184 | 5200 | Germany     | AS62240 Clouvider   |
| Rotterdam (Worldstream) | 185.182.195.76 | 5201 | Netherlands | AS49981 WorldStream |
| Dronten (Serverius)     | 5.178.66.18    | 5002 | Netherlands | AS50673 Serverius   |
| Paris (Scaleway)        | 51.158.1.21    | 5201 | France      | AS12876 Scaleway    |

### United States

| Name                          | IP             | Port | Location   | ASN                       |
| ----------------------------- | -------------- | ---- | ---------- | ------------------------- |
| San Jose (Hurricane Electric) | 216.218.207.42 | 5201 | California | AS6939 Hurricane Electric |

### Russia

| Name                         | IP              | Port | Location         | ASN                |
| ---------------------------- | --------------- | ---- | ---------------- | ------------------ |
| Moscow (MTS)                 | 212.188.4.173   | 3333 | Moscow           | AS8359 MTS         |
| Krasnodar (MTS)              | 212.188.4.231   | 3333 | Krasnodar        | AS8359 MTS         |
| Yakutsk (MTS)                | 212.188.4.239   | 3333 | Yakutsk          | AS8359 MTS         |
| Moscow (Hostkey)             | 31.192.104.200  | 5201 | Moscow           | AS50867 Hostkey    |
| Saint Petersburg (Ertelecom) | 109.195.80.230  | 5201 | Saint Petersburg | AS51570 ER-Telecom |
| Yekaterinburg (Ertelecom)    | 109.195.96.230  | 5201 | Yekaterinburg    | AS51604 ER-Telecom |
| Novosibirsk (Ertelecom)      | 109.194.80.230  | 5201 | Novosibirsk      | AS43478 ER-Telecom |
| Kazan (Ertelecom)            | 109.194.176.230 | 5201 | Kazan            | AS41668 ER-Telecom |
| Rostov-on-Don (Ertelecom)    | 109.195.224.230 | 5201 | Rostov-on-Don    | AS57378 ER-Telecom |
| Irkutsk (Ertelecom)          | 109.194.16.230  | 5201 | Irkutsk          | AS51645 ER-Telecom |
| Krasnoyarsk (Ertelecom)      | 109.195.64.230  | 5201 | Krasnoyarsk      | AS50544 ER-Telecom |
| Perm (Ertelecom)             | 212.33.230.200  | 5201 | Perm             | AS12768 ER-Telecom |
| Ufa (Ertelecom)              | 109.195.144.230 | 5201 | Ufa              | AS51035 ER-Telecom |
| Samara (Ertelecom)           | 85.113.62.252   | 5201 | Samara           | AS34533 ER-Telecom |
| Nizhny Novgorod (Ertelecom)  | 91.144.184.231  | 5201 | Nizhny Novgorod  | AS42682 ER-Telecom |

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




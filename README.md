# speedra

[![npm version](https://img.shields.io/npm/v/speedra.svg)](https://www.npmjs.com/package/speedra)
[![CI](https://github.com/your-org/speedra/actions/workflows/test.yml/badge.svg)](https://github.com/your-org/speedra/actions/workflows/test.yml)
[![Coverage](https://img.shields.io/badge/coverage-80%25-brightgreen.svg)](https://github.com/your-org/speedra/actions)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A beautiful, modern TUI-based CLI tool for hosting speed testing using iperf3. Test your server's network performance against multiple predefined endpoints with real-time progress, geolocation-aware server ranking, and stunning terminal visuals.

## Screenshot

<!-- TODO: Add animated GIF demo here -->
> *Animated demo coming soon — showing server selection, real-time progress bars, and results table.*

```
┌─────────────────────────────────────────────────────────────┐
│                        speedra                              │
├─────────────────────────────────────────────────────────────┤
│ 📍 Amsterdam, NL                          Detecting servers │
├─────────────────────────────────────────────────────────────┤
│  [✓] ⭐ 🇩🇪 213.165.53.248:5201  ●●●  312 km  AS12345 Hetzner │
│  [ ]    🇳🇱 138.124.100.47:5201  ●●●  450 km  AS24940 Hetzner │
│  [ ]    🇩🇪 138.124.105.21:5201  ●●○  890 km  AS24940 Hetzner │
│  [ ]    🇫🇷  95.85.254.73:5201   ●○○  2100 km AS16276 OVH    │
├─────────────────────────────────────────────────────────────┤
│ ↑↓ Navigate · Space Select · Enter Start · n Nearest · q Quit│
└─────────────────────────────────────────────────────────────┘
```

## Installation

```bash
npm install -g speedra
```

Then run it from anywhere:

```bash
speedra
```

## Prerequisites

speedra requires **iperf3** to be installed on your system.

### macOS

```bash
brew install iperf3
```

### Ubuntu / Debian

```bash
sudo apt-get install iperf3
```

### Fedora / RHEL / CentOS

```bash
sudo dnf install iperf3
```

### Arch Linux

```bash
sudo pacman -S iperf3
```

### Windows

Download the iperf3 binary from the [official iperf3 website](https://iperf.fr/iperf-download.php) and add it to your `PATH`.

Alternatively, using [Chocolatey](https://chocolatey.org):

```bash
choco install iperf3
```

Or using [Scoop](https://scoop.sh):

```bash
scoop install iperf3
```

### Verify installation

```bash
iperf3 --version
```

## Usage

Launch the TUI:

```bash
speedra
```

Check the installed version:

```bash
speedra --version
# or
speedra -v
```

### Workflow

1. **Launch** — speedra starts and automatically detects your location, then ranks the four test servers by distance.
2. **Select servers** — use the keyboard to navigate and pick which servers to test.
3. **Run tests** — press Enter (or `n` to instantly test the nearest server).
4. **View results** — a results table shows download bandwidth, latency, and status for each server.

### Keyboard Shortcuts

| Key       | Action                                           |
| --------- | ------------------------------------------------ |
| `↑` / `↓` | Navigate the server list                         |
| `Space`   | Toggle server selection                          |
| `Enter`   | Start tests for selected servers                 |
| `n`       | Select nearest server and start test immediately |
| `Esc`     | Cancel running test                              |
| `r`       | Reset results and return to selection            |
| `q`       | Quit the application                             |

## Features

- **Automatic nearest server detection** — geolocation ranks servers by distance so you test the most relevant one first.
- **Real-time progress** — animated progress bar, live bandwidth readings, elapsed time, and sparkline charts while tests run.
- **Beautiful results table** — color-coded bandwidth values (green ≥100 Mbits/s, yellow ≥10, red <10), country flags, ASN info, and latency.
- **Distance indicators** — ●●● (< 500 km), ●●○ (500–2000 km), ●○○ (> 2000 km) with matching colors.
- **Graceful error handling** — failed tests are marked clearly; remaining servers continue testing.
- **Clean exit** — restores terminal state and kills any running iperf3 processes on exit.

## Test Servers

| IP             | Port | Region |
| -------------- | ---- | ------ |
| 213.165.53.248 | 5201 | EU     |
| 138.124.100.47 | 5201 | EU     |
| 138.124.105.21 | 5201 | EU     |
| 95.85.254.73   | 5201 | EU     |

All tests use 8 parallel TCP streams (`-P 8`) for accurate throughput measurement.

## Requirements

- **Node.js** 18 or later
- **iperf3** installed and available in `PATH`
- A terminal with at least 80×24 characters

## Troubleshooting

### `speedra: command not found`

The global npm bin directory is not in your `PATH`. Find it with:

```bash
npm bin -g
```

Then add that directory to your shell's `PATH` (e.g. in `~/.bashrc` or `~/.zshrc`):

```bash
export PATH="$(npm bin -g):$PATH"
```

### `iperf3 not found` error on startup

speedra requires iperf3 to be installed. See the [Prerequisites](#prerequisites) section above for platform-specific install commands.

### Connection refused / test fails

- Confirm the server is reachable: `iperf3 -c 213.165.53.248 -p 5201`
- Check that your firewall allows outbound TCP on port 5201.
- Some networks block iperf3 traffic — try a different network or VPN.

### Results look unexpectedly low

- Close other bandwidth-heavy applications before testing.
- Run tests one server at a time to isolate the bottleneck.
- Try the nearest server first (`n` key) for the most representative result.

### Terminal looks garbled after exit

If speedra crashes without cleaning up, run:

```bash
reset
```

to restore your terminal to a normal state.

### Tests time out

iperf3 tests run for ~10 seconds each. If a test consistently times out, the server may be temporarily unavailable. Try again later or select a different server.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, code style requirements, and the PR process.

## License

[MIT](LICENSE)

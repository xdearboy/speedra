# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Running the app locally
```bash
npm start                  # Run TUI immediately with tsx
npm run build              # Compile TypeScript and apply postbuild script
```

### Type checking and linting
```bash
npm run typecheck          # Check types without emitting
npm run lint               # Check code style with Biome
npm run lint:fix           # Auto-fix linting issues
npm run format             # Auto-format with Biome
npm run format:check       # Check formatting without changes
npm run check              # Lint + format check combined
npm run check:fix          # Lint + format with auto-fixes
```

### Testing
```bash
npm test                   # Run all tests (unit only by default)
npm run test:unit          # Run tests in tests/unit/
npm run test:coverage      # Run with coverage report (80% threshold enforced)
npm run test:watch         # Run tests in watch mode (note: not in package.json, use Vitest directly)
```

Coverage thresholds (all 80%): lines, functions, branches, statements.

## Project Architecture

**speedra** is a TUI-based speed testing CLI that combines multiple subsystems:

### Core Application Flow

1. **Entry Point** (`src/index.ts`): 
   - Parses CLI args (`--nearest`, `--nearest-asn`, `--version`)
   - Validates or auto-installs iperf3
   - Creates Application instance and runs it

2. **Application Lifecycle** (`src/app.ts`):
   - Manages React/Ink rendering and lifecycle
   - Tracks running iperf3 processes for graceful shutdown on SIGINT/SIGTERM
   - Handles alternate screen (TUI mode)

3. **React TUI** (`src/components/App.tsx` + children):
   - Three views: `selection` (server list), `testing` (live progress), `results` (speed metrics)
   - Uses three main hooks: `useGeolocation`, `useKeyboard`, `useTestRunner`
   - Renders via Ink (React renderer for terminal)

### Key Subsystems

**Geolocation** (`src/services/geolocation/`):
- `ip-lookup.ts`: Get user's public IP and location (city/country)
- `asn-lookup.ts`: Reverse-lookup ASN from IP
- `distance.ts`: Calculate great-circle distance between coordinates
- `ping.ts`: Measure RTT to each server via ICMP
- `index.ts`: Orchestrates ranking servers by distance + ping score

**Network Execution** (`src/services/network/`):
- `executor.ts`: Execute iperf3 in client mode, parse output in real-time, yield progress events
- `queue.ts`: Serial queue for running tests (one at a time, preserving order)
- `validator.ts`: Check if iperf3 binary exists and is executable
- `installer.ts`: Auto-detect package manager and install iperf3

**Parser** (`src/services/parser/`):
- `schemas.ts`: Zod schemas for iperf3 JSON and text output formats
- `json-parser.ts`: Parse iperf3 JSON output (intervals + summary)
- `text-parser.ts`: Fallback parser for plain text output
- `printer.ts`: Format results for display (colors, speed units)

**Theme** (`src/services/theme/`):
- `colors.ts`: Color codes for Catppuccin Mocha palette
- `symbols.ts`: Unicode symbols (bullets, circles, arrows)
- `animations.ts`: Spinner frames for progress indicators

**Hooks** (`src/hooks/`):
- `useGeolocation.ts`: Fetch IP, detect location, rank servers
- `useKeyboard.ts`: Handle keyboard input (arrow keys, Enter, etc.) via stdin
- `useTestRunner.ts`: Coordinate iperf3 test execution, aggregate results

### Types and Configuration

- `src/types.ts`: Core TypeScript types (`EnrichedServer`, `CurrentTest`, `DirectionResult`, `CombinedResult`, `KeyboardAction`)
- `src/config/servers.ts`: Hardcoded list of 27 test servers (Europe, Russia, US) with coordinates and iperf3 endpoints
- `src/utils/`: Format helpers, terminal utilities (alternate screen), constants

## Code Style

Biome enforces all style rules. Key rules (also in biome.json):

- **Indentation**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes
- **Trailing commas**: ES5 style (valid in objects/arrays)
- **Arrow functions**: No parens for single params
- **Variables**: `const` preferred, `let` allowed, `var` forbidden
- **Imports**: Auto-organized on save via Biome assist
- **Semicolons**: Always included
- **Console**: Warn-level in linter (avoid in production code; use TUI components instead)
- **JSX**: React classic runtime

Run `npm run check:fix` before committing to auto-fix all style issues.

## Testing Strategy

- **Location**: Tests co-locate with source files (`*.test.ts` / `*.test.tsx`) or live under `tests/unit/`
- **Framework**: Vitest (v8 coverage provider)
- **Coverage threshold**: 80% (lines, functions, branches, statements) — enforced by CI
- **Property-based tests**: Use `fast-check` for pure utility functions and invariant validation
- **Property test pattern**: Place in `tests/property/<module>.property.test.ts`
- **Mocking**: Avoid mocking; test real logic. Only mock external side effects (process execution, network calls) when necessary
- **Integration tests**: Require iperf3 binary; should skip gracefully if unavailable

Example property test:
```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { myFunction } from '../../src/utils/my-module.js';

describe('myFunction properties', () => {
  it('should always return a non-negative value', () => {
    fc.assert(
      fc.property(fc.integer(), input => {
        expect(myFunction(input)).toBeGreaterThanOrEqual(0);
      })
    );
  });
});
```

## Common Workflows

### Adding a new iperf3 output format
1. Add Zod schema to `src/services/parser/schemas.ts`
2. Implement parser function in `json-parser.ts` or `text-parser.ts`
3. Update `src/services/parser/index.ts` to detect and use it
4. Add tests in `tests/unit/` with real iperf3 output samples
5. Verify coverage stays at 80%

### Adding a test server
1. Update `src/config/servers.ts` (add to appropriate region, keep sorted)
2. Verify geolocation ranking works with `npm start -- --nearest`
3. Add server details to README.md table

### Fixing a TUI display issue
1. Find the relevant component in `src/components/`
2. Check `src/services/theme/` for color/symbol definitions
3. Test visually with `npm start`
4. Add unit tests for component logic (use React Testing Library)

### Improving performance
1. Profile iperf3 execution in `src/services/network/executor.ts` (streaming chunks, interval handling)
2. Check geolocation parallel requests in `src/services/geolocation/index.ts`
3. Verify test queue behavior in `src/services/network/queue.ts`
4. Add benchmarks (fast-check property tests for algorithmic performance)

## CI and Deployment

- CI runs `npm run check`, `npm run typecheck`, and `npm test` (coverage enforced)
- Builds compile to `dist/` for npm publishing
- Standalone Linux binary built via `scripts/postbuild.js` (uses wasm-pack or similar)
- Entry point is `dist/index.js` (configured as `bin.speedra` in package.json)

## Debugging Tips

- **TUI crashes or terminal looks broken**: Run `reset` in terminal to restore
- **Geolocation failing**: Check IP lookup and ASN lookup separately; may be rate-limited or IP-blocked
- **Tests timeout**: Increase in vitest.config.ts (default 30s) if testing slow network conditions
- **Process not exiting**: Check Application.shutdown() in src/app.ts for hanging processes; review signal handlers

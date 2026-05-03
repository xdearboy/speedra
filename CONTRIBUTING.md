# Contributing to speedra

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Table of Contents

- [Development Setup](#development-setup)
- [Code Style](#code-style)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)

---

## Development Setup

### Prerequisites

- **Node.js** 18 or later — [nodejs.org](https://nodejs.org)
- **iperf3** installed and available in `PATH` (required to run integration tests)
- **npm** 9 or later (bundled with Node.js)

Install iperf3:

```bash
# macOS
brew install iperf3

# Ubuntu / Debian
sudo apt-get install iperf3

# Fedora / RHEL
sudo dnf install iperf3

# Arch Linux
sudo pacman -S iperf3
```

### Clone and install

```bash
git clone https://github.com/your-org/speedra.git
cd speedra
npm install
```

### Run the tool locally

```bash
npm start
```

### Type checking

```bash
npm run typecheck
```

### Build

```bash
npm run build
```

---

## Code Style

The project uses [Biome](https://biomejs.dev) for both linting and formatting. There is no separate ESLint or Prettier config — Biome handles everything.

### Key style rules

- 2-space indentation, 100-character line width
- Single quotes for strings
- Trailing commas where valid in ES5
- Arrow function parentheses omitted for single parameters
- `const` over `let`; `var` is forbidden
- No `console` calls in production code (use the TUI components instead)
- Imports are auto-organized on save/check

### Running the linter

```bash
# Check for lint issues
npm run lint

# Auto-fix lint issues
npm run lint:fix
```

### Running the formatter

```bash
# Check formatting without writing changes
npm run format:check

# Apply formatting
npm run format
```

### Run both lint and format together

```bash
# Check
npm run check

# Check and auto-fix
npm run check:fix
```

Make sure `npm run check` passes with no errors before opening a PR.

---

## Testing

### Test structure

```
tests/
  unit/         # Unit tests for individual modules
  property/     # Property-based tests using fast-check
  integration/  # Integration tests (require iperf3)
  components/   # React component tests
```

### Running tests

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only property-based tests
npm run test:property

# Run only integration tests (requires iperf3)
npm run test:integration

# Run with coverage report
npm run test:coverage

# Watch mode during development
npm run test:watch
```

### Coverage requirements

All PRs must maintain **80% coverage** across lines, functions, branches, and statements. The coverage thresholds are enforced by Vitest and will fail the CI build if not met.

```
lines:      80%
functions:  80%
branches:   80%
statements: 80%
```

Run `npm run test:coverage` locally before pushing to verify you meet the threshold.

### Property-based tests

New utility functions and pure logic modules should include property-based tests using [fast-check](https://fast-check.dev). Property tests live in `tests/property/` and follow the naming convention `<module>.property.test.ts`.

A property test verifies that a function holds a universal invariant across many generated inputs, not just a handful of hand-picked examples:

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

### Writing good tests

- Co-locate unit tests with source files using the `.test.ts` / `.test.tsx` suffix, or place them under the matching path in `tests/`.
- Test the public interface of a module, not its internals.
- Use descriptive test names that read as sentences: `'returns red color for bandwidth below 10 Mbps'`.
- Avoid mocking unless you are testing a component that has an external side effect (network call, file system). Test real logic with real inputs.
- Integration tests that require a live iperf3 server should be skipped gracefully when the binary is unavailable.

---

## Pull Request Process

### Branching

Branch off `main` using a short, descriptive name:

```
feat/geolocation-caching
fix/parser-null-output
chore/update-dependencies
docs/contributing-guide
```

Prefixes: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`.

### Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <short summary>

[optional body]

[optional footer]
```

Examples:

```
feat(parser): add support for iperf3 JSON output format
fix(geolocation): handle missing IP in ASN lookup response
test(formatter): add property tests for speed color thresholds
docs: update CONTRIBUTING with biome setup instructions
```

Keep the summary line under 72 characters. Use the body to explain *why*, not *what*.

### Before opening a PR

1. Run `npm run check` — no lint or format errors.
2. Run `npm run typecheck` — no TypeScript errors.
3. Run `npm run test:coverage` — coverage stays at or above 80%.
4. Update documentation if you changed public-facing behavior.

### PR description

Include:

- **What** — a brief summary of the change.
- **Why** — the motivation or problem being solved.
- **How** — any non-obvious implementation decisions.
- **Testing** — what tests were added or updated.

### Review process

- At least one approval is required before merging.
- Address all review comments before requesting a re-review.
- Prefer small, focused PRs — they are easier to review and less likely to introduce regressions.
- Squash commits when merging to keep the main branch history clean.

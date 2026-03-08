# Copilot Instructions

## Project Overview

`apple-cli` is a macOS CLI tool that wraps [`apple-mcp`](../apple-mcp) — a collection of standalone [Model Context Protocol (MCP)](https://modelcontextprotocol.io) servers for Apple apps (Notes, Messages, Contacts, Mail, Reminders, Calendar, Maps). The CLI layer imports the same AppleScript modules used by the MCP servers directly.

## Commands

```bash
npm start              # Run CLI via tsx (no build needed)
npm run prepare        # Build Swift EventKit binary for Calendar
```

There is no test or lint script at the root. Each `apple-mcp/*` submodule has its own build/test commands:

```bash
cd apple-mcp/notes && npm run build      # tsc
cd apple-mcp/calendar && npm run build   # tsc + Swift universal binary
cd apple-mcp/messages && bun test        # bun test tests/applescript.test.ts
```

## Architecture

The project has two distinct layers that share the same core business logic:

```
bin/apple-cli (bash shim → tsx)
  └── src/index.ts              # Commander.js root, parses global safety flags
        └── src/apps/*.ts       # One file per app; registers subcommands
              ├── src/utils/output.ts           # output(), fatal(), assertWritable(), assertDestructive()
              └── apple-mcp/{app}/src/applescript.ts  # Actual Apple app interaction
                    ├── sanitize()              # AppleScript injection prevention
                    └── runAppleScript()        # Spawns osascript subprocess
```

The `apple-mcp/` directory is a **git submodule** containing independently publishable MCP servers (`@griches/apple-notes-mcp`, etc.). The CLI imports from them directly (no build step) via `tsx`.

**Calendar** is a special case: reads use a compiled Swift binary (`apple-mcp/calendar/src/calendar-helper`) that calls EventKit directly (~0.1s vs 50–140s via AppleScript). Writes still go through AppleScript.

**Messages** reads from the SQLite `chat.db` directly (requires Full Disk Access). Apple's timestamp format is nanoseconds since 2001-01-01 — there's a helper constant for this SQL conversion in `database.ts`.

## Key Conventions

### Safety flags thread through the entire stack

Global flags `--read-only` and `--confirm-destructive` are parsed in `src/index.ts` and passed as a `SafetyOpts` object to every app command factory. In `src/apps/*.ts`, write operations call `assertWritable(safety)` and destructive operations call `assertDestructive(safety)` before executing. In the standalone MCP servers, destructive tools are conditionally *not registered at all* when `--read-only` is set.

### Always sanitize before AppleScript

Any user input embedded in an AppleScript string must go through `sanitize()` from `applescript.ts`. This escapes backslashes, quotes, and newlines — skipping it is an injection vulnerability.

### Error handling pattern

All app action handlers follow this exact shape:

```typescript
try {
  output(await as.someOperation(opts));
} catch (e) {
  fatal((e as Error).message);
}
```

`output()` writes JSON to stdout; `fatal()` writes to stderr and exits with code 1.

### MCP tool registration pattern

Each MCP server (`apple-mcp/*/src/index.ts`) uses Zod schemas for input validation and returns `{ content: [{ type: "text", text: JSON.stringify(result, null, 2) }] }`. Destructive tools are only registered when `--read-only` is not set; when `--confirm-destructive` is active, a `confirm: z.boolean()` field is added to their schema.

### CLI command pattern

Each `src/apps/*.ts` exports a single function `(safety: SafetyOpts): Command`. Subcommands use Commander's `.requiredOption()` / `.option()`. CLI flag names use kebab-case for word separators (`--read-only`) but underscore-style for field names (`--chat_id`, `--from_date`).

### TypeScript config

Strict mode, `ES2022` target, `NodeNext` module resolution. The CLI runs via `tsx` without compilation; the MCP servers compile with `tsc` to `build/` before publishing.

### Swift binary

Built as a universal binary (arm64 + x86_64 via `lipo`) during `npm run prepare`. The binary is invoked with JSON arguments and returns JSON on stdout. If the build fails, the rest of the CLI still works — Calendar reads will fall back or error gracefully.

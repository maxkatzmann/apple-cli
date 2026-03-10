# apple-cli

`apple-cli` is a command-line interface for interacting with Apple apps on macOS. It wraps the [apple-mcp](https://github.com/maxkatzmann/apple-mcp) collection of AppleScript/EventKit integrations into a single CLI with the format:

```
apple-cli [app] [command] [--option value ...]
```

All output is **JSON** written to stdout. Errors are written to stderr with a non-zero exit code.

Supported apps: `notes`, `messages`, `contacts`, `mail`, `reminders`, `calendar`, `maps`

---

## Requirements

- **macOS 13+** — uses AppleScript and EventKit APIs
- **Node.js 18+** (Node 22+ for Messages)
- **The associated Apple app must be running** for AppleScript-based commands (Notes, Messages, Contacts, Mail, Maps). Reminders and Calendar use EventKit directly and do not require the app to be open.
- **Full Disk Access** granted to your terminal app — required for `messages` (reads `~/Library/Messages/chat.db`)
- **Reminders access** — macOS will prompt for permission on first use of reminders operations
- **Calendar access** — macOS will prompt for permission on first use of calendar read operations

---

## Installation

```bash
git clone --recurse-submodules <repo-url> apple-cli
cd apple-cli
npm install   # also compiles the Swift calendar-helper binary
```

After installation, run directly via:

```bash
npx tsx src/index.ts [app] [command] [options]
# or if linked globally:
apple-cli [app] [command] [options]
```

## Updating apple-mcp

Since `apple-mcp` is a git submodule, pull upstream updates with:

```bash
git submodule update --remote apple-mcp
npm install   # re-runs the Swift binary build if needed
git add apple-mcp
git commit -m "Update apple-mcp submodule"
```

## Usage

For usage information, we refert to the `SKILL.md` file.

# SKILL: apple-cli

## Overview

`apple-cli` is a command-line interface for interacting with Apple apps on macOS. Command format:

```
apple-cli [app] [command] [--option value ...]
```

All output is **JSON** written to stdout. Errors are written to stderr with a non-zero exit code.

Supported apps: `notes`, `messages`, `contacts`, `mail`, `reminders`, `calendar`, `maps`

---

## Safety Modes

These global flags can be passed before the app name:

| Flag | Effect |
|------|--------|
| `--read-only` | Blocks all write and destructive operations (exits with error) |
| `--confirm-destructive` | Requires `--confirm` flag on any destructive operation; without it, exits with error |

Examples:
```bash
apple-cli --read-only notes list_folders
apple-cli --confirm-destructive notes delete_note --title "Old Note" --confirm
```

---

## Notes (`apple-cli notes ...`)

Interacts with Apple Notes via AppleScript.

### Commands

| Command | Description | Required Options | Optional Options |
|---------|-------------|-----------------|-----------------|
| `list_folders` | List all folders | — | — |
| `create_folder` | Create a new folder | `--name` | — |
| `list_notes` | List notes in a folder | `--folder` | — |
| `get_note` | Get full content of a note | `--title` | `--folder` |
| `create_note` | Create a new note | `--title`, `--body` (HTML), `--folder` | — |
| `update_note` | Update a note's body | `--title`, `--body` (HTML) | `--folder` |
| `move_note` | Move a note between folders | `--title`, `--from_folder`, `--to_folder` | — |
| `append_to_note` | Append HTML to a note | `--title`, `--content` (HTML) | `--folder` |
| `search_notes` | Search notes by keyword | `--query` | `--folder` |
| `delete_note` ⚠️ | Delete a note | `--title` | `--folder`, `--confirm` |
| `delete_folder` ⚠️ | Delete folder + all its notes | `--name` | `--confirm` |

### Examples
```bash
apple-cli notes list_folders
apple-cli notes list_notes --folder "Work"
apple-cli notes get_note --title "Meeting Notes" --folder "Work"
apple-cli notes create_note --title "Shopping" --body "<p>Milk</p>" --folder "Personal"
apple-cli notes search_notes --query "recipe"
apple-cli notes delete_note --title "Draft" --confirm
```

---

## Messages (`apple-cli messages ...`)

Reads from the macOS Messages SQLite database and sends via AppleScript. Requires **Full Disk Access**.

### Commands

| Command | Description | Required Options | Optional Options |
|---------|-------------|-----------------|-----------------|
| `list_chats` | List recent chats with last message preview | — | `--limit` (default 50) |
| `get_chat_messages` | Get message history for a chat | `--chat_id` | `--limit` (default 100), `--from_date`, `--to_date` |
| `search_messages` | Search messages by text | `--query` | `--chat_id`, `--limit` (default 50) |
| `send_message` ✏️ | Send an iMessage or SMS | `--to`, `--text` | `--service` (iMessage\|SMS, default iMessage) |
| `get_chat_participants` | Get participants of a chat | `--chat_id` | — |

### Examples
```bash
apple-cli messages list_chats --limit 10
apple-cli messages get_chat_messages --chat_id "chat123" --limit 20
apple-cli messages search_messages --query "flight confirmation"
apple-cli messages send_message --to "+1234567890" --text "On my way!"
```

---

## Contacts (`apple-cli contacts ...`)

Interacts with Apple Contacts via AppleScript.

### Commands

| Command | Description | Required Options | Optional Options |
|---------|-------------|-----------------|-----------------|
| `list_groups` | List all contact groups | — | — |
| `list_contacts` | List all contacts | — | `--group` |
| `get_contact` | Get full details of a contact | `--name` | — |
| `search_contacts` | Search contacts by name | `--query` | — |
| `create_contact` ✏️ | Create a new contact | `--first_name`, `--last_name` | `--email`, `--phone`, `--organization`, `--job_title`, `--note` |
| `update_contact` ✏️ | Update an existing contact | `--name` | `--first_name`, `--last_name`, `--email`, `--phone`, `--organization`, `--job_title`, `--note` |
| `create_group` ✏️ | Create a contact group | `--name` | — |
| `add_contact_to_group` ✏️ | Add a contact to a group | `--contact`, `--group` | — |
| `remove_contact_from_group` ✏️ | Remove a contact from a group | `--contact`, `--group` | — |
| `delete_contact` ⚠️ | Delete a contact | `--name` | `--confirm` |
| `delete_group` ⚠️ | Delete a contact group | `--name` | `--confirm` |

### Examples
```bash
apple-cli contacts list_contacts
apple-cli contacts search_contacts --query "John"
apple-cli contacts get_contact --name "Jane Smith"
apple-cli contacts create_contact --first_name "Bob" --last_name "Jones" --email "bob@example.com" --organization "Acme"
apple-cli contacts update_contact --name "Bob Jones" --phone "+1234567890"
apple-cli contacts delete_contact --name "Bob Jones" --confirm
```

---

## Mail (`apple-cli mail ...`)

Interacts with Apple Mail via AppleScript.

### Commands

| Command | Description | Required Options | Optional Options |
|---------|-------------|-----------------|-----------------|
| `list_mailboxes` | List all mailboxes with unread counts | — | — |
| `list_messages` | List messages in a mailbox | `--mailbox`, `--account` | `--limit` (default 25) |
| `get_message` | Get full email content by ID | `--mailbox`, `--account`, `--id` | — |
| `search_messages` | Search emails | `--query` | `--mailbox`, `--account`, `--limit` (default 25), `--field` (subject\|sender) |
| `send_email` ✏️ | Send an email | `--to`, `--subject`, `--body` | `--cc`, `--bcc`, `--from` |
| `get_unread_count` | Get unread count | — | `--mailbox`, `--account` |
| `move_message` ✏️ | Move email to another mailbox | `--id`, `--from_mailbox`, `--from_account`, `--to_mailbox` | — |
| `mark_read` ✏️ | Mark email as read/unread | `--id`, `--mailbox`, `--account` | `--unread` (flag to mark unread) |
| `flag_message` ✏️ | Flag or unflag an email | `--id`, `--mailbox`, `--account` | `--unflag` |
| `delete_message` ⚠️ | Delete email (moves to Trash) | `--id`, `--mailbox`, `--account` | `--confirm` |

### Examples
```bash
apple-cli mail list_mailboxes
apple-cli mail get_unread_count
apple-cli mail list_messages --mailbox "INBOX" --account "iCloud" --limit 10
apple-cli mail search_messages --query "invoice" --field "subject"
apple-cli mail send_email --to "alice@example.com" --subject "Hello" --body "Hi Alice!"
apple-cli mail mark_read --id 42 --mailbox "INBOX" --account "iCloud"
```

---

## Reminders (`apple-cli reminders ...`)

Interacts with Apple Reminders via AppleScript.

### Commands

| Command | Description | Required Options | Optional Options |
|---------|-------------|-----------------|-----------------|
| `list_lists` | List all reminder lists | — | — |
| `create_list` ✏️ | Create a reminder list | `--name` | — |
| `list_reminders` | List reminders in a list | `--list` | `--include_completed` |
| `get_reminder` | Get full details of a reminder | `--name` | `--list` |
| `create_reminder` ✏️ | Create a new reminder | `--name`, `--list` | `--body`, `--due_date`, `--priority` (0/1/5/9) |
| `update_reminder` ✏️ | Update an existing reminder | `--name` | `--list`, `--new_name`, `--body`, `--due_date`, `--priority` |
| `complete_reminder` ✏️ | Mark reminder as completed | `--name` | `--list` |
| `uncomplete_reminder` ✏️ | Mark completed reminder as incomplete | `--name` | `--list` |
| `search_reminders` | Search reminders by name | `--query` | `--list` |
| `delete_reminder` ⚠️ | Delete a reminder | `--name` | `--list`, `--confirm` |
| `delete_list` ⚠️ | Delete a list and all reminders | `--name` | `--confirm` |

Priority values: `0` = none, `1` = high, `5` = medium, `9` = low

### Examples
```bash
apple-cli reminders list_lists
apple-cli reminders list_reminders --list "Shopping"
apple-cli reminders create_reminder --name "Buy milk" --list "Shopping" --due_date "15 March 2026 at 9:00 AM"
apple-cli reminders complete_reminder --name "Buy milk" --list "Shopping"
apple-cli reminders search_reminders --query "dentist"
```

---

## Calendar (`apple-cli calendar ...`)

Read operations use a compiled Swift EventKit binary for fast access (~0.1s). Write operations use AppleScript.

### Commands

| Command | Description | Required Options | Optional Options |
|---------|-------------|-----------------|-----------------|
| `list_calendars` | List all calendars | — | — |
| `list_all_events` | List events across ALL calendars | `--from_date`, `--to_date` | — |
| `list_events` | List events in one calendar | `--calendar`, `--from_date`, `--to_date` | — |
| `get_event` | Get full details of an event | `--summary` | `--calendar` |
| `search_events` | Search events by title | `--query` | `--calendar` |
| `create_event` ✏️ | Create a calendar event | `--calendar`, `--summary`, `--start_date`, `--end_date` | `--location`, `--description`, `--all_day` |
| `update_event` ✏️ | Update an existing event | `--summary` | `--calendar`, `--new_summary`, `--start_date`, `--end_date`, `--location`, `--description`, `--all_day` |
| `delete_event` ⚠️ | Delete a calendar event | `--summary` | `--calendar`, `--confirm` |

Date format: natural language strings like `"15 March 2026"` or `"15 March 2026 at 2:00 PM"`

### Examples
```bash
apple-cli calendar list_calendars
apple-cli calendar list_all_events --from_date "1 March 2026" --to_date "31 March 2026"
apple-cli calendar list_events --calendar "Work" --from_date "1 March 2026" --to_date "31 March 2026"
apple-cli calendar create_event --calendar "Work" --summary "Team Standup" --start_date "15 March 2026 at 9:00 AM" --end_date "15 March 2026 at 9:30 AM" --location "Conference Room A"
apple-cli calendar search_events --query "standup"
apple-cli calendar delete_event --summary "Old Meeting" --confirm
```

---

## Maps (`apple-cli maps ...`)

Opens Apple Maps with the requested query. **Results are visual only** — structured data (coordinates, addresses, distances) cannot be read back programmatically.

### Commands

| Command | Description | Required Options | Optional Options |
|---------|-------------|-----------------|-----------------|
| `search_location` | Search for a location | `--query` | — |
| `get_directions` | Get directions between two locations | `--from`, `--to` | `--transport` (driving\|walking\|transit, default driving) |
| `drop_pin` | Drop a pin at coordinates | `--latitude`, `--longitude` | `--label` |
| `open_address` | Open a specific address | `--address` | — |
| `save_to_favorites` | Open location to save as favorite | `--name`, `--address` | — |

### Examples
```bash
apple-cli maps search_location --query "coffee shops near Times Square"
apple-cli maps get_directions --from "Central Park, NYC" --to "Metropolitan Museum of Art" --transport walking
apple-cli maps drop_pin --latitude 48.8584 --longitude 2.2945 --label "Eiffel Tower"
apple-cli maps open_address --address "1 Apple Park Way, Cupertino, CA"
```

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✏️ | Write operation — blocked by `--read-only` |
| ⚠️ | Destructive operation — blocked by `--read-only`; requires `--confirm` when `--confirm-destructive` is active |

---

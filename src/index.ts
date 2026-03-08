#!/usr/bin/env node
import { Command } from "commander";
import { notesCommand } from "./apps/notes.ts";
import { messagesCommand } from "./apps/messages.ts";
import { contactsCommand } from "./apps/contacts.ts";
import { mailCommand } from "./apps/mail.ts";
import { remindersCommand } from "./apps/reminders.ts";
import { calendarCommand } from "./apps/calendar.ts";
import { mapsCommand } from "./apps/maps.ts";
import type { SafetyOpts } from "./utils/output.ts";

const program = new Command();

program
  .name("apple-cli")
  .description("CLI interface to Apple apps on macOS (Notes, Calendar, Contacts, Mail, Reminders, Messages, Maps)")
  .version("1.0.0")
  .option("--read-only", "Disable all write and destructive operations")
  .option("--confirm-destructive", "Require --confirm flag on destructive operations");

// Defer safety option reading until after parsing so global opts are available.
// We add all subcommands with a lazy factory to capture parsed global opts.
program.hook("preSubcommand", (_thisCommand, subCommand) => {
  const opts = program.opts();
  const safety: SafetyOpts = {
    readOnly: Boolean(opts.readOnly),
    confirmDestructive: Boolean(opts.confirmDestructive),
  };
  // Re-attach the chosen subcommand with safety options bound
  // (The subcommand is already the right one; we inject safety via closure replacement)
  // We use a per-app re-registration approach via addCommand instead.
  // Safety is injected at construction time below — this hook is a no-op placeholder.
  void safety;
  void subCommand;
});

// We parse opts eagerly to pass safety into subcommand factories.
// commander processes global options before subcommands, so we can read them here.
function getSafety(): SafetyOpts {
  const raw = process.argv;
  return {
    readOnly: raw.includes("--read-only"),
    confirmDestructive: raw.includes("--confirm-destructive"),
  };
}

const safety = getSafety();

program.addCommand(notesCommand(safety));
program.addCommand(messagesCommand(safety));
program.addCommand(contactsCommand(safety));
program.addCommand(mailCommand(safety));
program.addCommand(remindersCommand(safety));
program.addCommand(calendarCommand(safety));
program.addCommand(mapsCommand(safety));

program.parse(process.argv);

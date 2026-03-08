import { Command } from "commander";
import { output, fatal, assertWritable, assertDestructive, type SafetyOpts } from "../utils/output.ts";
import * as as from "../../apple-mcp/mail/src/applescript.ts";

export function mailCommand(safety: SafetyOpts): Command {
  const cmd = new Command("mail").description("Interact with Apple Mail");

  cmd
    .command("list_mailboxes")
    .description("List all mailboxes with unread counts")
    .action(async () => {
      try { output(await as.listMailboxes()); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("list_messages")
    .description("List recent messages in a mailbox")
    .requiredOption("--mailbox <name>", "Mailbox name")
    .requiredOption("--account <name>", "Account name")
    .option("--limit <n>", "Maximum messages to return", "25")
    .action(async (o) => {
      try {
        output(await as.listMessages(o.mailbox, o.account, parseInt(o.limit, 10)));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("get_message")
    .description("Get the full content of an email by ID")
    .requiredOption("--mailbox <name>", "Mailbox name")
    .requiredOption("--account <name>", "Account name")
    .requiredOption("--id <id>", "Message ID (integer)", parseInt)
    .action(async (o) => {
      try { output(await as.getMessage(o.mailbox, o.account, o.id)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("search_messages")
    .description("Search emails by subject or sender")
    .requiredOption("--query <query>", "Search query")
    .option("--mailbox <name>", "Mailbox to search in")
    .option("--account <name>", "Account to search in")
    .option("--limit <n>", "Maximum results", "25")
    .option("--field <field>", "Field to search: subject or sender", "subject")
    .action(async (o) => {
      try {
        const field = o.field === "sender" ? "sender" : "subject";
        output(await as.searchMessages(o.query, o.mailbox, o.account, parseInt(o.limit, 10), field));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("send_email")
    .description("Send an email [write]")
    .requiredOption("--to <addresses>", "Recipient(s) — comma-separated")
    .requiredOption("--subject <subject>", "Email subject")
    .requiredOption("--body <body>", "Email body")
    .option("--cc <addresses>", "CC recipient(s) — comma-separated")
    .option("--bcc <addresses>", "BCC recipient(s) — comma-separated")
    .option("--from <address>", "From address (account to send from)")
    .action(async (o) => {
      assertWritable(safety);
      try {
        output(await as.sendEmail(o.to, o.subject, o.body, { cc: o.cc, bcc: o.bcc, from: o.from }));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("get_unread_count")
    .description("Get unread email count")
    .option("--mailbox <name>", "Mailbox name (all mailboxes if omitted)")
    .option("--account <name>", "Account name")
    .action(async (o) => {
      try { output({ unread_count: await as.getUnreadCount(o.mailbox, o.account) }); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("move_message")
    .description("Move an email to a different mailbox [write]")
    .requiredOption("--id <id>", "Message ID (integer)", parseInt)
    .requiredOption("--from_mailbox <name>", "Source mailbox")
    .requiredOption("--from_account <name>", "Source account")
    .requiredOption("--to_mailbox <name>", "Destination mailbox")
    .action(async (o) => {
      assertWritable(safety);
      try {
        output(await as.moveMessage(o.id, o.from_mailbox, o.from_account, o.to_mailbox));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("mark_read")
    .description("Mark an email as read or unread [write]")
    .requiredOption("--id <id>", "Message ID (integer)", parseInt)
    .requiredOption("--mailbox <name>", "Mailbox name")
    .requiredOption("--account <name>", "Account name")
    .option("--unread", "Mark as unread instead of read")
    .action(async (o) => {
      assertWritable(safety);
      try {
        output(await as.markRead(o.id, o.mailbox, o.account, !o.unread));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("flag_message")
    .description("Flag or unflag an email [write]")
    .requiredOption("--id <id>", "Message ID (integer)", parseInt)
    .requiredOption("--mailbox <name>", "Mailbox name")
    .requiredOption("--account <name>", "Account name")
    .option("--unflag", "Unflag the message instead of flagging")
    .action(async (o) => {
      assertWritable(safety);
      try {
        output(await as.flagMessage(o.id, o.mailbox, o.account, !o.unflag));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("delete_message")
    .description("Delete an email — moves to Trash [destructive]")
    .requiredOption("--id <id>", "Message ID (integer)", parseInt)
    .requiredOption("--mailbox <name>", "Mailbox name")
    .requiredOption("--account <name>", "Account name")
    .option("--confirm", "Required when --confirm-destructive is active")
    .action(async (o) => {
      assertDestructive({ ...safety, confirm: o.confirm });
      try {
        output(await as.deleteMessage(o.id, o.mailbox, o.account));
      } catch (e) { fatal((e as Error).message); }
    });

  return cmd;
}

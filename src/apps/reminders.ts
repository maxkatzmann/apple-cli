import { Command } from "commander";
import { output, fatal, assertWritable, assertDestructive, type SafetyOpts } from "../utils/output.ts";
import * as eventkit from "../../apple-mcp/reminders/src/eventkit.ts";

export function remindersCommand(safety: SafetyOpts): Command {
  const cmd = new Command("reminders").description("Interact with Apple Reminders");

  cmd
    .command("list_lists")
    .description("List all reminder lists")
    .action(async () => {
      try { output(await eventkit.listLists()); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("create_list")
    .description("Create a new reminder list [write]")
    .requiredOption("--name <name>", "Name of the list")
    .action(async (o) => {
      assertWritable(safety);
      try { output(await eventkit.createList(o.name)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("list_reminders")
    .description("List reminders in a specific list")
    .requiredOption("--list <name>", "Reminder list name")
    .option("--include_completed", "Include completed reminders")
    .action(async (o) => {
      try {
        output(await eventkit.listReminders(o.list, o.includeCompleted));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("get_reminder")
    .description("Get full details of a reminder by name or id")
    .option("--name <name>", "Reminder name")
    .option("--id <id>", "Reminder ID (alternative to --name)")
    .option("--list <name>", "List to search in (searches all if omitted)")
    .action(async (o) => {
      if (!o.name && !o.id) fatal("get_reminder requires --name or --id");
      try { output(await eventkit.getReminder(o.name, o.list, o.id)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("create_reminder")
    .description("Create a new reminder [write]")
    .requiredOption("--name <name>", "Reminder name")
    .requiredOption("--list <name>", "List to add the reminder to")
    .option("--body <body>", "Notes / body text")
    .option("--due_date <date>", "Due date (e.g. '15 March 2026 at 9:00 AM')")
    .option("--priority <n>", "Priority: 0=none 1=high 5=medium 9=low", parseInt)
    .action(async (o) => {
      assertWritable(safety);
      try {
        output(await eventkit.createReminder(o.name, o.list, {
          body: o.body,
          dueDate: o.due_date,
          priority: o.priority,
        }));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("update_reminder")
    .description("Update an existing reminder [write]")
    .option("--name <name>", "Current reminder name")
    .option("--id <id>", "Reminder ID (alternative to --name)")
    .option("--list <name>", "List containing the reminder")
    .option("--new_name <name>", "New name for the reminder")
    .option("--body <body>", "New notes / body text")
    .option("--due_date <date>", "New due date")
    .option("--priority <n>", "New priority", parseInt)
    .action(async (o) => {
      if (!o.name && !o.id) fatal("update_reminder requires --name or --id");
      assertWritable(safety);
      try {
        output(await eventkit.updateReminder(o.name, o.list, {
          newName: o.new_name,
          body: o.body,
          dueDate: o.due_date,
          priority: o.priority,
        }, o.id));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("complete_reminder")
    .description("Mark a reminder as completed [write]")
    .option("--name <name>", "Reminder name")
    .option("--id <id>", "Reminder ID (alternative to --name)")
    .option("--list <name>", "List containing the reminder")
    .action(async (o) => {
      if (!o.name && !o.id) fatal("complete_reminder requires --name or --id");
      assertWritable(safety);
      try { output(await eventkit.completeReminder(o.name, o.list, o.id)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("uncomplete_reminder")
    .description("Mark a completed reminder as incomplete [write]")
    .option("--name <name>", "Reminder name")
    .option("--id <id>", "Reminder ID (alternative to --name)")
    .option("--list <name>", "List containing the reminder")
    .action(async (o) => {
      if (!o.name && !o.id) fatal("uncomplete_reminder requires --name or --id");
      assertWritable(safety);
      try { output(await eventkit.uncompleteReminder(o.name, o.list, o.id)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("search_reminders")
    .description("Search reminders by name across lists")
    .requiredOption("--query <query>", "Search query")
    .option("--list <name>", "List to search in (searches all if omitted)")
    .action(async (o) => {
      try { output(await eventkit.searchReminders(o.query, o.list)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("delete_reminder")
    .description("Delete a reminder [destructive]")
    .option("--name <name>", "Reminder name")
    .option("--id <id>", "Reminder ID (alternative to --name)")
    .option("--list <name>", "List containing the reminder")
    .option("--confirm", "Required when --confirm-destructive is active")
    .action(async (o) => {
      if (!o.name && !o.id) fatal("delete_reminder requires --name or --id");
      assertDestructive({ ...safety, confirm: o.confirm });
      try { output(await eventkit.deleteReminder(o.name, o.list, o.id)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("delete_list")
    .description("Delete a reminder list and all its reminders [destructive]")
    .requiredOption("--name <name>", "List name")
    .option("--confirm", "Required when --confirm-destructive is active")
    .action(async (o) => {
      assertDestructive({ ...safety, confirm: o.confirm });
      try { output(await eventkit.deleteList(o.name)); } catch (e) { fatal((e as Error).message); }
    });

  return cmd;
}

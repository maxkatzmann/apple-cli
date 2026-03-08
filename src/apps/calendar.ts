import { Command } from "commander";
import { output, fatal, assertWritable, assertDestructive, type SafetyOpts } from "../utils/output.ts";
import * as applescript from "../../apple-mcp/calendar/src/applescript.ts";
import * as eventkit from "../../apple-mcp/calendar/src/eventkit.ts";

export function calendarCommand(safety: SafetyOpts): Command {
  const cmd = new Command("calendar").description("Interact with Apple Calendar");

  cmd
    .command("list_calendars")
    .description("List all calendars")
    .action(async () => {
      try { output(await eventkit.listCalendars()); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("list_all_events")
    .description("List events across ALL calendars within a date range")
    .requiredOption("--from_date <date>", "Start date (e.g. '1 March 2026')")
    .requiredOption("--to_date <date>", "End date (e.g. '31 March 2026')")
    .action(async (o) => {
      try { output(await eventkit.listAllEvents(o.from_date, o.to_date)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("list_events")
    .description("List events in a specific calendar within a date range")
    .requiredOption("--calendar <name>", "Calendar name")
    .requiredOption("--from_date <date>", "Start date (e.g. '1 March 2026')")
    .requiredOption("--to_date <date>", "End date (e.g. '31 March 2026')")
    .action(async (o) => {
      try { output(await eventkit.listEvents(o.calendar, o.from_date, o.to_date)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("get_event")
    .description("Get full details of an event by title")
    .requiredOption("--summary <title>", "Event title/summary")
    .option("--calendar <name>", "Calendar to search (searches all if omitted)")
    .action(async (o) => {
      try { output(await eventkit.getEvent(o.summary, o.calendar)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("search_events")
    .description("Search events by title across calendars")
    .requiredOption("--query <query>", "Search query")
    .option("--calendar <name>", "Calendar to search (searches all if omitted)")
    .action(async (o) => {
      try { output(await eventkit.searchEvents(o.query, o.calendar)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("create_event")
    .description("Create a new calendar event [write]")
    .requiredOption("--calendar <name>", "Calendar name")
    .requiredOption("--summary <title>", "Event title")
    .requiredOption("--start_date <datetime>", "Start date/time (e.g. '15 March 2026 at 2:00 PM')")
    .requiredOption("--end_date <datetime>", "End date/time (e.g. '15 March 2026 at 3:00 PM')")
    .option("--location <location>", "Event location")
    .option("--description <description>", "Event description/notes")
    .option("--all_day", "Mark as an all-day event")
    .option("--alert_minutes <minutes>", "Minutes before event for alert(s), comma-separated (e.g. 30 or 30,120)")
    .action(async (o) => {
      assertWritable(safety);
      const alertMinutes = o.alert_minutes
        ? o.alert_minutes.split(",").map((m: string) => parseInt(m.trim(), 10)).filter(Number.isFinite)
        : undefined;
      try {
        output(await applescript.createEvent(o.calendar, o.summary, o.start_date, o.end_date, {
          location: o.location,
          description: o.description,
          allDay: o.all_day,
          alertMinutes,
        }));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("update_event")
    .description("Update an existing calendar event [write]")
    .requiredOption("--summary <title>", "Current event title")
    .option("--calendar <name>", "Calendar containing the event")
    .option("--new_summary <title>", "New event title")
    .option("--start_date <datetime>", "New start date/time")
    .option("--end_date <datetime>", "New end date/time")
    .option("--location <location>", "New location")
    .option("--description <description>", "New description")
    .option("--all_day", "Mark as all-day")
    .option("--alert_minutes <minutes>", "Replace alerts (comma-separated minutes before event, e.g. 30 or 30,120; use empty string '' to remove all)")
    .action(async (o) => {
      assertWritable(safety);
      // Only set alertMinutes if flag was explicitly passed
      let alertMinutes: number[] | undefined;
      if (o.alert_minutes !== undefined) {
        alertMinutes = o.alert_minutes === ""
          ? []
          : o.alert_minutes.split(",").map((m: string) => parseInt(m.trim(), 10)).filter(Number.isFinite);
      }
      try {
        output(await applescript.updateEvent(o.summary, o.calendar, {
          newSummary: o.new_summary,
          startDate: o.start_date,
          endDate: o.end_date,
          location: o.location,
          description: o.description,
          allDay: o.all_day,
          alertMinutes,
        }));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("delete_event")
    .description("Delete a calendar event [destructive]")
    .requiredOption("--summary <title>", "Event title")
    .option("--calendar <name>", "Calendar containing the event")
    .option("--confirm", "Required when --confirm-destructive is active")
    .action(async (o) => {
      assertDestructive({ ...safety, confirm: o.confirm });
      try { output(await applescript.deleteEvent(o.summary, o.calendar)); } catch (e) { fatal((e as Error).message); }
    });

  return cmd;
}

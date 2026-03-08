import { Command } from "commander";
import { output, fatal, assertWritable, assertDestructive, type SafetyOpts } from "../utils/output.ts";
import * as as from "../../apple-mcp/contacts/src/applescript.ts";

export function contactsCommand(safety: SafetyOpts): Command {
  const cmd = new Command("contacts").description("Interact with Apple Contacts");

  cmd
    .command("list_groups")
    .description("List all groups in Apple Contacts")
    .action(async () => {
      try { output(await as.listGroups()); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("list_contacts")
    .description("List all contacts, optionally filtered by group")
    .option("--group <group>", "Filter by group name")
    .action(async (o) => {
      try { output(await as.listContacts(o.group)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("get_contact")
    .description("Get full details of a contact")
    .requiredOption("--name <name>", "Contact name")
    .action(async (o) => {
      try { output(await as.getContact(o.name)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("search_contacts")
    .description("Search contacts by name")
    .requiredOption("--query <query>", "Search query")
    .action(async (o) => {
      try { output(await as.searchContacts(o.query)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("create_contact")
    .description("Create a new contact [write]")
    .requiredOption("--first_name <name>", "First name")
    .requiredOption("--last_name <name>", "Last name")
    .option("--email <email>", "Email address")
    .option("--phone <phone>", "Phone number")
    .option("--organization <org>", "Organization")
    .option("--job_title <title>", "Job title")
    .option("--note <note>", "Note")
    .action(async (o) => {
      assertWritable(safety);
      try {
        output(await as.createContact(o.first_name, o.last_name, {
          email: o.email,
          phone: o.phone,
          organization: o.organization,
          jobTitle: o.job_title,
          note: o.note,
        }));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("update_contact")
    .description("Update an existing contact [write]")
    .requiredOption("--name <name>", "Current full name of the contact")
    .option("--first_name <name>", "New first name")
    .option("--last_name <name>", "New last name")
    .option("--email <email>", "New email address")
    .option("--phone <phone>", "New phone number")
    .option("--organization <org>", "New organization")
    .option("--job_title <title>", "New job title")
    .option("--note <note>", "New note")
    .action(async (o) => {
      assertWritable(safety);
      try {
        output(await as.updateContact(o.name, {
          firstName: o.first_name,
          lastName: o.last_name,
          email: o.email,
          phone: o.phone,
          organization: o.organization,
          jobTitle: o.job_title,
          note: o.note,
        }));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("create_group")
    .description("Create a new contact group [write]")
    .requiredOption("--name <name>", "Group name")
    .action(async (o) => {
      assertWritable(safety);
      try { output(await as.createGroup(o.name)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("add_contact_to_group")
    .description("Add a contact to a group [write]")
    .requiredOption("--contact <name>", "Contact name")
    .requiredOption("--group <name>", "Group name")
    .action(async (o) => {
      assertWritable(safety);
      try { output(await as.addContactToGroup(o.contact, o.group)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("remove_contact_from_group")
    .description("Remove a contact from a group [write]")
    .requiredOption("--contact <name>", "Contact name")
    .requiredOption("--group <name>", "Group name")
    .action(async (o) => {
      assertWritable(safety);
      try { output(await as.removeContactFromGroup(o.contact, o.group)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("delete_contact")
    .description("Delete a contact [destructive]")
    .requiredOption("--name <name>", "Contact name")
    .option("--confirm", "Required when --confirm-destructive is active")
    .action(async (o) => {
      assertDestructive({ ...safety, confirm: o.confirm });
      try { output(await as.deleteContact(o.name)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("delete_group")
    .description("Delete a contact group [destructive]")
    .requiredOption("--name <name>", "Group name")
    .option("--confirm", "Required when --confirm-destructive is active")
    .action(async (o) => {
      assertDestructive({ ...safety, confirm: o.confirm });
      try { output(await as.deleteGroup(o.name)); } catch (e) { fatal((e as Error).message); }
    });

  return cmd;
}

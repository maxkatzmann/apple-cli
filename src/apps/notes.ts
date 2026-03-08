import { Command } from "commander";
import { output, fatal, assertWritable, assertDestructive, type SafetyOpts } from "../utils/output.ts";
import * as as from "../../apple-mcp/notes/src/applescript.ts";

export function notesCommand(safety: SafetyOpts): Command {
  const cmd = new Command("notes").description("Interact with Apple Notes");

  cmd
    .command("list_folders")
    .description("List all folders in Apple Notes")
    .action(async () => {
      try { output(await as.listFolders()); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("create_folder")
    .description("Create a new folder in Apple Notes")
    .requiredOption("--name <name>", "Name of the folder to create")
    .action(async (o) => {
      assertWritable(safety);
      try { output(await as.createFolder(o.name)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("list_notes")
    .description("List all notes in a folder")
    .requiredOption("--folder <folder>", "Folder to list notes from")
    .action(async (o) => {
      try { output(await as.listNotes(o.folder)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("get_note")
    .description("Get the full content of a note by title")
    .requiredOption("--title <title>", "Title of the note")
    .option("--folder <folder>", "Folder to search in (searches all if omitted)")
    .action(async (o) => {
      try { output(await as.getNote(o.title, o.folder)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("create_note")
    .description("Create a new note in a folder")
    .requiredOption("--title <title>", "Title of the new note")
    .requiredOption("--body <body>", "HTML body content")
    .requiredOption("--folder <folder>", "Folder to create the note in")
    .action(async (o) => {
      assertWritable(safety);
      try { output(await as.createNote(o.title, o.body, o.folder)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("update_note")
    .description("Update the body of an existing note")
    .requiredOption("--title <title>", "Title of the note to update")
    .requiredOption("--body <body>", "New HTML body content")
    .option("--folder <folder>", "Folder containing the note")
    .action(async (o) => {
      assertWritable(safety);
      try { output(await as.updateNote(o.title, o.body, o.folder)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("move_note")
    .description("Move a note from one folder to another")
    .requiredOption("--title <title>", "Title of the note to move")
    .requiredOption("--from_folder <folder>", "Source folder")
    .requiredOption("--to_folder <folder>", "Destination folder")
    .action(async (o) => {
      assertWritable(safety);
      try { output(await as.moveNote(o.title, o.fromFolder, o.toFolder)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("append_to_note")
    .description("Append HTML content to an existing note")
    .requiredOption("--title <title>", "Title of the note")
    .requiredOption("--content <content>", "HTML content to append")
    .option("--folder <folder>", "Folder containing the note")
    .action(async (o) => {
      assertWritable(safety);
      try { output(await as.appendToNote(o.title, o.content, o.folder)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("search_notes")
    .description("Search notes by keyword")
    .requiredOption("--query <query>", "Search query")
    .option("--folder <folder>", "Folder to search in (searches all if omitted)")
    .action(async (o) => {
      try { output(await as.searchNotes(o.query, o.folder)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("delete_note")
    .description("Delete a note [destructive]")
    .requiredOption("--title <title>", "Title of the note to delete")
    .option("--folder <folder>", "Folder containing the note")
    .option("--confirm", "Required when --confirm-destructive is active")
    .action(async (o) => {
      assertDestructive({ ...safety, confirm: o.confirm });
      try { output(await as.deleteNote(o.title, o.folder)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("delete_folder")
    .description("Delete a folder and all its notes [destructive]")
    .requiredOption("--name <name>", "Name of the folder to delete")
    .option("--confirm", "Required when --confirm-destructive is active")
    .action(async (o) => {
      assertDestructive({ ...safety, confirm: o.confirm });
      try { output(await as.deleteFolder(o.name)); } catch (e) { fatal((e as Error).message); }
    });

  return cmd;
}

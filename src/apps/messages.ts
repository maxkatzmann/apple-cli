import { Command } from "commander";
import { output, fatal, assertWritable, type SafetyOpts } from "../utils/output.ts";
import * as db from "../../apple-mcp/messages/src/database.ts";
import * as as from "../../apple-mcp/messages/src/applescript.ts";

export function messagesCommand(safety: SafetyOpts): Command {
  const cmd = new Command("messages").description("Interact with Apple Messages");

  cmd
    .command("list_chats")
    .description("List recent chats with last message preview")
    .option("--limit <n>", "Maximum number of chats to return", "50")
    .action(async (o) => {
      try { output(db.listChats(parseInt(o.limit, 10))); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("get_chat_messages")
    .description("Get message history for a specific chat")
    .requiredOption("--chat_id <id>", "Chat identifier")
    .option("--limit <n>", "Maximum number of messages to return", "100")
    .option("--from_date <date>", "Start date filter (ISO 8601)")
    .option("--to_date <date>", "End date filter (ISO 8601)")
    .action(async (o) => {
      try {
        output(db.getChatMessages(o.chat_id, parseInt(o.limit, 10), o.fromDate, o.toDate));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("search_messages")
    .description("Search messages by text content")
    .requiredOption("--query <query>", "Search query")
    .option("--chat_id <id>", "Limit search to a specific chat")
    .option("--limit <n>", "Maximum results", "50")
    .action(async (o) => {
      try {
        output(db.searchMessages(o.query, o.chatId, parseInt(o.limit, 10)));
      } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("send_message")
    .description("Send an iMessage or SMS [write]")
    .requiredOption("--to <address>", "Recipient phone number or email")
    .requiredOption("--text <text>", "Message text")
    .option("--service <service>", "iMessage or SMS", "iMessage")
    .action(async (o) => {
      assertWritable(safety);
      const service = o.service === "SMS" ? "SMS" : "iMessage";
      try { output(await as.sendMessage(o.to, o.text, service)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("get_chat_participants")
    .description("Get participants of a chat")
    .requiredOption("--chat_id <id>", "Chat identifier")
    .action(async (o) => {
      try { output(db.getChatParticipants(o.chat_id)); } catch (e) { fatal((e as Error).message); }
    });

  return cmd;
}

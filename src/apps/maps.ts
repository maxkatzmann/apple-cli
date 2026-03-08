import { Command } from "commander";
import { output, fatal, type SafetyOpts } from "../utils/output.ts";
import * as as from "../../apple-mcp/maps/src/applescript.ts";

// Maps is read/visual-only — all operations simply open Apple Maps
export function mapsCommand(_safety: SafetyOpts): Command {
  const cmd = new Command("maps").description("Interact with Apple Maps (opens Maps app — results are visual only)");

  cmd
    .command("search_location")
    .description("Search for a location in Apple Maps")
    .requiredOption("--query <query>", "Location search query")
    .action(async (o) => {
      try { output(await as.searchLocation(o.query)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("get_directions")
    .description("Get directions between two locations")
    .requiredOption("--from <location>", "Starting location")
    .requiredOption("--to <location>", "Destination location")
    .option("--transport <type>", "Transport type: driving, walking, or transit", "driving")
    .action(async (o) => {
      const transport = ["driving", "walking", "transit"].includes(o.transport)
        ? (o.transport as "driving" | "walking" | "transit")
        : "driving";
      try { output(await as.getDirections(o.from, o.to, transport)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("drop_pin")
    .description("Drop a pin at specific coordinates")
    .requiredOption("--latitude <lat>", "Latitude", parseFloat)
    .requiredOption("--longitude <lon>", "Longitude", parseFloat)
    .option("--label <label>", "Pin label")
    .action(async (o) => {
      try { output(await as.dropPin(o.latitude, o.longitude, o.label)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("open_address")
    .description("Open a specific address in Apple Maps")
    .requiredOption("--address <address>", "Address to open")
    .action(async (o) => {
      try { output(await as.openAddress(o.address)); } catch (e) { fatal((e as Error).message); }
    });

  cmd
    .command("save_to_favorites")
    .description("Open a location in Maps so you can save it as a favorite")
    .requiredOption("--name <name>", "Location name")
    .requiredOption("--address <address>", "Location address")
    .action(async (o) => {
      try { output(await as.saveToFavorites(o.name, o.address)); } catch (e) { fatal((e as Error).message); }
    });

  return cmd;
}

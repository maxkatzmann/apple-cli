export interface SafetyOpts {
  readOnly: boolean;
  confirmDestructive: boolean;
}

/** Write JSON result to stdout. */
export function output(data: unknown): void {
  console.log(JSON.stringify(data, null, 2));
}

/** Write an error message to stderr and exit with code 1. */
export function fatal(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}

/**
 * Guard for write/create operations.
 * Exits if --read-only is active.
 */
export function assertWritable(opts: SafetyOpts): void {
  if (opts.readOnly) {
    fatal("This operation is not allowed in read-only mode.");
  }
}

/**
 * Guard for destructive operations (delete, etc.).
 * Exits if --read-only is active, or if --confirm-destructive is active and --confirm was not passed.
 */
export function assertDestructive(opts: SafetyOpts & { confirm?: boolean }): void {
  if (opts.readOnly) {
    fatal("Destructive operations are not allowed in read-only mode.");
  }
  if (opts.confirmDestructive && !opts.confirm) {
    fatal(
      "This is a destructive operation. Pass --confirm to proceed, or remove --confirm-destructive to skip this check."
    );
  }
}

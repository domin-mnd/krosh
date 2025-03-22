import { parseArgs } from "util";
import type { Cmd, GoOptions, Meta, Option } from "./types";
import { color, defineCommand, flatten, max } from "./utils";
export { defineCommand } from "./utils";

function commandHelp(cmd: Cmd, name?: string, meta?: Meta) {
  const cmdKeys = Object.keys(cmd.options ?? {});
  const maxNameLen = max(cmdKeys);

  const metaName = meta?.name ?? "unknown";
  const prefix = (name ?? "").split(" ").slice(0, -1).join(" ");

  const padStart = (str?: string) => (str ? ` ${str}` : "");

  const usage = color.bold(
    `Usage: ${metaName}${padStart(name)} [...flags] [...args]\n`
  );
  const aliases = cmd.alias
    ? color.bold(
        `Alias: ${cmd.alias
          .map((alias) => `${metaName}${padStart(prefix)} ${alias}`)
          .join(", ")}\n`
      )
    : "";
  const description = `\n${cmd.description}\n`;
  const flags =
    cmdKeys.length === 0
      ? ""
      : `\nFlags:\n${cmdKeys
          .map((k) => {
            const { short, description } = cmd.options?.[k] as Option;
            const shortStr = color.bold(short ? `  ${"-" + short}` : "    ");
            const nameStr = color.bold(`--${k.padEnd(maxNameLen + 4)}`);

            return `${shortStr}, ${nameStr} ${description ?? ""}`;
          })
          .join("\n")}`;

  console.info(usage + aliases + description + flags + "\n");
}

function match(
  flat: Record<string, Cmd>,
  argv: string[]
): { cmd: Cmd; args: string[]; name?: string } | null {
  if (argv.length === 0 || argv[0].startsWith("-"))
    return flat?.index ? { cmd: flat.index, args: argv } : null;
  for (let i = argv.length; i > 0; i--) {
    const name = argv.slice(0, i).join(" ");
    if (flat[name]) return { cmd: flat[name], args: argv.slice(i), name };
  }
  return null;
}

export async function krosh(
  { commands, meta }: GoOptions,
  args: string[] = process.argv.slice(2)
) {
  const index = defineCommand({
    description: "Print the help menu.",
    options: {
      version: {
        short: "v",
        type: "boolean",
        description: "Print the version number.",
      },
    },
    run: ({ args }) => {
      if (args.version) return console.info(meta?.version ?? "0.0.0");

      const flattened = flatten(commands, false);
      const entries = Object.entries(flattened);
      const maxNameLen = max(Object.keys(flattened)),
        maxAliasLen = max(
          entries.flatMap(([_, { alias }]) => (alias ?? []).join(", "))
        );
      const commandsText =
        entries.length === 0
          ? ["  ..."]
          : entries.map(
              ([cmd, { description, alias }]) =>
                "  " +
                color.bold(cmd.padEnd(maxNameLen + 2)) +
                color.dim((alias ?? []).join(", ").padEnd(maxAliasLen + 4)) +
                description
            );

      const sections = [
        (meta?.description ? meta.description + " " : "") +
          color.dim(`(${meta?.version ?? "0.0.0"})`),
        color.bold(
          `Usage: ${meta?.name ?? "unknown"} <command> [...flags] [...args]`
        ),
        [color.bold("Commands:"), ...commandsText, ""].join("\n"),
      ];

      console.info(sections.join("\n\n"));
    },
  });

  const found = match(flatten({ index, ...commands }, true), args);
  if (!found) return console.error(`Command not found.`);

  try {
    const { values, positionals } = parseArgs({
      allowPositionals: true,
      allowNegative: true,
      args: found.args,
      options: {
        help: {
          type: "boolean",
          short: "h",
          description: "Print the help menu",
        },
        ...found.cmd.options,
      },
    });

    if (values.help && found.name)
      return commandHelp(found.cmd, found.name, meta);

    await found.cmd.run({ args: values, positionals });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
  }
}

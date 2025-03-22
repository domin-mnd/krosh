import { Cmd, type Commands, type Command } from "./types";

export function defineCommand(command: Command) {
  return new Cmd(
    command.description,
    command.run,
    command.options,
    command.alias
  );
}
export const isCmd = (cmd: Commands | Cmd): cmd is Cmd => cmd instanceof Cmd;

export const flatten = (
  cmds: Commands,
  withAlias: boolean,
  prefix = ""
): { [key: string]: Cmd } =>
  Object.entries(cmds).reduce((acc, [key, value]) => {
    // For an "index" command, use the parent prefix (or "index" at top-level).
    const fullName =
      key === "index" ? prefix || key : [prefix, key].filter(Boolean).join(" ");

    if (value instanceof Cmd) {
      acc[fullName] = value;

      // Process aliases (if any), ensuring each alias gets the parent's prefix.
      if (withAlias)
        (value.alias
          ? Array.isArray(value.alias)
            ? value.alias
            : [value.alias]
          : []
        ).forEach((alias) => {
          const aliasKey = [prefix, alias].filter(Boolean).join(" ");
          acc[aliasKey] = value;
        });
    } else {
      // Recursively flatten nested command groups.
      Object.assign(acc, flatten(value, withAlias, fullName));
    }
    return acc;
  }, {} as { [key: string]: Cmd });

export const max = (arr: string[]) =>
  arr.reduce((m, s) => Math.max(m, s.length), 0);

export const color = {
  bold: (str: string) => `\x1b[1m${str}\x1b[22m`,
  dim: (str: string) => `\x1b[2m${str}\x1b[22m`,
};

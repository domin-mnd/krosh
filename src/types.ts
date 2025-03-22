export interface Arguments {
  [longOption: string]: undefined | string | boolean | Array<string | boolean>;
}

export interface Context {
  args: Arguments;
  positionals: string[];
}

export interface Option {
  /** Type of argument. */
  type: "string" | "boolean";
  /**
   * Whether this option can be provided multiple times.
   * If `true`, all values will be collected in an array.
   * If `false`, values for the option are last-wins.
   * @default false.
   */
  multiple?: boolean | undefined;
  /** Description of the option available in help. */
  description?: string;
  /** A single character alias for the option. */
  short?: string | undefined;
  /**
   * The default option value when it is not set by args.
   * It must be of the same type as the the `type` property.
   * When `multiple` is `true`, it must be an array.
   */
  default?: string | boolean | string[] | boolean[] | undefined;
}

export interface Options {
  [longOption: string]: Option;
}

export interface Command {
  /** List of command aliases. */
  alias?: string[];
  /** Command description shown in --help. */
  description: string;
  /** Command callback. */
  run: (args: Context) => void | Promise<void>;
  /** Argument options. */
  options?: Options;
}

export class Cmd implements Command {
  constructor(
    public description: string,
    public run: (args: Context) => void | Promise<void>,
    public options: Options = {},
    public alias?: string[]
  ) {}
}

export interface Commands {
  // Command or subcommands
  [command: string]: Cmd | Commands;
}

export interface Meta {
  /**
   * CLI executable name.
   * @example "npm"
   */
  name?: string;
  /** CLI description. */
  description?: string;
  /**
   * Version returned using --version/-v flag.
   * @example "1.0.0"
   */
  version?: string;
}

export interface GoOptions {
  commands: Commands;
  meta?: Meta;
}

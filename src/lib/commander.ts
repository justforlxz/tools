import { Command } from 'commander';

export interface Option {
  short: string;
  long: string;
  required: boolean;
  description: string;
  default: string;
}

export type Options = Option[]

export function InitCommand<T>(options: Options): T {
  let cli = new Command();
  cli = cli.version('1.0.0');
  for (const option of options) {
    if (option.required) {
      cli = cli.requiredOption(`${option.short} ${option.long}`, option.description, option.default)
    }
    else {
      cli = cli.option(`${option.short} ${option.long}`, option.description, option.default)
    }
  }

  cli = cli.parse(process.argv)

  return cli.opts();
}

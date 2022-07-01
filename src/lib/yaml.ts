import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Root } from './types';

function yamlLoad<T extends Root>(file: string): T | null {
  let result: T | null = null;
  try {
    result = <T>yaml.load(fs.readFileSync(path.resolve(file)).toString());
  } catch (e) {
    console.error(e);
  }

  return result;
}

export { yamlLoad }

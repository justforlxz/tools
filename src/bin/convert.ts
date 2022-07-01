import * as fs from 'fs'
import * as path from 'path'

import { InitCommand } from '../lib/commander'
import { Root } from '../lib/types'

interface AppArgs {
  path: string;
}

const commander = InitCommand<AppArgs>([
  {
    short: "-p",
    long: "--path <path>",
    required: true,
    description: "set workdir",
    default: ''
  },
]);

interface Old {
  version: {
    email: string;
    author: string;
    description: string;
    tag: string;
    sha: string;
  }
}

function convert(repo: string, old: Old): Root {
  return {
    apiVersion: '1.0',
    repo,
    data: {
      tagger: {
        name: old.version.author,
        email: old.version.email,
      },
      message: old.version.description,
      object: old.version.sha,
      tag: old.version.tag
    }
  }
}

const files = fs.readdirSync(commander.path)
for (const file of files) {
  const filePath = path.join(commander.path, file)
  const basename = path.basename(file, '.json')
  const root = convert(basename, JSON.parse(fs.readFileSync(filePath).toString()))
  fs.writeFileSync(filePath, JSON.stringify(root, null, 4))
}

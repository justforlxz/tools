#!/usr/bin/env node

import { InitCommand } from '../lib/commander';
import * as path from 'path';
import * as fs from 'fs';
import { exit } from 'process';
import { Root } from '../lib/types';
import { yamlLoad } from '../lib/yaml';
import { Check } from '../lib/tag';
import { GetToken } from '../lib/token';
import { Octokit } from '@octokit/rest';
import { App, Context } from '../lib/context';

interface AppArgs {
  id: number;
  private_key: string;
  owner: string;
  config: string;
  token: string;
}

const commander = InitCommand<AppArgs>([
  {
    short: "-i",
    long: "--id <id>",
    required: true,
    description: "set app id",
    default: ''
  },
  {
    short: '-f',
    long: '--private_key <private key>',
    required: true,
    description: 'private key file path',
    default: ''
  },
  {
    short: '-o',
    long: '--owner <owner>',
    required: false,
    description: 'github owner name',
    default: 'linuxdeepin'
  },
  {
    short: '-c',
    long: '--config <config>',
    required: true,
    description: 'repo json',
    default: ''
  }
])

if (!commander.config) {
  console.error(`need set work directory`);
  exit(-1);
}

if (process.env.NODE_ENV === 'development') {
  console.log('hello world!');
}

(async () => {
  const owner = commander.owner ? commander.owner : "linuxdeepin";
  const file_basename = path.basename(commander.config);
  const repo_name = path.basename(file_basename, path.extname(file_basename));
  const config: Root = yamlLoad<Root>(commander.config)

  if (config.data.object.length === 0) {
    console.error(`sha is empty.`)
    exit(1)
  }
  if (config.data.tag.length === 0) {
    console.error(`tag is empty.`)
    exit(1)
  }
  if (config.data.tagger.email.length === 0) {
    console.error(`email is empty.`)
    exit(1)
  }
  if (config.data.tagger.name.length === 0) {
    console.error(`author is empty.`)
    exit(1)
  }
  if (config.data.message.length === 0) {
    console.error(`description is empty.`)
    exit(1)
  }

  const app: App = {
    APP_ID: commander.id,
    APP_PRIVATE_KEY: fs.readFileSync(path.resolve(commander.private_key)).toString()
  };

  const repo: Context = {
    owner: commander.owner,
    repo: path.basename(path.resolve(commander.config), '.json')
  };

  const octokit = new Octokit({ auth: await GetToken(app, repo) });
  if (commander.token) {
    const {
      data: { login },
    } = await octokit.rest.users.getAuthenticated();

    if (process.env.NODE_ENV === 'development') {
      console.log("Hello, %s", login);
    }
  }

  const { tag, object:sha } = config.data;
  exit(await Check(octokit, owner, repo_name, sha, tag))
}
)()

#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';
import { Root } from '../lib/types';
import { Tag } from '../lib/tag';
import { yamlLoad } from '../lib/yaml';
import { InitCommand } from '../lib/commander';
import { GetToken } from '../lib/token';
import { App, Context } from '../lib/context';
import { Octokit } from '@octokit/rest';

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

if (process.env.NODE_ENV === 'development') {
  console.log('hello world!');
}

(async () => {
  const owner = commander.owner ? commander.owner : "linuxdeepin";
  const file_basename = path.basename(commander.config);
  const repo_name = path.basename(file_basename, path.extname(file_basename));
  const config: Root = yamlLoad<Root>(commander.config);

  const app: App = {
    APP_ID: commander.id,
    APP_PRIVATE_KEY: fs.readFileSync(path.resolve(commander.private_key)).toString()
  };

  const repo: Context = {
    owner: commander.owner,
    repo: path.basename(path.resolve(commander.config), '.json')
  };
  const octokit = new Octokit({ auth: await GetToken(app, repo) });
  await Tag(octokit, config);
  console.log(`[${repo_name}]: tag <${config.data.tag}> created.`);
})()

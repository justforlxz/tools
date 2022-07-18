#!/usr/bin/env node

import { Octokit } from "@octokit/rest";
import { App, Context } from "../lib/context";
import { Upload } from "../lib/upload";
import { Root } from '../lib/types';
import { InitCommand } from "../lib/commander";
import { exit } from "process";
import * as path from 'path';
import * as fs from 'fs';
import { GetToken } from "../lib/token";
import { yamlLoad } from "../lib/yaml";

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

const config: Root = yamlLoad<Root>(commander.config);

const context: Context = {
  owner: commander.owner,
  repo: 'release'
}

const app: App = {
  APP_ID: commander.id,
  APP_PRIVATE_KEY: fs.readFileSync(path.resolve(commander.private_key)).toString()
};

const github = new Upload(new Octokit(GetToken(app, context)));
github.uploadFile(config, context)

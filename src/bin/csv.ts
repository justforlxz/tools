#!/usr/bin/env node

import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import * as readline from 'readline';

const csvPath = process.argv[process.argv.length - 1];

(async () => {
  const contentStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: contentStream,
    crlfDelay: Infinity,
  });

  let list: string[][] = [];

  for await (const line of rl) {
    const c = line.split(',');
    list.push(c);
  }

  const octokit = new Octokit({
    auth: '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',
  });

  for await (let item of list) {
    const url = item[5];
    if (!url || !url.includes('github.com')) {
      continue;
    }
    let tmp = url.replace('https://', '');
    if (tmp[tmp.length - 1] === '/') {
      // tmp[tmp.length - 1] = '';
    }
    const parse = tmp.split('/');
    const owner = parse[1];
    const repo = parse[2];
    const pull_number = Number(parse[4]);
    // github.com / linuxdeepin / rpeo /
    if (url.includes('pull')) {
      if (item[6] === '' && item[7] === '') {
        try {
          //   const pulls = await octokit.pulls.get({
          //     owner,
          //     repo,
          //     pull_number,
          //   });
          //   item[7] = String(pulls.data.additions);
          //   item[6] = String(pulls.data.deletions);
        } catch (err) {
          console.error(url);
          console.error(err);
        }
      }
    }
    if (url.includes('commit')) {
      if (item[6] === '' && item[7] === '') {

      } else {
        console.log(url, item[7], item[6])
      }
    }
  }

  contentStream.close();

  return;

  const writeStream = fs.createWriteStream(csvPath);

  for (const item of list) {
    writeStream.write(`${item.join(',')}\n`);
  }
})();

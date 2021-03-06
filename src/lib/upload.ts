import { Octokit } from '@octokit/rest';
import { Context } from '../lib/context';
import { Root } from '../lib/types';

const encode = (str: string): string => Buffer.from(str, 'binary').toString('base64');

export class Github {
  octokit: Octokit;
  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }
}

export class Upload extends Github {
  constructor(octokit: Octokit) {
    super(octokit)
  }
  async uploadFile(root: Root, context: Context) {
    const path = `tags/${root.repo}.json`;
    const branch = `request-${root.repo}-${root.data.tag}`;
    const masterRef = await this.octokit.git.getRef({
      ...context,
      ref: 'heads/master'
    })

    try {
      await this.octokit.git.deleteRef({
        ...context,
        ref: `heads/${branch}`
      });
    } catch (e) {
    }

    await this.octokit.git.createRef({
      ...context,
      ref: `refs/heads/${branch}`,
      sha: masterRef.data.object.sha
    });

    try {
      let contentRef: string = undefined;
      try {
        const content = (await this.octokit.repos.getContent({
          ...context,
          path,
        })).data as {
          sha: string;
        };
        contentRef = content.sha;
      }
      catch (err) {
      }

      await this.octokit.repos.createOrUpdateFileContents({
        ...context,
        path,
        message: 'update tag',
        content: encode(JSON.stringify(root, null, 4)), // base64
        branch,
        committer: {
          name: 'justforlxz',
          email: 'justforlxz@gmail.com',
        },
        author: {
          name: 'justforlxz',
          email: 'justforlxz@gmail.com',
        },
        sha: contentRef
      });

      // 提交 pull request
      await this.octokit.pulls.create({
        ...context,
        head: `${context.owner}:${branch}`,
        base: 'master',
        title: `[${root.repo}] request create tag ${root.data.tag}`
      });
    } catch (e) {
      console.error(e);
      await this.octokit.git.deleteRef({
        ...context,
        ref: `heads/${branch}`
      });
    }
  }
}

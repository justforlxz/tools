import { Octokit } from "@octokit/rest";
import { Root } from "./types";



export async function Check(octokit: Octokit, repo: Root): Promise<number> {
  // TODO: 应该从外部传入
  const owner = 'linuxdeepin'
  await octokit.git.getCommit({
    owner,
    repo: repo.repo,
    commit_sha: repo.data.object,
  })

  const tag = repo.data.tag;
  const sha = repo.data.object;
  let tag_sha = ''
  // 检查 tag 是否存在
  try {
    const check = await octokit.git.getRef({
      owner,
      repo: repo.repo,
      ref: `tags/${repo.data.tag}`
    });
    if (check.data.object.type === 'tag') {
      tag_sha = check.data.object.sha;
    }
    else if (check.data.object.type === 'commit') {
      if (check.data.object.sha !== sha) {
        console.error(`[${repo}] tag <${tag}> does not match hash <${sha}> <${tag_sha}>`)
        return 2;
      }
      else {
        console.log(`[${repo}] tag <${tag}> is commit tag <${check.data.object.sha}>, it's already exist.`)
        return 1;
      }
    }
    console.log(check.data)
  } catch (e) {
    console.error(`[${repo}] tag <${tag}> can be created on hash <${sha}>`)
    return 0;
  }

  try {
    const checkSha = await octokit.git.getTag({
      owner,
      repo: repo.repo,
      tag_sha
    })
    if (checkSha.data.object.sha === sha) {
      console.error(`[${repo}] tag <${tag}> exist.`);
      return 1;
    }
    else {
      console.error(`[${repo}] tag <${tag}> does not match hash <${sha}>`)
      return 2;
    }
  }
  catch (e) {
    console.warn(`[${repo}] ref exist, but tag <${tag}> not exist.`)
    return 1;
  }

  return 0;
}

export async function Tag(octokit: Octokit, repo: Root) {
  // TODO: 应该从外部传入
  const owner = 'linuxdeepin'
  const createTagResponse = await octokit.request(
    'POST /repos/{owner}/{repo}/git/tags',
    {
      owner,
      repo: repo.repo,
      message: repo.data.message,
      object: repo.data.object,
      tag: repo.data.tag,
      type: 'commit',
      tagger: {
        name: repo.data.tagger.name,
        email: repo.data.tagger.email,
        date: (() => {
          const date = new Date();
          return date.toISOString();
        })(),
      },
    },
  );

  if (createTagResponse.status !== 201) {
    throw new Error('response not 201');
  }

  const tag = repo.data.tag;

  const createRef = await octokit.request(
    'POST /repos/{owner}/{repo}/git/refs',
    {
      owner: owner,
      repo: repo.repo,
      ref: `refs/tags/${tag}`,
      sha: createTagResponse.data.sha,
    },
  );

  if (createRef.status !== 201) {
    throw new Error(`create ref failed! code: ${createRef.status}`);
  }
}

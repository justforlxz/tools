import { Octokit } from "@octokit/rest";

export async function Check(octokit: Octokit, owner: string, repo: string, commit_sha: string, tag: string): Promise<number> {
  await octokit.git.getCommit({
    owner,
    repo,
    commit_sha
  })

  let tag_sha = ''
  // 检查 tag 是否存在
  try {
    const check = await octokit.git.getRef({
      owner,
      repo,
      ref: `tags/${tag}`
    });
    if (check.data.object.type === 'tag') {
      tag_sha = check.data.object.sha;
    }
    else if (check.data.object.type === 'commit') {
      if (check.data.object.sha !== commit_sha) {
        console.error(`[${repo}] tag <${tag}> does not match hash <${commit_sha}> <${tag_sha}>`)
        return 2;
      }
      else {
        console.log(`[${repo}] tag <${tag}> is commit tag <${check.data.object.sha}>, it's already exist.`)
        return 1;
      }
    }
    console.log(check.data)
  } catch (e) {
    console.error(`[${repo}] tag <${tag}> can be created on hash <${commit_sha}>`)
    return 0;
  }

  try {
    const checkSha = await octokit.git.getTag({
      owner,
      repo,
      tag_sha
    })
    if (checkSha.data.object.sha === commit_sha) {
      console.error(`[${repo}] tag <${tag}> exist.`);
      return 1;
    }
    else {
      console.error(`[${repo}] tag <${tag}> does not match hash <${commit_sha}>`)
      return 2;
    }
  }
  catch (e) {
    console.warn(`[${repo}] ref exist, but tag <${tag}> not exist.`)
    return 1;
  }

  return 0;
}

export async function Tag(octokit: Octokit, owner: string, repo: string, commit_sha: string, tag: string, description: string, author: string, email: string) {
  const createTagResponse = await octokit.request(
    'POST /repos/{owner}/{repo}/git/tags',
    {
      owner,
      repo,
      tag,
      message: description,
      object: commit_sha,
      type: 'commit',
      tagger: {
        name: author,
        email,
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

  const createRef = await octokit.request(
    'POST /repos/{owner}/{repo}/git/refs',
    {
      owner: owner,
      repo,
      ref: `refs/tags/${tag}`,
      sha: createTagResponse.data.sha,
    },
  );

  if (createRef.status !== 201) {
    throw new Error(`create ref failed! code: ${createRef.status}`);
  }
}

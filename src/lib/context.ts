export interface App {
  APP_ID: number;
  APP_PRIVATE_KEY: string;
};

// Context 是用来保存 Octokit 访问时需要的 owner 和 repo 信息。
export class Context {
  owner: string;
  repo: string;
}

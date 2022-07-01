import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import { App, Context } from "./context";

export async function GetToken(app: App, repo: Context): Promise<string> {
  const { APP_ID: appId, APP_PRIVATE_KEY: privateKey } = app;
  const appOctokit = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId,
      privateKey,
    }
  });
  const app_installation = await appOctokit.rest.apps.getRepoInstallation({
    ...repo
  });
  interface Auth {
    type: string;
    tokenType: string;
    token: string;
    installationId: number;
  }
  const { token } = await appOctokit.auth({
    type: "installation",
    installationId: app_installation.data.id
  }) as Auth;

  return token;
}

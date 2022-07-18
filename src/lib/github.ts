import { Octokit } from "@octokit/rest";

interface IClosureGeneric{
  <T extends (...args: any) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> | void
}

export class Github {
  octokit: Octokit;
  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  exec: IClosureGeneric = (fn) => {
    return (...args) => {
      return fn(this.octokit, args);
    }
  }
}

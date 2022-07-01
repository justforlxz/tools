// typs.ts 是用来处理 tag 信息的结构体

export interface Root {
  repo: string;
  data: Data;
  apiVersion: string;
}

export interface Tagger {
  name: string;
  email: string;
  date?: Date;
}

export interface Data {
  object: string;
  tag: string;
  message: string;
  tagger: Tagger;
}

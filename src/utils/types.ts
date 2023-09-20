//types.ts
export interface AxiosResponse {
  data: any;
}

export interface RepoItem {
  type: string;
  name: string;
  path: string;
}

export interface Occurrence {
  type: string;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  file: string;
  function: string;
  codeBlock: string;
  declaration: string;
  context: string;
}

export interface FunctionUsage {
  file: string;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  callCode: string;
}

export interface RepoItem {
  type: string;
  name: string;
  path: string;
}

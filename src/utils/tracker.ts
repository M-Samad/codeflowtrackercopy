//tracker.ts
import { fetchRepoFiles, isValidFile } from './utils';
import { analyzeFile } from './codeAnalysis';
import { Occurrence, RepoItem } from './types';

export async function findOccurrences(searchString: string, path = ""): Promise<Occurrence[]> {
  const repoContent = await fetchRepoFiles(path);
  if (typeof repoContent === 'string') {
    console.error("Expected a list of RepoItems but received a string.");
    return [];
  }
  const allPromises = repoContent.map(item => processItem(item, searchString));
  return (await Promise.all(allPromises)).flat();
}


async function processItem(item: RepoItem, searchString: string): Promise<Occurrence[]> {
  if (item.type === "file" && isValidFile(item.name)) {
    return analyzeFile(item.path, searchString);
  } else if (item.type === "dir") {
    return findOccurrences(searchString, item.path);
  }
  return [];
}

//tracker.ts
import { fetchRepoFiles, isValidFile } from './utils';
import { analyzeFile, analyzeFunctionUsage } from './codeAnalysis';
import { Graph } from 'graphlib';
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

export async function processOccurrences(occurrences: Occurrence[]): Promise<Graph> {
  const g = new Graph();
  for (let occurrence of occurrences) {
    g.setNode(occurrence.file);
    if (occurrence.function !== "Global/Outside Function") {
      let functionUsages = await analyzeFunctionUsage(occurrence.function);
      functionUsages.forEach(usage => {
        g.setEdge(occurrence.file, usage.file, usage.callCode);
      });
    }
  }
  return g;
}


async function processItem(item: RepoItem, searchString: string): Promise<Occurrence[]> {
  if (item.type === "file" && isValidFile(item.name)) {
    return analyzeFile(item.path, searchString);
  } else if (item.type === "dir") {
    return findOccurrences(searchString, item.path);
  }
  return [];
}

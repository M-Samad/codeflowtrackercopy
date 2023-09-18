import { Graph } from 'graphlib';
import { Occurrence } from './types';
import { analyzeFunctionUsage } from './codeAnalysis';

export function displayResults(occurrences: Occurrence[]): void {
    console.log("Occurrences of the identifier:\n");

    occurrences.forEach(occurrence => {
        console.log(`- File: ${occurrence.file}`);
        console.log(`  Function: ${occurrence.function}`);
        console.log(`  Location: Line ${occurrence.location.start.line}, Column ${occurrence.location.start.column}`);
        console.log(`  Code Block:\n${occurrence.codeBlock}\n`);
    });
}

export async function displayGraphWithCode(graph: Graph, occurrences: Occurrence[]): Promise<Graph> {
    // Sort occurrences based on their file and then their location in the codebase
    occurrences.sort((a, b) => {
      if (a.file === b.file) {
          return a.location.start.line - b.location.start.line || a.location.start.column - b.location.start.column;
      } 
      return a.file.localeCompare(b.file);
  });

  // Adding nodes to the graph
  occurrences.forEach((occurrence, index) => {
      graph.setNode(index.toString(), occurrence);
  });

  // Connecting nodes based on the order of occurrences
  for (let i = 0; i < occurrences.length - 1; i++) {
      const edgeLabel = `${occurrences[i].context} -> ${occurrences[i+1].context}`;
      graph.setEdge(i.toString(), (i + 1).toString(), { label: edgeLabel });
  }

  return graph;
}

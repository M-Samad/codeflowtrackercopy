//display.ts
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
  // Add nodes for each occurrence
  
  occurrences.forEach((occurrence, index) => {
    graph.setNode(index.toString(), occurrence);
});

// Add edges based on the context of occurrences
for (let i = 0; i < occurrences.length - 1; i++) {
  const currentOccurrence = occurrences[i];
  const nextOccurrence = occurrences[i + 1];

  // If the current occurrence is a function call, and the next occurrence is the function parameter
  if (currentOccurrence.context === "Function Call" && nextOccurrence.context === "Function Parameter") {
      graph.setEdge(i.toString(), (i + 1).toString(), {}, `${i}-${i+1}`);
  }

  // If the current occurrence is a return statement, and the next occurrence uses the returned value
  if (currentOccurrence.context === "Return Statement" && nextOccurrence.context === "Function Call") {
      graph.setEdge(i.toString(), (i + 1).toString(), {}, `${i}-${i+1}`);
  }

  // If the current occurrence is an equality or comparison check, and the next occurrence is a return statement
  if (currentOccurrence.context === "Equality or Comparison Check" && nextOccurrence.context === "Return Statement") {
      graph.setEdge(i.toString(), (i + 1).toString(), {}, `${i}-${i+1}`);
  }

  // If the current occurrence is a function parameter, and the next occurrence is used within a function call
  if (currentOccurrence.context === "Function Parameter" && nextOccurrence.context === "Function Call") {
      graph.setEdge(i.toString(), (i + 1).toString(), {}, `${i}-${i+1}`);
  }

  // If the current occurrence is a function call, and the next occurrence is a return statement within that function
  if (currentOccurrence.context === "Function Call" && nextOccurrence.context === "Return Statement" && currentOccurrence.function === nextOccurrence.function) {
      graph.setEdge(i.toString(), (i + 1).toString(), {}, `${i}-${i+1}`);
  }

  // If the current occurrence is a function parameter, and the next occurrence is used in an equality or comparison check
  if (currentOccurrence.context === "Function Parameter" && nextOccurrence.context === "Equality or Comparison Check") {
      graph.setEdge(i.toString(), (i + 1).toString(), {}, `${i}-${i+1}`);
  }
}

return graph;
}




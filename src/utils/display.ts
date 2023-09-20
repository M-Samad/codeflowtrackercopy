//display.ts
import { Graph } from 'graphlib';
import { Occurrence } from './types';

export async function displayGraphWithCode(graph: Graph, occurrences: Occurrence[]): Promise<Graph> {
    // Sort occurrences
    occurrences.sort((a, b) => {
        if (a.file === b.file) {
            return a.location.start.line - b.location.start.line || a.location.start.column - b.location.start.column;
        } 
        return a.file.localeCompare(b.file);
    });

    let nodeMap = new Map();

    // Adding unique nodes to the graph
    occurrences.forEach((occurrence, index) => {
        const key = `${occurrence.file}-${occurrence.function}-${occurrence.codeBlock}-${occurrence.context}`;
        if (!nodeMap.has(key)) {
            nodeMap.set(key, index);
            graph.setNode(index.toString(), occurrence);
        }
    });

    // Helper function to set edges
    const setGraphEdge = (source: Occurrence, target: Occurrence) => {
        const edgeLabel = `${source.context} -> ${target.context}`;
        graph.setEdge(
            nodeMap.get(`${source.file}-${source.function}-${source.codeBlock}-${source.context}`).toString(), 
            nodeMap.get(`${target.file}-${target.function}-${target.codeBlock}-${target.context}`).toString(), 
            { label: edgeLabel }
        );
    }

    // Connecting nodes based on the flow of code
    for (let source of occurrences) {
        for (let target of occurrences) {
            // Skip if file and identifierName don't match
           
            // if (source.file !== target.file) continue;

            // Ensure that the source and target are within the same function, with an exception for Function Call context and Variable Declaration context
            // console.log(source.function,source.context , source.function,target.context);
            if (source.function !== target.function && source.context !== ("Function Call")) continue;
            // console.log(source.function,source.context , source.function,target.context);
            type ValidContext = "Function Parameter" | "Function Call" | "JSX Attribute" | "Import Statement" | "Variable Declaration";

            const validConnections: Record<ValidContext, string[]> = {
                "Function Parameter": ["Equality or Comparison Check", "Function Call", "Return Statement"],
                "Function Call": ["Function Parameter"],
                "JSX Attribute": ["Hook Declaration"],
                "Import Statement": ["JSX Element"],
                "Variable Declaration": ["Equality or Comparison Check", "Function Call", "Return Statement"]
            };
            function getValidConnections(context: string): string[] | undefined {
              return validConnections[context as ValidContext];
          }
          

            if (getValidConnections(source.context)?.includes(target.context)) {
                
                if (source.context === "Function Call" && target.context === "Function Parameter" && target.declaration.includes(source.codeBlock)) {
                    setGraphEdge(target, source);
                    continue;
                    
                }
                else if (source.context === "Function Call" && target.context === "Function Parameter" && source.codeBlock.includes(target.function)) {
                    
                    
                    setGraphEdge(source, target);
                    
                }
                else if ((source.context === "Function Call" && target.context === "Function Parameter")){
                    continue;
                }
                

                setGraphEdge(source, target);
            }

            
        }
    }

    return graph;
}





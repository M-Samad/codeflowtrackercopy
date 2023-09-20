import ReactFlow, { MiniMap, Controls } from 'reactflow';
import 'reactflow/dist/base.css';
import CustomNode from './CustomNode';
import { useEffect, useState } from "react";
import { displayGraphWithCode } from "./utils/display";
import { findOccurrences } from "./utils/tracker";
import { Graph } from 'graphlib';

const nodeTypes = {
  custom: CustomNode,
};

function App() {
  const [count, setCount] = useState(0);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const searchString = "searchString"; 

  async function runAnalysis() {
    const occurrences = await findOccurrences(searchString);
    const graph = new Graph();
    const graphObj = await displayGraphWithCode(graph, occurrences);

    let currentYPosition = 0;
    const verticalSpacing = 100; // Minimum spacing between nodes

    const nodesData = Object.keys(graphObj._nodes).map((key, index) => {
      const node = graphObj._nodes[key];
      const estimatedHeight = node.codeBlock.split('\n').length * 20 + 100; // Estimate height based on lines of code
      const position = { x: 250, y: currentYPosition };
      currentYPosition += estimatedHeight + verticalSpacing;
      return {
        id: key,
        type: 'custom',
        data: {
          label: `${node.file} + ${node.context}`,
          nodeNumber: index + 1,
          codeBlock: node.codeBlock,
          ...node
        },
        position
      };
    });

    const edgesData = Object.keys(graphObj._edgeObjs).map(key => {
      const edge = graphObj._edgeObjs[key];
      return {
        id: `${edge.v}-${edge.w}`,
        source: edge.v,
        target: edge.w,
        label: graphObj._edgeLabels[key].label
      };
    });

    // Adjust x-position for nodes with the same source
    const sourceMap = new Map();
    edgesData.forEach(edge => {
      if (sourceMap.has(edge.source)) {
        sourceMap.get(edge.source).push(edge.target);
      } else {
        sourceMap.set(edge.source, [edge.target]);
      }
    });

    sourceMap.forEach((targets) => {
      if (targets.length > 1) {
        targets.forEach((target, index) => {
          const node = nodesData.find(n => n.id === target);
          if (node) {
            node.position.x += index * 200; // Adjust x-position for each target node
          }
        });
      }
    });

    setNodes(nodesData);
    setEdges(edgesData);
}

  useEffect(() => {
    runAnalysis();
  }, [count]);

  return (
    <div className="h-screen">
      <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView 
      className="bg-teal-50 h-full">
        <MiniMap />
        <Controls />
      </ReactFlow>
      <button onClick={() => setCount(count + 1)} className="absolute bottom-4 right-4">Click me! {`Counter ${count}`}</button>
    </div>
  );
}

export default App;

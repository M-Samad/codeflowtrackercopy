//App.tsx
import { useEffect, useState } from "react";
import { displayGraphWithCode, displayResults } from "./utils/display";
import { findOccurrences } from "./utils/tracker";
import { Graph } from 'graphlib';
function App() {

  const [count, setCount] = useState(0)
  const searchString = "searchString"; 
  async function runAnalysis() {
    const occurrences = await findOccurrences(searchString);
    // displayResults(occurrences);
    console.log("++++occurrences++++",occurrences)
    const graph = new Graph();
    const graphObj = await displayGraphWithCode(graph, occurrences);
    console.log("++++grap++++",graphObj)
    }
  useEffect(() => {
    runAnalysis();
  }
  , [ count]);
  return (
    <>
    <h1 className="text-3xl font-bold">
      Hello world!
    </h1>
    <button onClick={() => setCount(count + 1)} className="">Click me! {`Counter ${count}`}</button>
    </>
  )
}

export default App
//App.tsx
import { useEffect, useState } from "react";
import { displayGraphWithCode } from "./utils/display";
import { findOccurrences } from "./utils/tracker";
import { Graph } from 'graphlib';
import HomeForm from "./component/Home";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import UserContextProvider from "./contexts/userContext";
import NodeGraph from "./component/NodeGraphData";


function App() {

  const [count, setCount] = useState(0)
  const searchString = "searchString";
  async function runAnalysis() {
    const occurrences = await findOccurrences(searchString);

    console.log("++++occurrences++++", occurrences)
    const graph = new Graph();
    const graphObj = await displayGraphWithCode(graph, occurrences);
    console.log("++++grap++++", graphObj)
  }
  useEffect(() => {
    runAnalysis();
  }
    , [count]);
  return (
    <>
      <Router>
      <UserContextProvider>
        <Routes>
          <Route exact path="" element={<HomeForm />} />
          <Route exact path="/results" element={<NodeGraph />} />
        </Routes>
      </UserContextProvider>
      </Router>
    </>
  )
}

export default App
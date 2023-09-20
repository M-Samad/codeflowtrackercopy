import { Button, Checkbox, FormControlLabel } from '@mui/material';
import '../styles/home.css'; // Import CSS for styling
import { useContext, useEffect, useState } from 'react';
import { updateBaseURL } from '../constants/Generals';
import { findOccurrences } from '../utils/tracker';
import { Graph } from 'graphlib';
import { displayGraphWithCode } from '../utils/display';
import { UserContext } from '../contexts/userContext';
import ProgressLoader from './Loader';
import { useNavigate } from 'react-router-dom';

const HomeForm = () => {
    const { astDataState } = useContext(UserContext);
    const [astData, setAstData] = astDataState;
    const navigation = useNavigate();
    const [userName, setUserName] = useState("");
    const [repoName, setRepoName] = useState("");
    const [searchString, setSearchString] = useState("");
    const [publicChecked, setPublicChecked] = useState(false);
    const [isLoading, setLoading] = useState(false);

    const handleClick = async () => {
        setLoading(true);
        const path = `${userName}/${repoName}`;
        console.log(path);
        updateBaseURL(path);
        await runAnalysis();
        setLoading(false);

    }

    const runAnalysis = async () => {
        const occurrences = await findOccurrences(searchString);
        console.log("++++occurrences++++", occurrences)
        const graph = new Graph();
        const graphObj = await displayGraphWithCode(graph, occurrences);
        console.log("++++grap++++", graphObj);
        setAstData(graphObj);
        navigation('/results');
    }

    useEffect(() => {
        console.log("astData", astData);

    }, [astData])

    return (
        <>
            <div className="screen-1">
                {isLoading && <ProgressLoader />}
                <svg
                    className="logo"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    version="1.1"
                    width="300"
                    height="300"
                    viewBox="0 0 640 480"
                    xmlSpace="preserve"
                >
                    {/* SVG content here */}
                </svg>
                <div className="email">
                    <label htmlFor="email">Git-Hub User Name</label>
                    <div className="sec-2">
                        <input type="email" name="email" value={userName} onChange={e => setUserName(e.target.value)} />
                    </div>
                </div>
                <div className="password">
                    <label htmlFor="password">Git-Hub Repo Name</label>
                    <div className="sec-2">
                        <input className="pas" name="password" value={repoName} onChange={e => setRepoName(e.target.value)} />
                    </div>
                </div>

                <div className="password">
                    <label htmlFor="password">Search String</label>
                    <div className="sec-2">
                        <input className="pas" name="password" value={searchString} onChange={e => setSearchString(e.target.value)} />
                    </div>
                </div>
                <FormControlLabel control={<Checkbox checked={publicChecked} onChange={e => setPublicChecked(e.target.checked)} />} label="Is this Repo is public ?" />

                <Button sx={{
                    borderRadius: "30px",
                    padding: "1em",
                    background: "#3e4684"
                }} variant="contained" disabled={!userName || !repoName || !searchString || !publicChecked} color="success"
                    onClick={handleClick}>
                    Search
                </Button>
            </div>


        </>
    );
};

export default HomeForm;

import axios from 'axios';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;


export const axiosInstance = axios.create({
  baseURL: "https://api.github.com/repos/rutvij-fsd/CodeFlowTracker/contents/",
  timeout: 10000,
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3.raw'
  }
});

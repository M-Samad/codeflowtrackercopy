export let BASE_URL: string = "";

// Function to update the environment variable
export function updateBaseURL(val: string) {
    if (typeof val !== 'string') return;
    BASE_URL = `https://api.github.com/repos/${val}/contents/`;
  }
  
  // Function to update the re-initialize environment variable
  
  export function getBaseURLToDev() {
    return BASE_URL;
  }
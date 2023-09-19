//utils.ts
import { axiosInstance } from './axiosConfig';
import { RepoItem } from './types';

const FILE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

export function isValidFile(name: string): boolean {
  return FILE_EXTENSIONS.some(ext => name.endsWith(ext));
}

export async function fetchRepoFiles(path = ""): Promise<RepoItem[] | string> {
    try {
        const response = await axiosInstance.get(path);
        if (typeof response.data === 'string') {
            return response.data;
        }
        return response.data;
    } catch (error : any) {
        console.error(`Error fetching repo files: ${error.message}`);
        return [];
    }
  
}

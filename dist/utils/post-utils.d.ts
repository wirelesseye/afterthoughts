export interface PostInfo {
    filename: string;
    metadata: Record<string, string>;
    synopsis: string;
}
export declare function fetchPosts(page: number | string): Promise<PostInfo[]>;
export declare function usePosts(page: number): PostInfo[];
export declare function getPageNums(): Promise<string[]>;
export declare function useNumPages(): number | undefined;
export declare function getPostFilenames(): Promise<string[]>;
export declare function usePost(filename: string): string | undefined;

export interface PostInfo {
    filename: string;
    metadata: Record<string, string>;
    synopsis: string;
}
export declare function usePosts(page: number): PostInfo[];
export declare function getPostPageNums(): Promise<string[]>;

export interface PostInfo {
    filename: string;
    metadata: Record<string, string>;
    synopsis: string;
}
export declare function usePostList(page: number): PostInfo[] | undefined;
export declare function getPostPageNumList(): Promise<string[]>;

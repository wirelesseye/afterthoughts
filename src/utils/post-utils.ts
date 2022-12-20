import { range } from "./page-utils";
import { useStaticData } from "./static-data-utils";

export interface PostInfo {
    filename: string;
    metadata: Record<string, string>;
    synopsis: string;
}

export function usePostList(page: number) {
    const postList = useStaticData<PostInfo[]>(
        `__aft_posts_${page}`,
        `/generate/data/posts/${page}.json`,
        (res) => res.json()
    );
    return postList;
}

export async function getPostPageNumList() {
    const numPages: number = await fetch("/generate/data/posts.json").then(res => res.json()).then(json => json.numPages);
    return range(numPages).map(i => i.toString());
}

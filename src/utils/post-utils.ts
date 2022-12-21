import { range } from "./page-utils";
import { useStaticData } from "./static-data-utils";

export interface PostInfo {
    filename: string;
    metadata: Record<string, string>;
    synopsis: string;
}

export function fetchPosts(page: number | string) {
    return fetch(`/generate/data/posts/${page}.json`).then(
        (res): Promise<PostInfo[]> => res.json()
    );
}

export function usePosts(page: number) {
    const postList = useStaticData<PostInfo[]>(
        `__aft_posts_${page}`,
        `/generate/data/posts/${page}.json`,
        (res) => res.json()
    );
    return postList || [];
}

export async function getPageNums() {
    const numPages: number = await fetch("/generate/data/posts.json")
        .then((res) => res.json())
        .then((json) => json.numPages);
    return range(numPages).map((i) => (i + 1).toString());
}

export function useNumPages() {
    const numPages = useStaticData<number>(
        "__aft_num_post_pages",
        "/generate/data/posts.json",
        (res) => res.json().then((json) => json.numPages)
    );
    return numPages;
}

export async function getPostFilenames() {
    const result: string[] = [];
    const pageNums = await getPageNums();

    for (const pageNum of pageNums) {
        const posts = await fetchPosts(pageNum);
        posts.forEach((post) => result.push(post.filename));
    }

    return result;
}

export function usePost(filename: string) {
    const post = useStaticData(
        `__aft_post_${filename}`,
        `/generate/posts/${filename}.md`,
        (res) => res.text()
    );
    return post;
}

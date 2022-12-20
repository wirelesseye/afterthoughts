/// <reference types="react" />
export type PageType = {
    default: React.ComponentType<any>;
    [key: string]: any;
};
declare let pages: Record<string, () => Promise<PageType>>;
export declare function getPathParams(filepath: string): string[];
export declare function getPage(pathname: string): [() => Promise<PageType>, Record<string, string>];
export declare function pathnameEquals(otherPathname: string, currPathname?: string): boolean;
export { pages };

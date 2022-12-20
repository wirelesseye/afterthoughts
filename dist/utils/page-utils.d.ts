type PageParamValues = any[] | {
    values: any[];
    children: PageParams | ((parent: string) => PageParams);
};
export type PageParams = Record<string, PageParamValues>;
export interface PageProps<T = any> {
    params: T;
}
declare function range(size: number): number[];
declare function range(start: number, end: number): number[];
export { range };

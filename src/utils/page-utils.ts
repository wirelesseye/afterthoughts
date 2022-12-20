type PageParamValues =
    | any[]
    | {
          values: any[];
          children: PageParams | ((parent: string) => PageParams);
      };

export type PageParams = Record<string, PageParamValues>;

export interface PageProps<T = any> {
    params: T;
}

function range(size: number): number[];

function range(start: number, end: number): number[];

function range(...params: number[]): number[] {
    if (params.length === 1) {
        return [...Array(params[0]).keys()];
    } else if (params.length === 2) {
        const [start, end] = params;
        const size = end - start;
        return Array.from(new Array(size), (_x, i) => i + start);
    } else {
        throw Error("invalid parameters");
    }
}

export { range };

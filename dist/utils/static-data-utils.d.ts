export declare const getPreloadDataMap: () => Record<string, PreloadData<any>>;
export declare const resetPreloadDataMap: () => void;
export interface PreloadData<T = any> {
    input: RequestInfo | URL;
    init?: RequestInit;
    callback: (response: Response) => Promise<T>;
}
declare function useStaticData<T>(identifier: string, input: RequestInfo | URL, callback: (response: Response) => Promise<T>): T | undefined;
declare function useStaticData<T>(identifier: string, input: RequestInfo | URL, init: RequestInit, callback: (response: Response) => Promise<T>): T | undefined;
export { useStaticData };

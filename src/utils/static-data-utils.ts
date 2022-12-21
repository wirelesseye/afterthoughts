import { useContext, useEffect, useMemo, useState } from "react";
import { staticDataContext } from "../contexts/static-data-context";

let preloadDataMap: Record<string, PreloadData> = {};
export const getPreloadDataMap = () => preloadDataMap;
export const resetPreloadDataMap = () => {
    preloadDataMap = {};
};

export interface PreloadData<T = any> {
    input: RequestInfo | URL;
    init?: RequestInit;
    callback: (response: Response) => Promise<T>;
}

function useStaticData<T>(
    identifier: string,
    input: RequestInfo | URL,
    callback: (response: Response) => Promise<T>
): T | undefined;

function useStaticData<T>(
    identifier: string,
    input: RequestInfo | URL,
    init: RequestInit,
    callback: (response: Response) => Promise<T>
): T | undefined;

function useStaticData<T>(
    identifier: string,
    input: RequestInfo | URL,
    ...params: any[]
): T | undefined {
    const staticData = useContext(staticDataContext);
    const [init, callback] = useMemo(() => {
        let init: RequestInit | undefined = undefined;
        let callback: (response: Response) => Promise<any>;

        if (params[0] instanceof Function) {
            callback = params[0];
        } else {
            init = params[0];
            callback = params[1];
        }

        preloadDataMap[identifier] = { input, init, callback };
        return [init, callback];
    }, [params]);

    const [data, setData] = useState<any>(staticData.getStaticData(identifier));

    useEffect(() => {
        const existData = staticData.getStaticData(identifier);
        if (existData !== undefined) {
            setData(existData);
        } else {
            setData(undefined);
            fetch(input, init)
                .then((response) => callback(response))
                .then((result) => {
                    staticData.setStaticData(identifier, result);
                    setData(result);
                });
        }
    }, [identifier]);

    return data;
}

export { useStaticData };

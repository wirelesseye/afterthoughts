import { ReactNode, useCallback, useState } from "react";
import { StaticDataProvider } from "../contexts/static-data-context";

declare global {
    interface Window {
        __PRELOADED_DATA__?: any;
    }
}

interface StaticDataStoreProps {
    children?: ReactNode;
    renderData: Record<string, any> | undefined;
}

export function StaticDataStore({
    children,
    renderData,
}: StaticDataStoreProps) {
    const [staticDataMap, setStaticDataMap] = useState<Record<string, any>>(
        () => {
            if (renderData) {
                return renderData;
            } else if (
                typeof window !== "undefined" &&
                window.__PRELOADED_DATA__
            ) {
                const data = window.__PRELOADED_DATA__;
                delete window.__PRELOADED_DATA__;
                document.getElementById("preload-data")?.remove();
                return data;
            } else {
                return {};
            }
        }
    );

    const getStaticData = useCallback(
        (identifier: string) => {
            return staticDataMap[identifier];
        },
        [staticDataMap]
    );

    const setStaticData = useCallback((identifier: string, data: any) => {
        setStaticDataMap({ ...staticDataMap, [identifier]: data });
    }, []);

    return (
        <StaticDataProvider
            value={{
                getStaticData,
                setStaticData,
            }}
        >
            {children}
        </StaticDataProvider>
    );
}

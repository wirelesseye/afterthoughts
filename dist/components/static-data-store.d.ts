import { ReactNode } from "react";
declare global {
    interface Window {
        __PRELOADED_DATA__?: any;
    }
}
interface StaticDataStoreProps {
    children?: ReactNode;
    renderData: Record<string, any> | undefined;
}
export declare function StaticDataStore({ children, renderData, }: StaticDataStoreProps): JSX.Element;
export {};

import React, { ReactElement, ReactNode } from "react";
import { PreloadData } from "./static-data-utils";
import { PageType } from "./router-utils";
interface PrerenderProps {
    pathname: string;
    page: React.ComponentType<any>;
    params: Record<string, string>;
    headTags: ReactElement[];
    staticData?: Record<string, any>;
}
export interface AppProps {
    prerenderProps?: PrerenderProps;
}
export type AftApp = {
    (props: AppProps): JSX.Element;
    pages: Record<string, () => Promise<PageType>>;
    getPreloadDataMap: () => Record<string, PreloadData<any>>;
    resetPreloadDataMap: () => void;
};
export declare function createApp(Factory: (props: {
    children: ReactNode;
}) => JSX.Element): AftApp;
export declare function renderApp(app: ReactNode, container: HTMLElement): void;
export {};

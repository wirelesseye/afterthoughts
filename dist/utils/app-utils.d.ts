import React, { ReactElement, ReactNode } from "react";
import { PreloadData } from "./static-data-utils";
import { PageType } from "./router-utils";
export interface AppProps {
    renderPathname?: string;
    renderPage?: React.ComponentType<any>;
    renderParams?: Record<string, string>;
    renderData?: Record<string, any>;
    renderHeadTags?: ReactElement[];
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

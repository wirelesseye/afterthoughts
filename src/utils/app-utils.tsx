import React, { ReactElement, ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { getPreloadDataMap, PreloadData, resetPreloadDataMap } from "./static-data-utils";
import { pages, PageType } from "./router-utils";
import { StaticDataStore } from "../components/static-data-store";
import { Router } from "../components/router";
import { HeadProvider } from "react-head";

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

export function createApp(
    Factory: (props: { children: ReactNode }) => JSX.Element
): AftApp {
    function App({
        renderPathname,
        renderPage,
        renderParams,
        renderData,
        renderHeadTags,
    }: AppProps) {
        return (
            <StaticDataStore renderData={renderData}>
                <HeadProvider headTags={renderHeadTags}>
                    <Router
                        renderPathname={renderPathname}
                        renderPage={renderPage}
                        renderParams={renderParams}
                    >
                        <Factory>
                            <Router.Page />
                        </Factory>
                    </Router>
                </HeadProvider>
            </StaticDataStore>
        );
    }
    App.pages = pages;
    App.getPreloadDataMap = getPreloadDataMap;
    App.resetPreloadDataMap = resetPreloadDataMap;
    return App;
}

export function renderApp(app: ReactNode, container: HTMLElement) {
    if (import.meta.env.DEV) {
        console.log("Development mode");
        createRoot(container).render(
            <React.StrictMode>{app}</React.StrictMode>
        );
    } else {
        hydrateRoot(container, app);
    }
}

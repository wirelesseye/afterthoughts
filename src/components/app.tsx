import React, { ReactElement, ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import {
    getPreloadDataMap,
    PreloadData,
    resetPreloadDataMap,
} from "../utils/static-data-utils";
import { pages, PageType } from "../utils/router-utils";
import { StaticDataStore } from "../components/static-data-store";
import { Router } from "../components/router";
import { HeadProvider } from "react-head";

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

export function createApp(
    Factory: (props: { children: ReactNode }) => JSX.Element
): AftApp {
    function App({ prerenderProps }: AppProps) {
        return (
            <StaticDataStore renderData={prerenderProps?.staticData}>
                <HeadProvider headTags={prerenderProps?.headTags}>
                    <Router
                        Factory={Factory}
                        renderPathname={prerenderProps?.pathname}
                        renderPage={prerenderProps?.page}
                        renderParams={prerenderProps?.params}
                    />
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

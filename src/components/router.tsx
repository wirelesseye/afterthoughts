import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useState, ReactNode, Suspense } from "react";
import { RouterProvider } from "../contexts/router-context";
import { getPage } from "../utils/router-utils";

export interface RouterProps {
    Factory: (props: { children: ReactNode }) => JSX.Element;
    renderPathname: string | undefined;
    renderPage: React.ComponentType<any> | undefined;
    renderParams: Record<string, string> | undefined;
}

export function Router({
    renderPathname,
    renderPage,
    renderParams,
    Factory,
}: RouterProps) {
    const [pathname, setPathname] = useState(
        renderPathname ? renderPathname : window.location.pathname
    );

    const navigate = useCallback(
        (url: string, target?: string) => {
            const parser = new URL(url, window.location.href);
            if (
                parser.origin !== window.location.origin ||
                target === "_blank"
            ) {
                window.open(url, target);
                return;
            }

            if (parser.pathname != pathname) {
                setPathname(parser.pathname);
            }

            if (window.location.href != parser.href) {
                window.history.pushState({}, "", parser.href);
            }
        },
        [pathname]
    );

    useEffect(() => {
        window.addEventListener("popstate", () => {
            setPathname(window.location.pathname);
        });
    }, []);

    return (
        <RouterProvider
            value={{
                pathname,
                navigate,
            }}
        >
            <Factory>
                <RouterPage
                    renderPage={renderPage}
                    renderParams={renderParams}
                    pathname={pathname}
                />
            </Factory>
        </RouterProvider>
    );
}

interface RouterPageProps {
    pathname: string;
    renderPage: React.ComponentType<any> | undefined;
    renderParams: Record<string, string> | undefined;
}

function RouterPage({ renderPage, renderParams, pathname }: RouterPageProps) {
    const [Page, params] = useMemo(() => {
        if (renderPage) {
            return [renderPage, renderParams];
        } else {
            const [factory, params] = getPage(pathname);
            const Page = React.lazy(factory);
            return [Page, params];
        }
    }, [pathname]);

    return (
        <Suspense>
            <Page params={params} />
        </Suspense>
    );
};

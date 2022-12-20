import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useState, ReactNode, Suspense } from "react";
import { RouterProvider, useRouter } from "../contexts/router-context";
import { getPage } from "../utils/router-utils";

export interface RouterProps {
    children?: ReactNode;
    renderPathname: string | undefined;
    renderPage: React.ComponentType<any> | undefined;
    renderParams: Record<string, string> | undefined;
}

export function Router({
    renderPathname,
    renderPage,
    renderParams,
    children,
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
                renderPage,
                renderParams,
                navigate,
            }}
        >
            {children}
        </RouterProvider>
    );
}

Router.Page = () => {
    const router = useRouter();

    const [Page, params] = useMemo(() => {
        if (router.renderPage) {
            return [router.renderPage, router.renderParams];
        } else {
            const [factory, params] = getPage(router.pathname);
            const Page = React.lazy(factory);
            return [Page, params];
        }
    }, [router.pathname]);

    return (
        <Suspense>
            <Page params={params} />
        </Suspense>
    );
};

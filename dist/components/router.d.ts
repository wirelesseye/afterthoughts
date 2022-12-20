import React from "react";
import { ReactNode } from "react";
export interface RouterProps {
    children?: ReactNode;
    renderPathname: string | undefined;
    renderPage: React.ComponentType<any> | undefined;
    renderParams: Record<string, string> | undefined;
}
export declare function Router({ renderPathname, renderPage, renderParams, children, }: RouterProps): JSX.Element;
export declare namespace Router {
    var Page: () => JSX.Element;
}

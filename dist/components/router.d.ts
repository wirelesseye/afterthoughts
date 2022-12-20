import React from "react";
import { ReactNode } from "react";
export interface RouterProps {
    Factory: (props: {
        children: ReactNode;
    }) => JSX.Element;
    renderPathname: string | undefined;
    renderPage: React.ComponentType<any> | undefined;
    renderParams: Record<string, string> | undefined;
}
export declare function Router({ renderPathname, renderPage, renderParams, Factory, }: RouterProps): JSX.Element;

import { ComponentType } from "react";
interface RouterContextProps {
    pathname: string;
    renderPage?: ComponentType<any>;
    renderParams?: Record<string, string>;
    navigate: (url: string, target?: string) => void;
}
export declare const routerContext: import("react").Context<RouterContextProps>;
export declare const RouterProvider: import("react").Provider<RouterContextProps>;
export declare const useRouter: () => RouterContextProps;
export {};

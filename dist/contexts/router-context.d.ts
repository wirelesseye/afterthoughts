interface RouterContextProps {
    pathname: string;
    navigate: (url: string, target?: string) => void;
}
export declare const routerContext: import("react").Context<RouterContextProps>;
export declare const RouterProvider: import("react").Provider<RouterContextProps>;
export declare const useRouter: () => RouterContextProps;
export {};

import { ComponentType, createContext, useContext } from "react";

interface RouterContextProps {
    pathname: string;
    renderPage?: ComponentType<any>;
    renderParams?: Record<string, string>;
    navigate: (url: string, target?: string) => void;
}

export const routerContext = createContext<RouterContextProps>({
    pathname: "/",
    navigate: () => {},
});
export const RouterProvider = routerContext.Provider;
export const useRouter = () => useContext(routerContext);

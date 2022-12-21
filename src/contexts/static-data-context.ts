import { createContext, useContext } from "react";

export interface StaticDataContextProps {
    getStaticData: (identifier: string) => any;
    setStaticData: (identifier: string, data: any) => void;
}

export const staticDataContext = createContext<StaticDataContextProps>({
    getStaticData: () => {},
    setStaticData: () => {},
});

export const StaticDataProvider = staticDataContext.Provider;

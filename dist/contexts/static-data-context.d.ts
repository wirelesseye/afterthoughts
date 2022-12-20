/// <reference types="react" />
export interface StaticDataContextProps {
    getStaticData: (identifier: string) => any;
    setStaticData: (identifier: string, data: any) => void;
}
export declare const staticDataContext: import("react").Context<StaticDataContextProps>;
export declare const StaticDataProvider: import("react").Provider<StaticDataContextProps>;

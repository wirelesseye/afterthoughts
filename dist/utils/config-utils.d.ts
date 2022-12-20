export interface AftConfig {
    site: {
        title: string;
        navigation: Record<string, string>;
    };
    posts: {
        numPerPage: number;
        synopsisMaxLength: number;
    };
}
type Subset<K> = {
    [attr in keyof K]?: K[attr] extends object ? Subset<K[attr]> : K[attr];
};
export type UserConfig = Subset<AftConfig>;
export declare const defaultConfig: AftConfig;
export declare function useConfig(): AftConfig | undefined;
export declare function fetchConfig(): Promise<AftConfig>;
export {};

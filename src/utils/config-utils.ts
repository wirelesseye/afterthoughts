import { useStaticData } from "./static-data-utils";

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

export const defaultConfig: AftConfig = {
    site: {
        title: "afterthoughts",
        navigation: {
            home: "/",
            archive: "/archive",
            tags: "/tags",
            about: "/about",
        },
    },
    posts: {
        numPerPage: 8,
        synopsisMaxLength: 280,
    },
};

export function useConfig() {
    const config = useStaticData<AftConfig>(
        "__aft_config",
        "/generate/config.json",
        (res) => res.json()
    );
    return config;
}

export function useSiteTitle() {
    const config = useConfig();
    return config?.site.title;
}

export function fetchConfig(): Promise<AftConfig> {
    return fetch("/generate/config.json").then(res => res.json());
}

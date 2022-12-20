import { PageType } from "./utils/router-utils";

declare global {
    interface ImportMeta {
        env: {
            DEV: boolean;
            MODE: string;
        },
        glob: (glob: string) => Record<string, () => Promise<PageType>>
    }
}

export {}

export type PageType = {
    default: React.ComponentType<any>;
    [key: string]: any;
};

let pages: Record<string, () => Promise<PageType>>;
let pagesWithParams: [RegExp, () => Promise<PageType>, string[], number][];
let notFoundPage: () => Promise<PageType>;

updatePages();

function updatePages() {
    try {
        pages = import.meta.glob("/pages/**/*.{tsx,ts}") as Record<
            string,
            () => Promise<PageType>
        >;
    } catch {
        pages = {};
    }

    pagesWithParams = [];
    for (const key in pages) {
        const params = getPathParams(key);
        if (params.length === 0) {
            continue;
        }

        let newKey = key.slice(6);
        params.forEach(
            (param) => (newKey = newKey.replace(`{${param}}`, "{}"))
        );
        const base = basename(newKey, false);

        const [pathname, suffix] = base.startsWith("_")
            ? [`${dirname(newKey)}/${base.slice(1)}`, "(.html)?$"]
            : [
                  base === "index"
                      ? dirname(newKey)
                      : `${dirname(newKey)}/${base}`,
                  "/?(index.html)?$",
              ];

        const reg = new RegExp(
            "^" +
                pathname
                    .split("{}")
                    .map((s) => escapeRegExp(s))
                    .join("([^\\\\\\/]*)") +
                suffix
        );

        const baseParamSize = getPathParams(base).length;

        pagesWithParams.push([reg, pages[key], params, baseParamSize]);
    }

    const notFounds = [`/pages/_404.tsx`, `/pages/_404.ts`];
    for (const filename of notFounds) {
        if (filename in pages) {
            notFoundPage = pages[filename];
            break;
        }
    }
}

export function getPathParams(filepath: string) {
    const params: string[] = [];
    let leftIndex = filepath.indexOf("{");
    while (leftIndex !== -1) {
        const rightIndex = filepath.indexOf("}", leftIndex);
        if (rightIndex === -1) {
            throw Error(`invalid filename ${filepath}: brackets do not match`);
        }
        params.push(filepath.substring(leftIndex + 1, rightIndex));
        leftIndex = filepath.indexOf("{", rightIndex);
    }

    return params;
}

function basename(path: string, keepExt?: boolean) {
    const basename = path.split("/").reverse()[0];
    if (keepExt === undefined || keepExt === true) {
        return basename;
    } else {
        return basename.replace(/\.[^/.]+$/, "");
    }
}

function dirname(path: string) {
    return path.substring(0, path.lastIndexOf("/"));
}

function escapeRegExp(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getPage(
    pathname: string
): Promise<[PageType, Record<string, string>]> {
    if (import.meta.env.DEV) {
        updatePages();
    }

    if (pathname.endsWith("/")) {
        pathname = pathname.slice(0, -1);
    }

    const candidates = [
        `/pages${pathname}/index.tsx`,
        `/pages${pathname}/index.ts`,
        `/pages${pathname}.tsx`,
        `/pages${pathname}.ts`,
        `/pages${dirname(pathname)}/_${basename(pathname, false)}.tsx`,
        `/pages${dirname(pathname)}/_${basename(pathname, false)}.ts`,
    ];

    for (const filename of candidates) {
        if (filename in pages) {
            const page = await pages[filename]();
            if (page.default === undefined) {
                continue;
            } else {
                return [page, {}];
            }
        }
    }

    for (const [reg, factory, params, baseParamSize] of pagesWithParams) {
        const match = reg.exec(pathname);
        if (match !== null) {
            const page = await factory();
            if (page.default === undefined) {
                continue;
            } else {
                const paramKeys = params.slice(-baseParamSize);
                const paramValues = match.slice(1, 1 + params.length).slice(-baseParamSize);
                const paramMap: Record<string, string> = {};

                for (let i = 0; i < paramKeys.length; i++) {
                    paramMap[paramKeys[i]] = paramValues[i];
                }
                return [page, paramMap];
            }
        }
    }

    if (notFoundPage) {
        return [await notFoundPage(), {}];
    }

    throw Error(`Page not found: ${pathname}`);
}

export function pathnameEquals(otherPathname: string, currPathname?: string) {
    if (!currPathname) {
        currPathname = window.location.pathname;
    }

    if (otherPathname.endsWith("/")) {
        otherPathname = otherPathname.slice(0, -1);
    }

    if (currPathname.endsWith("/")) {
        currPathname = currPathname.slice(0, -1);
    }

    return currPathname === otherPathname;
}

export { pages };

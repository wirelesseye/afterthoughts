import React, { createContext, useContext, useMemo, useState, useEffect, useCallback, Suspense, createElement, Component } from 'react';
import { jsx } from 'react/jsx-runtime';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';

const staticDataContext = createContext({
    getStaticData: () => { },
    setStaticData: () => { },
});
const StaticDataProvider = staticDataContext.Provider;

let preloadDataMap = {};
const getPreloadDataMap = () => preloadDataMap;
const resetPreloadDataMap = () => {
    preloadDataMap = {};
};
function useStaticData(identifier, input, ...params) {
    const staticData = useContext(staticDataContext);
    const [init, callback] = useMemo(() => {
        let init = undefined;
        let callback;
        if (params[0] instanceof Function) {
            callback = params[0];
        }
        else {
            init = params[0];
            callback = params[1];
        }
        preloadDataMap[identifier] = { input, init, callback };
        return [init, callback];
    }, []);
    const [data, setData] = useState(staticData.getStaticData(identifier));
    useEffect(() => {
        if (data !== undefined)
            return;
        fetch(input, init)
            .then((response) => callback(response))
            .then((result) => {
            staticData.setStaticData(identifier, result);
            setData(result);
        });
    }, []);
    return data;
}

const defaultConfig = {
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
function useConfig() {
    const config = useStaticData("__aft_config", "/generate/config.json", (res) => res.json());
    return config;
}
function useSiteTitle() {
    const config = useConfig();
    return config?.site.title;
}
function fetchConfig() {
    return fetch("/generate/config.json").then(res => res.json());
}

let pages;
let pagesWithParams;
updatePages();
function updatePages() {
    try {
        pages = import.meta.glob("/pages/**/*.{tsx,ts}");
    }
    catch {
        pages = {};
    }
    pagesWithParams = [];
    for (const key in pages) {
        const params = getPathParams(key);
        if (params.length === 0) {
            continue;
        }
        let newKey = key.slice(6);
        params.forEach((param) => (newKey = newKey.replace(`{${param}}`, "{}")));
        const base = basename(newKey, false);
        const [pathname, suffix] = base.startsWith("_")
            ? [`${dirname(newKey)}/${base.slice(1)}`, "(.html)?$"]
            : [
                base === "index"
                    ? dirname(newKey)
                    : `${dirname(newKey)}/${base}`,
                "/?(index.html)?$",
            ];
        const reg = new RegExp("^" +
            pathname
                .split("{}")
                .map((s) => escapeRegExp(s))
                .join("([^\\\\\\/]*?)") +
            suffix);
        const baseParamSize = getPathParams(base).length;
        pagesWithParams.push([reg, pages[key], params, baseParamSize]);
    }
}
function getPathParams(filepath) {
    const params = [];
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
function basename(path, keepExt) {
    const basename = path.split("/").reverse()[0];
    if (keepExt === undefined || keepExt === true) {
        return basename;
    }
    else {
        return basename.replace(/\.[^/.]+$/, "");
    }
}
function dirname(path) {
    return path.substring(0, path.lastIndexOf("/"));
}
function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function getPage(pathname) {
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
            return [pages[filename], {}];
        }
    }
    for (const [reg, factory, params, baseParamSize] of pagesWithParams) {
        const match = reg.exec(pathname);
        if (match !== null) {
            const paramKeys = params.slice(-baseParamSize);
            const paramValues = match
                .slice(1, 1 + params.length)
                .slice(-baseParamSize);
            const paramMap = {};
            for (let i = 0; i < paramKeys.length; i++) {
                paramMap[paramKeys[i]] = paramValues[i];
            }
            return [factory, paramMap];
        }
    }
    const notFounds = [`/pages/_404.tsx`, `/pages/_404.ts`];
    for (const filename of notFounds) {
        if (filename in pages) {
            return [pages[filename], {}];
        }
    }
    throw Error(`no such page: ${pathname}`);
}
function pathnameEquals(otherPathname, currPathname) {
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

function range(...params) {
    if (params.length === 1) {
        return [...Array(params[0]).keys()];
    }
    else if (params.length === 2) {
        const [start, end] = params;
        const size = end - start;
        return Array.from(new Array(size), (_x, i) => i + start);
    }
    else {
        throw Error("invalid parameters");
    }
}

function usePosts(page) {
    const postList = useStaticData(`__aft_posts_${page}`, `/generate/data/posts/${page}.json`, (res) => res.json());
    return postList || [];
}
async function getPostPageNums() {
    const numPages = await fetch("/generate/data/posts.json").then(res => res.json()).then(json => json.numPages);
    return range(numPages).map(i => (i + 1).toString());
}

const routerContext = createContext({
    pathname: "/",
    navigate: () => { },
});
const RouterProvider = routerContext.Provider;
const useRouter = () => useContext(routerContext);

function StaticDataStore({ children, renderData, }) {
    const [staticDataMap, setStaticDataMap] = useState(() => {
        if (renderData) {
            return renderData;
        }
        else if (typeof window !== "undefined" &&
            window.__PRELOADED_DATA__) {
            const data = window.__PRELOADED_DATA__;
            delete window.__PRELOADED_DATA__;
            document.getElementById("preload-data")?.remove();
            return data;
        }
        else {
            return {};
        }
    });
    const getStaticData = useCallback((identifier) => {
        return staticDataMap[identifier];
    }, [staticDataMap]);
    const setStaticData = useCallback((identifier, data) => {
        setStaticDataMap({ ...staticDataMap, [identifier]: data });
    }, []);
    return (jsx(StaticDataProvider, { value: {
            getStaticData,
            setStaticData,
        }, children: children }));
}

function Router({ renderPathname, renderPage, renderParams, Factory, }) {
    const [pathname, setPathname] = useState(renderPathname ? renderPathname : window.location.pathname);
    const navigate = useCallback((url, target) => {
        const parser = new URL(url, window.location.href);
        if (parser.origin !== window.location.origin ||
            target === "_blank") {
            window.open(url, target);
            return;
        }
        if (parser.pathname != pathname) {
            setPathname(parser.pathname);
        }
        if (window.location.href != parser.href) {
            window.history.pushState({}, "", parser.href);
        }
    }, [pathname]);
    useEffect(() => {
        window.addEventListener("popstate", () => {
            setPathname(window.location.pathname);
        });
    }, []);
    return (jsx(RouterProvider, { value: {
            pathname,
            navigate,
        }, children: jsx(Factory, { children: jsx(RouterPage, { renderPage: renderPage, renderParams: renderParams, pathname: pathname }) }) }));
}
function RouterPage({ renderPage, renderParams, pathname }) {
    const [Page, params] = useMemo(() => {
        if (renderPage) {
            return [renderPage, renderParams];
        }
        else {
            const [factory, params] = getPage(pathname);
            const Page = React.lazy(factory);
            return [Page, params];
        }
    }, [pathname]);
    return (jsx(Suspense, { children: jsx(Page, { params: params }) }));
}

function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  _setPrototypeOf(subClass, superClass);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}

var _React$createContext = /*#__PURE__*/createContext(null),
    Consumer = _React$createContext.Consumer,
    Provider = _React$createContext.Provider;

var HeadTag = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(HeadTag, _React$Component);

  function HeadTag() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    _this.state = {
      canUseDOM: false
    };
    _this.headTags = null;
    _this.index = -1;
    return _this;
  }

  var _proto = HeadTag.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var _this$props = this.props,
        tag = _this$props.tag,
        name = _this$props.name,
        property = _this$props.property;
    this.setState({
      canUseDOM: true
    });
    this.index = this.headTags.addClientTag(tag, name || property);
  };

  _proto.componentWillUnmount = function componentWillUnmount() {
    var tag = this.props.tag;
    this.headTags.removeClientTag(tag, this.index);
  };

  _proto.render = function render() {
    var _this2 = this;

    var _this$props2 = this.props,
        Tag = _this$props2.tag,
        rest = _objectWithoutPropertiesLoose(_this$props2, ["tag"]);

    var canUseDOM = this.state.canUseDOM;
    return /*#__PURE__*/createElement(Consumer, null, function (headTags) {
      if (headTags == null) {
        throw Error('<HeadProvider /> should be in the tree');
      }

      _this2.headTags = headTags;

      if (canUseDOM) {
        if (!headTags.shouldRenderTag(Tag, _this2.index)) {
          return null;
        }

        var ClientComp = /*#__PURE__*/createElement(Tag, rest);
        return /*#__PURE__*/createPortal(ClientComp, document.head);
      }

      var ServerComp = /*#__PURE__*/createElement(Tag, _extends({
        "data-rh": ""
      }, rest));
      headTags.addServerTag(ServerComp);
      return null;
    });
  };

  return HeadTag;
}(Component);

var cascadingTags = ['title', 'meta'];

var HeadProvider = /*#__PURE__*/function (_React$Component) {
  _inheritsLoose(HeadProvider, _React$Component);

  function HeadProvider() {
    var _this;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
    _this.indices = new Map();
    _this.state = {
      addClientTag: function addClientTag(tag, name) {
        // consider only cascading tags
        if (cascadingTags.indexOf(tag) !== -1) {
          _this.setState(function (state) {
            var _ref;

            var names = state[tag] || [];
            return _ref = {}, _ref[tag] = [].concat(names, [name]), _ref;
          }); // track indices synchronously


          var _assertThisInitialize = _assertThisInitialized(_this),
              indices = _assertThisInitialize.indices;

          var index = indices.has(tag) ? indices.get(tag) + 1 : 0;
          indices.set(tag, index);
          return index;
        }

        return -1;
      },
      shouldRenderTag: function shouldRenderTag(tag, index) {
        if (cascadingTags.indexOf(tag) !== -1) {
          var names = _this.state[tag]; // eslint-disable-line react/destructuring-assignment
          // check if the tag is the last one of similar

          return names && names.lastIndexOf(names[index]) === index;
        }

        return true;
      },
      removeClientTag: function removeClientTag(tag, index) {
        _this.setState(function (state) {
          var names = state[tag];

          if (names) {
            var _ref2;

            names[index] = null;
            return _ref2 = {}, _ref2[tag] = names, _ref2;
          }

          return null;
        });
      },
      addServerTag: function addServerTag(tagNode) {
        var _this$props$headTags = _this.props.headTags,
            headTags = _this$props$headTags === void 0 ? [] : _this$props$headTags; // tweak only cascading tags

        if (cascadingTags.indexOf(tagNode.type) !== -1) {
          var index = headTags.findIndex(function (prev) {
            var prevName = prev.props.name || prev.props.property;
            var nextName = tagNode.props.name || tagNode.props.property;
            return prev.type === tagNode.type && prevName === nextName;
          });

          if (index !== -1) {
            headTags.splice(index, 1);
          }
        }

        headTags.push(tagNode);
      }
    };
    return _this;
  }

  var _proto = HeadProvider.prototype;

  _proto.componentDidMount = function componentDidMount() {
    var ssrTags = document.head.querySelectorAll("[data-rh=\"\"]"); // `forEach` on `NodeList` is not supported in Googlebot, so use a workaround

    Array.prototype.forEach.call(ssrTags, function (ssrTag) {
      return ssrTag.parentNode.removeChild(ssrTag);
    });
  };

  _proto.render = function render() {
    var _this$props = this.props,
        headTags = _this$props.headTags,
        children = _this$props.children;

    if (typeof window === 'undefined' && Array.isArray(headTags) === false) {
      throw Error('headTags array should be passed to <HeadProvider /> in node');
    }

    return /*#__PURE__*/createElement(Provider, {
      value: this.state
    }, children);
  };

  return HeadProvider;
}(Component);

var Title = function Title(props) {
  return /*#__PURE__*/createElement(HeadTag, _extends({
    tag: "title"
  }, props));
};
var Style = function Style(props) {
  return /*#__PURE__*/createElement(HeadTag, _extends({
    tag: "style"
  }, props));
};
var Meta = function Meta(props) {
  return /*#__PURE__*/createElement(HeadTag, _extends({
    tag: "meta"
  }, props));
};
var Link$1 = function Link(props) {
  return /*#__PURE__*/createElement(HeadTag, _extends({
    tag: "link"
  }, props));
};
var Base = function Base(props) {
  return /*#__PURE__*/createElement(HeadTag, _extends({
    tag: "base"
  }, props));
};

function createApp(Factory) {
    function App({ prerenderProps }) {
        return (jsx(StaticDataStore, { renderData: prerenderProps?.staticData, children: jsx(HeadProvider, { headTags: prerenderProps?.headTags, children: jsx(Router, { Factory: Factory, renderPathname: prerenderProps?.pathname, renderPage: prerenderProps?.page, renderParams: prerenderProps?.params }) }) }));
    }
    App.pages = pages;
    App.getPreloadDataMap = getPreloadDataMap;
    App.resetPreloadDataMap = resetPreloadDataMap;
    return App;
}
function renderApp(app, container) {
    if (import.meta.env.DEV) {
        console.log("Development mode");
        createRoot(container).render(jsx(React.StrictMode, { children: app }));
    }
    else {
        hydrateRoot(container, app);
    }
}

function Link(props) {
    const router = useRouter();
    const { onClick, ...other } = props;
    const _onClick = (e) => {
        e.preventDefault();
        if (props.href)
            router.navigate(props.href, props.target);
        if (onClick)
            onClick(e);
    };
    return jsx("a", { ...other, onClick: _onClick });
}

var afterthoughts = /*#__PURE__*/Object.freeze({
    __proto__: null,
    HeadTitle: Title,
    HeadStyle: Style,
    HeadMeta: Meta,
    HeadLink: Link$1,
    HeadBase: Base,
    defaultConfig: defaultConfig,
    useConfig: useConfig,
    useSiteTitle: useSiteTitle,
    fetchConfig: fetchConfig,
    getPathParams: getPathParams,
    pathnameEquals: pathnameEquals,
    useStaticData: useStaticData,
    usePosts: usePosts,
    getPostPageNums: getPostPageNums,
    range: range,
    useRouter: useRouter,
    createApp: createApp,
    renderApp: renderApp,
    Link: Link,
    Router: Router
});

export { Base as HeadBase, Link$1 as HeadLink, Meta as HeadMeta, Style as HeadStyle, Title as HeadTitle, Link, Router, createApp, afterthoughts as default, defaultConfig, fetchConfig, getPathParams, getPostPageNums, pathnameEquals, range, renderApp, useConfig, usePosts, useRouter, useSiteTitle, useStaticData };

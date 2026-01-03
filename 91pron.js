function compactArray(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    let item = arr[i];
    if (item) result.push(item);
  }
  return result;
}

function isPlainObject(obj) {
  if (!obj || typeof obj !== "object") return false;
  let proto = Object.getPrototypeOf(obj);
  return (
    (proto === null ||
      proto === Object.prototype ||
      Object.getPrototypeOf(proto) === null) &&
    Object.prototype.toString.call(obj) === "[object Object]"
  );
}

function deepMerge(target, source) {
  let keys = Object.keys(source);
  for (let i = 0; i < keys.length; i++) {
    let key = keys[i];
    if (key === "__proto__") continue;

    let srcVal = source[key];
    let tgtVal = target[key];

    if (Array.isArray(srcVal)) {
      target[key] = Array.isArray(tgtVal)
        ? deepMerge(tgtVal, srcVal)
        : deepMerge([], srcVal);
    } else if (isPlainObject(srcVal)) {
      target[key] = isPlainObject(tgtVal)
        ? deepMerge(tgtVal, srcVal)
        : deepMerge({}, srcVal);
    } else {
      if (tgtVal === undefined || srcVal !== undefined) {
        target[key] = srcVal;
      }
    }
  }
  return target;
}

/* async / await polyfill helpers */

function asyncStep(gen, resolve, reject, next, throwFn, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(next, throwFn);
  }
}

function asyncWrapper(fn) {
  return function () {
    var self = this;
    var args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function next(value) {
        asyncStep(gen, resolve, reject, next, throwFn, "next", value);
      }

      function throwFn(err) {
        asyncStep(gen, resolve, reject, next, throwFn, "throw", err);
      }

      next(undefined);
    });
  };
}

const DEFAULT_HEADERS = {
  "Accept-Language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7",
};

const BASE_URL = "https://91porn.com";

/* HTTP Client */

const httpClient = new (class {
  constructor(getDefaultOptions) {
    this.getDefaultOptions = getDefaultOptions;
  }

  get(url, options) {
    return asyncWrapper(function* () {
      let requestOptions = { headers: DEFAULT_HEADERS };

      if (this.getDefaultOptions) {
        try {
          let defaults = yield this.getDefaultOptions();
          requestOptions = deepMerge(requestOptions, defaults || {});
        } catch (e) {
          console.warn("获取默认配置失败，使用基础配置:", e);
        }
      }

      requestOptions = deepMerge(requestOptions, options || {});

      try {
        let response = yield Widget.http.get(url, requestOptions);
        if (!response || response.statusCode !== 200) {
          throw new Error(
            `请求失败: ${response?.statusCode || "未知错误"}`
          );
        }
        return response.data;
      } catch (e) {
        throw new Error(
          `网络请求失败: ${e instanceof Error ? e.message : "未知错误"}`
        );
      }
    }).call(this);
  }

  getHtml(url, options) {
    return asyncWrapper(function* () {
      let html = yield this.get(url, options);
      return Widget.html.load(html);
    }).call(this);
  }
})();

/* ================= Widget Metadata ================= */

WidgetMetadata = {
  id: "91porn",
  title: "91Porn",
  description: "⚝五折码：TOM.5⚝",
  author: "🅣🅞🅜",
  version: "0.0.1",
  requiredVersion: "0.0.1",
  site: "@🅣🅞🅜",
  detailCacheDuration: 1,
  globalParams: [
    {
      name: "base_url",
      title: "基础 URL",
      type: "input",
      value: BASE_URL,
    },
  ],
  modules: [
    {
      id: "91porn.list",
      title: "🔞 91Porn 视频搜索",
      description: "🔞 91Porn 视频搜索",
      cacheDuration: 3600,
      requiresWebView: false,
      functionName: "get91pornList",
      params: [
        {
          name: "sort_by",
          title: "分类",
          type: "enumeration",
          value: "rf",
          enumOptions: [
            { value: "rf", title: "最近加精" },
            { value: "hot", title: "当前最热" },
            { value: "top", title: "本月最热" },
            { value: "tf", title: "本月收藏" },
            { value: "md", title: "本月讨论" },
            { value: "top&m=-1", title: "上月最热" },
            { value: "ori", title: "91原创" },
            { value: "long", title: "10分钟以上" },
            { value: "longer", title: "20分钟以上" },
            { value: "hd", title: "高清" },
            { value: "mf", title: "收藏最多" },
          ],
        },
        {
          name: "page",
          title: "页码",
          type: "page",
          value: "1",
        },
      ],
    },
    {
      type: "stream",
      id: "loadResource",
      title: "加载资源",
      functionName: "loadResource",
    },
  ],
};

/* ================= List ================= */

const get91pornList = (params) =>
  asyncWrapper(function* () {
    params.sort_by ||= "ori";
    params.page ||= "1";
    params.base_url ||= BASE_URL;

    try {
      let $ = yield httpClient.getHtml(
        `${params.base_url}/v.php?category=${params.sort_by}&viewtype=basic&page=${params.page}`
      );
      if (!$) return [];

      let items = Array.from($(".videos-text-align")).map((el) => {
        let node = $(el);

        if (node.closest(".col-lg-8").length > 0) return null;

        let link = node.find("a").attr("href");
        if (!link) return null;

        let img = node.find(".img-responsive").attr("src");

        let video = {
          id: link,
          type: "url",
          mediaType: "movie",
          link,
          title: node.find(".video-title").text().trim(),
          backdropPath: img,
        };

        try {
          video.durationText = node.find(".duration").text().trim();
        } catch {}

        try {
          let id = img?.split("/").pop()?.split(".")[0];
          if (id) {
            video.previewUrl = `https://vthumb.killcovid2021.com/thumb/${id}.mp4`;
          }
        } catch {}

        return video;
      });

      return compactArray(items);
    } catch (e) {
      console.error("Failed to get 91porn list", e);
      return [];
    }
  })();

/* ================= Resource ================= */

const loadResource = (params) =>
  asyncWrapper(function* () {
    let { id, link, videoUrl, base_url = BASE_URL } = params;
    let target = [id, link, videoUrl].find(
      (v) => v && v.startsWith(base_url)
    );
    if (!target) return [];

    let detail = yield loadDetail(target);
    return [
      {
        name: detail.title,
        description: detail.description || "",
        url: detail.videoUrl,
      },
    ];
  })();

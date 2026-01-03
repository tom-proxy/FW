function t(t) {
  let e = [];
  for (let r = 0; r < t.length; r++) {
    let i = t[r];
    i && e.push(i);
  }
  return e;
}

function e(t) {
  if (!t || typeof t !== "object") return false;
  let e = Object.getPrototypeOf(t);
  return (
    (e === null ||
      e === Object.prototype ||
      Object.getPrototypeOf(e) === null) &&
    Object.prototype.toString.call(t) === "[object Object]"
  );
}

function r(t, i) {
  let l = Object.keys(i);
  for (let o = 0; o < l.length; o++) {
    let n = l[o];
    if (n === "__proto__") continue;

    let a = i[n],
      u = t[n];

    if (Array.isArray(a)) {
      t[n] = Array.isArray(u) ? r(u, a) : r([], a);
    } else if (e(a)) {
      t[n] = e(u) ? r(u, a) : r({}, a);
    } else {
      if (u === undefined || a !== undefined) {
        t[n] = a;
      }
    }
  }
  return t;
}

function i(t, e, r, i, l, o, n) {
  try {
    var a = t[o](n),
      u = a.value;
  } catch (t) {
    r(t);
    return;
  }
  a.done ? e(u) : Promise.resolve(u).then(i, l);
}

function l(t) {
  return function () {
    var e = this,
      r = arguments;
    return new Promise(function (l, o) {
      var n = t.apply(e, r);

      function a(t) {
        i(n, l, o, a, u, "next", t);
      }
      function u(t) {
        i(n, l, o, a, u, "throw", t);
      }
      a(void 0);
    });
  };
}

let o = {
  "Accept-Language": "zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7",
};

function n(t, e, r, i, l, o, n) {
  try {
    var a = t[o](n),
      u = a.value;
  } catch (t) {
    r(t);
    return;
  }
  a.done ? e(u) : Promise.resolve(u).then(i, l);
}

function a(t) {
  return function () {
    var e = this,
      r = arguments;
    return new Promise(function (i, l) {
      var o = t.apply(e, r);

      function a(t) {
        n(o, i, l, a, u, "next", t);
      }
      function u(t) {
        n(o, i, l, a, u, "throw", t);
      }
      a(void 0);
    });
  };
}

let u = "https://91porn.com";

let s = new (class {
  constructor(t) {
    this.getDefaultOptions = t;
  }

  get(t, e) {
    return l(function* () {
      let i = { headers: o };

      if (this.getDefaultOptions) {
        try {
          let t = yield this.getDefaultOptions();
          i = r(i, t != null ? t : {});
        } catch (t) {
          console.warn("获取默认配置失败，使用基础配置:", t);
        }
      }

      let l = r(i, e != null ? e : {});
      try {
        let e = yield Widget.http.get(t, l);
        if (!e || e.statusCode !== 200) {
          throw Error(`请求失败: ${e?.statusCode || "未知错误"}`);
        }
        return e.data;
      } catch (t) {
        throw Error(
          `网络请求失败: ${t instanceof Error ? t.message : "未知错误"}`
        );
      }
    }).call(this);
  }

  getHtml(t, e) {
    return l(function* () {
      let r = yield this.get(t, e);
      return Widget.html.load(r);
    }).call(this);
  }
})();

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
      value: u,
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

get91pornList = (e) =>
  a(function* () {
    e.sort_by || (e.sort_by = "ori");
    e.page || (e.page = "1");
    e.base_url || (e.base_url = u);

    try {
      let r = yield s.getHtml(
        `${e.base_url}/v.php?category=${e.sort_by}&viewtype=basic&page=${e.page}`
      );
      if (!r) return [];

      let i = Array.from(r(".videos-text-align")).map((t) => {
        let l = r(t);
        if (l.closest(".col-lg-8").length > 0) return null;

        let o = l.find("a").attr("href");
        if (!o) return null;

        let n = l.find(".img-responsive").attr("src");
        let a = {
          id: o,
          type: "url",
          mediaType: "movie",
          link: o,
          title: l.find(".video-title").text().trim(),
          backdropPath: n,
        };

        try {
          a.durationText = l.find(".duration").text().trim();
        } catch {}

        return a;
      });

      return t(i);
    } catch (t) {
      console.error("Failed to get 91porn list", t);
      return [];
    }
  })();

loadResource = (t) =>
  a(function* () {
    let { id: r, link: i, videoUrl: l, base_url: o = u } = t;
    let n = [r, i, l].find((t) => t && t.startsWith(o));
    if (!n) return [];

    let a = yield loadDetail(n);
    return [
      {
        name: a.title,
        description: a.description || "",
        url: a.videoUrl,
      },
    ];
  })();

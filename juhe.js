var WidgetMetadata = {
  id: "aggregate_live_ultra",
  title: "聚合直播 Ultra",
  description: "ForwardWidgets 满血形态聚合直播模块",
  author: "Forward",
  site: "http://api.maiyoux.com:81",
  version: "3.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "直播平台",
      description: "原生播放 · 自动兜底 · 智能优选",
      functionName: "getLiveList",
      sectionMode: true,
      requiresWebView: false,
      cacheDuration: 300,
      params: [
        {
          name: "platform",
          title: "平台",
          type: "enumeration",
          enumOptions: []
        }
      ]
    }
  ],
  search: {
    title: "搜索直播",
    functionName: "searchLive",
    params: [
      { name: "keyword", title: "关键词", type: "input" }
    ]
  }
};

const API = "http://api.maiyoux.com:81";
const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1";

const FAVORITE_KEY = "live_favorites";
const RECENT_KEY = "live_recent";

/* ───────── 生命周期：动态分类 ───────── */
async function prepare() {
  const res = await Widget.http.get(`${API}/mf/json.txt`, {
    headers: { "User-Agent": UA }
  });

  const ignore = ["卫视直播", "龙珠", "映客"];

  WidgetMetadata.modules[0].params[0].enumOptions =
    res.data.pingtai
      .filter(p => !ignore.some(i => p.title.includes(i)))
      .map(p => ({
        title: `${p.title} (${p.Number})`,
        value: p.address
      }));
}

/* ───────── 工具：测速（HEAD） ───────── */
async function ping(url) {
  const start = Date.now();
  try {
    await Widget.http.head(url, { timeout: 3000 });
    return Date.now() - start;
  } catch {
    return 99999;
  }
}

/* ───────── 工具：收藏 / 最近 ───────── */
function load(key) {
  return Widget.storage.get(key) || [];
}
function save(key, value) {
  Widget.storage.set(key, value.slice(0, 50));
}

/* ───────── 主模块 ───────── */
async function getLiveList(params = {}) {
  const res = await Widget.http.get(`${API}/mf/${params.platform}`, {
    headers: { "User-Agent": UA }
  });

  const groups = {};
  const recent = load(RECENT_KEY);

  for (const item of res.data.zhubo) {
    if (!item.address || item.address.startsWith("rtmp")) continue;

    const title = item.title.trim();
    const group = item.group || "默认分组";

    if (!groups[group]) groups[group] = [];
    groups[group].push({
      id: item.address,
      type: "link",
      title,
      posterPath: item.img || "",
      link: item.address,
      mediaType: "tv",
      durationText: "LIVE"
    });
  }

  if (recent.length) {
    groups["最近播放"] = recent;
  }

  return Object.keys(groups).map(k => ({
    title: k,
    items: groups[k]
  }));
}

/* ───────── WebView + 原生双通道 ───────── */
async function loadDetail(link) {
  const delay = await ping(link);

  const recent = load(RECENT_KEY);
  if (!recent.find(i => i.link === link)) {
    recent.unshift({
      id: link,
      type: "link",
      title: link.split("/").pop(),
      link
    });
    save(RECENT_KEY, recent);
  }

  if (delay < 3000) {
    return { videoUrl: link };
  }

  return {
    webView: {
      url: link,
      userAgent: UA
    }
  };
}

/* ───────── 搜索 ───────── */
async function searchLive(params = {}) {
  if (!params.keyword) return [];

  const res = await Widget.http.get(`${API}/mf/json.txt`, {
    headers: { "User-Agent": UA }
  });

  const result = [];

  for (const p of res.data.pingtai) {
    const list = await Widget.http.get(`${API}/mf/${p.address}`, {
      headers: { "User-Agent": UA }
    });

    list.data.zhubo.forEach(i => {
      if (
        i.title &&
        i.title.includes(params.keyword) &&
        !i.address.startsWith("rtmp")
      ) {
        result.push({
          id: i.address,
          type: "link",
          title: i.title,
          posterPath: i.img || "",
          link: i.address,
          mediaType: "tv"
        });
      }
    });
  }

  return result;
}

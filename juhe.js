var WidgetMetadata = {
  id: "aggregate_live_pro",
  title: "聚合直播 Pro",
  description: "ForwardWidgets 最高规格聚合直播模块",
  author: "Forward",
  site: "http://api.maiyoux.com:81",
  version: "2.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "直播平台",
      description: "聚合直播 · 原生播放",
      functionName: "getLiveList",
      requiresWebView: false,
      sectionMode: true,
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
      {
        name: "keyword",
        title: "关键词",
        type: "input"
      }
    ]
  }
};

const UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1";

const API = "http://api.maiyoux.com:81";

/**
 * 初始化生命周期：动态注入平台分类
 */
async function prepare() {
  const url = `${API}/mf/json.txt`;
  const res = await Widget.http.get(url, {
    headers: { "User-Agent": UA }
  });

  if (!res?.data?.pingtai) {
    throw new Error("平台分类加载失败");
  }

  const ignore = ["卫视直播", "龙珠", "映客"];

  WidgetMetadata.modules[0].params[0].enumOptions =
    res.data.pingtai
      .filter(p => !ignore.some(i => p.title.includes(i)))
      .map(p => ({
        title: `${p.title} (${p.Number})`,
        value: p.address
      }));
}

/**
 * 主模块：直播列表（分组模式）
 */
async function getLiveList(params = {}) {
  if (!params.platform) {
    throw new Error("缺少 platform 参数");
  }

  const url = `${API}/mf/${params.platform}`;
  const res = await Widget.http.get(url, {
    headers: { "User-Agent": UA }
  });

  if (!res?.data?.zhubo) {
    throw new Error("直播数据异常");
  }

  const groups = {};

  res.data.zhubo.forEach(item => {
    if (
      !item.address ||
      !item.title ||
      item.address.startsWith("rtmp")
    ) {
      return;
    }

    const group = item.group || "默认分组";
    if (!groups[group]) groups[group] = [];

    groups[group].push({
      id: item.address,
      type: "url",
      title: item.title,
      posterPath: item.img || "",
      videoUrl: item.address,
      mediaType: "tv",
      durationText: "LIVE"
    });
  });

  return Object.keys(groups).map(title => ({
    title,
    items: groups[title]
  }));
}

/**
 * 搜索模块
 */
async function searchLive(params = {}) {
  if (!params.keyword) return [];

  const res = await Widget.http.get(`${API}/mf/json.txt`, {
    headers: { "User-Agent": UA }
  });

  const results = [];

  for (const p of res.data.pingtai) {
    const listRes = await Widget.http.get(`${API}/mf/${p.address}`, {
      headers: { "User-Agent": UA }
    });

    listRes.data.zhubo.forEach(item => {
      if (
        item.title &&
        item.title.includes(params.keyword) &&
        !item.address.startsWith("rtmp")
      ) {
        results.push({
          id: item.address,
          type: "url",
          title: item.title,
          posterPath: item.img || "",
          videoUrl: item.address,
          mediaType: "tv",
          durationText: "LIVE"
        });
      }
    });
  }

  return results;
}

var WidgetMetadata = {
  id: "juhe_live",
  title: "聚合直播",
  description: "⚝五折码：TOM.5⚝",
  author: "🅣🅞🅜",
  site: "http://api.maiyoux.com:81",
  version: "1.0.1",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "直播平台分类",
      description: "列出所有平台及其主播（二级结构）",
      requiresWebView: false,
      functionName: "loadPlatformsAndStreams",
      sectionMode: false,
      params: []
    }
  ]
};

async function loadPlatformsAndStreams(params = {}) {
  try {
    // 读取 info 配置中的 turl
    const info = Widget.cache.get("info");
    if (!info || !info.turl) {
      throw new Error("未设置 info.turl，请先调用初始化接口或设置缓存");
    }
    const base = Widget.text.decodeBase64(info.turl);

    // 获取平台列表
    const resp = await Widget.http.get(base + "mf/json.txt", {
      headers: { "User-Agent": "Mozilla/5.0" }
    });
    const data = resp.data;
    if (!data || !Array.isArray(data.pingtai)) {
      throw new Error("json.txt 文件格式异常，缺少 pingtai 数组");
    }

    // 遍历平台，组装 childItems
    const categories = await Promise.all(data.pingtai.map(async (plt, idx) => {
      if (!plt.address) return null;

      let rooms = [];
      try {
        const sub = await Widget.http.get(base + "mf/" + plt.address, {
          headers: { "User-Agent": "Mozilla/5.0" }
        });
        const sd = sub.data;
        if (Array.isArray(sd.zhubo)) {
          rooms = sd.zhubo;
        } else {
          console.warn(`平台 "${plt.title}" 下没有 zhubo 数组`);
        }
      } catch (e) {
        console.warn(`请求平台 "${plt.title}" 失败:`, e);
      }

      const childItems = rooms.map(r => ({
        id: r.address,
        type: "url",
        title: r.title,
        posterPath: r.img,
        videoUrl: r.address,
        mediaType: "tv",
        description: r.title
      }));

      return {
        id: "plat_" + idx,
        type: "category",
        title: `${plt.title} (${plt.Number || childItems.length})`,
        posterPath: plt.xinimg,
        description: plt.title,
        childItems
      };
    }));

    return categories.filter(item => item !== null);
  } catch (e) {
    console.error("loadPlatformsAndStreams 出错：", e);
    throw e;
  }
}

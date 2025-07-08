var WidgetMetadata = {
  id: "juhe_live",
  title: "聚合直播",
  description: "Forward",
  author: "小良科技",
  version: "1.0.0",
  icon: "https://github.com/pack1r/ForwardWidgets/raw/main/icon.png",
  modules: [
    {
      title: "聚合直播",
      description: "支持多平台聚合直播观看",
      functionName: "loadPlatforms",
      cacheDuration: 600,
      params: []
    }
  ]
};

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1";
const site = "http://api.maiyoux.com:81";

// 一级：平台列表
async function loadPlatforms() {
  const url = site + "/mf/json.txt";
  try {
    const { data } = await Widget.http.get({
      url: url,
      header: { "User-Agent": UA }
    });

    const ignoreList = ["卫视直播", "龙珠", "映客"];
    const platforms = data?.pingtai || [];

    const result = platforms
      .filter(p => !ignoreList.some(name => p.title.includes(name)))
      .map(p => ({
        id: p.address,
        type: "list",           // ✅ 必须是 "list"
        title: `${p.title} (${p.Number})`,
        posterPath: p.xinimg,
        onClick: async () => await loadStreamers(p.address, p.title)
      }));

    return result;

  } catch (e) {
    console.log("获取平台失败", e);
    return [];
  }
}

// 二级：主播列表
async function loadStreamers(address, platformName) {
  const url = `${site}/mf/${address}`;
  try {
    const { data } = await Widget.http.get({
      url: url,
      header: { "User-Agent": UA }
    });

    const streamers = data?.zhubo || [];
    const items = streamers
      .filter(zb => zb.address && !zb.address.startsWith("rtmp"))
      .map(zb => ({
        id: zb.address,
        type: "video",         // ✅ 必须是 "video"
        title: zb.title,
        posterPath: zb.img,
        videoUrl: zb.address   // ✅ 必须给 videoUrl
      }));

    return [
      {
        title: `${platformName} 主播列表`,  // ✅ 必须有 title
        items: items
      }
    ];

  } catch (e) {
    console.log("获取主播失败", e);
    return [];
  }
}

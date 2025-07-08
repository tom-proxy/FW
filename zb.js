var WidgetMetadata = {
  id: "juhe_live",
  title: "聚合直播",
  description: "1",
  author: "小良科技",
  version: "1.0.0",
  modules: [
    {
      title: "聚合直播",
      description: "1",
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
  const url = `${site}/mf/json.txt`;
  try {
    const { data } = await Widget.http.get({
      url,
      header: { "User-Agent": UA }
    });

    const ignore = ["卫视直播", "龙珠", "映客"];
    const platforms = data?.pingtai || [];
    const result = platforms
      .filter(e => !ignore.some(name => e.title.includes(name)))
      .map(e => ({
        id: e.address,
        type: "list",
        title: `${e.title} (${e.Number})`,
        posterPath: e.xinimg,
        onClick: async () => await loadStreamers(e.address, e.title)
      }));

    return result;

  } catch (e) {
    console.log("平台列表加载失败", e);
    return [];
  }
}

// 二级：主播列表
async function loadStreamers(platformId, platformName) {
  const url = `${site}/mf/${platformId}`;
  try {
    const { data } = await Widget.http.get({
      url,
      header: { "User-Agent": UA }
    });

    const streamers = data?.zhubo || [];
    const items = streamers
      .filter(e => e.address && !e.address.startsWith("rtmp"))
      .map(e => ({
        id: e.address,
        type: "video",
        title: e.title,
        posterPath: e.img,
        videoUrl: e.address
      }));

    return [{
      title: `${platformName} 主播列表`,
      items
    }];

  } catch (e) {
    console.log("主播列表加载失败", e);
    return [];
  }
}

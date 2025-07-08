var WidgetMetadata = {
  id: "qiumingshan_live",
  title: "直播 - 秋名山见",
  description: "聚合多个直播平台，支持主播列表与直接播放",
  author: "小良科技",
  version: "2.2",
  icon: "https://github.com/pack1r/ForwardWidgets/raw/main/icon.png",
  modules: [
    {
      title: "聚合直播",
      description: "选择直播平台 → 主播列表 → 直接播放",
      functionName: "loadPlatforms",
      cacheDuration: 600,
      params: []
    }
  ]
};

// 一级：获取平台
async function loadPlatforms() {
  const infoUrl = "https://iphone8.vip/conf.json";
  let response;
  try {
    response = await Widget.http.get({ url: infoUrl });
  } catch (e) {
    console.log("获取配置信息失败", e);
    return [];
  }

  const info = response.data;
  if (!info || !info.turl) return [];

  const platformsUrl = decodeBase64(info.turl) + "json.txt";

  let platResponse;
  try {
    platResponse = await Widget.http.get({
      url: platformsUrl,
      header: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 4.4.2; OPPO R11 Build/NMF26X)"
      }
    });
  } catch (e) {
    console.log("获取平台失败", e);
    return [];
  }

  const platforms = platResponse.data?.pingtai || [];
  return platforms.map(item => ({
    id: item.address,
    type: "list",
    title: `${item.title} (${item.Number})`,
    posterPath: item.xinimg,
    onClick: async () => await loadStreamers(item.address, item.title)
  }));
}

// 二级：获取主播
async function loadStreamers(platformId, platformName) {
  const infoUrl = "https://iphone8.vip/conf.json";
  let response;
  try {
    response = await Widget.http.get({ url: infoUrl });
  } catch (e) {
    console.log("获取配置信息失败", e);
    return [];
  }

  const info = response.data;
  const streamerUrl = decodeBase64(info.turl) + platformId;

  let streamResponse;
  try {
    streamResponse = await Widget.http.get({
      url: streamerUrl,
      header: {
        "User-Agent": "Mozilla/5.0 (Linux; Android 4.4.2; OPPO R11 Build/NMF26X)"
      }
    });
  } catch (e) {
    console.log("获取主播列表失败", e);
    return [];
  }

  const zhuboList = streamResponse.data?.zhubo || [];

  return [{
    title: `${platformName} 主播列表`,
    items: zhuboList.map(item => ({
      id: item.address,
      type: "video",
      title: item.title,
      posterPath: item.img,
      videoUrl: item.address // 🚩 直接给 Forward 播放，无需任何前缀
    }))
  }];
}

// 工具：Base64解码
function decodeBase64(str) {
  try {
    return Widget.text.base64Decode(str.replace(/lz7z/g, "a"));
  } catch (e) {
    console.log("Base64解码失败", e);
    return "";
  }
}

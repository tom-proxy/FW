var WidgetMetadata = {
  id: "Bitch",
  title: "碧池直播",
  description: "⚝五折码：TOM.5⚝",
  author: "",
  site: "@",
  version: "0.0.2",
  requiredVersion: "0.0.1",
  modules: [
    {
      id: "bitch.videos",
      title: "碧池直播视频",
      description: "按类型获取碧池直播视频列表",
      cacheDuration: 1800,
      requiresWebView: false,
      functionName: "getVideos",
      params: [
        {
          name: "category",
          title: "类型",
          type: "enumeration",
          value: "jsonkawayi",
          enumOptions: [
            { title: "卡哇伊", value: "jsonkawayi" },
            { title: "咪狐", value: "jsonmihu" },
            { title: "花蝴蝶", value: "jsonhuahudie" },
            { title: "蜜桃", value: "jsonmitao" },
            { title: "番茄社区", value: "jsonfanjiashequ" },
            { title: "LOVE", value: "jsonLOVE" },
            { title: "小妲己", value: "jsonxiaodaji" },
            { title: "77直播", value: "json77zhibo" },
            { title: "依依", value: "jsonyiyi" },
            { title: "日出", value: "jsonrichu" },
            { title: "彩虹", value: "jsoncaihong" },
            { title: "久久", value: "jsonjiujiu" },
            { title: "亚米", value: "jsonyami" },
            { title: "蝶恋", value: "jsondielian" },
            { title: "夜妖姬", value: "jsonyeyaoji" },
            { title: "套路", value: "jsontaolu" },
            { title: "樱花", value: "jsonyinghua" },
            { title: "享色", value: "jsonxiangse" },
            { title: "红浪漫", value: "jsonhonglangman" },
            { title: "金鱼", value: "jsonjinyu" },
            // …（可继续补充其他分类）
          ]
        }
      ]
    }
  ]
};

async function getVideos(params = {}) {
  try {
    // 1. 默认 category 处理
    if (!params.category) {
      params.category = "jsonkawayi";
    }

    // 2. 构建请求 URL
    const url = `http://api.maiyoux.com:81/mf/${params.category}.txt`;
    console.log("[碧池直播] 请求 URL:", url);

    // 3. 发起请求
    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 4.4.2; OPPO R11 Build/NMF26X) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36",
        "Content-Type": "application/octet-stream"
      }
    });

    // 4. 校验响应
    if (!response || !response.data) {
      throw new Error("API 返回空数据");
    }
    if (typeof response.data !== "object" || !Array.isArray(response.data.zhubo)) {
      throw new Error("无效的数据格式");
    }

    // 5. 转化为 Forward 标准视频列表
    const videos = response.data.zhubo
      .filter((item) => item.address && item.title)
      .map((item) => ({
        id: item.address,
        type: "url",
        title: item.title.trim(),
        posterPath: item.img || "",
        // 实际播放通过 videoUrl 字段指定
        videoUrl: item.address
      }));

    // 6. 警告空列表
    if (videos.length === 0) {
      console.warn(
        "[碧池直播] 分类返回列表为空, 原始数据:",
        response.data
      );
    }

    return videos;
  } catch (error) {
    throw new Error(`[碧池直播] 视频获取失败: ${error.message}`);
  }
}

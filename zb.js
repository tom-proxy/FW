var WidgetMetadata = {
  id: "qmszb",
  title: "秋名山直播",
  description: "直播",
  author: "🅣🅞🅜",
  site: "site",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "直播",
      requiresWebView: false,
      functionName: "getVideos",
      params: [
        {
          name: "category",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            { title: "央视", value: "jsonweishizhibo" }
          ]
        }
      ]
    }
  ]
};

async function getVideos(params = {}) {
  try {
    // 1. 参数验证
    if (!params.category) {
      throw new Error("缺少必要参数: category");
    }

    // 2. 构建请求URL
    const url = `http://api.maiyoux.com:81/mf/${params.category}.txt`;
    console.log('[视频获取] 请求URL:', url);

    // 3. 发送请求
    const response = await Widget.http.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 4.4.2; OPPO R11 Build/NMF26X) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36',
        "Content-Type": "application/octet-stream"
      }
    });

    // 4. 响应数据验证
    if (!response?.data) {
      throw new Error("API返回空数据");
    }

    // 5. 数据结构验证
    if (typeof response.data !== 'object' || !Array.isArray(response.data.zhubo)) {
      throw new Error("无效的数据格式");
    }

    // 6. 数据转换与过滤
    const videos = response.data.zhubo
      .filter(item => item.address && item.title) // 过滤无效条目
      .map(item => ({
        id: item.address,
        type: "url",
        title: item.title.trim(),
        posterPath: item.img || '', 
        videoUrl: item.address
      }));

    if (videos.length === 0) {
      console.warn('警告: 过滤后视频列表为空，原始数据:', response.data);
    }

    return videos;

  } catch (error) {
    throw new Error(`视频获取失败: ${error.message}`);
  }
}

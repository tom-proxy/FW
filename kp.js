var WidgetMetadata = {
  id: "看片",
  title: "看片",
  description: "⚝五折码：TOM.5⚝",
  author: "🅣🅞🅜",
  site: "@🅣🅞🅜",
  version: "0.0.1",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "资源",
      requiresWebView: false,
      functionName: "getVideos",
      params: [
        {
          name: "category",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            { title: "国产", value: "/list/1" },
            { title: "日本", value: "/list/2" },
            { title: "韩国", value: "/list/3" },
            { title: "欧美", value: "/list/4" },
            { title: "三级", value: "/list/5" },
            { title: "动漫", value: "/list/6" }
          ]
        }
      ]
    }
  ]
};

async function getVideos(params = {}) {
  try {
    if (!params.category) throw new Error("缺少必要参数: category");

    const base64Url = "aHR0cHM6Ly85ZHF4LnNtMjg3LnZpcA==";
    const baseUrl = Widget.text.base64Decode(base64Url);
    const url = `${baseUrl}${params.category}.html`;

    console.log('[资源获取] 请求URL:', url);

    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
      }
    });

    if (!response?.data) throw new Error("API返回空数据");

    let html = response.data.replace(/\n|\s|\r/g, "");
    const mainMatch = html.match(/<divclass=\"main\">.*?<divclass=\"pagebtn\">/g);
    if (!mainMatch) throw new Error("页面结构识别失败");

    const section = mainMatch[0];
    const items = section.match(/<aclass=\"vodbox\".*?<\/script>/g);
    if (!items || items.length === 0) throw new Error("未找到视频条目");

    const decodeTitle = (r) => {
      let n = "";
      for (let i = 0; i < r.length; ++i) n += String.fromCharCode(128 ^ r.charCodeAt(i));
      return n;
    };

    const getFullUrl = (base, path) => path.startsWith("http") ? path : `${base}${path}`;

    const videos = items.map(item => {
      const imgMatch = item.match(/src="(\S*?)"/);
      const titleMatch = item.match(/l\(\'(\S*?)\'/);
      const hrefMatch = item.match(/href=\"(\S*?)\"/);

      if (!imgMatch || !titleMatch || !hrefMatch) return null;

      const posterFull = getFullUrl(baseUrl, imgMatch[1]);
      const videoPageFull = getFullUrl(baseUrl, hrefMatch[1]);

      return {
        id: videoPageFull,
        type: "webview",  // 强制WebView播放
        title: decodeTitle(titleMatch[1]),
        posterPath: posterFull,
        videoUrl: videoPageFull,  // 必须是原网页地址
        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1"
      };
    }).filter(v => v !== null);

    if (videos.length === 0) console.warn("警告：无有效视频数据");

    return videos;

  } catch (error) {
    throw new Error(`资源获取失败: ${error.message}`);
  }
}

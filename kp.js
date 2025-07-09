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

    const baseUrl = "https://9dqx.sm287.vip";
    const pageUrl = `${baseUrl}${params.category}.html`;

    console.log("[资源获取] 请求URL:", pageUrl);

    const response = await Widget.http.get(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
        "Referer": baseUrl
      }
    });

    if (!response?.data) throw new Error("API返回空数据");

    // 完整复刻JSBox原逻辑：过滤、解码、拼接
    const html = response.data.replace(/\n|\s|\r/g, "");
    const mainMatch = html.match(/<divclass=\"main\">.*?<divclass=\"pagebtn\">/g);
    if (!mainMatch) throw new Error("页面结构解析失败");

    const content = mainMatch[0];
    const itemList = content.match(/<aclass=\"vodbox\".*?<\/script>/g);
    if (!itemList || itemList.length === 0) throw new Error("未找到视频数据");

    const decodeTitle = (str) => {
      let result = "";
      for (let i = 0; i < str.length; ++i) {
        result += String.fromCharCode(128 ^ str.charCodeAt(i));
      }
      return result;
    };

    const videos = itemList.map(item => {
      const imgMatch = item.match(/src="(\S*?)"/);
      const titleMatch = item.match(/l\(\'(\S*?)\'/);
      const hrefMatch = item.match(/href=\"(\S*?)\"/);

      if (!imgMatch || !titleMatch || !hrefMatch) return null;

      // ✅ 确保图片URL与原JSBox一致
      const imgUrl = imgMatch[1].startsWith("http") ? imgMatch[1] : `${baseUrl}${imgMatch[1]}`;

      // ✅ 确保视频链接与原JSBox一致
      const videoHref = hrefMatch[1].startsWith("http") ? hrefMatch[1] : `${baseUrl}${hrefMatch[1]}`;

      // ✅ 标题严格解码
      const videoTitle = decodeTitle(titleMatch[1]);

      return {
        id: videoHref,
        type: "webview",
        title: videoTitle,
        posterPath: imgUrl,
        videoUrl: videoHref
      };
    }).filter(v => v !== null);

    if (videos.length === 0) throw new Error("解析后无有效视频数据");

    return videos;

  } catch (error) {
    throw new Error(`资源获取失败: ${error.message}`);
  }
}

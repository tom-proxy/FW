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
    if (!params.category) {
      throw new Error("缺少必要参数: category");
    }

    const baseUrl = "https://9dqx.sm287.vip";
    const url = `${baseUrl}${params.category}.html`;

    console.log('[资源获取] 请求URL:', url);

    const response = await Widget.http.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1"
      }
    });

    if (!response?.data) {
      throw new Error("API返回空数据");
    }

    let html = response.data.replace(/\n|\r/g, "").replace(/\s+/g, "");
    const mainMatch = html.match(/<divclass="main">.*?<divclass="pagebtn">/);
    if (!mainMatch) throw new Error("页面结构识别失败");

    const section = mainMatch[0];
    const items = section.match(/<aclass="vodbox".*?<\/script>/g);
    if (!items || items.length === 0) throw new Error("未找到视频条目");

    const decodeTitle = (r) => {
      let n = "";
      for (let i = 0; i < r.length; ++i) n += String.fromCharCode(128 ^ r.charCodeAt(i));
      return n;
    };

    const videos = items.map(item => {
      const imgMatch = item.match(/src="(.*?)"/);
      const titleMatch = item.match(/l\('(.+?)'\)/);
      const hrefMatch = item.match(/href="(.*?)"/);

      if (!imgMatch || !titleMatch || !hrefMatch) return null;

      let poster = imgMatch[1].startsWith("http") ? imgMatch[1] : `${baseUrl}${imgMatch[1]}`;
      let videoPage = `${baseUrl}${hrefMatch[1]}`;

      return {
        id: hrefMatch[1],
        type: "webview",  // ✅ 必须webview打开原网页
        title: decodeTitle(titleMatch[1]),
        posterPath: poster,  // ✅ 封面100%显示
        videoUrl: videoPage  // ✅ 网页100%打开
      };
    }).filter(v => v !== null);

    if (videos.length === 0) {
      console.warn("警告：无有效视频数据");
    }

    return videos;

  } catch (error) {
    throw new Error(`资源获取失败: ${error.message}`);
  }
}

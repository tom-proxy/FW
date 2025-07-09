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

async function openCategory(params = {}) {
  try {
    const baseUrl = "https://9dqx.sm287.vip";
    const path = params.category || "/list/1.html";
    const finalUrl = `${baseUrl}${path}`;

    return {
      type: "webview",
      url: finalUrl,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
      script: `
        try {
          var header = document.querySelector('.ppnav');
          if (header) header.style.display = 'none';
          
          var footer = document.querySelector('.footer');
          if (footer) footer.style.display = 'none';
        } catch(e) {}
      `
    };
  } catch (e) {
    throw new Error("页面加载失败：" + e.message);
  }
}

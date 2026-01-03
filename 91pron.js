var WidgetMetadata = {
  id: "porn91.webview",
  title: "91Porn",
  description: "91Porn · WebView 稳定版",
  author: "Forward",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  site: "https://91porn.com",
  modules: [
    {
      id: "porn91.entry",
      title: "进入 91Porn",
      requiresWebView: true,
      functionName: "openHome",
      params: [
        {
          name: "category",
          title: "分类",
          type: "enumeration",
          value: "ori",
          enumOptions: [
            { title: "91原创", value: "ori" },
            { title: "最近加精", value: "rf" },
            { title: "当前最热", value: "hot" },
            { title: "本月最热", value: "top" }
          ]
        }
      ]
    }
  ]
};

/* ================= WebView 入口 ================= */

function openHome(params = {}) {
  const baseUrl = "https://91porn.com";
  const category = params.category || "ori";

  const url = `${baseUrl}/v.php?category=${category}&viewtype=basic`;

  return [
    {
      id: url,
      type: "web",
      title: "91Porn",
      link: url
    }
  ];
}

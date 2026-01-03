var WidgetMetadata = {
  id: "porn91.forward",
  title: "91Porn",
  description: "91Porn · Forward 原生解析版",
  author: "Forward",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  site: "https://91porn.com",
  modules: [
    {
      id: "porn91.list",
      title: "91Porn 列表",
      functionName: "get91pornList",
      requiresWebView: false,
      cacheDuration: 600,
      params: [
        {
          name: "sort_by",
          title: "分类",
          type: "enumeration",
          value: "ori",
          enumOptions: [
            { title: "91原创", value: "ori" },
            { title: "最近加精", value: "rf" },
            { title: "当前最热", value: "hot" },
            { title: "本月最热", value: "top" }
          ]
        },
        {
          name: "page",
          title: "页码",
          type: "page",
          value: "1"
        }
      ]
    },
    {
      id: "porn91.play",
      type: "stream",
      title: "播放",
      functionName: "loadResource"
    }
  ]
};

/* ================= 列表 ================= */

async function get91pornList(params = {}) {
  const baseUrl = "https://91porn.com";
  const category = params.sort_by || "ori";
  const page = params.page || "1";

  const url = `${baseUrl}/v.php?category=${category}&viewtype=basic&page=${page}`;

  let res;
  try {
    res = await Widget.http.get(url);
  } catch (e) {
    console.error("请求失败", e);
    return [];
  }

  if (!res || typeof res.data !== "string") return [];

  const html = res.data;
  const list = [];

  const reg =
    /<a href="(view_video\.php\?viewkey=[^"]+)"[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<span class="video-title">([\s\S]*?)<\/span>/g;

  let match;
  while ((match = reg.exec(html)) !== null) {
    list.push({
      id: match[1],
      type: "url",
      title: match[3].trim(),
      posterPath: match[2],
      videoUrl: baseUrl + "/" + match[1]
    });
  }

  return list;
}

/* ================= 播放 ================= */

async function get91pornList(params = {}) {
  const baseUrl = "http://91porn.com";
  const category = params.sort_by || "ori";
  const page = params.page || "1";

  const url = `${baseUrl}/v.php?category=${category}&viewtype=basic&page=${page}`;

  let res;
  try {
    res = await Widget.http.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile Safari/605.1.15",
        "Referer": "http://91porn.com/"
      },
      zlibMode: 0
    });
  } catch (e) {
    console.error("请求失败", e);
    return [];
  }

  if (!res || typeof res.data !== "string") return [];

  const html = res.data;
  const list = [];

  const reg =
    /<a href="(view_video\.php\?viewkey=[^"]+)"[\s\S]*?<img[^>]+src="([^"]+)"[\s\S]*?<span class="video-title">([\s\S]*?)<\/span>/g;

  let match;
  while ((match = reg.exec(html)) !== null) {
    list.push({
      id: match[1],
      type: "url",
      title: match[3].trim(),
      posterPath: match[2],
      videoUrl: baseUrl + "/" + match[1]
    });
  }

  return list;
}

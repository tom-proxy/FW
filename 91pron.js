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

async function loadResource(params) {
  const url = params.videoUrl;
  if (!url) return [];

  let res;
  try {
    res = await Widget.http.get(url);
  } catch (e) {
    console.error("详情页请求失败", e);
    return [];
  }

  if (!res || typeof res.data !== "string") return [];

  const html = res.data;

  const encoded = html.match(/strencode2\("([^"]+)"\)/);
  if (!encoded) return [];

  let decoded;
  try {
    decoded = decodeURIComponent(encoded[1]);
  } catch {
    return [];
  }

  const source = decoded.match(/<source src="([^"]+)"/);
  if (!source) return [];

  return [
    {
      name: params.title || "91Porn",
      url: source[1],
      description: ""
    }
  ];
}

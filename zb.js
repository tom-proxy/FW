var WidgetMetadata = {
  id: "juhe_live",
  title: "聚合直播",
  description: "聚合多个直播源（技术交流免费接口）",
  requiredVersion: "1.0.1",
  version: "1.0.5",
  author: "🅣🅞🅜",
  modules: [
    { title: "直播平台", description: "选择平台", requiresWebView: false, functionName: "getCategories", sectionMode: false, params: [] },
    { title: "主播列表", description: "选择主播", requiresWebView: false, functionName: "getChannels", sectionMode: false, params: [{ name: "url", title: "平台dz", type: "input", description: "上一页传入dz" }] },
    { title: "播放", description: "播放直播", requiresWebView: false, functionName: "getPlayUrl", sectionMode: false, params: [{ name: "playurl", title: "主播链接", type: "input", description: "上一页传入url" }] }
  ]
};

// ———— 一级：直播平台 ————
async function getCategories() {
  const resp = await Widget.http.get("http://api.hclyz.com:81/mf/json.txt", { headers: { "User-Agent": Widget.userAgent } });
  const text = resp.data;
  const pattern = /@mc([^|]+)\|@tp1([^|]+)\|@dz([^|]+)\|@sl(\d+)/g;
  const arr = [];
  let m;
  while ((m = pattern.exec(text)) !== null) {
    arr.push({ mc: m[1], tp1: m[2], dz: m[3], sl: m[4] });
  }
  return arr.map(o => ({
    id: o.dz,
    type: "input",
    title: o.mc,
    posterPath: o.tp1,
    genreTitle: `主播约 ${o.sl} 人`,
    videoUrl: o.dz
  }));
}

// ———— 二级：主播列表 ————
async function getChannels(params = {}) {
  if (!params.url) throw new Error("缺少平台dz参数");
  const resp = await Widget.http.get(`http://api.hclyz.com:81/mf/${params.url}`, { headers: { "User-Agent": Widget.userAgent } });
  const data = typeof resp.data === "string" ? JSON.parse(resp.data) : resp.data;
  const list = Array.isArray(data.list) ? data.list : [];
  return list.map(item => ({
    id: item.url,
    type: "url",
    title: item.name,
    posterPath: item.img,
    genreTitle: item.desc || "",
    videoUrl: item.url
  }));
}

// ———— 三级：直接播放 ————
async function getPlayUrl(params = {}) {
  if (!params.playurl) throw new Error("缺少主播链接");
  return [{ id: params.playurl, type: "url", title: "立即播放", videoUrl: params.playurl }];
}

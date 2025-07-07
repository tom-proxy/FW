var WidgetMetadata = {
    id: "juhe_live",
    title: "聚合直播",
    description: "聚合多个直播源（技术交流免费接口）",
    requiredVersion: "1.0.1",
    version: "1.0.3",
    author: "🅣🅞🅜",
    modules: [
        {
            title: "直播平台",
            description: "选择直播平台",
            requiresWebView: false,
            functionName: "getCategories",
            sectionMode: false,
            params: []
        },
        {
            title: "主播列表",
            description: "选择主播播放",
            requiresWebView: false,
            functionName: "getChannels",
            sectionMode: false,
            params: [
                { name: "url", title: "平台地址", type: "input", description: "前级传入dz" }
            ]
        },
        {
            title: "播放地址",
            description: "获取播放链接",
            requiresWebView: false,
            functionName: "getPlayUrl",
            sectionMode: false,
            params: [
                { name: "playurl", title: "主播链接", type: "input", description: "前级传入主播url" }
            ]
        }
    ]
};

// 获取直播平台列表
async function getCategories() {
    const url = "http://api.hclyz.com:81/mf/json.txt";
    const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
    const text = typeof resp.data === "string" ? resp.data : JSON.stringify(resp.data);

    const items = text.split('|').filter(line => line.startsWith('@mc'));
    const data = items.map(line => {
        const obj = {};
        ["mc", "tp1", "dz", "sl"].forEach(key => {
            const m = text.match(new RegExp(`@${key}([^@|]+)`));
            if (m) obj[key] = m[1];
        });
        return obj;
    });

    return data.map(item => ({
        id: item.dz,
        type: "input",
        title: item.mc,
        posterPath: item.tp1,
        genreTitle: `主播≈${item.sl}`,
        videoUrl: item.dz
    }));
}

// 获取该平台主播列表
async function getChannels(params = {}) {
    const dz = params.url;
    if (!dz) throw new Error("缺少平台dz参数");
    const url = `http://api.hclyz.com:81/mf/${dz}`;
    const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
    const list = resp.data?.list || [];
    return list.map(bj => ({
        id: bj.url,
        type: "url",
        title: bj.name,
        posterPath: bj.img,
        genreTitle: bj.desc || "",
        videoUrl: bj.url
    }));
}

// 获取主播播放地址
async function getPlayUrl(params = {}) {
    const playurl = params.playurl;
    if (!playurl) throw new Error("缺少主播链接");
    return [{ id: playurl, type: "url", title: "立即播放", videoUrl: playurl }];
}

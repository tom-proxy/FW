var WidgetMetadata = {
    id: "juhe_live",
    title: "聚合直播",
    description: "聚合多个直播平台",
    requiredVersion: "1.0.1",
    version: "1.0.4",
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
            description: "选择主播",
            requiresWebView: false,
            functionName: "getChannels",
            sectionMode: false,
            params: [
                { name: "url", title: "平台地址", type: "input", description: "平台dz" }
            ]
        },
        {
            title: "播放",
            description: "播放地址",
            requiresWebView: false,
            functionName: "getPlayUrl",
            sectionMode: false,
            params: [
                { name: "playurl", title: "主播链接", type: "input", description: "主播URL" }
            ]
        }
    ]
};

// 解析平台列表
async function getCategories() {
    const url = "http://api.hclyz.com:81/mf/json.txt";
    const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
    const text = resp.data;

    const pattern = /@mc(.*?)\|@tp1(.*?)\|@dz(.*?)\|@sl(\d+)/g;
    const result = [];
    let match;
    while ((match = pattern.exec(text)) !== null) {
        result.push({
            id: match[3],
            type: "input",
            title: match[1],
            posterPath: match[2],
            genreTitle: `主播：${match[4]}`,
            videoUrl: match[3]
        });
    }

    return result;
}

// 获取主播列表
async function getChannels(params = {}) {
    const dz = params.url;
    if (!dz) throw new Error("缺少平台地址");

    const url = `http://api.hclyz.com:81/mf/${dz}`;
    const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
    const data = typeof resp.data === "string" ? JSON.parse(resp.data) : resp.data;
    const list = data?.list || [];

    return list.map(item => ({
        id: item.url,
        type: "url",
        title: item.name,
        posterPath: item.img,
        genreTitle: item.desc || "",
        videoUrl: item.url
    }));
}

// 获取播放地址
async function getPlayUrl(params = {}) {
    const playurl = params.playurl;
    if (!playurl) throw new Error("缺少播放链接");

    return [{
        id: playurl,
        type: "url",
        title: "立即播放",
        videoUrl: playurl
    }];
}

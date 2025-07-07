var WidgetMetadata = {
    id: "juhe_live",
    title: "聚合直播",
    description: "聚合多个直播源",
    author: "🅣🅞🅜",
    site: "http://api.maiyoux.com:81",
    version: "1.1.0",
    requiredVersion: "0.0.1",
    modules: [
        {
            title: "直播平台",
            description: "获取直播平台列表",
            requiresWebView: false,
            functionName: "getPlatforms",
            sectionMode: false,
            params: []
        },
        {
            title: "主播列表",
            description: "获取主播列表",
            requiresWebView: false,
            functionName: "getAnchors",
            sectionMode: false,
            params: [
                {
                    name: "platformUrl",
                    title: "平台地址",
                    type: "input",
                    description: "直播平台地址"
                }
            ]
        },
        {
            title: "播放地址",
            description: "获取播放地址",
            requiresWebView: false,
            functionName: "getPlayUrl",
            sectionMode: false,
            params: [
                {
                    name: "playurl",
                    title: "播放链接",
                    type: "input",
                    description: "播放链接"
                }
            ]
        }
    ]
};

// 获取直播平台
async function getPlatforms() {
    const url = "http://api.maiyoux.com:81/mf/json.txt";
    try {
        const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
        const data = resp.data?.pingtai || [];

        const results = data.map(item => ({
            id: item.address,
            type: "url",
            title: item.title,
            posterPath: item.xinimg,
            genreTitle: "直播平台",
            videoUrl: item.address
        }));

        return results;
    } catch (err) {
        console.error("获取直播平台失败:", err);
        throw new Error("获取直播平台失败");
    }
}

// 获取主播列表
async function getAnchors(params = {}) {
    const url = params.platformUrl;
    if (!url) throw new Error("缺少平台地址");

    const playListUrl = `http://api.maiyoux.com:81/mf/${url}`;

    try {
        const resp = await Widget.http.get(playListUrl, { headers: { "User-Agent": Widget.userAgent } });
        const data = typeof resp.data === "string" ? JSON.parse(resp.data) : resp.data;
        const anchors = data?.list || [];

        if (anchors.length === 0) throw new Error("暂无主播数据");

        const results = anchors.map(item => ({
            id: item.playurl,
            type: "url",
            title: item.title || "主播",
            posterPath: item.img || "",
            videoUrl: item.playurl
        }));

        return results;
    } catch (err) {
        console.error("获取主播列表失败:", err);
        throw new Error("获取主播列表失败");
    }
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

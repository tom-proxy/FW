var WidgetMetadata = {
    id: "juhe_live",
    title: "聚合直播",
    description: "聚合多个直播源",
    author: "🅣🅞🅜",
    site: "http://api.hclyz.com:81",
    version: "1.0.1",
    requiredVersion: "0.0.1",
    icon: "https://github.com/pack1r/ForwardWidgets/raw/main/icon.png",
    modules: [
        {
            title: "直播平台",
            description: "获取直播平台列表",
            requiresWebView: false,
            functionName: "getCategories",
            sectionMode: false,
            params: []
        },
        {
            title: "主播列表",
            description: "获取平台主播列表",
            requiresWebView: false,
            functionName: "getChannels",
            sectionMode: false,
            params: [
                {
                    name: "url",
                    title: "地址",
                    type: "input",
                    description: "频道地址"
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

// 获取直播平台列表
async function getCategories() {
    const url = "http://api.hclyz.com:81/mf/json.txt";
    try {
        const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
        const data = resp.data || [];

        const results = data.map(item => ({
            id: item.dz, // 地址
            type: "url",
            title: item.mc, // 名称
            posterPath: item.tp1, // 图片
            genreTitle: `主播数：${item.sl}`,
            videoUrl: item.dz
        }));

        return results;
    } catch (err) {
        console.error("获取平台失败:", err);
        throw new Error("获取直播平台失败");
    }
}

// 获取主播列表
async function getChannels(params = {}) {
    const url = params.url;
    if (!url) throw new Error("缺少地址参数");

    const playUrl = `http://api.hclyz.com:81/mf/${url}`;
    return [{
        id: playUrl,
        type: "url",
        title: "进入直播",
        videoUrl: playUrl
    }];
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

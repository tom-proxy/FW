var WidgetMetadata = {
    id: "juhe_live",
    title: "聚合直播",
    description: "聚合多个直播源",
    author: "🅣🅞🅜",
    site: "http://api.maiyoux.com:81",
    version: "1.0.0",
    requiredVersion: "0.0.1",
    modules: [
        {
            title: "直播分类",
            description: "获取直播分类列表",
            requiresWebView: false,
            functionName: "getCategories",
            sectionMode: false,
            params: []
        },
        {
            title: "直播频道",
            description: "获取直播频道列表",
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

// 获取分类
async function getCategories() {
    const url = "http://api.maiyoux.com:81/mf/json.txt";
    try {
        const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
        const data = resp.data?.pingtai || [];

        const results = data.map(item => ({
            id: item.address,
            type: "url",
            title: item.title,
            posterPath: item.xinimg,
            genreTitle: "聚合直播",
            videoUrl: item.address
        }));

        return results;
    } catch (err) {
        console.error("获取分类失败:", err);
        throw new Error("获取直播分类失败");
    }
}

// 获取频道
async function getChannels(params = {}) {
    const url = params.url;
    if (!url) throw new Error("缺少地址参数");

    const playUrl = `http://api.maiyoux.com:81/mf/${url}`;
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

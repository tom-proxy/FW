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
            title: "直播分类",
            description: "获取直播分类列表",
            requiresWebView: false,
            functionName: "getCategories",
            sectionMode: false,
            params: []
        },
        {
            title: "直播平台",
            description: "获取直播平台列表",
            requiresWebView: false,
            functionName: "getPlatforms",
            sectionMode: false,
            params: [
                {
                    name: "categoryId",
                    title: "分类ID",
                    type: "input",
                    description: "分类ID"
                }
            ]
        },
        {
            title: "主播列表",
            description: "获取主播列表",
            requiresWebView: false,
            functionName: "getStreamers",
            sectionMode: false,
            params: [
                {
                    name: "platformUrl",
                    title: "平台地址",
                    type: "input",
                    description: "平台地址"
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
    return [{
        id: "all",
        type: "category",
        title: "全部直播",
        genreTitle: "聚合直播"
    }];
}

// 获取平台列表
async function getPlatforms(params = {}) {
    const url = "http://api.maiyoux.com:81/mf/json.txt";
    try {
        const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
        const data = resp.data?.pingtai || [];

        const results = data.map(item => ({
            id: item.address,
            type: "platform",
            title: item.title,
            posterPath: item.xinimg,
            genreTitle: "聚合直播",
            videoUrl: item.address
        }));

        return results;
    } catch (err) {
        console.error("获取平台列表失败:", err);
        throw new Error("获取直播平台列表失败");
    }
}

// 获取主播列表
async function getStreamers(params = {}) {
    const platformUrl = params.platformUrl;
    if (!platformUrl) throw new Error("缺少平台地址参数");

    try {
        // 这里需要根据实际API获取主播列表
        // 假设API返回的主播数据格式为数组，每个主播对象包含id,title,playUrl等字段
        const resp = await Widget.http.get(platformUrl, { headers: { "User-Agent": Widget.userAgent } });
        const streamers = resp.data || [];
        
        return streamers.map(streamer => ({
            id: streamer.id,
            type: "streamer",
            title: streamer.title,
            posterPath: streamer.poster,
            genreTitle: "主播",
            videoUrl: streamer.playUrl
        }));
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

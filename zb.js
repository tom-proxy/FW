var WidgetMetadata = {
    "id": "juhe_live",
    "title": "聚合直播",
    "description": "聚合多个直播源",
    "requiredVersion": "1.0.1",
    "version": "1.0.0",
    "author": "🅣🅞🅜",
    "modules": [
        {
            "title": "直播平台",
            "description": "选择直播平台",
            "requiresWebView": false,
            "functionName": "getCategories",
            "params": []
        },
        {
            "title": "主播列表",
            "description": "选择主播",
            "requiresWebView": false,
            "functionName": "getChannels",
            "params": [
                {
                    "name": "url",
                    "title": "平台地址",
                    "type": "input",
                    "description": "自动传参无需手动输入"
                }
            ]
        },
        {
            "title": "播放",
            "description": "直接播放",
            "requiresWebView": false,
            "functionName": "getPlayUrl",
            "params": [
                {
                    "name": "playurl",
                    "title": "播放地址",
                    "type": "input",
                    "description": "自动传参无需手动输入"
                }
            ]
        }
    ]
};

// 获取平台列表
async function getCategories() {
    const url = "http://api.hclyz.com:81/mf/json.txt";
    const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
    const data = resp.data || [];

    return data.map(item => ({
        id: item.dz,
        type: "url",
        title: item.mc,
        posterPath: item.tp1,
        genreTitle: `主播数：${item.sl}`,
        videoUrl: item.dz
    }));
}

// 获取主播列表
async function getChannels(params = {}) {
    const url = params.url;
    if (!url) throw new Error("缺少平台地址");

    const apiUrl = `http://api.hclyz.com:81/mf/${url}`;
    const resp = await Widget.http.get(apiUrl, { headers: { "User-Agent": Widget.userAgent } });
    const data = resp.data.list || [];

    return data.map(item => ({
        id: item.url,
        type: "url",
        title: item.name,
        posterPath: item.img,
        videoUrl: item.url
    }));
}

// 播放地址
async function getPlayUrl(params = {}) {
    const playurl = params.playurl;
    if (!playurl) throw new Error("缺少播放地址");

    return [{
        id: playurl,
        type: "url",
        title: "立即播放",
        videoUrl: playurl
    }];
}

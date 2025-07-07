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
            title: "选择直播平台",
            description: "选择平台并查看主播",
            requiresWebView: false,
            functionName: "getLiveList",
            sectionMode: false,
            params: []
        }
    ]
};

// 获取直播平台和主播
async function getLiveList() {
    const url = "http://api.maiyoux.com:81/mf/json.txt";
    try {
        const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
        const data = resp.data?.pingtai || [];

        const results = [];

        for (const platform of data) {
            const platformTitle = platform.title || "未知平台";
            const platformImg = platform.xinimg || "";
            const platformAddress = platform.address || "";

            // 请求每个平台的主播列表
            const platformUrl = `http://api.maiyoux.com:81/mf/${platformAddress}`;
            const platformResp = await Widget.http.get(platformUrl, { headers: { "User-Agent": Widget.userAgent } });

            const anchors = platformResp.data || [];

            const childItems = anchors.map(anchor => ({
                id: anchor.address,
                type: "url",
                title: anchor.title,
                posterPath: anchor.xinimg || platformImg,
                videoUrl: anchor.address
            }));

            results.push({
                id: platformAddress,
                type: "url",
                title: platformTitle,
                posterPath: platformImg,
                genreTitle: "直播平台",
                childItems: childItems
            });
        }

        return results;
    } catch (err) {
        console.error("获取直播平台失败:", err);
        throw new Error("加载直播平台失败");
    }
}

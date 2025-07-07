var WidgetMetadata = {
    id: "juhe_live",
    title: "聚合直播",
    description: "聚合多个直播源，支持平台与主播二级菜单",
    author: "🅣🅞🅜",
    site: "http://api.maiyoux.com:81",
    version: "1.0.1",
    requiredVersion: "0.0.1",
    modules: [
        {
            title: "选择直播平台",
            description: "支持平台与主播二级菜单",
            requiresWebView: false,
            functionName: "getLivePlatforms",
            sectionMode: false,
            params: []
        }
    ]
};

// 获取直播平台和主播
async function getLivePlatforms() {
    const url = "http://api.maiyoux.com:81/mf/json.txt";
    try {
        const resp = await Widget.http.get(url, { headers: { "User-Agent": Widget.userAgent } });
        const platforms = resp.data?.pingtai || [];

        const results = [];

        for (const platform of platforms) {
            const platformTitle = platform.title || "未知平台";
            const platformImg = platform.xinimg || "";
            const platformKey = platform.address || "";

            const platformUrl = `http://api.maiyoux.com:81/mf/${platformKey}`;

            let anchors = [];
            try {
                const anchorResp = await Widget.http.get(platformUrl, { headers: { "User-Agent": Widget.userAgent } });
                anchors = Array.isArray(anchorResp.data) ? anchorResp.data : [];
            } catch (anchorErr) {
                console.error(`加载主播失败: ${platformTitle}`, anchorErr);
            }

            const childItems = anchors.map(anchor => ({
                id: anchor.address,
                type: "url",
                title: anchor.title || "主播",
                posterPath: anchor.xinimg || platformImg,
                videoUrl: anchor.address
            }));

            results.push({
                id: platformKey,
                type: "url",
                title: platformTitle,
                posterPath: platformImg,
                genreTitle: "直播平台",
                childItems: childItems
            });
        }

        return results;

    } catch (err) {
        console.error("获取平台失败:", err);
        throw new Error("加载直播平台失败");
    }
}

var WidgetMetadata = {
    id: ＂juhe_live",
    title: "直播平台与主播",
    description: "展示平台及其主播，支持播放与 M3U 导出",
    author: "🅣🅞🅜",
    site: "http://api.maiyoux.com:81",
    version: "1.0.0",
    requiredVersion: "0.0.1",
    modules: [
        {
            title: "直播平台分类",
            description: "列出所有平台及其主播",
            requiresWebView: false,
            functionName: "loadPlatformsAndStreams",
            sectionMode: false,
            params: []
        }
    ]
};

async function loadPlatformsAndStreams(params = {}) {
    try {
        const base = $cache.get("info")?.turl
            ? $text.base64Decode($cache.get("info").turl)
            : null;
        if (!base) {
            throw new Error("缺少配置信息，请先加载 info");
        }

        const resp = await Widget.http.get(base + "json.txt", {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });
        const platforms = resp.data.pingtai;
        if (!Array.isArray(platforms)) {
            throw new Error("平台数据格式错误");
        }

        // 一级平台列表
        return await Promise.all(platforms.map(async (plt, idx) => {
            // 请求平台下主播数据
            const listResp = await Widget.http.get(base + plt.address, {
                headers: { "User-Agent": "Mozilla/5.0" }
            });
            const rooms = Array.isArray(listResp.data.zhubo) ? listResp.data.zhubo : [];

            const childItems = rooms.map((r, ridx) => ({
                id: r.address,
                type: "url",
                title: r.title,
                posterPath: r.img,
                videoUrl: r.address,
                mediaType: "tv",
                description: r.title
            }));

            return {
                id: `plat_${idx}`,
                type: "category",
                title: `${plt.title} (${plt.Number})`,
                posterPath: plt.xinimg,
                description: plt.title,
                childItems
            };
        }));
    } catch (e) {
        console.error(e);
        throw e;
    }
}

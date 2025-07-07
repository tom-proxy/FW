var WidgetMetadata = {
    id: "juhe_live",
    title: "聚合直播",
    description: "聚合多个直播源，支持平台与主播二级菜单\n备用域名获取地址：https://www.ebay.com/usr/xiar2792",
    author: "🅣🅞🅜",
    site: "http://api.maiyoux.com:81",
    version: "1.0.4",
    requiredVersion: "0.0.1",
    modules: [
        {
            title: "选择直播平台",
            description: "点击平台进入主播列表",
            requiresWebView: false,
            functionName: "getLivePlatforms",
            sectionMode: false,
            params: []
        },
        {
            title: "主播列表",
            description: "显示主播列表",
            requiresWebView: false,
            functionName: "getAnchors",
            sectionMode: false,
            params: [
                {
                    name: "platformJson",
                    title: "平台 JSON 地址",
                    type: "input",
                    description: "如：XXX.json"
                }
            ]
        }
    ]
};

const MAIN_DOMAIN = "http://api.maiyoux.com:81";
const BACKUP_INFO = "备用域名获取：https://www.ebay.com/usr/xiar2792";

// 一级：平台列表
async function getLivePlatforms() {
    const apiUrl = `${MAIN_DOMAIN}/mf/json.txt`;
    try {
        const resp = await Widget.http.get(apiUrl, { headers: { "User-Agent": Widget.userAgent } });
        const platforms = resp.data?.pingtai || [];

        const results = platforms.map(platform => {
            const platformJson = platform.address || "";
            const title = platform.title || "未知平台";
            const img = platform.xinimg || "";

            return {
                id: platformJson,
                type: "url",
                title: title,
                posterPath: img,
                genreTitle: "直播平台",
                link: `forward://run?module=juhe_live&functionName=getAnchors&platformJson=${encodeURIComponent(platformJson)}`
            };
        });

        return results;
    } catch (err) {
        console.error("获取平台失败:", err);
        throw new Error(`加载失败，请访问备用域名获取最新地址：${BACKUP_INFO}`);
    }
}

// 二级：主播列表
async function getAnchors(params = {}) {
    const platformJson = params.platformJson;
    if (!platformJson) throw new Error("缺少平台地址");

    const fullUrl = `${MAIN_DOMAIN}/mf/${platformJson}`;

    try {
        const resp = await Widget.http.get(fullUrl, { headers: { "User-Agent": Widget.userAgent } });
        const anchors = Array.isArray(resp.data) ? resp.data : [];

        if (anchors.length === 0) throw new Error("暂无主播");

        const results = anchors.map(anchor => ({
            id: anchor.address || "",
            type: "url",
            title: anchor.title || "主播",
            posterPath: anchor.xinimg || "",
            videoUrl: anchor.address || ""
        }));

        return results;
    } catch (err) {
        console.error("主播加载失败:", err);
        throw new Error("加载主播失败，请稍后重试");
    }
}

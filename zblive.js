var WidgetMetadata = {
  id: "zb.live",
  title: "直播聚合",
  description: "分类切换 · 记忆 · 收藏",
  author: "tom",
  version: "1.2.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "直播列表",
      functionName: "getVideos",
      requiresWebView: true
    }
  ]
};

/* ===================== 配置区 ===================== */

const STORAGE_CATEGORY = "zb_last_category";
const STORAGE_FAVORITES = "zb_favorites";

/**
 * ⚠️ 完整分类表（与原 zb.js 一致，未删减）
 */
const CATEGORIES = [
  { title: "卡哇伊", value: "jsonkawayi" },
  { title: "咪狐", value: "jsonmihu" },
  { title: "花蝴蝶", value: "jsonhuahudie" },
  { title: "蜜桃", value: "jsonmitao" },
  { title: "番茄社区", value: "jsonfanjiashequ" },
  { title: "LOVE", value: "jsonLOVE" },
  { title: "小妲己", value: "jsonxiaodaji" },
  { title: "77直播", value: "json77zhibo" },
  { title: "依依", value: "jsonyiyi" },
  { title: "日出", value: "jsonrichu" },
  { title: "彩虹", value: "jsoncaihong" },
  { title: "久久", value: "jsonjiujiu" },
  { title: "亚米", value: "jsonyami" },
  { title: "蝶恋", value: "jsondielian" },
  { title: "夜妖姬", value: "jsonyeyaoji" },
  { title: "套路", value: "jsontaolu" },
  { title: "樱花", value: "jsonyinghua" },
  { title: "享色", value: "jsonxiangse" },
  { title: "红浪漫", value: "jsonhonglangman" },
  { title: "金鱼", value: "jsonjinyu" },
  { title: "桃花岛", value: "jsontaohuadao" },
  { title: "小红帽", value: "jsonxiaohongmao" },
  { title: "草莓", value: "jsoncaomei" },
  { title: "樱桃", value: "jsonyingtao" },
  { title: "小奶猫", value: "jsonxiaonaimao" }
];

/* ===================== 状态 ===================== */

let CURRENT_CATEGORY =
  Widget.storage.get(STORAGE_CATEGORY) || "jsonkawayi";

/* ===================== 收藏工具 ===================== */

function getFavorites() {
  return Widget.storage.get(STORAGE_FAVORITES) || {};
}

function saveFavorites(favs) {
  Widget.storage.set(STORAGE_FAVORITES, favs);
}

/* ===================== 主函数 ===================== */

async function getVideos() {
  const favorites = getFavorites();

  /* 右上角：分类切换 */
  Widget.setNavigationBarItems({
    rightItems: [
      {
        title: "切换",
        onClick: async () => {
          const index = await Widget.showActionSheet({
            title: "选择分类",
            options: CATEGORIES.map(i => i.title)
          });

          if (index === -1) return;

          CURRENT_CATEGORY = CATEGORIES[index].value;
          Widget.storage.set(STORAGE_CATEGORY, CURRENT_CATEGORY);
          Widget.reload();
        }
      }
    ]
  });

  const url = `http://api.maiyoux.com:81/mf/${CURRENT_CATEGORY}.txt`;
  console.log("[直播] 当前分类:", CURRENT_CATEGORY);

  const res = await Widget.http.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 4.4.2) AppleWebKit/537.36 Mobile Safari/537.36",
      "Content-Type": "application/octet-stream"
    }
  });

  if (!res?.data || !Array.isArray(res.data.zhubo)) {
    throw new Error("API 数据异常");
  }

  return res.data.zhubo
    .filter(i => i.address && i.title)
    .map(i => {
      const isFav = !!favorites[i.address];

      return {
        id: i.address,
        type: "url",
        title: (isFav ? "⭐ " : "") + i.title.trim(),
        posterPath: i.img || "",
        videoUrl: i.address,

        /* 长按：收藏 / 取消收藏 */
        onLongPress: async () => {
          const options = isFav ? ["取消收藏"] : ["收藏"];

          const idx = await Widget.showActionSheet({
            title: i.title,
            options
          });

          if (idx === -1) return;

          if (isFav) {
            delete favorites[i.address];
          } else {
            favorites[i.address] = {
              title: i.title,
              poster: i.img || ""
            };
          }

          saveFavorites(favorites);
          Widget.reload();
        }
      };
    });
}

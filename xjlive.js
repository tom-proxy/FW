const site = 'http://api.maiyoux.com:81';
const jsonUrl = `${site}/mf/json.txt`;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1';

// 获取频道列表
async function getList() {
  const res = await $http.get({ url: jsonUrl, header: { 'User-Agent': UA } });
  const data = res.data || {};
  const list = [];

  if (!data.pingtai || !Array.isArray(data.pingtai)) return list;

  const ignore = ['卫视直播', '龙珠', '映客'];

  for (const e of data.pingtai) {
    const name = `${e.title}(${e.Number})`;
    if (ignore.some(v => name.includes(v))) continue;
    list.push({
      name,
      ext: {
        url: e.address
      }
    });
  }

  return list;
}

// 获取频道内节目列表
async function getVodList(ext) {
  const url = `${site}/mf/${ext.url}`;
  const res = await $http.get({ url, header: { 'User-Agent': UA } });
  const data = res.data || {};
  const list = [];

  if (!data.zhubo || !Array.isArray(data.zhubo)) return { list };

  for (const e of data.zhubo) {
    if (e.address && e.address.startsWith('rtmp')) continue;
    list.push({
      vod_id: e.address,
      vod_name: e.title,
      vod_pic: e.img,
      vod_remarks: 'live',
      ext: {
        url: e.address
      }
    });
  }

  return { list };
}

// 获取节目详情
async function loadDetail(ext) {
  const url = ext.url;
  return {
    list: [
      {
        title: '默认分组',
        tracks: [
          {
            name: '播放',
            ext: {
              playurl: url
            }
          }
        ]
      }
    ]
  };
}

// 获取播放链接
async function getPlayInfo(ext) {
  return {
    urls: [ext.playurl]
  };
}

export default {
  id: 'tv_live',
  title: '聚合直播',
  description: '获取热门电视直播频道',
  version: '1.0.0',
  author: '🅣🅞🅜',
  getList,
  getVodList,
  loadDetail,
  getPlayInfo
};

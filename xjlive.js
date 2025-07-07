// 聚合直播 Forward 专用版
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1';

const site = 'http://api.maiyoux.com:81';
const jsonUrl = `${site}/mf/json.txt`;

async function getList() {
  const res = await $http.get({ url: jsonUrl, header: { 'User-Agent': UA } });
  const data = res.data || {};
  const ignore = ['卫视直播', '龙珠', '映客'];
  const list = [];

  (data.pingtai || []).forEach(e => {
    const name = `${e.title}(${e.Number})`;
    if (ignore.some(v => name.includes(v))) return;
    list.push({
      name,
      ext: {
        url: e.address
      }
    });
  });

  return list;
}

async function getVodList(ext) {
  const { url, page } = ext;
  const realUrl = `${site}/mf/${url}`;
  const res = await $http.get({ url: realUrl, header: { 'User-Agent': UA } });
  const data = res.data || {};
  const list = [];

  (data.zhubo || []).forEach(e => {
    if (e.address && e.address.startsWith('rtmp')) return;
    list.push({
      vod_id: e.address,
      vod_name: e.title,
      vod_pic: e.img,
      vod_remarks: 'live',
      ext: {
        url: e.address
      }
    });
  });

  return {
    list
  };
}

async function loadDetail(ext) {
  const url = ext.url;
  return {
    list: [
      {
        title: "默认分组",
        tracks: [
          {
            name: "播放",
            ext: {
              playurl: url
            }
          }
        ]
      }
    ]
  };
}

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

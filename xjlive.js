{
  "id": "聚合直播",
  "title": "聚合直播",
  "description": "获取频道列表",
  "requiredVersion": "0.0.1",
  "version": "0.0.1",
  "author": "🅣🅞🅜"
}

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1';

const appConfig = {
  ver: 1,
  title: '聚合直播',
  site: 'http://api.maiyoux.com:81',
};

async function getConfig() {
  let config = appConfig;
  config.tabs = await getTabs();
  return jsonify(config);
}

async function getTabs() {
  const list = [];
  const ignore = ['卫视直播', '龙珠', '映客'];

  function isIgnoreClassName(className) {
    return ignore.some(element => className.includes(element));
  }

  const jsonurl = `${appConfig.site}/mf/json.txt`;
  const { data } = await $fetch.get(jsonurl, {
    headers: {
      'User-Agent': UA,
    },
  });

  const res = argsify(data);
  if (!res.pingtai || !Array.isArray(res.pingtai)) return list;

  res.pingtai.forEach(e => {
    const name = `${e.title}(${e.Number})`;
    const href = e.address;
    if (isIgnoreClassName(name)) return;

    list.push({
      name,
      ext: {
        url: encodeURI(href),
      },
    });
  });

  return list;
}

async function getList(ext) {
  ext = argsify(ext);
  const cards = [];
  const jsonurl = ext.url || '';
  const page = ext.page || 1;

  if (!jsonurl) return jsonify({ list: cards });

  let url = '';
  if (page === 1) {
    url = `${appConfig.site}/mf/${jsonurl}`;
  }

  if (!url) return jsonify({ list: cards });

  const { data } = await $fetch.get(url, {
    headers: {
      'User-Agent': UA,
    },
  });

  const res = argsify(data);
  if (!res.zhubo || !Array.isArray(res.zhubo)) return jsonify({ list: cards });

  res.zhubo.forEach(e => {
    const cover = e.img;
    const address = e.address;
    if (!address || address.startsWith('rtmp')) return;

    cards.push({
      vod_id: address,
      vod_name: e.title,
      vod_pic: cover,
      vod_remarks: 'live',
      ext: {
        url: address,
      },
    });
  });

  return jsonify({ list: cards });
}

async function loadDetail(ext) {
  ext = argsify(ext);
  const url = ext.url || '';
  const tracks = [];

  if (url) {
    tracks.push({
      name: '播放',
      ext: {
        playurl: url,
      },
    });
  }

  return jsonify({
    list: [
      {
        title: '默认分组',
        tracks,
      },
    ],
  });
}

async function getPlayUrl(ext) {
  ext = argsify(ext);
  const playurl = ext.playurl || '';

  return jsonify({
    urls: [playurl],
  });
}

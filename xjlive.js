{
  "id": "聚合直播",
  "title": "聚合直播",
  "description": "获取频道列表",
  "requiredVersion": "0.0.1",
  "version": "0.0.1",
  "author": "🅣🅞🅜"
}

const site = 'http://api.maiyoux.com:81';
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1';

async function getConfig() {
  const tabs = await getTabs();
  return jsonify({
    tabs: tabs
  });
}

async function getTabs() {
  const tabs = [];
  const ignore = ['卫视直播', '龙珠', '映客'];
  const url = `${site}/mf/json.txt`;

  const res = await http.get({
    url: url,
    headers: {
      'User-Agent': UA
    }
  });

  const data = res.data || {};
  const pingtai = argsify(data).pingtai || [];

  pingtai.forEach(e => {
    const name = `${e.title}(${e.Number})`;
    if (ignore.some(i => name.includes(i))) return;
    tabs.push({
      name: name,
      ext: {
        url: encodeURIComponent(e.address)
      }
    });
  });

  return tabs;
}

async function getList(ext) {
  ext = argsify(ext);
  const address = decodeURIComponent(ext.url || '');
  const url = `${site}/mf/${address}`;

  const res = await http.get({
    url: url,
    headers: {
      'User-Agent': UA
    }
  });

  const data = res.data || {};
  const zhubo = argsify(data).zhubo || [];

  const list = zhubo
    .filter(e => e.address && !e.address.startsWith('rtmp'))
    .map(e => ({
      vod_id: e.address,
      vod_name: e.title,
      vod_pic: e.img,
      vod_remarks: 'live',
      ext: {
        url: e.address
      }
    }));

  return jsonify({
    list: list
  });
}

async function loadDetail(ext) {
  ext = argsify(ext);
  const url = ext.url;

  const tracks = [
    {
      name: '播放',
      ext: {
        playurl: url
      }
    }
  ];

  return jsonify({
    list: [
      {
        title: '默认分组',
        tracks: tracks
      }
    ]
  });
}

async function getPlayUrl(ext) {
  ext = argsify(ext);
  const playurl = ext.playurl;

  return jsonify({
    urls: [playurl]
  });
}

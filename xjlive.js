{
  "id": "聚合直播",
  "title": "聚合直播",
  "description": "获取频道列表",
  "requiredVersion": "0.0.1",
  "version": "0.0.1",
  "author": "🅣🅞🅜"
}

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1';

const site = 'http://api.maiyoux.com:81';

async function getConfig() {
  const tabs = await getTabs();
  return jsonify({
    tabs
  });
}

async function getTabs() {
  const tabs = [];
  const ignoreList = ['卫视直播', '龙珠', '映客'];
  const url = `${site}/mf/json.txt`;

  const res = await http.get({
    url: url,
    headers: {
      'User-Agent': UA
    }
  });

  const data = res.data || {};
  const platforms = argsify(data).pingtai || [];

  platforms.forEach(item => {
    const name = `${item.title}(${item.Number})`;
    if (ignoreList.some(ignore => name.includes(ignore))) return;

    tabs.push({
      name: name,
      ext: {
        url: encodeURIComponent(item.address)
      }
    });
  });

  return tabs;
}

async function getList(ext) {
  ext = argsify(ext);
  const url = `${site}/mf/${ext.url}`;
  const res = await http.get({
    url: url,
    headers: {
      'User-Agent': UA
    }
  });

  const data = res.data || {};
  const zhuboList = argsify(data).zhubo || [];

  const list = zhuboList
    .filter(item => !item.address.startsWith('rtmp'))
    .map(item => ({
      vod_id: item.address,
      vod_name: item.title,
      vod_pic: item.img,
      vod_remarks: 'live',
      ext: {
        url: item.address
      }
    }));

  return jsonify({
    list
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
        tracks
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

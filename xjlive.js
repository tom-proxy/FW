/*
{
  "id": "jhzhibo",
  "title": "聚合直播",
  "description": "聚合直播频道",
  "requiredVersion": "0.0.1",
  "version": "1.0.0",
  "author": "🅣🅞🅜"
}
*/

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1';

const siteUrl = 'http://api.maiyoux.com:81';
const jsonUrl = `${siteUrl}/mf/json.txt`;

async function getConfig() {
  const tabs = await getTabs();
  return jsonify({
    tabs
  });
}

async function getTabs() {
  const ignoreList = ['卫视直播', '龙珠', '映客'];
  const { data } = await $fetch.get(jsonUrl, {
    headers: {
      'User-Agent': UA
    }
  });

  const pingtai = argsify(data).pingtai || [];
  const tabs = pingtai
    .filter(e => !ignoreList.some(ignore => e.title.includes(ignore)))
    .map(e => ({
      name: `${e.title}(${e.Number})`,
      ext: {
        url: encodeURI(e.address)
      }
    }));

  return tabs;
}

async function getList(ext) {
  const { url, page = 1 } = argsify(ext);
  const realUrl = `${siteUrl}/mf/${url}`;
  const { data } = await $fetch.get(realUrl, {
    headers: {
      'User-Agent': UA
    }
  });

  const zhubo = argsify(data).zhubo || [];
  const list = zhubo
    .filter(e => !e.address.startsWith('rtmp'))
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
    list
  });
}

async function getDetail(ext) {
  const { url } = argsify(ext);
  const tracks = [{
    name: '播放',
    ext: {
      playurl: url
    }
  }];

  return jsonify({
    list: [{
      title: '默认分组',
      tracks
    }]
  });
}

async function getPlayer(ext) {
  const { playurl } = argsify(ext);
  return jsonify({
    urls: [playurl]
  });
}

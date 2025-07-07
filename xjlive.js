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

const siteUrl = 'http://api.maiyoux.com:81';
const jsonUrl = `${siteUrl}/mf/json.txt`;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0.1 Mobile/15E148 Safari/604.1';

// 配置菜单
async function getConfig() {
  const tabs = await getTabs();
  return {
    tabs: tabs.length ? tabs : [{ name: '默认', ext: { url: 'jsonweishizhibo.txt' } }]
  };
}

// 获取频道
async function getTabs() {
  const res = await $fetch.get(jsonUrl, { headers: { 'User-Agent': UA } });
  const data = res?.data?.pingtai || [];

  const ignore = ['卫视直播', '龙珠', '映客'];

  const tabs = data
    .filter(item => !ignore.some(str => item.title.includes(str)))
    .map(item => ({
      name: `${item.title}(${item.Number})`,
      ext: { url: item.address }
    }));

  return tabs;
}

// 获取列表
async function getList(ext) {
  const { url } = argsify(ext);
  const api = `${siteUrl}/mf/${url}`;
  const res = await $fetch.get(api, { headers: { 'User-Agent': UA } });
  const zhubo = res?.data?.zhubo || [];

  const list = zhubo
    .filter(i => i.address && !i.address.startsWith('rtmp'))
    .map(i => ({
      vod_id: i.address,
      vod_name: i.title,
      vod_pic: i.img,
      vod_remarks: 'live',
      ext: { url: i.address }
    }));

  return { list: list.length ? list : [] };
}

// 获取详情
async function getDetail(ext) {
  const { url } = argsify(ext);
  return {
    list: [{
      title: '播放源',
      tracks: [
        {
          name: '播放',
          ext: { playurl: url }
        }
      ]
    }]
  };
}

// 播放接口
async function getPlayer(ext) {
  const { playurl } = argsify(ext);
  return {
    urls: [playurl]
  };
}

# 查询推荐音乐人

## 链接

- GET https://api.bilibili.com/x/centralization/interface/musician/list

## 查询参数

level_source
- 1：全部

## 返回参数

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "musicians": [
      {
        "id": 413,
        "aid": "115213068143231",
        "bvid": "BV1YspyzWE3m",
        "archive_count": 201,
        "fans_count": 198101,
        "cover": "http://i0.hdslb.com/bfs/archive/5475f03191f04eb5e8eb5bfdc241b94c892db1ce.jpg",
        "desc": "歌手任然",
        "duration": 81,
        "pub_time": 1758168000,
        "danmu_count": 0,
        "self_intro": "",
        "title": "任然『春山空』",
        "uid": "1490901245",
        "vt_display": "",
        "vv_count": 1832,
        "is_vt": 0,
        "username": "音乐人任然",
        "user_profile": "https://i2.hdslb.com/bfs/face/b3688869c2df9d5857635075e806e6cd2108cecd.jpg",
        "user_level": 6,
        "lightning": 0
      }
    ]
  }
}
```
# 更多音乐推荐

## 链接

- GET https://api.bilibili.com/x/centralization/interface/music/comprehensive/web/rank

## 请求参数

- pn：页码，默认1
- ps：每页数量，默认20
- web_location：默认 333.1351

## 响应参数

```json
{
  "code": 0,
  "message": "0",
  "ttl": 1,
  "data": {
    "list": [
      {
        "music_title": "I Met A Boy",
        "music_id": "MA584087591096195920",
        "music_corner": "",
        "cid": "32447137298",
        "jump_url": "",
        "author": "Mimi Webb",
        "bvid": "BV1DFHdzjEkK",
        "album": "Confessions",
        "aid": "115182114246511",
        "id": 3593581,
        "cover": "https://i0.hdslb.com/bfs/station_src/music_metadata/818427c4cc33fa871f5d04ce78e737fd.jpg",
        "score": 212,
        "related_archive": {
          "aid": "115219862986158",
          "bvid": "BV1Nhp4z4EVa",
          "cid": "115219862986158",
          "cover": "http://i0.hdslb.com/bfs/archive/f7ebcb9872c4926a472a4f1a0cb8f73c9c89bc13.jpg",
          "title": "【MV】【Mimi Webb】「I Met A Boy」",
          "uid": 384580074,
          "username": "fallinforjulia",
          "vt_display": "",
          "vv_count": 75,
          "is_vt": 0,
          "fname": "MV",
          "duration": 179
        }
      }
    ]
  }
}
```

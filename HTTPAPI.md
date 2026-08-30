# BBPlayer HTTP API 清单（请求方式 + 返回示例）

> 基于 `bbplayer-app/BBPlayer` 仓库 `dev` 分支源码挖掘整理。

---

## 一、BBPlayer 自建后端 API

**Base URL**：`https://be.bbplayer.roitium.com`

**鉴权**：除标注"公开"的接口外，均需 `Authorization: Bearer <JWT>`

**通用错误响应**：

```json
{ "error": "invalid_body", "summary": "字段校验错误摘要" }   // 400
{ "error": "Unauthorized" }                                  // 401 未携带token
{ "error": "Invalid or expired token" }                      // 401 token无效
{ "error": "Forbidden" }                                     // 403 权限不足
```

---

### 1. 注册账号

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/auth/register` |
| **鉴权** | 公开 |
| **Content-Type** | `application/json` |

**请求体**

```json
{
  "username": "abc",        // 必填，>=3字符，服务端 trim+lowercase
  "password": "12345678",   // 必填，>=8字符
  "name": "显示名",          // 可选，缺省用 username
  "face": "https://..."     // 可选，头像URL
}
```

**成功响应** `200`

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1dWlk...",
  "account": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "abc",
    "name": "显示名",
    "face": "https://..."
  }
}
```

**错误**

| 状态码 | error | 说明 |
|--------|-------|------|
| 400 | `invalid_body` | 参数校验失败 |
| 409 | `username_already_exists` | 用户名已占用 |

---

### 2. 登录

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/auth/login` |
| **鉴权** | 公开 |
| **Content-Type** | `application/json` |

**请求体**

```json
{
  "username": "abc",      // 必填，>=3字符
  "password": "12345678"  // 必填，>=8字符
}
```

**成功响应** `200`

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "account": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "abc",
    "name": "显示名",
    "face": null
  }
}
```

**错误**

| 状态码 | error | 说明 |
|--------|-------|------|
| 400 | `invalid_body` | 参数校验失败 |
| 401 | `invalid_credentials` | 用户名或密码错误 |

---

### 3. 获取当前用户信息

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/auth/me` |
| **鉴权** | Bearer Token |

**请求体**：无

**成功响应** `200`

```json
{
  "account": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "abc",
    "name": "显示名",
    "face": null
  }
}
```

**错误**

| 状态码 | error | 说明 |
|--------|-------|------|
| 401 | `Unauthorized` | 未携带token |
| 404 | `account_not_found` | 账号不存在 |

---

### 4. 更新个人资料

| 项目 | 内容 |
|------|------|
| **方法** | `PATCH` |
| **路径** | `/auth/profile` |
| **鉴权** | Bearer Token |
| **Content-Type** | `application/json` |

**请求体**（字段均可选，未提供则不变）

```json
{
  "name": "新名字",
  "face": "https://新头像.url"
}
```

**成功响应** `200`

```json
{
  "account": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "abc",
    "name": "新名字",
    "face": "https://新头像.url"
  }
}
```

**错误**

| 状态码 | error | 说明 |
|--------|-------|------|
| 400 | `invalid_body` | 参数校验失败 |
| 404 | `account_not_found` | 账号不存在 |

---

### 5. 健康检查

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/health` |
| **鉴权** | 公开 |

**成功响应** `200`

```json
{
  "status": "ok",
  "timestamp": 1756512000000
}
```

---

### 6. 获取我参与的所有共享歌单

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/me/playlists` |
| **鉴权** | Bearer Token |

**成功响应** `200`

```json
{
  "playlists": [
    {
      "id": "a1b2c3d4-...",
      "title": "我的歌单",
      "description": "描述文本",
      "coverUrl": null,
      "updatedAt": 1750000000000,
      "role": "owner",
      "joinedAt": 1750000000000
    },
    {
      "id": "e5f6g7h8-...",
      "title": "朋友的歌单",
      "description": null,
      "coverUrl": "https://...",
      "updatedAt": 1750100000000,
      "role": "subscriber",
      "joinedAt": 1750100000000
    }
  ]
}
```

> 注意：此接口字段为 **camelCase**（`coverUrl`、`updatedAt`、`role`、`joinedAt`），与 `/playlists` 下的 snake_case 不同。

---

### 7. 歌单预览（公开）

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/playlists/:id/preview` |
| **鉴权** | 公开 |

**成功响应** `200`

```json
{
  "playlist": {
    "id": "a1b2c3d4-...",
    "title": "歌单标题",
    "description": null,
    "cover_url": null,
    "created_at": 1750000000000,
    "updated_at": 1750000000000,
    "track_count": 42
  },
  "owner": {
    "account_id": "550e8400-...",
    "name": "abc",
    "avatar_url": null
  },
  "tracks": [
    {
      "unique_key": "bilibili:BV1xx411c7mD:123",
      "title": "歌曲名",
      "artist_name": "歌手名",
      "artist_id": null,
      "cover_url": "https://...",
      "duration": 245,
      "bilibili_bvid": "BV1xx411c7mD",
      "bilibili_cid": "123",
      "sort_key": "0000"
    }
  ],
  "preview_limit": 30
}
```

**错误**：404 `{"error":"Playlist not found"}`

---

### 8. 创建歌单

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/playlists` |
| **鉴权** | Bearer Token |
| **Content-Type** | `application/json` |

**请求体**

```json
{
  "title": "新歌单",              // 必填
  "description": "描述",          // 可选
  "cover_url": "https://...",    // 可选
  "tracks": [                    // 可选，初始曲目
    {
      "track": {
        "unique_key": "bilibili:BV1xx411c7mD:123",
        "title": "歌曲名",
        "artist_name": "歌手名",
        "artist_id": "12345",
        "cover_url": "https://...",
        "duration": 245,
        "bilibili_bvid": "BV1xx411c7mD",
        "bilibili_cid": "123"
      },
      "sort_key": "0000"
    }
  ]
}
```

**成功响应** `201`

```json
{
  "playlist": {
    "id": "a1b2c3d4-...",
    "owner_id": "550e8400-...",
    "title": "新歌单",
    "description": "描述",
    "cover_url": "https://...",
    "editor_invite_code": null,
    "created_at": "2025-06-15T10:00:00.000Z",
    "updated_at": "2025-06-15T10:00:00.000Z",
    "deleted_at": null
  }
}
```

**错误**：400 `invalid_body`；401 未鉴权

---

### 9. 更新歌单元信息

| 项目 | 内容 |
|------|------|
| **方法** | `PATCH` |
| **路径** | `/playlists/:id` |
| **鉴权** | Bearer Token（仅 owner） |
| **Content-Type** | `application/json` |

**请求体**（均可选）

```json
{
  "title": "新标题",
  "description": "新描述",
  "cover_url": "https://新封面"
}
```

**成功响应** `200`

```json
{
  "playlist": {
    "id": "a1b2c3d4-...",
    "owner_id": "550e8400-...",
    "title": "新标题",
    "description": "新描述",
    "cover_url": "https://新封面",
    "editor_invite_code": "BBP-ABCD1234EFGH",
    "created_at": "2025-06-15T10:00:00.000Z",
    "updated_at": "2025-06-15T12:00:00.000Z",
    "deleted_at": null
  }
}
```

**错误**：403 `Forbidden`（非 owner）

---

### 10. 提交歌单变更（增量同步-写）

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/playlists/:id/changes` |
| **鉴权** | Bearer Token（owner / editor） |
| **Content-Type** | `application/json` |

**请求体**

```json
{
  "changes": [
    {
      "op": "upsert",
      "track": {
        "unique_key": "bilibili:BV1xx411c7mD:123",
        "title": "歌曲名",
        "artist_name": "歌手名",
        "artist_id": "12345",
        "cover_url": "https://...",
        "duration": 245,
        "bilibili_bvid": "BV1xx411c7mD",
        "bilibili_cid": "123"
      },
      "sort_key": "0001",
      "operation_at": 1750000000000
    },
    {
      "op": "remove",
      "track_unique_key": "bilibili:BV1xx411c7mD:456",
      "operation_at": 1750000001000
    },
    {
      "op": "reorder",
      "track_unique_key": "bilibili:BV1xx411c7mD:123",
      "sort_key": "0002",
      "operation_at": 1750000002000
    }
  ]
}
```

**成功响应** `200`

```json
{
  "applied_at": 1750000003000
}
```

**错误**

| 状态码 | error | 说明 |
|--------|-------|------|
| 400 | `changes array is required` | changes 为空数组 |
| 403 | `Forbidden` | 非 owner/editor（subscriber 禁止） |

---

### 11. 拉取歌单变更（增量同步-读）

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/playlists/:id/changes?since=<ms>` |
| **鉴权** | Bearer Token（owner / editor / subscriber 均可） |

**Query 参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `since` | integer (ms) | 毫秒时间戳，返回此时间之后的变更 |

**成功响应** `200`

```json
{
  "metadata": {
    "title": "更新后的标题",
    "description": "更新后的描述",
    "cover_url": "https://...",
    "updated_at": 1750000500000
  },
  "tracks": [
    {
      "op": "upsert",
      "track": {
        "unique_key": "bilibili:BV1xx411c7mD:123",
        "title": "歌曲名",
        "artist_name": "歌手名",
        "artist_id": null,
        "cover_url": null,
        "duration": 245,
        "bilibili_bvid": "BV1xx411c7mD",
        "bilibili_cid": "123"
      },
      "sort_key": "0001",
      "updated_at": 1750000000000
    },
    {
      "op": "delete",
      "track_unique_key": "bilibili:BV1xx411c7mD:456",
      "deleted_at": 1750000001000
    }
  ],
  "members": [
    {
      "account_id": "550e8400-...",
      "role": "owner",
      "name": "abc",
      "avatar_url": null
    },
    {
      "account_id": "661f9511-...",
      "role": "editor",
      "name": "editor_user",
      "avatar_url": "https://..."
    }
  ],
  "has_more": false,
  "server_time": 1750000500000
}
```

> `metadata` 仅在歌单 `updated_at > since` 时非 null；`members` 仅含 owner + editor。

**错误**：404 歌单不存在；403 非成员

---

### 12. 订阅歌单（加入）

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/playlists/:id/subscribe` |
| **鉴权** | Bearer Token |
| **Content-Type** | `application/json` |

**请求体**

```json
{
  "invite_code": "BBP-ABCD1234EFGH"  // 可选，匹配则授予 editor
}
```

**成功响应**（新 subscriber）`201`

```json
{
  "role": "subscriber",
  "already_member": false
}
```

**成功响应**（带邀请码新成员 → editor）`201`

```json
{
  "role": "editor",
  "already_member": false
}
```

**成功响应**（已成员 subscriber 升级）`200`

```json
{
  "role": "editor",
  "already_member": true,
  "upgraded": true
}
```

**成功响应**（已成员，无需升级）`200`

```json
{
  "role": "owner",
  "already_member": true
}
```

**错误**：404 `Playlist not found`

---

### 13. 获取编辑者邀请码

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/playlists/:id/invite` |
| **鉴权** | Bearer Token（仅 owner） |

**成功响应** `200`

```json
{
  "editor_invite_code": "BBP-ABCD1234EFGH"
}
```

> 邀请码格式：`BBP-` + 12位随机字符（字符集 `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`）

**错误**：403 `Forbidden`（非 owner）；404 歌单不存在

---

### 14. 旋转（重置）邀请码

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/playlists/:id/invite/rotate` |
| **鉴权** | Bearer Token（仅 owner） |

**请求体**：无

**成功响应** `200`

```json
{
  "editor_invite_code": "BBP-NEWCODE12345"
}
```

**错误**：403 `Forbidden`；404 歌单不存在；503 碰撞重试

---

### 15. 删除歌单

| 项目 | 内容 |
|------|------|
| **方法** | `DELETE` |
| **路径** | `/playlists/:id` |
| **鉴权** | Bearer Token（仅 owner） |

**请求体**：无

**成功响应** `200`

```json
{
  "deleted": true
}
```

> 软删除：设置 `deleted_at`，同时物理删除所有成员关系。

**错误**：403 `Forbidden`（非 owner）

---

### 16. 获取歌单成员列表

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/playlists/:id/members` |
| **鉴权** | Bearer Token（owner / editor） |

**成功响应** `200`

```json
{
  "members": [
    {
      "account_id": "550e8400-...",
      "role": "owner",
      "name": "abc",
      "avatar_url": null,
      "joined_at": 1750000000000
    },
    {
      "account_id": "661f9511-...",
      "role": "editor",
      "name": "editor_user",
      "avatar_url": "https://...",
      "joined_at": 1750000100000
    },
    {
      "account_id": "772a0622-...",
      "role": "subscriber",
      "name": "listener",
      "avatar_url": null,
      "joined_at": 1750000200000
    }
  ]
}
```

**错误**：403 `Forbidden`（subscriber 无权）

---

### 17. 退出歌单

| 项目 | 内容 |
|------|------|
| **方法** | `DELETE` |
| **路径** | `/playlists/:id/members/me` |
| **鉴权** | Bearer Token（subscriber / editor） |

**成功响应** `200`

```json
{
  "removed": true
}
```

**错误**：400 `{"error":"Owner cannot leave; use DELETE /:id to delete the playlist"}`

## 二、B站 API（登录 / 播放列表 / 播放相关）

**Base URL**：`https://api.bilibili.com`（passport 接口为 `https://passport.bilibili.com`）

**通用请求头**：

```
Cookie: SESSDATA=xxx; bili_jct=xxx; DedeUserID=xxx
User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 BiliApp/6.66.0
Referer: https://www.bilibili.com/
Origin: https://www.bilibili.com
```

**通用响应包裹**：`{ "code": 0, "message": "0", "data": {...} }`，`code !== 0` 即失败。

**CSRF**：需写操作（POST + csrf）的接口从 Cookie 的 `bili_jct` 字段取值，追加到请求体 `csrf` 参数。

**WBI 签名**：标注 `[WBI]` 的接口需追加 `wts`（秒级时间戳）+ `w_rid`（md5 签名）参数。

---

### 18. 获取登录二维码

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `https://passport.bilibili.com/x/passport-login/web/qrcode/generate` |
| **鉴权** | 公开 |

**请求参数**：无

**成功响应**

```json
{
  "code": 0,
  "message": "0",
  "data": {
    "url": "https://passport.bilibili.com/h5-app/passport/login/scan?navhide=1&qrcode_key=abc123",
    "qrcode_key": "abc123"
  }
}
```

---

### 19. 轮询二维码登录状态

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `https://passport.bilibili.com/x/passport-login/web/qrcode/poll` |
| **鉴权** | 公开 |

**Query 参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| `qrcode_key` | string | 上一步返回的 key |

**成功响应**（等待扫码）

```json
{
  "code": 0,
  "data": { "code": 86101, "url": "" }
}
```

**成功响应**（扫码成功）

```json
{
  "code": 0,
  "data": {
    "code": 0,
    "url": "https://passport.bilibili.com/x/passport-login/web/crossDomain?...",
    "refresh_token": "xxx",
    "timestamp": 1750000000
  }
}
```

> 登录成功的 Cookie 从**响应头 `Set-Cookie`** 获取。

**data.code 状态码**

| code | 含义 |
|------|------|
| `86101` | 等待扫码 |
| `86090` | 已扫码未确认 |
| `0` | 登录成功 |
| `86038` | 二维码过期 |

---

### 20. 获取图形验证 token（短信登录前置）

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `https://passport.bilibili.com/x/passport-login/captcha` |
| **鉴权** | 公开 |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `source` | `main_web` |
| `t` | 当前毫秒时间戳 |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "token": "captcha_token_xxx",
    "geetest": { "gt": "xxx", "challenge": "xxx" },
    "tencent": { "appid": "xxx" }
  }
}
```

---

### 21. 发送短信验证码

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `https://passport.bilibili.com/x/passport-login/web/sms/send` |
| **鉴权** | 公开 |
| **Content-Type** | `application/x-www-form-urlencoded` |

**请求体**（form-urlencoded）

```
cid=86&tel=13800138000&source=main_mini_login&token=captcha_token_xxx&challenge=xxx&validate=xxx&seccode=xxx
```

**成功响应**

```json
{
  "code": 0,
  "data": { "captcha_key": "sms_captcha_key_xxx" }
}
```

---

### 22. 短信验证码登录

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `https://passport.bilibili.com/x/passport-login/web/login/sms` |
| **鉴权** | 公开 |
| **Content-Type** | `application/x-www-form-urlencoded` |

**请求体**

```
cid=86&tel=13800138000&code=123456&source=main_mini_login&captcha_key=sms_captcha_key_xxx&keep=1
```

**成功响应**

```json
{
  "code": 0,
  "data": {
    "status": 0,
    "message": "",
    "url": "https://passport.bilibili.com/...",
    "mid": 12345678,
    "access_token": "xxx",
    "refresh_token": "xxx",
    "expires_in": 15552000,
    "token_info": {
      "mid": 12345678,
      "access_token": "xxx",
      "refresh_token": "xxx",
      "expires_in": 15552000
    }
  }
}
```

> Cookie 从**响应头 `Set-Cookie`** 获取。

---

### 23. 获取登录用户信息

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/space/myinfo` |
| **鉴权** | Cookie (SESSDATA) |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "mid": 12345678,
    "name": "用户昵称",
    "face": "https://i0.hdslb.com/bfs/face/xxx.jpg",
    "sign": "个人签名"
  }
}
```

---

### 24. 获取他人用户信息 [WBI]

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/space/wbi/acc/info` |
| **鉴权** | 可选 Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `mid` | 目标用户 mid |
| `wts` | 秒级时间戳 |
| `w_rid` | WBI 签名 |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "mid": 12345678,
    "name": "用户昵称",
    "face": "https://...",
    "sign": "签名"
  }
}
```

---

### 25. 获取用户收藏夹列表（播放列表）

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/v3/fav/folder/created/list-all` |
| **鉴权** | Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `up_mid` | 用户 mid |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 100001,
        "title": "我的收藏夹",
        "media_count": 42,
        "fav_state": 0
      },
      {
        "id": 100002,
        "title": "音乐收藏",
        "media_count": 10,
        "fav_state": 0
      }
    ]
  }
}
```

---

### 26. 获取某视频的收藏状态

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/v3/fav/folder/created/list-all` |
| **鉴权** | Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `up_mid` | 用户 mid |
| `rid` | 视频 avid |
| `type` | `2`（视频） |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "list": [
      { "id": 100001, "title": "收藏夹A", "media_count": 42, "fav_state": 1 },
      { "id": 100002, "title": "收藏夹B", "media_count": 10, "fav_state": 0 }
    ]
  }
}
```

---

### 27. 获取收藏夹内容（分页）

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/v3/fav/resource/list` |
| **鉴权** | Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `media_id` | 收藏夹 ID |
| `pn` | 页码（从1开始） |
| `ps` | 每页条数（客户端用 `40`） |
| `keyword` | 可选，搜索关键词 |
| `type` | 可选，`0`=仅当前收藏夹，`1`=全局搜索 |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "info": {
      "id": 100001,
      "title": "我的收藏夹",
      "cover": "https://...",
      "media_count": 42,
      "intro": "简介",
      "upper": { "name": "UP主", "face": "https://...", "mid": 123 }
    },
    "medias": [
      {
        "id": 10086,
        "bvid": "BV1xx411c7mD",
        "upper": { "mid": 1, "name": "UP主", "face": "https://..." },
        "title": "视频标题",
        "cover": "https://...",
        "duration": 245,
        "pubdate": 1750000000,
        "page": 1,
        "type": 2,
        "attr": 0
      }
    ],
    "has_more": true,
    "ttl": 1
  }
}
```

---

### 28. 获取收藏夹所有内容 ID

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/v3/fav/resource/ids` |
| **鉴权** | Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `media_id` | 收藏夹 ID |

**成功响应**

```json
{
  "code": 0,
  "data": [
    { "id": 10086, "bvid": "BV1xx411c7mD", "type": 2 },
    { "id": 10087, "bvid": "BV1xx411c7mE", "type": 2 }
  ]
}
```

> 客户端过滤 `type === 2`（视频稿件）后使用。

---

### 29. 创建收藏夹

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/x/v3/fav/folder/add` |
| **鉴权** | Cookie + CSRF |
| **Content-Type** | `application/x-www-form-urlencoded` |

**请求体**

```
title=新建收藏夹&intro=简介&privacy=0&cover=&csrf=bili_jct值
```

**成功响应**

```json
{
  "code": 0,
  "data": {
    "id": 100003,
    "fid": 100003,
    "mid": 12345678,
    "title": "新建收藏夹"
  }
}
```

---

### 30. 收藏夹批量删除视频

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/x/v3/fav/resource/batch-del` |
| **鉴权** | Cookie + CSRF |
| **Content-Type** | `application/x-www-form-urlencoded` |

**请求体**

```
resources=10086:2,10087:2&media_id=100001&platform=web&csrf=bili_jct值
```

> `resources` 格式为 `<avid>:<type>`，type=2 为视频。

**成功响应**

```json
{ "code": 0, "data": 0 }
```

---

### 31. 单个视频添加/移除多个收藏夹

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/x/v3/fav/resource/deal` |
| **鉴权** | Cookie + CSRF |
| **Content-Type** | `application/x-www-form-urlencoded` |

**请求体**

```
rid=10086&add_media_ids=100001,100002&del_media_ids=100003&type=2&csrf=bili_jct值
```

**成功响应**

```json
{
  "code": 0,
  "data": {
    "prompt": false,
    "ga_data": {},
    "toast_msg": "",
    "success_num": 2
  }
}
```

---

### 32. 获取追更的合集/收藏夹列表

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/v3/fav/folder/collected/list` |
| **鉴权** | Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `pn` | 页码 |
| `ps` | 每页条数（客户端用 `20`） |
| `up_mid` | 用户 mid |
| `platform` | `web` |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 200001,
        "title": "合集名称",
        "cover": "https://...",
        "upper": { "mid": 123, "name": "UP主" },
        "media_count": 10,
        "ctime": 1750000000,
        "intro": "简介",
        "attr": 0,
        "state": 0
      }
    ],
    "count": 5,
    "has_more": false
  }
}
```

---

### 33. 获取合集完整内容

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/space/fav/season/list` |
| **鉴权** | Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `season_id` | 合集 ID |
| `ps` | 每页条数（客户端用 `20`） |
| `pn` | 页码（从1开始） |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "info": {
      "id": 200001,
      "season_type": 0,
      "title": "合集名称",
      "cover": "https://...",
      "upper": { "mid": 123, "name": "UP主" },
      "cnt_info": { "collect": 100, "play": 5000, "danmaku": 200 },
      "media_count": 10,
      "intro": "简介"
    },
    "medias": [
      {
        "id": 10086,
        "title": "视频标题",
        "cover": "https://...",
        "duration": 245,
        "pubtime": 1750000000,
        "bvid": "BV1xx411c7mD",
        "upper": { "mid": 123, "name": "UP主" },
        "cnt_info": { "collect": 10, "play": 500, "danmaku": 20 }
      }
    ]
  }
}
```

---

### 34. 获取视频详情

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/web-interface/view` |
| **鉴权** | 可选 Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `bvid` | 视频 BV 号 |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "aid": 10086,
    "bvid": "BV1xx411c7mD",
    "title": "视频标题",
    "pic": "https://...",
    "pubdate": 1750000000,
    "duration": 245,
    "desc": "视频简介",
    "owner": { "name": "UP主", "mid": 123, "face": "https://..." },
    "cid": 456,
    "pages": [
      { "part": "P1 标题", "duration": 120, "cid": 456 }
    ]
  }
}
```

---

### 35. 获取视频分P列表

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/player/pagelist` |
| **鉴权** | 可选 Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `bvid` | 视频 BV 号 |

**成功响应**

```json
{
  "code": 0,
  "data": [
    { "cid": 456, "page": 1, "part": "P1 标题", "duration": 120, "first_frame": "https://..." },
    { "cid": 789, "page": 2, "part": "P2 标题", "duration": 125, "first_frame": "https://..." }
  ]
}
```

---

### 36. 获取音频流 [WBI]

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/player/wbi/playurl` |
| **鉴权** | Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `bvid` | 视频 BV 号 |
| `cid` | 视频 CID |
| `fnval` | `4048`（DASH音频流） |
| `fnver` | `0` |
| `fourk` | `1` |
| `qlt` | 音频质量 ID |
| `voice_balance` | `1` |
| `wts` | 秒级时间戳 |
| `w_rid` | WBI 签名 |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "dash": {
      "audio": [
        { "id": 30280, "baseUrl": "https://upos-sz-mirrorhw.bilivideo.com/...", "backupUrl": ["https://..."] },
        { "id": 30232, "baseUrl": "https://...", "backupUrl": ["https://..."] }
      ],
      "dolby": {
        "type": 1,
        "audio": [
          { "id": 30251, "baseUrl": "https://...", "backupUrl": ["https://..."] }
        ]
      },
      "flac": {
        "display": true,
        "audio": { "id": 30250, "baseUrl": "https://...", "backupUrl": ["https://..."] }
      }
    },
    "durl": null,
    "volume": {
      "measured_i": -28,
      "target_i": -14,
      "multi_scene_args": {
        "high_dynamic_target_i": "-24",
        "normal_target_i": "-14",
        "undersized_target_i": "-28"
      }
    }
  }
}
```

> 优先级：Dolby > Hi-Res > 指定 qlt > 最高质量兜底；`durl` 仅用于无 dash 的老视频。

---

### 37. 获取观看历史

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/v2/history` |
| **鉴权** | Cookie |

**成功响应**

```json
{
  "code": 0,
  "data": [
    {
      "aid": 10086,
      "bvid": "BV1xx411c7mD",
      "title": "视频标题",
      "pic": "https://...",
      "pubdate": 1750000000,
      "owner": { "name": "UP主", "mid": 123, "face": "https://..." },
      "duration": 245
    }
  ]
}
```

---

### 38. 上报观看历史

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/x/v2/history/report` |
| **鉴权** | Cookie + CSRF |
| **Content-Type** | `application/x-www-form-urlencoded` |

**请求体**

```
aid=10086&cid=456&progress=120&csrf=bili_jct值
```

**成功响应**

```json
{ "code": 0, "data": 0 }
```

---

### 39. 获取稍后再看列表

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/v2/history/toview` |
| **鉴权** | Cookie |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "count": 5,
    "list": [
      {
        "aid": 10086,
        "bvid": "BV1xx411c7mD",
        "count": 1,
        "pubdate": 1750000000,
        "owner": { "mid": 123, "name": "UP主", "face": "https://..." },
        "cid": 456,
        "title": "视频标题",
        "duration": 245,
        "pic": "https://...",
        "progress": 0
      }
    ]
  }
}
```

---

### 40. 删除稍后再看

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/x/v2/history/toview/del` |
| **鉴权** | Cookie + CSRF |
| **Content-Type** | `application/x-www-form-urlencoded` |

**请求体**（二选一）

```
viewed=true&csrf=bili_jct值          # 清除所有已播放
aid=10086&csrf=bili_jct值            # 删除单个视频
```

**成功响应**

```json
{ "code": 0, "data": 0 }
```

---

### 41. 清空稍后再看

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/x/v2/history/toview/clear` |
| **鉴权** | Cookie + CSRF |

**请求体**：`csrf=bili_jct值`

**成功响应**

```json
{ "code": 0, "data": 0 }
```

---

### 42. 搜索视频 [WBI]

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/web-interface/wbi/search/type` |
| **鉴权** | 可选 Cookie |

**Query 参数**（WBI 签名）

| 参数 | 说明 |
|------|------|
| `keyword` | 搜索关键词 |
| `search_type` | `video` |
| `page` | 页码 |
| `wts` | 秒级时间戳 |
| `w_rid` | WBI 签名 |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "result": [
      {
        "aid": 10086,
        "bvid": "BV1xx411c7mD",
        "title": "搜索结果标题",
        "pic": "https://...",
        "author": "UP主",
        "duration": "04:05",
        "senddate": 1750000000,
        "mid": 123,
        "typeid": 3
      }
    ],
    "numPages": 5
  }
}
```

---

### 43. 搜索 UP 主 [WBI]

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/web-interface/wbi/search/type` |
| **鉴权** | 可选 Cookie |

**Query 参数**（WBI 签名）

| 参数 | 说明 |
|------|------|
| `keyword` | 搜索关键词 |
| `search_type` | `bili_user` |
| `page` | 页码 |
| `wts` | 秒级时间戳 |
| `w_rid` | WBI 签名 |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "result": [
      {
        "type": "bili_user",
        "mid": 123,
        "uname": "UP主名",
        "usign": "签名",
        "fans": 10000,
        "videos": 50,
        "upic": "https://...",
        "level": 6,
        "is_upuser": 1
      }
    ],
    "numPages": 3
  }
}
```

---

### 44. 获取热门搜索词

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/web-interface/search/square` |
| **鉴权** | 可选 |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `limit` | 返回条数（客户端用 `10`） |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "trending": {
      "list": [
        { "keyword": "热门词1", "show_name": "热门词1" },
        { "keyword": "热门词2", "show_name": "热门词2" }
      ]
    }
  }
}
```

---

### 45. 获取搜索建议

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `https://s.search.bilibili.com/main/suggest` |
| **鉴权** | 公开（独立域名） |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `main_ver` | `v1` |
| `term` | 搜索词 |
| `userid` | 可选，用户 mid |

**成功响应**

```json
{
  "code": 0,
  "result": {
    "tag": [
      { "term": "建议词1", "value": "建议词1", "ref": 100, "name": "建议词1", "spid": 0, "type": "video" }
    ]
  }
}
```

---

### 46. 获取分区热门视频

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/web-interface/ranking/v2` |
| **鉴权** | 可选 |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `rid` | 分区 ID |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "aid": 10086,
        "bvid": "BV1xx411c7mD",
        "title": "热门视频",
        "pic": "https://...",
        "pubdate": 1750000000,
        "duration": 245,
        "desc": "简介",
        "owner": { "name": "UP主", "mid": 123, "face": "https://..." },
        "cid": 456,
        "pages": []
      }
    ]
  }
}
```

---

### 47. 获取用户投稿视频 [WBI]

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/space/wbi/arc/search` |
| **鉴权** | 可选 Cookie |

**Query 参数**（WBI 签名）

| 参数 | 说明 |
|------|------|
| `mid` | 用户 mid |
| `pn` | 页码 |
| `ps` | 每页条数（客户端用 `30`） |
| `keyword` | 可选，搜索关键词 |
| `wts` | 秒级时间戳 |
| `w_rid` | WBI 签名 |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "page": { "pn": 1, "ps": 30, "count": 100 },
    "list": {
      "vlist": [
        {
          "aid": 10086,
          "bvid": "BV1xx411c7mD",
          "title": "视频标题",
          "pic": "https://...",
          "created": 1750000000,
          "length": "04:05",
          "author": "UP主"
        }
      ]
    }
  }
}
```

---

### 48. 获取评论列表

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/v2/reply/main` |
| **鉴权** | 可选 Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `oid` | 视频 avid |
| `type` | `1`（视频） |
| `mode` | 排序：`3`热度，`2`时间 |
| `next` | 游标（首页为 `0`） |
| `plat` | `1` |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "cursor": {
      "is_begin": true, "prev": 0, "next": 1,
      "is_end": false, "mode": 3, "all_count": 100,
      "support_mode": [2, 3]
    },
    "replies": [
      {
        "rpid": 100001,
        "oid": 10086, "type": 1, "mid": 123,
        "root": 0, "parent": 0, "dialog": 0,
        "count": 5, "rcount": 0, "like": 10,
        "ctime": 1750000000,
        "member": { "mid": "123", "uname": "用户名", "avatar": "https://...", "level_info": { "current_level": 6 } },
        "content": { "message": "评论内容", "plat": 1, "device": "" }
      }
    ],
    "top": { "upper": null, "admin": null }
  }
}
```

---

### 49. 获取楼中楼（子评论）

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/v2/reply/reply` |
| **鉴权** | 可选 Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `oid` | 视频 avid |
| `type` | `1` |
| `root` | 根评论 rpid |
| `pn` | 页码（从1开始） |
| `ps` | 每页条数（客户端用 `20`） |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "page": { "num": 1, "size": 20, "count": 5 },
    "replies": [ { "rpid": 100002, "content": { "message": "子评论" } } ],
    "root": { "rpid": 100001, "content": { "message": "根评论" } }
  }
}
```

---

### 50. 点赞/取消点赞评论

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/x/v2/reply/action` |
| **鉴权** | Cookie + CSRF |
| **Content-Type** | `application/x-www-form-urlencoded` |

**请求体**

```
oid=10086&type=1&rpid=100001&action=1&csrf=bili_jct值
```

> `action`：`1`点赞，`0`取消

**成功响应**

```json
{ "code": 0, "data": 0 }
```

---

### 51. 检查视频是否已点赞

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/web-interface/archive/has/like` |
| **鉴权** | Cookie |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `bvid` | 视频 BV 号 |

**成功响应**

```json
{ "code": 0, "data": 1 }
```

> `data`：`1`已点赞，`0`未点赞

---

### 52. 点赞/取消点赞视频

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `/x/web-interface/archive/like` |
| **鉴权** | Cookie + CSRF |
| **Content-Type** | `application/x-www-form-urlencoded` |

**请求体**

```
bvid=BV1xx411c7mD&like=1&csrf=bili_jct值
```

> `like`：`1`点赞，`2`取消

**成功响应**

```json
{ "code": 0, "data": 0 }
```

---

### 53. 获取 Web 播放器信息 [WBI]

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `/x/player/wbi/v2` |
| **鉴权** | Cookie |

**Query 参数**（WBI 签名）

| 参数 | 说明 |
|------|------|
| `bvid` | 视频 BV 号 |
| `cid` | 视频 CID |
| `wts` | 秒级时间戳 |
| `w_rid` | WBI 签名 |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "bgm_info": { "music_id": 1, "music_title": "BGM名", "jump_url": "https://..." }
  }
}
```

---

### 54. 解析 b23.tv 短链接

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `https://b23.tv/<短码>` |
| **鉴权** | 公开 |

**请求头**：B站移动端 UA

**响应**：302 重定向或 HTML（含 `<link rel="canonical">`）。客户端从 `response.url` 或 HTML 中的 canonical link 提取真实视频 URL。
## 三、网易云音乐 API

**加密方式**：`weapi` / `eapi` / `linuxapi`（客户端封装在 `netease/request.ts`）

**Base URL**：
- weapi：`https://music.163.com/weapi/<path>`
- eapi：`https://interface3.music.163.com/eapi/<path>`
- linuxapi：`https://music.163.com/api/linux/forward`

---

### 55. 获取歌单详情（eapi）

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `https://interface3.music.163.com/eapi/v6/playlist/detail` |
| **加密** | eapi（AES 加密请求体，响应体需解密） |
| **Content-Type** | `application/x-www-form-urlencoded` |

**明文参数**

```json
{ "s": "0", "id": "123456", "n": "1000", "t": "0" }
```

**成功响应**（解密后）

```json
{
  "code": 200,
  "playlist": {
    "id": 123456,
    "name": "歌单名",
    "coverImgUrl": "https://...",
    "userId": 789,
    "createTime": 1750000000000,
    "description": "歌单描述",
    "tags": ["华语", "流行"],
    "subscribedCount": 1000,
    "trackCount": 50,
    "creator": {
      "userId": 789,
      "nickname": "创建者",
      "signature": "签名",
      "avatarUrl": "https://..."
    },
    "tracks": [
      {
        "id": 10086,
        "name": "歌曲名",
        "ar": [{ "id": 1, "name": "歌手", "tns": [], "alias": [] }],
        "alia": [],
        "al": { "id": 2, "name": "专辑", "picUrl": "https://..." },
        "dt": 245000,
        "tns": []
      }
    ]
  }
}
```

---

### 56. 获取歌词（eapi）

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `https://interface3.music.163.com/eapi/api/song/lyric/v1` |
| **加密** | eapi |
| **Content-Type** | `application/x-www-form-urlencoded` |

**明文参数**

```json
{ "id": 10086, "lv": -1, "tv": -1, "rv": -1, "kv": -1, "yv": -1, "os": "ios", "ver": 1 }
```

**成功响应**（解密后）

```json
{
  "code": 200,
  "lrc": { "version": 6, "lyric": "[00:00.000]歌词内容..." },
  "tlyric": { "version": 6, "lyric": "[00:00.000]翻译歌词..." },
  "romalrc": { "version": 6, "lyric": "[00:00.000]罗马音..." },
  "yrc": { "version": 1, "lyric": "[0100,2000](0,1000,0)逐字歌词..." },
  "ytlrc": { "version": 1, "lyric": "逐字翻译..." },
  "yromalrc": { "version": 1, "lyric": "逐字罗马音..." }
}
```

> 若存在 `yrc`，优先使用 `yrc.lyric`（配套 `ytlrc`/`yromalrc`）。

---

### 57. 搜索歌曲（weapi）

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `https://music.163.com/weapi/cloudsearch/pc` |
| **加密** | weapi（AES+RSA） |
| **Content-Type** | `application/x-www-form-urlencoded` |

**明文参数**

```json
{ "type": 1, "s": "搜索关键词", "limit": 30, "offset": 0 }
```

**成功响应**（解密后）

```json
{
  "code": 200,
  "result": {
    "songs": [
      {
        "id": 10086,
        "name": "歌名",
        "ar": [{ "id": 1, "name": "歌手", "tns": [], "alias": [] }],
        "al": { "id": 2, "name": "专辑", "picUrl": "https://..." },
        "dt": 245000
      }
    ]
  }
}
```

> `type=2000` 时走 `/api/search/voice/get`，参数用 `keyword` 代替 `s`。

---

## 四、QQ音乐 API

**Base URL**：`https://u.y.qq.com`（搜索）、`https://i.y.qq.com`（歌词）、`https://c.y.qq.com`（歌单）

---

### 58. 搜索歌曲

| 项目 | 内容 |
|------|------|
| **方法** | `POST` |
| **路径** | `https://u.y.qq.com/cgi-bin/musicu.fcg` |
| **鉴权** | 公开 |
| **Content-Type** | `application/json` |

**请求体**

```json
{
  "comm": { "ct": "19", "cv": "1859", "uin": "0" },
  "req": {
    "method": "DoSearchForQQMusicDesktop",
    "module": "music.search.SearchCgiService",
    "param": {
      "grp": 1,
      "num_per_page": 10,
      "page_num": 1,
      "query": "搜索关键词",
      "search_type": 0
    }
  }
}
```

**成功响应**

```json
{
  "code": 0,
  "req": {
    "code": 0,
    "data": {
      "body": {
        "song": {
          "list": [
            {
              "id": 10086,
              "mid": "001abc",
              "name": "歌曲名",
              "title": "歌曲名",
              "singer": [{ "id": 1, "mid": "001def", "name": "歌手" }],
              "album": { "id": 2, "mid": "001ghi", "name": "专辑", "pmid": "..." },
              "interval": 245,
              "mv": { "id": 3, "vid": "v001" }
            }
          ]
        }
      }
    },
    "meta": {
      "total_num": 100,
      "num_per_page": 10,
      "curpage": 1,
      "next_page": 2
    }
  }
}
```

---

### 59. 获取歌词

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `https://i.y.qq.com/lyric/fcgi-bin/fcg_query_lyric_new.fcg` |
| **鉴权** | 公开（需 Referer） |

**请求头**

```
Referer: https://y.qq.com/
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| `songmid` | 歌曲 mid |
| `g_tk` | `5381`（固定值） |
| `format` | `json` |
| `inCharset` | `utf8` |
| `outCharset` | `utf-8` |
| `nobase64` | `1` |

**成功响应**

```json
{
  "retcode": 0,
  "code": 0,
  "subcode": 0,
  "lyric": "[00:00.00]歌词内容...",
  "trans": "[00:00.00]翻译歌词..."
}
```

> `lyric` / `trans` 为 HTML 实体编码的 LRC 文本，需用 `he.decode()` 解码。

---

### 60. 获取歌单详情

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `https://c.y.qq.com/v8/fcg-bin/fcg_v8_playlist_cp.fcg` |
| **鉴权** | 公开（需 Referer） |

**请求头**

```
Referer: http://y.qq.com
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| `id` | 歌单 ID |
| `format` | `json` |
| `newsong` | `1` |
| `platform` | `jqspaframe.json` |

**成功响应**

```json
{
  "code": 0,
  "data": {
    "cdlist": [
      {
        "disstid": "123",
        "dissname": "歌单名",
        "desc": "歌单描述",
        "songnum": 50,
        "logo": "https://...",
        "nickname": "创建者",
        "songlist": [
          {
            "id": 10086,
            "mid": "001abc",
            "name": "歌曲名",
            "singer": [{ "id": 1, "mid": "001def", "name": "歌手" }],
            "album": { "id": 2, "mid": "001ghi", "name": "专辑" },
            "interval": 245
          }
        ]
      }
    ]
  }
}
```

---

## 五、酷狗音乐 API

**Base URL**：`http://mobilecdn.kugou.com`（搜索）、`http://krcs.kugou.com`（歌词候选）、`http://lyrics.kugou.com`（歌词下载）

---

### 61. 搜索歌曲

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `http://mobilecdn.kugou.com/api/v3/search/song` |
| **鉴权** | 公开 |

**请求头**

```
User-Agent: IPhone-8990-searchSong
UNI-UserAgent: iOS11.4-Phone8990-1009-0-WiFi
```

**Query 参数**

| 参数 | 说明 |
|------|------|
| `api_ver` | `1` |
| `area_code` | `1` |
| `correct` | `1` |
| `pagesize` | 返回条数（客户端用 `10`） |
| `plat` | `2` |
| `tag` | `1` |
| `sver` | `5` |
| `showtype` | `10` |
| `page` | `1` |
| `keyword` | 搜索关键词 |
| `version` | `8990` |

**成功响应**

```json
{
  "status": 1,
  "data": {
    "info": [
      {
        "hash": "abc123",
        "filename": "歌手 - 歌名",
        "album_name": "专辑名",
        "duration": 245,
        "singername": "歌手",
        "songname": "歌名"
      }
    ],
    "total": 100
  }
}
```

---

### 62. 搜索歌词候选

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `http://krcs.kugou.com/search` |
| **鉴权** | 公开 |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `keyword` | `%20-%20`（固定） |
| `ver` | `1` |
| `hash` | 歌曲 hash |
| `client` | `mobi` |
| `man` | `yes` |

**成功响应**

```json
{
  "status": 1,
  "candidates": [
    {
      "id": "lyric_id_123",
      "accesskey": "access_key_xxx",
      "fmt": "lrc",
      "duration": 245,
      "singer": "歌手",
      "song": "歌名"
    }
  ]
}
```

---

### 63. 下载歌词

| 项目 | 内容 |
|------|------|
| **方法** | `GET` |
| **路径** | `http://lyrics.kugou.com/download` |
| **鉴权** | 公开 |

**Query 参数**

| 参数 | 说明 |
|------|------|
| `charset` | `utf8` |
| `accesskey` | 候选返回的 accesskey |
| `id` | 候选返回的 id |
| `client` | `mobi` |
| `fmt` | `lrc` |
| `ver` | `1` |

**成功响应**

```json
{
  "status": 1,
  "content": "W2ZyOmNvbW1lbnRdICAgICA=",
  "fmt": "lrc"
}
```

> `content` 为 **Base64 编码**的 LRC 歌词，需解码后使用。

---

## 附录：API 速查表

| # | 方法 | 平台 | 路径 | 鉴权 | 说明 |
|---|------|------|------|------|------|
| 1 | POST | BBPlayer | `/auth/register` | 公开 | 注册账号 |
| 2 | POST | BBPlayer | `/auth/login` | 公开 | 登录 |
| 3 | GET | BBPlayer | `/auth/me` | Bearer | 当前用户信息 |
| 4 | PATCH | BBPlayer | `/auth/profile` | Bearer | 更新资料 |
| 5 | GET | BBPlayer | `/health` | 公开 | 健康检查 |
| 6 | GET | BBPlayer | `/me/playlists` | Bearer | 我的歌单列表 |
| 7 | GET | BBPlayer | `/playlists/:id/preview` | 公开 | 歌单预览 |
| 8 | POST | BBPlayer | `/playlists` | Bearer | 创建歌单 |
| 9 | PATCH | BBPlayer | `/playlists/:id` | Bearer(owner) | 更新歌单 |
| 10 | POST | BBPlayer | `/playlists/:id/changes` | Bearer(owner/editor) | 提交变更 |
| 11 | GET | BBPlayer | `/playlists/:id/changes?since=` | Bearer | 拉取变更 |
| 12 | POST | BBPlayer | `/playlists/:id/subscribe` | Bearer | 订阅歌单 |
| 13 | GET | BBPlayer | `/playlists/:id/invite` | Bearer(owner) | 获取邀请码 |
| 14 | POST | BBPlayer | `/playlists/:id/invite/rotate` | Bearer(owner) | 旋转邀请码 |
| 15 | DELETE | BBPlayer | `/playlists/:id` | Bearer(owner) | 删除歌单 |
| 16 | GET | BBPlayer | `/playlists/:id/members` | Bearer(owner/editor) | 成员列表 |
| 17 | DELETE | BBPlayer | `/playlists/:id/members/me` | Bearer(非owner) | 退出歌单 |
| 18 | GET | B站 | `passport.../qrcode/generate` | 公开 | 获取二维码 |
| 19 | GET | B站 | `passport.../qrcode/poll` | 公开 | 轮询登录状态 |
| 20 | GET | B站 | `passport.../captcha` | 公开 | 图形验证token |
| 21 | POST | B站 | `passport.../sms/send` | 公开 | 发送验证码 |
| 22 | POST | B站 | `passport.../login/sms` | 公开 | 短信登录 |
| 23 | GET | B站 | `/x/space/myinfo` | Cookie | 登录用户信息 |
| 24 | GET | B站 | `/x/space/wbi/acc/info` | 可选 | 他人信息[WBI] |
| 25 | GET | B站 | `/x/v3/fav/folder/created/list-all` | Cookie | 收藏夹列表 |
| 26 | GET | B站 | `/x/v3/fav/folder/created/list-all` | Cookie | 视频收藏状态 |
| 27 | GET | B站 | `/x/v3/fav/resource/list` | Cookie | 收藏夹内容 |
| 28 | GET | B站 | `/x/v3/fav/resource/ids` | Cookie | 收藏夹所有ID |
| 29 | POST | B站 | `/x/v3/fav/folder/add` | Cookie+CSRF | 创建收藏夹 |
| 30 | POST | B站 | `/x/v3/fav/resource/batch-del` | Cookie+CSRF | 批量删除 |
| 31 | POST | B站 | `/x/v3/fav/resource/deal` | Cookie+CSRF | 增删收藏夹 |
| 32 | GET | B站 | `/x/v3/fav/folder/collected/list` | Cookie | 追更列表 |
| 33 | GET | B站 | `/x/space/fav/season/list` | Cookie | 合集内容 |
| 34 | GET | B站 | `/x/web-interface/view` | 可选 | 视频详情 |
| 35 | GET | B站 | `/x/player/pagelist` | 可选 | 分P列表 |
| 36 | GET | B站 | `/x/player/wbi/playurl` | Cookie | 音频流[WBI] |
| 37 | GET | B站 | `/x/v2/history` | Cookie | 观看历史 |
| 38 | POST | B站 | `/x/v2/history/report` | Cookie+CSRF | 上报历史 |
| 39 | GET | B站 | `/x/v2/history/toview` | Cookie | 稍后再看 |
| 40 | POST | B站 | `/x/v2/history/toview/del` | Cookie+CSRF | 删除稍后再看 |
| 41 | POST | B站 | `/x/v2/history/toview/clear` | Cookie+CSRF | 清空稍后再看 |
| 42 | GET | B站 | `/x/web-interface/wbi/search/type` | 可选 | 搜索视频[WBI] |
| 43 | GET | B站 | `/x/web-interface/wbi/search/type` | 可选 | 搜索UP主[WBI] |
| 44 | GET | B站 | `/x/web-interface/search/square` | 可选 | 热门搜索 |
| 45 | GET | B站 | `s.search.bilibili.com/main/suggest` | 公开 | 搜索建议 |
| 46 | GET | B站 | `/x/web-interface/ranking/v2` | 可选 | 分区热门 |
| 47 | GET | B站 | `/x/space/wbi/arc/search` | 可选 | 用户投稿[WBI] |
| 48 | GET | B站 | `/x/v2/reply/main` | 可选 | 评论列表 |
| 49 | GET | B站 | `/x/v2/reply/reply` | 可选 | 楼中楼 |
| 50 | POST | B站 | `/x/v2/reply/action` | Cookie+CSRF | 点赞评论 |
| 51 | GET | B站 | `/x/web-interface/archive/has/like` | Cookie | 检查已赞 |
| 52 | POST | B站 | `/x/web-interface/archive/like` | Cookie+CSRF | 点赞视频 |
| 53 | GET | B站 | `/x/player/wbi/v2` | Cookie | 播放器信息[WBI] |
| 54 | GET | B站 | `https://b23.tv/<短码>` | 公开 | 短链解析 |
| 55 | POST | 网易云 | `eapi/v6/playlist/detail` | eapi加密 | 歌单详情 |
| 56 | POST | 网易云 | `eapi/api/song/lyric/v1` | eapi加密 | 获取歌词 |
| 57 | POST | 网易云 | `weapi/cloudsearch/pc` | weapi加密 | 搜索歌曲 |
| 58 | POST | QQ音乐 | `u.y.qq.com/cgi-bin/musicu.fcg` | 公开 | 搜索歌曲 |
| 59 | GET | QQ音乐 | `i.y.qq.com/lyric/.../fcg_query_lyric_new.fcg` | 公开 | 获取歌词 |
| 60 | GET | QQ音乐 | `c.y.qq.com/v8/fcg-bin/fcg_v8_playlist_cp.fcg` | 公开 | 歌单详情 |
| 61 | GET | 酷狗 | `mobilecdn.kugou.com/api/v3/search/song` | 公开 | 搜索歌曲 |
| 62 | GET | 酷狗 | `krcs.kugou.com/search` | 公开 | 歌词候选 |
| 63 | GET | 酷狗 | `lyrics.kugou.com/download` | 公开 | 下载歌词 |

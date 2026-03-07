# Local Proxy Setup

本项目内置了一个最小代理层，用来解决：

- Expo Web 调用 `Sub2API` 管理接口时的 CORS
- 管理员 API Key 不直接暴露给客户端

## 启动代理

```bash
SUB2API_BASE_URL="https://x.empjs.dev" \
SUB2API_ADMIN_API_KEY="admin-xxxx" \
ALLOW_ORIGIN="http://localhost:8081" \
npm run proxy
```

默认代理地址：`http://localhost:8787`

可选环境变量：

- `PORT`：代理端口，默认 `8787`
- `ALLOW_ORIGIN`：允许的 Web 来源，默认 `*`

## 启动 Expo Web

```bash
npm run web
```

## 一条命令同时启动

```bash
SUB2API_BASE_URL="https://x.empjs.dev" \
SUB2API_ADMIN_API_KEY="admin-xxxx" \
ALLOW_ORIGIN="http://localhost:8081" \
npm run dev:web-proxy
```

## 前端填写地址

设置页里把 `Base URL` 填成：

```txt
http://localhost:8787
```

## 健康检查

打开：`http://localhost:8787/healthz`

如果返回：

```json
{
  "ok": true,
  "upstreamConfigured": true,
  "apiKeyConfigured": true
}
```

说明代理配置正常。

## API 密钥聚合接口

当前项目的管理端为了区分“用户 API 密钥”和“上游账号”，在本地代理额外提供了一个聚合接口：

- `GET /api/v1/keys`

这个接口不是直接转发上游用户态 `/api/v1/keys`，而是通过管理员接口聚合得到：

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/:id/api-keys`

支持参数：

- `page`
- `page_size`
- `search`
- `status`

适合用在内部管理台的“用户 API 密钥”列表。

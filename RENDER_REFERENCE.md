# 快速参考：Render 部署集成

## 关键配置

```javascript
// 所有 JavaScript 文件中的配置
const RENDER_API_URL = 'https://photo-wcqh.onrender.com';
const REQUEST_TIMEOUT = 20000; // 20秒
```

## 文件修改清单

### ✅ static/script.js
- [x] 添加 Render API URL 常量
- [x] 添加超时时间设置
- [x] 更新 processColor() 支持超时和备选方案
- [x] 添加纯前端处理函数
- [x] 更新下载功能支持本地和远程
- [x] 更新所有 API 调用路径

### ✅ index.html
- [x] 添加 Render API 配置
- [x] 更新 processAllColors() 函数
- [x] 添加服务器处理函数
- [x] 保留前端处理备选方案

### ✅ crop.html
- [x] 添加 Render API 配置
- [x] 添加超时设置

## 工作特性

| 功能 | 说明 |
|------|------|
| 自动故障转移 | Render 不可用自动切换前端 |
| 超时保护 | 20秒超时自动中止请求 |
| 不需用户操作 | 所有切换自动进行 |
| 两种处理模式 | 服务器 AI 模型 vs 前端 Canvas |
| 支持下载 | 本地和远程两种方式 |
| 并行处理 | 三种颜色同时处理 |

## 浏览器控制台检查方法

```javascript
// 查看当前处理模式
console.log(useServerProcessing); // true 表示用服务器，false 表示用前端

// 查看 Render API 地址
console.log(RENDER_API_URL);

// 查看请求超时设置
console.log(REQUEST_TIMEOUT);
```

## 测试 URL

- 主页（换底色）：`/index.html` 或 `/`
- 裁剪工具：`/crop.html`
- Render API：`https://photo-wcqh.onrender.com`

## 故障排查

| 问题 | 解决方案 |
|------|--------|
| API 返回 404 | 检查 Render 服务是否运行 |
| 图片无法显示 | 检查 CORS 设置 |
| 超时过于频繁 | 增加 REQUEST_TIMEOUT 值 |
| 前端处理效果差 | 这是预期的，AI 模型效果更好 |

## 依赖项

- 无新增依赖
- 使用原生 HTML5/JavaScript API
- 支持所有现代浏览器

---

**部署日期**：2025-12-03  
**部署地址**：https://photo-wcqh.onrender.com  
**备选处理**：纯前端 Canvas（自动启用）

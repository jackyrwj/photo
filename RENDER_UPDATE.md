# Render 部署更新说明

## 更新内容

已成功将前端应用更新为使用 Render 部署的 Flask API：`https://photo-wcqh.onrender.com`

### 1. 主要更改

#### A. `static/script.js`（换底色功能 - 模板版本）
- 添加了 Render API 地址配置：`const RENDER_API_URL = 'https://photo-wcqh.onrender.com'`
- 添加了请求超时设置：20秒超时
- 更新了 `processColor()` 函数，支持以下功能：
  - 优先尝试 Render API（20秒超时）
  - 如果 Render API 超时或不可用，自动切换到本地服务器
  - 如果两者都失败，使用纯前端 Canvas 处理
- 添加了 `processColorWithCanvas()` 函数用于前端处理
- 更新了所有 API 调用路径使用 Render URL
- 改进了下载功能，支持本地 Blob 和远程 URL

#### B. `index.html`（换底色功能 - 静态版本）
- 添加了 Render API 配置
- 更新了 `processAllColors()` 函数：
  - 优先尝试服务器处理（Render API）
  - 服务器处理失败后自动回到前端处理
- 添加了 `processColorsWithServer()` 函数并行处理三种颜色
- 完整保留前端纯 JavaScript 处理能力作为备选方案

#### C. `crop.html`（裁剪工具）
- 添加了 Render API 地址配置
- 添加了请求超时设置
- 保留了现有的纯前端处理能力（裁剪工具本身是客户端处理）

### 2. 工作流程

```
用户上传图片
    ↓
尝试使用 Render API (20秒超时)
    ↓
┌─ 成功 → 返回结果
├─ 超时 → 切换到本地/前端处理
└─ 错误 → 尝试本地服务器 → 失败 → 前端处理
    ↓
显示结果（来自服务器或前端处理）
```

### 3. 超时处理机制

- **请求超时时间**：20秒
- **超时行为**：
  - 自动中止 API 请求
  - 标记系统使用前端处理
  - 不再重试该次会话的服务器处理
  - 用户无需操作，自动切换

### 4. 下载功能

下载支持两种来源：
1. **Render API 处理结果**：直接从 API 服务器下载
2. **前端处理结果**：使用本地 Blob 数据下载

### 5. 向后兼容性

- 如果 Render 服务不可用，系统自动降级到前端纯 JavaScript 处理
- 前端处理对所有图片都能工作，虽然效果可能比 AI 模型处理略差
- 用户无感知的自动切换

### 6. API 端点

Render 部署服务提供以下端点：
- `POST https://photo-wcqh.onrender.com/upload` - 上传并处理图片
- `GET https://photo-wcqh.onrender.com/download/{filename}` - 下载处理结果

### 7. 测试建议

1. 测试正常上传和处理流程
2. 测试 Render API 超时情况（可以在浏览器开发者工具中模拟）
3. 测试下载功能
4. 测试网络不可用时的前端备选处理

### 8. 监控

可以通过以下方式监控：
- 浏览器控制台查看日志：
  - `useServerProcessing` 值的变化
  - 超时和错误消息
  - 处理模式（服务器 vs 前端）

## 部署说明

此更新只涉及前端代码修改，无需重新部署后端或修改现有服务配置。

所有变更都已完成并保存。

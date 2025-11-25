# Cloudflare Pages 部署指南

## 📦 部署到 Cloudflare Pages

### 方案说明

由于 Cloudflare Pages **只支持静态网站**，不支持 Python 后端，我们创建了一个**纯前端版本**：

- ✅ **文件**：`index_static.html`
- ✅ **技术**：纯 HTML + CSS + JavaScript
- ✅ **处理**：使用浏览器 Canvas API 进行图像处理
- ✅ **优势**：所有处理在本地完成，图片不会上传到服务器，更安全！

### 部署步骤

#### 方法 1：通过 Cloudflare Dashboard（推荐）

1. **登录 Cloudflare**
   - 访问 https://dash.cloudflare.com/
   - 进入 Pages 页面

2. **连接 GitHub 仓库**
   - 点击 "Create a project"
   - 选择 "Connect to Git"
   - 授权并选择你的仓库：`jackyrwj/photo`

3. **配置构建设置**
   ```
   项目名称：photo（或自定义）
   生产分支：master
   构建命令：留空（不需要构建）
   构建输出目录：/
   ```

4. **环境变量**
   - 不需要设置环境变量

5. **部署**
   - 点击 "Save and Deploy"
   - 等待部署完成（通常 1-2 分钟）

6. **访问网站**
   - 部署完成后会得到一个 URL：`https://photo.pages.dev`
   - 也可以绑定自定义域名

#### 方法 2：使用 Wrangler CLI

```bash
# 安装 Wrangler
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
wrangler pages deploy . --project-name=photo
```

### 文件结构

部署时 Cloudflare Pages 会读取以下文件：

```
/
├── index_static.html    # 主页面（纯前端版本）
├── static/
│   ├── demo/
│   │   ├── image.jpg
│   │   ├── red.jpg
│   │   └── white.jpg
│   ├── style.css        # （可选，已内联到 HTML）
│   └── script.js        # （可选，已内联到 HTML）
└── README_CLOUDFLARE.md # 本文件
```

### 重要说明

#### ⚠️ 纯前端版本 vs Python 版本

| 特性 | Python 版本 (Flask) | 纯前端版本 (HTML) |
|------|-------------------|------------------|
| 部署平台 | Vercel, Railway, Heroku | Cloudflare Pages ✅ |
| 图像处理 | OpenCV (K-means 聚类) | Canvas API (颜色替换) |
| 处理质量 | ⭐⭐⭐⭐⭐ 更精确 | ⭐⭐⭐⭐ 较好 |
| 隐私性 | 图片上传到服务器 | 本地处理，不上传 ✅ |
| 速度 | 需要网络传输 | 本地处理，更快 ✅ |
| 边缘情况 | 处理复杂背景更好 | 简单背景效果好 |

#### 💡 建议

- **Cloudflare Pages**：使用 `index_static.html`（纯前端版本）
- **更好的效果**：使用 Python 版本部署到 Vercel 或 Railway

### 自定义域名

1. 在 Cloudflare Pages 项目设置中
2. 点击 "Custom domains"
3. 添加你的域名
4. 按照提示配置 DNS

### 常见问题

**Q: 为什么不能直接部署 Flask 应用到 Cloudflare Pages？**
A: Cloudflare Pages 只支持静态网站（HTML/CSS/JS），不支持 Python 运行环境。

**Q: 纯前端版本的处理效果如何？**
A: 对于背景整洁的证件照效果很好，但不如 Python OpenCV 版本精确。

**Q: 可以同时部署两个版本吗？**
A: 可以！Python 版本部署到 Vercel，纯前端版本部署到 Cloudflare Pages。

**Q: 如何提高纯前端版本的处理质量？**
A: 可以集成 TensorFlow.js 或其他 ML 库进行更智能的背景分割。

## 🚀 其他部署选项

如果你想要更好的处理效果，建议使用 Python 版本：

### Vercel（推荐）
```bash
# 已创建 vercel.json 配置文件
vercel deploy
```

### Railway
```bash
railway login
railway init
railway up
```

### Heroku
```bash
heroku create
git push heroku master
```

## 📞 支持

如有问题，请访问：https://github.com/jackyrwj/photo/issues


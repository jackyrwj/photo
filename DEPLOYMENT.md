# 部署指南

## 🚀 推荐部署方案

### 方案 1: Railway 部署（推荐，免费）

Railway 提供每月 $5 的免费额度，支持完整的 Python 环境和 OpenCV。

#### 步骤：

1. **注册 Railway 账号**
   - 访问 https://railway.app/
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的 `photo` 仓库

3. **配置环境变量**（可选）
   - 在 Railway 项目设置中添加环境变量
   - `PORT=5000`（Railway 会自动设置）

4. **部署**
   - Railway 会自动检测 `requirements.txt` 和 `Procfile`
   - 自动安装依赖并启动应用
   - 等待部署完成（约 2-3 分钟）

5. **获取域名**
   - 在 Settings -> Networking 中生成公开域名
   - 例如：`your-app.up.railway.app`

6. **访问应用**
   - 打开生成的域名即可使用

---

### 方案 2: Render 部署（免费）

Render 提供免费的 Web Service，但有冷启动时间。

#### 步骤：

1. **注册 Render 账号**
   - 访问 https://render.com/
   - 使用 GitHub 账号登录

2. **创建 Web Service**
   - 点击 "New +" -> "Web Service"
   - 连接你的 GitHub 仓库

3. **配置服务**
   - Name: `photo-background-changer`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`

4. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成

5. **访问应用**
   - 使用 Render 提供的域名访问

---

### 方案 3: 本地部署（开发测试）

#### 步骤：

1. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

2. **运行应用**
   ```bash
   python app.py
   ```

3. **访问应用**
   - 打开浏览器访问 `http://localhost:5000`

---

## 📝 部署后的配置

### 更新前端页面

部署成功后，需要修改 `index.html` 中的 API 地址：

1. 找到 JavaScript 代码中的上传部分
2. 将 API 地址改为你的部署域名
3. 例如：`https://your-app.up.railway.app/upload`

---

## 🔧 常见问题

### Q: Railway 部署失败？
A: 检查 `requirements.txt` 中的包版本是否兼容，确保使用 `opencv-python-headless` 而不是 `opencv-python`。

### Q: 图片处理很慢？
A: 免费服务器性能有限，可以考虑升级到付费计划或优化图片大小。

### Q: 如何查看日志？
A: 在 Railway/Render 的控制台中可以查看实时日志。

---

## 💰 费用对比

| 平台 | 免费额度 | 优点 | 缺点 |
|------|---------|------|------|
| Railway | $5/月 | 部署简单，性能好 | 免费额度有限 |
| Render | 750小时/月 | 完全免费 | 有冷启动时间 |
| 本地部署 | 免费 | 无限制 | 需要自己的服务器 |

---

## 🎯 推荐选择

- **个人项目/测试**: Railway（免费额度足够）
- **长期运行**: Render（完全免费）
- **开发调试**: 本地部署


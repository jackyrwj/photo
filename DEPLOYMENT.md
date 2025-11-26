# 部署指南

## 🚀 推荐部署方案

⚠️ **注意**: Railway 免费计划已不支持 Web 应用部署，请使用以下方案。

---

### 方案 1: Hugging Face Spaces（强烈推荐，完全免费）✅

Hugging Face 提供免费的 CPU/GPU 空间，非常适合图像处理应用，无冷启动时间。

#### 步骤：

1. **注册 Hugging Face 账号**

   - 访问 https://huggingface.co/
   - 注册或使用 GitHub 账号登录

2. **创建新 Space**

   - 点击右上角头像 -> "New Space"
   - Space name: `photo-background-changer`
   - License: `MIT`
   - SDK: 选择 `Gradio`
   - 点击 "Create Space"

3. **上传文件**

   方法 A: 通过网页上传

   - 点击 "Files" 标签
   - 上传以下文件：
     - `app_gradio.py` (重命名为 `app.py`)
     - `requirements_hf.txt` (重命名为 `requirements.txt`)

   方法 B: 通过 Git（推荐）

   ```bash
   # 克隆 Space 仓库
   git clone https://huggingface.co/spaces/你的用户名/photo-background-changer
   cd photo-background-changer

   # 复制文件
   cp ../photo/app_gradio.py app.py
   cp ../photo/requirements_hf.txt requirements.txt

   # 提交并推送
   git add .
   git commit -m "Initial commit"
   git push
   ```

4. **等待部署**

   - Hugging Face 会自动构建和部署
   - 约 2-3 分钟后即可使用
   - 访问：`https://huggingface.co/spaces/你的用户名/photo-background-changer`

5. **优点**
   - ✅ 完全免费
   - ✅ 无冷启动时间
   - ✅ 自带美观的 Gradio 界面
   - ✅ 支持 GPU 加速（可选）
   - ✅ 自动 HTTPS
   - ✅ 无需信用卡

---

### 方案 2: Render 部署（免费）

Render 提供免费的 Web Service，但有冷启动时间（15 秒-1 分钟）。

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
   - Instance Type: `Free`

4. **部署**

   - 点击 "Create Web Service"
   - 等待部署完成（约 5-10 分钟）

5. **访问应用**

   - 使用 Render 提供的域名访问
   - 例如：`https://photo-background-changer.onrender.com`

6. **注意事项**
   - ⚠️ 免费计划有冷启动时间（15 秒-1 分钟）
   - ⚠️ 15 分钟无活动会自动休眠
   - ✅ 适合低流量应用

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

### Q: Hugging Face Spaces 部署失败？

A: 确保文件名正确：`app.py` 和 `requirements.txt`，并且使用 `opencv-python-headless`。

### Q: Render 部署很慢？

A: Render 免费计划构建时间较长（5-10 分钟），请耐心等待。

### Q: 图片处理很慢？

A: 免费服务器性能有限，可以考虑：

- Hugging Face 升级到 GPU Space（免费）
- 优化图片大小
- 减少聚类数量

### Q: 如何查看日志？

A:

- Hugging Face: 点击 "Logs" 标签
- Render: 在控制台中查看实时日志

### Q: Railway 为什么不能用了？

A: Railway 免费计划从 2024 年开始只支持数据库部署，不再支持 Web 应用。

---

## 💰 费用对比

| 平台         | 免费额度  | 冷启动 | 优点                     | 缺点         |
| ------------ | --------- | ------ | ------------------------ | ------------ |
| Hugging Face | 无限制    | 无     | 完全免费，性能好，有 GPU | 需要注册账号 |
| Render       | 750h/月   | 有     | 完全免费                 | 冷启动时间长 |
| ~~Railway~~  | ~~$5/月~~ | ~~无~~ | ~~性能好~~               | 不再免费     |
| 本地部署     | 免费      | 无     | 无限制                   | 需要服务器   |

---

## 🎯 推荐选择

- **最佳选择**: Hugging Face Spaces（完全免费 + 无冷启动 + 美观界面）
- **备选方案**: Render（完全免费但有冷启动）
- **开发调试**: 本地部署

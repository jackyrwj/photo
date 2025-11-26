# 🚀 快速开始 - Hugging Face Spaces 部署

## 为什么选择 Hugging Face？

- ✅ **完全免费** - 无需信用卡
- ✅ **无冷启动** - 访问速度快
- ✅ **美观界面** - Gradio 自动生成
- ✅ **支持 GPU** - 可选 GPU 加速
- ✅ **5 分钟部署** - 超级简单

---

## 📝 部署步骤（5 分钟）

### 1. 注册账号（1 分钟）

访问 https://huggingface.co/ 并注册账号（可以用 GitHub 登录）

### 2. 创建 Space（1 分钟）

1. 点击右上角头像 -> "New Space"
2. 填写信息：
   - **Space name**: `photo-background-changer`
   - **License**: `MIT`
   - **SDK**: 选择 `Gradio`
   - **Hardware**: `CPU basic (free)`
3. 点击 "Create Space"

### 3. 上传文件（2 分钟）

#### 方法 A: 网页上传（推荐新手）

1. 在 Space 页面，点击 "Files" 标签
2. 点击 "Add file" -> "Upload files"
3. 上传两个文件：
   - 将 `app_gradio.py` 重命名为 `app.py` 后上传
   - 将 `requirements_hf.txt` 重命名为 `requirements.txt` 后上传
4. 点击 "Commit changes to main"

#### 方法 B: Git 上传（推荐熟悉 Git 的用户）

```bash
# 1. 克隆你的 Space 仓库
git clone https://huggingface.co/spaces/你的用户名/photo-background-changer
cd photo-background-changer

# 2. 复制文件
cp /path/to/photo/app_gradio.py app.py
cp /path/to/photo/requirements_hf.txt requirements.txt

# 3. 提交并推送
git add .
git commit -m "Initial commit"
git push
```

### 4. 等待部署（1 分钟）

- Hugging Face 会自动构建和部署
- 在 "Logs" 标签可以看到构建进度
- 看到 "Running on local URL" 表示部署成功

### 5. 测试使用 ✅

访问你的 Space：
```
https://huggingface.co/spaces/你的用户名/photo-background-changer
```

上传证件照，选择颜色，点击处理，查看效果！

---

## 🎨 界面预览

Gradio 会自动生成美观的界面，包含：
- 📤 图片上传区域
- 🎨 颜色选择（白色/蓝色/红色/全部）
- 🖼️ 三个结果展示区域
- 💾 右键保存图片功能

---

## 🔧 高级配置（可选）

### 启用 GPU 加速

1. 在 Space 设置中
2. Settings -> Hardware -> 选择 "GPU"
3. 免费用户可以使用 T4 small GPU

### 自定义域名

1. Settings -> Rename
2. 修改 Space 名称

### 设置为私有

1. Settings -> Visibility
2. 选择 "Private"

---

## 📊 效果对比

| 特性 | 纯前端 | Hugging Face |
|------|--------|--------------|
| 背景识别 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 头发处理 | ❌ 会变色 | ✅ 不变色 |
| 边缘效果 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 处理速度 | 快 | 中等 |
| 部署难度 | 无需部署 | 5 分钟 |

---

## 🆘 遇到问题？

### 构建失败
- 检查文件名是否正确：`app.py` 和 `requirements.txt`
- 查看 Logs 标签的错误信息

### 处理很慢
- 考虑升级到 GPU Space（免费）
- 减小上传图片的尺寸

### 无法访问
- 确保 Space 是 Public
- 等待构建完成（约 1-2 分钟）

---

## 🎉 完成！

现在你有了一个：
- ✅ 完全免费的在线服务
- ✅ 效果优秀的换底色工具
- ✅ 美观的 Gradio 界面
- ✅ 可以分享给朋友使用

**下一步**：
1. 分享你的 Space 链接
2. 在 README 中添加 Space 徽章
3. 享受更好的换底色效果！

---

## 📚 相关文档

- [DEPLOYMENT.md](DEPLOYMENT.md) - 完整部署指南
- [USAGE.md](USAGE.md) - 使用说明
- [Hugging Face Spaces 文档](https://huggingface.co/docs/hub/spaces)


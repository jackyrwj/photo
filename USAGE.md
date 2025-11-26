# 使用说明

## 🎨 换底色功能说明

### 问题分析

纯前端的简单颜色替换效果不好，主要问题：
- ❌ 只能识别左上角像素作为背景色
- ❌ 无法准确区分头发和背景
- ❌ 边缘处理不自然
- ❌ 复杂背景处理效果差

### 解决方案

项目提供两种处理方式：

#### 1. 纯前端处理（默认）
- ✅ 无需服务器，完全本地处理
- ✅ 隐私安全，图片不上传
- ❌ 效果一般，适合简单背景

#### 2. 服务端处理（推荐）
- ✅ 使用 OpenCV + K-means 算法
- ✅ 背景识别更准确
- ✅ 边缘处理更自然
- ✅ 支持复杂背景
- ⚠️ 需要部署服务器

---

## 🔧 如何切换处理模式

### 方法 1: 修改配置（推荐）

编辑 `index.html` 文件，找到第 712-713 行：

```javascript
// 配置：设置为 true 使用服务端处理，false 使用纯前端处理
const USE_SERVER = false;
const SERVER_URL = "http://localhost:5000";
```

**使用服务端处理：**
```javascript
const USE_SERVER = true;
const SERVER_URL = "https://your-app.up.railway.app"; // 改为你的服务器地址
```

**使用纯前端处理：**
```javascript
const USE_SERVER = false;
```

---

## 🚀 部署服务端

### 快速部署到 Railway（推荐）

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "准备部署"
   git push origin master
   ```

2. **在 Railway 部署**
   - 访问 https://railway.app/
   - 使用 GitHub 登录
   - 点击 "New Project" -> "Deploy from GitHub repo"
   - 选择 `photo` 仓库
   - 等待自动部署（约 2-3 分钟）

3. **获取服务器地址**
   - 在 Railway 项目中，点击 Settings -> Networking
   - 点击 "Generate Domain"
   - 复制生成的域名，例如：`https://photo-production-xxxx.up.railway.app`

4. **更新前端配置**
   - 编辑 `index.html`
   - 修改 `SERVER_URL` 为你的 Railway 域名
   - 修改 `USE_SERVER = true`
   - 提交并推送更改

5. **测试**
   - 打开 `index.html`
   - 上传证件照
   - 查看处理效果

---

## 📊 效果对比

| 处理方式 | 背景识别 | 边缘处理 | 复杂背景 | 处理速度 | 隐私性 |
|---------|---------|---------|---------|---------|--------|
| 纯前端 | ⭐⭐ | ⭐⭐ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 服务端 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🔍 技术细节

### 纯前端算法
```javascript
// 简单的颜色距离计算
const diff = Math.sqrt(
  Math.pow(r - bgR, 2) + 
  Math.pow(g - bgG, 2) + 
  Math.pow(b - bgB, 2)
);
```

### 服务端算法
```python
# K-means 聚类分割背景
cv.kmeans(data, num_clusters=4, ...)
# 形态学处理优化边缘
cv.erode(mask, se, mask)
cv.GaussianBlur(mask, (5, 5), 0)
# Alpha 融合生成自然过渡
alpha = mask.astype(np.float32) / 255
new_image = fg + bg_part
```

---

## 💡 建议

1. **开发测试阶段**：使用纯前端处理，快速迭代
2. **生产环境**：部署服务端，提供更好的用户体验
3. **混合方案**：提供开关让用户选择处理方式

---

## 🆘 常见问题

### Q: 为什么纯前端效果不好？
A: 纯前端只能做简单的颜色替换，无法智能识别背景区域。服务端使用机器学习算法（K-means）可以更准确地分割背景。

### Q: 服务端处理安全吗？
A: 图片上传到服务器处理后会立即删除，不会保存。但如果对隐私要求极高，建议使用纯前端处理。

### Q: 可以同时提供两种方式吗？
A: 可以！在页面上添加一个开关，让用户选择使用哪种处理方式。

### Q: Railway 免费额度够用吗？
A: Railway 每月提供 $5 免费额度，对于个人项目和小流量网站完全够用。

---

## 📝 下一步

1. 查看 [DEPLOYMENT.md](DEPLOYMENT.md) 了解详细部署步骤
2. 部署服务端到 Railway
3. 更新 `index.html` 配置
4. 测试效果
5. 享受更好的换底色体验！


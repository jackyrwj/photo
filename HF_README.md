---
title: 证件照换底色
emoji: 🎨
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
---

# 🎨 证件照换底色工具

使用 OpenCV K-means 算法智能识别背景并更换颜色。

## ✨ 功能特点

- ✅ **智能背景识别** - 使用 K-means 聚类算法
- ✅ **多种颜色** - 支持白色、蓝色、红色背景
- ✅ **边缘平滑** - 高斯模糊处理，效果自然
- ✅ **保护头发** - 不会改变头发颜色
- ✅ **纯前端处理** - 图片不上传服务器（在 Gradio 中处理）

## 🎯 使用方法

1. 📤 上传证件照
2. 🎨 选择需要的背景颜色（白色/蓝色/红色/全部）
3. 🖱️ 点击"开始处理"按钮
4. 💾 右键点击结果图片保存

## 🔧 技术栈

- **OpenCV** - 图像处理
- **K-means** - 背景分割算法
- **Gradio** - 用户界面
- **NumPy** - 数值计算

## 📊 效果对比

| 特性 | 简单颜色替换 | K-means 算法 |
|------|-------------|--------------|
| 背景识别 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 头发处理 | ❌ 会变色 | ✅ 不变色 |
| 边缘效果 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 复杂背景 | ❌ 效果差 | ✅ 效果好 |

## 🌟 示例

上传一张证件照，即可看到三种不同背景颜色的效果！

## 📝 License

MIT License

## 🔗 相关链接

- [GitHub 仓库](https://github.com/jackyrwj/photo)
- [问题反馈](https://github.com/jackyrwj/photo/issues)


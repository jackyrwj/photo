#!/bin/bash

# 证件照换底色工具 - Hugging Face Spaces 部署脚本

echo "🚀 开始部署到 Hugging Face Spaces..."

# 检查是否已经克隆
if [ -d "../huandise" ]; then
    echo "📁 发现已存在的 huandise 目录，删除中..."
    rm -rf ../huandise
fi

# 克隆 Space 仓库
echo "📥 克隆 Space 仓库..."
cd ..
git clone https://huggingface.co/spaces/jackyrjw/huandise

# 进入目录
cd huandise

# 创建 README.md
echo "📝 创建 README.md..."
cat > README.md << 'EOF'
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

## 功能特点

- ✅ 智能背景识别
- ✅ 支持白色、蓝色、红色背景
- ✅ 边缘平滑处理
- ✅ 不会改变头发颜色

## 使用方法

1. 上传证件照
2. 选择需要的背景颜色
3. 点击"开始处理"
4. 右键保存处理后的图片
EOF

# 复制文件
echo "📋 复制文件..."
cp ../photo/app_gradio.py app.py
cp ../photo/requirements_hf.txt requirements.txt

# 提交更改
echo "💾 提交更改..."
git add .
git commit -m "初始化证件照换底色工具"

# 推送到 Hugging Face
echo "📤 推送到 Hugging Face..."
echo ""
echo "⚠️  注意：当提示输入密码时，请使用 Hugging Face Access Token"
echo "   生成 Token: https://huggingface.co/settings/tokens"
echo ""
git push

echo ""
echo "✅ 部署完成！"
echo "🌐 访问你的 Space: https://huggingface.co/spaces/jackyrjw/huandise"
echo ""
echo "📊 查看构建日志: https://huggingface.co/spaces/jackyrjw/huandise/logs"


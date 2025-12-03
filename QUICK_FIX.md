# 快速故障排除 - 5分钟解决

## 🚨 如果显示"处理失败"

### 第1步（30秒）
1. **按 F12** 打开浏览器开发者工具
2. 切换到 **Console** 标签
3. 查看是否有红色错误信息

### 第2步（1分钟）
运行诊断工具：
```
打开浏览器 → 访问 http://localhost:port/debug.html
（或直接打开 debug.html 文件）
→ 点击"系统检查"
→ 查看是否全部通过
```

### 第3步（2分钟）  
如果诊断工具中的 Canvas 或 FileReader 失败：
- **Firefox**：性能最稳定 ✅
- **Chrome**：首选 ✅
- **Safari**：有时有问题 ⚠️
- **Edge**：推荐 ✅
- **IE**：不支持 ❌

**解决**：换用 Chrome 或 Firefox

### 第4步（1分钟）
清除浏览器缓存：
```
Ctrl + Shift + Delete → 清除所有缓存 → 重新加载页面
```

## ✅ 验证修复

测试成功的标志：
- [ ] 选择图片后显示预览
- [ ] 自动生成白色、蓝色、红色三个版本
- [ ] 每种颜色下显示"下载"按钮
- [ ] 下载的图片能打开

## 🎯 常见原因速查表

| 问题 | 原因 | 解决 |
|------|------|------|
| 页面白屏 | HTML 加载失败 | 检查文件路径和服务器 |
| 点击无反应 | JavaScript 错误 | F12 查看 Console |
| 图片不显示 | 跨域或权限 | 使用本地图片 |
| 处理很慢 | 图片太大 | 用较小的图片 |
| 下载失败 | 浏览器限制 | 用 Chrome/Firefox |

## 🔬 一键诊断（复制到 Console 运行）

```javascript
console.clear();
console.log('=== 快速诊断 ===');
console.log('1. Canvas 支持:', !!document.createElement('canvas').getContext('2d'));
console.log('2. FileReader:', typeof FileReader !== 'undefined');
console.log('3. 上传区存在:', !!document.getElementById('uploadArea'));
console.log('4. 文件输入存在:', !!document.getElementById('fileInput'));
console.log('5. 白色图片元素:', !!document.getElementById('whiteImage'));
console.log('6. 蓝色图片元素:', !!document.getElementById('blueImage'));
console.log('7. 红色图片元素:', !!document.getElementById('redImage'));
console.log('8. 加载指示器:', !!document.getElementById('loading'));
console.log('=== 如果全是 true，说明 HTML 正确 ===');
```

## 📝 处理流程检查

```javascript
// 在 Console 中检查文件选择
const fileInput = document.getElementById('fileInput');
console.log('已选择文件:', fileInput.files[0]?.name);

// 手动触发处理
const file = fileInput.files[0];
if (file) {
    console.log('开始处理:', file.name);
    handleFile(file);
}
```

## 🎨 颜色解析测试

```javascript
// 测试颜色解析是否正常
const colors = ['#ffffff', '#2196F3', '#ff0000'];
colors.forEach(hex => {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    console.log(`${hex} = RGB(${r},${g},${b})`);
});
```

## 🖼️ 图片处理测试

```javascript
// 如果你选了文件，在 Console 运行以开始处理
const file = document.getElementById('fileInput').files[0];
if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => console.log('✓ 图片加载成功', img.width, 'x', img.height);
        img.onerror = () => console.error('✗ 图片加载失败');
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}
```

## 🚀 强制重置

如果什么都试过了，用这个终极方案：

```javascript
// 在 Console 中运行
location.reload(true);  // 硬刷新（清除缓存）
```

或者：
```
Ctrl + F5  // 强制刷新（大多数浏览器）
Cmd + Shift + R  // Mac 强制刷新
```

## 📱 移动设备注意

如果在手机上使用：
- 确保有足够的内存（>100MB）
- 不要选择太大的图片
- 关闭其他应用以释放内存

## ✨ 成功标志

如果看到这样的日志说明成功了：

```
white 处理完成，耗时 324ms
blue 处理完成，耗时 321ms  
red 处理完成，耗时 319ms
```

## 🎯 不同页面的启动位置

| 页面 | 访问地址 | 说明 |
|------|---------|------|
| 换底色（推荐） | `/index.html` | 纯前端，最快 |
| 换底色（模板版） | `/templates/index.html` | Flask 应用版 |
| 裁剪工具 | `/crop.html` | 纯前端裁剪 |
| 诊断工具 | `/debug.html` | 用来排查问题 |

## 💬 如果仍未解决

保存以下信息并反馈：

```
浏览器: [Chrome/Firefox/其他]
版本: [版本号]
操作系统: [Windows/Mac/Linux]
错误信息: [F12 Console 中的红字]
使用的页面: [index.html/templates/index.html/crop.html]
图片大小: [宽度x高度像素]
```

---

**快速链接**：
- 完整排查: `/TROUBLESHOOTING.md`
- 系统详情: `/PURE_FRONTEND_SOLUTION.md`
- 诊断工具: `/debug.html`

# 本地运行故障排除指南

## 🔍 快速诊断

### 第一步：使用诊断工具
1. 在浏览器中打开 `debug.html` 
2. 运行所有系统检查
3. 查看日志输出，找出问题所在

## 📋 常见问题和解决方案

### 问题1：显示"处理失败"
**原因可能**：
- 浏览器不支持某些 Canvas API
- 正则表达式颜色解析错误
- 内存不足（处理超大图片）

**解决步骤**：
1. 打开 `debug.html` → 测试 Canvas API
2. 检查浏览器控制台（F12）的错误信息
3. 尝试更小的图片

```javascript
// 在浏览器控制台运行以检查 Canvas 支持
const canvas = document.createElement('canvas');
console.log('Canvas 支持:', !!canvas.getContext('2d', { willReadFrequently: true }));
```

### 问题2：图片不显示处理结果
**原因可能**：
- FileReader 读取失败
- Image 对象加载失败
- getImageData 无权限（跨域图片）

**解决步骤**：
1. 打开 `debug.html` → 选择图片测试 → 测试自动处理
2. 查看日志中是否显示"图片加载成功"
3. 确保上传的是本地图片（不是跨域图片）

### 问题3：处理速度很慢
**原因**：
- 图片分辨率太高（>2000x2000）
- 浏览器性能差
- 其他后台任务占用 CPU

**解决方案**：
```javascript
// 在 processColor 中会显示处理时间，如果超过 2 秒就很慢
// 可以：
// 1. 压缩图片分辨率
// 2. 关闭其他浏览器标签
// 3. 更新浏览器版本（获得更好的优化）
```

### 问题4：边界处理效果差
**原因**：
- 背景色检测不准确
- 容差值不合适

**解决方案**：
编辑 `static/script.js` 中的参数：
```javascript
// 第 208 行附近
const tolerance = 35; // 改大 (例如 50) 可以识别更多背景
                      // 改小 (例如 20) 可以更精确地保留前景
```

## 🛠️ 开发者调试

### 启用详细日志
在浏览器控制台运行：
```javascript
// 监听所有处理过程
window.DEBUG_MODE = true;

// 在 script.js 中已有：
console.log(`${colorInfo.name} 处理完成，耗时 ${(endTime - startTime).toFixed(0)}ms`);
```

### 检查 DOM 元素
```javascript
// 在控制台检查必需的 DOM 元素
console.log('上传区:', document.getElementById('uploadArea'));
console.log('文件输入:', document.getElementById('fileInput'));
console.log('白色图片:', document.getElementById('whiteImage'));
console.log('加载指示:', document.getElementById('loading'));

// 如果返回 null，说明 HTML 中缺少对应的 ID
```

### 模拟处理过程
```javascript
// 在控制台手动运行处理
const testFile = document.getElementById('fileInput').files[0];
if (testFile) {
    handleFile(testFile);
    // 应该会看到处理状态更新
}
```

## 📊 性能分析

### 使用 Performance API 检查
```javascript
// 在 debug.html 中已实现，显示处理耗时
// 标准 A4 相纸大小的证件照（1000x1200）应该 < 500ms

// 如果超过 1000ms，说明有问题：
// 1. 图片太大 - 使用图片压缩工具
// 2. 浏览器差 - 用 Chrome 或 Firefox
// 3. 电脑差 - 关闭其他程序
```

## ✅ 测试清单

### 本地测试步骤
- [ ] 打开 `index.html` 或 `templates/index.html`
- [ ] 选择一张小图片（< 5MB）
- [ ] 观察是否显示预览
- [ ] 检查是否自动处理三种颜色
- [ ] 尝试自定义颜色
- [ ] 测试下载功能
- [ ] 打开开发者工具 (F12) 查看是否有红色错误

### 如果有错误
- [ ] 记下完整的错误信息
- [ ] 运行 `debug.html` 诊断
- [ ] 检查浏览器是否为最新版本
- [ ] 尝试在 Chrome 中测试

## 📱 浏览器兼容性检查

```javascript
// 在控制台检查浏览器能力
console.log('User Agent:', navigator.userAgent);
console.log('Canvas:', !!document.createElement('canvas').getContext);
console.log('FileReader:', typeof FileReader !== 'undefined');
console.log('Blob:', typeof Blob !== 'undefined');
console.log('requestAnimationFrame:', typeof requestAnimationFrame !== 'undefined');
```

### 推荐浏览器
- ✅ Chrome 90+（最好）
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11（不支持）

## 🔧 手动测试颜色解析

```javascript
// 直接在控制台测试颜色解析
const testHex = '#2196F3';
const hex = testHex.replace('#', '');
const r = parseInt(hex.substring(0, 2), 16);
const g = parseInt(hex.substring(2, 4), 16);
const b = parseInt(hex.substring(4, 6), 16);

console.log(`${testHex} = RGB(${r}, ${g}, ${b})`);
// 应该输出: #2196F3 = RGB(33, 150, 243)
```

## 💡 调试技巧

### 添加临时日志
在 `static/script.js` 的 `smartBackgroundRemoval` 函数中添加：
```javascript
function smartBackgroundRemoval(ctx, canvas, colorInfo) {
    console.log('开始处理:', colorInfo.name, colorInfo.hex);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log('获取图像数据:', imageData.data.length, '字节');
    
    // ... rest of code
    
    console.log('背景色:', bgColor);
}
```

### 保存中间结果查看
```javascript
// 在 smartBackgroundRemoval 的末尾添加
// 用于可视化调试
// window.debugCanvas = canvas; // 然后在控制台查看 window.debugCanvas
```

## 📞 获取帮助

如果问题无法解决：

1. **收集诊断信息**：
   - 运行 `debug.html` 全部测试
   - 截图日志输出
   - 记录浏览器版本
   - 记录操作系统

2. **检查日志**：
   - 按 F12 打开开发者工具
   - 切到 Console 标签
   - 记下所有错误信息

3. **尝试基础排查**：
   - 清除浏览器缓存 (Ctrl+Shift+Delete)
   - 尝试隐私模式
   - 尝试不同浏览器

## 📝 本地部署检查清单

- [ ] Node.js 和 npm 已安装（如果使用本地服务器）
- [ ] Python/Flask（如果使用 Flask 后端）
- [ ] 所有文件都在同一目录
- [ ] HTML 中的路径正确（相对路径）
- [ ] 没有跨域错误
- [ ] 浏览器支持所需 API

---

**最后更新**: 2025-12-03  
**诊断工具**: `/debug.html`

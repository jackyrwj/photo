// 纯前端处理配置
const USE_FRONTEND_ONLY = true; // 使用纯前端方案，不依赖服务器
const RENDER_API_URL = 'https://photo-wcqh.onrender.com'; // 备用（不使用）

let selectedFile = null;
let selectedColor = '#ff0000';
let outputFilenames = {
    white: null,
    blue: null,
    red: null,
    custom: null
};

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const colorPicker = document.getElementById('colorPicker');
const colorDisplay = document.getElementById('colorDisplay');
const processBtn = document.getElementById('processBtn');
const resultSection = document.getElementById('resultSection');
const customResultSection = document.getElementById('customResultSection');
const loading = document.getElementById('loading');
const originalImage = document.getElementById('originalImage');

// 三种预设颜色的图片元素
const whiteImage = document.getElementById('whiteImage');
const blueImage = document.getElementById('blueImage');
const redImage = document.getElementById('redImage');

// 自定义颜色结果
const customOriginalImage = document.getElementById('customOriginalImage');
const customResultImage = document.getElementById('customResultImage');

// 点击上传区域
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 文件选择
fileInput.addEventListener('change', (e) => {
    handleFile(e.target.files[0]);
});

// 拖拽上传
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFile(e.dataTransfer.files[0]);
});

// 处理文件
function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }

    selectedFile = file;

    // 显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadArea.innerHTML = `
            <img src="${e.target.result}" style="max-width: 100%; max-height: 300px; border-radius: 8px;">
            <p style="margin-top: 10px; color: #666;">点击重新选择图片</p>
        `;
        originalImage.src = e.target.result;
    };
    reader.readAsDataURL(file);

    // 自动处理三种预设颜色
    autoProcessPresetColors();

    processBtn.disabled = false;
}

// 自动处理白、蓝、红三种颜色
async function autoProcessPresetColors() {
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });

    // 重置状态
    whiteImage.style.display = 'none';
    blueImage.style.display = 'none';
    redImage.style.display = 'none';
    document.getElementById('whiteLoading').style.display = 'flex';
    document.getElementById('blueLoading').style.display = 'flex';
    document.getElementById('redLoading').style.display = 'flex';
    document.getElementById('downloadWhite').style.display = 'none';
    document.getElementById('downloadBlue').style.display = 'none';
    document.getElementById('downloadRed').style.display = 'none';

    // 并行处理三种颜色
    const colors = [
        { name: 'white', hex: '#ffffff', image: whiteImage, loading: 'whiteLoading', btn: 'downloadWhite' },
        { name: 'blue', hex: '#2196F3', image: blueImage, loading: 'blueLoading', btn: 'downloadBlue' },
        { name: 'red', hex: '#ff0000', image: redImage, loading: 'redLoading', btn: 'downloadRed' }
    ];

    // 并行处理，使用 Promise.allSettled 确保所有都完成
    const promises = colors.map(color => processColor(color));
    await Promise.allSettled(promises);
    
    console.log('三种颜色处理完成');
}

// 处理单个颜色 - 纯前端优化版本
async function processColor(colorInfo) {
    try {
        // 直接使用前端处理
        return await processColorWithCanvas(colorInfo);
    } catch (error) {
        console.error(`${colorInfo.name} 处理失败：`, error);
        const loadingEl = document.getElementById(colorInfo.loading);
        if (loadingEl) {
            loadingEl.textContent = '处理失败';
            loadingEl.style.display = 'flex';
        }
    }
}

// 智能纯前端抠图处理 - 优化版本
async function processColorWithCanvas(colorInfo) {
    return new Promise((resolve) => {
        try {
            const reader = new FileReader();
            
            reader.onerror = (error) => {
                console.error(`FileReader 读取失败 (${colorInfo.name}):`, error);
                document.getElementById(colorInfo.loading).textContent = '读取失败';
                resolve();
            };
            
            reader.onload = (e) => {
                try {
                    const img = new Image();
                    
                    img.onerror = () => {
                        console.error(`图片加载失败 (${colorInfo.name})`);
                        document.getElementById(colorInfo.loading).textContent = '加载失败';
                        resolve();
                    };
                    
                    img.onload = () => {
                        try {
                            // 使用 requestAnimationFrame 避免阻塞
                            requestAnimationFrame(() => {
                                try {
                                    const startTime = performance.now();
                                    
                                    // 创建 offscreen canvas
                                    const canvas = document.createElement('canvas');
                                    canvas.width = img.width;
                                    canvas.height = img.height;
                                    const ctx = canvas.getContext('2d', { willReadFrequently: true });

                                    if (!ctx) {
                                        throw new Error('无法获取 Canvas Context');
                                    }

                                    // 绘制原图
                                    ctx.drawImage(img, 0, 0);

                                    // 使用智能抠图算法
                                    smartBackgroundRemoval(ctx, canvas, colorInfo);

                                    // 转换为 Blob
                                    canvas.toBlob((blob) => {
                                        if (!blob) {
                                            console.error(`toBlob 返回空 (${colorInfo.name})`);
                                            document.getElementById(colorInfo.loading).textContent = '转换失败';
                                            resolve();
                                            return;
                                        }

                                        const url = URL.createObjectURL(blob);
                                        colorInfo.image.src = url;
                                        colorInfo.image.style.display = 'block';
                                        document.getElementById(colorInfo.loading).style.display = 'none';
                                        document.getElementById(colorInfo.btn).style.display = 'inline-block';

                                        // 保存用于下载
                                        const filename = `processed_${colorInfo.name}_${Date.now()}.png`;
                                        outputFilenames[colorInfo.name] = filename;
                                        window[`blob_${colorInfo.name}`] = blob;

                                        const endTime = performance.now();
                                        console.log(`${colorInfo.name} 处理完成，耗时 ${(endTime - startTime).toFixed(0)}ms`);
                                        
                                        resolve();
                                    }, 'image/png', 0.95);
                                } catch (innerError) {
                                    console.error(`Canvas 处理出错 (${colorInfo.name}):`, innerError);
                                    document.getElementById(colorInfo.loading).textContent = '处理失败';
                                    resolve();
                                }
                            });
                        } catch (error) {
                            console.error(`图片加载后处理出错 (${colorInfo.name}):`, error);
                            document.getElementById(colorInfo.loading).textContent = '处理失败';
                            resolve();
                        }
                    };
                    
                    img.src = e.target.result;
                } catch (error) {
                    console.error(`Image 对象创建出错 (${colorInfo.name}):`, error);
                    document.getElementById(colorInfo.loading).textContent = '创建失败';
                    resolve();
                }
            };
            
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error('前端处理失败：', error);
            document.getElementById(colorInfo.loading).textContent = '处理失败';
            resolve();
        }
    });
}

// 智能背景移除 - 高效算法
function smartBackgroundRemoval(ctx, canvas, colorInfo) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 解析目标颜色 - 改进的正则表达式
    const hexColor = colorInfo.hex.replace('#', '');
    const targetR = parseInt(hexColor.substring(0, 2), 16);
    const targetG = parseInt(hexColor.substring(2, 4), 16);
    const targetB = parseInt(hexColor.substring(4, 6), 16);

    if (isNaN(targetR) || isNaN(targetG) || isNaN(targetB)) {
        console.error('无效的颜色值:', colorInfo.hex);
        throw new Error('颜色解析失败');
    }

    // 第一步：检测背景色（使用图像四个角的平均色）
    const bgColor = detectBackgroundColor(data, canvas.width, canvas.height);

    // 第二步：进行颜色替换和边缘优化
    const tolerance = 35; // 色差容差
    const edgeBuffer = new Uint8Array(data.length / 4); // 边缘缓存

    for (let i = 0; i < data.length; i += 4) {
        const pixelR = data[i];
        const pixelG = data[i + 1];
        const pixelB = data[i + 2];
        const pixelA = data[i + 3];

        // 计算与背景色的差异
        const diff = colorDistance(
            pixelR, pixelG, pixelB,
            bgColor.r, bgColor.g, bgColor.b
        );

        const pixelIndex = i / 4;

        if (diff < tolerance) {
            // 背景像素：替换颜色
            data[i] = targetR;
            data[i + 1] = targetG;
            data[i + 2] = targetB;
            data[i + 3] = 255;
            edgeBuffer[pixelIndex] = 0; // 背景
        } else if (diff < tolerance + 30) {
            // 边缘像素：混合
            const alpha = Math.max(0, (diff - tolerance) / 30);
            data[i] = Math.round(pixelR * alpha + targetR * (1 - alpha));
            data[i + 1] = Math.round(pixelG * alpha + targetG * (1 - alpha));
            data[i + 2] = Math.round(pixelB * alpha + targetB * (1 - alpha));
            data[i + 3] = Math.round(pixelA * alpha + 255 * (1 - alpha));
            edgeBuffer[pixelIndex] = 1; // 边缘
        } else {
            // 前景像素：保持
            edgeBuffer[pixelIndex] = 2; // 前景
        }
    }

    // 第三步：轻微的高斯模糊以平滑边界（可选）
    smoothEdges(data, edgeBuffer, canvas.width, canvas.height);

    ctx.putImageData(imageData, 0, 0);
}

// 检测背景色 - 从四个角提取
function detectBackgroundColor(data, width, height) {
    const corners = [
        { x: 0, y: 0 },           // 左上
        { x: width - 1, y: 0 },   // 右上
        { x: 0, y: height - 1 },  // 左下
        { x: width - 1, y: height - 1 } // 右下
    ];

    let sumR = 0, sumG = 0, sumB = 0;

    for (const corner of corners) {
        const idx = (corner.y * width + corner.x) * 4;
        sumR += data[idx];
        sumG += data[idx + 1];
        sumB += data[idx + 2];
    }

    return {
        r: Math.round(sumR / corners.length),
        g: Math.round(sumG / corners.length),
        b: Math.round(sumB / corners.length)
    };
}

// 计算颜色距离（使用欧几里得距离）
function colorDistance(r1, g1, b1, r2, g2, b2) {
    // 加权距离，考虑人眼对不同颜色的敏感度
    const dR = (r1 - r2) * 0.3;
    const dG = (g1 - g2) * 0.59;
    const dB = (b1 - b2) * 0.11;
    return Math.sqrt(dR * dR + dG * dG + dB * dB);
}

// 平滑边界 - 轻微模糊
function smoothEdges(data, edgeBuffer, width, height) {
    const radius = 1;
    const kernel = [1, 2, 1, 2, 4, 2, 1, 2, 1];
    const kernelWeight = 16;

    for (let i = 0; i < edgeBuffer.length; i++) {
        if (edgeBuffer[i] !== 1) continue; // 只处理边缘像素

        const y = Math.floor(i / width);
        const x = i % width;

        let sumR = 0, sumG = 0, sumB = 0, sumA = 0, count = 0;
        let kernelIdx = 0;

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const ny = y + dy;
                const nx = x + dx;

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                    const idx = (ny * width + nx) * 4;
                    const weight = kernel[kernelIdx];

                    sumR += data[idx] * weight;
                    sumG += data[idx + 1] * weight;
                    sumB += data[idx + 2] * weight;
                    sumA += data[idx + 3] * weight;
                    count += weight;
                }
                kernelIdx++;
            }
        }

        const pixelIdx = i * 4;
        data[pixelIdx] = Math.round(sumR / count);
        data[pixelIdx + 1] = Math.round(sumG / count);
        data[pixelIdx + 2] = Math.round(sumB / count);
        data[pixelIdx + 3] = Math.round(sumA / count);
    }
}

// 预设颜色选择
document.querySelectorAll('.color-box').forEach(box => {
    box.addEventListener('click', () => {
        selectedColor = box.dataset.color;
        colorPicker.value = selectedColor;
        colorDisplay.textContent = selectedColor;

        // 更新选中状态
        document.querySelectorAll('.color-box').forEach(b => b.classList.remove('selected'));
        box.classList.add('selected');

        // 如果是自动预览的颜色（白、蓝、红），不需要处理
        // 如果是其他颜色，需要点击处理按钮
        if (!box.classList.contains('auto-preview')) {
            // 其他颜色需要点击处理按钮
            processBtn.textContent = '处理自定义颜色';
        } else {
            processBtn.textContent = '开始处理';
        }
    });
});

// 自定义颜色选择
colorPicker.addEventListener('input', (e) => {
    selectedColor = e.target.value;
    colorDisplay.textContent = selectedColor;

    // 取消预设颜色的选中状态
    document.querySelectorAll('.color-box').forEach(b => b.classList.remove('selected'));

    // 自定义颜色需要点击处理
    processBtn.textContent = '处理自定义颜色';
});

// 处理按钮（用于自定义颜色）
processBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        alert('请先上传图片！');
        return;
    }

    // 检查是否是自动预览的颜色
    const autoPreviewColors = ['#ffffff', '#2196f3', '#ff0000'];
    if (autoPreviewColors.includes(selectedColor.toLowerCase())) {
        alert('白色、蓝色、红色已自动生成，请直接下载！');
        return;
    }

    loading.style.display = 'flex';

    try {
        await processCustomColorWithCanvas();
    } catch (error) {
        console.error('处理失败:', error.message);
        alert('处理失败: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
});

// 纯前端处理自定义颜色
async function processCustomColorWithCanvas() {
    return new Promise((resolve) => {
        try {
            const reader = new FileReader();
            
            reader.onerror = (error) => {
                console.error('FileReader 读取失败 (custom):', error);
                alert('文件读取失败');
                resolve();
            };
            
            reader.onload = (e) => {
                try {
                    const img = new Image();
                    
                    img.onerror = () => {
                        console.error('图片加载失败 (custom)');
                        alert('图片加载失败');
                        resolve();
                    };
                    
                    img.onload = () => {
                        try {
                            requestAnimationFrame(() => {
                                try {
                                    const canvas = document.createElement('canvas');
                                    canvas.width = img.width;
                                    canvas.height = img.height;
                                    const ctx = canvas.getContext('2d', { willReadFrequently: true });

                                    if (!ctx) {
                                        throw new Error('无法获取 Canvas Context');
                                    }

                                    ctx.drawImage(img, 0, 0);

                                    // 构建颜色信息对象
                                    const colorInfo = {
                                        name: 'custom',
                                        hex: selectedColor,
                                        image: customResultImage,
                                        loading: 'customLoading',
                                        btn: 'downloadCustom'
                                    };

                                    smartBackgroundRemoval(ctx, canvas, colorInfo);

                                    canvas.toBlob((blob) => {
                                        if (!blob) {
                                            console.error('toBlob 返回空 (custom)');
                                            alert('图像转换失败');
                                            resolve();
                                            return;
                                        }

                                        const url = URL.createObjectURL(blob);
                                        customOriginalImage.src = originalImage.src;
                                        customResultImage.src = url;
                                        customResultSection.style.display = 'block';
                                        customResultSection.scrollIntoView({ behavior: 'smooth' });

                                        outputFilenames.custom = `processed_custom_${Date.now()}.png`;
                                        window['blob_custom'] = blob;

                                        console.log('自定义颜色处理完成');
                                        resolve();
                                    }, 'image/png', 0.95);
                                } catch (innerError) {
                                    console.error('Canvas 处理出错 (custom):', innerError);
                                    alert('处理失败: ' + innerError.message);
                                    resolve();
                                }
                            });
                        } catch (error) {
                            console.error('图片加载后处理出错 (custom):', error);
                            alert('处理失败: ' + error.message);
                            resolve();
                        }
                    };
                    
                    img.src = e.target.result;
                } catch (error) {
                    console.error('Image 对象创建出错 (custom):', error);
                    alert('创建图片对象失败');
                    resolve();
                }
            };
            
            reader.readAsDataURL(selectedFile);
        } catch (error) {
            console.error('前端处理失败：', error);
            alert('处理失败: ' + error.message);
            resolve();
        }
    });
}

// 下载按钮
document.getElementById('downloadWhite').addEventListener('click', () => {
    downloadImage('white', 'white');
});

document.getElementById('downloadBlue').addEventListener('click', () => {
    downloadImage('blue', 'blue');
});

document.getElementById('downloadRed').addEventListener('click', () => {
    downloadImage('red', 'red');
});

document.getElementById('downloadCustom').addEventListener('click', () => {
    downloadImage('custom', 'custom');
});

// 通用下载函数
function downloadImage(colorName, filename) {
    if (!outputFilenames[colorName]) return;

    const link = document.createElement('a');
    
    // 检查是否有本地 Blob
    if (window[`blob_${colorName}`]) {
        const blob = window[`blob_${colorName}`];
        link.href = URL.createObjectURL(blob);
    } else {
        // 使用远程 URL
        link.href = `${RENDER_API_URL}/download/${outputFilenames[colorName]}`;
    }
    
    link.download = `证件照_${filename}_${Date.now()}.png`;
    link.click();
}

// 默认选中白色
document.querySelector('.color-box[data-color="#ffffff"]').classList.add('selected');
selectedColor = '#ffffff';
colorDisplay.textContent = '#ffffff';
colorPicker.value = '#ffffff';


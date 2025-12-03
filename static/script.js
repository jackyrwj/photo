// Render 部署地址
const RENDER_API_URL = 'https://photo-wcqh.onrender.com';
const REQUEST_TIMEOUT = 20000; // 20秒超时
let useServerProcessing = true; // 标记是否使用服务器处理

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

    for (const color of colors) {
        processColor(color);
    }
}

// 处理单个颜色
async function processColor(colorInfo) {
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('color', colorInfo.hex);

    try {
        // 使用 Promise.race 实现超时
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        let response;
        
        // 尝试使用服务器处理
        if (useServerProcessing) {
            try {
                response = await fetch(`${RENDER_API_URL}/upload`, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                });
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.warn('Render API 请求超时，切换到前端处理...');
                    useServerProcessing = false;
                    clearTimeout(timeoutId);
                    // 使用纯前端处理
                    return await procesColorWithCanvas(colorInfo);
                } else {
                    // 网络错误，尝试本地服务器
                    console.warn('Render API 不可用，尝试使用本地服务器...');
                    try {
                        response = await fetch('/upload', {
                            method: 'POST',
                            body: formData,
                            signal: controller.signal
                        });
                    } catch (e) {
                        console.warn('本地服务器也不可用，切换到前端处理...');
                        useServerProcessing = false;
                        clearTimeout(timeoutId);
                        return await procesColorWithCanvas(colorInfo);
                    }
                }
            }
        } else {
            // 使用纯前端处理
            clearTimeout(timeoutId);
            return await procesColorWithCanvas(colorInfo);
        }

        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.success) {
            outputFilenames[colorInfo.name] = data.output_file;
            colorInfo.image.src = `${RENDER_API_URL}/download/${data.output_file}`;
            colorInfo.image.style.display = 'block';
            document.getElementById(colorInfo.loading).style.display = 'none';
            document.getElementById(colorInfo.btn).style.display = 'inline-block';
        } else {
            document.getElementById(colorInfo.loading).textContent = '处理失败';
        }
    } catch (error) {
        console.warn('处理失败，使用前端处理：', error.message);
        useServerProcessing = false;
        return await procesColorWithCanvas(colorInfo);
    }
}

// 纯前端处理颜色（Canvas 处理）
async function procesColorWithCanvas(colorInfo) {
    try {
        // 读取图片
        const reader = new FileReader();
        reader.onload = async (e) => {
            const img = new Image();
            img.onload = async () => {
                // 创建 canvas 来处理图片
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                // 绘制原图
                ctx.drawImage(img, 0, 0);

                // 获取像素数据并进行换底色处理
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // 解析目标颜色
                const [r, g, b] = colorInfo.hex.match(/\w\w/g).map(x => parseInt(x, 16));

                // 简单的抠图算法：白色/透明背景替换为目标颜色
                for (let i = 0; i < data.length; i += 4) {
                    const pixelR = data[i];
                    const pixelG = data[i + 1];
                    const pixelB = data[i + 2];
                    const pixelA = data[i + 3];

                    // 判断是否为背景色（白色或接近白色）
                    const brightness = (pixelR + pixelG + pixelB) / 3;
                    if (brightness > 200) { // 白色背景阈值
                        // 替换为目标颜色
                        data[i] = r;
                        data[i + 1] = g;
                        data[i + 2] = b;
                        // 保持原有透明度
                    }
                }

                ctx.putImageData(imageData, 0, 0);

                // 将结果转换为 Blob 并显示
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    colorInfo.image.src = url;
                    colorInfo.image.style.display = 'block';
                    document.getElementById(colorInfo.loading).style.display = 'none';
                    document.getElementById(colorInfo.btn).style.display = 'inline-block';

                    // 保存 Blob 用于下载
                    const filename = `processed_${colorInfo.name}_${Date.now()}.png`;
                    outputFilenames[colorInfo.name] = filename;
                    // 可以将 blob 存储在 sessionStorage 中供后续下载使用
                    window[`blob_${colorInfo.name}`] = blob;
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
    } catch (error) {
        console.error('前端处理失败：', error);
        document.getElementById(colorInfo.loading).textContent = '处理失败';
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

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('color', selectedColor);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

        let response;
        
        if (useServerProcessing) {
            try {
                response = await fetch(`${RENDER_API_URL}/upload`, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                });
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.warn('Render API 请求超时，切换到前端处理...');
                    useServerProcessing = false;
                    clearTimeout(timeoutId);
                    return await processCustomColorWithCanvas();
                } else {
                    console.warn('Render API 不可用，尝试本地服务器...');
                    try {
                        response = await fetch('/upload', {
                            method: 'POST',
                            body: formData,
                            signal: controller.signal
                        });
                    } catch (e) {
                        console.warn('本地服务器也不可用，切换到前端处理...');
                        useServerProcessing = false;
                        clearTimeout(timeoutId);
                        return await processCustomColorWithCanvas();
                    }
                }
            }
        } else {
            clearTimeout(timeoutId);
            return await processCustomColorWithCanvas();
        }

        clearTimeout(timeoutId);

        const data = await response.json();

        if (data.success) {
            outputFilenames.custom = data.output_file;
            customOriginalImage.src = originalImage.src;
            customResultImage.src = `${RENDER_API_URL}/download/${data.output_file}`;
            customResultSection.style.display = 'block';
            customResultSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('处理失败: ' + (data.error || '未知错误'));
        }
    } catch (error) {
        console.warn('处理失败，使用前端处理：', error.message);
        useServerProcessing = false;
        return await processCustomColorWithCanvas();
    } finally {
        loading.style.display = 'none';
    }
});

// 纯前端处理自定义颜色
async function processCustomColorWithCanvas() {
    try {
        loading.style.display = 'flex';

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                ctx.drawImage(img, 0, 0);

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;

                // 解析目标颜色
                const [r, g, b] = selectedColor.match(/\w\w/g).map(x => parseInt(x, 16));

                // 替换背景色
                for (let i = 0; i < data.length; i += 4) {
                    const pixelR = data[i];
                    const pixelG = data[i + 1];
                    const pixelB = data[i + 2];

                    const brightness = (pixelR + pixelG + pixelB) / 3;
                    if (brightness > 200) {
                        data[i] = r;
                        data[i + 1] = g;
                        data[i + 2] = b;
                    }
                }

                ctx.putImageData(imageData, 0, 0);

                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    customOriginalImage.src = originalImage.src;
                    customResultImage.src = url;
                    customResultSection.style.display = 'block';
                    customResultSection.scrollIntoView({ behavior: 'smooth' });

                    outputFilenames.custom = `processed_custom_${Date.now()}.png`;
                    window['blob_custom'] = blob;

                    loading.style.display = 'none';
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(selectedFile);
    } catch (error) {
        console.error('前端处理失败：', error);
        alert('处理失败: ' + error.message);
        loading.style.display = 'none';
    }
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


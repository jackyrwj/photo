// API 地址（空字符串表示使用当前服务器）
const API_URL = '';

let selectedFile = null;
let selectedColor = '#ff0000';
let outputFilenames = { white: null, blue: null, red: null, custom: null };

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
const whiteImage = document.getElementById('whiteImage');
const blueImage = document.getElementById('blueImage');
const redImage = document.getElementById('redImage');
const customOriginalImage = document.getElementById('customOriginalImage');
const customResultImage = document.getElementById('customResultImage');

// 文件上传处理
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener('change', (e) => { if (e.target.files.length > 0) handleFile(e.target.files[0]); });

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
    }
    selectedFile = file;
    processBtn.disabled = false;
    uploadArea.innerHTML = `<p>已选择: ${file.name}</p><p style="font-size:12px;color:#666;">点击重新选择</p>`;
    
    // 预览原图
    const reader = new FileReader();
    reader.onload = (e) => { originalImage.src = e.target.result; };
    reader.readAsDataURL(file);
    
    // 自动开始处理
    processAllColors();
}

// 处理所有预设颜色
async function processAllColors() {
    if (!selectedFile) return;
    
    loading.style.display = 'flex';
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
    
    const colors = [
        { name: 'white', hex: '#ffffff', image: whiteImage, loading: 'whiteLoading', download: 'downloadWhite' },
        { name: 'blue', hex: '#2196F3', image: blueImage, loading: 'blueLoading', download: 'downloadBlue' },
        { name: 'red', hex: '#ff0000', image: redImage, loading: 'redLoading', download: 'downloadRed' }
    ];
    
    await Promise.allSettled(colors.map(color => processColor(color)));
    loading.style.display = 'none';
}

// 处理单个颜色
async function processColor(colorInfo) {
    const loadingEl = document.getElementById(colorInfo.loading);
    const downloadBtn = document.getElementById(colorInfo.download);
    
    colorInfo.image.style.display = 'none';
    loadingEl.style.display = 'flex';
    loadingEl.textContent = '处理中...';
    downloadBtn.style.display = 'none';
    
    try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('color', colorInfo.hex);
        
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        if (!data.success) throw new Error(data.error || '处理失败');
        
        outputFilenames[colorInfo.name] = data.output_file;
        colorInfo.image.src = `${API_URL}/download/${data.output_file}?t=${Date.now()}`;
        colorInfo.image.style.display = 'block';
        loadingEl.style.display = 'none';
        downloadBtn.style.display = 'inline-block';
    } catch (error) {
        console.error(`${colorInfo.name} 处理失败:`, error);
        loadingEl.textContent = '处理失败';
    }
}

// 预设颜色选择
document.querySelectorAll('.color-box').forEach(box => {
    box.addEventListener('click', () => {
        selectedColor = box.dataset.color;
        colorPicker.value = selectedColor;
        colorDisplay.textContent = selectedColor;
        document.querySelectorAll('.color-box').forEach(b => b.classList.remove('selected'));
        box.classList.add('selected');
        processBtn.textContent = box.classList.contains('auto-preview') ? '开始处理' : '处理自定义颜色';
    });
});

// 自定义颜色选择
colorPicker.addEventListener('input', (e) => {
    selectedColor = e.target.value;
    colorDisplay.textContent = selectedColor;
    document.querySelectorAll('.color-box').forEach(b => b.classList.remove('selected'));
    processBtn.textContent = '处理自定义颜色';
});

// 处理按钮
processBtn.addEventListener('click', async () => {
    if (!selectedFile) { alert('请先上传图片！'); return; }

    const autoColors = ['#ffffff', '#2196f3', '#ff0000'];
    if (autoColors.includes(selectedColor.toLowerCase())) {
        alert('白色、蓝色、红色已自动生成，请直接下载！');
        return;
    }

    loading.style.display = 'flex';
    try {
        await processCustomColor();
    } catch (error) {
        alert('处理失败: ' + error.message);
    }
    loading.style.display = 'none';
});

// 处理自定义颜色
async function processCustomColor() {
    const customLoading = document.getElementById('customLoading');
    const downloadBtn = document.getElementById('downloadCustom');

    customResultSection.style.display = 'block';
    customResultSection.scrollIntoView({ behavior: 'smooth' });
    customOriginalImage.src = originalImage.src;
    customResultImage.style.display = 'none';
    customLoading.style.display = 'flex';
    customLoading.textContent = '处理中...';
    downloadBtn.style.display = 'none';

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('color', selectedColor);

    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    if (!data.success) throw new Error(data.error || '处理失败');

    outputFilenames.custom = data.output_file;
    customResultImage.src = `${API_URL}/download/${data.output_file}?t=${Date.now()}`;
    customResultImage.style.display = 'block';
    customLoading.style.display = 'none';
    downloadBtn.style.display = 'inline-block';
}

// 下载按钮
document.getElementById('downloadWhite').addEventListener('click', () => downloadImage('white'));
document.getElementById('downloadBlue').addEventListener('click', () => downloadImage('blue'));
document.getElementById('downloadRed').addEventListener('click', () => downloadImage('red'));
document.getElementById('downloadCustom').addEventListener('click', () => downloadImage('custom'));

function downloadImage(colorName) {
    const filename = outputFilenames[colorName];
    if (!filename) { alert('文件尚未生成'); return; }

    const link = document.createElement('a');
    link.href = `${API_URL}/download/${filename}`;
    link.download = `证件照_${colorName}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 默认选中白色
document.querySelector('.color-box[data-color="#ffffff"]').classList.add('selected');
selectedColor = '#ffffff';
colorDisplay.textContent = '#ffffff';
colorPicker.value = '#ffffff';


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
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            outputFilenames[colorInfo.name] = data.output_file;
            colorInfo.image.src = `/download/${data.output_file}`;
            colorInfo.image.style.display = 'block';
            document.getElementById(colorInfo.loading).style.display = 'none';
            document.getElementById(colorInfo.btn).style.display = 'inline-block';
        } else {
            document.getElementById(colorInfo.loading).textContent = '处理失败';
        }
    } catch (error) {
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
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            outputFilenames.custom = data.output_file;
            customOriginalImage.src = originalImage.src;
            customResultImage.src = `/download/${data.output_file}`;
            customResultSection.style.display = 'block';
            customResultSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            alert('处理失败: ' + (data.error || '未知错误'));
        }
    } catch (error) {
        alert('处理失败: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
});

// 下载按钮
document.getElementById('downloadWhite').addEventListener('click', () => {
    if (outputFilenames.white) {
        window.location.href = `/download/${outputFilenames.white}`;
    }
});

document.getElementById('downloadBlue').addEventListener('click', () => {
    if (outputFilenames.blue) {
        window.location.href = `/download/${outputFilenames.blue}`;
    }
});

document.getElementById('downloadRed').addEventListener('click', () => {
    if (outputFilenames.red) {
        window.location.href = `/download/${outputFilenames.red}`;
    }
});

document.getElementById('downloadCustom').addEventListener('click', () => {
    if (outputFilenames.custom) {
        window.location.href = `/download/${outputFilenames.custom}`;
    }
});

// 默认选中白色
document.querySelector('.color-box[data-color="#ffffff"]').classList.add('selected');
selectedColor = '#ffffff';
colorDisplay.textContent = '#ffffff';
colorPicker.value = '#ffffff';


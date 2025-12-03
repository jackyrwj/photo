from flask import Flask, request, jsonify, send_from_directory, send_file
import cv2
import numpy as np
import os
import uuid

app = Flask(__name__, static_folder='static', static_url_path='/static')

# 输出目录
OUTPUT_FOLDER = 'output'
os.makedirs(OUTPUT_FOLDER, exist_ok=True)


def hex_to_bgr(hex_color):
    """将十六进制颜色转换为BGR格式"""
    hex_color = hex_color.lstrip('#')
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    return (b, g, r)


def change_background(image, target_color_bgr):
    """使用K-means聚类进行背景替换"""
    # 转换为RGB用于处理
    img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # 重塑图像用于K-means
    pixels = img_rgb.reshape(-1, 3).astype(np.float32)

    # K-means聚类
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    k = 2
    _, labels, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)

    # 找出背景类（假设四个角的颜色是背景）
    h, w = image.shape[:2]
    corner_indices = [0, w-1, (h-1)*w, h*w-1]
    corner_labels = [labels[i][0] for i in corner_indices]
    bg_label = max(set(corner_labels), key=corner_labels.count)

    # 创建mask
    mask = (labels.reshape(h, w) == bg_label).astype(np.uint8) * 255

    # 形态学操作平滑mask
    kernel = np.ones((3, 3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)

    # 高斯模糊边缘
    mask_blur = cv2.GaussianBlur(mask, (5, 5), 0)

    # 创建新背景
    new_bg = np.full_like(image, target_color_bgr, dtype=np.uint8)

    # 混合
    alpha = mask_blur.astype(float) / 255.0
    alpha = np.stack([alpha] * 3, axis=-1)

    result = (new_bg * alpha + image * (1 - alpha)).astype(np.uint8)

    return result


@app.route('/')
def index():
    """主页"""
    return send_from_directory('templates', 'index.html')


@app.route('/index.html')
def index_html():
    """主页别名"""
    return send_from_directory('templates', 'index.html')


@app.route('/upload', methods=['POST'])
def upload():
    """处理图片上传和背景替换"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': '没有上传文件'}), 400

    file = request.files['file']
    color = request.form.get('color', '#ffffff')

    if file.filename == '':
        return jsonify({'success': False, 'error': '文件名为空'}), 400

    try:
        # 读取图片
        file_bytes = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({'success': False, 'error': '无法读取图片'}), 400

        # 转换颜色并处理
        target_bgr = hex_to_bgr(color)
        result = change_background(image, target_bgr)

        # 保存结果
        output_filename = f"{uuid.uuid4().hex}.png"
        output_path = os.path.join(OUTPUT_FOLDER, output_filename)
        cv2.imwrite(output_path, result)

        return jsonify({
            'success': True,
            'output_file': output_filename
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/download/<filename>')
def download(filename):
    """下载处理后的图片"""
    return send_from_directory(OUTPUT_FOLDER, filename)


@app.route('/crop')
def crop():
    """裁剪工具页面"""
    return send_from_directory('.', 'crop.html')


@app.route('/advanced-debug')
def advanced_debug():
    """调试页面"""
    return send_from_directory('.', 'advanced-debug.html')


@app.route('/ads.txt')
def ads_txt():
    """AdSense ads.txt"""
    return send_from_directory('.', 'ads.txt')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


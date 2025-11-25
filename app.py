from flask import Flask, render_template, request, send_file, jsonify
import os
import cv2 as cv
import numpy as np
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime

app = Flask(__name__)

# 配置
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

# 确保文件夹存在
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['OUTPUT_FOLDER'] = OUTPUT_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def hex_to_bgr(hex_color):
    """将十六进制颜色转换为 BGR 格式"""
    hex_color = hex_color.lstrip('#')
    r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    return [b, g, r]  # OpenCV 使用 BGR 格式


def change_background_color(image_path, bg_color_hex):
    """更换证件照背景颜色"""
    # 读入数据
    image = cv.imread(image_path)
    if image is None:
        raise ValueError("无法读取图片")
    
    h, w, ch = image.shape
    
    data = image.reshape((-1, 3))
    data = np.float32(data)
    
    # 设置聚类
    criteria = (cv.TERM_CRITERIA_EPS + cv.TERM_CRITERIA_MAX_ITER, 10, 1.0)
    num_clusters = 4
    _, label, _ = cv.kmeans(data, num_clusters, None, criteria, num_clusters, cv.KMEANS_RANDOM_CENTERS)
    
    # 找到背景像素的类别
    indx = label[0][0]
    
    # 生成掩膜
    mask = np.ones((h, w), dtype=np.uint8) * 255
    label = np.reshape(label, (h, w))
    mask[label == indx] = 0
    
    # 处理掩膜
    se = cv.getStructuringElement(cv.MORPH_RECT, (3, 3))
    cv.erode(mask, se, mask)
    mask = cv.GaussianBlur(mask, (5, 5), 0)
    
    # 转换背景颜色
    bg_color = hex_to_bgr(bg_color_hex)
    bg = np.tile(bg_color, (h, w, 1))
    
    # 融合图像
    alpha = mask.astype(np.float32) / 255
    fg = alpha[..., None] * image
    bg_part = (1 - alpha[..., None]) * bg
    new_image = fg + bg_part
    
    return new_image.astype(np.uint8)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': '没有文件'}), 400
    
    file = request.files['file']
    bg_color = request.form.get('color', '#ff0000')
    
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    if file and allowed_file(file.filename):
        # 生成唯一文件名
        unique_id = str(uuid.uuid4())
        ext = file.filename.rsplit('.', 1)[1].lower()
        input_filename = f"{unique_id}_input.{ext}"
        output_filename = f"{unique_id}_output.png"
        
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], input_filename)
        output_path = os.path.join(app.config['OUTPUT_FOLDER'], output_filename)
        
        # 保存上传的文件
        file.save(input_path)
        
        try:
            # 处理图片
            result_image = change_background_color(input_path, bg_color)
            cv.imwrite(output_path, result_image)
            
            # 删除上传的文件以节省空间
            os.remove(input_path)
            
            return jsonify({
                'success': True,
                'output_file': output_filename
            })
        except Exception as e:
            # 清理文件
            if os.path.exists(input_path):
                os.remove(input_path)
            return jsonify({'error': f'处理图片时出错: {str(e)}'}), 500
    
    return jsonify({'error': '不支持的文件格式'}), 400


@app.route('/download/<filename>')
def download_file(filename):
    file_path = os.path.join(app.config['OUTPUT_FOLDER'], filename)
    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True, download_name=f'证件照_{filename}')
    return jsonify({'error': '文件不存在'}), 404


# Vercel serverless function handler
app_handler = app

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)


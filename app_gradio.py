import gradio as gr
import cv2 as cv
import numpy as np
from PIL import Image


def hex_to_bgr(hex_color):
    """将十六进制颜色转换为 BGR 格式"""
    hex_color = hex_color.lstrip('#')
    r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    return [b, g, r]


def change_background_color(image, bg_color_hex):
    """更换证件照背景颜色"""
    # 转换 PIL Image 到 OpenCV 格式
    image = np.array(image)
    image = cv.cvtColor(image, cv.COLOR_RGB2BGR)
    
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
    
    # 转换回 RGB
    new_image = new_image.astype(np.uint8)
    new_image = cv.cvtColor(new_image, cv.COLOR_BGR2RGB)
    
    return new_image


def process_image(image, color_choice):
    """处理图片并返回三种颜色的结果"""
    if image is None:
        return None, None, None
    
    colors = {
        "白色": "#ffffff",
        "蓝色": "#2196F3",
        "红色": "#ff0000"
    }
    
    if color_choice == "全部":
        white = change_background_color(image, colors["白色"])
        blue = change_background_color(image, colors["蓝色"])
        red = change_background_color(image, colors["红色"])
        return white, blue, red
    else:
        result = change_background_color(image, colors[color_choice])
        if color_choice == "白色":
            return result, None, None
        elif color_choice == "蓝色":
            return None, result, None
        else:
            return None, None, result


# 创建 Gradio 界面
with gr.Blocks(title="证件照换底色工具") as demo:
    gr.Markdown("# 🎨 证件照换底色工具")
    gr.Markdown("上传证件照，自动更换背景颜色。使用 OpenCV K-means 算法，效果更好！")
    
    with gr.Row():
        with gr.Column():
            input_image = gr.Image(type="pil", label="上传证件照")
            color_choice = gr.Radio(
                choices=["全部", "白色", "蓝色", "红色"],
                value="全部",
                label="选择背景颜色"
            )
            submit_btn = gr.Button("🎨 开始处理", variant="primary")
    
    gr.Markdown("## 处理结果")
    with gr.Row():
        output_white = gr.Image(label="白色背景")
        output_blue = gr.Image(label="蓝色背景")
        output_red = gr.Image(label="红色背景")
    
    submit_btn.click(
        fn=process_image,
        inputs=[input_image, color_choice],
        outputs=[output_white, output_blue, output_red],
        api_name="predict"  # 添加 API 名称，供 JavaScript 调用
    )
    
    gr.Markdown("""
    ### 💡 使用说明
    - 上传证件照后，选择需要的背景颜色
    - 点击"开始处理"按钮
    - 等待几秒钟，即可看到处理结果
    - 右键点击图片可以保存
    
    ### 🔧 技术特点
    - 使用 OpenCV K-means 聚类算法
    - 自动识别背景区域
    - 边缘平滑处理
    - 效果自然，不会改变头发颜色
    """)

if __name__ == "__main__":
    demo.launch()


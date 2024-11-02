document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const quality = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');
    const formatSelect = document.getElementById('formatSelect');
    const maxWidth = document.getElementById('maxWidth');
    const downloadAllBtn = document.getElementById('downloadAllBtn');

    let imageFiles = []; // 存储所有待处理的图片

    // 上传区域点击事件
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#0056b3';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#007AFF';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/'));
        if (files.length > 0) {
            imageFiles = files;
            handleImages(files);
        }
    });

    // 文件选择处理
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            imageFiles = files;
            handleImages(files);
        }
    });

    // 质量滑块事件
    quality.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
        const file = fileInput.files[0];
        if (file) {
            compressImage(file, e.target.value / 100);
        }
    });

    // 图片处理函数
    function handleImage(file) {
        // 显示原始图片信息
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalSize.textContent = `大小: ${(file.size / 1024).toFixed(2)} KB`;
            previewArea.style.display = 'block';
            compressImage(file, quality.value / 100);
        };
        reader.readAsDataURL(file);
    }

    // 图片压缩函数
    function compressImage(file, qualityValue, index) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                const maxWidthValue = parseInt(maxWidth.value);
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidthValue) {
                    height = (maxWidthValue * height) / width;
                    width = maxWidthValue;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const format = formatSelect.value;
                const mimeType = `image/${format}`;
                const compressedDataUrl = canvas.toDataURL(mimeType, qualityValue);
                
                if (typeof index === 'undefined') {
                    compressedImage.src = compressedDataUrl;
                    const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
                    document.getElementById('compressedSize').textContent = 
                        `压缩后: ${(compressedSize / 1024).toFixed(2)} KB`;
                } else {
                    const imgElement = document.getElementById(`compressed-${index}`);
                    if (imgElement) {
                        imgElement.src = compressedDataUrl;
                        const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
                        document.getElementById(`compressed-size-${index}`).textContent = 
                            `压缩后: ${(compressedSize / 1024).toFixed(2)} KB`;
                    }
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 下载按钮事件
    downloadBtn.addEventListener('click', () => {
        const compressedImg = document.querySelector('.compressed img');
        if (!compressedImg || !compressedImg.src) return;

        const format = formatSelect.value;
        const link = document.createElement('a');
        link.download = `compressed-image.${format}`;
        link.href = compressedImg.src;
        link.click();
    });

    // 新增：处理多个图片
    function handleImages(files) {
        previewArea.style.display = 'block';
        const imageContainer = document.querySelector('.image-container');
        imageContainer.innerHTML = ''; // 清空现有内容

        files.forEach((file, index) => {
            const imageItem = createImagePreviewElement(file, index);
            imageContainer.appendChild(imageItem);
            compressImage(file, quality.value / 100, index);
        });
    }

    // 新增：创建图片预览元素
    function createImagePreviewElement(file, index) {
        const div = document.createElement('div');
        div.className = 'image-item';
        div.innerHTML = `
            <h4>${file.name}</h4>
            <img id="original-${index}" class="preview">
            <img id="compressed-${index}" class="preview">
            <p id="original-size-${index}">原始大小: ${(file.size / 1024).toFixed(2)} KB</p>
            <p id="compressed-size-${index}"></p>
        `;
        return div;
    }

    // 新增：打包下载所有图片
    downloadAllBtn.addEventListener('click', async () => {
        if (!imageFiles.length) return;
        
        try {
            const zip = new JSZip();
            const compressedImages = document.querySelectorAll('[id^="compressed-"]');
            
            compressedImages.forEach((img, index) => {
                if (img.src) {
                    const base64Data = img.src.split(',')[1];
                    const format = formatSelect.value;
                    const fileName = imageFiles[index].name.replace(/\.[^/.]+$/, '') + `-compressed.${format}`;
                    zip.file(fileName, base64Data, {base64: true});
                }
            });
            
            const content = await zip.generateAsync({type: 'blob'});
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = 'compressed-images.zip';
            link.click();
            
            setTimeout(() => URL.revokeObjectURL(link.href), 0);
        } catch (error) {
            console.error('打包下载出错:', error);
            alert('打包下载失败，请重试');
        }
    });

    // 更新压缩参数时重新处理所有图片
    quality.addEventListener('input', updateAllImages);
    formatSelect.addEventListener('change', updateAllImages);
    maxWidth.addEventListener('input', updateAllImages);

    function updateAllImages() {
        if (imageFiles.length > 0) {
            handleImages(imageFiles);
        }
    }
}); 
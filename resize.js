document.addEventListener('DOMContentLoaded', () => {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const originalImage = document.getElementById('originalImage');
    const resizedImage = document.getElementById('resizedImage');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const lockAspect = document.getElementById('lockAspect');
    const formatSelect = document.getElementById('formatSelect');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalWidth = 0;
    let originalHeight = 0;
    let aspectRatio = 1;

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
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImage(file);
        }
    });

    // 文件选择处理
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImage(file);
        }
    });

    // 处理图片上传
    function handleImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                originalWidth = img.width;
                originalHeight = img.height;
                aspectRatio = originalWidth / originalHeight;

                // 显示原始尺寸
                document.getElementById('originalDimensions').textContent = 
                    `尺寸: ${originalWidth} × ${originalHeight}`;
                
                // 设置初始调整尺寸
                widthInput.value = originalWidth;
                heightInput.value = originalHeight;

                originalImage.src = e.target.result;
                previewArea.style.display = 'block';
                
                // 生成预览
                updateResizedImage();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 更新调整后的图片
    function updateResizedImage() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(originalImage, 0, 0, width, height);
        
        const format = formatSelect.value;
        const mimeType = `image/${format}`;
        resizedImage.src = canvas.toDataURL(mimeType, 1.0);
        
        document.getElementById('resizedDimensions').textContent = 
            `尺寸: ${width} × ${height}`;
    }

    // 宽度输入处理
    widthInput.addEventListener('input', () => {
        if (lockAspect.checked) {
            const width = parseInt(widthInput.value);
            heightInput.value = Math.round(width / aspectRatio);
        }
        updateResizedImage();
    });

    // 高度输入处理
    heightInput.addEventListener('input', () => {
        if (lockAspect.checked) {
            const height = parseInt(heightInput.value);
            widthInput.value = Math.round(height * aspectRatio);
        }
        updateResizedImage();
    });

    // 格式选择处理
    formatSelect.addEventListener('change', updateResizedImage);

    // 下载按钮处理
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        const format = formatSelect.value;
        link.download = `resized-image.${format}`;
        link.href = resizedImage.src;
        link.click();
    });
}); 
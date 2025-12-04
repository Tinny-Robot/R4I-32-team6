document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const photo = document.getElementById('photo');
    
    // Controls
    const cameraControls = document.getElementById('camera-controls');
    const postCaptureControls = document.getElementById('post-capture-controls');
    
    // Buttons
    const captureButton = document.getElementById('capture-button');
    const retakeButton = document.getElementById('retake-button');
    const analyzeButton = document.getElementById('analyze-button');
    const rotateButton = document.getElementById('rotate-btn');
    const uploadButton = document.getElementById('upload-btn');
    const fileInput = document.getElementById('file-input');
    const focusRing = document.getElementById('focus-ring');
    
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    
    // Progress Bar Elements
    const progressContainer = document.getElementById('loader-progress-container');
    const progressBar = document.getElementById('loader-progress-bar');
    
    let stream = null;
    let facingMode = 'environment'; // Default to back camera

    // Initialize Camera
    async function initCamera() {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            
            stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                } 
            });
            video.srcObject = stream;
            errorMessage.style.display = 'none';
            
            // Ensure video plays (sometimes needed for iOS)
            video.play().catch(e => console.log("Video play error:", e));
            
        } catch (err) {
            console.error("Error accessing camera: ", err);
            errorMessage.textContent = "Could not access camera. Please ensure you have granted permissions.";
            errorMessage.style.display = 'block';
        }
    }

    // Start camera on load
    initCamera();

    // Touch to Focus Logic
    video.addEventListener('click', async (e) => {
        if (!stream) return;

        const rect = video.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Show focus ring
        focusRing.style.left = `${x}px`;
        focusRing.style.top = `${y}px`;
        focusRing.classList.remove('active');
        void focusRing.offsetWidth; // Trigger reflow to restart animation
        focusRing.classList.add('active');

        // Attempt to focus camera (Best Effort)
        const track = stream.getVideoTracks()[0];
        if (!track) return;

        try {
            const capabilities = track.getCapabilities();
            
            // If the device supports focusMode
            if (capabilities.focusMode) {
                // Try to set to continuous or auto to trigger a re-focus
                // Note: 'pointsOfInterest' is not standard yet, so we rely on the device's autofocus behavior
                // toggling focus mode can sometimes force a re-focus
                await track.applyConstraints({
                    advanced: [{ focusMode: 'auto' }]
                });
                
                // Revert to continuous after a short delay if supported
                if (capabilities.focusMode.includes('continuous')) {
                    setTimeout(async () => {
                        await track.applyConstraints({
                            advanced: [{ focusMode: 'continuous' }]
                        });
                    }, 1000);
                }
            }
        } catch (err) {
            console.log("Focus adjustment failed (not supported on this device):", err);
        }
    });

    // Rotate Camera
    rotateButton.addEventListener('click', () => {
        facingMode = facingMode === 'environment' ? 'user' : 'environment';
        initCamera();
    });

    // Capture Photo
    captureButton.addEventListener('click', () => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const data = canvas.toDataURL('image/jpeg');
        photo.setAttribute('src', data);
        
        showPostCaptureUI();
    });

    // Upload Image
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Resize image if it's too large
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const maxWidth = 1024;
                    const maxHeight = 1024;
                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth || height > maxHeight) {
                        if (width > height) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        } else {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8); // Compress to 80% quality
                    photo.setAttribute('src', dataUrl);
                    showPostCaptureUI();
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    // Retake
    retakeButton.addEventListener('click', () => {
        photo.style.display = 'none';
        video.style.display = 'block';
        
        cameraControls.style.display = 'flex';
        postCaptureControls.style.display = 'none';
        
        // Restart camera if it was stopped (optional, but good practice)
        if (!stream || !stream.active) {
            initCamera();
        }
    });

    // Analyze
    analyzeButton.addEventListener('click', async () => {
        const imageData = photo.getAttribute('src');
        
        if (window.showLoader) window.showLoader();
        const loaderText = document.getElementById('loader-text');
        if (loaderText) {
            loaderText.style.display = 'block';
            loaderText.textContent = "Scanning image";
        }
        
        // Show and animate progress bar
        if (progressContainer && progressBar) {
            progressContainer.style.display = 'block';
            progressBar.classList.remove('progress-animate');
            void progressBar.offsetWidth; // Trigger reflow
            progressBar.classList.add('progress-animate');
        }

        // Text rotation logic with animated dots
        const messages = [
            "Scanning image",
            "Identifying product",
            "Checking ingredients",
            "Generating audio"
        ];
        
        let msgIndex = 0;
        let dotCount = 0;
        let tickCount = 0;
        const ticksPerMessage = 7; // 3.5s / 500ms = 7

        const textInterval = setInterval(() => {
            if (!loaderText) return;

            tickCount++;
            dotCount = (dotCount + 1) % 4;
            const dots = ".".repeat(dotCount);

            // Switch message every few seconds
            if (tickCount >= ticksPerMessage) {
                tickCount = 0;
                if (msgIndex < messages.length - 1) {
                    msgIndex++;
                }
            }
            
            loaderText.textContent = messages[msgIndex] + dots;
        }, 500);

        analyzeButton.disabled = true;
        retakeButton.disabled = true;
        errorMessage.style.display = 'none';

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ image_data: imageData })
            });

            clearInterval(textInterval); // Stop rotation

            const result = await response.json();

            if (response.ok && result.success) {
                window.location.href = result.redirect_url;
            } else {
                throw new Error(result.error || 'Analysis failed');
            }
        } catch (err) {
            clearInterval(textInterval); // Stop rotation
            console.error(err);
            errorMessage.textContent = err.message;
            errorMessage.style.display = 'block';
            if (window.hideLoader) window.hideLoader();
            const loaderText = document.getElementById('loader-text');
            if (loaderText) loaderText.style.display = 'none';
            
            // Hide progress bar
            if (progressContainer && progressBar) {
                progressContainer.style.display = 'none';
                progressBar.classList.remove('progress-animate');
            }

            analyzeButton.disabled = false;
            retakeButton.disabled = false;
        }
    });

    function showPostCaptureUI() {
        video.style.display = 'none';
        photo.style.display = 'block';
        
        cameraControls.style.display = 'none';
        postCaptureControls.style.display = 'flex';
    }
});

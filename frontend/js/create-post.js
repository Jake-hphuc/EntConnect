document.addEventListener('DOMContentLoaded', () => {
    initCreatePostForm();
});

function initCreatePostForm() {
    const tabs = document.querySelectorAll('.mp-form-tab');
    const postTypeInput = document.getElementById('postType');
    
    // Tab Switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const type = tab.getAttribute('data-type');
            postTypeInput.value = type;
            
            // Adjust form fields based on type
            adjustFormFields(type);
        });
    });
    
    // Image Preview
    const imageInput = document.getElementById('postImage');
    const previewContainer = document.getElementById('imagePreview');
    
    imageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewContainer.classList.remove('d-none');
                previewContainer.querySelector('img').src = e.target.result;
            }
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Form Submit
    const form = document.getElementById('createPostForm');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Mock validate auth
        if (typeof window.currentUser === 'undefined' && false) { // disable for demo
            showToast('Vui lòng đăng nhập để đăng bài!', 'error');
            return;
        }
        
        // Disable button
        const btn = form.querySelector('button[type="submit"]');
        const oldText = btn.innerHTML;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Đang xử lý...';
        btn.disabled = true;
        
        // Mock API Call
        setTimeout(() => {
            showToast('Đăng bài thành công! Đang chuyển hướng...', 'success');
            setTimeout(() => {
                window.location.href = '/marketplace.html';
            }, 2000);
        }, 1500);
    });
}

function adjustFormFields(type) {
    const categorySelect = document.getElementById('postCategory');
    const titleInput = document.getElementById('postTitle');
    
    switch(type) {
        case 'event':
            categorySelect.value = 'music';
            titleInput.placeholder = 'Ví dụ: Đêm nhạc Acoustic cuối tuần...';
            break;
        case 'gaming':
            categorySelect.value = 'gaming';
            titleInput.placeholder = 'Ví dụ: Tìm Dual Rank Kim Cương LOL...';
            break;
        case 'chat':
            categorySelect.value = 'chat';
            titleInput.placeholder = 'Ví dụ: Lắng nghe tâm sự, trò chuyện đêm khuya...';
            break;
        case 'parttime':
            categorySelect.value = 'other';
            titleInput.placeholder = 'Ví dụ: Tuyển PG/PB cho sự kiện game...';
            break;
    }
}

function showToast(message, type = 'success') {
    const container = document.getElementById('mpToastContainer');
    if (!container) return;
    
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';
    
    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0 mb-2" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', toastHtml);
    const toastEl = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    
    toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
    });
}

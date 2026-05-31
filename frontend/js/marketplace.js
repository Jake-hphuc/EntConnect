import { marketplaceUsers, marketplacePosts } from './utils/mock-data.js';

document.addEventListener('DOMContentLoaded', () => {
    initMarketplace();
});

function initMarketplace() {
    renderStats();
    renderPosts(marketplacePosts);
    renderLeaderboard();
    
    // Bind filters
    const searchInput = document.getElementById('mp-search');
    const categorySelect = document.getElementById('mp-category');
    const modeRadios = document.querySelectorAll('input[name="mpMode"]');
    const btnReset = document.getElementById('mp-btn-reset');
    
    const applyFilters = () => {
        const keyword = searchInput.value.toLowerCase();
        const category = categorySelect.value;
        const mode = document.querySelector('input[name="mpMode"]:checked').value;
        
        let filtered = marketplacePosts.filter(post => {
            const matchKeyword = post.title.toLowerCase().includes(keyword) || 
                                 post.description.toLowerCase().includes(keyword) ||
                                 post.tags.some(tag => tag.toLowerCase().includes(keyword));
            const matchCategory = category === 'all' || post.category === category;
            const matchMode = mode === 'all' || post.mode === mode;
            
            return matchKeyword && matchCategory && matchMode;
        });
        
        renderPosts(filtered);
    };
    
    searchInput.addEventListener('input', applyFilters);
    categorySelect.addEventListener('change', applyFilters);
    modeRadios.forEach(radio => radio.addEventListener('change', applyFilters));
    
    btnReset.addEventListener('click', () => {
        searchInput.value = '';
        categorySelect.value = 'all';
        document.getElementById('modeAll').checked = true;
        renderPosts(marketplacePosts);
    });
}

function renderStats() {
    // Simple animated counter
    const animateValue = (id, start, end, duration) => {
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / (end - start)));
        const obj = document.getElementById(id);
        if(!obj) return;
        const timer = setInterval(() => {
            current += increment;
            obj.innerHTML = current;
            if (current == end) {
                clearInterval(timer);
            }
        }, stepTime);
    };
    
    setTimeout(() => {
        animateValue("stat-posts", 0, marketplacePosts.length * 15, 1500);
        animateValue("stat-online", 0, 128, 2000);
        animateValue("stat-bookings", 0, 45, 1000);
    }, 500);
}

function renderPosts(posts) {
    const container = document.getElementById('mp-posts-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                <h5 class="mt-3 text-muted">Không tìm thấy bài đăng phù hợp</h5>
                <p class="text-muted small">Vui lòng thử lại với từ khóa hoặc bộ lọc khác.</p>
            </div>
        `;
        return;
    }
    
    posts.forEach(post => {
        const author = marketplaceUsers.find(u => u.id === post.authorId);
        if (!author) return;
        
        const tagsHtml = post.tags.map(tag => `<span class="mp-tag">#${tag}</span>`).join('');
        const statusBadge = post.mode === 'online' ? '<span class="badge bg-success bg-opacity-10 text-success ms-2">Online</span>' : '<span class="badge bg-primary bg-opacity-10 text-primary ms-2">Offline</span>';
        
        const cardHtml = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="mp-card">
                    <div class="mp-card-img-wrapper">
                        <img src="${post.thumbnail}" class="mp-card-img" alt="thumbnail" loading="lazy">
                        <div class="mp-card-badge">${formatPrice(post.price)}/${post.priceUnit}</div>
                    </div>
                    
                    <div class="mp-card-author">
                        <img src="${author.avatar}" class="mp-author-avatar" alt="avatar">
                        <div>
                            <div class="mp-author-name">${author.name} ${author.online ? '<i class="bi bi-circle-fill text-success" style="font-size: 8px; vertical-align: middle;"></i>' : ''}</div>
                            <div class="small text-muted"><i class="bi bi-star-fill text-warning"></i> ${author.rating} (${author.reviewsCount})</div>
                        </div>
                    </div>
                    
                    <h5 class="mp-card-title">${post.title}</h5>
                    <div class="mb-2">
                        ${tagsHtml}
                        ${statusBadge}
                    </div>
                    
                    <div class="mp-card-footer mt-auto">
                        <div class="text-muted small"><i class="bi bi-people-fill me-1"></i> ${post.joined}/${post.slots}</div>
                        <button class="btn btn-primary btn-sm rounded-pill px-3" onclick="window.openDetailModal(${post.id})">Xem chi tiết</button>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHtml);
    });
}

function renderLeaderboard() {
    const container = document.getElementById('mp-leaderboard-container');
    if (!container) return;
    
    // Sort users by reputation
    const topUsers = [...marketplaceUsers].sort((a, b) => b.reputation - a.reputation).slice(0, 5);
    
    let html = '<div class="list-group list-group-flush">';
    topUsers.forEach((user, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'top-1';
        else if (index === 1) rankClass = 'top-2';
        else if (index === 2) rankClass = 'top-3';
        
        html += `
            <div class="list-group-item mp-lb-item">
                <div class="mp-lb-rank ${rankClass}">${index + 1}</div>
                <img src="${user.avatar}" class="rounded-circle me-3" width="40" height="40" style="object-fit:cover;">
                <div class="flex-grow-1">
                    <h6 class="mb-0 fw-bold">${user.name} <span class="badge bg-info ms-1">${user.level}</span></h6>
                    <small class="text-muted"><i class="bi bi-star-fill text-warning"></i> ${user.rating}</small>
                </div>
                <div class="text-end">
                    <div class="fw-bold text-primary">${user.reputation}</div>
                    <small class="text-muted">điểm</small>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function formatPrice(price) {
    if (price === 0) return "Miễn phí";
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Expose to window for inline onclick handler
window.openDetailModal = (postId) => {
    const post = marketplacePosts.find(p => p.id === postId);
    if (!post) return;
    const author = marketplaceUsers.find(u => u.id === post.authorId);
    
    const body = document.getElementById('mpDetailBody');
    body.innerHTML = `
        <img src="${post.thumbnail}" class="w-100" style="height: 300px; object-fit: cover;" alt="Cover">
        <div class="p-4">
            <div class="d-flex justify-content-between align-items-start mb-3">
                <h3 class="fw-bold mb-0">${post.title}</h3>
                <h4 class="text-primary fw-bold mb-0">${formatPrice(post.price)}<span class="fs-6 text-muted fw-normal">/${post.priceUnit}</span></h4>
            </div>
            
            <div class="d-flex gap-2 mb-4">
                ${post.tags.map(tag => `<span class="badge bg-light text-dark border">#${tag}</span>`).join('')}
                <span class="badge ${post.mode === 'online' ? 'bg-success' : 'bg-primary'}">${post.mode.toUpperCase()}</span>
            </div>
            
            <div class="row mb-4">
                <div class="col-sm-6 mb-3 mb-sm-0">
                    <div class="d-flex align-items-center p-3 bg-light rounded-3">
                        <i class="bi bi-calendar-event fs-3 text-primary me-3"></i>
                        <div>
                            <div class="small text-muted">Thời gian</div>
                            <div class="fw-bold">${new Date(post.datetime).toLocaleString('vi-VN')}</div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="d-flex align-items-center p-3 bg-light rounded-3">
                        <i class="bi bi-geo-alt fs-3 text-danger me-3"></i>
                        <div>
                            <div class="small text-muted">Địa điểm</div>
                            <div class="fw-bold">${post.location}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <h5 class="fw-bold mb-3">Mô tả chi tiết</h5>
            <p class="text-muted" style="white-space: pre-line;">${post.description}</p>
            
            <hr class="my-4">
            
            <div class="d-flex justify-content-between align-items-center bg-light p-3 rounded-4">
                <div class="d-flex align-items-center gap-3">
                    <img src="${author.avatar}" class="rounded-circle" width="50" height="50" style="object-fit:cover;">
                    <div>
                        <div class="fw-bold fs-5">${author.name} <i class="bi bi-check-circle-fill text-primary" title="Đã xác thực"></i></div>
                        <div class="text-muted small"><i class="bi bi-star-fill text-warning"></i> ${author.rating} (${author.reviewsCount} đánh giá) • Cấp ${author.level}</div>
                    </div>
                </div>
                <button class="btn btn-outline-primary rounded-circle" title="Nhắn tin" style="width:45px; height:45px;"><i class="bi bi-chat-dots-fill"></i></button>
            </div>
            
            <div class="mt-4 text-center">
                <p class="text-muted small mb-2"><i class="bi bi-people"></i> Đã tham gia: <b>${post.joined}/${post.slots}</b> người</p>
                <button class="btn btn-primary btn-lg rounded-pill w-100 shadow-sm" onclick="window.initBookingFlow(${post.id})">Tham Gia / Đặt Lịch Ngay</button>
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('mpDetailModal'));
    modal.show();
};

window.initBookingFlow = (postId) => {
    // Hide current modal, show toast or next modal
    const currentModal = bootstrap.Modal.getInstance(document.getElementById('mpDetailModal'));
    if (currentModal) currentModal.hide();
    
    // Quick mock booking redirect or action (to be implemented in booking.js, here we just show a toast for demo)
    if (!window.currentUser && false) { // disable auth check for demo flow
        alert("Vui lòng đăng nhập để thực hiện tính năng này!");
        return;
    }
    
    // Redirect to a specific booking modal or page. For MVP, we will use a global booking object from booking.js
    if (window.showBookingModal) {
        window.showBookingModal(postId);
    } else {
        showToast('Đang chuyển hướng đến trang thanh toán...', 'info');
    }
};

window.showToast = (message, type = 'success') => {
    const container = document.getElementById('mpToastContainer');
    if (!container) return;
    
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : (type === 'error' ? 'bg-danger' : 'bg-primary');
    
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
};

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
    const animateValue = (id, start, end, duration) => {
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / (end - start)));
        const obj = document.getElementById(id);
        if (!obj) return;
        const timer = setInterval(() => {
            current += increment;
            obj.innerHTML = current;
            if (current == end) clearInterval(timer);
        }, stepTime);
    };
    
    setTimeout(() => {
        animateValue('stat-posts', 0, marketplacePosts.length * 15, 1500);
        animateValue('stat-online', 0, 128, 2000);
        animateValue('stat-bookings', 0, 45, 1000);
    }, 500);
}

function renderPosts(posts) {
    const container = document.getElementById('mp-posts-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="mp-empty-state">
                    <i class="bi bi-search d-block"></i>
                    <h5 class="fw-bold mt-2 mb-1">Không tìm thấy bài đăng</h5>
                    <p class="text-muted small">Thử lại với từ khóa hoặc bộ lọc khác.</p>
                </div>
            </div>
        `;
        return;
    }
    
    posts.forEach(post => {
        const author = marketplaceUsers.find(u => u.id === post.authorId);
        if (!author) return;
        
        const tagsHtml = post.tags.slice(0, 3).map(tag => `<span class="mp-tag">#${tag}</span>`).join('');
        const modeBadge = post.mode === 'online'
            ? `<span class="mp-card-mode-badge badge bg-success bg-opacity-85 text-white">Online</span>`
            : `<span class="mp-card-mode-badge badge bg-primary bg-opacity-85 text-white">Offline</span>`;
        
        const priceHtml = post.price === 0
            ? `<span class="mp-price-free"><i class="bi bi-gift-fill me-1"></i>Miễn phí</span>`
            : `<span class="mp-price">${formatPrice(post.price)}<span class="text-muted fw-normal" style="font-size:0.72rem;-webkit-text-fill-color:initial;">/${post.priceUnit}</span></span>`;

        const onlineDot = author.online
            ? `<i class="bi bi-circle-fill text-success ms-1" style="font-size:7px;vertical-align:middle;"></i>`
            : '';

        const cardHtml = `
            <div class="col-md-6 col-lg-4">
                <div class="mp-card">
                    <div class="mp-card-img-wrapper">
                        <img src="${post.thumbnail}" class="mp-card-img" alt="${post.title}" loading="lazy"
                             onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80'">
                        <div class="mp-card-badge">${formatPrice(post.price)}/${post.priceUnit}</div>
                        ${modeBadge}
                    </div>
                    <div class="mp-card-body">
                        <div class="mp-card-author">
                            <img src="${author.avatar}" class="mp-author-avatar" alt="${author.name}"
                                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=6366f1&color=fff'">
                            <div class="mp-author-info">
                                <div class="mp-author-name">${author.name}${onlineDot}</div>
                                <div class="mp-author-rating"><i class="bi bi-star-fill text-warning" style="font-size:10px;"></i> ${author.rating} (${author.reviewsCount})</div>
                            </div>
                        </div>
                        <h5 class="mp-card-title">${post.title}</h5>
                        <div class="mp-card-tags">${tagsHtml}</div>
                        <div class="mp-card-footer">
                            ${priceHtml}
                            <button class="btn btn-sm" onclick="window.openDetailModal(${post.id})">
                                <i class="bi bi-eye me-1"></i>Xem chi tiết
                            </button>
                        </div>
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
    
    const topUsers = [...marketplaceUsers].sort((a, b) => b.reputation - a.reputation).slice(0, 5);
    
    const rankEmoji = ['🥇', '🥈', '🥉', '4', '5'];
    
    let html = '';
    topUsers.forEach((user, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'top-1';
        else if (index === 1) rankClass = 'top-2';
        else if (index === 2) rankClass = 'top-3';
        
        html += `
            <div class="mp-lb-item">
                <div class="mp-lb-rank ${rankClass}">${index < 3 ? rankEmoji[index] : index + 1}</div>
                <img src="${user.avatar}" class="mp-lb-avatar" alt="${user.name}"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff'">
                <div class="flex-grow-1">
                    <div class="mp-lb-name">${user.name} <span class="badge ms-1" style="background:rgba(99,102,241,0.12);color:#6366f1;font-size:0.65rem;">${user.level}</span></div>
                    <small class="text-muted"><i class="bi bi-star-fill text-warning" style="font-size:10px;"></i> ${user.rating}</small>
                </div>
                <div class="text-end">
                    <div class="mp-lb-score">${user.reputation}</div>
                    <div class="mp-lb-score-label">điểm</div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function formatPrice(price) {
    if (price === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

// Expose to window for inline onclick handler
window.openDetailModal = (postId) => {
    const post = marketplacePosts.find(p => p.id === postId);
    if (!post) return;
    const author = marketplaceUsers.find(u => u.id === post.authorId);
    
    const body = document.getElementById('mpDetailBody');
    body.innerHTML = `
        <div style="position:relative;height:280px;overflow:hidden;">
            <img src="${post.thumbnail}" class="w-100 h-100" style="object-fit:cover;"
                 onerror="this.src='https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80'" alt="Cover">
            <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 60%);"></div>
        </div>
        <div class="p-4">
            <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
                <h3 class="fw-bold mb-0">${post.title}</h3>
                <div style="font-family:'Outfit',sans-serif;font-size:1.2rem;font-weight:800;background:linear-gradient(135deg,#ec4899,#6366f1);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${formatPrice(post.price)}<span style="font-size:0.8rem;-webkit-text-fill-color:#64748b;font-weight:400;">/${post.priceUnit}</span></div>
            </div>
            
            <div class="d-flex flex-wrap gap-2 mb-4">
                ${post.tags.map(tag => `<span class="mp-tag">#${tag}</span>`).join('')}
                <span class="badge ${post.mode === 'online' ? 'bg-success' : 'bg-primary'} bg-opacity-90">${post.mode === 'online' ? 'Online' : 'Offline'}</span>
            </div>
            
            <div class="row g-3 mb-4">
                <div class="col-sm-6">
                    <div class="mp-info-block">
                        <i class="bi bi-calendar-event-fill"></i>
                        <div>
                            <div class="label">Thời gian</div>
                            <div class="value">${new Date(post.datetime).toLocaleString('vi-VN')}</div>
                        </div>
                    </div>
                </div>
                <div class="col-sm-6">
                    <div class="mp-info-block">
                        <i class="bi bi-geo-alt-fill" style="color:#ec4899;"></i>
                        <div>
                            <div class="label">Địa điểm</div>
                            <div class="value">${post.location}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <h6 class="fw-bold mb-2">Mô tả chi tiết</h6>
            <p class="text-muted mb-4" style="white-space:pre-line;line-height:1.7;">${post.description}</p>
            
            <div class="mp-author-card mb-4">
                <div class="d-flex align-items-center gap-3">
                    <img src="${author.avatar}" class="rounded-circle" width="50" height="50" style="object-fit:cover;border:2px solid rgba(99,102,241,0.3);"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}&background=6366f1&color=fff'">
                    <div>
                        <div class="fw-bold">${author.name} <i class="bi bi-check-circle-fill text-primary" title="Đã xác thực"></i></div>
                        <div class="text-muted small"><i class="bi bi-star-fill text-warning"></i> ${author.rating} (${author.reviewsCount} đánh giá) • Cấp ${author.level}</div>
                    </div>
                </div>
                <button class="btn btn-outline-primary rounded-circle flex-shrink-0" title="Nhắn tin" style="width:42px;height:42px;">
                    <i class="bi bi-chat-dots-fill"></i>
                </button>
            </div>
            
            <div class="text-center">
                <p class="text-muted small mb-3"><i class="bi bi-people-fill me-1"></i> Đã tham gia: <b>${post.joined}/${post.slots}</b> người</p>
                <button class="btn btn-primary btn-lg rounded-pill w-100 shadow-sm fw-bold" 
                        style="background:linear-gradient(135deg,#6366f1,#ec4899);border:none;"
                        onclick="window.initBookingFlow(${post.id})">
                    <i class="bi bi-lightning-charge-fill me-2"></i>Tham Gia / Đặt Lịch Ngay
                </button>
            </div>
        </div>
    `;
    
    const modal = new bootstrap.Modal(document.getElementById('mpDetailModal'));
    modal.show();
};

window.initBookingFlow = (postId) => {
    const currentModal = bootstrap.Modal.getInstance(document.getElementById('mpDetailModal'));
    if (currentModal) currentModal.hide();
    
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
        <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold">${message}</div>
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

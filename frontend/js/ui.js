/**
 * EntConnect - Shared UI Components V2
 * Centralized rendering logic for events and users with premium aesthetics
 */

const ui = {
    /**
     * Format currency to VND
     */
    formatPrice(amount) {
        if (!amount || amount === 0) return 'Miễn phí';
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    },

    /**
     * Format date to locale string
     */
    formatDate(dateStr, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
        if (!dateStr) return 'Sắp diễn ra';
        return new Date(dateStr).toLocaleDateString('vi-VN', options);
    },

    /**
     * Resolve image URL (Handle defaults and relative paths)
     */
    resolveImageUrl(path, type = 'activity', category = 'other') {
        if (!path) return this.resolveImageUrl('default-activity.png', type, category);
        
        // 1. If absolute URL, return as is
        if (path.startsWith('http')) return path;

        // 2. Handle Defaults
        if (path === 'default-activity.png' || path === 'default-avatar.png') {
            if (type === 'avatar') {
                return `https://i.pravatar.cc/150?u=${Math.random()}`;
            }
            
            // Fallback theme-based images – mỗi category có ảnh riêng phù hợp ngữ cảnh
            const themes = {
                // Gaming: Giải đấu eSports với sân khấu màn hình lớn chuyên nghiệp
                gaming: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=600&auto=format&fit=crop',
                // Sports: Đoàn người chạy marathon buổi sáng sớm trên đường phố
                sports: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=600&auto=format&fit=crop',
                // Music: Sân khấu concert ngoài trời, ánh đèn và đám đông
                music: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=600&auto=format&fit=crop',
                // Movies: Khán giả trong rạp chiếu phim hiện đại
                movies: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
                // Food: Cocktail pha chế đẹp mắt, không khí bar sinh động
                food: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop',
                // Travel: Nhóm cắm trại trên núi, lều trại thiên nhiên
                travel: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop',
                // Board Games: Nhóm người ngồi chơi board game tại quán cà phê
                board_games: 'https://images.unsplash.com/photo-1697571434898-a4fd2d9a3a62?q=80&w=600&auto=format&fit=crop',
                // Technology: Lập trình viên làm việc, màn hình code
                technology: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
                // Fashion: Sàn catwalk thời trang chuyên nghiệp
                fashion: 'https://images.unsplash.com/photo-1558618047-f4e90e45d511?q=80&w=600&auto=format&fit=crop',
                // Other: Sự kiện cộng đồng sôi động
                other: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop'
            };
            return themes[category] || themes.other;
        }

        // 3. Handle relative upload paths
        if (path.startsWith('uploads/')) {
            const baseUrl = (API_CONFIG && API_CONFIG.STORAGE_URL) ? API_CONFIG.STORAGE_URL : '';
            return `${baseUrl}/${path}`;
        }

        return path;
    },

    /**
     * Handle image load errors gracefully
     */
    handleImageError(img, type = 'activity', category = 'other') {
        img.onerror = null; // Prevent infinite loop
        
        if (type === 'avatar') {
            const name = img.alt || 'User';
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
            return;
        }

        // Color-based placeholders for activities
        const colors = {
            gaming: '6366f1',
            sports: '10b981',
            music: 'f59e0b',
            movies: 'ef4444',
            food: 'ec4899',
            travel: '3b82f6',
            technology: '06b6d4',
            other: '6b7280'
        };
        const color = colors[category] || colors.other;
        img.src = `https://placehold.co/600x400/${color}/ffffff?text=${category.toUpperCase()}`;
    },

    /**
     * Render a standard event card (Premium Edition V2 - with Payment Integration)
     */
    renderEventCard(event, options = {}) {
        const { isRecommended = false, className = 'col-md-6 col-lg-4', index = 0 } = options;
        
        const date = this.formatDate(event.schedule?.startDate);
        const participants = event.currentParticipants || 0;
        const max = event.maxParticipants || 1;
        const progress = (participants / max) * 100;
        const isFav = (window.userPrefs) ? userPrefs.isFavorite(event._id) : false;
        
        const price = event.pricing?.price || 0;
        const isFree = event.pricing?.isFree || price === 0;
        const originalPrice = event.pricing?.originalPrice || null;
        const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
        const priceTag = this.formatPrice(price);
        const pricingNote = event.pricing?.note || '';

        // Check if user already joined this event
        const isJoined = window.payment ? payment.isEventJoined(event._id) : false;

        return `
            <div class="${className} reveal-on-scroll active">
                <div class="event-card" style="animation-delay: ${index * 0.05}s">
                    <div class="card-image-wrapper">
                        <img src="${this.resolveImageUrl(event.coverImage, 'activity', event.category)}" 
                             onerror="ui.handleImageError(this, 'activity', '${event.category}')"
                             class="w-100 h-100 object-fit-cover" alt="${event.title}">
                        
                        <button class="btn-fav ${isFav ? 'active' : ''}" 
                                onclick="event.stopPropagation(); ui.handleToggleFav('${event._id}', '${event.category}', this)">
                            <i class="bi ${isFav ? 'bi-heart-fill' : 'bi-heart'}"></i>
                        </button>

                        ${isRecommended ? '<span class="recommendation-badge">🔥 Gợi ý AI</span>' : ''}
                        
                        ${isJoined ? '<div class="joined-overlay"><span class="badge bg-success rounded-pill px-3 py-2 shadow-sm fw-bold"><i class="bi bi-check-circle-fill me-1"></i>Đã tham gia</span></div>' : ''}
                        
                        <div class="position-absolute top-0 start-0 p-3">
                             <span class="badge glass-panel text-white rounded-pill px-3 fw-bold border-0" style="background: rgba(0,0,0,0.4)">${event.category.toUpperCase()}</span>
                        </div>

                        ${discount > 0 ? `<div class="position-absolute bottom-0 start-0 p-3"><span class="badge bg-danger rounded-pill px-3 py-2 fw-bold shadow-sm">-${discount}%</span></div>` : ''}
                    </div>
                    
                    <div class="p-4 d-flex flex-column flex-grow-1">
                        <div onclick="location.href='activity-detail.html?id=${event._id}'" style="cursor: pointer;">
                            <h5 class="fw-bold mb-2 font-outfit text-truncate-2">${event.title}</h5>
                            
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <i class="bi bi-geo-alt-fill text-primary small"></i>
                                <span class="text-muted small text-truncate">${event.location?.venue?.name || event.location?.platform || 'Toàn quốc'}</span>
                            </div>
                            <div class="d-flex align-items-center gap-2 mb-3">
                                <i class="bi bi-calendar-event text-primary small"></i>
                                <span class="text-muted small">${date}</span>
                            </div>
                        </div>
                        
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="badge ${isFree ? 'price-badge-free' : (discount > 0 ? 'price-badge-discount' : 'price-badge-paid')} px-3 py-2 rounded-3">
                                        ${isFree ? '🎁 Miễn phí' : (event.pricing?.packages ? 'Từ ' + priceTag : priceTag)}
                                    </span>
                                    ${originalPrice && !isFree ? `<span class="text-decoration-line-through text-muted x-small">${this.formatPrice(originalPrice)}</span>` : ''}
                                </div>
                                <div class="small fw-bold text-muted">${participants}/${max}</div>
                            </div>
                            ${pricingNote ? `<div class="small text-muted mb-2 text-truncate"><i class="bi bi-info-circle me-1"></i>${pricingNote}</div>` : ''}
                            ${event.pricing?.packages ? `<div class="small text-primary fw-bold mb-2"><i class="bi bi-layers me-1"></i>Có nhiều gói hỗ trợ</div>` : ''}
                            <div class="progress mb-3" style="height: 6px; border-radius: 20px; background: var(--border-color);">
                                <div class="progress-bar ${progress > 80 ? 'bg-danger' : 'bg-primary'}" 
                                     style="width: ${progress}%" role="progressbar"></div>
                            </div>
                            <div class="d-flex gap-2">
                                <a href="activity-detail.html?id=${event._id}" class="btn btn-outline-secondary btn-sm w-50 rounded-3 fw-bold py-2" onclick="event.stopPropagation()">Xem chi tiết</a>
                                ${isJoined 
                                    ? `<button class="btn btn-success btn-sm w-50 rounded-3 fw-bold py-2" disabled><i class="bi bi-check-circle"></i> Đã đ.ký</button>`
                                    : `<button class="btn ${isFree ? 'btn-outline-primary' : 'btn-primary'} btn-sm w-50 rounded-3 fw-bold py-2" 
                                             data-action="join-event" data-event-id="${event._id}"
                                             onclick="event.stopPropagation();">
                                        Tham gia ngay
                                       </button>`
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render a social user card (Buddy Connect)
     */
    renderUserCard(user) {
        const interestsHtml = user.interests.slice(0, 2).map(i => `<span class="badge bg-light text-dark fw-normal me-1">${i}</span>`).join('');
        
        return `
            <div class="user-card-sm flex-shrink-0">
                <div class="avatar-stack">
                    <img src="${this.resolveImageUrl(user.avatar, 'avatar')}" 
                         onerror="ui.handleImageError(this, 'avatar')"
                         alt="${user.username}">
                </div>
                <h6 class="fw-bold mb-1">${user.fullName}</h6>
                <p class="x-small text-muted mb-2 text-truncate">${user.bio}</p>
                <div class="mb-3">${interestsHtml}</div>
                <button class="btn btn-primary-soft btn-sm w-100 rounded-pill text-primary fw-bold border-0" 
                        style="background: var(--primary-soft);" onclick="api.toast('Đã gửi yêu cầu kết nối!', 'success')">Kết nối</button>
            </div>
        `;
    },

    /**
     * Centralized Favorite Toggle
     */
    handleToggleFav(id, category, el) {
        if (!window.userPrefs) return;
        const isAdded = userPrefs.toggleFavorite(id, category);
        const icon = el.querySelector('i');
        if (isAdded) {
            el.classList.add('active');
            icon.classList.replace('bi-heart', 'bi-heart-fill');
        } else {
            el.classList.remove('active');
            icon.classList.replace('bi-heart-fill', 'bi-heart');
        }
    },

    /**
     * Show/Hide loading skeleton (Premium Edition)
     */
    showSkeleton(container, count = 3, colClass = 'col-md-4') {
        if (!container) return;
        container.innerHTML = Array(count).fill(0).map(() => `
            <div class="${colClass}">
                <div class="glass-card p-0 overflow-hidden border-0 shadow-sm" style="min-height: 380px; border-radius: 24px;">
                    <div class="skeleton-img skeleton"></div>
                    <div class="p-4">
                        <div class="skeleton-title skeleton mb-3"></div>
                        <div class="skeleton-text skeleton mb-2"></div>
                        <div class="skeleton-text skeleton mb-4" style="width: 50%;"></div>
                        <div class="d-flex gap-2 mt-4">
                            <div class="skeleton flex-grow-1" style="height: 40px; border-radius: 12px;"></div>
                            <div class="skeleton flex-grow-1" style="height: 40px; border-radius: 12px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Empty state helper
     */
    renderEmptyState(container, message = 'Hiện tại chưa có dữ liệu.') {
        if (!container) return;
        container.innerHTML = `
            <div class="col-12 text-center py-5 opacity-75">
                <i class="bi bi-inbox display-1 d-block mb-3"></i>
                <p class="fs-5">${message}</p>
            </div>
        `;
    },

    /**
     * Initialize Theme Toggle
     */
    initThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle-btn');
        if (!toggleBtn) return;

        const icon = toggleBtn.querySelector('i');
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        const setTheme = (theme) => {
            document.documentElement.setAttribute('data-bs-theme', theme);
            if (theme === 'dark') {
                icon.classList.replace('bi-moon-stars', 'bi-sun-fill');
                toggleBtn.classList.replace('text-dark', 'text-light');
            } else {
                icon.classList.replace('bi-sun-fill', 'bi-moon-stars');
                toggleBtn.classList.replace('text-light', 'text-dark');
            }
        };

        // Apply on load
        setTheme(currentTheme);

        // Toggle action
        toggleBtn.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            setTheme(newTheme);
        });
    },

    /**
     * Scroll to top logic
     */
    initScrollToTop() {
        const btnHtml = `<button id="btn-scroll-top" class="scroll-to-top"><i class="bi bi-arrow-up"></i></button>`;
        document.body.insertAdjacentHTML('beforeend', btnHtml);
        
        const btn = document.getElementById('btn-scroll-top');
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        });
        
        btn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    },

    /**
     * Render a compact event card (Matching user's example image)
     */
    renderCompactEventCard(event, { index = 0, className = 'col-md-3' } = {}) {
        const date = event.schedule?.startDate ? new Date(event.schedule.startDate).toLocaleDateString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        }) : 'Sắp diễn ra';
        
        const price = event.pricing?.price || 0;
        const priceTag = this.formatPrice(price);
        const isJoined = window.payment ? payment.isEventJoined(event._id) : false;

        return `
            <div class="${className} reveal-on-scroll">
                <div class="compact-event-card" style="animation-delay: ${index * 0.05}s">
                    <div class="compact-card-image" onclick="location.href='activity-detail.html?id=${event._id}'" style="cursor:pointer; height: 160px; overflow: hidden; border-radius: 12px;">
                        <img src="${this.resolveImageUrl(event.coverImage, 'activity', event.category)}" 
                             onerror="ui.handleImageError(this, 'activity', '${event.category}')"
                             class="w-100 h-100 object-fit-cover"
                             alt="${event.title}">
                        ${isJoined ? '<div class="compact-joined-badge" style="position:absolute; top:10px; right:10px; background:white; border-radius:50%; width:24px; height:24px; display:flex; align-items:center; justify-content:center; color:#198754; box-shadow: 0 2px 5px rgba(0,0,0,0.2);"><i class="bi bi-check-circle-fill"></i></div>' : ''}
                    </div>
                    <div class="compact-card-body mt-3">
                        <h6 class="fw-bold mb-1 text-truncate-2" title="${event.title}" 
                            onclick="location.href='activity-detail.html?id=${event._id}'" style="cursor:pointer; font-size: 0.95rem;">
                            ${event.title}
                        </h6>
                        <div class="text-success fw-bold mb-1 small" style="color: #28a745 !important;">Từ ${priceTag}</div>
                        <div class="text-muted x-small d-flex align-items-center gap-1 opacity-75">
                            <i class="bi bi-calendar3"></i> ${date}
                        </div>
                        <div class="mt-2">
                             <button class="btn btn-sm btn-primary-soft w-100 rounded-pill py-1 fw-bold text-primary border-0" 
                                     style="background: rgba(13, 110, 253, 0.1); font-size: 0.75rem;"
                                     data-action="join-event" data-event-id="${event._id}">
                                 Tham gia ngay
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

window.ui = ui;

document.addEventListener('DOMContentLoaded', () => {
    ui.initThemeToggle();
    ui.initScrollToTop();
});

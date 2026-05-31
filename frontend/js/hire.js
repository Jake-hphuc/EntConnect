/**
 * EntConnect - Hire Page Controller
 * Quản lý tìm kiếm, lọc, hiển thị companion cards, modal chi tiết, chat nhanh
 */

const hirePage = {
    companions: [],
    filteredList: [],
    selectedCompanion: null,
    chatOpen: false,
    chatTarget: null,
    searchTimeout: null,

    // ===== Auction State =====
    auctions: [],
    selectedAuction: null,
    auctionTimerInterval: null,
    rivalBidTimeouts: {},

    filterState: {
        keyword: '',
        service: 'all',
        priceRange: 'all',
        rating: 'all',
        status: 'all',
        sort: 'default'
    },

    /** Khởi tạo trang */
    init() {
        this.loadCompanions();
        this.loadAuctions();
        this.attachEventListeners();
        this.startAuctionTimers();
        // Render booking history nếu đã đăng nhập
        if (window.bookingManager) bookingManager.renderBookingHistory();
    },

    /** Load companions từ mock data + API */
    async loadCompanions() {
        const container = document.getElementById('companion-list');
        if (!container) return;

        // Show loading skeleton
        container.innerHTML = Array(8).fill(0).map(() => `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="companion-card"><div class="skeleton" style="height:400px;border-radius:20px;"></div></div>
            </div>
        `).join('');

        // Start with mock data
        this.companions = [...(window.mockCompanions || [])];

        // Try to merge with API data
        try {
            const res = await api.request('/users/companions').catch(() => ({ success: false }));
            if (res.success && res.data?.users) {
                res.data.users.forEach(u => {
                    if (!this.companions.find(c => c.username === u.username)) {
                        this.companions.push({
                            _id: u._id, name: u.profile?.fullName || u.username,
                            username: u.username, gender: u.profile?.gender,
                            avatar: u.profile?.avatar || `https://ui-avatars.com/api/?name=${u.username}&background=6366f1&color=fff`,
                            bio: u.profile?.bio || 'Sẵn sàng đồng hành cùng bạn.',
                            services: u.companion?.services || ['chat'],
                            skills: u.entertainmentPreferences?.tags || [],
                            pricePerHour: u.companion?.pricePerHour || 50000,
                            rating: u.companion?.rating || 4.0, reviewsCount: u.companion?.reviewCount || 0,
                            status: u.companion?.status || 'offline', verified: false,
                            location: '', tags: [], availability: {}
                        });
                    }
                });
            }
        } catch (e) { /* API not available, use mock data only */ }

        this.filterCompanions();
    },

    /** Apply tất cả bộ lọc + search */
    filterCompanions() {
        const { keyword, service, priceRange, rating, status, sort } = this.filterState;

        const vipSection = document.getElementById('vip-auction-section');
        const mainRow = document.querySelector('main.container > .row');

        if (service === 'vip-auction') {
            if (vipSection) vipSection.style.display = 'block';
            if (mainRow) mainRow.classList.add('d-none');
            return;
        } else {
            if (mainRow) mainRow.classList.remove('d-none');
            if (service === 'all') {
                if (vipSection) vipSection.style.display = 'block';
            } else {
                if (vipSection) vipSection.style.display = 'none';
            }
        }

        let result = [...this.companions];

        // Keyword search (tên, skill, bio, service)
        if (keyword) {
            const kw = this._normalize(keyword);
            result = result.filter(c =>
                this._normalize(c.name).includes(kw) ||
                this._normalize(c.bio).includes(kw) ||
                (c.skills || []).some(s => this._normalize(s).includes(kw)) ||
                (c.services || []).some(s => this._normalize(window.SERVICE_LABELS?.[s]?.label || s).includes(kw))
            );
        }

        // Service filter
        if (service !== 'all') {
            result = result.filter(c => (c.services || []).includes(service));
        }

        // Price range filter
        if (priceRange === 'under100') result = result.filter(c => c.pricePerHour < 100000);
        else if (priceRange === '100-200') result = result.filter(c => c.pricePerHour >= 100000 && c.pricePerHour <= 200000);
        else if (priceRange === 'over200') result = result.filter(c => c.pricePerHour > 200000);

        // Rating filter
        if (rating === '4.5+') result = result.filter(c => c.rating >= 4.5);
        else if (rating === '4.0+') result = result.filter(c => c.rating >= 4.0);

        // Status filter
        if (status !== 'all') result = result.filter(c => c.status === status);

        // Sorting
        if (sort === 'price-low') result.sort((a, b) => a.pricePerHour - b.pricePerHour);
        else if (sort === 'price-high') result.sort((a, b) => b.pricePerHour - a.pricePerHour);
        else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating);
        else if (sort === 'online') result.sort((a, b) => (b.status === 'online' ? 1 : 0) - (a.status === 'online' ? 1 : 0));
        else {
            // Default: online first, then by rating
            result.sort((a, b) => {
                if (a.status === 'online' && b.status !== 'online') return -1;
                if (b.status === 'online' && a.status !== 'online') return 1;
                return b.rating - a.rating;
            });
        }

        this.filteredList = result;
        this.renderCompanions(result);
    },

    /** Render companion cards */
    renderCompanions(list) {
        const container = document.getElementById('companion-list');
        const countEl = document.getElementById('results-count');
        if (!container) return;

        if (countEl) countEl.textContent = `${list.length} bạn đồng hành`;

        if (list.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="hire-empty-state">
                        <i class="bi bi-person-hearts"></i>
                        <h4 class="fw-bold mb-2">Không tìm thấy kết quả</h4>
                        <p class="text-muted mx-auto" style="max-width:400px;">Thử thay đổi từ khóa hoặc tắt bớt bộ lọc để tìm bạn đồng hành phù hợp nhé!</p>
                        <button class="btn btn-primary rounded-pill px-4" onclick="hirePage.resetFilters()">
                            <i class="bi bi-arrow-counterclockwise me-2"></i>Xóa bộ lọc
                        </button>
                    </div>
                </div>`;
            return;
        }

        container.innerHTML = list.map((c, idx) => {
            const statusLabel = window.STATUS_LABELS?.[c.status] || c.status;
            const formatP = window.ui ? ui.formatPrice(c.pricePerHour) : c.pricePerHour.toLocaleString() + 'đ';
            const stars = this._renderStars(c.rating);

            return `
            <div class="col-md-6 col-lg-4 col-xl-3" style="animation-delay:${idx * 0.05}s">
                <div class="companion-card">
                    <!-- Image -->
                    <div class="companion-card-img">
                        <img src="${c.avatar}" alt="${c.name}" 
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=6366f1&color=fff&size=400'">
                        <div class="overlay-gradient"></div>
                        <span class="status-badge-card ${c.status}"><i class="bi bi-circle-fill me-1" style="font-size:0.5rem;"></i>${statusLabel}</span>
                        <button class="btn-fav-companion" onclick="event.stopPropagation();" title="Yêu thích">
                            <i class="bi bi-heart"></i>
                        </button>
                        ${c.verified ? '<div class="position-absolute bottom-0 start-0 p-3 z-1"><span class="verified-badge bg-white rounded-pill px-2 py-1 shadow-sm"><i class="bi bi-patch-check-fill"></i> Đã xác minh</span></div>' : ''}
                    </div>

                    <!-- Body -->
                    <div class="p-3 d-flex flex-column flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start mb-1">
                            <h6 class="fw-bold mb-0 text-truncate font-outfit">${c.name}</h6>
                            <div class="companion-price-tag">${formatP}/h</div>
                        </div>

                        <div class="d-flex align-items-center gap-1 mb-2">
                            <div class="rating-stars">${stars}</div>
                            <span class="text-muted" style="font-size:0.75rem;">${c.rating} (${c.reviewsCount})</span>
                        </div>

                        <div class="d-flex flex-wrap gap-1 mb-2">
                            ${(c.services || []).slice(0, 3).map(s => {
                                const info = window.SERVICE_LABELS?.[s] || { label: s, icon: 'bi-star' };
                                return `<span class="skill-chip"><i class="bi ${info.icon} me-1"></i>${info.label}</span>`;
                            }).join('')}
                        </div>

                        <p class="text-muted small mb-3 flex-grow-1" style="display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">
                            ${c.bio}
                        </p>

                        <div class="d-flex gap-2 mt-auto">
                            <button class="btn btn-outline-secondary btn-sm flex-grow-1 rounded-3 fw-bold py-2" 
                                    onclick="hirePage.openDetail('${c._id}')" style="font-size:0.8rem;">
                                Xem chi tiết
                            </button>
                            <button class="btn btn-primary btn-sm flex-grow-1 rounded-3 fw-bold py-2"
                                    onclick="hirePage.quickHire('${c._id}')" style="font-size:0.8rem;">
                                <i class="bi bi-lightning-fill me-1"></i>Thuê ngay
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    /** Mở modal chi tiết companion */
    openDetail(id) {
        const c = this.companions.find(x => x._id === id);
        if (!c) return;
        this.selectedCompanion = c;

        const modal = document.getElementById('companionDetailModal');
        if (!modal) return;

        const formatP = window.ui ? ui.formatPrice(c.pricePerHour) : c.pricePerHour.toLocaleString() + 'đ';
        const statusLabel = window.STATUS_LABELS?.[c.status] || c.status;

        // Services badges
        const servicesHtml = (c.services || []).map(s => {
            const info = window.SERVICE_LABELS?.[s] || { label: s, icon: 'bi-star', color: '#6366f1' };
            return `<span class="badge rounded-pill px-3 py-2 fw-bold" style="background:${info.color}15;color:${info.color};">
                <i class="bi ${info.icon} me-1"></i>${info.label}</span>`;
        }).join(' ');

        // Skills badges
        const skillsHtml = (c.skills || []).map(s => `<span class="skill-chip">${s}</span>`).join(' ');

        // Availability mini schedule
        const days = ['mon','tue','wed','thu','fri','sat','sun'];
        const dayLabels = ['T2','T3','T4','T5','T6','T7','CN'];
        const availHtml = days.map((d, i) => {
            const slots = c.availability?.[d] || [];
            const cls = slots.length > 0 ? 'available' : 'unavailable';
            return `<div class="avail-day ${cls}" title="${slots.join(', ') || 'Không rảnh'}">${dayLabels[i]}</div>`;
        }).join('');

        // Fill modal content
        document.getElementById('detail-companion-img').src = c.avatar;
        document.getElementById('detail-companion-name').textContent = c.name;
        document.getElementById('detail-companion-status').innerHTML = `<span class="status-dot ${c.status} me-1"></span>${statusLabel}`;
        document.getElementById('detail-companion-rating').innerHTML = `${this._renderStars(c.rating)} <span class="text-muted ms-1">${c.rating} (${c.reviewsCount} đánh giá)</span>`;
        document.getElementById('detail-companion-verified').innerHTML = c.verified ? '<i class="bi bi-patch-check-fill text-primary me-1"></i>Đã xác minh' : '';
        document.getElementById('detail-companion-bio').textContent = c.bio;
        document.getElementById('detail-companion-services').innerHTML = servicesHtml;
        document.getElementById('detail-companion-skills').innerHTML = skillsHtml;
        document.getElementById('detail-companion-price').textContent = formatP + '/giờ';
        document.getElementById('detail-companion-location').innerHTML = `<i class="bi bi-geo-alt me-1"></i>${c.location || 'Không xác định'}`;
        document.getElementById('detail-companion-avail').innerHTML = `<div class="d-flex gap-2 flex-wrap">${availHtml}</div>`;

        // Load reviews
        if (window.reviewManager) {
            reviewManager.renderReviewsList(c._id, document.getElementById('detail-companion-reviews'));
        }

        // Update action buttons with companion ID
        document.getElementById('detail-btn-hire').onclick = () => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
            this.quickHire(c._id);
        };
        document.getElementById('detail-btn-chat').onclick = () => {
            const bsModal = bootstrap.Modal.getInstance(modal);
            if (bsModal) bsModal.hide();
            this.openChat(c._id);
        };

        // Show modal
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
    },

    /** Quick hire — mở modal thanh toán thuê ngay */
    quickHire(id) {
        const c = this.companions.find(x => x._id === id);
        if (!c) return;
        if (window.hirePayment) {
            hirePayment.openBookingWizard(c);
        } else if (window.bookingManager) {
            bookingManager.openBookingWizard(c);
        }
    },

    /** Reset all filters */
    resetFilters() {
        this.filterState = { keyword: '', service: 'all', priceRange: 'all', rating: 'all', status: 'all', sort: 'default' };
        // Update UI elements
        const searchInput = document.getElementById('hire-search-input');
        if (searchInput) searchInput.value = '';
        document.querySelectorAll('.service-pill').forEach(p => p.classList.toggle('active', p.dataset.service === 'all'));
        const selects = ['hire-price-filter', 'hire-rating-filter', 'hire-status-filter', 'hire-sort-filter'];
        selects.forEach(id => { const el = document.getElementById(id); if (el) el.value = 'all'; });
        const sortEl = document.getElementById('hire-sort-filter');
        if (sortEl) sortEl.value = 'default';
        this.filterCompanions();
    },

    /** Attach all event listeners */
    attachEventListeners() {
        // Search input with debounce
        const searchInput = document.getElementById('hire-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterState.keyword = e.target.value;
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => this.filterCompanions(), 300);
            });
        }

        // Service pills
        document.querySelectorAll('.service-pill').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('.service-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.filterState.service = pill.dataset.service;
                this.filterCompanions();
            });
        });

        // Select filters
        const filterMap = [
            { id: 'hire-price-filter', key: 'priceRange' },
            { id: 'hire-rating-filter', key: 'rating' },
            { id: 'hire-status-filter', key: 'status' },
            { id: 'hire-sort-filter', key: 'sort' }
        ];
        filterMap.forEach(f => {
            const el = document.getElementById(f.id);
            if (el) el.addEventListener('change', (e) => {
                this.filterState[f.key] = e.target.value;
                this.filterCompanions();
            });
        });

        // Reset button
        const btnReset = document.getElementById('btn-reset-hire-filters');
        if (btnReset) btnReset.addEventListener('click', () => this.resetFilters());
    },

    // ============ VIP Auction Controller ============

    /** Load auctions from localStorage (persisted) or mock data */
    loadAuctions() {
        try {
            const todayStr = new Date().toLocaleDateString('sv'); // 'YYYY-MM-DD' format
            const lastReset = localStorage.getItem('entconnect_auction_last_reset');
            const stored = JSON.parse(localStorage.getItem('entconnect_auctions') || 'null');

            if (lastReset !== todayStr || !stored || !Array.isArray(stored) || stored.length === 0) {
                // Clear any rival bid timeouts from previous sessions if any
                Object.values(this.rivalBidTimeouts).forEach(clearTimeout);
                this.rivalBidTimeouts = {};

                // Daily refresh: load fresh mock data where endDate is live relative to NOW
                this.auctions = (window.mockAuctions || []).map(a => ({ ...a }));
                this._saveAuctions();
                localStorage.setItem('entconnect_auction_last_reset', todayStr);

                // Show elegant toast message if it was a daily refresh (not a first-time setup)
                if (lastReset && lastReset !== todayStr && window.api?.toast) {
                    window.api.toast('📅 Các phiên đấu giá VIP đã tự động làm mới cho ngày mới!', 'success');
                }
            } else {
                this.auctions = stored;
            }
        } catch(e) {
            this.auctions = (window.mockAuctions || []).map(a => ({ ...a }));
        }
        this.renderAuctions(this.auctions);
    },

    /** Persist auction state */
    _saveAuctions() {
        try { localStorage.setItem('entconnect_auctions', JSON.stringify(this.auctions)); } catch(e) {}
    },

    /** Render all auction cards into #vip-auction-list */
    renderAuctions(list) {
        const container = document.getElementById('vip-auction-list');
        if (!container) return;
        if (!list || list.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5 text-muted">Hiện chưa có phiên đấu giá nào.</div>';
            return;
        }
        container.innerHTML = list.map(a => {
            const timeStr = this.getAuctionTimeRemaining(a.endDate);
            const isEnded = a.status === 'ended';
            const isWon = isEnded && a.highestBidder === (window.auth?.user?.username || '__none__');
            return `
            <div class="col-md-6 col-xl-3" id="auction-col-${a._id}">
                <div class="auction-card ${isEnded ? 'opacity-75' : ''}" id="auction-card-${a._id}">
                    <div class="auction-card-img">
                        <img src="${a.avatar}" alt="${a.name}"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=fbbf24&color=1e1e2e&size=400'">
                        <div class="overlay-gradient"></div>
                        ${!isEnded ? `<div class="auction-badge-live"><span class="pulse-dot"></span> LIVE</div>` : `<div class="auction-badge-live" style="background:rgba(100,100,120,0.9);">ĐÃ KẾT THÚC</div>`}
                        <div class="auction-badge-time" id="auction-timer-${a._id}">${timeStr}</div>
                        <div class="auction-badge-charity"><i class="bi bi-heart-fill me-1"></i>${a.charityPercent}% Từ thiện</div>
                    </div>
                    <div class="p-3 d-flex flex-column flex-grow-1">
                        <div class="fw-bold font-outfit mb-1" style="font-size:0.95rem;">${a.name}</div>
                        <p class="text-muted small mb-2 flex-grow-1" style="display:-webkit-box;-webkit-line-clamp:2;line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${a.title}</p>

                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <div class="auction-price-label">Giá hiện tại</div>
                                <div class="auction-price-val" id="auction-price-${a._id}">${(a.currentBid||0).toLocaleString('vi-VN')}đ</div>
                            </div>
                            <div class="text-end">
                                <div class="auction-price-label">Lượt đặt</div>
                                <div class="fw-bold" id="auction-bidcount-${a._id}" style="color:var(--text-main);">${a.bidCount}</div>
                            </div>
                        </div>

                        <!-- Charity mini bar -->
                        <div class="auction-charity-bar mb-2" title="Từ thiện / Nghệ sĩ / Nền tảng">
                            <div class="charity-segment-don" style="flex:${a.charityPercent}" title="${a.charityPercent}% Từ thiện"></div>
                            <div class="charity-segment-cel" style="flex:${a.celebrityPercent}" title="${a.celebrityPercent}% Nghệ sĩ"></div>
                            <div class="charity-segment-pla" style="flex:${a.platformPercent}" title="${a.platformPercent}% Nền tảng"></div>
                        </div>
                        <div class="d-flex justify-content-between small text-muted mb-3" style="font-size:0.68rem;">
                            <span style="color:#10b981;">🎗 ${a.charityPercent}% Từ thiện</span>
                            <span style="color:#6366f1;">⭐ ${a.celebrityPercent}% Nghệ sĩ</span>
                            <span style="color:#ec4899;">🏢 ${a.platformPercent}% Nền tảng</span>
                        </div>

                        ${isWon ? `
                        <div class="mb-2 p-2 rounded-3 text-center fw-bold" style="background:rgba(16,185,129,0.1);color:#10b981;font-size:0.85rem;">
                            🎉 Bạn đã thắng! Hãy thanh toán để xác nhận
                        </div>
                        <button class="btn auction-btn-bid rounded-3 fw-bold w-100 py-2" onclick="hirePage.payWinningBid('${a._id}')">
                            <i class="bi bi-credit-card-fill me-1"></i>Thanh toán ngay
                        </button>` :
                        isEnded ? `
                        <div class="p-2 rounded-3 text-center text-muted small" style="background:var(--bg-panel);">
                            Người thắng: <strong>${a.highestBidder || '---'}</strong>
                        </div>` : `
                        <div class="d-flex gap-2">
                            <button class="btn auction-btn-bid rounded-3 fw-bold flex-grow-1 py-2"
                                    onclick="hirePage.openAuctionBid('${a._id}')">
                                <i class="bi bi-lightning-fill me-1"></i>Đặt giá
                            </button>
                            <button class="btn btn-sm rounded-3 fw-bold px-2 py-2" title="Kết thúc nhanh (test)"
                                    style="background:rgba(239,68,68,0.08);color:#ef4444;border:1px solid rgba(239,68,68,0.2);font-size:0.7rem;"
                                    onclick="hirePage.simulateAuctionEnd('${a._id}')">
                                <i class="bi bi-skip-end-fill"></i>
                            </button>
                        </div>`}
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    /** Calculate remaining time string from ISO endDate */
    getAuctionTimeRemaining(endDate) {
        const diff = new Date(endDate) - Date.now();
        if (diff <= 0) return '00:00:00';
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        if (h >= 24) {
            const d = Math.floor(h / 24);
            return `${d}n ${h%24}g`;
        }
        return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    },

    /** Start live countdown interval across all auction cards */
    startAuctionTimers() {
        if (this.auctionTimerInterval) clearInterval(this.auctionTimerInterval);
        this.auctionTimerInterval = setInterval(() => {
            this.auctions.forEach(a => {
                if (a.status === 'ended') return;
                const el = document.getElementById(`auction-timer-${a._id}`);
                const remaining = new Date(a.endDate) - Date.now();
                if (remaining <= 0) {
                    // Auto-end
                    a.status = 'ended';
                    this._saveAuctions();
                    this.renderAuctions(this.auctions);
                    if (a._id === this.selectedAuction?._id) {
                        const modal = bootstrap.Modal.getInstance(document.getElementById('auctionBidModal'));
                        if (modal) modal.hide();
                    }
                } else {
                    if (el) el.textContent = this.getAuctionTimeRemaining(a.endDate);
                    // Update modal timer if open
                    if (a._id === this.selectedAuction?._id) {
                        const modalTimer = document.getElementById('modal-auction-timer');
                        if (modalTimer) modalTimer.textContent = this.getAuctionTimeRemaining(a.endDate);
                        // Red pulsing in last minute
                        if (remaining < 60000 && modalTimer) {
                            modalTimer.style.color = '#ef4444';
                        }
                    }
                }
            });
        }, 1000);
    },

    /** Open the bidding modal for a given auction */
    openAuctionBid(auctionId) {
        const auction = this.auctions.find(a => a._id === auctionId);
        if (!auction || auction.status === 'ended') return;

        if (window.auth && !auth.user) {
            api.toast('Vui lòng đăng nhập để tham gia đấu giá!', 'warning');
            if (auth.showModal) auth.showModal('loginModal');
            return;
        }

        this.selectedAuction = auction;
        this.renderAuctionBidModal(auction);

        const modalEl = document.getElementById('auctionBidModal');
        if (!modalEl) return;
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
    },

    /** Render full bidding wizard inside #auction-bid-body */
    renderAuctionBidModal(auction) {
        const body = document.getElementById('auction-bid-body');
        if (!body) return;
        const a = auction;
        const minBid = (a.currentBid || 0) + (a.minIncrement || 500000);
        const chips = [a.minIncrement, a.minIncrement * 2, a.minIncrement * 5].map(v =>
            `<span class="quick-bid-chip" onclick="hirePage.addBidInput(${v})">+${(v/1000000).toFixed(v%1000000===0?0:1)}M</span>`
        ).join('');

        body.innerHTML = `
        <div class="row g-4">
            <!-- Left: Celebrity Info & Charity -->
            <div class="col-md-5">
                <img src="${a.avatar}" alt="${a.name}" class="auction-modal-img w-100 mb-3"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=fbbf24&color=1e1e2e&size=600'">
                <h5 class="fw-bold font-outfit mb-1">${a.name}</h5>
                <p class="small text-muted mb-3">${a.title}</p>
                <p class="small text-muted mb-3" style="font-size:0.8rem;">${a.description}</p>

                <!-- Charity Breakdown -->
                <div class="charity-breakdown-card p-3">
                    <div class="fw-bold small mb-2" style="color:#fbbf24;"><i class="bi bi-heart-fill me-1"></i>Phân bổ tiền đấu giá</div>
                    <div class="auction-charity-bar mb-2" style="height:8px;">
                        <div class="charity-segment-don" style="flex:${a.charityPercent}"></div>
                        <div class="charity-segment-cel" style="flex:${a.celebrityPercent}"></div>
                        <div class="charity-segment-pla" style="flex:${a.platformPercent}"></div>
                    </div>
                    <div class="row g-1 small">
                        <div class="col-12 d-flex justify-content-between">
                            <span><span class="dot-indicator" style="background:#10b981;"></span> Từ thiện (${a.charityName})</span>
                            <strong style="color:#10b981;">${a.charityPercent}%</strong>
                        </div>
                        <div class="col-12 d-flex justify-content-between">
                            <span><span class="dot-indicator" style="background:#6366f1;"></span> ${a.name}</span>
                            <strong style="color:#6366f1;">${a.celebrityPercent}%</strong>
                        </div>
                        <div class="col-12 d-flex justify-content-between">
                            <span><span class="dot-indicator" style="background:#ec4899;"></span> EntConnect</span>
                            <strong style="color:#ec4899;">${a.platformPercent}%</strong>
                        </div>
                    </div>
                    <div class="mt-2 p-2 rounded-3 small" style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.12);">
                        <i class="bi bi-shield-check-fill text-success me-1"></i>
                        <span class="text-muted">Nếu bạn thắng với mức giá <strong id="modal-est-charity">${minBid.toLocaleString('vi-VN')}đ</strong>, số tiền từ thiện là:</span>
                        <div class="fw-bold mt-1" style="color:#10b981;" id="modal-est-charity-val">${Math.floor(minBid * a.charityPercent / 100).toLocaleString('vi-VN')}đ</div>
                    </div>
                </div>
            </div>

            <!-- Right: Bidding Panel -->
            <div class="col-md-7">
                <!-- Live Timer -->
                <div class="auction-timer-lg text-center p-3 mb-3" id="modal-auction-timer">
                    ${this.getAuctionTimeRemaining(a.endDate)}
                </div>

                <!-- Current Bid -->
                <div class="d-flex justify-content-between align-items-center mb-3 p-3 rounded-3" style="background:rgba(251,191,36,0.05);border:1px solid rgba(251,191,36,0.15);">
                    <div>
                        <div class="small text-muted fw-bold" style="font-size:0.7rem;text-transform:uppercase;">Giá hiện tại cao nhất</div>
                        <div class="auction-price-val fs-4" id="modal-current-bid">${(a.currentBid||0).toLocaleString('vi-VN')}đ</div>
                        <div class="small text-muted" id="modal-highest-bidder">bởi <strong>${a.highestBidder || '---'}</strong></div>
                    </div>
                    <div class="text-end">
                        <div class="small text-muted fw-bold" style="font-size:0.7rem;text-transform:uppercase;">Lượt đấu</div>
                        <div class="fw-bold fs-4" id="modal-bid-count">${a.bidCount}</div>
                    </div>
                </div>

                <!-- Bid History -->
                <div class="mb-3">
                    <div class="small fw-bold text-muted mb-1" style="text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;">
                        <i class="bi bi-clock-history me-1"></i>Lịch sử đặt giá
                    </div>
                    <div class="bid-history-container" id="modal-bid-history">
                        ${(a.bidsHistory || []).map((b, i) => {
                            const isUser = b.bidder === (window.auth?.user?.username || '__none__');
                            return `<div class="bid-history-row ${isUser ? 'user-bid' : ''} d-flex justify-content-between">
                                <span>${isUser ? '🟢 ' : ''}<strong>${b.bidder}</strong></span>
                                <span class="text-muted">${b.amount.toLocaleString('vi-VN')}đ</span>
                                <span class="text-muted" style="font-size:0.75rem;">${b.time}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <!-- Bid Input -->
                <div class="mb-3">
                    <label class="small fw-bold text-muted mb-1" style="text-transform:uppercase;font-size:0.7rem;letter-spacing:0.5px;">
                        <i class="bi bi-pencil me-1"></i>Mức giá của bạn (tối thiểu: ${minBid.toLocaleString('vi-VN')}đ)
                    </label>
                    <div class="input-group rounded-3 overflow-hidden" style="border:1.5px solid rgba(251,191,36,0.3);">
                        <span class="input-group-text fw-bold" style="background:rgba(251,191,36,0.08);border:none;color:#fbbf24;">₫</span>
                        <input type="number" id="auction-bid-input" class="form-control fw-bold"
                               value="${minBid}" min="${minBid}" step="${a.minIncrement}"
                               style="background:var(--bg-panel);border:none;color:var(--text-main);font-size:1.05rem;"
                               oninput="hirePage._updateCharity()">
                    </div>
                </div>

                <!-- Quick Bid Chips -->
                <div class="d-flex gap-2 flex-wrap mb-3">
                    <span class="small text-muted align-self-center" style="font-size:0.75rem;">Nhanh:</span>
                    ${chips}
                    <span class="quick-bid-chip" onclick="hirePage.setBidInput(${minBid})">Tối thiểu</span>
                </div>

                <!-- Outbid Alert (hidden by default) -->
                <div id="outbid-alert" class="d-none mb-3 p-3 rounded-3 fw-bold text-center"
                     style="background:rgba(239,68,68,0.1);border:1.5px solid rgba(239,68,68,0.3);color:#ef4444;font-size:0.9rem;">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    🚨 Có người vừa đặt giá cao hơn bạn! Hãy nâng giá để dẫn đầu!
                </div>

                <!-- Place Bid Button -->
                <button class="btn auction-btn-bid w-100 rounded-3 py-3 fw-bold fs-5 mb-2" id="btn-place-bid"
                        onclick="hirePage.placeBid()">
                    <i class="bi bi-lightning-fill me-2"></i>Đặt giá thầu ngay
                </button>
                <div class="text-center small text-muted" style="font-size:0.75rem;">
                    <i class="bi bi-lock-fill me-1"></i>Đặt giá an toàn & minh bạch | Chỉ thanh toán khi thắng
                </div>
            </div>
        </div>`;
    },

    /** Update charity estimate in modal when user types */
    _updateCharity() {
        const a = this.selectedAuction;
        if (!a) return;
        const val = parseInt(document.getElementById('auction-bid-input')?.value) || 0;
        const charityVal = Math.floor(val * a.charityPercent / 100);
        const estEl = document.getElementById('modal-est-charity');
        const charEl = document.getElementById('modal-est-charity-val');
        if (estEl) estEl.textContent = val.toLocaleString('vi-VN') + 'đ';
        if (charEl) charEl.textContent = charityVal.toLocaleString('vi-VN') + 'đ';
    },

    /** Set bid input to exact value */
    setBidInput(amount) {
        const inp = document.getElementById('auction-bid-input');
        if (inp) { inp.value = amount; this._updateCharity(); }
    },

    /** Add increment to current bid input */
    addBidInput(increment) {
        const inp = document.getElementById('auction-bid-input');
        if (inp) {
            inp.value = parseInt(inp.value || 0) + increment;
            this._updateCharity();
        }
    },

    /** Submit bid */
    placeBid() {
        const a = this.selectedAuction;
        if (!a) return;

        if (window.auth && !auth.user) {
            api.toast('Vui lòng đăng nhập!', 'warning');
            return;
        }

        const inp = document.getElementById('auction-bid-input');
        const bidAmount = parseInt(inp?.value || 0);
        const minBid = (a.currentBid || 0) + (a.minIncrement || 500000);
        const username = window.auth?.user?.username || 'guest_user';

        if (bidAmount < minBid) {
            api.toast(`Mức giá tối thiểu là ${minBid.toLocaleString('vi-VN')}đ!`, 'warning');
            return;
        }

        // Apply bid
        a.currentBid = bidAmount;
        a.highestBidder = username;
        a.bidCount = (a.bidCount || 0) + 1;
        a.bidsHistory = [
            { bidder: username, amount: bidAmount, time: 'Vừa xong' },
            ...(a.bidsHistory || []).slice(0, 9)
        ];
        this._saveAuctions();

        // Update card UI
        const priceEl = document.getElementById(`auction-price-${a._id}`);
        if (priceEl) priceEl.textContent = bidAmount.toLocaleString('vi-VN') + 'đ';
        const countEl = document.getElementById(`auction-bidcount-${a._id}`);
        if (countEl) countEl.textContent = a.bidCount;

        // Update modal UI
        const modalBid = document.getElementById('modal-current-bid');
        if (modalBid) modalBid.textContent = bidAmount.toLocaleString('vi-VN') + 'đ';
        const modalBidder = document.getElementById('modal-highest-bidder');
        if (modalBidder) modalBidder.innerHTML = `bởi <strong>🟢 ${username} (bạn)</strong>`;
        const modalCount = document.getElementById('modal-bid-count');
        if (modalCount) modalCount.textContent = a.bidCount;

        // Update bid history in modal
        const hist = document.getElementById('modal-bid-history');
        if (hist) {
            hist.innerHTML = a.bidsHistory.map(b => {
                const isUser = b.bidder === username;
                return `<div class="bid-history-row ${isUser ? 'user-bid' : ''} d-flex justify-content-between">
                    <span>${isUser ? '🟢 ' : ''}<strong>${b.bidder}</strong></span>
                    <span class="text-muted">${b.amount.toLocaleString('vi-VN')}đ</span>
                    <span class="text-muted" style="font-size:0.75rem;">${b.time}</span>
                </div>`;
            }).join('');
        }

        // Set next min bid
        const nextMin = bidAmount + (a.minIncrement || 500000);
        if (inp) inp.value = nextMin;
        this._updateCharity();

        // Hide outbid alert
        const alertEl = document.getElementById('outbid-alert');
        if (alertEl) alertEl.classList.add('d-none');

        api.toast(`🎉 Đặt giá ${bidAmount.toLocaleString('vi-VN')}đ thành công! Bạn đang dẫn đầu!`, 'success');

        // Schedule rival bid simulation (80% chance after 6-12 seconds)
        if (this.rivalBidTimeouts[a._id]) clearTimeout(this.rivalBidTimeouts[a._id]);
        if (Math.random() < 0.80) {
            const delay = 6000 + Math.random() * 6000;
            this.rivalBidTimeouts[a._id] = setTimeout(() => this.simulateRivalBid(a._id), delay);
        }
    },

    /** Simulate a rival user outbidding the current leader */
    simulateRivalBid(auctionId) {
        const a = this.auctions.find(x => x._id === auctionId);
        if (!a || a.status === 'ended') return;

        const username = window.auth?.user?.username || '__none__';
        // Only fire if user is currently winning
        if (a.highestBidder !== username) return;

        const rivals = ['hoang_long_99', 'mai_lan_angel', 'tuan_vy_fan', 'nguyen_duc_k10',
                        'lina_tran_vip', 'faker_fanboy_vn', 'songtung_forever', 'bestfan_2025',
                        'gold_bidder_88', 'mixi_tribe_pro'];
        const rival = rivals[Math.floor(Math.random() * rivals.length)];
        const increment = (a.minIncrement || 500000) + Math.floor(Math.random() * 3) * (a.minIncrement || 500000);
        const newBid = a.currentBid + increment;

        a.currentBid = newBid;
        a.highestBidder = rival;
        a.bidCount = (a.bidCount || 0) + 1;
        a.bidsHistory = [
            { bidder: rival, amount: newBid, time: 'Vừa xong' },
            ...(a.bidsHistory || []).slice(0, 9)
        ];
        this._saveAuctions();

        // Update card
        const priceEl = document.getElementById(`auction-price-${a._id}`);
        if (priceEl) priceEl.textContent = newBid.toLocaleString('vi-VN') + 'đ';
        const countEl = document.getElementById(`auction-bidcount-${a._id}`);
        if (countEl) countEl.textContent = a.bidCount;

        // Add outbid glow to card
        const card = document.getElementById(`auction-card-${a._id}`);
        if (card) {
            card.classList.add('outbid-alert');
            setTimeout(() => card.classList.remove('outbid-alert'), 4000);
        }

        // Update modal if open
        if (this.selectedAuction?._id === auctionId) {
            const modalBid = document.getElementById('modal-current-bid');
            if (modalBid) modalBid.textContent = newBid.toLocaleString('vi-VN') + 'đ';
            const modalBidder = document.getElementById('modal-highest-bidder');
            if (modalBidder) modalBidder.innerHTML = `bởi <strong style="color:#f59e0b;">${rival}</strong>`;
            const modalCount = document.getElementById('modal-bid-count');
            if (modalCount) modalCount.textContent = a.bidCount;

            const hist = document.getElementById('modal-bid-history');
            if (hist) {
                hist.innerHTML = a.bidsHistory.map(b => {
                    const isUser = b.bidder === username;
                    return `<div class="bid-history-row ${isUser ? 'user-bid' : ''} d-flex justify-content-between">
                        <span>${isUser ? '🟢 ' : ''}<strong>${b.bidder}</strong></span>
                        <span class="text-muted">${b.amount.toLocaleString('vi-VN')}đ</span>
                        <span class="text-muted" style="font-size:0.75rem;">${b.time}</span>
                    </div>`;
                }).join('');
            }

            // Show outbid alert in modal
            const alertEl = document.getElementById('outbid-alert');
            if (alertEl) alertEl.classList.remove('d-none');

            // Set input to beat rival
            const inp = document.getElementById('auction-bid-input');
            if (inp) inp.value = newBid + (a.minIncrement || 500000);
            this._updateCharity();
        }

        api.toast(`🚨 ${rival} vừa trả giá ${newBid.toLocaleString('vi-VN')}đ! Bạn bị vượt qua rồi!`, 'danger');
    },

    /** Immediately end an auction (for testing) */
    simulateAuctionEnd(auctionId) {
        const a = this.auctions.find(x => x._id === auctionId);
        if (!a) return;

        // Clear any rival timers
        if (this.rivalBidTimeouts[auctionId]) clearTimeout(this.rivalBidTimeouts[auctionId]);

        a.status = 'ended';
        a.endDate = new Date(Date.now() - 1000).toISOString();
        this._saveAuctions();
        this.renderAuctions(this.auctions);

        // Close modal if open for this auction
        if (this.selectedAuction?._id === auctionId) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('auctionBidModal'));
            if (modal) modal.hide();
        }

        const winner = a.highestBidder || 'Chưa có người thắng';
        api.toast(`🏁 Phiên đấu giá "${a.name}" đã kết thúc! Người thắng: ${winner}`, 'info');
    },

    /** Trigger auction payment checkout */
    payWinningBid(auctionId) {
        const a = this.auctions.find(x => x._id === auctionId);
        if (!a) return;
        if (window.hirePayment && hirePayment.openAuctionCheckout) {
            hirePayment.openAuctionCheckout(a);
        } else {
            api.toast('Đang tải module thanh toán...', 'info');
        }
    },

    // ============ Chat Module ============

    /** Mở mini chat với companion */
    openChat(companionId) {
        const c = this.companions.find(x => x._id === companionId);
        if (!c) return;

        if (!auth.user) {
            api.toast('Vui lòng đăng nhập để nhắn tin!', 'warning');
            auth.showModal('loginModal');
            return;
        }

        this.chatTarget = c;
        this.chatOpen = true;

        // Remove existing chat window
        const existing = document.getElementById('hire-chat-widget');
        if (existing) existing.remove();

        // Load saved messages
        const messages = this._getChatMessages(companionId);

        const chatHtml = `
        <div id="hire-chat-widget" class="hire-chat-window">
            <div class="hire-chat-header d-flex align-items-center gap-3">
                <img src="${c.avatar}" class="rounded-circle" width="36" height="36" style="object-fit:cover;">
                <div class="flex-grow-1">
                    <div class="fw-bold">${c.name}</div>
                    <div class="small opacity-75"><span class="status-dot online me-1" style="width:7px;height:7px;"></span>Đang trả lời</div>
                </div>
                <button class="btn btn-sm text-white" onclick="hirePage.closeChat()" style="opacity:0.7;"><i class="bi bi-x-lg"></i></button>
            </div>
            <div class="hire-chat-body" id="hire-chat-messages">
                ${messages.length > 0 ? messages.map(m => `<div class="chat-msg ${m.sent ? 'sent' : 'received'}">${m.text}</div>`).join('') :
                `<div class="chat-msg received">Xin chào! Mình là ${c.name}. Bạn cần hỏi gì về dịch vụ không? 😊</div>`}
            </div>
            <div class="hire-chat-footer">
                <div class="d-flex gap-2">
                    <input type="text" class="form-control rounded-pill border-0 bg-light" id="hire-chat-input" 
                           placeholder="Nhập tin nhắn..." style="font-size:0.9rem;">
                    <button class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" 
                            style="width:40px;height:40px;flex-shrink:0;" id="hire-chat-send">
                        <i class="bi bi-send-fill"></i>
                    </button>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', chatHtml);

        // Auto scroll
        const msgContainer = document.getElementById('hire-chat-messages');
        msgContainer.scrollTop = msgContainer.scrollHeight;

        // Bind send
        const input = document.getElementById('hire-chat-input');
        const sendBtn = document.getElementById('hire-chat-send');

        const sendMessage = () => {
            const text = input.value.trim();
            if (!text) return;
            this._addChatMessage(companionId, text, true);
            input.value = '';
            // Auto reply after delay
            setTimeout(() => this._autoReply(companionId), 1000 + Math.random() * 1500);
        };

        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
        input.focus();
    },

    closeChat() {
        const widget = document.getElementById('hire-chat-widget');
        if (widget) widget.remove();
        this.chatOpen = false;
    },

    _addChatMessage(companionId, text, sent) {
        const msgContainer = document.getElementById('hire-chat-messages');
        if (!msgContainer) return;
        const div = document.createElement('div');
        div.className = `chat-msg ${sent ? 'sent' : 'received'}`;
        div.textContent = text;
        msgContainer.appendChild(div);
        msgContainer.scrollTop = msgContainer.scrollHeight;

        // Save to localStorage
        const key = `entconnect_chat_${companionId}`;
        const messages = this._getChatMessages(companionId);
        messages.push({ text, sent, time: Date.now() });
        localStorage.setItem(key, JSON.stringify(messages.slice(-50))); // Keep last 50
    },

    _getChatMessages(companionId) {
        try { return JSON.parse(localStorage.getItem(`entconnect_chat_${companionId}`)) || []; }
        catch { return []; }
    },

    _autoReply(companionId) {
        const c = this.companions.find(x => x._id === companionId);
        if (!c) return;
        const replies = [
            `Cảm ơn bạn đã quan tâm! Mình hiện đang rảnh, bạn muốn đặt lịch không?`,
            `Giá dịch vụ của mình là ${c.pricePerHour.toLocaleString()}đ/giờ. Bạn muốn thuê bao lâu?`,
            `Mình chuyên ${(c.skills || []).slice(0, 2).join(' và ')}. Rất vui được đồng hành cùng bạn! 😊`,
            `Bạn có thể xem lịch trống của mình trong phần chi tiết nhé!`,
            `Nếu bạn cần thêm thông tin gì, cứ hỏi mình thoải mái nha! 💬`,
            `Mình có thể bắt đầu ngay bây giờ nếu bạn muốn. Đặt lịch nhé?`
        ];
        const reply = replies[Math.floor(Math.random() * replies.length)];
        this._addChatMessage(companionId, reply, false);
    },

    // ============ Helpers ============

    _normalize(str) {
        if (!str) return '';
        return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    },

    _renderStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) html += '<i class="bi bi-star-fill"></i>';
            else if (i - 0.5 <= rating) html += '<i class="bi bi-star-half"></i>';
            else html += '<i class="bi bi-star empty"></i>';
        }
        return html;
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => hirePage.init());
} else {
    hirePage.init();
}
window.hirePage = hirePage;

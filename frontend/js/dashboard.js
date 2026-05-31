/**
 * EntConnect - Dashboard Controller
 * Manages user profile, activities, and favorites
 */

const dashboard = {
    user: null,

    /**
     * Initialize dashboard
     */
    init() {
        if (!api.getToken()) {
            window.location.href = 'index.html';
            return;
        }
        
        this.loadUserData();
        this.attachEventListeners();
        this.loadTransactionHistory();
        this.loadAchievements();
        this.handleTabRouting();
        this.initActivityChart();
    },

    /**
     * Load current user data from localStorage
     */
    loadUserData() {
        const userData = localStorage.getItem('user');
        if (userData) {
            this.user = JSON.parse(userData);
            this.renderProfileSummary();
            this.fillProfileForm();
        }
    },

    /**
     * Check URL for specific tab activation
     */
    handleTabRouting() {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab) {
            const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
            if (tabBtn) tabBtn.click();
        }
    },

    /**
     * Render basic user info on sidebar
     */
    renderProfileSummary() {
        // Class-based updates (Shared with Navbar)
        document.querySelectorAll('.current-user-name').forEach(el => el.textContent = this.user.profile?.fullName || this.user.username);
        document.querySelectorAll('.current-user-username').forEach(el => el.textContent = this.user.username);
        document.querySelectorAll('.current-user-avatar').forEach(el => {
            el.src = (!this.user.profile?.avatar || this.user.profile?.avatar === 'default-avatar.png')
                ? `https://ui-avatars.com/api/?name=${this.user.username}&background=random` 
                : this.user.profile?.avatar;
        });

        // Dashboard specific ID updates
        const displayName = document.getElementById('user-display-name');
        if (displayName) displayName.textContent = this.user.profile?.fullName || this.user.username;
        
        const emailEl = document.getElementById('user-email');
        if (emailEl) emailEl.textContent = this.user.email;
        
        const profileAvatar = document.getElementById('user-profile-avatar');
        if (profileAvatar) {
            profileAvatar.src = (!this.user.profile?.avatar || this.user.profile?.avatar === 'default-avatar.png')
                ? `https://ui-avatars.com/api/?name=${this.user.username}&background=random` 
                : this.user.profile?.avatar;
        }

        // Verified Badge
        if (this.user.isVerified) {
            const badgeSmall = document.getElementById('verifiedBadgeSmall');
            const badgeLarge = document.getElementById('verifiedBadgeLarge');
            if (badgeSmall) badgeSmall.classList.remove('d-none');
            if (badgeLarge) badgeLarge.classList.remove('d-none');
        }
    },

    /**
     * Fill the settings form with current data
     */
    fillProfileForm() {
        const form = document.getElementById('profile-form');
        if (!form || !this.user.profile) return;
        
        form.fullName.value = this.user.profile.fullName || '';
        form.phone.value = this.user.phone || '';
        form.bio.value = this.user.profile.bio || '';
        
        const preview = document.getElementById('profile-preview-img');
        if (preview) preview.src = this.user.profile.avatar;
    },

    /**
     * Load all event categories for the user
     */
    async loadActivities() {
        const containers = {
            joined: document.getElementById('joined-activities-container'),
            hosting: document.getElementById('hosting-activities-container'),
            favorites: document.getElementById('favorite-activities-container')
        };
        
        // Show loading state
        Object.values(containers).forEach(c => {
            if (c) c.innerHTML = '<div class="col-12 text-center p-5"><div class="spinner-border text-primary opacity-25"></div></div>';
        });

        let allData = window.mockActivities || [];
        try {
            const response = await api.request('/events');
            if (response && response.success) {
                const apiData = response.data.activities || response.data || [];
                // Merge and deduplicate
                const apiTitles = new Set(apiData.map(e => e.title));
                const filteredMock = allData.filter(e => !apiTitles.has(e.title));
                allData = [...apiData, ...filteredMock];
            }
        } catch (e) {
            console.warn('Dashboard API offline, using fallback mock data');
        }

        // Apply fallback for all cases
        // 1. Joined: User is in participants OR paid via payment module
        const joinedEventIds = window.payment ? payment.getJoinedItems(false) : [];
        const joinedCommunityIds = window.payment ? payment.getJoinedItems(true) : [];
        const joined = allData.filter(ev => 
            (ev.participants && ev.participants.some(p => p.user?._id === this.user.id || p.user === this.user.id || p.user?.username === this.user.username))
            || joinedEventIds.includes(ev._id)
        );
        const totalJoinedCount = joined.length + joinedCommunityIds.length;
        
        // 2. Hosting: User is creator
        const hosting = allData.filter(ev => 
            ev.creator?._id === this.user.id || ev.creator === this.user.id || ev.creator?.username === this.user.username
        );
        
        // 3. Favorites: Stored in userPrefs
        const favs = allData.filter(ev => window.userPrefs && userPrefs.isFavorite(ev._id));

        // Stats
        const statJoined = document.getElementById('stat-joined');
        const statHosted = document.getElementById('stat-hosted');
        const statFavorites = document.getElementById('stat-favorites');
        
        if (statJoined) statJoined.textContent = totalJoinedCount;
        if (statHosted) statHosted.textContent = hosting.length;
        if (statFavorites) statFavorites.textContent = favs.length;
        // Render lists using central UI module
        this.renderSimpleList(containers.joined, joined, 'Chưa tham gia hoạt động nào', 'joined');
        this.renderSimpleList(containers.hosting, hosting, 'Bạn chưa tổ chức sự kiện nào. Hãy tạo một sự kiện ngay!', 'hosting');
        if (containers.favorites) this.renderSimpleList(containers.favorites, favs, 'Bạn chưa yêu thích sự kiện nào', 'favorites');
    },

    /**
     * Render a list of events with a simplified style for dashboard
     */
    renderSimpleList(container, list, emptyMsg, type = '') {
        if (!container) return;
        if (list.length === 0) {
            container.innerHTML = `<div class="col-12 text-center p-5 text-muted shadow-sm rounded-4 bg-white">${emptyMsg}</div>`;
            return;
        }
        
        container.innerHTML = list.map(ev => `
            <div class="col-md-6">
                <div class="event-card shadow-sm h-100 border-0 overflow-hidden" 
                     style="cursor: pointer;" 
                     onclick="location.href='activity-detail.html?id=${ev._id}'">
                    <div class="position-relative" style="height: 140px;">
                        <img src="${ev.coverImage}" class="w-100 h-100 object-fit-cover"
                             onerror="ui.handleImageError(this, 'activity', '${ev.category}')">
                        <div class="position-absolute top-0 end-0 p-2">
                            <span class="badge bg-primary px-2 py-1 small fw-bold text-uppercase">${ev.category}</span>
                        </div>
                        ${window.payment && payment.isEventJoined(ev._id) ? '<div class="position-absolute top-0 start-0 p-2"><span class="badge bg-success rounded-pill px-2 py-1 small fw-bold"><i class="bi bi-check-circle-fill me-1"></i>Đã đăng ký</span></div>' : ''}
                    </div>
                    <div class="p-4">
                        <h5 class="fw-bold mb-2 font-outfit text-truncate">${ev.title}</h5>
                        <p class="small text-muted mb-1"><i class="bi bi-calendar-event me-2"></i>${ui.formatDate(ev.schedule?.startDate)}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="badge ${ev.pricing?.isFree ? 'price-badge-free' : 'price-badge-paid'} px-2 py-1 rounded-3">${ui.formatPrice(ev.pricing?.price || 0)}</span>
                            ${type === 'joined' ? `<button class="btn btn-sm btn-outline-primary rounded-pill x-small px-3" onclick="event.stopPropagation(); dashboard.showQRTicket('${ev._id}', '${ev.title.replace(/'/g, "\\'")}')"><i class="bi bi-qr-code me-1"></i>Vé QR</button>` : ''}
                            ${type === 'hosting' ? `<button class="btn btn-sm btn-success rounded-pill x-small px-3" onclick="event.stopPropagation(); dashboard.openQRScanner('${ev._id}')"><i class="bi bi-qr-code-scan me-1"></i>Check-in</button>` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Handle UI Interactions
     */
    attachEventListeners() {
        // Tab switching logic
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetTabId = btn.dataset.tab;
                
                // Switch content
                document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.add('d-none'));
                const targetTab = document.getElementById(`tab-${targetTabId}`);
                if (targetTab) targetTab.classList.remove('d-none');
                
                // Switch active button
                document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Logout
        const btnLogout = document.getElementById('btnLogout');
        if (btnLogout) btnLogout.addEventListener('click', () => auth.logout());

        // Profile Form Setup
        this.setupProfileForm();
        
        // Create Event Form Setup
        this.setupCreateEventForm();
    },

    /**
     * Profile Update functionality
     */
    setupProfileForm() {
        const avatarInput = document.getElementById('avatar-input');
        const profilePreview = document.getElementById('profile-preview-img');
        
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        profilePreview.src = re.target.result;
                        this.user.profile.avatar = re.target.result; // Update object state
                    };
                    reader.readAsDataURL(file);
                }
            });
        }

        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(profileForm);
                
                // Update properties
                this.user.profile.fullName = formData.get('fullName');
                this.user.profile.bio = formData.get('bio');
                this.user.phone = formData.get('phone');
                
                // Persistence
                localStorage.setItem('user', JSON.stringify(this.user));
                
                // Refresh local UI
                this.renderProfileSummary();
                api.toast('Cập nhật hồ sơ thành công!', 'success');
            });
        }
    },

    /**
     * Event Creation functionality
     */
    setupCreateEventForm() {
        const eventForm = document.getElementById('create-event-form');
        if (!eventForm) return;

        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(eventForm);
            
            const payload = {
                title: formData.get('title'),
                category: formData.get('category'),
                maxParticipants: parseInt(formData.get('maxParticipants')),
                description: formData.get('description'),
                schedule: {
                    startDate: formData.get('startDate'),
                    endDate: formData.get('endDate')
                },
                location: {
                    type: 'offline',
                    venue: { name: formData.get('venueName') }
                }
            };

            try {
                const res = await api.request('/events/create', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                
                if (res.success) {
                    api.toast('Tạo sự kiện thành công! Chúc vui vẻ.', 'success');
                    setTimeout(() => location.reload(), 1500);
                }
            } catch (err) {
                console.warn('Backend offline, using fallback mock creation');
                // Create Mock
                const mockEv = {
                    _id: 'eve-' + Date.now(),
                    ...payload,
                    creator: { username: this.user.username },
                    currentParticipants: 0,
                    pricing: { isFree: true, price: 0 },
                    coverImage: 'default-activity.png'
                };
                if (window.mockActivities) {
                    window.mockActivities.unshift(mockEv);
                }
                api.toast('Đã tạo sự kiện (Mock Mode)!', 'success');
                
                // Close modal
                const baseModal = document.getElementById('createEventModal');
                if (window.bootstrap) {
                    const inst = bootstrap.Modal.getInstance(baseModal);
                    if (inst) inst.hide();
                }
                
                // Refresh list
                this.loadActivities();
                eventForm.reset();
            }
        });
    },

    /**
     * Load and render transaction history from localStorage
     */
    loadTransactionHistory() {
        const container = document.getElementById('transactions-container');
        const badge = document.getElementById('txn-count-badge');
        if (!container) return;

        const transactions = window.payment ? payment.getTransactions() : [];
        
        // Update count badge and stat card
        if (badge) badge.textContent = transactions.length;
        const statTransactions = document.getElementById('stat-transactions');
        if (statTransactions) statTransactions.textContent = transactions.length;
        if (transactions.length === 0) {
            container.innerHTML = `
                <div class="text-center p-5 rounded-4 bg-white shadow-sm">
                    <i class="bi bi-receipt display-3 text-muted d-block mb-3"></i>
                    <h5 class="fw-bold">Chưa có giao dịch nào</h5>
                    <p class="text-muted">Đăng ký tham gia sự kiện để thấy lịch sử thanh toán tại đây.</p>
                    <a href="discover.html" class="btn btn-primary rounded-pill px-4">Khám phá sự kiện</a>
                </div>
            `;
            return;
        }

        container.innerHTML = transactions.map(txn => {
            const methodLabel = txn.method === 'qr' ? '<i class="bi bi-qr-code me-1"></i>QR Code' : 
                               txn.method === 'card' ? `<i class="bi bi-credit-card me-1"></i>Thẻ ****${txn.cardLast4 || ''}` : 
                               '<i class="bi bi-gift me-1"></i>Miễn phí';
            const statusClass = txn.status === 'completed' ? 'success' : 'pending';
            const statusLabel = txn.status === 'completed' ? 'Thành công' : 'Đang xử lý';
            const dateStr = new Date(txn.date).toLocaleString('vi-VN');

            return `
                <div class="transaction-item mb-3 d-flex align-items-center gap-3" 
                     onclick="location.href='activity-detail.html?id=${txn.eventId}'">
                    <div class="transaction-icon ${statusClass}">
                        <i class="bi ${txn.status === 'completed' ? 'bi-check-circle-fill' : 'bi-clock-history'} fs-4"></i>
                    </div>
                    <div class="flex-grow-1">
                        <div class="fw-bold text-truncate" style="max-width: 250px;">${txn.eventTitle}</div>
                        <div class="small text-muted">${dateStr} · ${methodLabel}</div>
                    </div>
                    <div class="text-end">
                        <div class="fw-bold ${txn.amount > 0 ? 'text-primary' : 'text-success'}">${txn.amount > 0 ? ui.formatPrice(txn.amount) : 'Miễn phí'}</div>
                        <span class="badge bg-${statusClass === 'success' ? 'success' : 'warning'} bg-opacity-10 text-${statusClass === 'success' ? 'success' : 'warning'} rounded-pill px-2 py-1 x-small fw-bold">${statusLabel}</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Load User Achievements (Gamification)
     */
    async loadAchievements() {
        const container = document.getElementById('achievements-container');
        const countSpan = document.getElementById('achievement-count');
        if (!container || !this.user) return;

        try {
            const userId = this.user._id || this.user.id;
            const res = await api.request(`/users/${userId}/achievements`);
            const achievements = res.data?.achievements || [];

            if (countSpan) countSpan.textContent = achievements.length;

            if (achievements.length === 0) {
                container.innerHTML = `<div class="col-12 text-center p-4 text-muted bg-white rounded-3">Bạn chưa mở khóa huy hiệu nào. Hãy tích cực tham gia hoặc tổ chức sự kiện nhé!</div>`;
                return;
            }

            container.innerHTML = achievements.map(ach => `
                <div class="col-sm-6 col-md-4 col-lg-3">
                    <div class="card text-center border-0 shadow-sm rounded-4 h-100 p-3 bg-white">
                        <div class="display-4 mb-2">${ach.icon || '🏅'}</div>
                        <h6 class="fw-bold mb-1">${ach.name}</h6>
                        <p class="small text-muted mb-0" style="font-size: 0.8rem;">${ach.description || ''}</p>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading achievements', error);
            container.innerHTML = `<div class="col-12 text-center p-4 text-danger bg-white rounded-3">Không thể tải danh sách huy hiệu.</div>`;
        }
    },

    /**
     * Initialize Activity Statistics Chart (Chart.js)
     */
    initActivityChart() {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;

        // Custom styling for the chart
        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');

        const data = {
            labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'],
            datasets: [{
                label: 'Giờ tham gia',
                data: [2, 5, 3, 8, 4, 10, 7], // Mock data
                borderColor: '#6366f1',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#6366f1',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 },
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return ` ${context.parsed.y} giờ giải trí`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 11 } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { size: 11 } }
                    }
                }
            }
        });
    },

    /**
     * QR Ticket Display
     */
    showQRTicket(eventId, eventTitle) {
        if (!this.user) return;
        
        const qrContainer = document.getElementById('qr-code-container');
        const titleEl = document.getElementById('qr-event-title');
        
        // Clear old QR
        qrContainer.innerHTML = '';
        titleEl.textContent = eventTitle;
        
        // Payload for QR
        const payload = JSON.stringify({
            userId: this.user.id || this.user._id,
            eventId: eventId,
            timestamp: Date.now()
        });

        // Generate QR using qrcode.js
        if (window.QRCode) {
            new QRCode(qrContainer, {
                text: payload,
                width: 200,
                height: 200,
                colorDark : "#0f172a",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.H
            });
        } else {
            qrContainer.innerHTML = '<span class="text-danger small">Lỗi tải thư viện mã QR.</span>';
        }

        // Show Modal
        const modal = new bootstrap.Modal(document.getElementById('qrTicketModal'));
        modal.show();
    },

    /**
     * QR Scanner functionality for Hosts
     */
    html5QrcodeScanner: null,

    openQRScanner(eventId) {
        const modal = new bootstrap.Modal(document.getElementById('qrScannerModal'));
        const resultEl = document.getElementById('scanner-result');
        resultEl.classList.add('d-none');
        
        modal.show();
        
        // Initialize Scanner when modal is shown
        document.getElementById('qrScannerModal').addEventListener('shown.bs.modal', () => {
            if (this.html5QrcodeScanner) return; // Already running
            
            this.html5QrcodeScanner = new Html5Qrcode("reader");
            
            const config = { fps: 10, qrbox: { width: 250, height: 250 } };
            
            this.html5QrcodeScanner.start(
                { facingMode: "environment" }, 
                config, 
                (decodedText) => {
                    // Success callback
                    this.html5QrcodeScanner.stop();
                    try {
                        const data = JSON.parse(decodedText);
                        // Validate
                        if (data.eventId === eventId) {
                            resultEl.textContent = `✅ Điểm danh thành công! (User ID: ${data.userId.substring(0,8)}...)`;
                            resultEl.className = 'alert alert-success fw-bold small mt-3';
                            // Here you would make an API call to mark user as checked-in
                        } else {
                            resultEl.textContent = `❌ Vé không hợp lệ cho sự kiện này!`;
                            resultEl.className = 'alert alert-danger fw-bold small mt-3';
                        }
                    } catch (e) {
                        resultEl.textContent = `❌ Mã QR không đúng định dạng nền tảng!`;
                        resultEl.className = 'alert alert-danger fw-bold small mt-3';
                    }
                    resultEl.classList.remove('d-none');
                    
                    // Auto hide after 3 seconds
                    setTimeout(() => {
                        const m = bootstrap.Modal.getInstance(document.getElementById('qrScannerModal'));
                        if (m) m.hide();
                    }, 3000);
                },
                (errorMessage) => {
                    // parse error, ignore as it's continuously scanning
                }
            ).catch((err) => {
                console.error("Lỗi khởi tạo Camera:", err);
                resultEl.textContent = `❌ Lỗi Camera: Không được cấp quyền hoặc thiết bị không hỗ trợ.`;
                resultEl.className = 'alert alert-warning fw-bold small mt-3';
                resultEl.classList.remove('d-none');
            });
        }, { once: true });
        
        // Cleanup when modal closes
        document.getElementById('qrScannerModal').addEventListener('hidden.bs.modal', () => {
            if (this.html5QrcodeScanner) {
                this.html5QrcodeScanner.stop().then(() => {
                    this.html5QrcodeScanner.clear();
                    this.html5QrcodeScanner = null;
                }).catch(e => console.log('Error stopping scanner', e));
            }
        }, { once: true });
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => dashboard.init());

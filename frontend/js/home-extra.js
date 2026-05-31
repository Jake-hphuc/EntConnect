/**
 * EntConnect Home Extra — Additive JS Module
 * Independent module that adds new sections to the homepage.
 * Does NOT modify any existing logic (main.js, ui.js, etc.)
 * All rendering targets containers with 'hx-' prefixed IDs.
 */

const homeExtra = {

    // ============================================
    // ENTRY POINT
    // ============================================
    init() {
        this.renderQuickActions();
        this.renderStatsCounter();
        this.renderFeaturedCompanions();
        this.renderActivityFeed();
        this.renderLeaderboard();
        this.renderPersonalizedBlock();
        this.renderCtaBanner();
        this.triggerRevealAnimations();
    },

    // ============================================
    // 1. QUICK ACTIONS — Navigation Grid
    // ============================================
    renderQuickActions() {
        const container = document.getElementById('hx-quick-actions-container');
        if (!container) return;

        const actions = [
            { icon: 'bi-calendar-event', label: 'Sự kiện', href: '/discover', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
            { icon: 'bi-people-fill', label: 'Cộng đồng', href: '/community', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
            { icon: 'bi-chat-dots-fill', label: 'Phòng chat', href: '#', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', action: 'open-chat' },
            { icon: 'bi-robot', label: 'AI Tư vấn', href: '#', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', action: 'open-ai' },
            { icon: 'bi-person-hearts', label: 'Thuê bạn', href: '/hire.html', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' }
        ];

        container.innerHTML = actions.map(a => `
            <a class="hx-quick-action-card reveal-on-scroll" href="${a.href}" 
               ${a.action ? `data-hx-action="${a.action}"` : ''}>
                <div class="hx-quick-action-icon" style="background: ${a.bg}; color: ${a.color};">
                    <i class="bi ${a.icon}"></i>
                </div>
                <span class="hx-quick-action-label">${a.label}</span>
            </a>
        `).join('');

        // Bind special actions (chat / AI) — uses addEventListener, not overriding
        container.querySelectorAll('[data-hx-action]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const action = el.dataset.hxAction;
                if (action === 'open-chat' && window.chatRealtime) {
                    // Toggle chat window via existing chat-realtime.js
                    const chatToggle = document.getElementById('chat-toggle-btn');
                    if (chatToggle) chatToggle.click();
                } else if (action === 'open-ai' && window.aiAssistant) {
                    const aiToggle = document.getElementById('ai-toggle-btn');
                    if (aiToggle) aiToggle.click();
                } else {
                    if (window.api) api.toast('Tính năng sẽ sẵn sàng trong phiên bản tiếp theo!', 'info');
                }
            });
        });
    },

    // ============================================
    // 2. STATS COUNTER — Animated numbers
    // ============================================
    renderStatsCounter() {
        const container = document.getElementById('hx-stats-container');
        if (!container) return;

        const usersCount = (window.mockUsers || []).length + (window.mockCompanions || []).length;
        const eventsCount = (window.mockActivities || []).length;
        const communitiesCount = window.communityData ? window.communityData.getCommunities().length : 0;

        const stats = [
            { value: usersCount * 127, label: 'Người dùng', icon: 'bi-people', color: '#6366f1' },
            { value: eventsCount * 89, label: 'Sự kiện đã tổ chức', icon: 'bi-calendar-check', color: '#10b981' },
            { value: communitiesCount * 312, label: 'Cộng đồng hoạt động', icon: 'bi-globe', color: '#f59e0b' },
            { value: 98, label: '% Hài lòng', icon: 'bi-emoji-smile', color: '#ec4899', suffix: '%' }
        ];

        container.innerHTML = stats.map(s => `
            <div class="hx-stat-card reveal-on-scroll">
                <div class="hx-stat-number" data-hx-count="${s.value}" data-hx-suffix="${s.suffix || ''}">0${s.suffix || ''}</div>
                <div class="hx-stat-label"><i class="bi ${s.icon} me-1" style="color: ${s.color};"></i>${s.label}</div>
            </div>
        `).join('');

        // Counter animation with IntersectionObserver
        this._setupCounterAnimation();
    },

    _setupCounterAnimation() {
        const counters = document.querySelectorAll('[data-hx-count]');
        if (counters.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.hxCounted) {
                    entry.target.dataset.hxCounted = 'true';
                    this._animateCounter(entry.target);
                }
            });
        }, { threshold: 0.3 });

        counters.forEach(el => observer.observe(el));
    },

    _animateCounter(el) {
        const target = parseInt(el.dataset.hxCount);
        const suffix = el.dataset.hxSuffix || '';
        const duration = 2000;
        const start = performance.now();

        const animate = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            const current = Math.floor(eased * target);
            el.textContent = current.toLocaleString('vi-VN') + suffix;
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    },

    // ============================================
    // 3. FEATURED COMPANIONS — Horizontal Cards
    // ============================================
    renderFeaturedCompanions() {
        const container = document.getElementById('hx-companions-container');
        if (!container) return;

        const companions = window.mockCompanions || [];
        if (companions.length === 0) {
            container.innerHTML = '<p class="text-muted">Chưa có dữ liệu bạn đồng hành.</p>';
            return;
        }

        // Sort by rating desc, take top 8 with tag "hot" or "top-rated" first
        const featured = [...companions]
            .sort((a, b) => {
                const aHot = (a.tags || []).some(t => ['hot', 'top-rated', 'vip'].includes(t)) ? 1 : 0;
                const bHot = (b.tags || []).some(t => ['hot', 'top-rated', 'vip'].includes(t)) ? 1 : 0;
                if (bHot !== aHot) return bHot - aHot;
                return b.rating - a.rating;
            })
            .slice(0, 8);

        container.innerHTML = featured.map(c => {
            const stars = '★'.repeat(Math.floor(c.rating)) + (c.rating % 1 >= 0.5 ? '½' : '');
            const skills = (c.skills || []).slice(0, 3).map(s => `<span class="hx-skill-tag">${s}</span>`).join('');
            const statusLabel = (window.STATUS_LABELS && window.STATUS_LABELS[c.status]) || c.status;
            const priceFormatted = window.ui ? window.ui.formatPrice(c.pricePerHour) : c.pricePerHour + 'đ';

            return `
                <div class="hx-companion-card">
                    <div class="hx-companion-avatar-wrapper">
                        <img src="${c.avatar}" alt="${c.name}" loading="lazy">
                        <span class="hx-companion-status ${c.status}">${statusLabel}</span>
                        <span class="hx-companion-price-badge">${priceFormatted}/giờ</span>
                    </div>
                    <div class="hx-companion-body">
                        <div class="hx-companion-name">
                            ${c.name}
                            ${c.verified ? '<i class="bi bi-patch-check-fill hx-verified"></i>' : ''}
                        </div>
                        <div class="hx-companion-rating">
                            <span class="hx-stars">${stars}</span>
                            <span class="hx-review-count">(${c.reviewsCount} đánh giá)</span>
                        </div>
                        <div class="hx-companion-skills">${skills}</div>
                        <a href="/hire.html" class="hx-companion-btn">Khám phá</a>
                    </div>
                </div>
            `;
        }).join('');
    },

    // ============================================
    // 4. ACTIVITY FEED — Recent Activities
    // ============================================
    renderActivityFeed() {
        const container = document.getElementById('hx-activity-container');
        if (!container) return;

        const users = window.mockUsers || [];
        const events = window.mockActivities || [];
        const communities = window.communityData ? window.communityData.getCommunities() : [];
        const companions = window.mockCompanions || [];

        // Generate mock activities
        const activities = [];

        // Type 1: User joined event
        if (users.length > 0 && events.length > 0) {
            for (let i = 0; i < Math.min(3, events.length); i++) {
                const u = users[i % users.length];
                const e = events[i];
                activities.push({
                    avatar: u.avatar,
                    html: `<strong>${u.fullName}</strong> vừa tham gia sự kiện <strong>${e.title}</strong>`,
                    time: this._randomTimeAgo(),
                    icon: 'bi-calendar-check',
                    iconBg: 'rgba(16,185,129,0.1)',
                    iconColor: '#10b981'
                });
            }
        }

        // Type 2: User joined community
        if (users.length > 0 && communities.length > 0) {
            for (let i = 0; i < Math.min(2, communities.length); i++) {
                const u = users[(i + 1) % users.length];
                const c = communities[i];
                activities.push({
                    avatar: u.avatar,
                    html: `<strong>${u.fullName}</strong> vừa gia nhập cộng đồng <strong>${c.name}</strong>`,
                    time: this._randomTimeAgo(),
                    icon: 'bi-people',
                    iconBg: 'rgba(99,102,241,0.1)',
                    iconColor: '#6366f1'
                });
            }
        }

        // Type 3: Users connected
        if (users.length >= 2) {
            activities.push({
                avatar: users[0].avatar,
                html: `<strong>${users[0].fullName}</strong> đã kết nối với <strong>${users[1].fullName}</strong>`,
                time: this._randomTimeAgo(),
                icon: 'bi-link-45deg',
                iconBg: 'rgba(236,72,153,0.1)',
                iconColor: '#ec4899'
            });
        }

        // Type 4: Companion hired
        if (companions.length > 0) {
            const cp = companions[0];
            activities.push({
                avatar: cp.avatar,
                html: `<strong>${cp.name}</strong> vừa nhận được lượt thuê mới — Rating <strong>${cp.rating}★</strong>`,
                time: this._randomTimeAgo(),
                icon: 'bi-star',
                iconBg: 'rgba(245,158,11,0.1)',
                iconColor: '#f59e0b'
            });
        }

        // Type 5: New event created
        if (events.length > 3) {
            activities.push({
                avatar: 'https://i.pravatar.cc/80?u=creator1',
                html: `Sự kiện mới <strong>${events[3].title}</strong> vừa được tạo`,
                time: this._randomTimeAgo(),
                icon: 'bi-plus-circle',
                iconBg: 'rgba(99,102,241,0.1)',
                iconColor: '#6366f1'
            });
        }

        // Sort by time (random so just shuffle)
        activities.sort(() => Math.random() - 0.5);

        container.innerHTML = activities.slice(0, 8).map(a => `
            <div class="hx-activity-item">
                <img src="${a.avatar}" alt="avatar" class="hx-activity-avatar" 
                     onerror="this.src='https://i.pravatar.cc/80?u=' + Math.random()">
                <div class="hx-activity-icon" style="background: ${a.iconBg}; color: ${a.iconColor};">
                    <i class="bi ${a.icon}"></i>
                </div>
                <div class="hx-activity-content">${a.html}</div>
                <span class="hx-activity-time">${a.time}</span>
            </div>
        `).join('');
    },

    _randomTimeAgo() {
        const times = ['2 phút trước', '5 phút trước', '12 phút trước', '30 phút trước',
                        '1 giờ trước', '2 giờ trước', '3 giờ trước', '5 giờ trước',
                        '8 giờ trước', '1 ngày trước'];
        return times[Math.floor(Math.random() * times.length)];
    },

    // ============================================
    // 5. LEADERBOARD — 3-tab ranking
    // ============================================
    renderLeaderboard() {
        const container = document.getElementById('hx-leaderboard-container');
        const tabsContainer = document.getElementById('hx-leaderboard-tabs');
        if (!container || !tabsContainer) return;

        const tabs = [
            { id: 'users', label: '🏅 Top Người dùng' },
            { id: 'communities', label: '🌐 Top Cộng đồng' },
            { id: 'events', label: '🔥 Top Sự kiện' }
        ];

        // Render tab pills
        tabsContainer.innerHTML = tabs.map((t, i) => `
            <button class="hx-leaderboard-tab ${i === 0 ? 'active' : ''}" data-hx-tab="${t.id}">${t.label}</button>
        `).join('');

        // Prepare data for each tab
        const data = this._getLeaderboardData();

        // Initial render
        this._renderLeaderboardTab(container, data.users);

        // Tab switching (addEventListener, not overriding)
        tabsContainer.addEventListener('click', (e) => {
            const tab = e.target.closest('[data-hx-tab]');
            if (!tab) return;

            tabsContainer.querySelectorAll('.hx-leaderboard-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabId = tab.dataset.hxTab;
            this._renderLeaderboardTab(container, data[tabId]);
        });
    },

    _getLeaderboardData() {
        // Top Users — from mockUsers + companions
        const users = (window.mockUsers || []).map((u, i) => ({
            name: u.fullName,
            avatar: u.avatar,
            score: Math.floor(Math.random() * 800 + 200),
            meta: u.interests.slice(0, 2).join(', ')
        }));

        // Add some companion users
        const comps = (window.mockCompanions || []).slice(0, 5).map(c => ({
            name: c.name,
            avatar: c.avatar,
            score: c.reviewsCount || Math.floor(Math.random() * 500),
            meta: `${c.rating}★ • ${c.reviewsCount} đánh giá`
        }));

        const allUsers = [...users, ...comps].sort((a, b) => b.score - a.score).slice(0, 5);

        // Top Communities
        const communities = (window.communityData ? window.communityData.getCommunities() : [])
            .map(c => ({
                name: c.name,
                avatar: c.coverImage,
                score: c.memberCount,
                meta: c.activityLevel
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        // Top Events
        const events = (window.mockActivities || [])
            .map(e => ({
                name: e.title,
                avatar: e.coverImage,
                score: e.currentParticipants || 0,
                meta: `${e.currentParticipants}/${e.maxParticipants} người`
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        return { users: allUsers, communities, events };
    },

    _renderLeaderboardTab(container, items) {
        if (!items || items.length === 0) {
            container.innerHTML = '<p class="text-muted small text-center py-4">Chưa có dữ liệu.</p>';
            return;
        }

        const rankClasses = ['hx-rank-1', 'hx-rank-2', 'hx-rank-3'];
        const badgeClasses = ['hx-gold', 'hx-silver', 'hx-bronze'];

        container.innerHTML = items.map((item, i) => `
            <div class="hx-leaderboard-item ${i < 3 ? rankClasses[i] : ''}">
                <span class="hx-rank-badge ${i < 3 ? badgeClasses[i] : ''}">${i + 1}</span>
                <img src="${item.avatar}" alt="${item.name}" class="hx-lb-avatar" loading="lazy"
                     onerror="this.src='https://i.pravatar.cc/80?u=' + Math.random()">
                <div class="hx-lb-info">
                    <div class="hx-lb-name">${item.name}</div>
                    <div class="hx-lb-meta">${item.meta}</div>
                </div>
                <div class="hx-lb-score">${typeof item.score === 'number' ? item.score.toLocaleString('vi-VN') : item.score}</div>
            </div>
        `).join('');
    },

    // ============================================
    // 6. PERSONALIZED BLOCK — For logged-in users
    // ============================================
    renderPersonalizedBlock() {
        const section = document.getElementById('hx-personalized-section');
        const container = document.getElementById('hx-personalized-container');
        if (!section || !container) return;

        const userStr = localStorage.getItem('entconnect_user');
        const token = localStorage.getItem('token');

        if (!userStr && !token) {
            // Not logged in — hide section
            section.style.display = 'none';
            return;
        }

        section.style.display = '';

        // Get user interests from localStorage
        let interests = [];
        try {
            const user = JSON.parse(userStr);
            interests = user.interests || user.hobbies || [];
        } catch (e) {}

        // If userPrefs is available, use that
        if (window.userPrefs && typeof userPrefs.getTopInterests === 'function') {
            interests = userPrefs.getTopInterests(3);
        }

        // Get events matching interests, or random if no interests
        const allEvents = window.mockActivities || [];
        let matched = [];

        if (interests.length > 0) {
            matched = allEvents.filter(e => {
                const cat = (e.category || '').toLowerCase();
                const tags = (e.tags || []).map(t => t.toLowerCase());
                return interests.some(i => {
                    const iLower = i.toLowerCase();
                    return cat.includes(iLower) || tags.some(t => t.includes(iLower));
                });
            });
        }

        // Fallback to random popular
        if (matched.length < 3) {
            const remaining = allEvents.filter(e => !matched.find(m => m._id === e._id));
            matched = [...matched, ...remaining.sort(() => Math.random() - 0.5)];
        }

        matched = matched.slice(0, 4);

        // Also add recommended communities
        const communities = window.communityData ? window.communityData.getCommunities() : [];
        const recCommunities = communities.sort(() => Math.random() - 0.5).slice(0, 2);

        let html = '';

        // Events
        matched.forEach(e => {
            const date = window.ui ? window.ui.formatDate(e.schedule?.startDate) : '';
            const price = window.ui ? window.ui.formatPrice(e.pricing?.price) : '';
            const img = window.ui ? window.ui.resolveImageUrl(e.coverImage, 'activity', e.category) : e.coverImage;

            html += `
                <div class="hx-personalized-card reveal-on-scroll" onclick="location.href='activity-detail.html?id=${e._id}'" style="cursor:pointer;">
                    <div class="hx-personalized-card-img">
                        <img src="${img}" alt="${e.title}" loading="lazy"
                             onerror="this.src='https://placehold.co/400x200/6366f1/fff?text=Event'">
                    </div>
                    <div class="hx-personalized-card-body">
                        <div class="hx-personalized-card-title">${e.title}</div>
                        <div class="hx-personalized-card-meta">
                            <i class="bi bi-calendar3 me-1"></i>${date} • ${price}
                        </div>
                    </div>
                </div>
            `;
        });

        // Communities
        recCommunities.forEach(c => {
            html += `
                <div class="hx-personalized-card reveal-on-scroll" onclick="location.href='/community'" style="cursor:pointer;">
                    <div class="hx-personalized-card-img">
                        <img src="${c.coverImage}" alt="${c.name}" loading="lazy">
                    </div>
                    <div class="hx-personalized-card-body">
                        <div class="hx-personalized-card-title"><i class="bi bi-people me-1"></i>${c.name}</div>
                        <div class="hx-personalized-card-meta">
                            ${c.memberCount.toLocaleString()} thành viên • ${c.activityLevel}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    // ============================================
    // 7. CTA BANNER — For guest users
    // ============================================
    renderCtaBanner() {
        const section = document.getElementById('hx-cta-section');
        if (!section) return;

        const userStr = localStorage.getItem('entconnect_user');
        const token = localStorage.getItem('token');

        if (userStr || token) {
            // Logged in — hide CTA
            section.style.display = 'none';
            return;
        }

        section.style.display = '';
    },

    // ============================================
    // UTILITY: Trigger IntersectionObserver for new sections
    // ============================================
    triggerRevealAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        // Only observe elements inside hx- sections to avoid touching existing observers
        document.querySelectorAll('[id^="hx-"] .reveal-on-scroll, [class*="hx-"].reveal-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }
};

// ============================================
// INIT — Wait for DOM and existing modules to be ready
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Delay init slightly to ensure main.js and other modules have loaded
    setTimeout(() => {
        homeExtra.init();
    }, 300);
});

window.homeExtra = homeExtra;

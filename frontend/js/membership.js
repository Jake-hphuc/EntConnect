/**
 * EntConnect — Membership UI Coordinator (membership.js)
 * Coordinates UI updates, renders badges, membership cards, level-up effects,
 * and hooks into existing user actions to award EXP.
 * 
 * SAFE: Isolated UI controller. Uses clean monkeypatching to detect user actions.
 */

const MembershipUI = {

    /**
     * Initialize Membership UI and event hooks
     */
    init() {
        this.renderNavbarBadge();
        this.renderDashboardCard();
        this.renderDashboardAchievements();
        this.bindEvents();
        this.hookUserActions();
        console.log('[MembershipUI] Initialized ✅');
    },

    /**
     * Bind system level-up and update events
     */
    bindEvents() {
        window.addEventListener('membership:updated', () => {
            this.renderNavbarBadge();
            this.renderDashboardCard();
            this.renderDashboardAchievements();
        });

        window.addEventListener('membership:levelup', (e) => {
            this.showLevelUpEffect(e.detail.level);
        });

        window.addEventListener('membership:rankup', (e) => {
            this.showRankUpEffect(e.detail.rank);
        });
    },

    /**
     * Hook into global app flows to reward EXP safely without changing original files
     */
    hookUserActions() {
        // 1. Hook into community chat messages
        if (window.communityChat && window.communityChat.sendMessage) {
            const originalSendMessage = window.communityChat.sendMessage;
            window.communityChat.sendMessage = function() {
                originalSendMessage.apply(this, arguments);
                if (window.ExpSystem && window.AchievementSystem) {
                    window.ExpSystem.addExp(window.EXP_RULES.COMMUNITY_CHAT.amount, window.EXP_RULES.COMMUNITY_CHAT.label);
                    window.AchievementSystem.trackEvent('chat_message');
                }
            };
            console.log('[MembershipUI] Hooked communityChat.sendMessage ✅');
        }

        // 2. Hook into companion bookings (hire-payment.js success state)
        if (window.hirePayment && window.hirePayment._renderSuccess) {
            const originalRenderSuccess = window.hirePayment._renderSuccess;
            window.hirePayment._renderSuccess = function(paidNow, method, pendingAmount) {
                originalRenderSuccess.apply(this, arguments);
                if (window.ExpSystem && window.AchievementSystem) {
                    window.ExpSystem.addExp(window.EXP_RULES.SUCCESSFUL_BOOKING.amount, window.EXP_RULES.SUCCESSFUL_BOOKING.label);
                    window.AchievementSystem.trackEvent('successful_booking');
                }
            };
            console.log('[MembershipUI] Hooked hirePayment._renderSuccess ✅');
        }

        // 3. Hook into companion reviews (review.js submit success)
        if (window.reviewManager && window.reviewManager.submitReview) {
            const originalSubmitReview = window.reviewManager.submitReview;
            window.reviewManager.submitReview = function(bookingId, companionId, rating, comment) {
                const success = originalSubmitReview.apply(this, arguments);
                if (success && rating === 5) {
                    if (window.ExpSystem && window.AchievementSystem) {
                        window.ExpSystem.addExp(window.EXP_RULES.FIVE_STAR_REVIEW.amount, window.EXP_RULES.FIVE_STAR_REVIEW.label);
                        window.AchievementSystem.trackEvent('five_star_review');
                    }
                }
                return success;
            };
            console.log('[MembershipUI] Hooked reviewManager.submitReview ✅');
        }

        // 4. Hook into event joins & community joins (via payment_success event)
        document.addEventListener('payment_success', (e) => {
            const isCommunity = e.detail && e.detail.isCommunity;
            if (window.ExpSystem && window.AchievementSystem) {
                if (isCommunity) {
                    // Handled inside api.toast hook for free, but let's cover paid here
                    window.ExpSystem.addExp(50, 'Gia nhập cộng đồng');
                    window.AchievementSystem.trackEvent('join_community');
                } else {
                    window.ExpSystem.addExp(window.EXP_RULES.JOIN_EVENT.amount, window.EXP_RULES.JOIN_EVENT.label);
                    window.AchievementSystem.trackEvent('join_event');
                }
            }
        });

        // 5. Hook into api.toast to detect event creation
        if (window.api && window.api.toast) {
            const originalToast = window.api.toast;
            window.api.toast = function(message, type) {
                originalToast.apply(this, arguments);
                if (type === 'success') {
                    if (message.includes('Tạo sự kiện') || message.includes('Đã tạo sự kiện')) {
                        if (window.ExpSystem && window.AchievementSystem) {
                            window.ExpSystem.addExp(window.EXP_RULES.CREATE_EVENT.amount, window.EXP_RULES.CREATE_EVENT.label);
                            window.AchievementSystem.trackEvent('host_event');
                        }
                    } else if (message.includes('Tham gia cộng đồng')) {
                        if (window.ExpSystem && window.AchievementSystem) {
                            window.ExpSystem.addExp(50, 'Gia nhập cộng đồng');
                            window.AchievementSystem.trackEvent('join_community');
                        }
                    }
                }
            };
            console.log('[MembershipUI] Hooked api.toast ✅');
        }
    },

    // ------- RENDER METHODS -------

    /**
     * Render the rank badge in the navbar
     */
    renderNavbarBadge() {
        const badgeContainer = document.getElementById('navbar-rank-badge');
        if (!badgeContainer) return;

        const isLoggedIn = !!localStorage.getItem('user');
        if (!isLoggedIn) {
            badgeContainer.classList.add('d-none');
            return;
        }

        const data = window.ExpSystem ? window.ExpSystem.getFullMembership() : null;
        if (!data) return;

        badgeContainer.className = 'rank-badge-nav d-flex align-items-center gap-1';
        badgeContainer.style.background = data.rank.gradient;
        badgeContainer.style.boxShadow = `0 0 10px ${data.rank.glow}`;
        badgeContainer.title = `Level ${data.level} — ${data.exp} EXP (${data.progressPct}% tới rank kế)`;
        badgeContainer.innerHTML = `
            <span class="rank-badge-icon">${data.rank.icon}</span>
            <span class="rank-badge-name d-none d-lg-inline">${data.rank.name}</span>
            <span class="rank-badge-level">Lv.${data.level}</span>
        `;
    },

    /**
     * Render the membership details card in the dashboard
     */
    renderDashboardCard() {
        const container = document.getElementById('membership-card-container');
        if (!container) return;

        const data = window.ExpSystem ? window.ExpSystem.getFullMembership() : null;
        if (!data) return;

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : { username: 'Gamer' };
        const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff`;

        const perksHtml = data.rank.perks.map(perk => `<li><i class="bi bi-patch-check-fill me-2" style="color: ${data.rank.color}"></i>${perk}</li>`).join('');

        container.innerHTML = `
            <div class="membership-card p-4 rounded-4 position-relative overflow-hidden mb-4" style="border: 1px solid ${data.rank.color}30;">
                <div class="membership-card-glow" style="background: ${data.rank.color}15;"></div>
                
                <div class="d-flex align-items-center gap-3 mb-3 relative-z">
                    <div class="avatar-wrap-rank">
                        <img src="${avatarUrl}" class="rounded-circle border-avatar-rank" style="border-color: ${data.rank.color}">
                        <div class="avatar-rank-badge" style="background: ${data.rank.gradient}">${data.rank.icon}</div>
                    </div>
                    <div>
                        <h5 class="fw-bold mb-1 font-outfit text-white">@${user.username}</h5>
                        <span class="badge px-3 py-1 rounded-pill fw-bold" style="background: ${data.rank.gradient}; box-shadow: 0 4px 12px ${data.rank.glow};">
                            ${data.rank.name}
                        </span>
                    </div>
                </div>

                <div class="exp-bar-section mb-3 relative-z">
                    <div class="d-flex justify-content-between small text-white-50 mb-1">
                        <span>Level ${data.level}</span>
                        <span>${data.exp} / ${data.nextRank ? data.nextRank.minExp : 'MAX'} EXP</span>
                    </div>
                    <div class="progress exp-progress-wrap bg-dark bg-opacity-50" style="height: 10px; border-radius: 5px;">
                        <div class="progress-bar exp-progress-bar rounded-pill" 
                             style="width: ${data.progressPct}%; background: ${data.rank.gradient}; box-shadow: 0 0 10px ${data.rank.color};"></div>
                    </div>
                    ${data.nextRank ? `
                        <div class="text-end text-white-50 small mt-1" style="font-size: 0.72rem;">
                            Còn <strong>${data.expToNext} EXP</strong> để lên rank <strong>${data.nextRank.name}</strong>
                        </div>
                    ` : `
                        <div class="text-end text-white-50 small mt-1" style="font-size: 0.72rem;">
                            Bạn đã đạt rank cao nhất! 👑
                        </div>
                    `}
                </div>

                <hr class="border-white opacity-10 my-3 relative-z">

                <div class="perks-section relative-z">
                    <h6 class="text-white small fw-bold mb-2"><i class="bi bi-gem me-1" style="color: ${data.rank.color}"></i> Đặc quyền của bạn:</h6>
                    <ul class="perks-list small">
                        ${perksHtml}
                    </ul>
                </div>
            </div>
        `;
    },

    /**
     * Render unlocked & locked achievement badges in the dashboard
     */
    renderDashboardAchievements() {
        const container = document.getElementById('achievements-container');
        if (!container) return;

        if (!window.AchievementSystem) return;

        const achievements = window.AchievementSystem.getAll();

        let html = '<div class="row g-3">';
        achievements.forEach(ach => {
            const lockedClass = ach.isUnlocked ? '' : 'achievement-locked';
            const badgeGlow = ach.isUnlocked ? `box-shadow: 0 4px 15px ${ach.color}25; border-color: ${ach.color}40;` : '';
            
            html += `
                <div class="col-6 col-md-4 col-lg-3">
                    <div class="achievement-badge-card text-center p-3 rounded-4 h-100 ${lockedClass}" style="${badgeGlow}">
                        <div class="achievement-badge-icon mb-2" style="background: ${ach.color}${ach.isUnlocked ? '15' : '08'}; color: ${ach.isUnlocked ? ach.color : '#6b7280'};">
                            ${ach.icon}
                        </div>
                        <div class="achievement-badge-name fw-bold mb-1 small">${ach.name}</div>
                        <div class="achievement-badge-desc text-muted x-small">${ach.description}</div>
                        ${ach.reward > 0 && !ach.isUnlocked ? `<div class="achievement-badge-reward text-primary mt-1 x-small">+${ach.reward} EXP</div>` : ''}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    },

    // ------- CELEBRATION EFFECTS -------

    /**
     * Show Level-Up Modal Overlay with custom confetti
     */
    showLevelUpEffect(level) {
        const id = 'level-up-modal-' + Date.now();
        const html = `
            <div id="${id}" class="level-up-overlay">
                <div class="level-up-card text-center">
                    <div class="level-up-badge-wrap">🆙</div>
                    <h2 class="level-up-title font-outfit fw-bold mt-3 text-white">LEVEL UP!</h2>
                    <p class="text-white-50">Bạn đã thăng cấp lên level mới!</p>
                    <div class="level-up-number">${level}</div>
                    <button class="btn btn-primary rounded-pill px-5 py-3 fw-bold mt-4 shadow-lg btn-level-up-close">Tuyệt vời</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        // Confetti particles
        this.spawnConfetti();

        // Close logic
        const overlay = document.getElementById(id);
        overlay.querySelector('.btn-level-up-close').addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        });
    },

    /**
     * Show Rank-Up Modal Overlay with rank-specific styling
     */
    showRankUpEffect(rank) {
        const id = 'rank-up-modal-' + Date.now();
        const html = `
            <div id="${id}" class="level-up-overlay">
                <div class="level-up-card rank-up-card text-center" style="border-color: ${rank.color}40;">
                    <div class="level-up-badge-wrap" style="background: ${rank.gradient}; box-shadow: 0 0 25px ${rank.glow};">${rank.icon}</div>
                    <h2 class="level-up-title font-outfit fw-bold mt-3 text-white">RANK UP!</h2>
                    <p class="text-white-50">Chúc mừng bạn đã đạt Rank thành viên mới!</p>
                    <div class="rank-up-name" style="background: ${rank.gradient}; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                        ${rank.name}
                    </div>
                    <div class="perks-unlocked-title text-white small fw-bold mt-3 mb-2">🎁 Đã mở khóa đặc quyền mới:</div>
                    <ul class="text-start small text-white-50 mx-auto" style="max-width: 280px;">
                        ${rank.perks.map(p => `<li>✔️ ${p}</li>`).join('')}
                    </ul>
                    <button class="btn btn-primary rounded-pill px-5 py-3 fw-bold mt-4 shadow-lg btn-level-up-close" style="background: ${rank.gradient}; border: none;">Tuyệt vời</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        this.spawnConfetti();

        const overlay = document.getElementById(id);
        overlay.querySelector('.btn-level-up-close').addEventListener('click', () => {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
        });
    },

    /**
     * Pure JS + CSS Confetti Spawner
     */
    spawnConfetti() {
        const colors = ['#f43f5e', '#3b82f6', '#10b981', '#fbbf24', '#8b5cf6', '#ec4899'];
        for (let i = 0; i < 80; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-particle';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = Math.random() * -20 + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = Math.random() * 8 + 6 + 'px';
            confetti.style.height = Math.random() * 15 + 10 + 'px';
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animation = `confettiFall ${Math.random() * 2 + 2}s linear forwards`;
            confetti.style.animationDelay = Math.random() * 1.5 + 's';
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }
};

// Expose globally
window.MembershipUI = MembershipUI;

// Auto init
document.addEventListener('DOMContentLoaded', () => {
    // Slight delay to let components finish setup and load auth details
    setTimeout(() => {
        MembershipUI.init();
    }, 1000);
});

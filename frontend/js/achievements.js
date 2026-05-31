/**
 * EntConnect — Achievement System (achievements.js)
 * Manages user achievements / badges unlocking.
 * 
 * SAFE: Isolated module. No dependency on auth/chat/search/booking internals.
 */

// ============================================================
// 1. ACHIEVEMENT DEFINITIONS
// ============================================================
const ACHIEVEMENT_LIST = [
    {
        id: 'first_login',
        name: 'Bước chân đầu tiên',
        description: 'Đăng nhập lần đầu tiên vào EntConnect',
        icon: '🚀',
        reward: 10,
        color: '#6366f1',
        condition: (stats) => stats.loginCount >= 1
    },
    {
        id: 'newcomer',
        name: 'Người mới năng nổ',
        description: 'Tham gia thành công 5 sự kiện trên nền tảng',
        icon: '⚡',
        reward: 50,
        color: '#f59e0b',
        condition: (stats) => stats.joinedEvents >= 5
    },
    {
        id: 'host_talent',
        name: 'Host tài năng',
        description: 'Tổ chức thành công 3 sự kiện có người tham gia',
        icon: '🎤',
        reward: 100,
        color: '#10b981',
        condition: (stats) => stats.hostedEvents >= 3
    },
    {
        id: 'chat_master',
        name: 'Chat Master',
        description: 'Gửi 50 tin nhắn trong cộng đồng',
        icon: '💬',
        reward: 30,
        color: '#3b82f6',
        condition: (stats) => stats.chatMessages >= 50
    },
    {
        id: 'community_hero',
        name: 'Community Hero',
        description: 'Tham gia 3 cộng đồng khác nhau',
        icon: '🌐',
        reward: 40,
        color: '#8b5cf6',
        condition: (stats) => stats.joinedCommunities >= 3
    },
    {
        id: 'five_star',
        name: 'Người bạn đáng tin cậy',
        description: 'Nhận được 5 đánh giá 5 sao từ người dùng khác',
        icon: '⭐',
        reward: 80,
        color: '#f59e0b',
        condition: (stats) => stats.fiveStarReviews >= 5
    },
    {
        id: 'daily_streak_7',
        name: 'Kiên trì 7 ngày',
        description: 'Đăng nhập liên tục 7 ngày',
        icon: '🔥',
        reward: 70,
        color: '#ef4444',
        condition: (stats) => stats.loginStreak >= 7
    },
    {
        id: 'companion',
        name: 'Bạn đồng hành',
        description: 'Hoàn thành booking thuê bạn thành công',
        icon: '🤝',
        reward: 60,
        color: '#ec4899',
        condition: (stats) => stats.successfulBookings >= 1
    },
    {
        id: 'explorer_rank',
        name: 'Rank: Explorer',
        description: 'Bắt đầu hành trình trên EntConnect',
        icon: '🌱',
        reward: 0,
        color: '#6b7280',
        condition: (stats) => stats.exp >= 0
    },
    {
        id: 'connector_rank',
        name: 'Rank: Connector',
        description: 'Đạt rank Connector với 500 EXP',
        icon: '🔗',
        reward: 50,
        color: '#10b981',
        condition: (stats) => stats.exp >= 500
    },
    {
        id: 'influencer_rank',
        name: 'Rank: Influencer',
        description: 'Đạt rank Influencer với 2000 EXP',
        icon: '✨',
        reward: 100,
        color: '#8b5cf6',
        condition: (stats) => stats.exp >= 2000
    }
];

// ============================================================
// 2. ACHIEVEMENT ENGINE
// ============================================================
const AchievementSystem = {

    STORAGE_KEY: 'ent_achievement_stats',

    /** Get or initialize user stats for achievement checking */
    getStats() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
            try { return JSON.parse(raw); }
            catch(e) {}
        }
        return {
            loginCount: 0,
            loginStreak: 0,
            lastLoginDate: null,
            joinedEvents: 0,
            hostedEvents: 0,
            chatMessages: 0,
            joinedCommunities: 0,
            fiveStarReviews: 0,
            successfulBookings: 0,
            exp: 0
        };
    },

    /** Save user stats */
    saveStats(stats) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
    },

    /** Get unlocked achievement IDs from membership data */
    getUnlockedIds() {
        const membership = window.ExpSystem ? window.ExpSystem.getMembership() : {};
        return membership.achievements || [];
    },

    /** Mark an achievement as unlocked */
    unlockAchievement(id) {
        if (!window.ExpSystem) return;
        const data = window.ExpSystem.getMembership();
        if (!data.achievements) data.achievements = [];
        if (data.achievements.includes(id)) return; // Already unlocked

        data.achievements.push(id);
        window.ExpSystem.saveMembership(data);
    },

    /**
     * Check all achievements and unlock any that are newly earned
     * Call this after any stat-changing action
     */
    checkAndUnlock() {
        const stats = this.getStats();
        // Inject current EXP into stats for rank achievements
        if (window.ExpSystem) {
            stats.exp = window.ExpSystem.getMembership().exp;
        }

        const unlocked = this.getUnlockedIds();
        const newlyUnlocked = [];

        ACHIEVEMENT_LIST.forEach(ach => {
            if (!unlocked.includes(ach.id) && ach.condition(stats)) {
                this.unlockAchievement(ach.id);
                newlyUnlocked.push(ach);

                // Give EXP reward (but not for rank achievements to avoid loop)
                if (ach.reward > 0 && window.ExpSystem && !ach.id.includes('_rank')) {
                    setTimeout(() => {
                        window.ExpSystem.addExp(ach.reward, `Achievement: ${ach.name}`);
                    }, 500);
                }
            }
        });

        // Fire unlock notifications
        newlyUnlocked.forEach((ach, i) => {
            setTimeout(() => this._showAchievementToast(ach), i * 1500);
        });

        return newlyUnlocked;
    },

    /**
     * Get full achievement list with unlock status
     */
    getAll() {
        const unlocked = this.getUnlockedIds();
        return ACHIEVEMENT_LIST.map(ach => ({
            ...ach,
            isUnlocked: unlocked.includes(ach.id)
        }));
    },

    /** Increment a specific stat counter */
    trackEvent(eventType) {
        const stats = this.getStats();
        switch (eventType) {
            case 'login':
                stats.loginCount = (stats.loginCount || 0) + 1;
                // Calculate streak
                const today = new Date().toDateString();
                if (stats.lastLoginDate) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    if (stats.lastLoginDate === yesterday.toDateString()) {
                        stats.loginStreak = (stats.loginStreak || 0) + 1;
                    } else if (stats.lastLoginDate !== today) {
                        stats.loginStreak = 1;
                    }
                } else {
                    stats.loginStreak = 1;
                }
                stats.lastLoginDate = today;
                break;
            case 'join_event':
                stats.joinedEvents = (stats.joinedEvents || 0) + 1;
                break;
            case 'host_event':
                stats.hostedEvents = (stats.hostedEvents || 0) + 1;
                break;
            case 'chat_message':
                stats.chatMessages = (stats.chatMessages || 0) + 1;
                break;
            case 'join_community':
                stats.joinedCommunities = (stats.joinedCommunities || 0) + 1;
                break;
            case 'five_star_review':
                stats.fiveStarReviews = (stats.fiveStarReviews || 0) + 1;
                break;
            case 'successful_booking':
                stats.successfulBookings = (stats.successfulBookings || 0) + 1;
                break;
        }
        this.saveStats(stats);
        this.checkAndUnlock();
    },

    /** Show achievement unlock toast */
    _showAchievementToast(ach) {
        const toastId = 'achievement-toast-' + Date.now();
        const html = `
            <div id="${toastId}" class="achievement-unlock-toast" role="alert" aria-live="assertive">
                <div class="achievement-toast-icon" style="background: ${ach.color}20; color: ${ach.color};">
                    ${ach.icon}
                </div>
                <div class="achievement-toast-body">
                    <div class="achievement-toast-title">🏆 Huy hiệu mới!</div>
                    <div class="achievement-toast-name">${ach.name}</div>
                    <div class="achievement-toast-desc">${ach.description}</div>
                    ${ach.reward > 0 ? `<div class="achievement-toast-reward">+${ach.reward} EXP</div>` : ''}
                </div>
                <button class="achievement-toast-close" onclick="this.closest('.achievement-unlock-toast').remove()">✕</button>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        // Auto remove after 5s
        setTimeout(() => {
            const el = document.getElementById(toastId);
            if (el) {
                el.classList.add('achievement-toast-hiding');
                setTimeout(() => el.remove(), 400);
            }
        }, 5000);
    },

    /** Initialize — unlock first_login and explorer_rank on first visit */
    init() {
        this.trackEvent('login');
        // Short delay to allow ExpSystem to init first
        setTimeout(() => this.checkAndUnlock(), 500);
        console.log('[AchievementSystem] Initialized ✅');
    }
};

// Expose globally
window.AchievementSystem = AchievementSystem;
window.ACHIEVEMENT_LIST = ACHIEVEMENT_LIST;

// Auto init when logged in
document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = !!localStorage.getItem('user');
    if (isLoggedIn) {
        AchievementSystem.init();
    }
});

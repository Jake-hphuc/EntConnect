/**
 * EntConnect — EXP System (exp-system.js)
 * Core engine for the Membership Rank & Gamification system.
 * 
 * SAFE: This file is fully isolated. It only reads/writes to localStorage
 * under the 'ent_membership' key and does NOT modify auth, chat, or events.
 */

// ============================================================
// 1. RANK CONFIGURATION
// ============================================================
const RANK_CONFIG = [
    {
        name: 'Explorer',
        minExp: 0,
        maxExp: 499,
        color: '#6b7280',
        gradient: 'linear-gradient(135deg, #6b7280, #9ca3af)',
        glow: 'rgba(107, 114, 128, 0.4)',
        icon: '🌱',
        emoji: '⬜',
        perks: ['Truy cập cộng đồng cơ bản', 'Tham gia sự kiện miễn phí', 'Chat realtime']
    },
    {
        name: 'Connector',
        minExp: 500,
        maxExp: 1999,
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #059669, #10b981)',
        glow: 'rgba(16, 185, 129, 0.4)',
        icon: '🔗',
        emoji: '🟢',
        perks: ['Ưu tiên hiển thị hồ sơ', 'Badge Connector đặc biệt', 'Truy cập sự kiện sớm']
    },
    {
        name: 'Influencer',
        minExp: 2000,
        maxExp: 4999,
        color: '#8b5cf6',
        gradient: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
        glow: 'rgba(139, 92, 246, 0.5)',
        icon: '⭐',
        emoji: '🟣',
        perks: ['Tạo sự kiện không giới hạn', 'Hiển thị nổi bật trong tìm kiếm', 'Badge Influencer']
    },
    {
        name: 'Elite',
        minExp: 5000,
        maxExp: 9999,
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #d97706, #f59e0b)',
        glow: 'rgba(245, 158, 11, 0.5)',
        icon: '💎',
        emoji: '🟡',
        perks: ['Khung avatar Elite đặc biệt', 'Ưu tiên hỗ trợ', 'Discount thuê bạn 10%']
    },
    {
        name: 'Legend',
        minExp: 10000,
        maxExp: Infinity,
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #dc2626, #ef4444, #f97316)',
        glow: 'rgba(239, 68, 68, 0.6)',
        icon: '👑',
        emoji: '🔴',
        perks: ['Khung avatar Legend cháy', 'Truy cập tất cả tính năng premium', 'Vị trí VIP trên Leaderboard']
    }
];

// ============================================================
// 2. EXP REWARD TABLE
// ============================================================
const EXP_RULES = {
    DAILY_LOGIN:        { amount: 5,   label: 'Đăng nhập hàng ngày' },
    JOIN_EVENT:         { amount: 50,  label: 'Tham gia sự kiện' },
    CREATE_EVENT:       { amount: 100, label: 'Tạo sự kiện' },
    SUCCESSFUL_BOOKING: { amount: 80,  label: 'Đặt lịch thành công' },
    FIVE_STAR_REVIEW:   { amount: 30,  label: 'Đánh giá 5 sao' },
    COMMUNITY_CHAT:     { amount: 2,   label: 'Chat cộng đồng' },
    QR_CHECKIN:         { amount: 20,  label: 'QR Check-in sự kiện' }
};

// ============================================================
// 3. CORE EXP ENGINE
// ============================================================
const ExpSystem = {

    STORAGE_KEY: 'ent_membership',

    // ------- Read / Write -------

    /** Get current membership data for current user */
    getMembership() {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
            try { return JSON.parse(raw); }
            catch(e) {}
        }
        // Default for new user
        return {
            exp: 0,
            level: 1,
            rank: 'Explorer',
            dailyRewardDate: null,
            achievements: [],
            expHistory: []
        };
    },

    /** Save membership data */
    saveMembership(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        // Dispatch custom event so other modules can react
        window.dispatchEvent(new CustomEvent('membership:updated', { detail: data }));
    },

    // ------- Rank Calculation -------

    /** Get rank config object for a given EXP amount */
    getRankByExp(exp) {
        for (let i = RANK_CONFIG.length - 1; i >= 0; i--) {
            if (exp >= RANK_CONFIG[i].minExp) return RANK_CONFIG[i];
        }
        return RANK_CONFIG[0];
    },

    /** Calculate level from EXP (every 200 EXP = 1 level, min level 1) */
    getLevelByExp(exp) {
        return Math.floor(exp / 200) + 1;
    },

    /** Get progress percentage to next rank */
    getProgressToNextRank(exp) {
        const currentRank = this.getRankByExp(exp);
        if (currentRank.maxExp === Infinity) return 100;
        const range = currentRank.maxExp - currentRank.minExp + 1;
        const earned = exp - currentRank.minExp;
        return Math.min(100, Math.round((earned / range) * 100));
    },

    /** Get EXP needed to reach next rank */
    getExpToNextRank(exp) {
        const currentRank = this.getRankByExp(exp);
        if (currentRank.maxExp === Infinity) return 0;
        return currentRank.maxExp + 1 - exp;
    },

    /**
     * Full membership info object
     * Returns: { exp, level, rank (object), nextRank (object|null), progressPct, expToNext }
     */
    getFullMembership() {
        const data = this.getMembership();
        const rank = this.getRankByExp(data.exp);
        const level = this.getLevelByExp(data.exp);
        const rankIndex = RANK_CONFIG.findIndex(r => r.name === rank.name);
        const nextRank = rankIndex < RANK_CONFIG.length - 1 ? RANK_CONFIG[rankIndex + 1] : null;
        return {
            exp: data.exp,
            level,
            rank,
            nextRank,
            progressPct: this.getProgressToNextRank(data.exp),
            expToNext: this.getExpToNextRank(data.exp),
            achievements: data.achievements,
            dailyRewardDate: data.dailyRewardDate,
            expHistory: data.expHistory || []
        };
    },

    // ------- Add EXP -------

    /**
     * Add EXP to current user
     * @param {number} amount - EXP amount to add
     * @param {string} reason - reason label (from EXP_RULES)
     * @returns {{ newExp, newLevel, newRank, leveledUp, rankedUp }}
     */
    addExp(amount, reason = '') {
        const data = this.getMembership();
        const oldLevel = this.getLevelByExp(data.exp);
        const oldRank = this.getRankByExp(data.exp);

        data.exp += amount;
        data.exp = Math.max(0, data.exp);

        const newLevel = this.getLevelByExp(data.exp);
        const newRank = this.getRankByExp(data.exp);

        const leveledUp = newLevel > oldLevel;
        const rankedUp = newRank.name !== oldRank.name;

        // Record history (keep last 50)
        if (!data.expHistory) data.expHistory = [];
        data.expHistory.unshift({
            amount,
            reason,
            total: data.exp,
            timestamp: Date.now()
        });
        data.expHistory = data.expHistory.slice(0, 50);

        data.rank = newRank.name;
        data.level = newLevel;

        this.saveMembership(data);

        // Show floating EXP popup
        this._showExpFloat(amount, reason);

        // Show Level-Up effect
        if (leveledUp) {
            this._fireLevelUp(newLevel);
        }

        // Show Rank-Up effect
        if (rankedUp) {
            this._fireRankUp(newRank);
        }

        return { newExp: data.exp, newLevel, newRank, leveledUp, rankedUp };
    },

    // ------- Daily Reward -------

    /** Check if daily reward is available */
    isDailyRewardAvailable() {
        const data = this.getMembership();
        const today = new Date().toDateString();
        return data.dailyRewardDate !== today;
    },

    /** Claim daily reward */
    claimDailyReward() {
        if (!this.isDailyRewardAvailable()) return false;
        const data = this.getMembership();
        const today = new Date().toDateString();
        data.dailyRewardDate = today;
        this.saveMembership(data);
        this.addExp(EXP_RULES.DAILY_LOGIN.amount, EXP_RULES.DAILY_LOGIN.label);
        return true;
    },

    // ------- Visual Effects -------

    /** Show floating EXP text above an element or body */
    _showExpFloat(amount, reason) {
        const el = document.createElement('div');
        el.className = 'exp-float-popup';
        el.textContent = `+${amount} EXP`;
        el.title = reason;

        // Position near top-right
        el.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 99999;
            pointer-events: none;
        `;
        document.body.appendChild(el);

        // Remove after animation completes
        setTimeout(() => el.remove(), 2000);
    },

    /** Fire level-up effect */
    _fireLevelUp(newLevel) {
        // Dispatch event for membership.js to handle UI
        window.dispatchEvent(new CustomEvent('membership:levelup', {
            detail: { level: newLevel }
        }));
    },

    /** Fire rank-up effect */
    _fireRankUp(newRank) {
        window.dispatchEvent(new CustomEvent('membership:rankup', {
            detail: { rank: newRank }
        }));
    },

    // ------- Initialize -------

    init() {
        // Ensure membership data exists for current user
        this.getMembership();

        // Hook into page load — check daily reward
        const isLoggedIn = !!localStorage.getItem('user');
        if (isLoggedIn) {
            // Small delay to let auth.js finish first
            setTimeout(() => {
                if (window.DailyReward) {
                    window.DailyReward.autoShow();
                }
            }, 1500);
        }

        console.log('[ExpSystem] Initialized ✅');
    }
};

// Expose globally
window.ExpSystem = ExpSystem;
window.RANK_CONFIG = RANK_CONFIG;
window.EXP_RULES = EXP_RULES;

// Auto init
document.addEventListener('DOMContentLoaded', () => ExpSystem.init());

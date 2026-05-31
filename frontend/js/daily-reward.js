/**
 * EntConnect — Daily Reward System (daily-reward.js)
 * Manages daily log-in rewards popup, EXP claim, and streak tracking.
 * 
 * SAFE: Fully isolated. Integrates with ExpSystem and AchievementSystem.
 */

const DailyReward = {
    /**
     * Check if the daily reward is available to claim today
     */
    check() {
        if (!window.ExpSystem) return false;
        return window.ExpSystem.isDailyRewardAvailable();
    },

    /**
     * Claim the daily reward, add EXP, update stats, show celebration
     */
    claim() {
        if (!this.check()) return false;

        // Claim in ExpSystem
        const success = window.ExpSystem.claimDailyReward();
        if (success) {
            // Track in AchievementSystem
            if (window.AchievementSystem) {
                window.AchievementSystem.trackEvent('login');
            }

            // Hide the popup
            this.closePopup();

            // Show success notification/toast (ExpSystem already displays exp-float)
            this.showSuccessModal();
            return true;
        }
        return false;
    },

    /**
     * Automatically show the daily reward popup if user is logged in and hasn't claimed yet
     */
    autoShow() {
        const isLoggedIn = !!localStorage.getItem('user');
        if (!isLoggedIn) return;

        if (this.check()) {
            this.showPopup();
        }
    },

    /**
     * Render and display the Daily Reward Modal
     */
    showPopup() {
        // If already showing, don't show another
        if (document.getElementById('daily-reward-modal')) return;

        const membership = window.ExpSystem ? window.ExpSystem.getFullMembership() : { level: 1, rank: { name: 'Explorer' } };
        const rewardAmount = window.EXP_RULES ? window.EXP_RULES.DAILY_LOGIN.amount : 5;

        // Custom CSS is inside membership.css, but structure is here
        const modalHtml = `
            <div id="daily-reward-modal" class="daily-reward-overlay">
                <div class="daily-reward-modal-card">
                    <div class="daily-reward-header">
                        <div class="daily-reward-gift-icon">🎁</div>
                        <h3>Điểm Danh Hàng Ngày</h3>
                        <p>Nhận EXP miễn phí để nâng cấp Rank thành viên của bạn!</p>
                    </div>
                    <div class="daily-reward-body">
                        <div class="daily-reward-preview">
                            <div class="reward-box">
                                <span class="reward-value">+${rewardAmount}</span>
                                <span class="reward-unit">EXP</span>
                            </div>
                        </div>
                        <div class="user-current-rank-info">
                            <span>Rank hiện tại: <strong>${membership.rank.name}</strong> (Lv.${membership.level})</span>
                        </div>
                    </div>
                    <div class="daily-reward-footer">
                        <button id="btn-claim-daily" class="btn-claim-reward">Nhận Thưởng Ngay</button>
                        <button id="btn-skip-daily" class="btn-skip-reward">Để sau</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Bind events
        document.getElementById('btn-claim-daily').addEventListener('click', () => {
            this.claim();
        });

        document.getElementById('btn-skip-daily').addEventListener('click', () => {
            this.closePopup();
        });
    },

    /**
     * Close the modal
     */
    closePopup() {
        const modal = document.getElementById('daily-reward-modal');
        if (modal) {
            modal.classList.add('fade-out');
            setTimeout(() => modal.remove(), 300);
        }
    },

    /**
     * Show a beautiful success confirmation modal with confetti
     */
    showSuccessModal() {
        const rewardAmount = window.EXP_RULES ? window.EXP_RULES.DAILY_LOGIN.amount : 5;
        const modalHtml = `
            <div id="daily-reward-success-modal" class="daily-reward-overlay">
                <div class="daily-reward-modal-card success-card">
                    <div class="success-confetti">🎉✨🎊</div>
                    <div class="daily-reward-header">
                        <div class="daily-reward-success-icon">✔️</div>
                        <h3>Đã Nhận Thưởng!</h3>
                        <p>Bạn đã nhận thành công <strong>+${rewardAmount} EXP</strong>.</p>
                    </div>
                    <div class="daily-reward-body text-center">
                        <p class="streak-text">Hãy tiếp tục đăng nhập ngày mai để giữ vững chuỗi hoạt động nhé! 🔥</p>
                    </div>
                    <div class="daily-reward-footer">
                        <button id="btn-close-success-daily" class="btn-claim-reward">Tuyệt vời</button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

        document.getElementById('btn-close-success-daily').addEventListener('click', () => {
            const successModal = document.getElementById('daily-reward-success-modal');
            if (successModal) {
                successModal.classList.add('fade-out');
                setTimeout(() => successModal.remove(), 300);
            }
        });
    }
};

// Expose globally
window.DailyReward = DailyReward;

// Check daily reward after page load
document.addEventListener('DOMContentLoaded', () => {
    // Check after a short delay so storage updates and everything is loaded
    setTimeout(() => {
        DailyReward.autoShow();
    }, 2000);
});

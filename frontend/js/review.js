/**
 * EntConnect - Review Manager
 * Quản lý đánh giá sao và nhận xét cho Companion
 * Lưu trữ bằng localStorage
 */

const reviewManager = {
    STORAGE_KEY: 'entconnect_hire_reviews',

    /**
     * Lấy tất cả đánh giá (mock + localStorage)
     */
    getAllReviews() {
        const saved = this._getSavedReviews();
        const mock = window.mockHireReviews || [];
        // Merge: saved first (newest), then mock, deduplicate by _id
        const ids = new Set(saved.map(r => r._id));
        const merged = [...saved];
        mock.forEach(r => { if (!ids.has(r._id)) merged.push(r); });
        return merged;
    },

    /**
     * Lấy đánh giá theo companion ID
     */
    getReviewsForCompanion(companionId) {
        return this.getAllReviews()
            .filter(r => r.companionId === companionId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },

    /**
     * Tính rating trung bình cho companion
     */
    calculateAverageRating(companionId) {
        const reviews = this.getReviewsForCompanion(companionId);
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return Math.round((sum / reviews.length) * 10) / 10;
    },

    /**
     * Gửi đánh giá mới
     */
    submitReview(bookingId, companionId, rating, comment) {
        if (!auth.user) {
            api.toast('Vui lòng đăng nhập để đánh giá!', 'warning');
            return false;
        }

        if (rating < 1 || rating > 5) {
            api.toast('Vui lòng chọn số sao từ 1-5!', 'warning');
            return false;
        }

        if (!comment || comment.trim().length < 5) {
            api.toast('Vui lòng viết nhận xét ít nhất 5 ký tự!', 'warning');
            return false;
        }

        const review = {
            _id: 'rv-' + Date.now(),
            bookingId: bookingId,
            companionId: companionId,
            userId: auth.user.id || auth.user._id || 'u-current',
            userName: auth.user.profile?.fullName || auth.user.username || 'Người dùng',
            userAvatar: auth.user.profile?.avatar || auth.user.avatar || `https://i.pravatar.cc/40?u=${Date.now()}`,
            rating: rating,
            comment: comment.trim(),
            createdAt: new Date().toISOString()
        };

        // Save to localStorage
        const saved = this._getSavedReviews();
        saved.unshift(review);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saved));

        // Mark booking as reviewed
        if (bookingId && window.bookingManager) {
            bookingManager.updateBookingStatus(bookingId, 'completed');
        }

        api.toast('🌟 Cảm ơn bạn đã đánh giá!', 'success');
        return true;
    },

    /**
     * Render danh sách reviews vào container
     */
    renderReviewsList(companionId, container) {
        if (!container) return;
        const reviews = this.getReviewsForCompanion(companionId);

        if (reviews.length === 0) {
            container.innerHTML = '<div class="text-muted small fst-italic text-center py-3">Chưa có đánh giá nào.</div>';
            return;
        }

        container.innerHTML = reviews.slice(0, 5).map(r => `
            <div class="p-3 rounded-4 bg-light bg-opacity-50 border mb-2" style="border-color: var(--border-color) !important;">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="d-flex align-items-center gap-2">
                        <img src="${r.userAvatar}" class="rounded-circle" width="28" height="28" style="object-fit:cover;"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(r.userName)}&background=6366f1&color=fff&size=28'">
                        <span class="fw-bold" style="font-size:0.8rem;">${r.userName}</span>
                    </div>
                    <div class="rating-stars">${this._renderStars(r.rating)}</div>
                </div>
                <p class="mb-1 small text-muted">${r.comment}</p>
                <div class="text-muted" style="font-size:0.7rem;">${this._timeAgo(r.createdAt)}</div>
            </div>
        `).join('');
    },

    /**
     * Mở modal đánh giá
     */
    openReviewModal(bookingId, companionId, companionName) {
        // Remove old modal if exists
        const old = document.getElementById('reviewModal');
        if (old) old.remove();

        const html = `
        <div class="modal fade" id="reviewModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow-premium rounded-4 overflow-hidden" style="background:var(--bg-card);">
                    <div class="modal-header border-0 px-4 pt-4 pb-0">
                        <div>
                            <h5 class="modal-title fw-bold mb-1">Đánh giá ${companionName}</h5>
                            <p class="text-muted small mb-0">Chia sẻ trải nghiệm của bạn</p>
                        </div>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <!-- Star Rating -->
                        <div class="text-center mb-4">
                            <p class="fw-bold mb-2">Bạn đánh giá bao nhiêu sao?</p>
                            <div class="review-star-input" id="review-stars-input">
                                <i class="bi bi-star" data-star="5"></i>
                                <i class="bi bi-star" data-star="4"></i>
                                <i class="bi bi-star" data-star="3"></i>
                                <i class="bi bi-star" data-star="2"></i>
                                <i class="bi bi-star" data-star="1"></i>
                            </div>
                            <div class="mt-2 text-muted small" id="review-star-label">Chưa chọn</div>
                        </div>
                        <!-- Comment -->
                        <div class="mb-4">
                            <label class="form-label small fw-bold">NHẬN XÉT CỦA BẠN</label>
                            <textarea id="review-comment" class="form-control rounded-3" rows="3" 
                                      placeholder="Chia sẻ trải nghiệm của bạn..."
                                      style="background:var(--bg-panel);border-color:var(--border-color);color:var(--text-main);resize:none;"></textarea>
                        </div>
                        <button class="btn btn-primary w-100 py-3 rounded-3 fw-bold" id="btn-submit-review"
                                data-booking-id="${bookingId}" data-companion-id="${companionId}">
                            <i class="bi bi-send me-2"></i>Gửi đánh giá
                        </button>
                    </div>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', html);

        // Bind star interactions
        let selectedRating = 0;
        const starLabels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời!'];
        document.querySelectorAll('#review-stars-input i').forEach(star => {
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.star);
                document.querySelectorAll('#review-stars-input i').forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.star) <= selectedRating);
                    s.className = parseInt(s.dataset.star) <= selectedRating ? 'bi bi-star-fill active' : 'bi bi-star';
                });
                document.getElementById('review-star-label').textContent = starLabels[selectedRating];
            });
        });

        // Bind submit
        document.getElementById('btn-submit-review').addEventListener('click', () => {
            const comment = document.getElementById('review-comment').value;
            const success = this.submitReview(bookingId, companionId, selectedRating, comment);
            if (success) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('reviewModal'));
                if (modal) modal.hide();
            }
        });

        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('reviewModal'));
        modal.show();
    },

    // ---- Private Helpers ----
    _getSavedReviews() {
        try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || []; }
        catch { return []; }
    },

    _renderStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<i class="bi bi-star${i <= Math.floor(rating) ? '-fill' : (i - 0.5 <= rating ? '-half' : '')}"></i>`;
        }
        return html;
    },

    _timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins} phút trước`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} giờ trước`;
        const days = Math.floor(hours / 24);
        if (days < 30) return `${days} ngày trước`;
        return new Date(dateStr).toLocaleDateString('vi-VN');
    }
};

window.reviewManager = reviewManager;

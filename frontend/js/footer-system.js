/**
 * EntConnect - Footer Enhanced System
 * Handles interactions and logic for the footer section.
 */
window.footerSystem = (function() {
    // Local state
    let newsletterSubscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
    let errorReports = JSON.parse(localStorage.getItem('errorReports') || '[]');

    let modalsContainer = null;

    function init() {
        injectModals();
        attachEventListeners();
        addFloatingButtons();
    }

    function injectModals() {
        modalsContainer = document.createElement('div');
        modalsContainer.id = 'footer-modals-container';
        
        // Modal HTML Strings
        modalsContainer.innerHTML = `
            <!-- Địa điểm Modal -->
            <div class="modal fade" id="footerPlacesModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content modal-glass text-white border-0 shadow-lg" style="border-radius: 20px;">
                        <div class="modal-header border-bottom border-secondary">
                            <h5 class="modal-title fw-bold"><i class="bi bi-geo-alt-fill text-danger me-2"></i>Địa điểm nổi bật</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="row g-3 places-grid">
                                <div class="col-md-6">
                                    <div class="place-card">
                                        <h6 class="fw-bold text-primary mb-1"><i class="bi bi-controller me-2"></i>Quán Cafe Gaming</h6>
                                        <p class="small text-muted mb-0">Hơn 50+ địa điểm có sẵn PC cấu hình cao, không gian riêng tư.</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="place-card">
                                        <h6 class="fw-bold text-success mb-1"><i class="bi bi-dribbble me-2"></i>Sân thể thao</h6>
                                        <p class="small text-muted mb-0">Sân bóng đá mini, sân cầu lông, bóng rổ đạt chuẩn.</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="place-card">
                                        <h6 class="fw-bold text-warning mb-1"><i class="bi bi-music-note-beamed me-2"></i>Địa điểm Acoustic</h6>
                                        <p class="small text-muted mb-0">Các quán cafe acoustic chill cuối tuần với không gian cực thơ.</p>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="place-card">
                                        <h6 class="fw-bold text-info mb-1"><i class="bi bi-puzzle me-2"></i>Khu vui chơi / Boardgame</h6>
                                        <p class="small text-muted mb-0">Các địa điểm có sẵn hàng trăm loại boardgame thú vị.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Trợ giúp Modal (FAQ) -->
            <div class="modal fade" id="footerHelpModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content modal-glass text-white border-0 shadow-lg" style="border-radius: 20px;">
                        <div class="modal-header border-bottom border-secondary">
                            <h5 class="modal-title fw-bold"><i class="bi bi-question-circle-fill text-info me-2"></i>Trợ giúp & Câu hỏi thường gặp</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="accordion accordion-custom" id="faqAccordion">
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                                            Làm thế nào để tham gia sự kiện?
                                        </button>
                                    </h2>
                                    <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                                        <div class="accordion-body small">
                                            Bạn chỉ cần đăng nhập, chọn sự kiện mình yêu thích tại trang chủ hoặc trang Khám phá, sau đó bấm nút "Tham gia ngay". Nếu sự kiện có phí, bạn cần thanh toán qua cổng VNPay tích hợp.
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                                            Cách thuê bạn đồng hành?
                                        </button>
                                    </h2>
                                    <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                        <div class="accordion-body small">
                                            Truy cập vào trang "Thuê bạn", chọn người bạn đồng hành phù hợp với yêu cầu của bạn, chọn thời gian, dịch vụ muốn thuê và tiến hành đặt lịch & thanh toán.
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                                            Cách tạo cộng đồng riêng?
                                        </button>
                                    </h2>
                                    <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                        <div class="accordion-body small">
                                            Tại trang "Cộng đồng", bấm vào nút "Tạo cộng đồng", điền thông tin (tên, mô tả, ảnh bìa, quy định) và xác nhận. Bạn sẽ trở thành Quản trị viên của nhóm đó.
                                        </div>
                                    </div>
                                </div>
                                <div class="accordion-item">
                                    <h2 class="accordion-header">
                                        <button class="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                                            Chat realtime hoạt động ra sao?
                                        </button>
                                    </h2>
                                    <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                                        <div class="accordion-body small">
                                            Ngay khi bạn tham gia một nhóm cộng đồng, bạn có thể truy cập vào Chat Room để trò chuyện trực tiếp với các thành viên khác trong thời gian thực.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Báo lỗi Modal -->
            <div class="modal fade" id="footerReportModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content modal-glass text-white border-0 shadow-lg" style="border-radius: 20px;">
                        <div class="modal-header border-bottom border-secondary">
                            <h5 class="modal-title fw-bold"><i class="bi bi-bug-fill text-danger me-2"></i>Báo cáo sự cố</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="footer-report-form">
                                <div class="mb-3">
                                    <label class="form-label small text-muted">Tiêu đề lỗi <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control bg-dark border-secondary text-white" id="report-title" required placeholder="Ví dụ: Lỗi thanh toán VNPay">
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small text-muted">Mức độ <span class="text-danger">*</span></label>
                                    <select class="form-select bg-dark border-secondary text-white" id="report-severity">
                                        <option value="low">Thấp (Sai chính tả, UI hiển thị lệch)</option>
                                        <option value="medium">Trung bình (Chức năng hoạt động chậm)</option>
                                        <option value="high">Cao (Không thể thanh toán, crash app)</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label small text-muted">Mô tả chi tiết <span class="text-danger">*</span></label>
                                    <textarea class="form-control bg-dark border-secondary text-white" id="report-desc" rows="3" required placeholder="Mô tả các bước dẫn đến lỗi..."></textarea>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label small text-muted">Upload ảnh chụp màn hình (Optional)</label>
                                    <input type="file" class="form-control bg-dark border-secondary text-white" id="report-image" accept="image/*">
                                </div>
                                <button type="submit" class="btn btn-danger w-100 rounded-pill py-2 fw-bold">Gửi Báo Cáo</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quy tắc Modal -->
            <div class="modal fade" id="footerRulesModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered modal-lg">
                    <div class="modal-content modal-glass text-white border-0 shadow-lg" style="border-radius: 20px;">
                        <div class="modal-header border-bottom border-secondary">
                            <h5 class="modal-title fw-bold"><i class="bi bi-shield-check text-success me-2"></i>Quy tắc cộng đồng EntConnect</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div class="rule-card">
                                <h6 class="fw-bold mb-1"><i class="bi bi-1-circle me-2"></i>Tôn trọng lẫn nhau</h6>
                                <p class="small text-muted mb-0">Nghiêm cấm mọi hành vi quấy rối, chửi bới, phân biệt đối xử hay dùng từ ngữ thô tục trong chat, bình luận và đánh giá.</p>
                            </div>
                            <div class="rule-card">
                                <h6 class="fw-bold mb-1"><i class="bi bi-2-circle me-2"></i>Không Spam / Lừa đảo</h6>
                                <p class="small text-muted mb-0">Cấm quảng cáo không liên quan, gửi link độc hại, dụ dỗ đầu tư hoặc lừa đảo chiếm đoạt tài sản qua nền tảng.</p>
                            </div>
                            <div class="rule-card" style="border-left-color: #ef4444;">
                                <h6 class="fw-bold mb-1 text-danger"><i class="bi bi-3-circle me-2"></i>Nội dung lành mạnh</h6>
                                <p class="small text-muted mb-0">Nghiêm cấm đăng tải, chia sẻ văn hóa phẩm đồi trụy, nội dung người lớn, bạo lực hay vi phạm pháp luật Việt Nam.</p>
                            </div>
                            <div class="rule-card" style="border-left-color: #f59e0b;">
                                <h6 class="fw-bold mb-1 text-warning"><i class="bi bi-4-circle me-2"></i>Quy định thuê bạn & Gặp mặt</h6>
                                <p class="small text-muted mb-0">Chỉ gặp mặt tại nơi công cộng, tuân thủ đúng cam kết về thời gian và dịch vụ. Báo cáo ngay cho admin nếu có dấu hiệu bất thường.</p>
                            </div>
                        </div>
                        <div class="modal-footer border-0 justify-content-center">
                            <button type="button" class="btn btn-outline-light rounded-pill px-4" data-bs-dismiss="modal">Đã hiểu</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalsContainer);
    }

    function addFloatingButtons() {
        // Back To Top
        const backToTopBtn = document.createElement('div');
        backToTopBtn.className = 'back-to-top-btn';
        backToTopBtn.id = 'footer-back-to-top';
        backToTopBtn.innerHTML = '<i class="bi bi-chevron-up"></i>';
        
        // Mini Chat
        const miniChatBtn = document.createElement('div');
        miniChatBtn.className = 'mini-chat-btn';
        miniChatBtn.id = 'footer-mini-chat';
        miniChatBtn.innerHTML = '<i class="bi bi-chat-dots-fill"></i>';

        document.body.appendChild(backToTopBtn);
        document.body.appendChild(miniChatBtn);

        // Events
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTopBtn.classList.add('visible');
                miniChatBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
                miniChatBtn.classList.remove('visible');
            }
        });

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        miniChatBtn.addEventListener('click', () => {
            if (window.api && window.api.toast) {
                window.api.toast('Hệ thống AI Chatbot đang được bảo trì. Vui lòng thử lại sau!', 'info');
            } else {
                alert('Hệ thống AI Chatbot đang được bảo trì.');
            }
        });
    }

    function attachEventListeners() {
        // 1. KHU VỰC KHÁM PHÁ
        const linkEvents = document.getElementById('footer-link-events');
        if (linkEvents) {
            linkEvents.addEventListener('click', (e) => {
                e.preventDefault();
                // Check if we are on discover page
                if (window.location.pathname.includes('/discover')) {
                    // Just scroll to top or event section
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else {
                    window.location.href = '/discover';
                }
            });
        }

        const linkCommunity = document.getElementById('footer-link-community');
        if (linkCommunity) {
            linkCommunity.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = '/community';
            });
        }

        const linkPlaces = document.getElementById('footer-link-places');
        if (linkPlaces) {
            linkPlaces.addEventListener('click', (e) => {
                e.preventDefault();
                const m = new bootstrap.Modal(document.getElementById('footerPlacesModal'));
                m.show();
            });
        }

        // 2. KHU VỰC HỖ TRỢ
        const linkHelp = document.getElementById('footer-link-help');
        if (linkHelp) {
            linkHelp.addEventListener('click', (e) => {
                e.preventDefault();
                const m = new bootstrap.Modal(document.getElementById('footerHelpModal'));
                m.show();
            });
        }

        const linkReport = document.getElementById('footer-link-report');
        if (linkReport) {
            linkReport.addEventListener('click', (e) => {
                e.preventDefault();
                const m = new bootstrap.Modal(document.getElementById('footerReportModal'));
                m.show();
            });
        }

        const linkRules = document.getElementById('footer-link-rules');
        if (linkRules) {
            linkRules.addEventListener('click', (e) => {
                e.preventDefault();
                const m = new bootstrap.Modal(document.getElementById('footerRulesModal'));
                m.show();
            });
        }

        // Report Form Logic
        const reportForm = document.getElementById('footer-report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const title = document.getElementById('report-title').value;
                const severity = document.getElementById('report-severity').value;
                const desc = document.getElementById('report-desc').value;

                errorReports.push({
                    id: 'RPT' + Date.now(),
                    title, severity, desc, date: new Date().toISOString()
                });
                localStorage.setItem('errorReports', JSON.stringify(errorReports));

                if (window.api && window.api.toast) {
                    window.api.toast('Cảm ơn bạn đã báo lỗi. Chúng tôi sẽ xử lý sớm nhất!', 'success');
                } else {
                    alert('Đã ghi nhận báo cáo lỗi!');
                }

                reportForm.reset();
                bootstrap.Modal.getInstance(document.getElementById('footerReportModal')).hide();
            });
        }

        // 3. NHẬN BẢN TIN
        const newsEmail = document.getElementById('footer-newsletter-email');
        const newsSubmit = document.getElementById('footer-newsletter-submit');
        const newsError = document.getElementById('footer-newsletter-error');

        if (newsEmail && newsSubmit) {
            // Realtime Validate
            newsEmail.addEventListener('input', () => {
                if (!newsEmail.value) {
                    newsEmail.classList.remove('is-valid', 'is-invalid');
                    newsError.style.display = 'none';
                    return;
                }
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newsEmail.value);
                if (isValid) {
                    newsEmail.classList.remove('is-invalid');
                    newsEmail.classList.add('is-valid');
                    newsError.style.display = 'none';
                } else {
                    newsEmail.classList.remove('is-valid');
                    newsEmail.classList.add('is-invalid');
                    newsError.textContent = 'Email không hợp lệ.';
                    newsError.style.display = 'block';
                }
            });

            newsSubmit.addEventListener('click', (e) => {
                e.preventDefault();
                const email = newsEmail.value.trim();
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                
                if (!email) {
                    newsEmail.classList.add('is-invalid');
                    newsError.textContent = 'Vui lòng nhập email.';
                    newsError.style.display = 'block';
                    return;
                }

                if (!isValid) return;

                if (newsletterSubscribers.includes(email)) {
                    newsEmail.classList.add('is-invalid');
                    newsError.textContent = 'Email này đã đăng ký rồi!';
                    newsError.style.display = 'block';
                    return;
                }

                // Simulate Loading
                newsSubmit.classList.add('btn-loading');
                
                setTimeout(() => {
                    newsSubmit.classList.remove('btn-loading');
                    newsletterSubscribers.push(email);
                    localStorage.setItem('newsletterSubscribers', JSON.stringify(newsletterSubscribers));
                    
                    if (window.api && window.api.toast) {
                        window.api.toast('Đăng ký nhận bản tin thành công! 🎉', 'success');
                    } else {
                        alert('Đăng ký nhận bản tin thành công!');
                    }

                    newsEmail.value = '';
                    newsEmail.classList.remove('is-valid', 'is-invalid');
                    newsError.style.display = 'none';
                }, 1500);
            });
        }
    }

    // Public API
    return {
        init
    };
})();

// Auto Init when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only init if it's not already initialized by some other script explicitly, 
    // but here we just safely initialize it.
    if(window.footerSystem) {
        window.footerSystem.init();
    }
});

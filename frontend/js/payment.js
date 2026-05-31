/**
 * EntConnect - Payment System Module
 * Handles QR & Card payment flows with mock processing for demo
 * Integrates with localStorage for transaction history & state
 */

const payment = {
    // localStorage keys
    KEYS: {
        TRANSACTIONS: 'entconnect_transactions',
        JOINED_EVENTS: 'entconnect_joined_events',
        JOINED_COMMUNITIES: 'entconnect_joined_communities'
    },

    // Mock bank info for QR payment
    BANK_INFO: {
        bankName: 'Vietcombank',
        accountNumber: '1234 5678 9012',
        accountHolder: 'ENTCONNECT JSC',
        branch: 'Chi nhánh TP.HCM'
    },

    /**
     * Initialize payment system - inject modal into DOM
     */
    init() {
        this.injectPaymentModal();
        this.bindGlobalEvents();
    },

    /**
     * Open payment flow for a specific event or community
     */
    openCheckout(item) {
        if (!auth.user) {
            api.toast('Vui lòng đăng nhập để thanh toán!', 'warning');
            auth.showModal('loginModal');
            return;
        }

        // Check if already joined
        if (this.isJoined(item._id, item.isCommunity)) {
            api.toast(`Bạn đã tham gia ${item.isCommunity ? 'cộng đồng' : 'sự kiện'} này rồi!`, 'info');
            return;
        }

        // Free items - join directly
        if (item.pricing?.isFree || !item.pricing?.price || item.pricing.price === 0) {
            this.processJoinFree(item);
            return;
        }

        // Paid items - show payment modal
        this.renderCheckoutModal(item);
        auth.showModal('paymentModal');
    },

    /**
     * Process free join
     */
    processJoinFree(item) {
        const transaction = {
            id: 'TXN-' + Date.now(),
            eventId: item._id, // Used generically for both event and community ID
            eventTitle: item.title,
            eventCategory: item.category,
            eventImage: item.coverImage,
            amount: 0,
            method: 'free',
            status: 'completed',
            date: new Date().toISOString(),
            userName: auth.user?.username || 'User',
            isCommunity: item.isCommunity || false
        };

        this.saveTransaction(transaction);
        this.markJoined(item._id, item.isCommunity);
        api.toast('🎉 Tham gia thành công! Chúc bạn vui vẻ!', 'success');
    },

    /**
     * Render full checkout modal content
     */
    renderCheckoutModal(event) {
        const modal = document.getElementById('paymentModal');
        if (!modal) return;

        const price = event.pricing?.price || 0;
        const originalPrice = event.pricing?.originalPrice || null;
        const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
        const formattedPrice = ui.formatPrice(price);
        const formattedOriginal = originalPrice ? ui.formatPrice(originalPrice) : '';
        const eventDate = event.isCommunity ? 'Tham gia trọn đời' : ui.formatDate(event.schedule?.startDate, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
        const location = event.isCommunity ? 'Cộng đồng Trực tuyến' : (event.location?.venue?.name || event.location?.platform || 'Online');

        // Generate transfer note for QR
        const transferNote = `EC${event._id.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8).toUpperCase()}`;

        const body = modal.querySelector('.modal-body');
        body.innerHTML = `
            <!-- Checkout Step Container -->
            <div id="checkout-step-1">
                <!-- Event Summary -->
                <div class="checkout-event-summary mb-4">
                    <div class="d-flex gap-3 align-items-start">
                        <img src="${event.isCommunity ? event.coverImage : ui.resolveImageUrl(event.coverImage, 'activity', event.category)}" 
                             onerror="ui.handleImageError(this, 'activity', '${event.category}')"
                             class="rounded-3 flex-shrink-0" width="80" height="80" style="object-fit: cover;">
                        <div class="flex-grow-1">
                            <h6 class="fw-bold mb-1">${event.title}</h6>
                            <div class="small text-muted mb-1"><i class="bi bi-calendar-event me-1"></i>${eventDate}</div>
                            <div class="small text-muted"><i class="bi bi-geo-alt me-1"></i>${location}</div>
                        </div>
                    </div>
                </div>

                <!-- Price Breakdown -->
                <div class="checkout-price-box p-3 rounded-4 mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-muted">${event.isCommunity ? 'Phí tham gia' : 'Vé tham gia'}</span>
                        <span class="fw-bold">${formattedPrice}</span>
                    </div>
                    ${discount > 0 ? `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-muted">Giá gốc</span>
                        <span class="text-decoration-line-through text-muted">${formattedOriginal}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-success fw-bold"><i class="bi bi-tag-fill me-1"></i>Tiết kiệm ${discount}%</span>
                        <span class="text-success fw-bold">-${ui.formatPrice(originalPrice - price)}</span>
                    </div>` : ''}
                    <hr class="my-2 opacity-25">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold fs-6">Tổng thanh toán</span>
                        <span class="fw-bold fs-5 text-primary">${formattedPrice}</span>
                    </div>
                </div>

                <!-- User Info -->
                <div class="checkout-user-info p-3 rounded-4 mb-4 d-flex align-items-center gap-3">
                    <i class="bi bi-person-circle fs-3 text-primary"></i>
                    <div>
                        <div class="fw-bold small">${auth.user?.profile?.fullName || auth.user?.username || 'Người dùng'}</div>
                        <div class="text-muted x-small">${auth.user?.email || ''}</div>
                    </div>
                    <span class="badge bg-success bg-opacity-10 text-success ms-auto rounded-pill px-3 py-2"><i class="bi bi-patch-check-fill me-1"></i>Xác thực</span>
                </div>

                <!-- Payment Method Selection -->
                <h6 class="fw-bold mb-3"><i class="bi bi-credit-card me-2 text-primary"></i>Chọn phương thức thanh toán</h6>
                <div class="d-flex flex-column gap-2 mb-4">
                    <label class="payment-method-option active" data-method="qr">
                        <input type="radio" name="paymentMethod" value="qr" checked class="d-none">
                        <div class="d-flex align-items-center gap-3 p-3 rounded-4">
                            <div class="payment-method-icon qr-icon">
                                <i class="bi bi-qr-code-scan fs-4"></i>
                            </div>
                            <div class="flex-grow-1">
                                <div class="fw-bold">Thanh toán QR</div>
                                <div class="small text-muted">Quét mã QR bằng ứng dụng ngân hàng</div>
                            </div>
                            <div class="payment-method-check">
                                <i class="bi bi-check-circle-fill text-primary fs-5"></i>
                            </div>
                        </div>
                    </label>
                    
                    <label class="payment-method-option" data-method="card">
                        <input type="radio" name="paymentMethod" value="card" class="d-none">
                        <div class="d-flex align-items-center gap-3 p-3 rounded-4">
                            <div class="payment-method-icon card-icon">
                                <i class="bi bi-credit-card-2-front fs-4"></i>
                            </div>
                            <div class="flex-grow-1">
                                <div class="fw-bold">Thẻ ATM / Visa / MasterCard</div>
                                <div class="small text-muted">Thanh toán bằng thẻ ngân hàng nội địa hoặc quốc tế</div>
                            </div>
                            <div class="payment-method-check">
                                <i class="bi bi-circle text-muted fs-5"></i>
                            </div>
                        </div>
                    </label>
                </div>

                <button class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm btn-checkout-proceed" 
                        data-event-id="${event._id}" data-price="${price}" data-transfer-note="${transferNote}">
                    <i class="bi bi-lock-fill me-2"></i>Tiến hành thanh toán - ${formattedPrice}
                </button>
                <p class="text-center small text-muted mt-3 mb-0">
                    <i class="bi bi-shield-lock text-success me-1"></i>
                    Thanh toán được bảo mật bởi EntConnect Security
                </p>
            </div>

            <!-- QR Payment Step -->
            <div id="checkout-step-qr" class="d-none">
                <div class="text-center mb-4">
                    <span class="badge bg-warning bg-opacity-10 text-warning px-3 py-2 rounded-pill fw-bold mb-3">
                        <i class="bi bi-clock-history me-1"></i>Chờ thanh toán
                    </span>
                    <h5 class="fw-bold">Quét mã QR để thanh toán</h5>
                    <p class="text-muted small">Sử dụng ứng dụng ngân hàng để quét mã bên dưới</p>
                </div>

                <div class="qr-payment-box text-center p-4 rounded-4 mb-4">
                    <div class="qr-code-wrapper mb-3">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`EntConnect|${transferNote}|${price}|${this.BANK_INFO.accountNumber}`)}" 
                             alt="QR Payment Code" class="rounded-3" width="240" height="240"
                             id="qr-code-img">
                        <div class="qr-scan-line"></div>
                    </div>
                    
                    <div class="bank-info-box p-3 rounded-3 text-start mb-3">
                        <div class="row g-2 small">
                            <div class="col-5 text-muted fw-bold">Ngân hàng:</div>
                            <div class="col-7 fw-bold">${this.BANK_INFO.bankName}</div>
                            <div class="col-5 text-muted fw-bold">Số tài khoản:</div>
                            <div class="col-7 fw-bold font-monospace">${this.BANK_INFO.accountNumber}</div>
                            <div class="col-5 text-muted fw-bold">Chủ tài khoản:</div>
                            <div class="col-7 fw-bold">${this.BANK_INFO.accountHolder}</div>
                            <div class="col-5 text-muted fw-bold">Số tiền:</div>
                            <div class="col-7 fw-bold text-primary fs-6">${formattedPrice}</div>
                            <div class="col-5 text-muted fw-bold">Nội dung CK:</div>
                            <div class="col-7">
                                <code class="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded fw-bold">${transferNote}</code>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-primary flex-grow-1 py-3 rounded-3 fw-bold btn-confirm-qr-paid"
                            data-event-id="${event._id}" data-price="${price}">
                        <i class="bi bi-check2-circle me-2"></i>Tôi đã thanh toán
                    </button>
                    <button class="btn btn-outline-secondary py-3 rounded-3 fw-bold btn-check-payment-status px-4"
                            data-event-id="${event._id}">
                        <i class="bi bi-arrow-repeat"></i>
                    </button>
                </div>
                <button class="btn btn-link text-muted w-100 mt-2 small btn-back-to-methods">
                    <i class="bi bi-arrow-left me-1"></i>Quay lại chọn phương thức
                </button>
            </div>

            <!-- Card Payment Step -->
            <div id="checkout-step-card" class="d-none">
                <div class="text-center mb-4">
                    <span class="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-bold mb-3">
                        <i class="bi bi-credit-card-2-front me-1"></i>Thanh toán thẻ
                    </span>
                    <h5 class="fw-bold">Nhập thông tin thẻ</h5>
                    <p class="text-muted small">Thông tin thẻ được bảo mật hoàn toàn</p>
                </div>

                <form id="card-payment-form" class="needs-validation" novalidate>
                    <div class="card-visual-preview mb-4 p-4 rounded-4 text-white position-relative overflow-hidden">
                        <div class="card-chip mb-3">
                            <svg width="40" height="30" viewBox="0 0 40 30"><rect width="40" height="30" rx="5" fill="rgba(255,255,255,0.3)"/><rect x="5" y="5" width="12" height="20" rx="3" fill="rgba(255,255,255,0.5)"/></svg>
                        </div>
                        <div class="card-number-display font-monospace fs-5 mb-3 letter-spacing-2" id="card-number-display">•••• •••• •••• ••••</div>
                        <div class="d-flex justify-content-between align-items-end">
                            <div>
                                <div class="x-small text-white-50 text-uppercase">Chủ thẻ</div>
                                <div class="small fw-bold" id="card-name-display">YOUR NAME</div>
                            </div>
                            <div class="text-end">
                                <div class="x-small text-white-50 text-uppercase">Hết hạn</div>
                                <div class="small fw-bold" id="card-expiry-display">MM/YY</div>
                            </div>
                        </div>
                        <div class="card-brand-logo position-absolute" style="top: 15px; right: 20px;">
                            <i class="bi bi-credit-card-2-front fs-2 text-white-50"></i>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-bold">SỐ THẺ</label>
                        <div class="input-group">
                            <span class="input-group-text bg-light border-end-0 rounded-start-3"><i class="bi bi-credit-card text-primary"></i></span>
                            <input type="text" id="card-number" class="form-control bg-light border-start-0 rounded-end-3 py-3" 
                                   placeholder="1234 5678 9012 3456" maxlength="19" required
                                   autocomplete="cc-number">
                        </div>
                        <div class="invalid-feedback">Vui lòng nhập số thẻ hợp lệ (16 chữ số)</div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label small fw-bold">TÊN CHỦ THẺ</label>
                        <input type="text" id="card-name" class="form-control bg-light rounded-3 py-3" 
                               placeholder="NGUYEN VAN A" required autocomplete="cc-name">
                        <div class="invalid-feedback">Vui lòng nhập tên chủ thẻ</div>
                    </div>

                    <div class="row g-3 mb-4">
                        <div class="col-6">
                            <label class="form-label small fw-bold">NGÀY HẾT HẠN</label>
                            <input type="text" id="card-expiry" class="form-control bg-light rounded-3 py-3" 
                                   placeholder="MM/YY" maxlength="5" required autocomplete="cc-exp">
                            <div class="invalid-feedback">Nhập dạng MM/YY</div>
                        </div>
                        <div class="col-6">
                            <label class="form-label small fw-bold">CVV</label>
                            <div class="input-group">
                                <input type="password" id="card-cvv" class="form-control bg-light rounded-start-3 py-3" 
                                       placeholder="•••" maxlength="4" required autocomplete="cc-csc">
                                <span class="input-group-text bg-light border-start-0 rounded-end-3 cursor-help" 
                                      title="Mã 3-4 số ở mặt sau thẻ">
                                    <i class="bi bi-question-circle text-muted"></i>
                                </span>
                            </div>
                            <div class="invalid-feedback">Nhập CVV (3-4 số)</div>
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm"
                            data-event-id="${event._id}" data-price="${price}">
                        <i class="bi bi-lock-fill me-2"></i>Thanh toán ${formattedPrice}
                    </button>
                </form>
                
                <button class="btn btn-link text-muted w-100 mt-2 small btn-back-to-methods">
                    <i class="bi bi-arrow-left me-1"></i>Quay lại chọn phương thức
                </button>

                <div class="d-flex justify-content-center gap-3 mt-3 opacity-50">
                    <i class="bi bi-shield-lock fs-5"></i>
                    <span class="small text-muted">Mô phỏng thanh toán - Không thu phí thật</span>
                </div>
            </div>

            <!-- Payment Processing Step -->
            <div id="checkout-step-processing" class="d-none text-center py-5">
                <div class="payment-processing-animation mb-4">
                    <div class="processing-spinner">
                        <div class="spinner-ring"></div>
                        <i class="bi bi-credit-card-2-front processing-icon"></i>
                    </div>
                </div>
                <h5 class="fw-bold mb-2">Đang xử lý thanh toán...</h5>
                <p class="text-muted">Vui lòng không đóng trang này</p>
                <div class="progress mx-auto" style="width: 200px; height: 4px;">
                    <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated" style="width: 0%" id="payment-progress"></div>
                </div>
            </div>

            <!-- Payment Success Step -->
            <div id="checkout-step-success" class="d-none text-center py-4">
                <div class="success-animation mb-4">
                    <div class="success-checkmark">
                        <i class="bi bi-check-lg"></i>
                    </div>
                </div>
                <h4 class="fw-bold text-success mb-2">Thanh toán thành công! 🎉</h4>
                <p class="text-muted mb-4">Bạn đã đăng ký tham gia ${event.isCommunity ? 'cộng đồng' : 'sự kiện'} thành công</p>
                
                <div class="success-receipt p-4 rounded-4 text-start mb-4">
                    <h6 class="fw-bold mb-3 text-center"><i class="bi bi-receipt me-2"></i>Biên nhận thanh toán</h6>
                    <div class="row g-2 small" id="receipt-details">
                        <!-- Filled by JS -->
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <a href="dashboard.html" class="btn btn-primary flex-grow-1 py-3 rounded-3 fw-bold">
                        <i class="bi bi-grid-1x2 me-2"></i>Xem sự kiện của tôi
                    </a>
                    <button class="btn btn-outline-primary py-3 rounded-3 fw-bold px-4" data-bs-dismiss="modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>
        `;

        // Bind checkout-specific events after rendering
        this.bindCheckoutEvents(event);
    },

    /**
     * Bind events within the checkout modal
     */
    bindCheckoutEvents(event) {
        const modal = document.getElementById('paymentModal');
        if (!modal) return;

        // Payment method selection
        modal.querySelectorAll('.payment-method-option').forEach(opt => {
            opt.addEventListener('click', () => {
                modal.querySelectorAll('.payment-method-option').forEach(o => {
                    o.classList.remove('active');
                    o.querySelector('.payment-method-check i').className = 'bi bi-circle text-muted fs-5';
                    o.querySelector('input').checked = false;
                });
                opt.classList.add('active');
                opt.querySelector('.payment-method-check i').className = 'bi bi-check-circle-fill text-primary fs-5';
                opt.querySelector('input').checked = true;
            });
        });

        // Proceed button
        const btnProceed = modal.querySelector('.btn-checkout-proceed');
        if (btnProceed) {
            btnProceed.addEventListener('click', () => {
                const method = modal.querySelector('input[name="paymentMethod"]:checked')?.value;
                document.getElementById('checkout-step-1').classList.add('d-none');
                
                if (method === 'qr') {
                    document.getElementById('checkout-step-qr').classList.remove('d-none');
                } else {
                    document.getElementById('checkout-step-card').classList.remove('d-none');
                    this.initCardForm();
                }
            });
        }

        // Back to methods
        modal.querySelectorAll('.btn-back-to-methods').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('[id^="checkout-step-"]').forEach(s => s.classList.add('d-none'));
                document.getElementById('checkout-step-1').classList.remove('d-none');
            });
        });

        // QR confirm payment
        const btnConfirmQR = modal.querySelector('.btn-confirm-qr-paid');
        if (btnConfirmQR) {
            btnConfirmQR.addEventListener('click', () => {
                const price = parseFloat(btnConfirmQR.dataset.price);
                this.processPayment(event, price, 'qr');
            });
        }

        // QR check status
        const btnCheckStatus = modal.querySelector('.btn-check-payment-status');
        if (btnCheckStatus) {
            btnCheckStatus.addEventListener('click', () => {
                btnCheckStatus.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
                setTimeout(() => {
                    btnCheckStatus.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
                    api.toast('Đang kiểm tra... Hệ thống chưa nhận được giao dịch.', 'info');
                }, 1500);
            });
        }

        // Card form submission
        const cardForm = modal.querySelector('#card-payment-form');
        if (cardForm) {
            cardForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.validateCardForm()) {
                    const price = parseFloat(cardForm.querySelector('[data-price]').dataset.price);
                    this.processPayment(event, price, 'card');
                }
            });
        }
    },

    /**
     * Initialize card form with real-time preview
     */
    initCardForm() {
        const cardNumber = document.getElementById('card-number');
        const cardName = document.getElementById('card-name');
        const cardExpiry = document.getElementById('card-expiry');

        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                // Format card number with spaces
                let val = e.target.value.replace(/\D/g, '').substring(0, 16);
                val = val.replace(/(.{4})/g, '$1 ').trim();
                e.target.value = val;
                
                // Update preview
                const display = document.getElementById('card-number-display');
                if (display) {
                    display.textContent = val || '•••• •••• •••• ••••';
                }

                // Detect card brand
                this.detectCardBrand(val.replace(/\s/g, ''));
            });
        }

        if (cardName) {
            cardName.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
                const display = document.getElementById('card-name-display');
                if (display) display.textContent = e.target.value || 'YOUR NAME';
            });
        }

        if (cardExpiry) {
            cardExpiry.addEventListener('input', (e) => {
                let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
                e.target.value = val;
                
                const display = document.getElementById('card-expiry-display');
                if (display) display.textContent = val || 'MM/YY';
            });
        }
    },

    /**
     * Detect card brand from number prefix
     */
    detectCardBrand(number) {
        const logo = document.querySelector('.card-brand-logo i');
        if (!logo) return;

        if (number.startsWith('4')) {
            logo.className = 'bi bi-credit-card-2-front fs-2 text-white';
        } else if (number.startsWith('5') || number.startsWith('2')) {
            logo.className = 'bi bi-credit-card fs-2 text-white';
        } else {
            logo.className = 'bi bi-credit-card-2-front fs-2 text-white-50';
        }
    },

    /**
     * Validate card payment form
     */
    validateCardForm() {
        const number = document.getElementById('card-number')?.value.replace(/\s/g, '') || '';
        const name = document.getElementById('card-name')?.value.trim() || '';
        const expiry = document.getElementById('card-expiry')?.value || '';
        const cvv = document.getElementById('card-cvv')?.value || '';

        let isValid = true;

        // Card number - 16 digits
        if (!/^\d{16}$/.test(number)) {
            document.getElementById('card-number')?.classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('card-number')?.classList.remove('is-invalid');
        }

        // Name
        if (name.length < 2) {
            document.getElementById('card-name')?.classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('card-name')?.classList.remove('is-invalid');
        }

        // Expiry - MM/YY
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            document.getElementById('card-expiry')?.classList.add('is-invalid');
            isValid = false;
        } else {
            const [month] = expiry.split('/').map(Number);
            if (month < 1 || month > 12) {
                document.getElementById('card-expiry')?.classList.add('is-invalid');
                isValid = false;
            } else {
                document.getElementById('card-expiry')?.classList.remove('is-invalid');
            }
        }

        // CVV - 3-4 digits
        if (!/^\d{3,4}$/.test(cvv)) {
            document.getElementById('card-cvv')?.classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('card-cvv')?.classList.remove('is-invalid');
        }

        return isValid;
    },

    /**
     * Process payment (mock simulation)
     */
    processPayment(event, amount, method) {
        // Show processing state
        document.querySelectorAll('[id^="checkout-step-"]').forEach(s => s.classList.add('d-none'));
        document.getElementById('checkout-step-processing').classList.remove('d-none');

        // Animate progress bar
        const progressBar = document.getElementById('payment-progress');
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 20 + 5;
            if (progress > 90) progress = 90;
            if (progressBar) progressBar.style.width = progress + '%';
        }, 300);

        // Simulate payment processing delay
        setTimeout(() => {
            clearInterval(interval);
            if (progressBar) progressBar.style.width = '100%';

            // Create transaction record
            const transaction = {
                id: 'TXN-' + Date.now(),
                eventId: event._id,
                eventTitle: event.title,
                eventCategory: event.category,
                eventImage: event.coverImage,
                amount: amount,
                method: method,
                status: 'completed',
                date: new Date().toISOString(),
                userName: auth.user?.username || 'User',
                cardLast4: method === 'card' ? (document.getElementById('card-number')?.value.replace(/\s/g, '').slice(-4) || '****') : null,
                isCommunity: event.isCommunity || false
            };

            this.saveTransaction(transaction);
            this.markJoined(event._id, event.isCommunity);

            // Dispatch event for UI updates
            document.dispatchEvent(new CustomEvent('payment_success', { 
                detail: { id: event._id, isCommunity: event.isCommunity } 
            }));

            // Show success
            setTimeout(() => {
                document.getElementById('checkout-step-processing').classList.add('d-none');
                document.getElementById('checkout-step-success').classList.remove('d-none');
                this.renderReceipt(transaction);
                api.toast('🎉 Thanh toán thành công!', 'success');
            }, 500);

        }, 2500);
    },

    /**
     * Render payment receipt
     */
    renderReceipt(txn) {
        const container = document.getElementById('receipt-details');
        if (!container) return;

        const methodLabel = txn.method === 'qr' ? 'Chuyển khoản QR' : 
                           txn.method === 'card' ? `Thẻ ****${txn.cardLast4}` : 'Miễn phí';

        container.innerHTML = `
            <div class="col-5 text-muted">Mã giao dịch:</div>
            <div class="col-7 fw-bold font-monospace">${txn.id}</div>
            <div class="col-5 text-muted">${txn.isCommunity ? 'Cộng đồng:' : 'Sự kiện:'}</div>
            <div class="col-7 fw-bold">${txn.eventTitle}</div>
            <div class="col-5 text-muted">Số tiền:</div>
            <div class="col-7 fw-bold text-primary">${ui.formatPrice(txn.amount)}</div>
            <div class="col-5 text-muted">Phương thức:</div>
            <div class="col-7 fw-bold">${methodLabel}</div>
            <div class="col-5 text-muted">Thời gian:</div>
            <div class="col-7 fw-bold">${new Date(txn.date).toLocaleString('vi-VN')}</div>
            <div class="col-5 text-muted">Trạng thái:</div>
            <div class="col-7"><span class="badge bg-success rounded-pill px-3 py-1">Thành công</span></div>
        `;
    },

    // ================== State Management ==================

    /**
     * Save transaction to localStorage
     */
    saveTransaction(txn) {
        const transactions = this.getTransactions();
        transactions.unshift(txn); // Newest first
        localStorage.setItem(this.KEYS.TRANSACTIONS, JSON.stringify(transactions));
    },

    /**
     * Get all transactions
     */
    getTransactions() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.TRANSACTIONS)) || [];
        } catch { return []; }
    },

    /**
     * Get transactions for specific user
     */
    getUserTransactions(username) {
        return this.getTransactions().filter(t => t.userName === username);
    },

    /**
     * Mark item as joined
     */
    markJoined(id, isCommunity = false) {
        const key = isCommunity ? this.KEYS.JOINED_COMMUNITIES : this.KEYS.JOINED_EVENTS;
        const joined = this.getJoinedItems(isCommunity);
        if (!joined.includes(id)) {
            joined.push(id);
            localStorage.setItem(key, JSON.stringify(joined));
        }
    },

    /**
     * Get all joined item IDs
     */
    getJoinedItems(isCommunity = false) {
        try {
            const key = isCommunity ? this.KEYS.JOINED_COMMUNITIES : this.KEYS.JOINED_EVENTS;
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch { return []; }
    },

    /**
     * Check if user has joined an item
     */
    isJoined(id, isCommunity = false) {
        return this.getJoinedItems(isCommunity).includes(id);
    },

    /**
     * Alias for isJoined specifically for events
     */
    isEventJoined(id) {
        return this.isJoined(id, false);
    },

    /**
     * Get payment status for an event/community
     */
    getEventPaymentStatus(itemId) {
        const txn = this.getTransactions().find(t => t.eventId === itemId && t.status === 'completed');
        if (txn) return { paid: true, transaction: txn };
        return { paid: false };
    },

    // ================== Modal Injection ==================

    /**
     * Inject the payment modal into the DOM
     */
    injectPaymentModal() {
        if (document.getElementById('paymentModal')) return;

        const modalHtml = `
            <div class="modal fade" id="paymentModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content border-0 shadow-premium rounded-4 overflow-hidden payment-modal-content">
                        <div class="modal-header border-0 pb-0 pt-4 px-4">
                            <div class="d-flex align-items-center gap-2">
                                <div class="payment-header-icon">
                                    <i class="bi bi-shield-lock-fill text-primary fs-4"></i>
                                </div>
                                <div>
                                    <h5 class="modal-title fw-bold mb-0">Thanh toán an toàn</h5>
                                    <span class="small text-muted">EntConnect Secure Checkout</span>
                                </div>
                            </div>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4">
                            <!-- Content injected dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    /**
     * Bind global checkout event handlers
     */
    bindGlobalEvents() {
        // Listen for join buttons that should trigger payment
        document.addEventListener('click', (e) => {
            const joinBtn = e.target.closest('[data-action="join-event"]');
            if (joinBtn) {
                e.preventDefault();
                const eventId = joinBtn.dataset.eventId;
                const event = this.findEventById(eventId);
                if (event) {
                    this.openCheckout(event);
                }
            }
        });
    },

    /**
     * Find event by ID across all available data sources
     */
    findEventById(id) {
        // Check mock data
        const mocks = window.mockActivities || [];
        const found = mocks.find(e => e._id === id);
        if (found) return found;

        // Check home page cached events
        if (window.home?.allEvents) {
            const cached = window.home.allEvents.find(e => e._id === id);
            if (cached) return cached;
        }

        return null;
    }
};

// Initialize payment system
document.addEventListener('DOMContentLoaded', () => payment.init());
window.payment = payment;

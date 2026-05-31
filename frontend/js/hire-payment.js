/**
 * EntConnect - Hire Payment Module
 * Xử lý thanh toán cho chức năng Thuê Ngay
 * Hỗ trợ: QR/ATM, Thẻ Visa, Đặt cọc 50%, Thanh toán khi gặp mặt
 */

const hirePayment = {
    currentCompanion: null,
    currentHours: 1,
    selectedMethod: 'qr', // 'qr' | 'visa' | 'deposit' | 'inperson'

    BANK_INFO: {
        bankName: 'Vietcombank',
        accountNumber: '1234 5678 9012',
        accountHolder: 'ENTCONNECT JSC',
        branch: 'Chi nhánh TP.HCM'
    },

    /**
     * Mở modal thanh toán thuê bạn đồng hành
     */
    openBookingWizard(companion) {
        if (!companion) return;

        // Yêu cầu đăng nhập
        if (window.auth && !auth.user) {
            api.toast('Vui lòng đăng nhập để thuê bạn đồng hành!', 'warning');
            auth.showModal('loginModal');
            return;
        }

        this.currentCompanion = companion;
        this.currentHours = 1;
        this.selectedMethod = 'qr';

        this.renderStep1();

        const modalEl = document.getElementById('hirePaymentModal');
        if (!modalEl) return;
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    /** Format tiền VND */
    fmt(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    },

    /** Tổng tiền theo số giờ */
    getTotal(hours) {
        return (this.currentCompanion?.pricePerHour || 0) * hours;
    },

    /** ====== BƯỚC 1: Chọn giờ + Chọn phương thức thanh toán ====== */
    renderStep1() {
        const c = this.currentCompanion;
        if (!c) return;
        const price = c.pricePerHour || 0;

        const body = document.getElementById('hire-payment-body');
        if (!body) return;

        body.innerHTML = `
            <!-- Companion Info -->
            <div class="hire-checkout-companion d-flex align-items-center gap-3 mb-4 p-3 rounded-4"
                 style="background:linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.05));border:1px solid rgba(99,102,241,0.15);">
                <img src="${c.avatar}" alt="${c.name}" class="rounded-3 flex-shrink-0"
                     style="width:60px;height:60px;object-fit:cover;"
                     onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=6366f1&color=fff&size=120'">
                <div class="flex-grow-1">
                    <div class="fw-bold fs-6">${c.name}</div>
                    <div class="text-primary fw-bold">${this.fmt(price)}<span class="text-muted fw-normal fs-7"> / giờ</span></div>
                    <div class="small text-muted mt-1">
                        ${(c.services || []).slice(0,2).map(s => {
                            const info = window.SERVICE_LABELS?.[s] || { label: s, icon: 'bi-star' };
                            return `<span class="me-2"><i class="bi ${info.icon} me-1"></i>${info.label}</span>`;
                        }).join('')}
                    </div>
                </div>
                ${c.verified ? '<span class="badge bg-primary bg-opacity-10 text-primary rounded-pill px-2 py-1 flex-shrink-0"><i class="bi bi-patch-check-fill me-1"></i>Verified</span>' : ''}
            </div>

            <!-- Chọn số giờ -->
            <div class="mb-4">
                <label class="form-label fw-bold small text-uppercase" style="letter-spacing:0.5px;color:var(--text-muted);">
                    <i class="bi bi-clock me-1 text-primary"></i>Chọn số giờ thuê
                </label>
                <div class="d-flex gap-2 flex-wrap" id="hp-hour-slots">
                    ${[1,2,3,4,6,8].map(h => `
                        <button class="hp-hour-slot btn fw-bold rounded-3 ${h===1?'active':''}"
                                data-hours="${h}" style="min-width:60px;">
                            ${h}h
                        </button>
                    `).join('')}
                </div>
            </div>

            <!-- Tóm tắt giá -->
            <div class="hp-price-box p-3 rounded-4 mb-4"
                 style="background:var(--bg-panel);border:1px solid var(--border-color);">
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Đơn giá:</span>
                    <span class="fw-bold">${this.fmt(price)}/h</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Số giờ:</span>
                    <span class="fw-bold" id="hp-hours-display">1 giờ</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted">Phí dịch vụ:</span>
                    <span class="fw-bold text-success">Miễn phí</span>
                </div>
                <hr class="my-2 opacity-25">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold">Tổng thanh toán:</span>
                    <span class="fw-bold fs-5 text-primary" id="hp-total-display">${this.fmt(price)}</span>
                </div>
            </div>

            <!-- Chọn phương thức thanh toán -->
            <h6 class="fw-bold mb-3">
                <i class="bi bi-credit-card me-2 text-primary"></i>Chọn phương thức thanh toán
            </h6>
            <div class="d-flex flex-column gap-2 mb-4" id="hp-methods">

                <!-- QR / ATM -->
                <label class="hp-method-option active" data-method="qr">
                    <input type="radio" name="hireMethod" value="qr" checked class="d-none">
                    <div class="d-flex align-items-center gap-3 p-3 rounded-4">
                        <div class="hp-method-icon" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);">
                            <i class="bi bi-qr-code-scan fs-5 text-white"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="fw-bold">Thanh toán QR / ATM</div>
                            <div class="small text-muted">Quét mã QR hoặc chuyển khoản ngân hàng</div>
                        </div>
                        <div class="hp-method-check"><i class="bi bi-check-circle-fill text-primary fs-5"></i></div>
                    </div>
                </label>

                <!-- Visa / MasterCard -->
                <label class="hp-method-option" data-method="visa">
                    <input type="radio" name="hireMethod" value="visa" class="d-none">
                    <div class="d-flex align-items-center gap-3 p-3 rounded-4">
                        <div class="hp-method-icon" style="background:linear-gradient(135deg,#f59e0b,#f97316);">
                            <i class="bi bi-credit-card-2-front fs-5 text-white"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="fw-bold">Thẻ ATM / Visa / MasterCard</div>
                            <div class="small text-muted">Thanh toán bằng thẻ ngân hàng nội địa hoặc quốc tế</div>
                        </div>
                        <div class="hp-method-check"><i class="bi bi-circle text-muted fs-5"></i></div>
                    </div>
                </label>

                <!-- Đặt cọc 50% -->
                <label class="hp-method-option" data-method="deposit">
                    <input type="radio" name="hireMethod" value="deposit" class="d-none">
                    <div class="d-flex align-items-center gap-3 p-3 rounded-4">
                        <div class="hp-method-icon" style="background:linear-gradient(135deg,#10b981,#34d399);">
                            <i class="bi bi-wallet2 fs-5 text-white"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="fw-bold">Đặt cọc trước 50%</div>
                            <div class="small text-muted">Đặt cọc một nửa, trả phần còn lại khi gặp mặt</div>
                        </div>
                        <div class="hp-method-check"><i class="bi bi-circle text-muted fs-5"></i></div>
                    </div>
                </label>

                <!-- Thanh toán khi gặp mặt -->
                <label class="hp-method-option" data-method="inperson">
                    <input type="radio" name="hireMethod" value="inperson" class="d-none">
                    <div class="d-flex align-items-center gap-3 p-3 rounded-4">
                        <div class="hp-method-icon" style="background:linear-gradient(135deg,#3b82f6,#6366f1);">
                            <i class="bi bi-people-fill fs-5 text-white"></i>
                        </div>
                        <div class="flex-grow-1">
                            <div class="fw-bold">Thanh toán khi gặp mặt</div>
                            <div class="small text-muted">Xác nhận đặt lịch, thanh toán trực tiếp khi gặp</div>
                        </div>
                        <div class="hp-method-check"><i class="bi bi-circle text-muted fs-5"></i></div>
                    </div>
                </label>
            </div>

            <!-- Nút tiếp tục -->
            <button class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm" id="hp-btn-proceed">
                <i class="bi bi-lock-fill me-2"></i>Tiến hành thanh toán
            </button>
            <p class="text-center small text-muted mt-3 mb-0">
                <i class="bi bi-shield-lock text-success me-1"></i>
                Thanh toán được bảo mật bởi EntConnect Security
            </p>
        `;

        this._bindStep1Events();
    },

    _bindStep1Events() {
        const price = this.currentCompanion?.pricePerHour || 0;

        // Hour slots
        document.querySelectorAll('.hp-hour-slot').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.hp-hour-slot').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentHours = parseInt(btn.dataset.hours);
                const total = this.getTotal(this.currentHours);
                const hoursDisplay = document.getElementById('hp-hours-display');
                const totalDisplay = document.getElementById('hp-total-display');
                if (hoursDisplay) hoursDisplay.textContent = `${this.currentHours} giờ`;
                if (totalDisplay) totalDisplay.textContent = this.fmt(total);
            });
        });

        // Method selection
        document.querySelectorAll('.hp-method-option').forEach(opt => {
            opt.addEventListener('click', () => {
                document.querySelectorAll('.hp-method-option').forEach(o => {
                    o.classList.remove('active');
                    const check = o.querySelector('.hp-method-check i');
                    if (check) check.className = 'bi bi-circle text-muted fs-5';
                    const radio = o.querySelector('input');
                    if (radio) radio.checked = false;
                });
                opt.classList.add('active');
                const check = opt.querySelector('.hp-method-check i');
                if (check) check.className = 'bi bi-check-circle-fill text-primary fs-5';
                const radio = opt.querySelector('input');
                if (radio) radio.checked = true;
                this.selectedMethod = opt.dataset.method;
            });
        });

        // Proceed button
        const btnProceed = document.getElementById('hp-btn-proceed');
        if (btnProceed) {
            btnProceed.addEventListener('click', () => {
                const total = this.getTotal(this.currentHours);
                if (this.selectedMethod === 'qr') this.renderQRStep(total);
                else if (this.selectedMethod === 'visa') this.renderVisaStep(total);
                else if (this.selectedMethod === 'deposit') this.renderDepositStep(total);
                else if (this.selectedMethod === 'inperson') this.renderInPersonStep(total);
            });
        }
    },

    /** ====== BƯỚC 2a: QR / ATM ====== */
    renderQRStep(total) {
        const c = this.currentCompanion;
        const transferNote = `HIRE${Date.now().toString().slice(-8)}`;
        const qrData = encodeURIComponent(
            `EntConnect|${transferNote}|${total}|${this.BANK_INFO.accountNumber}`
        );
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`;

        const body = document.getElementById('hire-payment-body');
        body.innerHTML = `
            <div class="text-center mb-4">
                <span class="badge px-3 py-2 rounded-pill fw-bold mb-3"
                      style="background:rgba(245,158,11,0.1);color:#f59e0b;">
                    <i class="bi bi-clock-history me-1"></i>Chờ thanh toán
                </span>
                <h5 class="fw-bold mb-1">Quét mã QR để thanh toán</h5>
                <p class="text-muted small mb-0">Sử dụng ứng dụng ngân hàng hoặc ví điện tử</p>
            </div>

            <div class="text-center mb-4 p-4 rounded-4"
                 style="background:linear-gradient(135deg,rgba(99,102,241,0.04),rgba(139,92,246,0.04));border:1px solid var(--border-color);">
                <div class="position-relative d-inline-block p-3 bg-white rounded-4 shadow-sm mb-3">
                    <img src="${qrUrl}" alt="QR Code" width="220" height="220" class="rounded-3">
                    <div style="position:absolute;top:12px;left:12px;right:12px;height:3px;
                                background:linear-gradient(90deg,transparent,#6366f1,transparent);
                                border-radius:4px;animation:qrScan 2.5s ease-in-out infinite;opacity:0.7;"></div>
                </div>

                <div class="p-3 rounded-3 text-start"
                     style="background:rgba(255,255,255,0.7);border:1px dashed rgba(99,102,241,0.3);">
                    <div class="row g-2 small">
                        <div class="col-5 text-muted fw-bold">Ngân hàng:</div>
                        <div class="col-7 fw-bold">${this.BANK_INFO.bankName}</div>
                        <div class="col-5 text-muted fw-bold">Số tài khoản:</div>
                        <div class="col-7 fw-bold font-monospace">${this.BANK_INFO.accountNumber}</div>
                        <div class="col-5 text-muted fw-bold">Chủ tài khoản:</div>
                        <div class="col-7 fw-bold">${this.BANK_INFO.accountHolder}</div>
                        <div class="col-5 text-muted fw-bold">Số tiền:</div>
                        <div class="col-7 fw-bold text-primary fs-6">${this.fmt(total)}</div>
                        <div class="col-5 text-muted fw-bold">Nội dung CK:</div>
                        <div class="col-7">
                            <code class="px-2 py-1 rounded fw-bold"
                                  style="background:rgba(99,102,241,0.1);color:#6366f1;">${transferNote}</code>
                        </div>
                    </div>
                </div>
            </div>

            <div class="d-flex gap-2 mb-2">
                <button class="btn btn-primary flex-grow-1 py-3 rounded-3 fw-bold" id="hp-btn-confirm-qr">
                    <i class="bi bi-check2-circle me-2"></i>Tôi đã thanh toán
                </button>
                <button class="btn btn-outline-secondary py-3 rounded-3 fw-bold px-4" id="hp-btn-check-status"
                        title="Kiểm tra trạng thái">
                    <i class="bi bi-arrow-repeat"></i>
                </button>
            </div>
            <button class="btn btn-link text-muted w-100 small" id="hp-btn-back">
                <i class="bi bi-arrow-left me-1"></i>Quay lại chọn phương thức
            </button>
        `;

        document.getElementById('hp-btn-back').addEventListener('click', () => this.renderStep1());
        document.getElementById('hp-btn-check-status').addEventListener('click', (e) => {
            const btn = e.currentTarget;
            btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';
            setTimeout(() => {
                btn.innerHTML = '<i class="bi bi-arrow-repeat"></i>';
                api.toast('Đang kiểm tra... Hệ thống chưa nhận được giao dịch.', 'info');
            }, 1500);
        });
        document.getElementById('hp-btn-confirm-qr').addEventListener('click', () => {
            this._processPayment(total, 'qr');
        });
    },

    /** ====== BƯỚC 2b: Thẻ Visa / ATM ====== */
    renderVisaStep(total) {
        const body = document.getElementById('hire-payment-body');
        body.innerHTML = `
            <div class="text-center mb-4">
                <span class="badge px-3 py-2 rounded-pill fw-bold mb-3"
                      style="background:rgba(99,102,241,0.1);color:#6366f1;">
                    <i class="bi bi-credit-card-2-front me-1"></i>Thanh toán thẻ
                </span>
                <h5 class="fw-bold mb-1">Nhập thông tin thẻ</h5>
                <p class="text-muted small mb-0">Thông tin thẻ được bảo mật hoàn toàn</p>
            </div>

            <!-- Card Preview -->
            <div class="mb-4 p-4 rounded-4 text-white position-relative overflow-hidden"
                 style="background:linear-gradient(135deg,#1e1b4b 0%,#6366f1 50%,#ec4899 100%);
                        min-height:175px;box-shadow:0 12px 40px rgba(99,102,241,0.35);
                        transition:transform 0.3s ease;"
                 onmouseover="this.style.transform='perspective(500px) rotateY(-5deg)'"
                 onmouseout="this.style.transform='none'">
                <div class="mb-3">
                    <svg width="40" height="30" viewBox="0 0 40 30">
                        <rect width="40" height="30" rx="5" fill="rgba(255,255,255,0.3)"/>
                        <rect x="5" y="5" width="12" height="20" rx="3" fill="rgba(255,255,255,0.5)"/>
                    </svg>
                </div>
                <div class="font-monospace fs-5 mb-3" id="hv-card-num" style="letter-spacing:3px;">
                    •••• •••• •••• ••••
                </div>
                <div class="d-flex justify-content-between align-items-end">
                    <div>
                        <div class="x-small text-white-50 text-uppercase" style="font-size:0.7rem;">Chủ thẻ</div>
                        <div class="small fw-bold" id="hv-card-name">YOUR NAME</div>
                    </div>
                    <div class="text-end">
                        <div class="x-small text-white-50 text-uppercase" style="font-size:0.7rem;">Hết hạn</div>
                        <div class="small fw-bold" id="hv-card-exp">MM/YY</div>
                    </div>
                </div>
                <div class="position-absolute" style="top:15px;right:20px;">
                    <i class="bi bi-credit-card-2-front fs-2 text-white-50" id="hv-card-brand"></i>
                </div>
            </div>

            <!-- Số tiền -->
            <div class="p-3 rounded-4 mb-4 text-center"
                 style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.15);">
                <div class="text-muted small mb-1">Tổng thanh toán</div>
                <div class="fw-bold fs-4 text-primary">${this.fmt(total)}</div>
                <div class="small text-muted">${this.currentHours} giờ x ${this.fmt(this.currentCompanion.pricePerHour)}</div>
            </div>

            <form id="hp-visa-form" novalidate>
                <div class="mb-3">
                    <label class="form-label small fw-bold">SỐ THẺ</label>
                    <div class="input-group">
                        <span class="input-group-text rounded-start-3" style="background:var(--bg-panel);">
                            <i class="bi bi-credit-card text-primary"></i>
                        </span>
                        <input type="text" id="hv-num" class="form-control rounded-end-3 py-3"
                               placeholder="1234 5678 9012 3456" maxlength="19" required
                               style="background:var(--bg-panel);">
                        <div class="invalid-feedback">Vui lòng nhập số thẻ hợp lệ (16 chữ số)</div>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="form-label small fw-bold">TÊN CHỦ THẺ</label>
                    <input type="text" id="hv-name" class="form-control rounded-3 py-3"
                           placeholder="NGUYEN VAN A" required style="background:var(--bg-panel);">
                    <div class="invalid-feedback">Vui lòng nhập tên chủ thẻ</div>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-6">
                        <label class="form-label small fw-bold">NGÀY HẾT HẠN</label>
                        <input type="text" id="hv-exp" class="form-control rounded-3 py-3"
                               placeholder="MM/YY" maxlength="5" required style="background:var(--bg-panel);">
                        <div class="invalid-feedback">Nhập dạng MM/YY</div>
                    </div>
                    <div class="col-6">
                        <label class="form-label small fw-bold">CVV</label>
                        <div class="input-group">
                            <input type="password" id="hv-cvv" class="form-control rounded-start-3 py-3"
                                   placeholder="•••" maxlength="4" required style="background:var(--bg-panel);">
                            <span class="input-group-text rounded-end-3" style="background:var(--bg-panel);"
                                  title="Mã 3-4 số ở mặt sau thẻ" style="cursor:help;">
                                <i class="bi bi-question-circle text-muted"></i>
                            </span>
                            <div class="invalid-feedback">Nhập CVV (3-4 số)</div>
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm">
                    <i class="bi bi-lock-fill me-2"></i>Thanh toán ${this.fmt(total)}
                </button>
            </form>
            <button class="btn btn-link text-muted w-100 mt-2 small" id="hp-btn-back">
                <i class="bi bi-arrow-left me-1"></i>Quay lại chọn phương thức
            </button>
            <div class="d-flex justify-content-center gap-3 mt-3 opacity-50">
                <i class="bi bi-shield-lock fs-5"></i>
                <span class="small text-muted">Mô phỏng thanh toán - Không thu phí thật</span>
            </div>
        `;

        document.getElementById('hp-btn-back').addEventListener('click', () => this.renderStep1());
        this._bindVisaForm(total);
    },

    _bindVisaForm(total) {
        const numInput = document.getElementById('hv-num');
        const nameInput = document.getElementById('hv-name');
        const expInput = document.getElementById('hv-exp');

        if (numInput) {
            numInput.addEventListener('input', (e) => {
                let val = e.target.value.replace(/\D/g, '').substring(0, 16);
                val = val.replace(/(.{4})/g, '$1 ').trim();
                e.target.value = val;
                const display = document.getElementById('hv-card-num');
                if (display) display.textContent = val || '•••• •••• •••• ••••';
                // Detect brand
                const brand = document.getElementById('hv-card-brand');
                if (brand) {
                    const raw = val.replace(/\s/g, '');
                    if (raw.startsWith('4')) brand.className = 'bi bi-credit-card-2-front fs-2 text-white';
                    else if (raw.startsWith('5') || raw.startsWith('2')) brand.className = 'bi bi-credit-card fs-2 text-white';
                    else brand.className = 'bi bi-credit-card-2-front fs-2 text-white-50';
                }
            });
        }
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
                const display = document.getElementById('hv-card-name');
                if (display) display.textContent = e.target.value || 'YOUR NAME';
            });
        }
        if (expInput) {
            expInput.addEventListener('input', (e) => {
                let val = e.target.value.replace(/\D/g, '').substring(0, 4);
                if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
                e.target.value = val;
                const display = document.getElementById('hv-card-exp');
                if (display) display.textContent = val || 'MM/YY';
            });
        }

        const form = document.getElementById('hp-visa-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this._validateVisaForm()) {
                    this._processPayment(total, 'visa');
                }
            });
        }
    },

    _validateVisaForm() {
        const num = document.getElementById('hv-num')?.value.replace(/\s/g, '') || '';
        const name = document.getElementById('hv-name')?.value.trim() || '';
        const exp = document.getElementById('hv-exp')?.value || '';
        const cvv = document.getElementById('hv-cvv')?.value || '';
        let ok = true;

        const setInvalid = (id, invalid) => {
            const el = document.getElementById(id);
            if (el) el.classList.toggle('is-invalid', invalid);
        };

        setInvalid('hv-num', !/^\d{16}$/.test(num));
        if (!/^\d{16}$/.test(num)) ok = false;

        setInvalid('hv-name', name.length < 2);
        if (name.length < 2) ok = false;

        const expOk = /^\d{2}\/\d{2}$/.test(exp) && parseInt(exp.split('/')[0]) >= 1 && parseInt(exp.split('/')[0]) <= 12;
        setInvalid('hv-exp', !expOk);
        if (!expOk) ok = false;

        setInvalid('hv-cvv', !/^\d{3,4}$/.test(cvv));
        if (!/^\d{3,4}$/.test(cvv)) ok = false;

        return ok;
    },

    /** ====== BƯỚC 2c: Đặt cọc 50% ====== */
    renderDepositStep(total) {
        const deposit = total / 2;
        const remaining = total - deposit;
        const c = this.currentCompanion;
        const transferNote = `DEPOSIT${Date.now().toString().slice(-6)}`;
        const qrData = encodeURIComponent(
            `EntConnect|${transferNote}|${deposit}|${this.BANK_INFO.accountNumber}`
        );
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`;

        const body = document.getElementById('hire-payment-body');
        body.innerHTML = `
            <div class="text-center mb-4">
                <span class="badge px-3 py-2 rounded-pill fw-bold mb-3"
                      style="background:rgba(16,185,129,0.1);color:#10b981;">
                    <i class="bi bi-wallet2 me-1"></i>Đặt cọc trước 50%
                </span>
                <h5 class="fw-bold mb-1">Đặt cọc để giữ lịch</h5>
                <p class="text-muted small mb-0">Thanh toán phần còn lại khi gặp mặt với <b>${c.name}</b></p>
            </div>

            <!-- Breakdown -->
            <div class="row g-3 mb-4">
                <div class="col-6">
                    <div class="text-center p-3 rounded-4 h-100"
                         style="background:rgba(16,185,129,0.07);border:1.5px solid rgba(16,185,129,0.2);">
                        <div class="small text-muted mb-1">Đặt cọc ngay</div>
                        <div class="fw-bold fs-5 text-success">${this.fmt(deposit)}</div>
                        <div class="small text-muted mt-1">50% tổng tiền</div>
                    </div>
                </div>
                <div class="col-6">
                    <div class="text-center p-3 rounded-4 h-100"
                         style="background:rgba(99,102,241,0.06);border:1.5px solid rgba(99,102,241,0.15);">
                        <div class="small text-muted mb-1">Thanh toán sau</div>
                        <div class="fw-bold fs-5 text-primary">${this.fmt(remaining)}</div>
                        <div class="small text-muted mt-1">Khi gặp mặt</div>
                    </div>
                </div>
            </div>

            <!-- QR đặt cọc -->
            <div class="text-center mb-4 p-3 rounded-4"
                 style="background:linear-gradient(135deg,rgba(16,185,129,0.05),rgba(52,211,153,0.04));
                        border:1px solid rgba(16,185,129,0.15);">
                <div class="small fw-bold text-success mb-2">
                    <i class="bi bi-qr-code-scan me-1"></i>Quét QR để đặt cọc ${this.fmt(deposit)}
                </div>
                <div class="d-inline-block p-3 bg-white rounded-4 shadow-sm mb-3">
                    <img src="${qrUrl}" alt="QR Cọc" width="180" height="180" class="rounded-3">
                </div>
                <div class="p-3 rounded-3 text-start"
                     style="background:rgba(255,255,255,0.7);border:1px dashed rgba(16,185,129,0.3);">
                    <div class="row g-2 small">
                        <div class="col-5 text-muted fw-bold">Ngân hàng:</div>
                        <div class="col-7 fw-bold">${this.BANK_INFO.bankName}</div>
                        <div class="col-5 text-muted fw-bold">Số tài khoản:</div>
                        <div class="col-7 fw-bold font-monospace">${this.BANK_INFO.accountNumber}</div>
                        <div class="col-5 text-muted fw-bold">Số tiền cọc:</div>
                        <div class="col-7 fw-bold text-success fs-6">${this.fmt(deposit)}</div>
                        <div class="col-5 text-muted fw-bold">Nội dung:</div>
                        <div class="col-7">
                            <code class="px-2 py-1 rounded fw-bold"
                                  style="background:rgba(16,185,129,0.1);color:#10b981;">${transferNote}</code>
                        </div>
                    </div>
                </div>
            </div>

            <div class="p-3 rounded-3 mb-4"
                 style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);">
                <div class="small fw-bold text-warning mb-1">
                    <i class="bi bi-exclamation-triangle me-1"></i>Lưu ý quan trọng
                </div>
                <ul class="small text-muted mb-0 ps-3">
                    <li>Tiền cọc sẽ được hoàn trả nếu hủy trước 24h</li>
                    <li>Thanh toán phần còn lại khi bắt đầu buổi thuê</li>
                    <li>Giữ lịch trong 2 giờ sau khi đặt cọc</li>
                </ul>
            </div>

            <button class="btn btn-success w-100 py-3 rounded-3 fw-bold shadow-sm mb-2" id="hp-btn-confirm-deposit">
                <i class="bi bi-check2-circle me-2"></i>Tôi đã chuyển khoản cọc
            </button>
            <button class="btn btn-link text-muted w-100 small" id="hp-btn-back">
                <i class="bi bi-arrow-left me-1"></i>Quay lại chọn phương thức
            </button>
        `;

        document.getElementById('hp-btn-back').addEventListener('click', () => this.renderStep1());
        document.getElementById('hp-btn-confirm-deposit').addEventListener('click', () => {
            this._processPayment(deposit, 'deposit', remaining);
        });
    },

    /** ====== BƯỚC 2d: Thanh toán khi gặp mặt ====== */
    renderInPersonStep(total) {
        const c = this.currentCompanion;
        const body = document.getElementById('hire-payment-body');
        body.innerHTML = `
            <div class="text-center mb-4">
                <span class="badge px-3 py-2 rounded-pill fw-bold mb-3"
                      style="background:rgba(59,130,246,0.1);color:#3b82f6;">
                    <i class="bi bi-people-fill me-1"></i>Thanh toán khi gặp mặt
                </span>
                <h5 class="fw-bold mb-1">Xác nhận đặt lịch</h5>
                <p class="text-muted small mb-0">Thanh toán trực tiếp cho <b>${c.name}</b> khi gặp mặt</p>
            </div>

            <!-- Tóm tắt -->
            <div class="p-4 rounded-4 mb-4"
                 style="background:linear-gradient(135deg,rgba(59,130,246,0.05),rgba(99,102,241,0.05));
                        border:1px solid rgba(99,102,241,0.12);">
                <div class="d-flex align-items-center gap-3 mb-3 pb-3"
                     style="border-bottom:1px solid var(--border-color);">
                    <img src="${c.avatar}" alt="${c.name}" class="rounded-3 flex-shrink-0"
                         style="width:50px;height:50px;object-fit:cover;"
                         onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=6366f1&color=fff'">
                    <div>
                        <div class="fw-bold">${c.name}</div>
                        <div class="small text-muted">${this.currentHours} giờ đồng hành</div>
                    </div>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted small">Giá thuê:</span>
                    <span class="fw-bold small">${this.fmt(this.currentCompanion.pricePerHour)}/h</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                    <span class="text-muted small">Số giờ:</span>
                    <span class="fw-bold small">${this.currentHours} giờ</span>
                </div>
                <hr class="my-2 opacity-25">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold">Tổng cần thanh toán:</span>
                    <span class="fw-bold fs-5 text-primary">${this.fmt(total)}</span>
                </div>
            </div>

            <!-- Hướng dẫn -->
            <div class="mb-4">
                <h6 class="fw-bold mb-3">
                    <i class="bi bi-list-check text-primary me-2"></i>Quy trình thanh toán
                </h6>
                <div class="d-flex flex-column gap-2">
                    <div class="d-flex align-items-center gap-3 p-3 rounded-3"
                         style="background:var(--bg-panel);border:1px solid var(--border-color);">
                        <div class="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white flex-shrink-0"
                             style="width:32px;height:32px;background:#6366f1;font-size:0.85rem;">1</div>
                        <div class="small">Xác nhận đặt lịch — lịch sẽ được gửi đến ${c.name}</div>
                    </div>
                    <div class="d-flex align-items-center gap-3 p-3 rounded-3"
                         style="background:var(--bg-panel);border:1px solid var(--border-color);">
                        <div class="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white flex-shrink-0"
                             style="width:32px;height:32px;background:#8b5cf6;font-size:0.85rem;">2</div>
                        <div class="small">${c.name} sẽ liên hệ xác nhận thời gian gặp mặt</div>
                    </div>
                    <div class="d-flex align-items-center gap-3 p-3 rounded-3"
                         style="background:var(--bg-panel);border:1px solid var(--border-color);">
                        <div class="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white flex-shrink-0"
                             style="width:32px;height:32px;background:#10b981;font-size:0.85rem;">3</div>
                        <div class="small">Thanh toán <b>${this.fmt(total)}</b> khi bắt đầu buổi thuê</div>
                    </div>
                </div>
            </div>

            <div class="p-3 rounded-3 mb-4"
                 style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);">
                <div class="small text-muted">
                    <i class="bi bi-info-circle text-warning me-1"></i>
                    Hủy lịch miễn phí nếu hủy trước 2 giờ so với thời gian đã hẹn.
                </div>
            </div>

            <button class="btn btn-primary w-100 py-3 rounded-3 fw-bold shadow-sm mb-2" id="hp-btn-confirm-inperson">
                <i class="bi bi-calendar-check me-2"></i>Xác nhận đặt lịch
            </button>
            <button class="btn btn-link text-muted w-100 small" id="hp-btn-back">
                <i class="bi bi-arrow-left me-1"></i>Quay lại chọn phương thức
            </button>
        `;

        document.getElementById('hp-btn-back').addEventListener('click', () => this.renderStep1());
        document.getElementById('hp-btn-confirm-inperson').addEventListener('click', () => {
            this._processPayment(0, 'inperson', total);
        });
    },

    /** ====== XỬ LÝ THANH TOÁN + ANIMATION ====== */
    _processPayment(paidNow, method, pendingAmount = 0) {
        const body = document.getElementById('hire-payment-body');
        body.innerHTML = `
            <div class="text-center py-5">
                <div class="d-flex justify-content-center mb-4">
                    <div class="position-relative d-flex align-items-center justify-content-center"
                         style="width:100px;height:100px;">
                        <div style="position:absolute;inset:0;border:4px solid rgba(99,102,241,0.15);
                                    border-top-color:#6366f1;border-radius:50%;
                                    animation:spinRing 1s linear infinite;"></div>
                        <i class="bi bi-credit-card-2-front fs-2 text-primary"
                           style="animation:pulse 1.5s ease-in-out infinite;"></i>
                    </div>
                </div>
                <h5 class="fw-bold mb-2">Đang xử lý...</h5>
                <p class="text-muted">Vui lòng không đóng trang này</p>
                <div class="progress mx-auto" style="width:200px;height:4px;">
                    <div class="progress-bar bg-primary progress-bar-striped progress-bar-animated"
                         style="width:0%" id="hp-progress"></div>
                </div>
            </div>
        `;

        const bar = document.getElementById('hp-progress');
        let prog = 0;
        const interval = setInterval(() => {
            prog += Math.random() * 20 + 5;
            if (prog > 90) prog = 90;
            if (bar) bar.style.width = prog + '%';
        }, 300);

        setTimeout(() => {
            clearInterval(interval);
            if (bar) bar.style.width = '100%';
            setTimeout(() => this._renderSuccess(paidNow, method, pendingAmount), 500);
        }, 2200);
    },

    /** ====== THÀNH CÔNG ====== */
    _renderSuccess(paidNow, method, pendingAmount = 0) {
        const c = this.currentCompanion;
        const txnId = 'HIRE-' + Date.now();
        const methodLabel = {
            'qr': '🏦 Chuyển khoản QR/ATM',
            'visa': '💳 Thẻ Visa/ATM',
            'deposit': '💰 Đặt cọc 50%',
            'inperson': '🤝 Thanh toán khi gặp mặt'
        }[method] || method;

        // Save to localStorage
        try {
            const key = 'entconnect_hire_bookings';
            const bookings = JSON.parse(localStorage.getItem(key) || '[]');
            bookings.unshift({
                id: txnId,
                companionId: c._id,
                companionName: c.name,
                companionAvatar: c.avatar,
                hours: this.currentHours,
                pricePerHour: c.pricePerHour,
                totalAmount: this.getTotal(this.currentHours),
                paidNow,
                pendingAmount,
                method,
                status: method === 'inperson' ? 'pending_meeting' : (pendingAmount > 0 ? 'deposit_paid' : 'paid'),
                date: new Date().toISOString(),
                userName: window.auth?.user?.username || 'User'
            });
            localStorage.setItem(key, JSON.stringify(bookings.slice(0, 50)));
        } catch (e) { /* ignore */ }

        const total = this.getTotal(this.currentHours);
        const body = document.getElementById('hire-payment-body');
        body.innerHTML = `
            <div class="text-center py-3">
                <!-- Success Icon -->
                <div class="d-flex justify-content-center mb-4">
                    <div class="d-flex align-items-center justify-content-center rounded-circle"
                         style="width:80px;height:80px;
                                background:linear-gradient(135deg,#10b981,#34d399);
                                box-shadow:0 8px 30px rgba(16,185,129,0.35);
                                animation:successPop 0.5s cubic-bezier(0.2,1,0.2,1);">
                        <i class="bi bi-check-lg text-white" style="font-size:2.5rem;"></i>
                    </div>
                </div>

                <h4 class="fw-bold text-success mb-2">
                    ${method === 'inperson' ? 'Đặt lịch thành công! 📅' : 'Thanh toán thành công! 🎉'}
                </h4>
                <p class="text-muted mb-4">
                    ${method === 'deposit'
                        ? `Đặt cọc thành công. Thanh toán còn lại <b>${this.fmt(pendingAmount)}</b> khi gặp mặt.`
                        : method === 'inperson'
                        ? `${c.name} sẽ liên hệ xác nhận lịch hẹn sớm nhất.`
                        : `Bạn đã thuê thành công <b>${c.name}</b> trong <b>${this.currentHours} giờ</b>.`}
                </p>

                <!-- Receipt -->
                <div class="p-4 rounded-4 text-start mb-4"
                     style="background:linear-gradient(135deg,rgba(16,185,129,0.05),rgba(52,211,153,0.05));
                            border:1px solid rgba(16,185,129,0.2);">
                    <h6 class="fw-bold mb-3 text-center">
                        <i class="bi bi-receipt me-2"></i>Biên nhận
                    </h6>
                    <div class="d-flex align-items-center gap-3 mb-3 pb-3"
                         style="border-bottom:1px dashed rgba(16,185,129,0.2);">
                        <img src="${c.avatar}" alt="${c.name}" class="rounded-3"
                             style="width:44px;height:44px;object-fit:cover;"
                             onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=6366f1&color=fff'">
                        <div>
                            <div class="fw-bold small">${c.name}</div>
                            <div class="text-muted x-small">${this.currentHours} giờ đồng hành</div>
                        </div>
                    </div>
                    <div class="row g-2 small">
                        <div class="col-5 text-muted">Mã đặt lịch:</div>
                        <div class="col-7 fw-bold font-monospace" style="font-size:0.8rem;">${txnId}</div>
                        <div class="col-5 text-muted">Phương thức:</div>
                        <div class="col-7 fw-bold">${methodLabel}</div>
                        ${paidNow > 0 ? `
                        <div class="col-5 text-muted">Đã thanh toán:</div>
                        <div class="col-7 fw-bold text-success">${this.fmt(paidNow)}</div>` : ''}
                        ${pendingAmount > 0 ? `
                        <div class="col-5 text-muted">Thanh toán sau:</div>
                        <div class="col-7 fw-bold text-primary">${this.fmt(pendingAmount)}</div>` : ''}
                        <div class="col-5 text-muted">Tổng tiền:</div>
                        <div class="col-7 fw-bold">${this.fmt(total)}</div>
                        <div class="col-5 text-muted">Thời gian:</div>
                        <div class="col-7 fw-bold" style="font-size:0.8rem;">${new Date().toLocaleString('vi-VN')}</div>
                        <div class="col-5 text-muted">Trạng thái:</div>
                        <div class="col-7">
                            <span class="badge rounded-pill px-3 py-1"
                                  style="background:rgba(16,185,129,0.1);color:#10b981;">
                                ${method === 'inperson' ? 'Chờ xác nhận' : (pendingAmount > 0 ? 'Đặt cọc' : 'Thành công')}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <button class="btn btn-primary flex-grow-1 py-3 rounded-3 fw-bold"
                            onclick="hirePage.openChat('${c._id}');bootstrap.Modal.getInstance(document.getElementById('hirePaymentModal'))?.hide();">
                        <i class="bi bi-chat-dots me-2"></i>Nhắn tin với ${c.name}
                    </button>
                    <button class="btn btn-outline-secondary py-3 rounded-3 fw-bold px-4"
                            data-bs-dismiss="modal">
                        <i class="bi bi-x-lg"></i>
                    </button>
                </div>
            </div>
        `;

        api.toast('🎉 Đặt lịch thành công!', 'success');
    },

    // ============================================================
    //  VIP Auction Checkout & Charity Certificate
    // ============================================================

    /** Open payment modal for winning auction bid */
    openAuctionCheckout(auction) {
        if (!auction) return;

        this.currentAuction = auction;
        this.auctionPayMethod = 'qr';

        this.renderAuctionStep1();

        const modalEl = document.getElementById('hirePaymentModal');
        if (!modalEl) return;

        // Update modal title for auction
        const titleEl = modalEl.querySelector('.modal-title');
        if (titleEl) titleEl.innerHTML = '<i class="bi bi-trophy-fill text-warning me-2"></i>Thanh toán Đấu giá VIP';

        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    },

    /** Auction payment step 1: summary + method selection */
    renderAuctionStep1() {
        const a = this.currentAuction;
        if (!a) return;
        const body = document.getElementById('hire-payment-body');
        if (!body) return;

        const total = a.currentBid || 0;
        const charityAmt = Math.floor(total * a.charityPercent / 100);
        const celebAmt   = Math.floor(total * a.celebrityPercent / 100);
        const platAmt    = Math.floor(total * a.platformPercent / 100);

        body.innerHTML = `
        <!-- Auction Winner Banner -->
        <div class="p-3 mb-4 rounded-4 text-center"
             style="background:linear-gradient(135deg,rgba(251,191,36,0.08),rgba(245,158,11,0.04));border:1.5px solid rgba(251,191,36,0.25);">
            <div class="mb-2" style="font-size:2rem;">🏆</div>
            <div class="fw-bold font-outfit" style="font-size:1.1rem;color:#fbbf24;">Chúc mừng! Bạn đã thắng đấu giá!</div>
            <div class="text-muted small mt-1">${a.title}</div>
        </div>

        <!-- Celebrity Card -->
        <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-4"
             style="background:linear-gradient(135deg,rgba(251,191,36,0.05),rgba(245,158,11,0.03));border:1px solid rgba(251,191,36,0.15);">
            <img src="${a.avatar}" alt="${a.name}" class="rounded-3 flex-shrink-0"
                 style="width:64px;height:64px;object-fit:cover;border:2px solid rgba(251,191,36,0.3);"
                 onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(a.name)}&background=fbbf24&color=1e293b&size=128'">
            <div class="flex-grow-1">
                <div class="fw-bold font-outfit">${a.name}</div>
                <div class="small text-muted">${a.title}</div>
                <div class="fw-bold mt-1" style="color:#fbbf24;font-size:1.05rem;">${total.toLocaleString('vi-VN')}đ</div>
            </div>
            <span class="badge rounded-pill px-3 py-2 fw-bold" style="background:rgba(16,185,129,0.1);color:#10b981;">
                <i class="bi bi-shield-check-fill me-1"></i>Thắng cuộc
            </span>
        </div>

        <!-- Amount Breakdown -->
        <div class="mb-4 p-3 rounded-4" style="background:var(--bg-panel);border:1px solid var(--border-color);">
            <div class="fw-bold small text-uppercase mb-3" style="letter-spacing:0.5px;color:var(--text-muted);">
                <i class="bi bi-pie-chart-fill me-1"></i>Phân bổ số tiền ${total.toLocaleString('vi-VN')}đ
            </div>
            <div class="auction-charity-bar mb-3" style="height:10px;">
                <div class="charity-segment-don" style="flex:${a.charityPercent}"></div>
                <div class="charity-segment-cel" style="flex:${a.celebrityPercent}"></div>
                <div class="charity-segment-pla" style="flex:${a.platformPercent}"></div>
            </div>
            <div class="row g-2 small">
                <div class="col-12 d-flex justify-content-between align-items-center p-2 rounded-3"
                     style="background:rgba(16,185,129,0.06);">
                    <span><i class="bi bi-heart-fill text-success me-2"></i>${a.charityName}</span>
                    <strong style="color:#10b981;">${charityAmt.toLocaleString('vi-VN')}đ (${a.charityPercent}%)</strong>
                </div>
                <div class="col-12 d-flex justify-content-between align-items-center p-2 rounded-3"
                     style="background:rgba(99,102,241,0.06);">
                    <span><i class="bi bi-star-fill text-primary me-2"></i>${a.name}</span>
                    <strong style="color:#6366f1;">${celebAmt.toLocaleString('vi-VN')}đ (${a.celebrityPercent}%)</strong>
                </div>
                <div class="col-12 d-flex justify-content-between align-items-center p-2 rounded-3"
                     style="background:rgba(236,72,153,0.06);">
                    <span><i class="bi bi-building text-danger me-2"></i>EntConnect Platform</span>
                    <strong style="color:#ec4899;">${platAmt.toLocaleString('vi-VN')}đ (${a.platformPercent}%)</strong>
                </div>
            </div>
        </div>

        <!-- Payment Method Selection -->
        <div class="mb-4">
            <div class="fw-bold small text-uppercase mb-3" style="letter-spacing:0.5px;color:var(--text-muted);">
                <i class="bi bi-credit-card me-1"></i>Chọn phương thức thanh toán
            </div>
            <div class="row g-2" id="auc-method-list">
                ${[
                    { id: 'qr', icon: 'bi-qr-code-scan', label: 'QR/ATM', sub: 'Mã QR VietQR & ATM' },
                    { id: 'visa', icon: 'bi-credit-card-2-front-fill', label: 'Thẻ Visa/Master', sub: 'Thanh toán online' }
                ].map(m => `
                <div class="col-6">
                    <div class="payment-method-card ${m.id === 'qr' ? 'active' : ''} p-3 rounded-3 text-center"
                         style="cursor:pointer;border:2px solid ${m.id === 'qr' ? 'rgba(251,191,36,0.5)' : 'var(--border-color)'};background:${m.id === 'qr' ? 'rgba(251,191,36,0.06)' : 'var(--bg-panel)'};"
                         onclick="hirePayment.selectAucMethod('${m.id}')">
                        <i class="bi ${m.icon} fs-3 mb-1" style="color:${m.id === 'qr' ? '#fbbf24' : 'var(--text-muted)'}"></i>
                        <div class="fw-bold small">${m.label}</div>
                        <div class="text-muted" style="font-size:0.72rem;">${m.sub}</div>
                    </div>
                </div>`).join('')}
            </div>
        </div>

        <!-- Proceed Button -->
        <button class="btn w-100 py-3 rounded-3 fw-bold fs-5"
                style="background:linear-gradient(135deg,#fbbf24,#d97706);color:#0f172a;"
                onclick="hirePayment.renderAuctionStep2()">
            <i class="bi bi-arrow-right-circle-fill me-2"></i>Tiến hành thanh toán
        </button>`;
    },

    /** Select auction payment method */
    selectAucMethod(method) {
        this.auctionPayMethod = method;
        const cards = document.querySelectorAll('#auc-method-list .payment-method-card');
        cards.forEach(c => {
            c.style.border = '2px solid var(--border-color)';
            c.style.background = 'var(--bg-panel)';
            c.querySelector('i').style.color = 'var(--text-muted)';
        });
        const idx = method === 'qr' ? 0 : 1;
        if (cards[idx]) {
            cards[idx].style.border = '2px solid rgba(251,191,36,0.5)';
            cards[idx].style.background = 'rgba(251,191,36,0.06)';
            cards[idx].querySelector('i').style.color = '#fbbf24';
        }
    },

    /** Auction payment step 2: QR or Visa form */
    renderAuctionStep2() {
        const a = this.currentAuction;
        if (!a) return;
        const body = document.getElementById('hire-payment-body');
        if (!body) return;

        const total = a.currentBid || 0;
        const method = this.auctionPayMethod;
        const txCode = `AUCVIP${a._id.toUpperCase()}${Date.now().toString().slice(-6)}`;

        if (method === 'qr') {
            const qrData = `ENTCONNECT AUCTION ${a.name.toUpperCase()} | ${total.toLocaleString('vi-VN')}d | ${txCode}`;
            const qrUrl  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&ecc=M&bgcolor=1e293b&color=fbbf24`;

            body.innerHTML = `
            <div class="text-center mb-3">
                <div class="fw-bold font-outfit mb-1" style="color:#fbbf24;">Quét mã QR để thanh toán</div>
                <div class="text-muted small">Chuyển khoản tới tài khoản EntConnect</div>
            </div>

            <!-- QR Code -->
            <div class="text-center mb-3">
                <div class="d-inline-block p-3 rounded-4" style="background:#1e293b;border:2px solid rgba(251,191,36,0.3);">
                    <img src="${qrUrl}" alt="QR Đấu giá" width="180" height="180" class="rounded-3">
                </div>
            </div>

            <!-- Bank Details -->
            <div class="p-3 rounded-4 mb-3" style="background:var(--bg-panel);border:1px solid var(--border-color);">
                <div class="row g-2 small">
                    <div class="col-5 text-muted">Ngân hàng:</div>
                    <div class="col-7 fw-bold">${this.BANK_INFO.bankName}</div>
                    <div class="col-5 text-muted">Số tài khoản:</div>
                    <div class="col-7 fw-bold font-outfit" style="letter-spacing:1px;">${this.BANK_INFO.accountNumber}</div>
                    <div class="col-5 text-muted">Chủ tài khoản:</div>
                    <div class="col-7 fw-bold">${this.BANK_INFO.accountHolder}</div>
                    <div class="col-5 text-muted">Số tiền:</div>
                    <div class="col-7 fw-bold" style="color:#fbbf24;font-size:1.05rem;">${total.toLocaleString('vi-VN')}đ</div>
                    <div class="col-5 text-muted">Nội dung CK:</div>
                    <div class="col-7 fw-bold" style="color:#6366f1;font-size:0.85rem;">${txCode}</div>
                </div>
            </div>

            <div class="alert small mb-3" style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.15);color:var(--text-main);">
                <i class="bi bi-info-circle-fill text-warning me-1"></i>
                Vui lòng ghi đúng nội dung chuyển khoản <strong>${txCode}</strong> để hệ thống tự động xác nhận trong 5 phút.
            </div>

            <div class="d-flex gap-2">
                <button class="btn flex-grow-1 py-3 rounded-3 fw-bold"
                        style="background:linear-gradient(135deg,#fbbf24,#d97706);color:#0f172a;"
                        onclick="hirePayment.renderAuctionSuccess()">
                    <i class="bi bi-check-circle-fill me-2"></i>Đã chuyển khoản xong
                </button>
                <button class="btn btn-outline-secondary py-3 rounded-3 fw-bold px-4"
                        onclick="hirePayment.renderAuctionStep1()">
                    <i class="bi bi-arrow-left"></i>
                </button>
            </div>`;

        } else {
            // Visa form
            body.innerHTML = `
            <div class="text-center mb-3">
                <div class="fw-bold font-outfit mb-1" style="color:#fbbf24;">Thanh toán Thẻ Visa / Mastercard</div>
                <div class="text-muted small">Tổng: <strong style="color:#fbbf24;">${total.toLocaleString('vi-VN')}đ</strong></div>
            </div>

            <!-- Fake Visa Card Preview -->
            <div class="rounded-4 p-4 mb-4 position-relative overflow-hidden"
                 style="background:linear-gradient(135deg,#1a1a2e,#16213e,#0f3460);min-height:160px;border:1px solid rgba(251,191,36,0.2);">
                <div class="position-absolute top-0 end-0 m-3 opacity-25" style="font-size:3rem;">💳</div>
                <div class="text-muted small mb-2">EntConnect Secure Pay</div>
                <div class="fw-bold font-outfit mb-3" style="color:rgba(255,255,255,0.6);letter-spacing:3px;font-size:1.1rem;" id="vc-preview">•••• •••• •••• ••••</div>
                <div class="d-flex justify-content-between align-items-end">
                    <div>
                        <div class="text-muted" style="font-size:0.65rem;text-transform:uppercase;">Chủ thẻ</div>
                        <div class="text-white fw-bold small" id="vc-name-preview">TÊN CHỦ THẺ</div>
                    </div>
                    <div class="text-end">
                        <div class="text-muted" style="font-size:0.65rem;">Hết hạn</div>
                        <div class="text-white small" id="vc-exp-preview">MM/YY</div>
                    </div>
                </div>
            </div>

            <div class="row g-3 mb-3">
                <div class="col-12">
                    <label class="form-label small fw-bold text-muted">Số thẻ</label>
                    <input type="text" class="form-control rounded-3" placeholder="1234 5678 9012 3456" maxlength="19"
                           oninput="this.value=this.value.replace(/[^0-9]/g,'').replace(/(.{4})/g,'$1 ').trim();document.getElementById('vc-preview').textContent=this.value||'•••• •••• •••• ••••'">
                </div>
                <div class="col-7">
                    <label class="form-label small fw-bold text-muted">Tên chủ thẻ</label>
                    <input type="text" class="form-control rounded-3" placeholder="NGUYEN VAN A"
                           oninput="document.getElementById('vc-name-preview').textContent=this.value.toUpperCase()||'TÊN CHỦ THẺ'">
                </div>
                <div class="col-5">
                    <label class="form-label small fw-bold text-muted">Hết hạn</label>
                    <input type="text" class="form-control rounded-3" placeholder="MM/YY" maxlength="5"
                           oninput="document.getElementById('vc-exp-preview').textContent=this.value||'MM/YY'">
                </div>
                <div class="col-12">
                    <label class="form-label small fw-bold text-muted">CVV</label>
                    <input type="password" class="form-control rounded-3" placeholder="•••" maxlength="4">
                </div>
            </div>

            <div class="d-flex gap-2">
                <button class="btn flex-grow-1 py-3 rounded-3 fw-bold"
                        style="background:linear-gradient(135deg,#fbbf24,#d97706);color:#0f172a;"
                        onclick="hirePayment.renderAuctionSuccess()">
                    <i class="bi bi-shield-lock-fill me-2"></i>Xác nhận thanh toán ${total.toLocaleString('vi-VN')}đ
                </button>
                <button class="btn btn-outline-secondary py-3 rounded-3 fw-bold px-4"
                        onclick="hirePayment.renderAuctionStep1()">
                    <i class="bi bi-arrow-left"></i>
                </button>
            </div>`;
        }
    },

    /** Auction payment success + charity donation certificate */
    renderAuctionSuccess() {
        const a = this.currentAuction;
        if (!a) return;
        const body = document.getElementById('hire-payment-body');
        if (!body) return;

        const total = a.currentBid || 0;
        const charityAmt = Math.floor(total * a.charityPercent / 100);
        const celebAmt   = Math.floor(total * a.celebrityPercent / 100);
        const platAmt    = Math.floor(total * a.platformPercent / 100);
        const username   = window.auth?.user?.username || window.auth?.user?.name || 'Người đấu giá';
        const certCode   = `CERT-${Date.now().toString(36).toUpperCase()}`;
        const now        = new Date().toLocaleDateString('vi-VN', { year:'numeric', month:'long', day:'numeric' });

        body.innerHTML = `
        <!-- Success Header -->
        <div class="text-center mb-4">
            <div style="font-size:3rem;animation:cardFadeIn 0.5s ease;">🎉</div>
            <div class="fw-bold font-outfit fs-5 mt-2" style="color:#10b981;">Thanh toán thành công!</div>
            <div class="text-muted small">Buổi gặp mặt của bạn đã được xác nhận</div>
        </div>

        <!-- ★ CHARITY DONATION CERTIFICATE ★ -->
        <div class="donation-certificate-container mb-4" id="charity-certificate">
            <div class="cert-ribbon">🎗</div>

            <div class="text-center mb-3">
                <div class="cert-title fs-6 mb-1">Chứng Nhận Quyên Góp Từ Thiện</div>
                <div class="text-white-50 small">EntConnect VIP Charity Auction</div>
            </div>

            <hr style="border-color:rgba(251,191,36,0.2);margin:12px 0;">

            <div class="text-center mb-3">
                <div class="text-white-50 small mb-1">Người quyên góp</div>
                <div class="cert-name">${username}</div>
            </div>

            <div class="text-center mb-3">
                <div class="text-white-50 small mb-1">đã quyên góp</div>
                <div class="cert-amount">${charityAmt.toLocaleString('vi-VN')}đ</div>
                <div class="text-white-50 small mt-1">(${a.charityPercent}% của ${total.toLocaleString('vi-VN')}đ)</div>
            </div>

            <div class="text-center mb-3">
                <div class="text-white-50 small mb-1">đến quỹ từ thiện</div>
                <div class="fw-bold" style="color:#10b981;font-size:0.95rem;">❤️ ${a.charityName}</div>
            </div>

            <hr style="border-color:rgba(251,191,36,0.2);margin:12px 0;">

            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <div class="text-white-50" style="font-size:0.65rem;text-transform:uppercase;">Thông qua buổi gặp mặt</div>
                    <div class="small fw-bold" style="color:#fbbf24;">${a.name}</div>
                    <div class="text-white-50" style="font-size:0.7rem;">${now}</div>
                    <div class="text-white-50 mt-1" style="font-size:0.6rem;font-family:'Outfit',monospace;">${certCode}</div>
                </div>
                <div class="cert-stamp">
                    <div class="text-center" style="line-height:1.2;font-size:0.55rem;">
                        ✓ ĐÃ<br>XÁC<br>NHẬN
                    </div>
                </div>
            </div>
        </div>

        <!-- Full Payment Summary -->
        <div class="p-3 rounded-4 mb-3" style="background:var(--bg-panel);border:1px solid var(--border-color);">
            <div class="fw-bold small mb-2 text-muted" style="text-transform:uppercase;">Tóm tắt thanh toán</div>
            <div class="row g-1 small">
                <div class="col-6 text-muted">Tổng đã thanh toán:</div>
                <div class="col-6 fw-bold text-end" style="color:#fbbf24;">${total.toLocaleString('vi-VN')}đ</div>
                <div class="col-6 text-muted">Từ thiện (${a.charityPercent}%):</div>
                <div class="col-6 fw-bold text-end" style="color:#10b981;">+${charityAmt.toLocaleString('vi-VN')}đ</div>
                <div class="col-6 text-muted">${a.name} (${a.celebrityPercent}%):</div>
                <div class="col-6 fw-bold text-end" style="color:#6366f1;">+${celebAmt.toLocaleString('vi-VN')}đ</div>
                <div class="col-6 text-muted">EntConnect (${a.platformPercent}%):</div>
                <div class="col-6 fw-bold text-end" style="color:#ec4899;">+${platAmt.toLocaleString('vi-VN')}đ</div>
            </div>
        </div>

        <!-- Actions -->
        <div class="d-flex gap-2">
            <button class="btn flex-grow-1 py-3 rounded-3 fw-bold"
                    style="background:linear-gradient(135deg,#10b981,#059669);color:white;"
                    onclick="hirePayment.downloadCertificate()">
                <i class="bi bi-download me-2"></i>Lưu chứng nhận
            </button>
            <button class="btn btn-outline-secondary py-3 rounded-3 fw-bold px-4"
                    data-bs-dismiss="modal">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>`;

        api.toast('🏆 Thanh toán đấu giá thành công! Chúc bạn có buổi gặp mặt tuyệt vời!', 'success');
    },

    /** "Download" certificate – opens print dialog on certificate element */
    downloadCertificate() {
        const cert = document.getElementById('charity-certificate');
        if (!cert) return;
        // Simple print approach
        const w = window.open('', '_blank');
        w.document.write(`<html><head><title>Chứng nhận từ thiện EntConnect</title>
        <style>
            body{margin:0;padding:20px;background:#0f172a;font-family:'Outfit',sans-serif;color:#f8fafc;}
            .cert{border:4px double #d97706;border-radius:20px;padding:30px;max-width:500px;margin:auto;background:linear-gradient(135deg,#1e293b,#0f172a);}
            h2{color:#fbbf24;text-align:center;}p{text-align:center;}
            .amount{font-size:2rem;color:#fbbf24;font-weight:800;}
            .charity{color:#10b981;font-weight:700;}
        </style></head><body>
        <div class="cert">
            <h2>🎗 CHỨNG NHẬN QUYÊN GÓP TỪ THIỆN</h2>
            ${cert.innerHTML}
        </div>
        <script>window.onload=()=>{window.print();}<\/script>
        </body></html>`);
        w.document.close();
    }
};

window.hirePayment = hirePayment;

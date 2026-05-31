/**
 * EntConnect - Authentication Controller V2
 * Handles premium modals injection, user state consistency, and security
 */

const auth = {
    user: null,

    init() {
        this.injectModals();
        this.checkLoginStatus();
        this.setupForms();
        this.setupToggles();
    },

    /**
     * Safely open a Bootstrap modal by ID
     */
    showModal(id) {
        try {
            const el = document.getElementById(id);
            if (!el) {
                console.error(`[Auth] Modal #${id} not found in DOM`);
                return;
            }
            if (window.bootstrap && bootstrap.Modal) {
                const instance = bootstrap.Modal.getOrCreateInstance(el);
                instance.show();
            } else {
                console.warn('[Auth] Bootstrap JS not loaded, trying native click fallback');
                const trigger = document.querySelector(`[data-bs-target="#${id}"]`);
                if (trigger) trigger.click();
            }
        } catch (err) {
            console.error(`[Auth] Error opening modal #${id}:`, err);
        }
    },

    /**
     * Sync user state from LocalStorage or API
     */
    async checkLoginStatus() {
        const token = api.getToken();
        if (token) {
            try {
                // Try API first
                const res = await api.request('/users/me');
                if (res.success) {
                    this.user = res.data;
                    localStorage.setItem('user', JSON.stringify(this.user));
                    this.updateAuthUI(true);
                } else {
                    this.logout(false);
                }
            } catch (err) {
                // Fallback to offline storage
                const saved = localStorage.getItem('user');
                if (saved) {
                    this.user = JSON.parse(saved);
                    this.updateAuthUI(true);
                } else {
                    this.logout(false);
                }
            }
        } else {
            this.updateAuthUI(false);
        }
    },

    /**
     * UI State switcher for Navbar & Auth sections
     */
    updateAuthUI(isLoggedIn) {
        const guestUI = document.querySelectorAll('.auth-guest');
        const userUI = document.querySelectorAll('.auth-user');
        
        if (isLoggedIn && this.user) {
            guestUI.forEach(el => el.classList.add('d-none'));
            userUI.forEach(el => el.classList.remove('d-none'));
            
            // Sync values
            document.querySelectorAll('.current-username').forEach(el => el.textContent = this.user.username);
            document.querySelectorAll('.current-user-avatar').forEach(el => {
                el.src = this.user.avatar || this.user.profile?.avatar || `https://ui-avatars.com/api/?name=${this.user.username}&background=6366f1&color=fff`;
            });
            
            // RBAC UI Update
            const adminNavs = document.querySelectorAll('.admin-only');
            if (this.user.role === 'admin' || this.user.role === 'staff') {
                adminNavs.forEach(el => el.classList.remove('d-none'));
            } else {
                adminNavs.forEach(el => el.classList.add('d-none'));
            }
        } else {
            guestUI.forEach(el => el.classList.remove('d-none'));
            userUI.forEach(el => el.classList.add('d-none'));
            document.querySelectorAll('.admin-only').forEach(el => el.classList.add('d-none'));
        }
    },

    /**
     * Login logic with Toast feedback
     */
    async handleLogin(e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.target).entries());

        try {
            // Mock login for demo if no backend works
            let usersLocal = JSON.parse(localStorage.getItem('ent_users_db') || '[]');
            const foundUser = usersLocal.find(u => u.email === data.email && u.password === data.password);

            if (foundUser || (data.email === 'admin@gmail.com' && data.password === '123456')) {
                 const mockUser = foundUser || { username: 'admin', email: 'admin@gmail.com', profile: { fullName: 'Admin User' }, role: 'admin' };
                 if (!mockUser.role) mockUser.role = (mockUser.email === 'admin@gmail.com') ? 'admin' : 'user';
                 
                 api.setToken('mock-token-123');
                 localStorage.setItem('user', JSON.stringify(mockUser));
                 api.toast('Đăng nhập thành công!', 'success');
                 setTimeout(() => location.reload(), 1000);
                 return;
            }

            const res = await api.request('/users/login', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (res.success) {
                api.setToken(res.data.token);
                this.user = res.data.user;
                localStorage.setItem('user', JSON.stringify(this.user));
                api.toast('Chào mừng trở lại!', 'success');
                setTimeout(() => location.reload(), 1000);
            }
        } catch (err) {
            api.toast(err.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin.', 'danger');
        }
    },

    logout(withToast = true) {
        api.removeToken();
        localStorage.removeItem('user');
        this.user = null;
        if (withToast) api.toast('Đã đăng xuất.', 'info');
        setTimeout(() => window.location.href = '/', 500);
    },

    async handleRegister(e) {
        const data = Object.fromEntries(new FormData(e.target).entries());
        try {
            let usersLocal = JSON.parse(localStorage.getItem('ent_users_db') || '[]');
            if (usersLocal.find(u => u.email === data.email)) {
                api.toast('Email này đã được đăng ký!', 'warning');
                return;
            }
            
            const newUser = {
                id: 'u' + Date.now(),
                username: data.username,
                email: data.email,
                password: data.password,
                role: 'user', // Default role
                profile: { fullName: data.username, avatar: `https://ui-avatars.com/api/?name=${data.username}&background=6366f1&color=fff` },
                avatar: `https://ui-avatars.com/api/?name=${data.username}&background=6366f1&color=fff`,
                interests: [],
                bio: 'Thành viên mới'
            };
            
            usersLocal.push(newUser);
            localStorage.setItem('ent_users_db', JSON.stringify(usersLocal));
            
            // Auto login
            api.setToken('mock-token-' + newUser.id);
            this.user = newUser;
            localStorage.setItem('user', JSON.stringify(this.user));
            
            api.toast('Đăng ký thành công! Chào mừng bạn.', 'success');
            setTimeout(() => location.reload(), 1000);
        } catch (err) {
            api.toast('Lỗi đăng ký.', 'danger');
        }
    },

    /**
     * Premium Modal Injection
     */
    injectModals() {
        if (document.getElementById('loginModal')) return;

        const modals = `
            <div class="modal fade" id="loginModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-panel border-0 shadow-premium rounded-4 overflow-hidden">
                        <div class="modal-body p-5">
                            <div class="text-center mb-5">
                                <i class="bi bi-shield-lock-fill text-primary display-4 mb-3 d-block"></i>
                                <h2 class="fw-bold mb-1">Chào mừng!</h2>
                                <p class="text-muted">Đăng nhập để kết nối với cộng đồng.</p>
                            </div>
                            <form id="form-login">
                                <div class="mb-3">
                                    <label class="form-label fw-bold small">EMAIL</label>
                                    <input type="email" name="email" class="form-control bg-light border-0 py-3 rounded-3" 
                                           placeholder="user@example.com" required>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label fw-bold small">MẬT KHẨU</label>
                                    <input type="password" name="password" class="form-control bg-light border-0 py-3 rounded-3" 
                                           placeholder="••••••••" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100 py-3 rounded-3 mb-4">Đăng nhập ngay</button>
                                <p class="text-center small mb-0">Chưa có tài khoản? <a href="#" class="text-primary fw-bold" 
                                   data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#registerModal">Đăng ký miễn phí</a></p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal fade" id="registerModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content glass-panel border-0 shadow-premium rounded-4 overflow-hidden">
                        <div class="modal-body p-5">
                            <div class="text-center mb-5">
                                <h2 class="fw-bold mb-1">Tham gia ngay</h2>
                                <p class="text-muted">Bắt đầu hành trình kết nối của bạn.</p>
                            </div>
                            <form id="form-register">
                                <div class="mb-3">
                                    <label class="form-label fw-bold small">TÊN CỦA BẠN</label>
                                    <input type="text" name="username" class="form-control bg-light border-0 py-3 rounded-3" required>
                                </div>
                                <div class="mb-3">
                                    <label class="form-label fw-bold small">EMAIL</label>
                                    <input type="email" name="email" class="form-control bg-light border-0 py-3 rounded-3" required>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label fw-bold small">MẬT KHẨU (Tối thiểu 6 ký tự)</label>
                                    <input type="password" name="password" class="form-control bg-light border-0 py-3 rounded-3" minlength="6" required>
                                </div>
                                <button type="submit" class="btn btn-primary w-100 py-3 rounded-3 mb-4">Đăng ký thành viên</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modals);
    },

    setupForms() {
        // Use document-level delegation to catch submissions from injected modals
        document.addEventListener('submit', (e) => {
            const formId = e.target.id;
            
            if (formId === 'form-login') {
                e.preventDefault();
                this.handleLogin(e);
            }
            
            if (formId === 'form-register') {
                e.preventDefault();
                this.handleRegister(e);
            }
        });
    },

    /**
     * Intercept all auth-related clicks (Logout, Toggles)
     */
    setupToggles() {
        document.addEventListener('click', (e) => {
            // Logout handler
            if (e.target.id === 'btnLogout' || e.target.closest('#btnLogout')) {
                e.preventDefault();
                this.logout();
            }
            
            // Manual Modal Trigger Handlers (for buttons that don't use data-bs-toggle correctly)
            const modalToggle = e.target.closest('[data-modal-trigger]');
            if (modalToggle) {
                e.preventDefault();
                this.showModal(modalToggle.dataset.modalTrigger);
            }
        });
    }
};

// Auto start
auth.init();
window.auth = auth;

import { adminStats, adminUsers, adminEvents, adminBookings, adminReports, adminLogs } from './utils/admin-mock.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Security
    if (!window.rbac) {
        console.error("RBAC module not loaded!");
        return;
    }
    
    // Require staff or admin to view this page
    if (!window.rbac.requireStaff()) return;

    // 2. Setup Topbar
    setupTopbar();

    // 3. Setup Tabs
    setupTabs();

    // 4. Render Data
    renderOverview();
    renderUsers();
    renderEvents();
    renderBookings();
    renderReports();
    renderLogs();

    // 5. Global Confirmation Modal setup
    window.confirmAction = (title, message, callback) => {
        document.getElementById('confirmModalTitle').innerText = title;
        document.getElementById('confirmModalMsg').innerText = message;
        
        const btn = document.getElementById('btnConfirmAction');
        // Replace node to clear old event listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('adminConfirmModal'));
            modal.hide();
            callback();
        });

        const modal = new bootstrap.Modal(document.getElementById('adminConfirmModal'));
        modal.show();
    };

    // 6. Toast Utility
    window.showAdminToast = (message, type = 'success') => {
        const container = document.getElementById('adminToastContainer');
        const bgClass = type === 'success' ? 'bg-success' : (type === 'danger' ? 'bg-danger' : 'bg-primary');
        const toastId = 'toast-' + Date.now();
        
        const html = `
            <div id="${toastId}" class="toast align-items-center text-white ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body fw-bold">
                        ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        const toastEl = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    };
});

function setupTopbar() {
    const user = window.auth?.user || JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('adminName').innerText = user.username || 'Admin';
        if (user.avatar) document.getElementById('adminAvatar').src = user.avatar;
    }

    document.getElementById('btnLogoutAdmin').addEventListener('click', () => {
        if (window.auth) window.auth.logout();
        else {
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    });
}

function setupTabs() {
    const navItems = document.querySelectorAll('.admin-nav-item');
    const tabContents = document.querySelectorAll('.admin-tab-content');

    window.switchTab = (tabId) => {
        navItems.forEach(nav => nav.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        const targetNav = document.querySelector(`.admin-nav-item[data-tab="${tabId}"]`);
        const targetContent = document.getElementById(`tab-${tabId}`);

        if (targetNav) targetNav.classList.add('active');
        if (targetContent) targetContent.classList.add('active');
        
        // Hide sidebar on mobile after click
        if (window.innerWidth <= 768) {
            document.getElementById('adminSidebar').classList.remove('show');
        }
    };

    navItems.forEach(nav => {
        nav.addEventListener('click', () => {
            switchTab(nav.getAttribute('data-tab'));
        });
    });
}

function renderOverview() {
    // Render Stats
    document.getElementById('statTotalUsers').innerText = adminStats.totalUsers;
    document.getElementById('statTotalEvents').innerText = adminStats.totalEvents;
    document.getElementById('statTotalRevenue').innerText = adminStats.totalRevenue + 'đ';
    document.getElementById('statPendingReports').innerText = adminStats.pendingReports;

    // Render Recent Logs Preview
    const tbody = document.getElementById('overviewLogsTableBody');
    tbody.innerHTML = adminLogs.slice(0, 4).map(log => `
        <tr>
            <td class="text-muted small">${log.time}</td>
            <td class="fw-bold">${log.actor}</td>
            <td><span class="badge bg-light text-dark border">${log.action}</span></td>
            <td>${log.target}</td>
        </tr>
    `).join('');
}

function renderUsers() {
    const tbody = document.getElementById('usersTableBody');
    const isAdmin = window.rbac.isAdmin();
    
    tbody.innerHTML = adminUsers.map(user => {
        let statusBadge = user.status === 'active' ? '<span class="admin-badge active">Hoạt động</span>' 
                        : (user.status === 'banned' ? '<span class="admin-badge banned">Bị khoá</span>' 
                        : '<span class="admin-badge warned">Cảnh báo</span>');
        
        let roleBadge = user.role === 'admin' ? '<span class="admin-badge admin">Admin</span>'
                      : (user.role === 'staff' ? '<span class="admin-badge staff">Staff</span>'
                      : '<span class="admin-badge user">User</span>');
                      
        let actions = '';
        if (isAdmin) {
            if (user.status === 'banned') {
                actions = `<button class="btn btn-sm btn-success rounded-pill px-3" onclick="handleUnlockUser('${user.id}')">Mở khoá</button>`;
            } else {
                actions = `<button class="btn btn-sm btn-outline-danger rounded-pill px-3" onclick="handleLockUser('${user.id}')">Khoá</button>`;
            }
        } else {
            actions = `<span class="text-muted small">Không có quyền</span>`;
        }

        return `
            <tr>
                <td class="text-muted fw-bold">#${user.id}</td>
                <td>
                    <div class="fw-bold">${user.name}</div>
                    <div class="small text-muted">${user.email}</div>
                </td>
                <td>${roleBadge}</td>
                <td>${statusBadge}</td>
                <td class="text-muted">${user.joined}</td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

function renderEvents() {
    const tbody = document.getElementById('eventsTableBody');
    tbody.innerHTML = adminEvents.map(ev => {
        let statusBadge = ev.status === 'approved' ? '<span class="admin-badge approved">Đã duyệt</span>' 
                        : (ev.status === 'rejected' ? '<span class="admin-badge rejected">Từ chối</span>' 
                        : '<span class="admin-badge pending">Chờ duyệt</span>');
        
        let actions = '';
        if (ev.status === 'pending') {
            actions = `
                <button class="btn btn-sm btn-success rounded-circle me-1" onclick="handleApproveEvent('${ev.id}')"><i class="bi bi-check"></i></button>
                <button class="btn btn-sm btn-danger rounded-circle" onclick="handleRejectEvent('${ev.id}')"><i class="bi bi-x"></i></button>
            `;
        } else {
            actions = `<button class="btn btn-sm btn-outline-secondary rounded-pill">Xem chi tiết</button>`;
        }

        return `
            <tr>
                <td class="text-muted fw-bold">${ev.id}</td>
                <td class="fw-bold">${ev.title}</td>
                <td>${ev.author}</td>
                <td><span class="badge bg-light text-dark border">${ev.category}</span></td>
                <td>${statusBadge}</td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

function renderBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    tbody.innerHTML = adminBookings.map(b => {
        let statusBadge = b.status === 'completed' ? '<span class="admin-badge approved">Hoàn thành</span>' 
                        : (b.status === 'cancelled' ? '<span class="admin-badge rejected">Đã hủy</span>' 
                        : '<span class="admin-badge pending">Đang chờ</span>');
        
        return `
            <tr>
                <td class="text-muted fw-bold">${b.id}</td>
                <td class="fw-bold">${b.user}</td>
                <td class="fw-bold">${b.target}</td>
                <td>${b.service}</td>
                <td class="text-primary fw-bold">${b.amount}</td>
                <td>${statusBadge}</td>
                <td><button class="btn btn-sm btn-outline-primary rounded-pill">Tra soát</button></td>
            </tr>
        `;
    }).join('');
}

function renderReports() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = adminReports.map(r => {
        let statusBadge = r.status === 'resolved' ? '<span class="admin-badge approved">Đã xử lý</span>' 
                        : '<span class="admin-badge pending">Đang chờ</span>';
        
        let actions = r.status === 'pending' 
            ? `<button class="btn btn-sm btn-primary rounded-pill" onclick="handleResolveReport('${r.id}')">Xử lý ngay</button>`
            : `<span class="text-success small fw-bold"><i class="bi bi-check2-all"></i> Đã đóng</span>`;

        return `
            <tr>
                <td class="text-muted fw-bold">${r.id}</td>
                <td><span class="badge bg-dark">${r.targetType.toUpperCase()}</span></td>
                <td class="fw-bold text-danger">${r.targetId}</td>
                <td>${r.reason}</td>
                <td class="text-muted">${r.reporter}</td>
                <td>${statusBadge}</td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

function renderLogs() {
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = adminLogs.map(log => `
        <tr>
            <td class="text-muted">${log.time}</td>
            <td class="fw-bold">${log.actor}</td>
            <td><span class="badge bg-light text-dark border">${log.action}</span></td>
            <td>${log.target}</td>
        </tr>
    `).join('');
}

// Action Handlers
window.handleLockUser = (userId) => {
    window.confirmAction('Khóa Tài Khoản', `Bạn có chắc muốn KHÓA tài khoản #${userId} không? Họ sẽ không thể đăng nhập.`, () => {
        window.showAdminToast(`Đã khóa thành công tài khoản ${userId}!`);
        // Mock update UI
        const user = adminUsers.find(u => u.id === userId);
        if(user) user.status = 'banned';
        renderUsers();
    });
};

window.handleUnlockUser = (userId) => {
    window.confirmAction('Mở Khóa Tài Khoản', `Bạn sẽ mở khóa cho tài khoản #${userId}?`, () => {
        window.showAdminToast(`Đã khôi phục tài khoản ${userId}!`);
        const user = adminUsers.find(u => u.id === userId);
        if(user) user.status = 'active';
        renderUsers();
    });
};

window.handleApproveEvent = (eventId) => {
    window.confirmAction('Duyệt Sự Kiện', `Chấp thuận sự kiện #${eventId} để hiển thị công khai?`, () => {
        window.showAdminToast(`Sự kiện ${eventId} đã được duyệt!`);
        const ev = adminEvents.find(e => e.id === eventId);
        if(ev) ev.status = 'approved';
        renderEvents();
    });
};

window.handleRejectEvent = (eventId) => {
    window.confirmAction('Từ Chối Sự Kiện', `Bạn có chắc muốn TỪ CHỐI sự kiện #${eventId}?`, () => {
        window.showAdminToast(`Đã từ chối sự kiện ${eventId}!`, 'danger');
        const ev = adminEvents.find(e => e.id === eventId);
        if(ev) ev.status = 'rejected';
        renderEvents();
    });
};

window.handleResolveReport = (reportId) => {
    window.confirmAction('Xử Lý Báo Cáo', `Đánh dấu báo cáo #${reportId} đã được giải quyết?`, () => {
        window.showAdminToast(`Báo cáo ${reportId} đã đóng!`);
        const rp = adminReports.find(r => r.id === reportId);
        if(rp) rp.status = 'resolved';
        renderReports();
    });
};

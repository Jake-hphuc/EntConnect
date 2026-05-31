// socket-client.js
// Handles real-time notifications via Socket.io

let socket;
const notificationList = document.getElementById('notificationList');
const notificationBadge = document.getElementById('notificationBadge');

function initSocketClient() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) return;

    // Use existing socket if available, or create new one
    socket = io('http://localhost:5000', {
        auth: { token }
    });

    socket.on('connect', () => {
        console.log('✅ Connected to socket server for notifications');
        // Tham gia phòng cá nhân để nhận thông báo
        socket.emit('join_user', { userId: user._id || user.id });
    });

    socket.on('new_notification', (data) => {
        console.log('🔔 New Notification:', data);
        renderNotification(data);
        showBadge();
        showToast(data.title, data.message);
    });
}

function renderNotification(notif) {
    if (!notificationList) return;

    // Xóa dòng "Không có thông báo mới" nếu có
    if (notificationList.innerText.includes('Không có thông báo mới')) {
        notificationList.innerHTML = '';
    }

    const icons = {
        'registration': '<i class="bi bi-person-plus-fill text-success fs-4"></i>',
        'chat': '<i class="bi bi-chat-dots-fill text-primary fs-4"></i>',
        'hire': '<i class="bi bi-briefcase-fill text-warning fs-4"></i>',
        'badge': '<i class="bi bi-award-fill text-danger fs-4"></i>'
    };

    const icon = icons[notif.type] || '<i class="bi bi-bell-fill text-secondary fs-4"></i>';

    const item = document.createElement('a');
    item.href = "#";
    item.className = 'dropdown-item d-flex align-items-center gap-3 p-3 border-bottom text-wrap';
    item.innerHTML = `
        <div class="flex-shrink-0">
            ${icon}
        </div>
        <div class="flex-grow-1">
            <h6 class="mb-1 fw-bold text-dark" style="font-size: 0.9rem;">${notif.title}</h6>
            <p class="mb-0 text-muted small" style="font-size: 0.8rem; line-height: 1.4;">${notif.message}</p>
            <small class="text-primary mt-1 d-block" style="font-size: 0.7rem;">Vừa xong</small>
        </div>
    `;

    notificationList.prepend(item);
}

function showBadge() {
    if (notificationBadge) {
        notificationBadge.classList.remove('d-none');
    }
}

function showToast(title, message) {
    // Tạo container nếu chưa có
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }

    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-bg-primary border-0 show';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <strong>${title}</strong><br>
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    toastContainer.appendChild(toastEl);

    // Tự động tắt sau 5s
    setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => toastEl.remove(), 300);
    }, 5000);
}

// Xóa badge khi mở dropdown
document.addEventListener('DOMContentLoaded', () => {
    initSocketClient();

    const bellBtn = document.getElementById('notificationBellBtn');
    if (bellBtn) {
        bellBtn.addEventListener('click', () => {
            if (notificationBadge) {
                notificationBadge.classList.add('d-none');
            }
        });
    }
});

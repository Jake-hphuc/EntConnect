/**
 * EntConnect - Role-Based Access Control (RBAC) Module
 */

window.rbac = {
    roles: {
        GUEST: 'guest',
        USER: 'user',
        STAFF: 'staff',
        ADMIN: 'admin'
    },

    getCurrentRole() {
        if (!window.auth || !window.auth.user) {
            // Try to get from localStorage as fallback if auth isn't fully initialized
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const user = JSON.parse(storedUser);
                    return user.role || this.roles.USER;
                } catch(e) {
                    return this.roles.GUEST;
                }
            }
            return this.roles.GUEST;
        }
        return window.auth.user.role || this.roles.USER;
    },

    isGuest() {
        return this.getCurrentRole() === this.roles.GUEST;
    },

    isUser() {
        return this.getCurrentRole() === this.roles.USER;
    },

    isStaff() {
        const role = this.getCurrentRole();
        return role === this.roles.STAFF || role === this.roles.ADMIN; // Admin is also staff
    },

    isAdmin() {
        return this.getCurrentRole() === this.roles.ADMIN;
    },

    hasPermission(action) {
        const role = this.getCurrentRole();
        if (role === this.roles.ADMIN) return true; // Admin can do everything
        
        const permissions = {
            'guest': ['view_public'],
            'user': ['view_public', 'post_content', 'book_service', 'join_event', 'chat'],
            'staff': ['view_public', 'post_content', 'book_service', 'join_event', 'chat', 'view_admin_panel', 'approve_post', 'hide_post', 'view_reports', 'warn_user']
        };

        const rolePermissions = permissions[role] || [];
        return rolePermissions.includes(action);
    },

    requireStaff() {
        if (!this.isStaff()) {
            alert('Bạn không có quyền truy cập trang này!');
            window.location.href = '/';
            return false;
        }
        return true;
    },

    requireAdmin() {
        if (!this.isAdmin()) {
            alert('Trang này yêu cầu quyền Quản trị viên cấp cao!');
            window.location.href = '/';
            return false;
        }
        return true;
    }
};

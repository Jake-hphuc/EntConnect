/**
 * EntConnect - API Client Wrapper
 * Centralized fetch logic with automatic token handling and toast notifications
 */

const API_CONFIG = {
    BASE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/api'
        : '/api',
    STORAGE_URL: (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'http://localhost:5000'
        : '',
    TIMEOUT: 10000
};

const api = {
    /**
     * Get JWT token from storage
     */
    getToken: () => localStorage.getItem('token'),
    
    /**
     * Store JWT token
     */
    setToken: (token) => localStorage.setItem('token', token),
    
    /**
     * Clear JWT token
     */
    removeToken: () => localStorage.removeItem('token'),

    /**
     * Core Fetch wrapper
     * @param {string} endpoint - API path (e.g. /events)
     * @param {object} options - Fetch options (method, body, headers)
     * @returns {Promise<any>}
     */
    async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        
        // Prepare Headers
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Build Config
        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            // Handle Empty or JSON content
            const contentType = response.headers.get('content-type');
            let data = {};
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            }
            
            // Handle HTTP errors
            if (!response.ok) {
                const errorMsg = data.message || `Lỗi ${response.status}: ${response.statusText}`;
                throw new Error(errorMsg);
            }
            
            return data;
        } catch (error) {
            console.error(`[API ERROR] ${endpoint}:`, error.message);
            throw error; // Let UI handle specific errors
        }
    },

    /**
     * Premium Toast Notification System
     * @param {string} message - Content to show
     * @param {string} type - bootstrap color type (success, danger, info, warning)
     */
    toast(message, type = 'info') {
        const containerId = 'toast-container-dynamic';
        let container = document.getElementById(containerId);
        
        // Create container if missing
        if (!container) {
            container = document.createElement('div');
            container.id = containerId;
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        // Set Icon and Color based on type
        const icon = this._getToastIcon(type);
        const bgColor = `bg-${type === 'info' ? 'primary' : type}`;

        const toastId = 'toast-' + Date.now();
        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center text-white ${bgColor} border-0 shadow-lg rounded-4 overflow-hidden" 
                 role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex p-2">
                    <div class="toast-body d-flex align-items-center">
                        <i class="bi ${icon} me-3 fs-5"></i>
                        <span class="fw-medium">${message}</span>
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                            data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', toastHtml);
        const toastEl = document.getElementById(toastId);
        
        // Auto-show and auto-remove
        if (window.bootstrap && window.bootstrap.Toast) {
            const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
            bsToast.show();
            toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
        } else {
            // Fallback for non-bootstrap environments
            setTimeout(() => toastEl.remove(), 4500);
        }
    },

    /**
     * Internal helper for toast icons
     */
    _getToastIcon(type) {
        switch(type) {
            case 'success': return 'bi-check-circle-fill';
            case 'danger': return 'bi-exclamation-triangle-fill';
            case 'warning': return 'bi-exclamation-circle-fill';
            default: return 'bi-info-circle-fill';
        }
    }
};

window.api = api;

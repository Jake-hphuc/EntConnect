/**
 * EntConnect - Community Chat Room (Discord-style)
 * Features:
 *  - Sidebar with channel list (#gaming, #karaoke, #tìm-bạn, #ăn-uống)
 *  - Message bubbles with avatar, username, time
 *  - User messages → right, other users → left
 *  - localStorage persistence per channel
 *  - Fake realtime messages via setInterval
 *  - Emoji support, @username highlighting
 *  - Quick-suggestion buttons
 *  - Anti-spam (1s rate limit, 200 char max)
 *  - Online/offline user list
 *  - Responsive & animated
 */

const chatRoom = {
    currentChannel: 'gaming',
    currentUser: null,
    isOpen: false,
    lastSentTime: 0,
    fakeInterval: null,
    RATE_LIMIT: 1500, // ms between sends
    MAX_LENGTH: 200,

    // --- Mock Data ---
    mockUsers: [
        { username: 'GamerPro_VN', avatar: 'https://i.pravatar.cc/40?u=gamer01', status: 'online' },
        { username: 'KaraokeQueen', avatar: 'https://i.pravatar.cc/40?u=karaoke2', status: 'online' },
        { username: 'FoodieHCM', avatar: 'https://i.pravatar.cc/40?u=foodie3', status: 'offline' },
        { username: 'TravelBoy', avatar: 'https://i.pravatar.cc/40?u=travel4', status: 'online' },
        { username: 'MusicLover99', avatar: 'https://i.pravatar.cc/40?u=music5', status: 'offline' },
        { username: 'BoardgameFan', avatar: 'https://i.pravatar.cc/40?u=board6', status: 'online' },
        { username: 'CafeAddict', avatar: 'https://i.pravatar.cc/40?u=cafe7', status: 'online' },
        { username: 'SportsFan_SG', avatar: 'https://i.pravatar.cc/40?u=sport8', status: 'online' }
    ],

    channels: [
        { id: 'gaming',  name: '#gaming',   icon: '🎮', color: '#6366f1' },
        { id: 'karaoke', name: '#karaoke',  icon: '🎤', color: '#f59e0b' },
        { id: 'tim-ban', name: '#tìm-bạn',  icon: '🤝', color: '#10b981' },
        { id: 'an-uong', name: '#ăn-uống',  icon: '🍕', color: '#ef4444' }
    ],

    fakeMessages: {
        gaming: [
            'Ai muốn rank Liên Quân tối nay không?',
            'Mới mua skin mới xịn lắm 🔥',
            'Có ai chơi Valorant không ạ?',
            'GG! Vừa thắng rank 😂',
            'Team thiếu 1 người nè, ai vô không?',
            'Game hay quá trời! 👍',
            'Ai biết build tướng mới không?',
            'Stream tối nay lúc 8h nhé mọi người!'
        ],
        karaoke: [
            'Ai muốn karaoke tối nay?',
            'Hát bài gì hay nhỉ? 🎵',
            'Vừa hát xong, vui quá! ❤️',
            'Phòng karaoke quận 1 giảm giá nè',
            'Ai biết quán nào mic hay không?',
            'Song ca đi mọi ơi! 🎤',
            'Nhạc Sơn Tùng mới ra hay quá!',
            'Weekend này tụ tập karaoke không?'
        ],
        'tim-ban': [
            'Mình mới tham gia, ai kết bạn không? 😊',
            'Có ai ở Sài Gòn không ạ?',
            'Mình thích chơi game và cà phê ☕',
            'Ai muốn đi hiking cuối tuần?',
            'Tìm bạn cùng sở thích du lịch!',
            'Hello mọi người! Mình từ Hà Nội 👋',
            'Ai thích boardgame ở đây không?',
            'Mình muốn tìm nhóm chạy bộ buổi sáng!'
        ],
        'an-uong': [
            'Quán mới mở ngon lắm mọi ơi!',
            'Ai biết chỗ nào bán phở ngon không?',
            'Vừa ăn buffet xong, no quá 😂',
            'Quán cà phê quận 3 view đẹp nè! ☕',
            'Ai muốn đi ăn lẩu tối nay?',
            'Gợi ý quán ăn vặt giá rẻ đi!',
            'Bánh mì chỗ này ngon nhất Sài Gòn! 🍞',
            'Trà sữa mới ngon lắm luôn ❤️'
        ]
    },

    quickPrompts: [
        { icon: '🎮', text: 'Ai chơi game không?', label: 'Chơi game' },
        { icon: '☕', text: 'Ai đi cafe không?', label: 'Đi cafe' },
        { icon: '🎤', text: 'Karaoke không mọi ơi?', label: 'Karaoke' },
        { icon: '🤝', text: 'Ai muốn kết bạn không?', label: 'Kết bạn' }
    ],

    emojiList: ['😀', '😂', '😍', '🤣', '❤️', '👍', '🔥', '🎉', '😎', '🤔', '😢', '👋', '💪', '🙏', '✨', '🎮', '🎤', '☕', '🍕', '⚽'],

    // ===========================
    // INITIALIZATION
    // ===========================
    init() {
        console.log('ChatRoom: Initializing Community Chat...');
        
        // Get current user from auth or create default
        const authUser = window.auth?.user;
        this.currentUser = {
            username: authUser?.username || 'Bạn',
            avatar: authUser?.avatar || 'https://i.pravatar.cc/40?u=currentuser',
            status: 'online'
        };

        this.injectUI();
        this.attachEvents();
        this.loadChannel(this.currentChannel);
        this.startFakeRealtime();
        this.seedInitialMessages();
    },

    // ===========================
    // SEED INITIAL MESSAGES (if localStorage is empty)
    // ===========================
    seedInitialMessages() {
        this.channels.forEach(ch => {
            const key = `entchat_${ch.id}`;
            const existing = JSON.parse(localStorage.getItem(key) || '[]');
            if (existing.length === 0) {
                // Seed 3-5 messages per channel
                const msgs = [];
                const pool = this.fakeMessages[ch.id] || [];
                const count = 3 + Math.floor(Math.random() * 3);
                for (let i = 0; i < count && i < pool.length; i++) {
                    const user = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];
                    const minutesAgo = (count - i) * 5 + Math.floor(Math.random() * 10);
                    const time = new Date(Date.now() - minutesAgo * 60000);
                    msgs.push({
                        user: user.username,
                        avatar: user.avatar,
                        message: pool[i],
                        time: this.formatTime(time),
                        timestamp: time.getTime()
                    });
                }
                localStorage.setItem(key, JSON.stringify(msgs));
            }
        });
        // Reload current channel after seeding
        this.loadChannel(this.currentChannel);
    },

    // ===========================
    // INJECT UI
    // ===========================
    injectUI() {
        // Remove old widget if exists
        const old = document.getElementById('chat-widget-container');
        if (old) old.remove();

        const channelListHTML = this.channels.map(ch => `
            <li class="cr-channel-item ${ch.id === this.currentChannel ? 'active' : ''}" data-channel="${ch.id}">
                <span class="cr-channel-icon" style="color:${ch.color}">${ch.icon}</span>
                <span class="cr-channel-name">${ch.name}</span>
                <span class="cr-channel-badge" id="badge-${ch.id}"></span>
            </li>
        `).join('');

        const userListHTML = this.mockUsers.map(u => `
            <li class="cr-user-item">
                <div class="cr-user-avatar-wrap">
                    <img src="${u.avatar}" alt="${u.username}" class="cr-user-avatar" />
                    <span class="cr-status-dot ${u.status}"></span>
                </div>
                <span class="cr-user-name">${u.username}</span>
            </li>
        `).join('');

        const quickBtnsHTML = this.quickPrompts.map(q => `
            <button class="cr-quick-btn" data-message="${q.text}" title="${q.label}">
                <span>${q.icon}</span>
                <span class="cr-quick-label">${q.label}</span>
            </button>
        `).join('');

        const emojiHTML = this.emojiList.map(e => `
            <button class="cr-emoji-btn" data-emoji="${e}">${e}</button>
        `).join('');

        const html = `
        <div id="chat-widget-container" class="cr-widget-container">
            <!-- Floating Toggle Button -->
            <button id="btn-toggle-chat" class="cr-toggle-btn" title="Phòng Chat Chung">
                <i class="bi bi-chat-dots-fill"></i>
                <span id="cr-total-badge" class="cr-total-badge" style="display:none">0</span>
            </button>

            <!-- Chat Room Window -->
            <div id="cr-chat-window" class="cr-chat-window" style="display:none">
                <!-- Header Bar -->
                <div class="cr-header">
                    <button class="cr-sidebar-toggle" id="cr-sidebar-toggle" title="Hiện/ẩn sidebar">
                        <i class="bi bi-list"></i>
                    </button>
                    <div class="cr-header-info">
                        <div class="cr-header-channel" id="cr-header-channel">
                            <span class="cr-header-icon">${this.channels[0].icon}</span>
                            <span class="cr-header-name">${this.channels[0].name}</span>
                        </div>
                        <span class="cr-header-status">
                            <span class="cr-status-dot online"></span>
                            <span id="cr-online-count">${this.mockUsers.filter(u => u.status === 'online').length + 1} online</span>
                        </span>
                    </div>
                    <div class="cr-header-actions">
                        <button class="cr-header-btn" id="cr-toggle-users" title="Danh sách thành viên">
                            <i class="bi bi-people-fill"></i>
                        </button>
                        <button class="cr-header-btn" id="cr-close-chat" title="Đóng">
                            <i class="bi bi-x-lg"></i>
                        </button>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="cr-body">
                    <!-- Sidebar -->
                    <aside class="cr-sidebar" id="cr-sidebar">
                        <div class="cr-sidebar-header">
                            <h6>💬 Kênh trò chuyện</h6>
                        </div>
                        <ul class="cr-channel-list">
                            ${channelListHTML}
                        </ul>
                        <div class="cr-sidebar-divider"></div>
                        <div class="cr-sidebar-header">
                            <h6>👥 Thành viên</h6>
                        </div>
                        <ul class="cr-user-list">
                            <li class="cr-user-item cr-user-me">
                                <div class="cr-user-avatar-wrap">
                                    <img src="${this.currentUser.avatar}" alt="You" class="cr-user-avatar" />
                                    <span class="cr-status-dot online"></span>
                                </div>
                                <span class="cr-user-name">${this.currentUser.username} (bạn)</span>
                            </li>
                            ${userListHTML}
                        </ul>
                    </aside>

                    <!-- Messages Area -->
                    <div class="cr-messages-area">
                        <div class="cr-messages" id="cr-messages">
                            <!-- Messages rendered here -->
                        </div>

                        <!-- Quick Buttons -->
                        <div class="cr-quick-bar" id="cr-quick-bar">
                            ${quickBtnsHTML}
                        </div>

                        <!-- Emoji Picker -->
                        <div class="cr-emoji-picker" id="cr-emoji-picker" style="display:none">
                            ${emojiHTML}
                        </div>

                        <!-- Input Bar -->
                        <div class="cr-input-bar">
                            <button class="cr-emoji-toggle" id="cr-emoji-toggle" title="Emoji">😀</button>
                            <input type="text" id="cr-chat-input" class="cr-input" placeholder="Nhập tin nhắn..." maxlength="200" autocomplete="off" />
                            <span class="cr-char-count" id="cr-char-count">0/200</span>
                            <button class="cr-send-btn" id="cr-send-btn" title="Gửi">
                                <i class="bi bi-send-fill"></i>
                            </button>
                        </div>
                    </div>

                    <!-- Users Panel (toggleable on mobile) -->
                    <aside class="cr-users-panel" id="cr-users-panel" style="display:none">
                        <div class="cr-sidebar-header"><h6>👥 Thành viên</h6></div>
                        <ul class="cr-user-list">
                            <li class="cr-user-item cr-user-me">
                                <div class="cr-user-avatar-wrap">
                                    <img src="${this.currentUser.avatar}" alt="You" class="cr-user-avatar" />
                                    <span class="cr-status-dot online"></span>
                                </div>
                                <span class="cr-user-name">${this.currentUser.username} (bạn)</span>
                            </li>
                            ${userListHTML}
                        </ul>
                    </aside>
                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', html);
    },

    // ===========================
    // ATTACH EVENTS
    // ===========================
    attachEvents() {
        // Toggle chat window
        document.getElementById('btn-toggle-chat')?.addEventListener('click', () => this.toggleChat());
        document.getElementById('cr-close-chat')?.addEventListener('click', () => this.toggleChat(false));

        // Toggle sidebar on mobile
        document.getElementById('cr-sidebar-toggle')?.addEventListener('click', () => {
            document.getElementById('cr-sidebar')?.classList.toggle('open');
        });

        // Toggle users panel
        document.getElementById('cr-toggle-users')?.addEventListener('click', () => {
            const panel = document.getElementById('cr-users-panel');
            if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });

        // Channel switching
        document.querySelectorAll('.cr-channel-item').forEach(item => {
            item.addEventListener('click', () => {
                const ch = item.dataset.channel;
                if (ch) this.switchChannel(ch);
                // Close sidebar on mobile
                document.getElementById('cr-sidebar')?.classList.remove('open');
            });
        });

        // Send message
        document.getElementById('cr-send-btn')?.addEventListener('click', () => this.sendMessage());
        document.getElementById('cr-chat-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Character counter
        document.getElementById('cr-chat-input')?.addEventListener('input', (e) => {
            const len = e.target.value.length;
            const counter = document.getElementById('cr-char-count');
            if (counter) {
                counter.textContent = `${len}/200`;
                counter.style.color = len > 180 ? '#ef4444' : 'rgba(255,255,255,0.4)';
            }
        });

        // Quick prompt buttons
        document.querySelectorAll('.cr-quick-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const msg = btn.dataset.message;
                if (msg) {
                    const input = document.getElementById('cr-chat-input');
                    if (input) input.value = msg;
                    this.sendMessage();
                }
            });
        });

        // Emoji toggle
        document.getElementById('cr-emoji-toggle')?.addEventListener('click', () => {
            const picker = document.getElementById('cr-emoji-picker');
            if (picker) picker.style.display = picker.style.display === 'none' ? 'flex' : 'none';
        });

        // Emoji insert
        document.querySelectorAll('.cr-emoji-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const input = document.getElementById('cr-chat-input');
                if (input) {
                    input.value += btn.dataset.emoji;
                    input.focus();
                    // Update counter
                    const counter = document.getElementById('cr-char-count');
                    if (counter) counter.textContent = `${input.value.length}/200`;
                }
                document.getElementById('cr-emoji-picker').style.display = 'none';
            });
        });

        // Close emoji picker when clicking elsewhere
        document.addEventListener('click', (e) => {
            const picker = document.getElementById('cr-emoji-picker');
            const toggle = document.getElementById('cr-emoji-toggle');
            if (picker && picker.style.display !== 'none' && !picker.contains(e.target) && e.target !== toggle) {
                picker.style.display = 'none';
            }
        });
    },

    // ===========================
    // TOGGLE CHAT
    // ===========================
    toggleChat(forceState) {
        const win = document.getElementById('cr-chat-window');
        if (!win) return;

        if (forceState !== undefined) {
            this.isOpen = forceState;
        } else {
            this.isOpen = !this.isOpen;
        }

        win.style.display = this.isOpen ? 'flex' : 'none';

        // Reset badge
        if (this.isOpen) {
            const totalBadge = document.getElementById('cr-total-badge');
            if (totalBadge) { totalBadge.style.display = 'none'; totalBadge.textContent = '0'; }
            // Focus input
            setTimeout(() => document.getElementById('cr-chat-input')?.focus(), 200);
        }
    },

    // ===========================
    // SWITCH CHANNEL
    // ===========================
    switchChannel(channelId) {
        this.currentChannel = channelId;

        // Update active state in sidebar
        document.querySelectorAll('.cr-channel-item').forEach(item => {
            item.classList.toggle('active', item.dataset.channel === channelId);
        });

        // Update header
        const ch = this.channels.find(c => c.id === channelId);
        if (ch) {
            const header = document.getElementById('cr-header-channel');
            if (header) {
                header.innerHTML = `<span class="cr-header-icon">${ch.icon}</span><span class="cr-header-name">${ch.name}</span>`;
            }
        }

        // Clear badge for this channel
        const badge = document.getElementById(`badge-${channelId}`);
        if (badge) { badge.textContent = ''; badge.style.display = 'none'; }

        this.loadChannel(channelId);
    },

    // ===========================
    // LOAD CHANNEL MESSAGES
    // ===========================
    loadChannel(channelId) {
        const msgs = JSON.parse(localStorage.getItem(`entchat_${channelId}`) || '[]');
        this.renderMessages(msgs);
    },

    // ===========================
    // RENDER MESSAGES
    // ===========================
    renderMessages(messages) {
        const container = document.getElementById('cr-messages');
        if (!container) return;

        if (messages.length === 0) {
            const ch = this.channels.find(c => c.id === this.currentChannel);
            container.innerHTML = `
                <div class="cr-empty-state">
                    <div class="cr-empty-icon">${ch?.icon || '💬'}</div>
                    <h6>Chào mừng đến ${ch?.name || 'kênh'}!</h6>
                    <p>Hãy bắt đầu cuộc trò chuyện đầu tiên 🎉</p>
                </div>`;
            return;
        }

        container.innerHTML = messages.map((m, i) => {
            const isMe = m.user === this.currentUser.username;
            const showAvatar = i === 0 || messages[i - 1].user !== m.user;
            
            return `
                <div class="cr-message ${isMe ? 'cr-message-me' : 'cr-message-other'} ${showAvatar ? 'cr-message-first' : ''}" 
                     style="animation-delay: ${Math.min(i * 0.03, 0.3)}s">
                    ${!isMe && showAvatar ? `
                        <img src="${this.escapeHtml(m.avatar)}" alt="${this.escapeHtml(m.user)}" class="cr-msg-avatar" onerror="this.src='https://i.pravatar.cc/40?u=default'" />
                    ` : ''}
                    ${!isMe && !showAvatar ? '<div class="cr-msg-avatar-spacer"></div>' : ''}
                    <div class="cr-msg-content">
                        ${!isMe && showAvatar ? `<span class="cr-msg-username">${this.escapeHtml(m.user)}</span>` : ''}
                        <div class="cr-msg-bubble ${isMe ? 'cr-bubble-me' : 'cr-bubble-other'}">
                            ${this.formatContent(m.message)}
                        </div>
                        <span class="cr-msg-time">${m.time}</span>
                    </div>
                </div>`;
        }).join('');

        // Scroll to bottom
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    },

    // ===========================
    // SEND MESSAGE
    // ===========================
    sendMessage() {
        const input = document.getElementById('cr-chat-input');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        // Anti-spam: rate limit
        const now = Date.now();
        if (now - this.lastSentTime < this.RATE_LIMIT) {
            this.showToast('⏳ Bạn gửi quá nhanh, vui lòng chờ chút!', 'warning');
            return;
        }

        // Max length
        if (text.length > this.MAX_LENGTH) {
            this.showToast(`⚠️ Tin nhắn tối đa ${this.MAX_LENGTH} ký tự!`, 'warning');
            return;
        }

        const msgObj = {
            user: this.currentUser.username,
            avatar: this.currentUser.avatar,
            message: text,
            time: this.formatTime(new Date()),
            timestamp: Date.now()
        };

        // Save to localStorage
        const key = `entchat_${this.currentChannel}`;
        const msgs = JSON.parse(localStorage.getItem(key) || '[]');
        msgs.push(msgObj);
        // Keep max 100 messages per channel
        if (msgs.length > 100) msgs.splice(0, msgs.length - 100);
        localStorage.setItem(key, JSON.stringify(msgs));

        // Render
        this.renderMessages(msgs);

        // Clear input
        input.value = '';
        const counter = document.getElementById('cr-char-count');
        if (counter) counter.textContent = '0/200';

        this.lastSentTime = now;

        // Focus back
        input.focus();
    },

    // ===========================
    // FAKE REALTIME MESSAGES
    // ===========================
    startFakeRealtime() {
        if (this.fakeInterval) clearInterval(this.fakeInterval);

        this.fakeInterval = setInterval(() => {
            this.addFakeMessage();
        }, 4000 + Math.random() * 6000); // 4-10 seconds
    },

    addFakeMessage() {
        // Pick a random channel
        const targetChannel = this.channels[Math.floor(Math.random() * this.channels.length)].id;
        
        // Pick a random user
        const user = this.mockUsers[Math.floor(Math.random() * this.mockUsers.length)];
        
        // Pick a random message for the target channel
        const pool = this.fakeMessages[targetChannel] || [];
        if (pool.length === 0) return;
        const text = pool[Math.floor(Math.random() * pool.length)];

        const msgObj = {
            user: user.username,
            avatar: user.avatar,
            message: text,
            time: this.formatTime(new Date()),
            timestamp: Date.now()
        };

        const key = `entchat_${targetChannel}`;
        const msgs = JSON.parse(localStorage.getItem(key) || '[]');
        msgs.push(msgObj);
        if (msgs.length > 100) msgs.splice(0, msgs.length - 100);
        localStorage.setItem(key, JSON.stringify(msgs));

        // If we're viewing this channel, re-render
        if (targetChannel === this.currentChannel && this.isOpen) {
            this.renderMessages(msgs);
        } else {
            // Show badge on channel
            const badge = document.getElementById(`badge-${targetChannel}`);
            if (badge) {
                const current = parseInt(badge.textContent) || 0;
                badge.textContent = current + 1;
                badge.style.display = 'flex';
            }
            // Show total badge if chat is closed
            if (!this.isOpen) {
                const totalBadge = document.getElementById('cr-total-badge');
                if (totalBadge) {
                    const total = parseInt(totalBadge.textContent) || 0;
                    totalBadge.textContent = total + 1;
                    totalBadge.style.display = 'flex';
                }
            }
        }
    },

    // ===========================
    // HELPERS
    // ===========================
    formatTime(date) {
        return date.getHours().toString().padStart(2, '0') + ':' + date.getMinutes().toString().padStart(2, '0');
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    formatContent(text) {
        let html = this.escapeHtml(text);
        // Highlight @mentions
        html = html.replace(/@([\w_]+)/g, '<span class="cr-mention">@$1</span>');
        return html;
    },

    showToast(msg, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `cr-toast cr-toast-${type}`;
        toast.textContent = msg;
        document.body.appendChild(toast);
        
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    // Wait for auth to settle
    setTimeout(() => chatRoom.init(), 800);
});

window.chatRealtime = chatRoom;

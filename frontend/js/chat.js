// ===================================================
// Floating Chat System (Socket.io Real-time)
// ===================================================

const chat = {
    socket: null,
    messages: [],
    isOpen: false,
    currentRoom: 'general',

    init() {
        this.messages = [
            { id: 1, sender: 'System', text: 'Chào mừng bạn đến với EntConnect! Kết nối thời gian thực đã sẵn sàng.', time: new Date().toLocaleTimeString(), isMe: false }
        ];
        
        this.injectUI();
        this.renderMessages();
        this.attachListeners();
        this.initSocket();
    },

    initSocket() {
        try {
            // Khởi tạo connection socket
            const socketUrl = window.location.hostname === 'localhost' ? 'http://localhost:5000' : '';
            this.socket = io(socketUrl);

            this.socket.on('connect', () => {
                console.log('Chat: Connected to socket server');
                // Tham gia phòng chung
                this.socket.emit('join_room', { roomId: this.currentRoom });
            });

            // Lắng nghe tin nhắn mới
            this.socket.on('receive_message', (data) => {
                console.log('Chat: Received message', data);
                this.addMessage({
                    id: Date.now(),
                    sender: data.sender || 'Anonymous',
                    text: data.text,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isMe: data.userId === (window.auth?.user?._id)
                });
            });

            this.socket.on('disconnect', () => {
                console.log('Chat: Disconnected');
            });

        } catch (error) {
            console.error('Chat: Socket initialization failed', error);
        }
    },

    injectUI() {
        if (document.getElementById('chat-widget-container')) return;

        const html = `
        <div id="chat-widget-container" class="chat-widget-container">
            <!-- Chat Window -->
            <div id="chat-window" class="chat-window shadow-lg glass-panel d-none">
                <div class="chat-header d-flex justify-content-between align-items-center p-3 border-bottom border-white border-opacity-25">
                    <div class="d-flex align-items-center gap-2">
                        <div class="status-dot"></div>
                        <h6 class="mb-0 fw-bold">Phòng Chat Chung</h6>
                    </div>
                    <button id="btn-close-chat" class="btn btn-link p-0 text-dark border-0"><i class="bi bi-x-lg"></i></button>
                </div>
                
                <div id="chat-body" class="chat-body p-3">
                    <!-- Messages here -->
                </div>

                <div class="chat-footer p-3 border-top border-white border-opacity-25">
                    <form id="chat-form" class="d-flex gap-2">
                        <input type="text" id="chat-input" class="form-control border-0 bg-light rounded-pill px-3" placeholder="Nhập tin nhắn..." autocomplete="off">
                        <button type="submit" class="btn btn-primary rounded-circle shadow-sm" style="width: 40px; height: 40px; min-width: 40px;">
                            <i class="bi bi-send-fill"></i>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Floating Button -->
            <button id="btn-toggle-chat" class="btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
                <i class="bi bi-chat-dots-fill fs-4"></i>
                <span id="chat-badge" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger d-none">1</span>
            </button>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    renderMessages() {
        const body = document.getElementById('chat-body');
        if (!body) return;

        body.innerHTML = this.messages.map(m => `
            <div class="message-wrapper ${m.isMe ? 'me' : 'others'} mb-3">
                <div class="message-bubble p-2 px-3 rounded-4 shadow-sm">
                    ${!m.isMe ? `<small class="d-block fw-bold mb-1" style="font-size: 10px; opacity: 0.7;">${m.sender}</small>` : ''}
                    <div class="text">${m.text}</div>
                    <div class="time text-end mt-1" style="font-size: 9px; opacity: 0.5;">${m.time}</div>
                </div>
            </div>
        `).join('');

        body.scrollTop = body.scrollHeight;
    },

    addMessage(msg) {
        this.messages.push(msg);
        this.renderMessages();
        
        // Show badge if chat is closed and it's from someone else
        if (!this.isOpen && !msg.isMe) {
            const badge = document.getElementById('chat-badge');
            if (badge) {
                badge.classList.remove('d-none');
                badge.textContent = (parseInt(badge.textContent) || 0) + 1;
            }
        }
    },

    sendMessage(text) {
        if (!text.trim()) return;

        const userData = window.auth?.user || { username: 'Guest', _id: 'guest' };
        
        // Gửi qua socket
        if (this.socket && this.socket.connected) {
            this.socket.emit('send_message', {
                roomId: this.currentRoom,
                text: text,
                sender: userData.username,
                userId: userData._id
            });
            
            // Note: We don't manually add the message here, 
            // we wait for 'receive_message' from server (including our own)
            // or we could add it optimistically. Let's wait for roundtrip.
        } else {
            // Fallback if socket is down
            this.addMessage({
                id: Date.now(),
                sender: userData.username,
                text: text + ' (Offline mode)',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isMe: true
            });
        }
    },

    attachListeners() {
        const btnToggle = document.getElementById('btn-toggle-chat');
        const btnClose = document.getElementById('btn-close-chat');
        const chatWindow = document.getElementById('chat-window');
        const chatForm = document.getElementById('chat-form');
        const chatInput = document.getElementById('chat-input');

        if (!btnToggle) return;

        btnToggle.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            chatWindow.classList.toggle('d-none');
            document.getElementById('chat-badge').classList.add('d-none');
            document.getElementById('chat-badge').textContent = '';
            if (this.isOpen) {
                chatInput.focus();
                const body = document.getElementById('chat-body');
                if (body) body.scrollTop = body.scrollHeight;
            }
        });

        btnClose.addEventListener('click', () => {
            this.isOpen = false;
            chatWindow.classList.add('d-none');
        });

        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendMessage(chatInput.value);
            chatInput.value = '';
        });
    }
};

// Start chat
document.addEventListener('DOMContentLoaded', () => {
    chat.init();
});

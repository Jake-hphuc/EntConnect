/**
 * EntConnect - Community Chat Module
 * Handles group chat functionality using localStorage for mock persistence.
 */

const communityChat = {
    currentCommunityId: null,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        const form = document.getElementById('chatForm');
        if (form && !form.hasAttribute('data-bound')) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.sendMessage();
            });
            form.setAttribute('data-bound', 'true');
        }

        // Expose open function globally
        window.openCommunityChat = (communityId, title) => this.openChat(communityId, title);
    },

    openChat(communityId, title) {
        this.currentCommunityId = communityId;
        
        const titleEl = document.getElementById('chatTitle');
        if (titleEl && title) {
            titleEl.textContent = 'Chat: ' + title;
        }

        this.renderMessages();

        // Open Offcanvas
        const offcanvasEl = document.getElementById('chatOffcanvas');
        if (offcanvasEl) {
            const bsOffcanvas = new bootstrap.Offcanvas(offcanvasEl);
            bsOffcanvas.show();
            
            // Scroll to bottom after show
            offcanvasEl.addEventListener('shown.bs.offcanvas', () => {
                this.scrollToBottom();
                document.getElementById('chatInput').focus();
            }, { once: true });
        }
    },

    getMessages() {
        const allChats = JSON.parse(localStorage.getItem('ent_community_chats')) || {};
        return allChats[this.currentCommunityId] || [
            { id: 1, sender: 'System', avatar: 'https://ui-avatars.com/api/?name=System&background=random', text: 'Chào mừng đến với group chat!', isSelf: false }
        ];
    },

    saveMessages(messages) {
        const allChats = JSON.parse(localStorage.getItem('ent_community_chats')) || {};
        allChats[this.currentCommunityId] = messages;
        localStorage.setItem('ent_community_chats', JSON.stringify(allChats));
    },

    renderMessages() {
        const container = document.getElementById('chatMessages');
        if (!container) return;

        const messages = this.getMessages();
        let html = '';

        messages.forEach(msg => {
            const selfClass = msg.isSelf ? 'self' : '';
            html += `
                <div class="chat-message ${selfClass}">
                    ${!msg.isSelf ? `<img src="${msg.avatar}" alt="${msg.sender}" class="chat-avatar">` : ''}
                    <div>
                        <span class="chat-sender">${msg.sender}</span>
                        <div class="chat-bubble">${msg.text}</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        this.scrollToBottom();
    },

    sendMessage() {
        const input = document.getElementById('chatInput');
        if (!input) return;

        const text = input.value.trim();
        if (!text) return;

        const userStr = localStorage.getItem('entconnect_user');
        const user = userStr ? JSON.parse(userStr) : null;
        const senderName = user ? user.username : 'Tôi';
        const senderAvatar = user && user.avatar ? user.avatar : 'https://ui-avatars.com/api/?name=' + senderName + '&background=random';

        const newMessage = {
            id: Date.now(),
            sender: senderName,
            avatar: senderAvatar,
            text: text,
            isSelf: true
        };

        const messages = this.getMessages();
        messages.push(newMessage);
        this.saveMessages(messages);

        input.value = '';
        this.renderMessages();

        // Simulate reply if not a guest (just for fun mock)
        if (Math.random() > 0.5) {
            setTimeout(() => {
                this.mockReply();
            }, 1000 + Math.random() * 2000);
        }
    },

    mockReply() {
        if (!this.currentCommunityId) return;
        
        const replies = [
            'Đồng ý nhé!', 'Hay quá', 'Tuyệt vời', 'Thật vậy sao?', 'Ai đi không điểm danh nào'
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        const botMessage = {
            id: Date.now(),
            sender: 'Member_' + Math.floor(Math.random() * 100),
            avatar: 'https://i.pravatar.cc/150?u=' + Date.now(),
            text: randomReply,
            isSelf: false
        };

        const messages = this.getMessages();
        messages.push(botMessage);
        this.saveMessages(messages);

        // Only render if chat is open and it's the same community
        const offcanvasEl = document.getElementById('chatOffcanvas');
        if (offcanvasEl && offcanvasEl.classList.contains('show')) {
            this.renderMessages();
        } else {
             // Show a toast if chat is closed
             if(window.api) window.api.toast('Có tin nhắn mới trong cộng đồng!', 'info');
        }
    },

    scrollToBottom() {
        const container = document.getElementById('chatMessages');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }
};

document.addEventListener('DOMContentLoaded', () => communityChat.init());
window.communityChat = communityChat;

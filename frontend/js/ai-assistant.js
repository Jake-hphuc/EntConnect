/**
 * EntConnect - AI Assistant (AI Consultant)
 * Provides event recommendations and answers user queries based on platform data.
 */

const aiAssistant = {
    isOpen: false,
    messages: [],
    allEvents: [],

    init() {
        console.log('AI Assistant: Initializing...');
        this.injectUI();
        this.attachEventListeners();
        this.loadEvents();
    },

    async loadEvents() {
        try {
            const res = await api.request('/events');
            this.allEvents = res.success ? (res.data.activities || res.data) : (window.mockActivities || []);
        } catch (err) {
            this.allEvents = window.mockActivities || [];
        }
    },

    injectUI() {
        const html = `
        <div id="ai-assistant-container" class="ai-assistant-container">
            <!-- AI Chat Window -->
            <div id="ai-chat-window" class="ai-chat-window glass-premium shadow-premium d-none">
                <div class="ai-chat-header p-3 border-bottom border-white border-opacity-10 d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-3">
                        <div class="ai-avatar pulse">
                            <i class="bi bi-robot fs-4 text-white"></i>
                        </div>
                        <div>
                            <h6 class="mb-0 fw-bold">Trợ lý AI EntConnect</h6>
                            <small class="text-success x-small"><i class="bi bi-circle-fill me-1" style="font-size: 6px;"></i> Đang trực tuyến</small>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-link text-white p-0" id="btn-close-ai"><i class="bi bi-x-lg"></i></button>
                </div>

                <div id="ai-messages" class="ai-chat-body p-3 flex-grow-1 overflow-auto d-flex flex-column gap-3">
                    <div class="ai-message bot">
                        <div class="message-bubble p-2 px-3 rounded-4 glass-premium">
                            Xin chào! Tôi là trợ lý ảo của EntConnect. Tôi có thể giúp bạn tìm kiếm sự kiện hoặc gợi ý hoạt động giải trí phù hợp. Bạn đang quan tâm đến chủ đề gì?
                        </div>
                    </div>
                </div>

                <div class="ai-chat-footer p-3 border-top border-white border-opacity-10">
                    <div class="d-flex flex-wrap gap-2 mb-3" id="ai-quick-tags">
                        <button class="btn btn-xs btn-outline-light rounded-pill x-small px-2 py-1 opacity-75" data-query="Sự kiện hôm nay">Hôm nay có gì?</button>
                        <button class="btn btn-xs btn-outline-light rounded-pill x-small px-2 py-1 opacity-75" data-query="Gaming">🎮 Gaming</button>
                        <button class="btn btn-xs btn-outline-light rounded-pill x-small px-2 py-1 opacity-75" data-query="Âm nhạc">🎵 Âm nhạc</button>
                    </div>
                    <form id="ai-chat-form" class="d-flex gap-2">
                        <input type="text" id="ai-input" class="form-control rounded-pill px-3" 
                               style="background: rgba(255,255,255,0.15); color: #fff; border: 1px solid rgba(255,255,255,0.2);"
                               placeholder="Hỏi tôi bất cứ điều gì..." autocomplete="off">
                        <button type="submit" class="btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center" 
                                style="width: 40px; height: 40px; min-width: 40px;">
                            <i class="bi bi-send-fill"></i>
                        </button>
                    </form>
                </div>
            </div>

            <!-- Floating Button -->
            <button id="btn-toggle-ai" class="btn btn-gradient-ai rounded-circle shadow-lg d-flex align-items-center justify-content-center" 
                    style="width: 60px; height: 60px; z-index: 1060;">
                <i class="bi bi-robot fs-3"></i>
            </button>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);

        // Add specific CSS for AI Assistant if not in style.css
        const style = document.createElement('style');
        style.textContent = `
            .ai-assistant-container {
                position: fixed;
                bottom: 100px;
                right: 30px;
                z-index: 1055;
            }
            .ai-chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                display: flex;
                flex-direction: column;
                border-radius: 24px;
                overflow: hidden;
                border: 1px solid rgba(255,255,255,0.1);
                animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .ai-avatar {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 15px rgba(99, 102, 241, 0.4);
            }
            .ai-avatar.pulse {
                animation: pulse-ai 2s infinite;
            }
            @keyframes pulse-ai {
                0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                70% { box-shadow: 0 0 0 10px rgba(99, 102, 241, 0); }
                100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
            }
            .btn-gradient-ai {
                background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
                color: white;
                border: none;
                transition: all 0.3s ease;
            }
            .btn-gradient-ai:hover {
                transform: scale(1.1) rotate(5deg);
                box-shadow: 0 10px 20px rgba(99, 102, 241, 0.3);
                color: white;
            }
            .ai-message.bot .message-bubble {
                background: rgba(255,255,255,0.05);
                align-self: flex-start;
                border-bottom-left-radius: 4px !important;
            }
            .ai-message.user .message-bubble {
                background: var(--primary);
                align-self: flex-end;
                border-bottom-right-radius: 4px !important;
            }
            @media (max-width: 576px) {
                .ai-chat-window {
                    width: calc(100vw - 40px);
                    right: -10px;
                }
            }
        `;
        document.head.appendChild(style);
    },

    attachEventListeners() {
        const btnToggle = document.getElementById('btn-toggle-ai');
        const btnClose = document.getElementById('btn-close-ai');
        const chatWindow = document.getElementById('ai-chat-window');
        const form = document.getElementById('ai-chat-form');
        const input = document.getElementById('ai-input');
        const quickTags = document.querySelectorAll('#ai-quick-tags button');

        btnToggle.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            chatWindow.classList.toggle('d-none');
            if (this.isOpen) input.focus();
        });

        btnClose.addEventListener('click', () => {
            this.isOpen = false;
            chatWindow.classList.add('d-none');
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                this.handleUserMessage(text);
                input.value = '';
            }
        });

        quickTags.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.dataset.query;
                this.handleUserMessage(query);
            });
        });
    },

    handleUserMessage(text) {
        this.renderMessage(text, 'user');
        
        // Simulating AI Processing
        setTimeout(() => {
            this.generateAIResponse(text);
        }, 800);
    },

    async generateAIResponse(query) {
        // Show loading indicator
        this.renderMessage('<div class="spinner-border spinner-border-sm text-light" role="status"></div> Đang suy nghĩ...', 'bot', 'ai-loading');
        
        try {
            // Trim events context to avoid massive payload
            const trimmedEvents = this.allEvents.map(e => ({
                _id: e._id,
                title: e.title,
                category: e.category,
                pricing: e.pricing,
                location: e.location
            })).slice(0, 15); // max 15 events to keep context small

            const res = await api.request('/ai/chat', {
                method: 'POST',
                body: JSON.stringify({
                    message: query,
                    eventsContext: trimmedEvents
                })
            });

            // Remove loading indicator
            const loadingBubble = document.getElementById('ai-loading');
            if (loadingBubble) loadingBubble.remove();

            if (res.success) {
                this.renderMessage(res.reply, 'bot');
                
                // Fuzzy match response text to find mentioned events
                const mentionedEvents = this.allEvents.filter(e => res.reply.toLowerCase().includes(e.title.toLowerCase()) || res.reply.includes(e._id)).slice(0, 3);
                
                if (mentionedEvents.length > 0) {
                    this.renderEventSuggestions(mentionedEvents);
                } else if (res.reply.toLowerCase().includes("gaming") || res.reply.toLowerCase().includes("nhạc")) {
                    // Fallback visual suggestions if the text didn't match exactly
                    const suggestions = this.allEvents.filter(e => res.reply.toLowerCase().includes(e.category.toLowerCase())).slice(0, 3);
                    if (suggestions.length > 0) this.renderEventSuggestions(suggestions);
                }
            } else {
                this.renderMessage(res.message || 'Xin lỗi, tôi đang bận xử lý hệ thống. Vui lòng thử lại sau!', 'bot');
            }
        } catch (error) {
            console.error('AI Error:', error);
            const loadingBubble = document.getElementById('ai-loading');
            if (loadingBubble) loadingBubble.remove();
            
            // Fallback to local logic if server offline
            this.fallbackAIResponse(query);
        }
    },

    fallbackAIResponse(query) {
        const q = query.toLowerCase();
        let response = "";
        let suggestions = [];

        if (q.includes('hôm nay') || q.includes('sự kiện mới')) {
            response = "Hôm nay có một số sự kiện thú vị đang chờ bạn đấy! Đây là những gợi ý hàng đầu:";
            suggestions = this.allEvents.slice(0, 3);
        } else if (q.includes('gaming') || q.includes('game')) {
            response = "Các cộng đồng Gaming đang rất sôi nổi! Bạn có muốn tham gia các hoạt động này không?";
            suggestions = this.allEvents.filter(e => e.category === 'gaming').slice(0, 3);
        } else if (q.includes('nhạc') || q.includes('music') || q.includes('acoustic')) {
            response = "Âm nhạc là liều thuốc cho tâm hồn. Hãy xem qua các buổi biểu diễn sắp tới nhé:";
            suggestions = this.allEvents.filter(e => e.category === 'music').slice(0, 3);
        } else if (q.includes('giá') || q.includes('tiền')) {
            response = "Chúng tôi có cả sự kiện miễn phí và có phí. Bạn có thể xem danh sách sự kiện miễn phí tại trang Khám phá nhé!";
        } else {
            suggestions = this.allEvents.filter(e => 
                e.title.toLowerCase().includes(q) || 
                e.category.toLowerCase().includes(q)
            ).slice(0, 3);

            if (suggestions.length > 0) {
                response = `Tôi tìm thấy một vài hoạt động khớp với yêu cầu "${query}" của bạn:`;
            } else {
                response = "Xin lỗi, tôi chưa tìm thấy thông tin cụ thể về yêu cầu này. Bạn có muốn xem các sự kiện nổi bật nhất hiện nay không?";
                suggestions = this.allEvents.slice(0, 2);
            }
        }

        this.renderMessage(response, 'bot');
        if (suggestions.length > 0) {
            this.renderEventSuggestions(suggestions);
        }
    },

    renderMessage(text, side, id = null) {
        const container = document.getElementById('ai-messages');
        const idAttr = id ? `id="${id}"` : '';
        const html = `
            <div ${idAttr} class="ai-message ${side} d-flex flex-column">
                <div class="message-bubble p-2 px-3 rounded-4 glass-premium text-white small" style="max-width: 85%;">
                    ${text}
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        container.scrollTop = container.scrollHeight;
    },

    /**
     * Resolve image URL - uses ui.resolveImageUrl if available, otherwise handles fallbacks
     */
    getEventImage(event) {
        // 1. Use ui.resolveImageUrl if available (consistent with rest of app)
        if (window.ui && typeof ui.resolveImageUrl === 'function') {
            return ui.resolveImageUrl(event.coverImage, 'activity', event.category);
        }

        // 2. If coverImage is a full URL, use it
        if (event.coverImage && event.coverImage.startsWith('http')) {
            return event.coverImage;
        }

        // 3. Category-based fallback images from Unsplash
        const fallbacks = {
            gaming: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop',
            music: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=200&auto=format&fit=crop',
            sports: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=200&auto=format&fit=crop',
            food: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=200&auto=format&fit=crop',
            movies: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=200&auto=format&fit=crop',
            travel: 'https://images.unsplash.com/photo-1531050171669-0144d4850fa9?q=80&w=200&auto=format&fit=crop',
            fashion: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=200&auto=format&fit=crop',
            board_games: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?q=80&w=200&auto=format&fit=crop',
            technology: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=200&auto=format&fit=crop'
        };
        return fallbacks[event.category] || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=200&auto=format&fit=crop';
    },

    /**
     * Get category icon for fallback display
     */
    getCategoryIcon(category) {
        const icons = {
            gaming: '🎮', music: '🎵', sports: '⚽', food: '🍕',
            movies: '🎬', travel: '✈️', fashion: '👗', board_games: '🎲',
            technology: '💻'
        };
        return icons[category] || '🎉';
    },

    /**
     * Format price for display
     */
    getFormattedPrice(event) {
        if (window.ui && typeof ui.formatPrice === 'function') {
            return ui.formatPrice(event.pricing?.price);
        }
        if (!event.pricing || event.pricing.isFree) return 'Miễn phí';
        const price = event.pricing.price;
        if (!price || price === 0) return 'Miễn phí';
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    },

    renderEventSuggestions(events) {
        const container = document.getElementById('ai-messages');
        const eventsHtml = events.map(e => {
            const imgUrl = this.getEventImage(e);
            const icon = this.getCategoryIcon(e.category);
            const price = this.getFormattedPrice(e);
            // onerror: replace broken image with a gradient placeholder containing category icon
            const onerrorHandler = `this.onerror=null;this.style.display='none';this.nextElementSibling.style.display='flex';`;
            return `
            <div class="glass-card p-2 rounded-3 border border-white border-opacity-10 mb-2 cursor-pointer" 
                 onclick="window.location.href='/activity-detail.html?id=${e._id}'"
                 style="transition: transform 0.2s, background 0.2s;"
                 onmouseover="this.style.transform='scale(1.02)';this.style.background='rgba(255,255,255,0.12)'"
                 onmouseout="this.style.transform='scale(1)';this.style.background=''">
                <div class="d-flex align-items-center gap-3">
                    <div style="position:relative; width:50px; height:50px; flex-shrink:0;">
                        <img src="${imgUrl}" class="rounded-2" width="50" height="50" 
                             style="object-fit:cover; display:block;"
                             onerror="${onerrorHandler}"
                             alt="${e.title}">
                        <div class="rounded-2" style="display:none; width:50px; height:50px; 
                             background:linear-gradient(135deg, #6366f1, #a855f7);
                             align-items:center; justify-content:center; font-size:1.4rem;">
                            ${icon}
                        </div>
                    </div>
                    <div class="overflow-hidden" style="min-width:0;">
                        <div class="fw-bold x-small text-white text-truncate">${e.title}</div>
                        <div class="text-primary x-small fw-bold">${price}</div>
                    </div>
                </div>
            </div>`;
        }).join('');

        const html = `
            <div class="ai-suggestions mb-2" style="max-width: 85%;">
                ${eventsHtml}
            </div>
        `;
        container.insertAdjacentHTML('beforeend', html);
        container.scrollTop = container.scrollHeight;
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => aiAssistant.init(), 1500);
});

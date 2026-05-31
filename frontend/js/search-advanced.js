/**
 * EntConnect - Advanced Search Engine
 * Implementation for Smart Search, Auto-suggest, Fuzzy Match and Keyword Highlighting
 */

const searchAdvanced = {
    HISTORY_KEY: 'ent_search_history',
    MAX_HISTORY: 5,

    /**
     * Thuật toán 1: Chuẩn hóa chuỗi (Triệt để loại bỏ dấu, Unicode mờ, và chuyển Lowercase)
     * Đây là bước "Tiền xử lý" (Preprocessing) quan trọng trong Hệ thống Truy xuất Thông tin (IR)
     */
    normalizeText(str) {
        if (!str) return '';
        str = str.toLowerCase();
        str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
        str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
        str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
        str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
        str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
        str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
        str = str.replace(/đ/g, "d");
        str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Âm điệu
        str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // Dấu mũ
        return str.trim();
    },

    /**
     * Thuật toán 2: Fuzzy Match cơ bản
     * So sành nếu 'query' nằm trong 'text' sau chỉnh sửa.
     */
    fuzzyMatch(query, text) {
        const normQ = this.normalizeText(query);
        const normT = this.normalizeText(text);
        if (!normQ) return true;
        // Simple exact match on normalized base
        if (normT.includes(normQ)) return true;
        
        // Split text and find words (Basic Tokenization)
        const queryWords = normQ.split(' ');
        const textWords = normT.split(' ');
        
        // Nếu tất cả các từ trong query có xuất hiện (bất kể thứ tự)
        return queryWords.every(qw => normT.includes(qw));
    },

    /**
     * Thuật toán 3: Keyword Highlighting
     * Dùng Regex để bọc thẻ <mark> quanh text khớp kể cả khi text gốc có dấu tiếng Việt,
     * kỹ thuật này bóc tách vị trí không làm mất dấu tiếng Việt gốc.
     */
    highlightText(text, keyword) {
        if (!keyword || !text) return text;
        const normQuery = this.normalizeText(keyword).split(' ').filter(v => v);
        if (normQuery.length === 0) return text;

        // Escape regex control chars
        const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Gợi ý: Để highlight đúng tiếng Việt mà keyword nhập không dấu, 
        // ta bọc <mark> mộc mạc nhất bằng cách build Regex khớp các ký tự tương đương.
        // Để đơn giản mã trong quy mô FE đồ án: Nếu keyword nhập khớp chính xác chuỗi nào thì highlight.
        
        let highlighted = text;
        
        // Bóc tách text thành mảng từ để check, hoặc dùng regex lỏng
        const words = keyword.trim().split(/\s+/);
        words.forEach(w => {
            if (w.length < 2) return; // Không bôi vàng từ 1 chữ cái
            // Mapping Vietnamese chars in Regex
            const baseMapping = {
                'a': '[aàáạảãâầấậẩẫăằắặẳẵAÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]',
                'e': '[eèéẹẻẽêềếệểễEÈÉẸẺẼÊỀẾỆỂỄ]',
                'i': '[iìíịỉĩIÌÍỊỈĨ]',
                'o': '[oòóọỏõôồốộổỗơờớợởỡOÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠ]',
                'u': '[uùúụủũưừứựửữUÙÚỤỦŨƯỪỨỰỬỮ]',
                'y': '[yỳýỵỷỹYỲÝỴỶỸ]',
                'd': '[dđDĐ]'
            };
            
            let regexPattern = '';
            for(let i=0; i<w.length; i++) {
                const char = w[i].toLowerCase();
                regexPattern += baseMapping[char] || escapeRegExp(char);
            }
            
            try {
                const rgx = new RegExp(`(${regexPattern})`, 'gi');
                highlighted = highlighted.replace(rgx, '<mark class="highlight-mark">$1</mark>');
            } catch(e) {}
        });

        return highlighted;
    },

    /**
     * Quản lý LocalStorage History
     */
    getHistory() {
        try {
            return JSON.parse(localStorage.getItem(this.HISTORY_KEY)) || [];
        } catch {
            return [];
        }
    },

    saveHistory(query) {
        const q = query.trim();
        if (!q) return;
        let history = this.getHistory();
        // Remove if exists to bring to top
        history = history.filter(item => item.toLowerCase() !== q.toLowerCase());
        history.unshift(q);
        if (history.length > this.MAX_HISTORY) history.pop();
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    },

    removeHistoryItem(query) {
        let history = this.getHistory();
        history = history.filter(item => item !== query);
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(history));
    },

    /**
     * Dropdown Suggestion Renderer
     */
    renderSuggestions(containerId, query, allEvents, onSelectCallback) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const q = query.trim();
        let html = '';

        if (!q) {
            // Show recent history and popular
            const history = this.getHistory();
            if (history.length > 0) {
                html += `<div class="px-3 py-2 small fw-bold text-muted text-uppercase">Lịch sử tìm kiếm</div>`;
                history.forEach(item => {
                    html += `
                        <div class="search-dropdown-item d-flex justify-content-between align-items-center px-3 py-2 cursor-pointer dropdown-item-history" data-val="${item}">
                            <span><i class="bi bi-clock-history me-2 text-muted"></i>${item}</span>
                            <i class="bi bi-x text-muted remove-history" data-val="${item}" title="Xóa"></i>
                        </div>
                    `;
                });
            }

            html += `<div class="px-3 pt-3 pb-2 small fw-bold text-muted text-uppercase border-top mt-2">Mọi người hay tìm</div>`;
            const popular = ['Esports', 'Acoustic', 'Boardgame', 'Cà phê'];
            popular.forEach(item => {
                html += `
                    <div class="search-dropdown-item px-3 py-2 cursor-pointer dropdown-item-history" data-val="${item}">
                        <i class="bi bi-fire me-2 text-danger"></i>${item}
                    </div>
                `;
            });
        } else {
            // Live Search Suggestions mapping
            const normQ = this.normalizeText(q);
            const matches = allEvents.filter(e => this.fuzzyMatch(normQ, e.title) || this.fuzzyMatch(normQ, e.category)).slice(0, 4);
            
            html += `<div class="px-3 py-2 small fw-bold text-muted text-uppercase">Tìm kiếm cho "${q}"</div>`;
            
            if (matches.length > 0) {
                matches.forEach(e => {
                    const markedTitle = this.highlightText(e.title, q);
                    html += `
                        <div class="search-dropdown-item px-3 py-2 cursor-pointer event-jump" data-id="${e._id}">
                            <div class="d-flex align-items-center gap-3">
                                <img src="${e.coverImage}" onerror="this.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100'" 
                                     class="rounded-3 object-fit-cover" width="45" height="45">
                                <div>
                                    <div class="fw-bold mb-0 text-truncate" style="max-width: 250px;">${markedTitle}</div>
                                    <div class="small text-muted">${e.category}</div>
                                </div>
                            </div>
                        </div>
                    `;
                });
            } else {
                html += `<div class="px-3 py-3 text-muted small text-center">Không có gợi ý nào. Nhấn Enter để tìm toàn bộ.</div>`;
            }
        }

        container.innerHTML = html;
        container.classList.remove('d-none');

        // Attach events
        container.querySelectorAll('.dropdown-item-history').forEach(el => {
            el.addEventListener('click', (e) => {
                if(e.target.classList.contains('remove-history')) return; // Ignore if clicked delete
                e.stopPropagation();
                if (onSelectCallback) onSelectCallback(el.dataset.val, 'keyword');
            });
        });

        container.querySelectorAll('.remove-history').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeHistoryItem(el.dataset.val);
                this.renderSuggestions(containerId, query, allEvents, onSelectCallback); // refresh
            });
        });

        container.querySelectorAll('.event-jump').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                if (onSelectCallback) onSelectCallback(el.dataset.id, 'event');
            });
        });
    },

    /**
     * Phân trang (Pagination Logic)
     */
    paginate(data, page = 1, limit = 6) {
        const totalPages = Math.ceil(data.length / limit);
        const offset = (page - 1) * limit;
        const currentData = data.slice(offset, offset + limit);
        return {
            data: currentData,
            totalItems: data.length,
            totalPages: totalPages,
            currentPage: page
        };
    }
};

window.searchAdvanced = searchAdvanced;

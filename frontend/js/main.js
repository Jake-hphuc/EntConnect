/**
 * EntConnect - Home Page Controller V2
 * Orchestrates premium content delivery: Trending, Buddy Connect, and Suggestions
 */

const home = {
    allEvents: [],
    
    /**
     * Entry point
     */
    async init() {
        // Load events for trending section
        await this.loadTrendingEvents();
        
        // Load featured communities
        this.renderFeaturedCommunities();

        // Load Upcoming Events (Tabs)
        this.loadUpcomingEvents();

        // Load Categorized Activities (Gaming, Music, Sports, Fashion)
        this.loadCategorizedActivities();
        
        // Populate "Buddy Connect" section
        this.renderSuggestedBuddies();
        
        // Personalized AI suggestions
        this.setupPersonalization();
        
        // Search & Category wiring
        this.bindEvents();
    },

    /**
     * Load trending events with hybrid API/Mock logic
     */
    async loadTrendingEvents(category = 'all') {
        const container = document.getElementById('trending-container');
        if (!container) return;
        
        ui.showSkeleton(container, 3);
        
        try {
            // Fetch from backend
            let apiEvents = [];
            try {
                const res = await api.request(`/events${category !== 'all' ? '?category=' + category : ''}`);
                apiEvents = res.success ? (res.data.activities || res.data) : [];
            } catch (err) {
                console.warn('Backend offline, using fallback data');
            }
            
            // Merge with Mocks
            const mocks = window.mockActivities || [];
            let combined = [...apiEvents];
            
            mocks.forEach(m => {
                if (!combined.find(e => e.title === m.title) && (category === 'all' || m.category === category)) {
                    combined.push(m);
                }
            });
            
            this.allEvents = combined;
            
            // Render top items
            if (combined.length === 0) {
                ui.renderEmptyState(container, 'Chưa có sự kiện nào nổi bật cho danh mục này.');
            } else {
                container.innerHTML = combined.slice(0, 6).map((e, index) => ui.renderEventCard(e, { index })).join('');
            }
            
        } catch (err) {
            container.innerHTML = `<div class="col-12 text-center p-5 text-danger bg-danger bg-opacity-10 rounded-4">Lỗi tải sự kiện: ${err.message}</div>`;
        }
    },

    /**
     * Render Featured Communities from community.js
     */
    renderFeaturedCommunities() {
        const container = document.getElementById('home-community-list');
        if (!container) return;

        if (!window.communityPage || !communityPage.communities) {
            container.innerHTML = '<p class="text-muted">Không tải được dữ liệu cộng đồng.</p>';
            return;
        }

        const topCommunities = communityPage.communities.slice(0, 3);
        let html = '';
        
        topCommunities.forEach((c, index) => {
            const priceTag = ui.formatPrice(c.pricing.price);
            
            html += `
                <div class="col-md-6 col-lg-4 reveal-on-scroll">
                    <div class="community-card card border-0 rounded-4 shadow-sm h-100 overflow-hidden" style="animation-delay: ${index * 0.05}s">
                        <div class="position-relative" style="height: 180px;">
                            <img src="${c.coverImage}" class="w-100 h-100 object-fit-cover" alt="${c.title}">
                            <div class="position-absolute top-0 start-0 w-100 h-100 bg-dark" style="opacity: 0.5;"></div>
                            <div class="position-absolute bottom-0 start-0 p-3 w-100 d-flex justify-content-between align-items-end">
                                <h3 class="text-white fw-bold mb-0 text-shadow-sm font-outfit truncate"><i class="bi ${c.icon} me-2"></i>${c.title}</h3>
                            </div>
                        </div>
                        <div class="card-body p-4 d-flex flex-column bg-white">
                            <p class="text-muted small mb-4 flex-grow-1 line-clamp-2">${c.desc}</p>
                            
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-people text-muted"></i>
                                    <span class="fw-bold small">${c.stats.members.toLocaleString()}</span>
                                </div>
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-calendar2-event text-muted"></i>
                                    <span class="fw-bold small">${c.stats.events} sự kiện</span>
                                </div>
                            </div>

                            <hr class="opacity-10 my-0 mb-3">
                            
                            <div class="d-flex justify-content-between align-items-center mt-auto">
                                <div>
                                    <div class="small text-muted mb-1">Phí tham gia</div>
                                    <div class="fw-bold text-primary fs-5">${priceTag}</div>
                                </div>
                                <button class="btn btn-primary rounded-pill px-4 fw-bold shadow-sm btn-join-community" 
                                        onclick="communityPage.joinCommunity('${c._id}')">
                                    Tham gia ngay
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        this.triggerReveal();
    },

    /**
     * Load Upcoming Events for the tabbed section
     */
    loadUpcomingEvents() {
        const container = document.getElementById('upcoming-container');
        if (!container) return;

        // Ensure data is available
        if (!window.mockActivities || window.mockActivities.length === 0) {
            setTimeout(() => this.loadUpcomingEvents(), 500);
            return;
        }

        // Just take the first 4 for now as "Weekend" and 4 more for "Month"
        const renderTab = (type) => {
            const items = type === 'weekend' 
                ? window.mockActivities.slice(0, 4) 
                : window.mockActivities.slice(4, 8);
            
            container.innerHTML = items.map((e, index) => 
                ui.renderCompactEventCard(e, { index, className: 'col-6 col-md-3' })
            ).join('');
        };

        // Initial render
        renderTab('weekend');

        // Bind tabs
        const weekendTab = document.getElementById('weekend-tab');
        const monthTab = document.getElementById('month-tab');

        if (weekendTab && monthTab) {
            weekendTab.addEventListener('click', () => {
                monthTab.classList.remove('active', 'text-dark', 'border-bottom', 'border-3', 'border-success', 'rounded-0');
                monthTab.classList.add('text-muted');
                weekendTab.classList.add('active', 'text-dark', 'border-bottom', 'border-3', 'border-success', 'rounded-0');
                weekendTab.classList.remove('text-muted');
                renderTab('weekend');
            });

            monthTab.addEventListener('click', () => {
                weekendTab.classList.remove('active', 'text-dark', 'border-bottom', 'border-3', 'border-success', 'rounded-0');
                weekendTab.classList.add('text-muted');
                monthTab.classList.add('active', 'text-dark', 'border-bottom', 'border-3', 'border-success', 'rounded-0');
                monthTab.classList.remove('text-muted');
                renderTab('month');
            });
        }
    },

    /**
     * Load Activities by Category for specific sections
     */
    loadCategorizedActivities() {
        const categories = [
            { id: 'gaming', container: 'gaming-container' },
            { id: 'music', container: 'music-container' },
            { id: 'sports', container: 'sports-container' },
            { id: 'fashion', container: 'fashion-container' }
        ];

        // Ensure mockActivities is loaded, if not, wait and retry once
        if (!window.mockActivities || window.mockActivities.length === 0) {
            setTimeout(() => this.loadCategorizedActivities(), 500);
            return;
        }

        categories.forEach(cat => {
            const container = document.getElementById(cat.container);
            if (!container) return;

            // Filter items from mockActivities
            const items = window.mockActivities.filter(e => e.category === cat.id);

            if (items.length === 0) {
                ui.renderEmptyState(container, `Chưa có hoạt động ${cat.id} mới.`);
            } else {
                // Render 4 items per category in a row using compact cards
                container.innerHTML = items.slice(0, 4).map((e, index) => 
                    ui.renderCompactEventCard(e, { index, className: 'col-6 col-md-3' })
                ).join('');
            }
        });
        
        // Retrigger intersection observer
        this.triggerReveal();
    },

    /**
     * Social Section: Suggested Buddies
     */
    renderSuggestedBuddies() {
        const container = document.getElementById('users-recommend-container');
        if (!container) return;
        
        const users = window.mockUsers || [];
        if (users.length === 0) {
            container.innerHTML = '<p class="text-muted small">Hiện tại chưa có gợi ý kết nối nào.</p>';
            return;
        }
        
        // Shuffle or filter based on interests if logged in
        container.innerHTML = users.map(u => ui.renderUserCard(u)).join('');
    },

    /**
     * Recommendations for logged in users
     */
    setupPersonalization() {
        const recSection = document.getElementById('recommended-section');
        const recContainer = document.getElementById('recommended-container');
        if (!recSection || !recContainer) return;

        const token = api.getToken();
        if (token && window.userPrefs) {
            const recommended = userPrefs.getRecommendations(this.allEvents, 3);
            if (recommended.length > 0) {
                recSection.classList.remove('d-none');
                recContainer.innerHTML = recommended.map((e, index) => ui.renderEventCard(e, { isRecommended: true, index })).join('');
            }
        }
    },

    /**
     * Realtime Search Filter
     */
    filterEvents(keyword) {
        const container = document.getElementById('trending-container');
        if (!container) return;
        
        const q = (keyword || '').toLowerCase().trim();
        if (!q) {
            // Restore original allEvents limited
            container.innerHTML = this.allEvents.slice(0, 6).map((e, index) => ui.renderEventCard(e, { index })).join('');
            return;
        }
        
        const filtered = this.allEvents.filter(e => {
            if (!window.searchAdvanced) return e.title.toLowerCase().includes(q);
            return searchAdvanced.fuzzyMatch(q, e.title) || searchAdvanced.fuzzyMatch(q, e.category);
        });
        
        if (filtered.length === 0) {
            ui.renderEmptyState(container, `Không tìm thấy sự kiện nào khớp với "${keyword}".`);
        } else {
            container.innerHTML = filtered.slice(0, 6).map((e, index) => ui.renderEventCard(e, { index })).join('');
        }
    },

    /**
     * User interactions & Navigation
     */
    bindEvents() {
        // Hero Search
        const searchForm = document.getElementById('hero-search-form');
        const searchInput = document.getElementById('main-search-input');
        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const q = searchInput.value.trim();
                if (q) window.location.href = `/discover?q=${encodeURIComponent(q)}`;
            });

            // Real-time keyword filter on home page
            searchInput.addEventListener('input', (e) => {
                const keyword = e.target.value;
                this.filterEvents(keyword);

                // Show suggestions
                if (window.searchAdvanced) {
                    searchAdvanced.renderSuggestions('search-suggestions-home', keyword, this.allEvents, (val, type) => {
                        if (type === 'keyword') {
                            searchInput.value = val;
                            window.location.href = `/discover?q=${encodeURIComponent(val)}`;
                        } else if (type === 'event') {
                            window.location.href = `/activity-detail.html?id=${val}`;
                        }
                    });
                }
            });

            // Focus triggers suggestions
            searchInput.addEventListener('focus', () => {
                if (window.searchAdvanced) {
                    searchAdvanced.renderSuggestions('search-suggestions-home', searchInput.value, this.allEvents, (val, type) => {
                        if (type === 'keyword') {
                            searchInput.value = val;
                            window.location.href = `/discover?q=${encodeURIComponent(val)}`;
                        } else if (type === 'event') {
                            window.location.href = `/activity-detail.html?id=${val}`;
                        }
                    });
                }
            });

            // Hide suggestions when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    const dropdown = document.getElementById('search-suggestions-home');
                    if (dropdown) dropdown.classList.add('d-none');
                }
            });
        }

        // Category Pills
        document.querySelectorAll('.category-pill').forEach(pill => {
            pill.addEventListener('click', (e) => {
                const cat = e.target.dataset.category;
                
                // Analytics track
                if (window.userPrefs) userPrefs.trackInteraction(cat, 1);
                
                // Toggle active
                document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                
                // Reload
                this.loadTrendingEvents(cat);
            });
        });
        
        // Scroll Animations setup (re-trigger if needed)
        this.triggerReveal();
    },

    triggerReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => home.init());

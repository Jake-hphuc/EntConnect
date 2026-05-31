/**
 * EntConnect - Community Main Controller
 */

const communityPage = {
    currentFilterTab: 'all', // 'all', 'joined'

    init() {
        this.renderCommunities();
        this.renderRecommendations();
        this.renderTrending();
        this.bindEvents();
    },

    bindEvents() {
        // Tab Filtering
        document.querySelectorAll('#communityTab .nav-link').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('#communityTab .nav-link').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilterTab = e.target.getAttribute('data-tab');
                this.renderCommunities();
            });
        });

        // Search Input
        const searchInput = document.getElementById('searchCommunity');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.renderCommunities());
        }

        // Category & Activity Filters
        const filterCategory = document.getElementById('filterCategory');
        if (filterCategory) {
            filterCategory.addEventListener('change', () => this.renderCommunities());
        }

        const filterActivity = document.getElementById('filterActivity');
        if (filterActivity) {
            filterActivity.addEventListener('change', () => this.renderCommunities());
        }

        // Storage Event for Join/Leave sync across tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'ent_communities' || e.key === 'entconnect_joined_communities') {
                this.renderCommunities();
            }
        });

        // Custom event if payment handles it
        document.addEventListener('payment_success', () => {
            this.renderCommunities();
            if (this.currentModalId) {
                 this.updateModalJoinStatus(this.currentModalId);
            }
        });
    },

    getFilteredCommunities() {
        if (!window.communityData) return [];
        
        let communities = window.communityData.getCommunities();
        const joinedIds = window.communityData.getJoinedCommunities().map(c => c.id);

        // 1. Tab Filter
        if (this.currentFilterTab === 'joined') {
            communities = communities.filter(c => joinedIds.includes(c.id));
        }

        // 2. Search Filter
        const searchInput = document.getElementById('searchCommunity');
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        if (searchTerm) {
            communities = communities.filter(c => 
                c.name.toLowerCase().includes(searchTerm) || 
                c.description.toLowerCase().includes(searchTerm) ||
                c.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // 3. Category Filter
        const filterCategory = document.getElementById('filterCategory');
        const category = filterCategory ? filterCategory.value : 'all';
        if (category !== 'all') {
            communities = communities.filter(c => c.category === category);
        }

        // 4. Activity Filter
        const filterActivity = document.getElementById('filterActivity');
        const activity = filterActivity ? filterActivity.value : 'all';
        if (activity !== 'all') {
            communities = communities.filter(c => c.activityLevel === activity);
        }

        return { communities, joinedIds };
    },

    renderCommunities() {
        const container = document.getElementById('community-list');
        if (!container) return;

        const { communities, joinedIds } = this.getFilteredCommunities();

        if (communities.length === 0) {
            container.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="bi bi-search"></i>
                    <h4>Không tìm thấy cộng đồng nào</h4>
                    <p>Thử thay đổi từ khóa hoặc bộ lọc của bạn.</p>
                </div>
            `;
            return;
        }

        let html = '';
        communities.forEach((c, index) => {
            const isJoined = joinedIds.includes(c.id);
            const priceTag = c.pricing.isFree ? 'Miễn phí' : (window.ui ? window.ui.formatPrice(c.pricing.price) : c.pricing.price + 'đ');
            
            // Render Tags
            const tagsHtml = c.tags.slice(0, 3).map(tag => `<span class="community-tag">${tag}</span>`).join('');

            html += `
                <div class="col-md-6 col-xl-6 reveal-on-scroll">
                    <div class="community-card card rounded-4 h-100 overflow-hidden ${isJoined ? 'joined' : ''}" style="animation-delay: ${index * 0.05}s" onclick="communityPage.openCommunityDetail('${c.id}')">
                        <div class="cover-container">
                            <img src="${c.coverImage}" class="w-100 h-100 object-fit-cover" alt="${c.name}">
                            <div class="activity-badge"><i class="bi bi-activity"></i> ${c.activityLevel}</div>
                            ${isJoined ? '<div class="position-absolute bottom-0 end-0 m-3 badge bg-success rounded-pill px-3 py-2 shadow-sm"><i class="bi bi-patch-check-fill me-1"></i>Đã tham gia</div>' : ''}
                        </div>
                        <div class="card-body p-4 d-flex flex-column bg-white">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h4 class="fw-bold mb-0 font-outfit text-dark truncate pe-2"><i class="bi ${c.icon} me-2 text-primary"></i>${c.name}</h4>
                            </div>
                            <div class="community-tags mt-2">
                                ${tagsHtml}
                            </div>
                            <p class="text-muted small mb-4 flex-grow-1 line-clamp-2">${c.description}</p>
                            
                            <div class="d-flex justify-content-between align-items-center mb-0 mt-auto">
                                <div class="d-flex align-items-center text-muted small fw-bold">
                                    <i class="bi bi-people-fill me-1 text-primary"></i> ${c.memberCount.toLocaleString()}
                                    <span class="mx-2">•</span>
                                    <span class="text-dark">${priceTag}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        this.triggerReveal();
    },

    renderRecommendations() {
        const container = document.getElementById('recommendation-list');
        if (!container || !window.communityData) return;

        const communities = window.communityData.getCommunities();
        const joinedIds = window.communityData.getJoinedCommunities().map(c => c.id);
        
        // Recommend those not joined, limit to 3
        const recs = communities.filter(c => !joinedIds.includes(c.id)).sort(() => 0.5 - Math.random()).slice(0, 3);
        
        if (recs.length === 0) {
            container.innerHTML = '<p class="text-muted small mb-0">Bạn đã tham gia hết các cộng đồng!</p>';
            return;
        }

        let html = '';
        recs.forEach(c => {
            html += `
                <div class="rec-item" onclick="communityPage.openCommunityDetail('${c.id}')">
                    <img src="${c.coverImage}" alt="${c.name}" class="rec-image">
                    <div class="rec-info">
                        <div class="rec-title">${c.name}</div>
                        <div class="rec-meta"><i class="bi bi-people-fill"></i> ${c.memberCount.toLocaleString()} • ${c.activityLevel}</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    renderTrending() {
        const container = document.getElementById('trending-list');
        if (!container || !window.communityData) return;

        const communities = window.communityData.getCommunities();
        // Sort by members
        const trending = [...communities].sort((a, b) => b.memberCount - a.memberCount).slice(0, 3);

        let html = '';
        trending.forEach((c, index) => {
            html += `
                <div class="rec-item" onclick="communityPage.openCommunityDetail('${c.id}')">
                    <div class="fw-bold fs-5 text-muted me-2" style="width: 20px;">${index + 1}</div>
                    <div class="rec-info">
                        <div class="rec-title">${c.name}</div>
                        <div class="rec-meta">${c.memberCount.toLocaleString()} thành viên</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    currentModalId: null,

    openCommunityDetail(id) {
        if (!window.communityData) return;
        const c = window.communityData.getCommunityById(id);
        if (!c) return;

        this.currentModalId = id;

        // Populate Modal Info
        document.getElementById('modalCoverImage').style.backgroundImage = `url('${c.coverImage}')`;
        document.getElementById('modalCategory').textContent = c.category.toUpperCase();
        document.getElementById('modalMembers').textContent = c.memberCount.toLocaleString();
        document.getElementById('modalTitle').textContent = c.name;
        document.getElementById('modalAdmin').textContent = c.adminName;
        document.getElementById('modalDescShort').textContent = c.description;
        document.getElementById('modalDescFull').textContent = c.description + ' ' + (c.description || '');
        document.getElementById('modalActivity').textContent = c.activityLevel;

        // Tags
        const tagsHtml = c.tags.map(tag => `<span class="community-tag">${tag}</span>`).join('');
        document.getElementById('modalTags').innerHTML = tagsHtml;

        // Update Join Status & Buttons
        this.updateModalJoinStatus(c.id);

        // Bind Chat Button
        const btnChat = document.getElementById('btnModalChat');
        btnChat.onclick = () => {
            // close modal first
            const modalEl = document.getElementById('communityDetailModal');
            const bsModal = bootstrap.Modal.getInstance(modalEl);
            bsModal.hide();
            
            // then open chat
            if (window.openCommunityChat) {
                setTimeout(() => {
                    window.openCommunityChat(c.id, c.name);
                }, 400); // wait for modal transition
            }
        };

        // Initialize Posts
        if (window.communityPosts) {
            window.communityPosts.init(c.id);
        }

        // Initialize Leaderboard
        if (window.communityLeaderboard) {
            window.communityLeaderboard.renderLeaderboard(c.id, 'modalLeaderboard');
        }

        // Show Modal
        const modalEl = document.getElementById('communityDetailModal');
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
    },

    updateModalJoinStatus(id) {
        if (!window.communityData) return;
        const c = window.communityData.getCommunityById(id);
        if(!c) return;

        const joinedIds = window.communityData.getJoinedCommunities().map(joined => joined.id);
        const isJoined = joinedIds.includes(c.id);

        const btnJoin = document.getElementById('btnModalJoin');
        if (btnJoin) {
            if (isJoined) {
                btnJoin.className = 'btn btn-outline-success rounded-pill px-4 fw-bold shadow-sm';
                btnJoin.innerHTML = '<i class="bi bi-check2-circle me-2"></i>Đã tham gia';
                btnJoin.onclick = () => this.leaveCommunity(c.id);
            } else {
                btnJoin.className = 'btn btn-primary rounded-pill px-4 fw-bold shadow-sm';
                btnJoin.innerHTML = 'Tham gia ngay';
                btnJoin.onclick = () => this.joinCommunity(c.id);
            }
        }
    },

    joinCommunity(id) {
        const c = window.communityData.getCommunityById(id);
        if (!c) return;

        // Check login (mock)
        const userStr = localStorage.getItem('entconnect_user');
        if (!userStr && window.ui && typeof window.ui.showLoginModal === 'function') {
             window.ui.showLoginModal();
             return;
        }

        if (c.pricing && !c.pricing.isFree && window.payment) {
            // Map community object to look like an event for the checkout
            c.title = c.name; 
            c.isCommunity = true;
            window.payment.openCheckout(c);
        } else {
            // Free community, join directly
            window.communityData.updateCommunityState(id, true);
            if(window.api) window.api.toast('Tham gia cộng đồng thành công!', 'success');
            this.renderCommunities();
            this.updateModalJoinStatus(id);
        }
    },

    leaveCommunity(id) {
        if(confirm('Bạn có chắc chắn muốn rời khỏi cộng đồng này?')) {
            window.communityData.updateCommunityState(id, false);
            
            // Also remove from payment logic if it was tracked there
            if(window.payment) {
                 let joinedEvents = window.payment.getJoinedEventIds();
                 joinedEvents = joinedEvents.filter(eventId => eventId !== id);
                 localStorage.setItem('entconnect_joined_events', JSON.stringify(joinedEvents));
            }

            if(window.api) window.api.toast('Đã rời khỏi cộng đồng!', 'info');
            this.renderCommunities();
            this.updateModalJoinStatus(id);
        }
    },

    triggerReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, { threshold: 0.1 });
        
        setTimeout(() => {
            document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
        }, 100);
    }
};

document.addEventListener('DOMContentLoaded', () => communityPage.init());
window.communityPage = communityPage;


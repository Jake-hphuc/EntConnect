/**
 * EntConnect - Extended Leaderboard System
 * Calculates scores, sorts users, and renders either:
 * 1. Mini Discover sidebar leaderboard
 * 2. Full Leaderboard page with 4 categories (Top EXP, Hosts, Companions, Activity)
 */

const leaderboardSystem = {
    // Current user context
    currentUserUsername: 'current_user',
    currentCategory: 'exp',

    // 1. Upgraded Mock Data
    mockUsers: [
        {
            username: "karaoke_queen",
            avatar: "https://i.pravatar.cc/150?img=5",
            joinedEvents: 32,
            hostedEvents: 10,
            rating: 5.0,
            reviews: 80,
            exp: 12500,
            companionBookings: 42,
            messagesCount: 230
        },
        {
            username: "phucdev",
            avatar: "https://i.pravatar.cc/150?img=11",
            joinedEvents: 24,
            hostedEvents: 5,
            rating: 4.9,
            reviews: 45,
            exp: 9500,
            companionBookings: 15,
            messagesCount: 120
        },
        {
            username: "travel_guru",
            avatar: "https://i.pravatar.cc/150?img=65",
            joinedEvents: 20,
            hostedEvents: 15,
            rating: 4.9,
            reviews: 60,
            exp: 8200,
            companionBookings: 8,
            messagesCount: 110
        },
        {
            username: "gamer_pro",
            avatar: "https://i.pravatar.cc/150?img=12",
            joinedEvents: 18,
            hostedEvents: 2,
            rating: 4.5,
            reviews: 12,
            exp: 4500,
            companionBookings: 25,
            messagesCount: 85
        },
        {
            username: "music_lover",
            avatar: "https://i.pravatar.cc/150?img=44",
            joinedEvents: 12,
            hostedEvents: 3,
            rating: 4.7,
            reviews: 20,
            exp: 3500,
            companionBookings: 12,
            messagesCount: 95
        },
        {
            username: "foodie_sg",
            avatar: "https://i.pravatar.cc/150?img=33",
            joinedEvents: 15,
            hostedEvents: 0,
            rating: 4.2,
            reviews: 5,
            exp: 1500,
            companionBookings: 5,
            messagesCount: 40
        },
        {
            username: "boardgame_master",
            avatar: "https://i.pravatar.cc/150?img=59",
            joinedEvents: 5,
            hostedEvents: 2,
            rating: 4.0,
            reviews: 8,
            exp: 900,
            companionBookings: 18,
            messagesCount: 50
        },
        {
            username: "current_user", // default fallback for current_user if not logged in
            avatar: "https://i.pravatar.cc/150?img=60",
            joinedEvents: 8,
            hostedEvents: 1,
            rating: 4.8,
            reviews: 3,
            exp: 320,
            companionBookings: 2,
            messagesCount: 15
        }
    ],

    // 2. Score Calculation for Discover Sidebar
    calculateScore(user) {
        return Math.round(
            (user.joinedEvents * 2) +
            (user.hostedEvents * 3) +
            (user.reviews * 1) +
            (user.rating * 2)
        );
    },

    // 3. Process and Sort Leaderboard
    getLeaderboard(users, category = 'discover') {
        const processed = users.map(user => {
            let score = 0;
            let displayValue = '';

            switch(category) {
                case 'exp':
                    score = user.exp;
                    displayValue = `${user.exp.toLocaleString()} EXP`;
                    break;
                case 'hosts':
                    score = user.hostedEvents;
                    displayValue = `${user.hostedEvents} Sự kiện`;
                    break;
                case 'companions':
                    score = user.companionBookings;
                    displayValue = `${user.companionBookings} Lượt thuê`;
                    break;
                case 'community':
                    score = user.messagesCount;
                    displayValue = `${user.messagesCount} Tin nhắn`;
                    break;
                default: // 'discover' mini sidebar
                    score = this.calculateScore(user);
                    displayValue = `${score} pts`;
                    break;
            }

            return {
                ...user,
                score,
                displayValue
            };
        });

        return processed.sort((a, b) => b.score - a.score);
    },

    // 4. Render Discover Page Sidebar Leaderboard (Preserves existing layout)
    renderLeaderboard() {
        const container = document.getElementById("leaderboard-container");
        if (!container) return;

        container.innerHTML = "";
        const sortedUsers = this.getLeaderboard(this.getUsersWithCurrent(), 'discover');

        sortedUsers.slice(0, 10).forEach((user, index) => {
            const rank = index + 1;
            let rankClass = '';
            if (rank === 1) rankClass = 'rank-1';
            else if (rank === 2) rankClass = 'rank-2';
            else if (rank === 3) rankClass = 'rank-3';

            const isCurrentUser = user.username === this.currentUserUsername;
            const currentUserClass = isCurrentUser ? 'current-user' : '';

            let badgeHtml = '';
            if (rank === 1) {
                badgeHtml = '<div class="lb-badge" title="Top Rated">⭐</div>';
            } else if (user.joinedEvents > 20) {
                badgeHtml = '<div class="lb-badge" title="Active Member">🔥</div>';
            }

            container.innerHTML += `
                <div class="leaderboard-item d-flex align-items-center p-2 mb-2 rounded-3 ${rankClass} ${currentUserClass}" title="Xem hồ sơ của @${user.username}">
                    <div class="lb-rank me-3 shadow-sm">${rank}</div>
                    <div class="lb-avatar-wrap me-3">
                        <img src="${user.avatar}" class="lb-avatar rounded-circle">
                        ${badgeHtml}
                    </div>
                    <div class="flex-grow-1 overflow-hidden">
                        <div class="lb-username fw-bold text-truncate">@${user.username}</div>
                        <div class="lb-stats text-muted text-truncate">
                            <i class="bi bi-calendar-check text-primary me-1"></i>${user.joinedEvents} 
                            <span class="mx-1">•</span> 
                            <i class="bi bi-star-fill text-warning me-1"></i>${user.rating}
                        </div>
                    </div>
                    <div class="lb-score-box ms-2 pe-1" ${isCurrentUser ? 'style="margin-right: 35px;"' : ''}>
                        <div class="lb-score">${user.score}</div>
                        <small class="text-muted" style="font-size: 0.65rem;">pts</small>
                    </div>
                </div>
            `;
        });
    },

    // 5. Render Full Standalone Leaderboard Page
    renderFullPageLeaderboard() {
        const tbody = document.getElementById("full-leaderboard-tbody");
        if (!tbody) return;

        const usersList = this.getUsersWithCurrent();
        const sorted = this.getLeaderboard(usersList, this.currentCategory);

        // Render Spotlight (Top 3)
        this.renderSpotlight(sorted.slice(0, 3));

        // Render Table (Ranks 4-20)
        let tbodyHtml = '';
        const tableList = sorted.slice(3);

        if (tableList.length === 0) {
            tbodyHtml = `<tr><td colspan="4" class="text-center text-muted py-4">Chưa có xếp hạng cho mục này.</td></tr>`;
        } else {
            tableList.forEach((user, index) => {
                const rank = index + 4;
                const isCurrentUser = user.username === this.currentUserUsername;
                const currentUserClass = isCurrentUser ? 'table-active-user' : '';
                
                // Get rank badge or text
                let rankLabel = window.ExpSystem ? window.ExpSystem.getRankByExp(user.exp) : { name: 'Explorer', color: '#6b7280' };
                let userLevel = window.ExpSystem ? window.ExpSystem.getLevelByExp(user.exp) : 1;

                tbodyHtml += `
                    <tr class="${currentUserClass}">
                        <td class="text-center fw-bold fs-6 text-white-50">${rank}</td>
                        <td>
                            <div class="d-flex align-items-center gap-3">
                                <img src="${user.avatar}" class="rounded-circle border" width="40" height="40" style="object-fit:cover; border-color: ${rankLabel.color}50 !important;">
                                <div>
                                    <div class="fw-bold text-white">@${user.username} ${isCurrentUser ? '<span class="badge bg-primary ms-1 small">Bạn</span>' : ''}</div>
                                    <div class="text-white-50 x-small"><i class="bi bi-calendar3"></i> Đã tham gia: ${user.joinedEvents} sự kiện</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <span class="badge px-3 py-1 rounded-pill small" style="background: ${rankLabel.gradient || rankLabel.color};">
                                ${rankLabel.name} (Lv.${userLevel})
                            </span>
                        </td>
                        <td class="text-end fw-bold text-gradient-gold font-outfit fs-6 pe-3">
                            ${user.displayValue}
                        </td>
                    </tr>
                `;
            });
        }
        tbody.innerHTML = tbodyHtml;

        // Render Sticky Footer for Current User
        this.renderCurrentUserSticky(sorted);
    },

    /**
     * Render Top 3 users in spotlight layout
     */
    renderSpotlight(top3) {
        const spotlightContainer = document.getElementById("full-leaderboard-spotlight");
        if (!spotlightContainer) return;

        let html = '';
        
        // Order for spotlight display: Rank 2, Rank 1, Rank 3
        const displayOrder = [1, 0, 2]; // index in top3 array
        
        displayOrder.forEach(idx => {
            const user = top3[idx];
            if (!user) return;

            const rank = idx + 1;
            const isCurrentUser = user.username === this.currentUserUsername;
            
            let rankClass = `spotlight-rank-${rank}`;
            let crownIcon = '';
            let avatarSize = 90;
            let cardHeight = '180px';
            let crownColor = '#C0C0C0';

            if (rank === 1) {
                crownIcon = '👑';
                avatarSize = 110;
                cardHeight = '210px';
                crownColor = '#FFD700';
            } else if (rank === 3) {
                crownIcon = '🥉';
                crownColor = '#CD7F32';
            } else {
                crownIcon = '🥈';
            }

            let rankLabel = window.ExpSystem ? window.ExpSystem.getRankByExp(user.exp) : { name: 'Explorer', color: '#6b7280' };

            html += `
                <div class="col-md-4 col-sm-6 d-flex flex-column align-items-center reveal-on-scroll active">
                    <div class="spotlight-card ${rankClass} text-center p-4 rounded-4 w-100 position-relative mb-2 ${isCurrentUser ? 'current-user-card' : ''}" style="min-height: ${cardHeight}; border: 1.5px solid ${rankLabel.color}35;">
                        <div class="spotlight-glow" style="background: ${rankLabel.color}10;"></div>
                        <div class="crown-wrap fs-3" style="color: ${crownColor};">${crownIcon}</div>
                        <div class="position-relative d-inline-block mb-3">
                            <img src="${user.avatar}" class="rounded-circle border border-3" width="${avatarSize}" height="${avatarSize}" style="object-fit:cover; border-color: ${rankLabel.color} !important;">
                            <div class="spotlight-rank-badge" style="background: ${rankLabel.gradient || rankLabel.color};">${rank}</div>
                        </div>
                        <h4 class="fw-bold mb-1 font-outfit text-white">@${user.username}</h4>
                        <div class="badge px-3 py-1 rounded-pill mb-3 small" style="background: ${rankLabel.gradient || rankLabel.color};">
                            ${rankLabel.name}
                        </div>
                        <div class="spotlight-score fw-bold font-outfit fs-5 text-gradient-gold">
                            ${user.displayValue}
                        </div>
                    </div>
                </div>
            `;
        });

        spotlightContainer.innerHTML = html;
    },

    /**
     * Render a sticky bar for the current user's rank position at the bottom of the table
     */
    renderCurrentUserSticky(sortedList) {
        const sticky = document.getElementById("leaderboard-current-user-sticky");
        if (!sticky) return;

        const myIdx = sortedList.findIndex(u => u.username === this.currentUserUsername);
        if (myIdx === -1) {
            sticky.className = 'd-none';
            return;
        }

        const me = sortedList[myIdx];
        const rank = myIdx + 1;
        const rankLabel = window.ExpSystem ? window.ExpSystem.getRankByExp(me.exp) : { name: 'Explorer', color: '#6b7280' };
        const myLevel = window.ExpSystem ? window.ExpSystem.getLevelByExp(me.exp) : 1;

        sticky.className = 'sticky-user-rank p-3 glass-panel border shadow-lg mt-4 d-flex align-items-center justify-content-between rounded-4';
        sticky.style.borderColor = `${rankLabel.color}40`;
        
        sticky.innerHTML = `
            <div class="d-flex align-items-center gap-3">
                <div class="user-sticky-rank fw-bold fs-5 text-white-50 px-2">#${rank}</div>
                <img src="${me.avatar}" class="rounded-circle border" width="44" height="44" style="object-fit:cover; border-color: ${rankLabel.color}">
                <div>
                    <div class="fw-bold text-white mb-0">Hạng của bạn (Bạn)</div>
                    <div class="text-white-50 x-small">@${me.username}</div>
                </div>
            </div>
            <div class="d-flex align-items-center gap-3">
                <span class="badge px-3 py-1.5 rounded-pill fw-bold" style="background: ${rankLabel.gradient || rankLabel.color};">
                    ${rankLabel.name} (Lv.${myLevel})
                </span>
                <div class="fw-bold font-outfit text-gradient-gold fs-5 pe-2">${me.displayValue}</div>
            </div>
        `;
    },

    // 6. Get Users including current user local data
    getUsersWithCurrent() {
        // If current user is logged in, sync their local storage exp and stats!
        const userStr = localStorage.getItem('user');
        const isLoggedIn = !!userStr;
        
        let users = [...this.mockUsers];
        
        if (isLoggedIn) {
            const user = JSON.parse(userStr);
            this.currentUserUsername = user.username;
            
            // Get local storage EXP system details
            const membership = window.ExpSystem ? window.ExpSystem.getFullMembership() : { exp: 320, level: 1 };
            const achievementsStats = window.AchievementSystem ? window.AchievementSystem.getStats() : { hostedEvents: 1, chatMessages: 15, successfulBookings: 2 };
            
            // Find or create current_user in list
            const index = users.findIndex(u => u.username === user.username || u.username === 'current_user');
            
            const updatedUser = {
                username: user.username,
                avatar: user.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.username) + "&background=6366f1&color=fff",
                joinedEvents: achievementsStats.joinedEvents || 8,
                hostedEvents: achievementsStats.hostedEvents || 1,
                rating: 4.8,
                reviews: achievementsStats.fiveStarReviews || 3,
                exp: membership.exp,
                companionBookings: achievementsStats.successfulBookings || 2,
                messagesCount: achievementsStats.chatMessages || 15
            };

            if (index !== -1) {
                users[index] = updatedUser;
            } else {
                users.push(updatedUser);
            }
        } else {
            this.currentUserUsername = 'current_user';
        }

        return users;
    },

    // 7. Bind Tab Event Handlers on full page
    bindFullPageEvents() {
        const tabs = document.querySelectorAll('#leaderboardTabs button');
        tabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = btn.getAttribute('data-category');
                this.currentCategory = category;
                
                // Update active state in UI
                tabs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update headers / titles dynamically
                const titles = {
                    exp: 'Hạng EXP Tích Lũy',
                    hosts: 'Hạng Tổ Chức Sự Kiện',
                    companions: 'Hạng Cho Thuê Bạn Đồng Hành',
                    community: 'Hạng Hoạt Động & Tương Tác'
                };
                const headers = {
                    exp: 'EXP Tích lũy',
                    hosts: 'Sự kiện đã tổ chức',
                    companions: 'Lượt đồng hành thành công',
                    community: 'Số tin nhắn cộng đồng'
                };

                document.getElementById('table-title').textContent = titles[category];
                document.getElementById('table-score-header').textContent = headers[category];
                
                this.renderFullPageLeaderboard();
            });
        });
    },

    // Initialize
    init() {
        // Sync user context
        if (window.auth && window.auth.user) {
            this.currentUserUsername = window.auth.user.username;
        } else {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                try {
                    this.currentUserUsername = JSON.parse(userStr).username;
                } catch(e) {}
            }
        }

        // Render correct UI based on current page HTML structure
        const isDiscoverPage = !!document.getElementById("leaderboard-container");
        const isFullLeaderboardPage = !!document.getElementById("full-leaderboard-tbody");

        if (isDiscoverPage) {
            this.renderLeaderboard();
        }

        if (isFullLeaderboardPage) {
            this.bindFullPageEvents();
            this.renderFullPageLeaderboard();
        }
    }
};

// Start when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to make sure ExpSystem is ready
    setTimeout(() => {
        leaderboardSystem.init();
    }, 500);
});

// Expose globally
window.leaderboardSystem = leaderboardSystem;

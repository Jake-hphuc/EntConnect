/**
 * EntConnect - Community Leaderboard Module
 * Handles rendering the leaderboard widget and modal tab.
 */

const communityLeaderboard = {
    renderLeaderboard(communityId, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let members = window.communityData ? window.communityData.getLeaderboard(communityId) : [];
        
        // Sort by points desc
        members.sort((a, b) => b.points - a.points);

        if (members.length === 0) {
            container.innerHTML = '<p class="text-muted text-center small mb-0">Chưa có dữ liệu xếp hạng.</p>';
            return;
        }

        let html = '';
        members.slice(0, 10).forEach((member, index) => {
            const rank = index + 1;
            let rankClass = '';
            if (rank === 1) rankClass = 'rank-1';
            else if (rank === 2) rankClass = 'rank-2';
            else if (rank === 3) rankClass = 'rank-3';

            const badgeHtml = member.badge ? `<span class="leaderboard-badge">${member.badge}</span>` : '';

            html += `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank ${rankClass}">${rank}</div>
                    <img src="${member.avatar}" alt="${member.name}" class="leaderboard-avatar">
                    <div class="leaderboard-info">
                        <div class="d-flex align-items-center gap-2">
                            <div class="leaderboard-name">${member.name}</div>
                            ${badgeHtml}
                        </div>
                        <div class="leaderboard-points">${member.points.toLocaleString()} điểm đóng góp</div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }
};

window.communityLeaderboard = communityLeaderboard;

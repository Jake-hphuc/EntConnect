/**
 * EntConnect - Community Data Module
 * Provides extended mock data for communities, posts, chat, and leaderboards.
 */

const communityData = {
    // Original fields mapped to new requirements + extra fields
    mockCommunities: [
        { 
            id: 'com_gaming', 
            name: 'Cộng đồng Liên Minh & Valorant', 
            description: 'Nơi tập hợp các cao thủ leo rank. Tham gia để tìm đồng đội và đăng ký giải đấu nội bộ.',
            coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop', 
            tags: ['Gaming', 'eSports', 'Leo rank'],
            memberCount: 2500, 
            activityLevel: 'Rất cao', // High, Medium, Low
            category: 'gaming', 
            isJoined: false,
            latestPost: 'Giải đấu nội bộ tháng này đã mở đăng ký!',
            adminName: 'Faker_VN',
            icon: 'bi-controller',
            pricing: { isFree: false, price: 50000 }
        },
        { 
            id: 'com_music', 
            name: 'Acoustic Lovers VN', 
            description: 'Chill cùng những điệu nhạc Mộc. Giao lưu, chia sẻ bài hát và tổ chức Acoustic cuối tuần.',
            coverImage: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?q=80&w=600&auto=format&fit=crop', 
            tags: ['Music', 'Acoustic', 'Chill'],
            memberCount: 3400, 
            activityLevel: 'Cao',
            category: 'music', 
            isJoined: false,
            latestPost: 'Ai đi xem show anh Vũ tối nay không?',
            adminName: 'Melody_Maker',
            icon: 'bi-music-note-beamed',
            pricing: { isFree: false, price: 100000 }
        },
        { 
            id: 'com_sports', 
            name: 'Vietnam Runners Club', 
            description: 'Rèn luyện sức khỏe, chia sẻ lộ trình chạy và tổ chức các buổi chạy dài (Long Run).',
            coverImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=600&auto=format&fit=crop', 
            tags: ['Sports', 'Marathon', 'Sức khỏe'],
            memberCount: 8100, 
            activityLevel: 'Rất cao',
            category: 'sports', 
            isJoined: false,
            latestPost: 'Hoàn thành 21km đầu tiên của đời người!',
            adminName: 'Run_For_Life',
            icon: 'bi-bicycle',
            pricing: { isFree: false, price: 150000 }
        },
        { 
            id: 'com_movies', 
            name: 'Hội Ghiền Rạp Chiếu Phim', 
            description: 'Review phim có tâm, không spoil. Hay bao rạp để xem các siêu phẩm Marvel/DC.',
            coverImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop', 
            tags: ['Movies', 'Review', 'Marvel'],
            memberCount: 12500, 
            activityLevel: 'Trung bình',
            category: 'movies', 
            isJoined: false,
            latestPost: 'Deadpool 3 quá đỉnh, anh em nên đi xem IMAX nhé!',
            adminName: 'Cine_Fanatic',
            icon: 'bi-film',
            pricing: { isFree: false, price: 20000 }
        },
        { 
            id: 'com_food', 
            name: 'Thực Thần Sài Gòn', 
            description: 'Lùng sục mọi ngóc ngách Sài Gòn để tìm quán ngon. Có các buổi Food Tour hàng tháng.',
            coverImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=600&auto=format&fit=crop', 
            tags: ['Ăn uống', 'Review', 'Food Tour'],
            memberCount: 9800, 
            activityLevel: 'Cao',
            category: 'food', 
            isJoined: false,
            latestPost: 'Quán bún bò gốc Huế siêu ngon ở Quận 3',
            adminName: 'Foodie_Saigon',
            icon: 'bi-cup-hot',
            pricing: { isFree: false, price: 30000 }
        },
        { 
            id: 'com_friends', 
            name: 'Tâm Sự & Tìm Bạn Đồng Hành', 
            description: 'Nơi chia sẻ những niềm vui nỗi buồn, tìm kiếm những người bạn mới để cùng đi cafe, dạo phố.',
            coverImage: 'https://images.unsplash.com/photo-1529156069898-49953eb1b5ce?q=80&w=600&auto=format&fit=crop', 
            tags: ['Tâm sự', 'Tìm bạn', 'Kết nối'],
            memberCount: 5200, 
            activityLevel: 'Trung bình',
            category: 'networking', 
            isJoined: false,
            latestPost: 'Cuối tuần này có ai rảnh đi cafe acoustic với mình không?',
            adminName: 'Heart_Connect',
            icon: 'bi-people-fill',
            pricing: { isFree: true, price: 0 }
        },
        { 
            id: 'com_karaoke', 
            name: 'Hội Đam Mê Ca Hát (Karaoke)', 
            description: 'Dành cho những tâm hồn yêu ca hát. Thường xuyên tổ chức offline các quán Karaoke xịn xò.',
            coverImage: 'https://images.unsplash.com/photo-1516280440502-86927ebc23b2?q=80&w=600&auto=format&fit=crop', 
            tags: ['Karaoke', 'Âm nhạc', 'Party'],
            memberCount: 4100, 
            activityLevel: 'Cao',
            category: 'music', 
            isJoined: false,
            latestPost: 'Set kèo karaoke thứ 7 này ở Nnice nhé anh em',
            adminName: 'Mic_Master',
            icon: 'bi-mic-fill',
            pricing: { isFree: false, price: 100000 }
        }
    ],

    // Mocks for Leaderboard
    mockLeaderboards: {
        'com_gaming': [
            { id: 'u1', name: 'Nguyễn Thanh Tùng', avatar: 'https://i.pravatar.cc/150?u=u1', points: 1520, badge: 'Top Contributor' },
            { id: 'u2', name: 'Lê Minh Huyền', avatar: 'https://i.pravatar.cc/150?u=u2', points: 1200, badge: 'Active Member' },
            { id: 'u3', name: 'Trần Quang Huy', avatar: 'https://i.pravatar.cc/150?u=u3', points: 950, badge: 'Verified' },
            { id: 'u4', name: 'Phạm Ngọc Anh', avatar: 'https://i.pravatar.cc/150?u=u4', points: 800, badge: '' },
            { id: 'u5', name: 'Hoàng Văn Thái', avatar: 'https://i.pravatar.cc/150?u=u5', points: 450, badge: 'Newbie' }
        ],
        'default': [
            { id: 'u6', name: 'User 1', avatar: 'https://i.pravatar.cc/150?u=u6', points: 500, badge: 'Active Member' },
            { id: 'u7', name: 'User 2', avatar: 'https://i.pravatar.cc/150?u=u7', points: 300, badge: '' }
        ]
    },

    // Mocks for Posts
    mockPosts: {
        'com_gaming': [
            { id: 'p1', authorName: 'Faker_VN', authorAvatar: 'https://i.pravatar.cc/150?u=admin1', time: '2 giờ trước', content: 'Giải đấu nội bộ tháng này đã mở đăng ký! Nhanh tay nào anh em.', likes: 45, comments: 12, isLiked: false },
            { id: 'p2', authorName: 'Trần Quang Huy', authorAvatar: 'https://i.pravatar.cc/150?u=u3', time: '5 giờ trước', content: 'Tìm team leo rank Kim Cương tối nay. Mình main Mid nhé.', likes: 12, comments: 5, isLiked: false }
        ],
        'default': [
            { id: 'p3', authorName: 'Admin', authorAvatar: 'https://i.pravatar.cc/150?u=admin', time: '1 ngày trước', content: 'Chào mừng các bạn đến với cộng đồng. Hãy chia sẻ niềm đam mê của mình nhé!', likes: 10, comments: 2, isLiked: false }
        ]
    },

    // Init data into localStorage if not exists
    init() {
        if (!localStorage.getItem('ent_communities')) {
            localStorage.setItem('ent_communities', JSON.stringify(this.mockCommunities));
        }
        if (!localStorage.getItem('ent_community_posts')) {
            localStorage.setItem('ent_community_posts', JSON.stringify(this.mockPosts));
        }
    },

    getCommunities() {
        return JSON.parse(localStorage.getItem('ent_communities')) || [];
    },

    getCommunityById(id) {
        const communities = this.getCommunities();
        return communities.find(c => c.id === id);
    },

    getJoinedCommunities() {
        // Fallback to checking payment logic or localStorage
        let joinedIds = [];
        if (window.payment && typeof window.payment.getJoinedEventIds === 'function') {
             // In payment.js it stores event IDs. Since we treat com_ as events in payment.
             joinedIds = window.payment.getJoinedEventIds().filter(id => id.startsWith('com_'));
        }
        
        // Also check if any community object has isJoined = true in local storage (for those that are free or joined explicitly)
        const communities = this.getCommunities();
        return communities.filter(c => c.isJoined || joinedIds.includes(c.id));
    },

    updateCommunityState(id, isJoined) {
        let communities = this.getCommunities();
        let index = communities.findIndex(c => c.id === id);
        if (index !== -1) {
            communities[index].isJoined = isJoined;
            localStorage.setItem('ent_communities', JSON.stringify(communities));
        }
    },

    getLeaderboard(communityId) {
        return this.mockLeaderboards[communityId] || this.mockLeaderboards['default'];
    }
};

// Initialize on load
communityData.init();
window.communityData = communityData;

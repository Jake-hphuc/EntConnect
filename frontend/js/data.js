/**
 * EntConnect - Mock Database for Activities & Users
 * Provides a rich set of data for the premium UI experience
 * V2: Enhanced with detailed pricing, discounts, and currency
 */

window.mockActivities = [
    {
        _id: 'evt1',
        title: 'Giải đấu Liên Quân Mobile - Vô địch Sinh viên',
        description: 'Giải đấu eSports lớn nhất dành cho sinh viên với tổng giải thưởng lên đến 50 triệu đồng.',
        category: 'gaming',
        tags: ['trending', 'esports', 'student'],
        // Gaming: Khán đài giải đấu eSports chuyên nghiệp, ánh đèn sân khấu, màn hình lớn
        coverImage: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
            endDate: new Date(Date.now() + 86400000 * 2.5).toISOString()
        },
        location: { type: 'venue', venue: { name: 'Nhà thi đấu Hồ Xuân Hương' } },
        pricing: { isFree: false, price: 50000, currency: 'VND', note: 'Vé vào cổng khán giả' },
        maxParticipants: 500,
        currentParticipants: 320,
        creator: { username: 'esports_vn' }
    },
    {
        _id: 'evt10',
        title: 'Valorant Tournament: Radiant Strike',
        description: 'Giải đấu Valorant phong trào cho các team bán chuyên. Cơ hội thể hiện kỹ năng cá nhân.',
        category: 'gaming',
        // Gaming: Tay game đang thi đấu, màn hình RGB, gaming setup chuyên nghiệp
        coverImage: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 4).toISOString(),
        },
        location: { type: 'online', platform: 'Discord / Vietnam Server' },
        pricing: { isFree: false, price: 30000, currency: 'VND', note: 'Phí đăng ký theo team (chia đầu người)' },
        maxParticipants: 64,
        currentParticipants: 40,
        creator: { username: 'valorant_vn' }
    },
    {
        _id: 'evt11',
        title: 'Offline PUBG Mobile: Chicken Dinner',
        description: 'Buổi giao lưu offline kết hợp thi đấu giao hữu PUBG Mobile. Quà tặng hấp dẫn từ nhà phát hành.',
        category: 'gaming',
        tags: ['student', 'offline'],
        // Gaming: Không gian gaming cafe, nhiều người chơi cùng nhau, ánh đèn neon
        coverImage: 'https://images.unsplash.com/photo-1542751110-97427bbecfd8?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 6).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'Gaming Hub Coffee' } },
        pricing: { isFree: false, price: 45000, currency: 'VND', note: 'Bao gồm 1 đồ uống tự chọn' },
        maxParticipants: 100,
        currentParticipants: 75,
        creator: { username: 'pubg_mobile_vn' }
    },
    {
        _id: 'evt3',
        title: 'Đêm nhạc Indie: Những kẻ mộng mơ',
        description: 'Đắm chìm trong không gian âm nhạc indie với sự góp mặt của Ngọt, Chillies và Vũ. Giá vé đã bao gồm 1 phần nước.',
        category: 'music',
        tags: ['trending', 'weekend'],
        // Music: Sân khấu indie sống động, ánh đèn màu, đám đông hào hứng
        coverImage: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 3600000 * 48).toISOString(),
            endDate: new Date(Date.now() + 3600000 * 52).toISOString()
        },
        location: { type: 'venue', venue: { name: 'Lan Anh Club' } },
        pricing: { isFree: false, price: 250000, currency: 'VND', note: 'Khu vực Standard' },
        maxParticipants: 1000,
        currentParticipants: 850,
        creator: { username: 'indie_vietnam' }
    },
    {
        _id: 'evt12',
        title: 'Acoustic Night: Giai điệu mùa Thu',
        description: 'Buổi tối lãng mạn cùng những bản tình ca bất hủ bên ánh nến.',
        category: 'music',
        // Music: Buổi biểu diễn acoustic guitar thân mật, ánh nến ấm áp, không gian nhỏ
        coverImage: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'The Muse Coffee' } },
        pricing: { isFree: false, price: 80000, currency: 'VND', note: 'Vé tham dự & 1 thức uống' },
        maxParticipants: 40,
        currentParticipants: 35,
        creator: { username: 'acoustic_saigon' }
    },
    {
        _id: 'evt13',
        title: 'Rock Fest 2026: Lửa cháy rực cháy',
        description: 'Đại hội nhạc Rock quy tụ những ban nhạc rock hàng đầu Việt Nam.',
        category: 'music',
        // Music: Sân khấu rock ngoài trời, pyrotechnics, khán giả cuồng nhiệt
        coverImage: 'https://images.unsplash.com/photo-1501386761578-eaa54b9e26fa?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 20).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'Sân vận động Quân khu 7' } },
        pricing: { isFree: false, price: 300000, currency: 'VND', note: 'Vé GA' },
        maxParticipants: 5000,
        currentParticipants: 2100,
        creator: { username: 'rock_vn' }
    },
    {
        _id: 'evt5',
        title: 'Giải chạy marathon cự ly 21km HCMC Run',
        description: 'Thử thách bản thân với cự ly bán marathon qua những cây cầu đẹp nhất TP.HCM. Kèm áo Finisher và huy chương.',
        category: 'sports',
        tags: ['weekend', 'marathon'],
        // Sports: Đoàn người chạy marathon trên đường phố, buổi sáng sớm
        coverImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 14).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'Khu đô thị Thủ Thiêm' } },
        pricing: { isFree: false, price: 650000, currency: 'VND', note: 'Gói đăng ký Tiêu chuẩn (BIB + Áo)' },
        maxParticipants: 5000,
        currentParticipants: 4200,
        creator: { username: 'vietnam_marathon' }
    },
    {
        _id: 'evt14',
        title: 'Giải quần vợt phong trào mở rộng',
        description: 'Giải đấu cho mọi lứa tuổi đam mê tennis. Giải thưởng cúp và vợt chuyên dụng.',
        category: 'sports',
        // Sports: Tay vợt đang đánh tennis trên sân, ánh sáng ngoài trời
        coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 12).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'Sân tennis Phú Thọ' } },
        pricing: { isFree: false, price: 200000, currency: 'VND', note: 'Lệ phí thi đấu' },
        maxParticipants: 32,
        currentParticipants: 20,
        creator: { username: 'tennis_club' }
    },
    {
        _id: 'evt15',
        title: 'Giải bóng đá tứ hùng mini (5 người)',
        description: 'Giải bóng đá giao lưu giữa các team doanh nghiệp.',
        category: 'sports',
        // Sports: Trận bóng đá trên sân cỏ xanh, cầu thủ đang thi đấu
        coverImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'Sân vận động K334' } },
        pricing: { isFree: false, price: 150000, currency: 'VND', note: 'Phí tham gia cá nhân' },
        maxParticipants: 40,
        currentParticipants: 30,
        creator: { username: 'football_amateur' }
    },
    {
        _id: 'evt16',
        title: 'Fashion Show: Sắc Xuân 2026',
        description: 'Trình diễn những bộ sưu tập mới nhất từ các nhà thiết kế trẻ tài năng.',
        category: 'fashion',
        // Fashion: Sàn diễn thời trang chuyên nghiệp, người mẫu, đèn spotlight
        coverImage: 'https://images.unsplash.com/photo-1558618047-f4e90e45d511?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 18).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'Gem Center - Diamond Hall' } },
        pricing: { isFree: false, price: 500000, currency: 'VND', note: 'Vé Front Row' },
        maxParticipants: 200,
        currentParticipants: 180,
        creator: { username: 'fashion_week_vn' }
    },
    {
        _id: 'evt17',
        title: 'Workshop: Định hình phong cách cá nhân',
        description: 'Giao lưu cùng các stylist nổi tiếng để tìm ra phong cách phù hợp nhất với bạn.',
        category: 'fashion',
        // Fashion: Buổi workshop về styling, người đang thử đồ, tư vấn phong cách
        coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 9).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'The Coffee House Signature' } },
        pricing: { isFree: false, price: 150000, currency: 'VND', note: 'Bao gồm teabreak' },
        maxParticipants: 30,
        currentParticipants: 22,
        creator: { username: 'style_master' }
    },
    {
        _id: 'evt18',
        title: 'Street Style Photo Walk',
        description: 'Buổi chụp ảnh thời trang đường phố cùng các nhiếp ảnh gia chuyên nghiệp.',
        category: 'fashion',
        // Fashion: Street style thực tế, người chụp ảnh thời trang ngoài đường
        coverImage: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'Phố đi bộ Nguyễn Huệ' } },
        pricing: { isFree: false, price: 100000, currency: 'VND', note: 'Phí tham gia & chỉnh sửa ảnh' },
        maxParticipants: 15,
        currentParticipants: 10,
        creator: { username: 'photo_fashion' }
    },
    {
        _id: 'evt2',
        title: 'Workshop Pha chế Cocktail & Mocktail',
        description: 'Học cách tự tay pha chế những ly cocktail tuyệt đẹp cho buổi tiệc cuối tuần.',
        category: 'food',
        tags: ['dating', 'workshop'],
        // Food: Bartender đang pha chế cocktail, ly cocktail đẹp màu sắc
        coverImage: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 5).toISOString(),
            endDate: new Date(Date.now() + 86400000 * 5.2).toISOString()
        },
        location: { type: 'venue', venue: { name: 'Chill Bar & Lounge - Q1' } },
        pricing: { isFree: false, price: 350000, originalPrice: 500000, currency: 'VND', note: 'Giảm 30% khi đăng ký sớm' },
        maxParticipants: 20,
        currentParticipants: 15,
        creator: { username: 'mixologist_master' }
    },
    {
        _id: 'evt4',
        title: 'Chiếu phim tài liệu: Bí ẩn Vũ trụ',
        description: 'Xem phim tài liệu về hố đen vũ trụ với công nghệ IMAX 3D đỉnh cao.',
        category: 'movies',
        // Movies: Khán giả ngồi trong rạp chiếu phim, màn hình lớn chiếu phim
        coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 1).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'CGV Landmark 81 IMAX' } },
        pricing: { isFree: false, price: 180000, currency: 'VND', note: 'Ghế VIP trung tâm' },
        maxParticipants: 150,
        currentParticipants: 120,
        creator: { username: 'space_explorers' }
    },
    {
        _id: 'evt6',
        title: 'Giải đấu Boardgame: Thách thức Ma Sói',
        description: 'Đêm chơi Ma Sói quy mô lớn nhất thành phố.',
        category: 'board_games',
        // Board Games: Nhóm người ngồi chơi board game thật, cờ tỷ phú, thẻ bài
        coverImage: 'https://images.unsplash.com/photo-1697571434898-a4fd2d9a3a62?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 3600000 * 72).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'The Boardgame Coffee' } },
        pricing: { isFree: false, price: 100000, currency: 'VND', note: 'Bao gồm nước uống không giới hạn' },
        maxParticipants: 60,
        currentParticipants: 45,
        creator: { username: 'werewolf_master' }
    },
    {
        _id: 'evt7',
        title: 'Tour cắm trại: Săn mây Đà Lạt',
        description: 'Chuyến đi 2 ngày 1 đêm lên đỉnh Langbiang săn mây.',
        category: 'travel',
        // Travel: Nhóm bạn cắm trại trên đỉnh núi, lều trại, cảnh mây mù lãng mạn
        coverImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 10).toISOString(),
            endDate: new Date(Date.now() + 86400000 * 12).toISOString()
        },
        location: { type: 'venue', venue: { name: 'Đà Lạt, Lâm Đồng' } },
        pricing: { isFree: false, price: 1500000, originalPrice: 1800000, currency: 'VND', note: 'Bao trọn gói di chuyển & lều trại' },
        maxParticipants: 30,
        currentParticipants: 25,
        creator: { username: 'viet_trekking' }
    },
    {
        _id: 'evt8',
        title: 'Khoá học Thực hành ReactJS trong 48h',
        description: 'Code trại thực hành xây dựng ứng dụng web hiện đại.',
        category: 'technology',
        // Technology: Lập trình viên đang code, màn hình hiển thị code, laptop
        coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 7).toISOString(),
        },
        location: { type: 'online', platform: 'Zoom Meeting / Github' },
        pricing: { isFree: false, price: 890000, currency: 'VND', note: 'Chứng nhận hoàn thành khóa học' },
        maxParticipants: 50,
        currentParticipants: 48,
        creator: { username: 'code_camp' }
    },
    {
        _id: 'evt9',
        title: 'Buổi thử rượu vang (Wine Tasting) & Phô mai',
        description: 'Khám phá 5 loại rượu vang đẳng cấp từ Ý và Pháp.',
        category: 'food',
        // Food: Bàn wine tasting sang trọng, ly rượu vang đỏ, phô mai, không khí tinh tế
        coverImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop',
        schedule: {
            startDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        },
        location: { type: 'venue', venue: { name: 'The Wine House - Thảo Điền' } },
        pricing: { isFree: false, price: 450000, currency: 'VND', note: 'Kèm set phô mai thượng hạng' },
        maxParticipants: 15,
        currentParticipants: 8,
        creator: { username: 'wine_lovers' }
    }
];

// Mock users for "Buddy Connect"
window.mockUsers = [
    {
        id: 'user1',
        username: 'thanh_tung',
        fullName: 'Nguyễn Thanh Tùng',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200&auto=format&fit=crop',
        bio: 'Đam mê du lịch bụi và chụp ảnh.',
        interests: ['Du lịch', 'Nhiếp ảnh', 'Âm nhạc']
    },
    {
        id: 'user2',
        username: 'minh_huyen',
        fullName: 'Lê Minh Huyền',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        bio: 'Mọt phim chính hiệu, thích boardgame.',
        interests: ['Phim ảnh', 'Boardgame', 'Âm thực']
    },
    {
        id: 'user3',
        username: 'quang_huy',
        fullName: 'Trần Quang Huy',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        bio: 'Coder by day, Gamer by night.',
        interests: ['Công nghệ', 'Gaming', 'Thể thao']
    },
    {
        id: 'user4',
        username: 'ngoc_anh',
        fullName: 'Phạm Ngọc Anh',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
        bio: 'Thích chạy bộ và các hoạt động ngoài trời.',
        interests: ['Thể thao', 'Du lịch', 'Âm nhạc']
    }
];

// Mock transactions for dashboard
window.mockTransactions = [
    {
        id: 'TXN-1713500000000',
        eventId: 'evt1',
        eventTitle: 'Giải đấu Liên Quân Mobile',
        eventCategory: 'gaming',
        amount: 50000,
        method: 'qr',
        status: 'completed',
        date: '2026-04-19T10:30:00Z',
        userName: 'dhoangphuc'
    },
    {
        id: 'TXN-1713400000000',
        eventId: 'evt3',
        eventTitle: 'Đêm nhạc Indie',
        eventCategory: 'music',
        amount: 250000,
        method: 'card',
        cardLast4: '4242',
        status: 'completed',
        date: '2026-04-18T20:15:00Z',
        userName: 'dhoangphuc'
    }
];

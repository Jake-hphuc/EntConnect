/**
 * EntConnect - Hire Companion Mock Data
 * 12 companions đa dạng + reviews mẫu
 */

window.mockCompanions = [
    {
        _id: 'cp1', name: 'Linh Miêu (Lynx)', username: 'lynx_gaming', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        bio: 'Chào mọi người! Mình là Linh, đã chơi game được 5 năm. Mình rất thích kết bạn mới và sẵn sàng cùng bạn leo rank hay chỉ đơn giản là tâm sự sau một ngày mệt mỏi.',
        services: ['gaming', 'chat'], skills: ['League of Legends', 'Valorant', 'Tâm sự', 'PUBG Mobile'],
        pricePerHour: 100000, rating: 4.9, reviewsCount: 128, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['hot', 'top-rated'],
        availability: { mon: ['18:00-22:00'], tue: ['18:00-22:00'], wed: ['18:00-22:00'], thu: ['18:00-22:00'], fri: ['14:00-23:00'], sat: ['10:00-23:00'], sun: ['10:00-22:00'] },
        gallery: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600']
    },
    {
        _id: 'cp2', name: 'Hoàng Bách', username: 'bach_singer', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
        bio: 'Nếu bạn cần một giọng ca để cùng song ca karaoke online hoặc đơn giản muốn nghe guitar acoustic buổi tối, mình luôn sẵn sàng!',
        services: ['karaoke', 'chat'], skills: ['Hát hay', 'Guitar', 'Hài hước', 'Bolero'],
        pricePerHour: 150000, rating: 4.8, reviewsCount: 85, status: 'online', verified: true,
        location: 'Hà Nội', tags: ['popular'],
        availability: { mon: ['19:00-23:00'], tue: ['19:00-23:00'], wed: [], thu: ['19:00-23:00'], fri: ['17:00-24:00'], sat: ['14:00-24:00'], sun: ['14:00-22:00'] },
        gallery: []
    },
    {
        _id: 'cp3', name: 'Thảo Vy', username: 'vy_companion', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop',
        bio: 'Mình thích xem phim, đi sự kiện và giao lưu kết bạn. Nếu bạn cần một người bạn đồng hành đáng tin cậy cho buổi event hay movie night, hãy chọn mình nhé!',
        services: ['movie', 'event'], skills: ['Xem phim', 'Đi sự kiện', 'Giao tiếp tốt', 'Nhiếp ảnh'],
        pricePerHour: 120000, rating: 4.7, reviewsCount: 62, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['new'],
        availability: { mon: ['17:00-21:00'], tue: [], wed: ['17:00-21:00'], thu: ['17:00-21:00'], fri: ['15:00-23:00'], sat: ['09:00-23:00'], sun: ['09:00-20:00'] },
        gallery: []
    },
    {
        _id: 'cp4', name: 'Minh Đức', username: 'duc_pro', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
        bio: 'Challenger Valorant, Grandmaster LOL. Mình có thể coach bạn leo rank hoặc cùng chơi cho vui. Kinh nghiệm dạy game 3 năm.',
        services: ['gaming', 'teaching'], skills: ['Valorant Radiant', 'LOL Challenger', 'Coach', 'Genshin Impact'],
        pricePerHour: 200000, rating: 4.9, reviewsCount: 210, status: 'busy', verified: true,
        location: 'Đà Nẵng', tags: ['top-rated', 'hot'],
        availability: { mon: ['20:00-24:00'], tue: ['20:00-24:00'], wed: ['20:00-24:00'], thu: ['20:00-24:00'], fri: ['18:00-02:00'], sat: ['10:00-02:00'], sun: ['10:00-24:00'] },
        gallery: []
    },
    {
        _id: 'cp5', name: 'Hà Linh', username: 'linh_sweet', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop',
        bio: 'Giọng hát ngọt ngào, tính cách vui vẻ. Mình có thể hát karaoke, xem phim cùng bạn hoặc chỉ đơn giản là trò chuyện. Luôn mang lại năng lượng tích cực!',
        services: ['karaoke', 'chat', 'movie'], skills: ['Hát ballad', 'Tâm lý', 'Xem phim kinh dị', 'Nấu ăn'],
        pricePerHour: 180000, rating: 4.6, reviewsCount: 45, status: 'online', verified: false,
        location: 'TP.HCM', tags: [],
        availability: { mon: ['18:00-22:00'], tue: ['18:00-22:00'], wed: ['18:00-22:00'], thu: [], fri: ['16:00-24:00'], sat: ['12:00-24:00'], sun: ['12:00-22:00'] },
        gallery: []
    },
    {
        _id: 'cp6', name: 'Quốc Anh', username: 'anh_gamer', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop',
        bio: 'Gamer casual, thích đi sự kiện esports và meetup. Giá cả phải chăng, tính tình vui vẻ, hòa đồng.',
        services: ['gaming', 'event'], skills: ['Liên Quân', 'FIFA Online', 'Đi sự kiện', 'MC'],
        pricePerHour: 80000, rating: 4.5, reviewsCount: 33, status: 'offline', verified: false,
        location: 'Hà Nội', tags: [],
        availability: { mon: [], tue: ['19:00-22:00'], wed: [], thu: ['19:00-22:00'], fri: ['18:00-23:00'], sat: ['10:00-23:00'], sun: [] },
        gallery: []
    },
    {
        _id: 'cp7', name: 'Ngọc Trinh', username: 'trinh_vip', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=400&auto=format&fit=crop',
        bio: 'VIP Companion với 5 sao tuyệt đối. Mình có thể đồng hành cùng bạn trong mọi hoạt động từ xem phim, đi sự kiện đến tâm sự chuyện đời.',
        services: ['chat', 'movie', 'event'], skills: ['Giao tiếp xuất sắc', 'Fashionista', 'Kỹ năng MC', 'Tư vấn'],
        pricePerHour: 250000, rating: 5.0, reviewsCount: 95, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['top-rated', 'hot', 'vip'],
        availability: { mon: ['10:00-20:00'], tue: ['10:00-20:00'], wed: ['10:00-20:00'], thu: ['10:00-20:00'], fri: ['10:00-22:00'], sat: ['10:00-22:00'], sun: ['12:00-20:00'] },
        gallery: []
    },
    {
        _id: 'cp8', name: 'Tuấn Kiệt', username: 'kiet_fun', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop',
        bio: 'Vừa chơi game vừa hát karaoke, năng lượng không giới hạn! Mình là kiểu người party animal, luôn mang lại tiếng cười.',
        services: ['gaming', 'karaoke'], skills: ['PUBG', 'Hát rap', 'Beat box', 'Among Us'],
        pricePerHour: 90000, rating: 4.3, reviewsCount: 28, status: 'online', verified: false,
        location: 'Cần Thơ', tags: ['new'],
        availability: { mon: ['20:00-24:00'], tue: ['20:00-24:00'], wed: ['20:00-24:00'], thu: ['20:00-24:00'], fri: ['18:00-02:00'], sat: ['14:00-02:00'], sun: ['14:00-24:00'] },
        gallery: []
    },
    {
        _id: 'cp9', name: 'Mai Phương', username: 'phuong_elegant', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=400&auto=format&fit=crop',
        bio: 'Thích tâm sự và đồng hành đi sự kiện. Mình có kinh nghiệm làm MC và dẫn chương trình, luôn tạo không khí vui vẻ và thoải mái.',
        services: ['chat', 'event'], skills: ['MC', 'Tâm sự', 'Networking', 'Thời trang'],
        pricePerHour: 160000, rating: 4.8, reviewsCount: 72, status: 'booked', verified: true,
        location: 'TP.HCM', tags: ['popular'],
        availability: { mon: ['14:00-20:00'], tue: ['14:00-20:00'], wed: [], thu: ['14:00-20:00'], fri: ['12:00-22:00'], sat: ['10:00-22:00'], sun: ['10:00-18:00'] },
        gallery: []
    },
    {
        _id: 'cp10', name: 'Đức Huy', username: 'huy_casual', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop',
        bio: 'Chơi game casual cho vui, không toxic. Đơn giản là muốn có bạn chơi game cùng vào buổi tối.',
        services: ['gaming'], skills: ['Liên Quân', 'PUBG Mobile', 'Minecraft'],
        pricePerHour: 70000, rating: 4.2, reviewsCount: 15, status: 'offline', verified: false,
        location: 'Bình Dương', tags: [],
        availability: { mon: ['20:00-23:00'], tue: ['20:00-23:00'], wed: ['20:00-23:00'], thu: ['20:00-23:00'], fri: ['19:00-24:00'], sat: ['15:00-24:00'], sun: ['15:00-23:00'] },
        gallery: []
    },
    {
        _id: 'cp11', name: 'Bích Ngọc', username: 'ngoc_melody', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
        bio: 'Ca sĩ online, thích xem phim tài liệu và phim nghệ thuật. Mình có thể hát live cho bạn nghe hoặc cùng xem movie marathon cả đêm.',
        services: ['karaoke', 'movie'], skills: ['Hát live', 'Phim tài liệu', 'Piano', 'Anime'],
        pricePerHour: 130000, rating: 4.7, reviewsCount: 56, status: 'online', verified: true,
        location: 'Hà Nội', tags: ['popular'],
        availability: { mon: ['17:00-22:00'], tue: ['17:00-22:00'], wed: ['17:00-22:00'], thu: ['17:00-22:00'], fri: ['15:00-24:00'], sat: ['12:00-24:00'], sun: ['12:00-22:00'] },
        gallery: []
    },
    {
        _id: 'cp12', name: 'Trung Hiếu', username: 'hieu_master', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop',
        bio: 'Coach esports chuyên nghiệp + đồng hành sự kiện. 5 năm kinh nghiệm huấn luyện đội tuyển, giúp bạn cải thiện gameplay nhanh chóng.',
        services: ['teaching', 'gaming', 'event'], skills: ['Coach LOL', 'Coach Valorant', 'Phân tích gameplay', 'Đi sự kiện esports'],
        pricePerHour: 220000, rating: 4.9, reviewsCount: 180, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['top-rated', 'hot'],
        availability: { mon: ['09:00-12:00','14:00-22:00'], tue: ['09:00-12:00','14:00-22:00'], wed: ['09:00-12:00','14:00-22:00'], thu: ['09:00-12:00','14:00-22:00'], fri: ['09:00-24:00'], sat: ['09:00-24:00'], sun: ['10:00-22:00'] },
        gallery: []
    },
    // ===== Nhân vật nổi tiếng & bổ sung =====
    {
        _id: 'cp13', name: 'Sơn Tùng M-TP', username: 'sontung_mtp', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=400&auto=format&fit=crop',
        bio: 'Ca sĩ, nhạc sĩ hàng đầu Việt Nam. Hãy để mình cùng bạn hát karaoke những bản hit triệu view hoặc tâm sự về âm nhạc và cuộc sống.',
        services: ['karaoke', 'chat', 'event'], skills: ['Hát hit', 'Sáng tác', 'Rap', 'Vũ đạo'],
        pricePerHour: 500000, rating: 5.0, reviewsCount: 520, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['vip', 'hot', 'top-rated'],
        availability: { mon: ['20:00-23:00'], tue: [], wed: ['20:00-23:00'], thu: [], fri: ['19:00-24:00'], sat: ['14:00-24:00'], sun: ['14:00-22:00'] }, gallery: []
    },
    {
        _id: 'cp14', name: 'Trấn Thành', username: 'tranthanh_mc', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
        bio: 'MC quốc dân, diễn viên hài. Mình sẽ mang đến tiếng cười không ngớt cho buổi trò chuyện. Đi sự kiện cùng mình luôn sôi động!',
        services: ['chat', 'event', 'karaoke'], skills: ['MC', 'Hài kịch', 'Tâm sự sâu', 'Dẫn chương trình'],
        pricePerHour: 450000, rating: 4.9, reviewsCount: 380, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['vip', 'hot'],
        availability: { mon: ['14:00-18:00'], tue: ['14:00-18:00'], wed: [], thu: ['14:00-18:00'], fri: ['18:00-23:00'], sat: ['10:00-23:00'], sun: ['10:00-20:00'] }, gallery: []
    },
    {
        _id: 'cp15', name: 'Ninh Dương Lan Ngọc', username: 'lanngoc_star', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop',
        bio: 'Nữ hoàng phòng vé, diễn viên đa tài. Mình thích xem phim, đi sự kiện thời trang và tâm sự chuyện đời. Rất hợp với bạn nào yêu điện ảnh!',
        services: ['movie', 'event', 'chat'], skills: ['Diễn xuất', 'Phân tích phim', 'Thời trang', 'Nhảy'],
        pricePerHour: 400000, rating: 4.9, reviewsCount: 290, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['vip', 'top-rated'],
        availability: { mon: ['10:00-16:00'], tue: ['10:00-16:00'], wed: ['10:00-16:00'], thu: [], fri: ['18:00-23:00'], sat: ['10:00-22:00'], sun: ['12:00-20:00'] }, gallery: []
    },
    {
        _id: 'cp16', name: 'Faker (Lee Sang-hyeok)', username: 'faker_lol', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop',
        bio: 'Huyền thoại LOL thế giới. 3 lần vô địch CKTG. Mình có thể coach bạn từ cơ bản đến cao cấp, phân tích gameplay chi tiết.',
        services: ['gaming', 'teaching'], skills: ['LOL World Champion', 'Mid lane', 'Macro game', 'Phân tích VOD'],
        pricePerHour: 600000, rating: 5.0, reviewsCount: 450, status: 'busy', verified: true,
        location: 'Seoul, Hàn Quốc', tags: ['vip', 'hot', 'top-rated'],
        availability: { mon: ['22:00-02:00'], tue: ['22:00-02:00'], wed: [], thu: ['22:00-02:00'], fri: ['20:00-03:00'], sat: ['15:00-03:00'], sun: ['15:00-24:00'] }, gallery: []
    },
    {
        _id: 'cp17', name: 'Amee', username: 'amee_music', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=400&auto=format&fit=crop',
        bio: 'Gen Z Queen, ca sĩ triệu view. Mình thích hát karaoke, xem phim và tâm sự. Năng lượng tích cực, vui vẻ, luôn sẵn sàng!',
        services: ['karaoke', 'chat', 'movie'], skills: ['Hát pop', 'Sáng tác', 'Vlog', 'Dance'],
        pricePerHour: 350000, rating: 4.8, reviewsCount: 200, status: 'online', verified: true,
        location: 'Hà Nội', tags: ['hot', 'popular'],
        availability: { mon: ['18:00-22:00'], tue: ['18:00-22:00'], wed: ['18:00-22:00'], thu: ['18:00-22:00'], fri: ['16:00-24:00'], sat: ['12:00-24:00'], sun: ['12:00-22:00'] }, gallery: []
    },
    {
        _id: 'cp18', name: 'ViruSs (Đặng Tiến Hoàng)', username: 'viruss_streamer', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1537511446984-935f663eb1f4?q=80&w=400&auto=format&fit=crop',
        bio: 'Streamer huyền thoại, nhà đầu tư esports. Mình có thể cùng bạn chơi game, review nhạc hoặc chia sẻ kinh nghiệm kinh doanh.',
        services: ['gaming', 'chat', 'teaching'], skills: ['LMHT', 'Review nhạc', 'Business talk', 'Streaming tips'],
        pricePerHour: 380000, rating: 4.8, reviewsCount: 310, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['hot', 'popular'],
        availability: { mon: ['20:00-24:00'], tue: ['20:00-24:00'], wed: ['20:00-24:00'], thu: ['20:00-24:00'], fri: ['18:00-02:00'], sat: ['14:00-02:00'], sun: ['14:00-24:00'] }, gallery: []
    },
    {
        _id: 'cp19', name: 'Chi Pu', username: 'chipu_queen', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=400&auto=format&fit=crop',
        bio: 'Ca sĩ, diễn viên đa năng. Mình sẵn sàng cùng bạn hát karaoke, đi sự kiện hoặc chỉ đơn giản là trò chuyện và chia sẻ.',
        services: ['karaoke', 'event', 'chat'], skills: ['Hát', 'Diễn xuất', 'Dance', 'Fashion'],
        pricePerHour: 420000, rating: 4.7, reviewsCount: 175, status: 'booked', verified: true,
        location: 'TP.HCM', tags: ['vip'],
        availability: { mon: ['14:00-19:00'], tue: [], wed: ['14:00-19:00'], thu: [], fri: ['18:00-23:00'], sat: ['10:00-22:00'], sun: ['12:00-20:00'] }, gallery: []
    },
    {
        _id: 'cp20', name: 'Độ Mixi (Phùng Thanh Độ)', username: 'domixi_gaming', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=400&auto=format&fit=crop',
        bio: 'Streamer PUBG triệu fan. Mình chơi game cực vui, hài hước tự nhiên. Cùng mình leo rank hoặc chơi custom cho vui nhé!',
        services: ['gaming', 'chat'], skills: ['PUBG', 'GTA V', 'Minecraft', 'Hài hước'],
        pricePerHour: 350000, rating: 4.9, reviewsCount: 420, status: 'online', verified: true,
        location: 'Hà Nội', tags: ['hot', 'top-rated'],
        availability: { mon: ['20:00-02:00'], tue: ['20:00-02:00'], wed: ['20:00-02:00'], thu: ['20:00-02:00'], fri: ['18:00-03:00'], sat: ['14:00-03:00'], sun: ['14:00-24:00'] }, gallery: []
    },
    {
        _id: 'cp21', name: 'Hương Giang Idol', username: 'huonggiang_hg', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1514315384763-ba401779410f?q=80&w=400&auto=format&fit=crop',
        bio: 'Hoa hậu, ca sĩ nổi tiếng. Mình thích đi sự kiện thời trang, tâm sự về cuộc sống và xem phim lãng mạn.',
        services: ['event', 'chat', 'movie'], skills: ['Thời trang', 'Tư vấn beauty', 'MC', 'Yoga'],
        pricePerHour: 480000, rating: 4.8, reviewsCount: 160, status: 'offline', verified: true,
        location: 'TP.HCM', tags: ['vip'],
        availability: { mon: [], tue: ['10:00-16:00'], wed: [], thu: ['10:00-16:00'], fri: ['14:00-22:00'], sat: ['10:00-22:00'], sun: ['10:00-18:00'] }, gallery: []
    },
    {
        _id: 'cp22', name: 'Thầy Ba (Lê Bá Thắng)', username: 'thayba_lol', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1548449112-96a38a643324?q=80&w=400&auto=format&fit=crop',
        bio: 'BLV esports huyền thoại, streamer LOL. Cùng mình chơi game, nghe bình luận live hoặc học cách phân tích trận đấu chuyên nghiệp.',
        services: ['gaming', 'teaching', 'chat'], skills: ['BLV LOL', 'Phân tích meta', 'Hài hước', 'Storytelling'],
        pricePerHour: 300000, rating: 4.9, reviewsCount: 340, status: 'online', verified: true,
        location: 'Hà Nội', tags: ['hot', 'top-rated'],
        availability: { mon: ['19:00-24:00'], tue: ['19:00-24:00'], wed: ['19:00-24:00'], thu: ['19:00-24:00'], fri: ['18:00-02:00'], sat: ['10:00-02:00'], sun: ['10:00-24:00'] }, gallery: []
    },
    {
        _id: 'cp23', name: 'Karik', username: 'karik_rapper', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=400&auto=format&fit=crop',
        bio: 'Rapper nổi tiếng, HLV Rap Việt. Mình có thể cùng bạn hát rap, karaoke hoặc chia sẻ về âm nhạc underground.',
        services: ['karaoke', 'chat', 'teaching'], skills: ['Rap', 'Sáng tác lyrics', 'Beatmaking', 'Mentor'],
        pricePerHour: 400000, rating: 4.8, reviewsCount: 190, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['hot', 'popular'],
        availability: { mon: ['20:00-24:00'], tue: [], wed: ['20:00-24:00'], thu: [], fri: ['18:00-02:00'], sat: ['14:00-02:00'], sun: ['14:00-22:00'] }, gallery: []
    },
    {
        _id: 'cp24', name: 'Lê Bống', username: 'lebong_cute', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1529068755536-a5ade0dcb4e8?q=80&w=400&auto=format&fit=crop',
        bio: 'TikToker triệu follow, vui vẻ và dễ thương. Mình thích trò chuyện, xem phim hài và chơi game nhẹ nhàng.',
        services: ['chat', 'movie', 'gaming'], skills: ['TikTok', 'Hài hước', 'Nấu ăn', 'Among Us'],
        pricePerHour: 200000, rating: 4.6, reviewsCount: 88, status: 'online', verified: true,
        location: 'Hà Nội', tags: ['popular'],
        availability: { mon: ['18:00-22:00'], tue: ['18:00-22:00'], wed: ['18:00-22:00'], thu: ['18:00-22:00'], fri: ['16:00-24:00'], sat: ['10:00-24:00'], sun: ['10:00-22:00'] }, gallery: []
    },
    {
        _id: 'cp25', name: 'PewPew (Hoàng Văn Khoa)', username: 'pewpew_stream', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=400&auto=format&fit=crop',
        bio: 'Streamer OG, chủ quán café nổi tiếng. Mình chơi game vui vẻ, tâm sự chân thành. Cùng chơi LOL hay PUBG nha!',
        services: ['gaming', 'chat'], skills: ['LOL', 'PUBG', 'Business', 'Tâm sự đêm khuya'],
        pricePerHour: 280000, rating: 4.7, reviewsCount: 250, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['popular'],
        availability: { mon: ['21:00-02:00'], tue: ['21:00-02:00'], wed: ['21:00-02:00'], thu: ['21:00-02:00'], fri: ['20:00-03:00'], sat: ['16:00-03:00'], sun: ['16:00-24:00'] }, gallery: []
    },
    {
        _id: 'cp26', name: 'Misthy (Nguyễn Ngọc Thảo)', username: 'misthy_gaming', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop',
        bio: 'Nữ streamer hàng đầu, dễ thương và hài hước. Mình có thể chơi game cùng bạn, hát karaoke hoặc chỉ đơn giản là nói chuyện vui!',
        services: ['gaming', 'karaoke', 'chat'], skills: ['Liên Quân', 'LOL', 'Hát', 'Vlog'],
        pricePerHour: 320000, rating: 4.8, reviewsCount: 280, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['hot', 'popular'],
        availability: { mon: ['19:00-24:00'], tue: ['19:00-24:00'], wed: ['19:00-24:00'], thu: ['19:00-24:00'], fri: ['17:00-02:00'], sat: ['12:00-02:00'], sun: ['12:00-24:00'] }, gallery: []
    },
    {
        _id: 'cp27', name: 'Đen Vâu', username: 'denvau_rap', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?q=80&w=400&auto=format&fit=crop',
        bio: 'Rapper triệu view, triết lý sống giản dị. Cùng mình tâm sự về cuộc đời, nghe nhạc hay hát karaoke những bài rap đời thường.',
        services: ['chat', 'karaoke'], skills: ['Rap triết lý', 'Sáng tác', 'Guitar', 'Cà phê sáng'],
        pricePerHour: 450000, rating: 5.0, reviewsCount: 360, status: 'busy', verified: true,
        location: 'TP.HCM', tags: ['vip', 'top-rated'],
        availability: { mon: [], tue: ['19:00-22:00'], wed: [], thu: ['19:00-22:00'], fri: ['18:00-23:00'], sat: ['14:00-23:00'], sun: ['14:00-20:00'] }, gallery: []
    },
    {
        _id: 'cp28', name: 'Phan Mạnh Quỳnh', username: 'manhquynh_music', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?q=80&w=400&auto=format&fit=crop',
        bio: 'Nhạc sĩ tài hoa, ca sĩ ballad hàng đầu. Mình sẵn sàng hát live cho bạn nghe, song ca karaoke hoặc chia sẻ về sáng tác nhạc.',
        services: ['karaoke', 'chat', 'teaching'], skills: ['Ballad', 'Sáng tác', 'Guitar', 'Piano'],
        pricePerHour: 380000, rating: 4.9, reviewsCount: 220, status: 'online', verified: true,
        location: 'Nghệ An', tags: ['top-rated'],
        availability: { mon: ['19:00-23:00'], tue: [], wed: ['19:00-23:00'], thu: [], fri: ['18:00-24:00'], sat: ['14:00-24:00'], sun: ['14:00-22:00'] }, gallery: []
    },
    {
        _id: 'cp29', name: 'Linh Ka', username: 'linhka_idol', gender: 'female',
        avatar: 'https://images.unsplash.com/photo-1520483691742-bada60a1edd6?q=80&w=400&auto=format&fit=crop',
        bio: 'Hot girl Gen Z, TikToker và streamer. Mình thích chơi game, xem phim anime và nói chuyện vui vẻ. Năng lượng tích cực 100%!',
        services: ['gaming', 'movie', 'chat'], skills: ['Genshin Impact', 'Anime', 'TikTok', 'Dance'],
        pricePerHour: 180000, rating: 4.5, reviewsCount: 110, status: 'online', verified: true,
        location: 'Hà Nội', tags: ['popular'],
        availability: { mon: ['17:00-22:00'], tue: ['17:00-22:00'], wed: ['17:00-22:00'], thu: ['17:00-22:00'], fri: ['15:00-24:00'], sat: ['10:00-24:00'], sun: ['10:00-22:00'] }, gallery: []
    },
    {
        _id: 'cp30', name: 'Optimus (Trần Văn Cường)', username: 'optimus_mid', gender: 'male',
        avatar: 'https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=400&auto=format&fit=crop',
        bio: 'Tuyển thủ LOL huyền thoại Việt Nam. Mid laner đẳng cấp thế giới. Mình coach chi tiết từ laning phase đến teamfight.',
        services: ['gaming', 'teaching'], skills: ['LOL Pro', 'Mid lane master', 'Macro coaching', 'VOD review'],
        pricePerHour: 350000, rating: 4.9, reviewsCount: 300, status: 'online', verified: true,
        location: 'TP.HCM', tags: ['hot', 'top-rated'],
        availability: { mon: ['14:00-18:00','20:00-24:00'], tue: ['14:00-18:00','20:00-24:00'], wed: ['14:00-18:00','20:00-24:00'], thu: ['14:00-18:00','20:00-24:00'], fri: ['14:00-02:00'], sat: ['10:00-02:00'], sun: ['10:00-24:00'] }, gallery: []
    }
];

/* ---- Mock Reviews ---- */
window.mockHireReviews = [
    { _id: 'rv1', companionId: 'cp1', userId: 'u1', userName: 'Minh Tú', userAvatar: 'https://i.pravatar.cc/40?u=rv1', rating: 5, comment: 'Chơi game rất vui, Linh rất hòa đồng và hài hước. Sẽ thuê lại!', createdAt: '2026-05-01T10:00:00Z' },
    { _id: 'rv2', companionId: 'cp1', userId: 'u2', userName: 'Hùng Nguyễn', userAvatar: 'https://i.pravatar.cc/40?u=rv2', rating: 5, comment: 'Leo rank cùng Linh cực kỳ hiệu quả. Từ Bạc lên Vàng chỉ trong 3h!', createdAt: '2026-04-28T18:00:00Z' },
    { _id: 'rv3', companionId: 'cp1', userId: 'u3', userName: 'Trà My', userAvatar: 'https://i.pravatar.cc/40?u=rv3', rating: 4, comment: 'Rất dễ thương, nói chuyện vui. Hơi muộn 5 phút nhưng không sao.', createdAt: '2026-04-25T20:00:00Z' },
    { _id: 'rv4', companionId: 'cp2', userId: 'u4', userName: 'Lan Anh', userAvatar: 'https://i.pravatar.cc/40?u=rv4', rating: 5, comment: 'Giọng hát của Bách quá hay luôn, hát mãi không muốn dừng!', createdAt: '2026-05-02T21:00:00Z' },
    { _id: 'rv5', companionId: 'cp2', userId: 'u5', userName: 'Đức Anh', userAvatar: 'https://i.pravatar.cc/40?u=rv5', rating: 5, comment: 'Song ca cực đỉnh, beatbox nữa chứ! Rất đáng tiền.', createdAt: '2026-04-30T22:00:00Z' },
    { _id: 'rv6', companionId: 'cp4', userId: 'u6', userName: 'Quang Hải', userAvatar: 'https://i.pravatar.cc/40?u=rv6', rating: 5, comment: 'Coach cực kỳ chuyên nghiệp. Đức chỉ cho mình rất nhiều kỹ thuật mới.', createdAt: '2026-05-03T15:00:00Z' },
    { _id: 'rv7', companionId: 'cp4', userId: 'u7', userName: 'Thanh Hà', userAvatar: 'https://i.pravatar.cc/40?u=rv7', rating: 5, comment: 'Từ Iron lên Gold sau 5 buổi coaching. Quá xứng đáng!', createdAt: '2026-05-01T16:00:00Z' },
    { _id: 'rv8', companionId: 'cp7', userId: 'u8', userName: 'Phúc Lê', userAvatar: 'https://i.pravatar.cc/40?u=rv8', rating: 5, comment: 'Ngọc Trinh rất chuyên nghiệp, giao tiếp tuyệt vời. VIP xứng đáng!', createdAt: '2026-05-04T14:00:00Z' },
    { _id: 'rv9', companionId: 'cp7', userId: 'u9', userName: 'Minh Châu', userAvatar: 'https://i.pravatar.cc/40?u=rv9', rating: 5, comment: 'Đi event cùng rất vui, được nhiều người khen.', createdAt: '2026-05-02T19:00:00Z' },
    { _id: 'rv10', companionId: 'cp3', userId: 'u10', userName: 'Kim Ngân', userAvatar: 'https://i.pravatar.cc/40?u=rv10', rating: 4, comment: 'Xem phim cùng Thảo Vy rất thú vị, mình thích cách bạn ấy phân tích phim.', createdAt: '2026-04-29T20:00:00Z' },
    { _id: 'rv11', companionId: 'cp9', userId: 'u11', userName: 'Việt Hoàng', userAvatar: 'https://i.pravatar.cc/40?u=rv11', rating: 5, comment: 'Mai Phương dẫn chương trình cực hay, đi event cùng vui lắm!', createdAt: '2026-05-03T18:00:00Z' },
    { _id: 'rv12', companionId: 'cp11', userId: 'u12', userName: 'Thu Hà', userAvatar: 'https://i.pravatar.cc/40?u=rv12', rating: 5, comment: 'Ngọc hát live hay quá trời! Nghe mê mẩn luôn. Piano nữa!', createdAt: '2026-05-01T21:00:00Z' },
    { _id: 'rv13', companionId: 'cp12', userId: 'u13', userName: 'Duy Khánh', userAvatar: 'https://i.pravatar.cc/40?u=rv13', rating: 5, comment: 'Coach Hiếu phân tích replay rất kỹ, chỉ ra hết lỗi sai. Recommend!', createdAt: '2026-05-04T11:00:00Z' },
    { _id: 'rv14', companionId: 'cp12', userId: 'u14', userName: 'Bảo Ngọc', userAvatar: 'https://i.pravatar.cc/40?u=rv14', rating: 5, comment: 'Đi sự kiện esports cùng anh Hiếu rất tuyệt, được giới thiệu nhiều người.', createdAt: '2026-05-02T13:00:00Z' },
    { _id: 'rv15', companionId: 'cp5', userId: 'u15', userName: 'Phong Vũ', userAvatar: 'https://i.pravatar.cc/40?u=rv15', rating: 4, comment: 'Hà Linh hát hay, tính cách rất dễ thương. Xem phim kinh dị cùng thú vị!', createdAt: '2026-04-27T22:00:00Z' },
    { _id: 'rv16', companionId: 'cp8', userId: 'u16', userName: 'Quỳnh Như', userAvatar: 'https://i.pravatar.cc/40?u=rv16', rating: 4, comment: 'Tuấn Kiệt vui tính, beat box giỏi, chơi game cũng được.', createdAt: '2026-04-26T20:00:00Z' }
];

/* ---- Mock VIP Charity Auctions ---- */
window.mockAuctions = [
    {
        _id: 'auc1',
        celebrityId: 'cp13',
        name: 'Sơn Tùng M-TP',
        avatar: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?q=80&w=400&auto=format&fit=crop',
        title: 'Buổi tối gặp mặt ấm cúng & song ca cùng Sơn Tùng M-TP',
        description: 'Đặc quyền có một không hai! Bạn sẽ được tham gia buổi tối gặp mặt, ăn nhẹ ấm cúng cùng Sơn Tùng M-TP tại phòng trà VIP của M-TP Entertainment, đàm đạo về âm nhạc, cuộc sống, lưu giữ khoảnh khắc và đặc biệt song ca mộc bài hát yêu thích.',
        startingBid: 15000000,
        currentBid: 28000000,
        minIncrement: 1000000,
        highestBidder: 'tuan_anh_sky',
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 3.5).toISOString(),
        bidCount: 24,
        charityName: 'Quỹ Cặp Lá Yêu Thương (VTV)',
        charityPercent: 70,
        celebrityPercent: 20,
        platformPercent: 10,
        bidsHistory: [
            { bidder: 'tuan_anh_sky', amount: 28000000, time: '5 phút trước' },
            { bidder: 'lan_anh_mtp', amount: 27000000, time: '12 phút trước' },
            { bidder: 'duy_khanh', amount: 25000000, time: '20 phút trước' },
            { bidder: 'minh_ngoc_sky', amount: 24000000, time: '45 phút trước' }
        ],
        status: 'active'
    },
    {
        _id: 'auc2',
        celebrityId: 'cp20',
        name: 'Độ Mixi',
        avatar: 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?q=80&w=400&auto=format&fit=crop',
        title: 'Cafe trò chuyện thân mật & Trải nghiệm 2h tại Mixi Studio',
        description: 'Cơ hội tuyệt vời dành cho các Bộ tộc MixiGaming! Bạn sẽ được đến tham quan Studio làm việc triệu đô của anh Độ Phùng, cùng anh uống cafe đàm đạo về hành trình làm streamer, cuộc sống và cùng chơi một vài tựa game hấp dẫn ngay tại máy stream.',
        startingBid: 10000000,
        currentBid: 19500000,
        minIncrement: 500000,
        highestBidder: 'huy_bom_gaming',
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 8.2).toISOString(),
        bidCount: 19,
        charityName: 'Quỹ Từ Thiện MixiGast (Xây trường vùng cao)',
        charityPercent: 75,
        celebrityPercent: 15,
        platformPercent: 10,
        bidsHistory: [
            { bidder: 'huy_bom_gaming', amount: 19500000, time: '3 phút trước' },
            { bidder: 'quang_phuc_pro', amount: 19000000, time: '10 phút trước' },
            { bidder: 'linh_gao', amount: 18000000, time: '18 phút trước' },
            { bidder: 'viet_anh_tribe', amount: 17500000, time: '30 phút trước' }
        ],
        status: 'active'
    },
    {
        _id: 'auc3',
        celebrityId: 'cp16',
        name: 'Faker (Lee Sang-hyeok)',
        avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=400&auto=format&fit=crop',
        title: '1 buổi ăn trưa riêng tư & 3h trực tiếp Faker chỉ dạy laning/macro',
        description: 'Trải nghiệm đỉnh cao có một không hai cùng Quỷ Vương Bất Tử Faker! Bạn sẽ được ăn trưa riêng cùng Faker tại trụ sở T1 ở Seoul (hoặc qua Zoom VIP có phiên dịch nếu ở xa), đàm đạo về esports, và 3 giờ được anh trực tiếp chỉ bảo kỹ năng cá nhân.',
        startingBid: 30000000,
        currentBid: 55000000,
        minIncrement: 2000000,
        highestBidder: 'lol_champ_viet',
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1.5).toISOString(),
        bidCount: 32,
        charityName: 'Quỹ Bảo Trợ Trẻ Em UNICEF (UNICEF Child Protection)',
        charityPercent: 80,
        celebrityPercent: 10,
        platformPercent: 10,
        bidsHistory: [
            { bidder: 'lol_champ_viet', amount: 55000000, time: '15 phút trước' },
            { bidder: 't1_fan_trung', amount: 53000000, time: '30 phút trước' },
            { bidder: 'sang_hyeok_bro', amount: 50000000, time: '1 giờ trước' },
            { bidder: 'sktelecom_fan', amount: 48000000, time: '2 giờ trước' }
        ],
        status: 'active'
    },
    {
        _id: 'auc4',
        celebrityId: 'cp_quanghai',
        name: 'Nguyễn Quang Hải',
        avatar: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=400&auto=format&fit=crop',
        title: 'Ăn tối thân mật & đàm đạo bóng đá cùng cầu thủ Quang Hải',
        description: 'Dành riêng cho các fan hâm mộ túc cầu giáo! Một buổi tối ăn tối sang trọng tại nhà hàng 5 sao cùng tiền vệ ngôi sao Nguyễn Quang Hải. Bạn sẽ được giao lưu, chụp hình, và nhận chữ ký trực tiếp từ anh lên quả bóng đấu giá kỷ niệm.',
        startingBid: 12000000,
        currentBid: 22000000,
        minIncrement: 500000,
        highestBidder: 'quang_hai_fanboy',
        endDate: new Date(Date.now() + 1000 * 60 * 60 * 18.5).toISOString(),
        bidCount: 21,
        charityName: 'Quỹ Trẻ Em Vùng Cao (Chương trình Cơm Có Thịt)',
        charityPercent: 70,
        celebrityPercent: 20,
        platformPercent: 10,
        bidsHistory: [
            { bidder: 'quang_hai_fanboy', amount: 22000000, time: '12 phút trước' },
            { bidder: 'hoang_nam_fc', amount: 21500000, time: '25 phút trước' },
            { bidder: 'football_lover', amount: 20000000, time: '40 phút trước' },
            { bidder: 'tuyen_viet_nam', amount: 19500000, time: '1 giờ trước' }
        ],
        status: 'active'
    }
];

/* ---- Service Labels Map ---- */
window.SERVICE_LABELS = {
    gaming: { label: 'Chơi Game', icon: 'bi-controller', color: '#6366f1' },
    karaoke: { label: 'Karaoke', icon: 'bi-music-note-beamed', color: '#ec4899' },
    chat: { label: 'Trò chuyện', icon: 'bi-chat-heart', color: '#10b981' },
    movie: { label: 'Xem phim', icon: 'bi-film', color: '#f59e0b' },
    event: { label: 'Đồng hành sự kiện', icon: 'bi-calendar-event', color: '#8b5cf6' },
    teaching: { label: 'Hướng dẫn / Coach', icon: 'bi-mortarboard', color: '#3b82f6' }
};

/* ---- Status Labels ---- */
window.STATUS_LABELS = {
    online: 'Đang online',
    offline: 'Ngoại tuyến',
    busy: 'Đang bận',
    booked: 'Đang được thuê'
};

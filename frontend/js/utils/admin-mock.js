export const adminStats = {
    totalUsers: 1250,
    totalEvents: 345,
    totalBookings: 890,
    totalRevenue: "125.000.000",
    pendingReports: 12,
    pendingPosts: 8,
    activeCommunities: 45
};

export const adminUsers = [
    { id: "U001", name: "Adminstrator", email: "admin@gmail.com", role: "admin", status: "active", joined: "2025-01-10", reports: 0 },
    { id: "U002", name: "Minh Anh", email: "minhanh@gmail.com", role: "staff", status: "active", joined: "2025-02-15", reports: 0 },
    { id: "U003", name: "Quốc Đạt", email: "dat.quoc@gmail.com", role: "user", status: "active", joined: "2025-11-20", reports: 1 },
    { id: "U004", name: "Hải Yến", email: "yen.hai@gmail.com", role: "user", status: "banned", joined: "2026-01-05", reports: 5 },
    { id: "U005", name: "Tuấn Kiệt", email: "kiet.tuan@gmail.com", role: "user", status: "warned", joined: "2026-03-12", reports: 3 }
];

export const adminEvents = [
    { id: "E101", title: "Đêm nhạc Acoustic", author: "Minh Anh", category: "Music", status: "approved", date: "2026-06-15", participants: 8 },
    { id: "E102", title: "Tìm Dual Rank LOL", author: "Quốc Đạt", category: "Gaming", status: "pending", date: "2026-05-20", participants: 0 },
    { id: "E103", title: "Cafe Boardgame Cuối Tuần", author: "Tuấn Kiệt", category: "Boardgame", status: "rejected", date: "2026-05-18", participants: 0 },
    { id: "E104", title: "Giải Đấu Ao Làng CS:GO", author: "Hải Yến", category: "Gaming", status: "approved", date: "2026-07-01", participants: 15 }
];

export const adminBookings = [
    { id: "B901", user: "Tuấn Kiệt", target: "Minh Anh", service: "Trò chuyện", date: "2026-05-18", amount: "100.000đ", status: "completed" },
    { id: "B902", user: "Khách 01", target: "Hải Yến", service: "Xem phim cùng", date: "2026-05-19", amount: "200.000đ", status: "pending" },
    { id: "B903", user: "Quốc Đạt", target: "Tuấn Kiệt", service: "Leo Rank", date: "2026-05-20", amount: "50.000đ", status: "cancelled" }
];

export const adminReports = [
    { id: "R001", targetType: "user", targetId: "U004", reason: "Spam tin nhắn", reporter: "U003", status: "resolved", date: "2026-05-10" },
    { id: "R002", targetType: "event", targetId: "E103", reason: "Nội dung phản cảm", reporter: "U002", status: "pending", date: "2026-05-14" },
    { id: "R003", targetType: "user", targetId: "U005", reason: "Gian lận", reporter: "U001", status: "pending", date: "2026-05-14" }
];

export const adminLogs = [
    { id: 1, action: "Khoá tài khoản", target: "Hải Yến (U004)", actor: "Adminstrator", time: "2026-05-14 09:30:00" },
    { id: 2, action: "Duyệt sự kiện", target: "Đêm nhạc Acoustic (E101)", actor: "Minh Anh (Staff)", time: "2026-05-13 14:15:00" },
    { id: 3, action: "Từ chối sự kiện", target: "Cafe Boardgame (E103)", actor: "Adminstrator", time: "2026-05-12 10:00:00" },
    { id: 4, action: "Đổi Role", target: "Minh Anh -> Staff", actor: "Adminstrator", time: "2026-05-10 08:00:00" }
];

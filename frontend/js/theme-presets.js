/**
 * EntConnect — Theme Presets Data
 * theme-presets.js
 *
 * All 6 premium themes with rank-lock integration.
 * Safe to extend — does NOT modify existing code.
 */

/**
 * RANK ORDER (from lowest to highest):
 * Explorer → Connector → Influencer → Elite → Legend
 * These map to ExpSystem rank names.
 */
const THEME_RANK_ORDER = ['Explorer', 'Connector', 'Influencer', 'Elite', 'Legend'];

/**
 * RANK UNLOCK MAP — which rank is needed to use each theme
 */
const THEME_UNLOCK_RANK = {
    'discord-dark':     'Explorer',    // All users — basic theme
    'sunset-chill':     'Explorer',    // All users — basic theme
    'neon-gaming':      'Connector',   // Blue neon (Connector+)
    'emerald-glass':    'Influencer',  // Green luxury (Influencer+)
    'midnight-purple':  'Elite',       // Purple premium (Elite+)
    'sakura-pink':      'Legend',      // Gold/animated (Legend only)
};

/**
 * THEME PRESET DEFINITIONS
 * Each theme defines its visual properties for the preset card and for application.
 */
const THEME_PRESETS = [
    {
        id: 'neon-gaming',
        name: 'Neon Gaming',
        emoji: '🎮',
        description: 'Cyber glow & dark blue',
        unlockRank: 'Connector',
        // Background for the preset card swatch
        cardGradient: 'linear-gradient(135deg, #050714 0%, #1a0549 50%, #050714 100%)',
        cardBorder: '#7c3aed',
        cardGlow: 'rgba(124, 58, 237, 0.5)',
        // Accent dot colors shown in the card
        dots: ['#7c3aed', '#a78bfa', '#06b6d4'],
        // AI suggestion tag
        aiSuggest: ['gaming', 'technology', 'esports'],
    },
    {
        id: 'midnight-purple',
        name: 'Midnight Purple',
        emoji: '💜',
        description: 'Premium dark glass',
        unlockRank: 'Elite',
        cardGradient: 'linear-gradient(135deg, #0a0118 0%, #2d0a5c 50%, #0a0118 100%)',
        cardBorder: '#8b5cf6',
        cardGlow: 'rgba(139, 92, 246, 0.5)',
        dots: ['#8b5cf6', '#a78bfa', '#ec4899'],
        aiSuggest: ['music', 'art', 'creative'],
    },
    {
        id: 'sunset-chill',
        name: 'Sunset Chill',
        emoji: '🌅',
        description: 'Warm orange gradient',
        unlockRank: 'Explorer',
        cardGradient: 'linear-gradient(135deg, #0f0a08 0%, #4a1a05 50%, #0f0a08 100%)',
        cardBorder: '#f97316',
        cardGlow: 'rgba(249, 115, 22, 0.5)',
        dots: ['#f97316', '#fb923c', '#f43f5e'],
        aiSuggest: ['music', 'food', 'travel', 'chill'],
    },
    {
        id: 'emerald-glass',
        name: 'Emerald Glass',
        emoji: '💚',
        description: 'Green luxury glass',
        unlockRank: 'Influencer',
        cardGradient: 'linear-gradient(135deg, #030f0a 0%, #063c1a 50%, #030f0a 100%)',
        cardBorder: '#059669',
        cardGlow: 'rgba(5, 150, 105, 0.5)',
        dots: ['#059669', '#34d399', '#06b6d4'],
        aiSuggest: ['sports', 'health', 'travel', 'nature'],
    },
    {
        id: 'discord-dark',
        name: 'Discord Dark',
        emoji: '🎧',
        description: 'Clean Discord-inspired',
        unlockRank: 'Explorer',
        cardGradient: 'linear-gradient(135deg, #1e1f22 0%, #2b2d31 50%, #1e1f22 100%)',
        cardBorder: '#5865f2',
        cardGlow: 'rgba(88, 101, 242, 0.5)',
        dots: ['#5865f2', '#7983f5', '#eb459e'],
        aiSuggest: ['gaming', 'community', 'technology'],
    },
    {
        id: 'sakura-pink',
        name: 'Sakura Pink',
        emoji: '🌸',
        description: 'Pastel pink & soft glow',
        unlockRank: 'Legend',
        cardGradient: 'linear-gradient(135deg, #0d0509 0%, #3d0825 50%, #0d0509 100%)',
        cardBorder: '#db2777',
        cardGlow: 'rgba(219, 39, 119, 0.5)',
        dots: ['#db2777', '#f472b6', '#7c3aed'],
        aiSuggest: ['fashion', 'food', 'art', 'beauty'],
    },
];

/**
 * ACCENT COLORS — 8 premium options for button/icon tinting
 */
const ACCENT_COLORS = [
    { id: 'indigo',  color: '#6366f1', label: 'Indigo' },
    { id: 'violet',  color: '#7c3aed', label: 'Violet' },
    { id: 'pink',    color: '#db2777', label: 'Pink' },
    { id: 'rose',    color: '#e11d48', label: 'Rose' },
    { id: 'orange',  color: '#ea580c', label: 'Orange' },
    { id: 'amber',   color: '#d97706', label: 'Amber' },
    { id: 'emerald', color: '#059669', label: 'Emerald' },
    { id: 'cyan',    color: '#0891b2', label: 'Cyan' },
];

/**
 * BACKGROUND STYLES
 */
const BG_STYLES = [
    { id: 'mesh',           icon: '🌐', label: 'Mesh Gradient',       desc: 'Dynamic radial gradients' },
    { id: 'animated',       icon: '🌊', label: 'Animated Gradient',    desc: 'Flowing color animation' },
    { id: 'solid',          icon: '⬛', label: 'Solid Color',          desc: 'Clean flat background' },
    { id: 'blur',           icon: '🌫️', label: 'Blurred Glass',        desc: 'Frosted glass effect' },
];

/**
 * CARD STYLES
 */
const CARD_STYLES = [
    { id: 'glass',   icon: '🪟', label: 'Glassmorphism',  desc: 'Frosted transparent cards' },
    { id: 'neon',    icon: '💡', label: 'Neon Border',     desc: 'Glowing accent borders' },
    { id: 'solid',   icon: '📦', label: 'Solid',           desc: 'Standard solid cards' },
    { id: 'minimal', icon: '✨', label: 'Minimal',          desc: 'Ultra-clean outline style' },
];

/**
 * CHAT THEMES
 */
const CHAT_THEMES = [
    { id: 'default',    icon: '💬', label: 'Default',       desc: 'EntConnect standard' },
    { id: 'discord',    icon: '🎧', label: 'Discord',        desc: 'Discord-inspired chat' },
    { id: 'cyberpunk',  icon: '⚡', label: 'Cyberpunk',      desc: 'Neon cyber aesthetic' },
    { id: 'amoled',     icon: '🖤', label: 'AMOLED',         desc: 'Pure black for OLED' },
    { id: 'messenger',  icon: '🔵', label: 'Messenger',      desc: 'Facebook Messenger style' },
];

/**
 * FONT STYLES
 */
const FONT_STYLES = [
    { id: 'default',  font: 'Plus Jakarta Sans', label: 'Jakarta',  preview: 'Aa' },
    { id: 'inter',    font: 'Inter',             label: 'Inter',    preview: 'Ag' },
    { id: 'poppins',  font: 'Poppins',           label: 'Poppins',  preview: 'Aa' },
    { id: 'outfit',   font: 'Outfit',            label: 'Outfit',   preview: 'Aa' },
    { id: 'rajdhani', font: 'Rajdhani',          label: 'Gaming',   preview: 'Ag' },
];

/**
 * ANIMATION LEVELS
 */
const ANIMATION_LEVELS = [
    { id: 'dynamic', icon: '🚀', label: 'Dynamic',  desc: 'Max animations & glow' },
    { id: 'smooth',  icon: '✨', label: 'Smooth',   desc: 'Balanced (recommended)' },
    { id: 'minimal', icon: '🌿', label: 'Minimal',  desc: 'Subtle transitions only' },
    { id: 'none',    icon: '⏸️', label: 'Disabled', desc: 'No animations' },
];

/**
 * AI THEME SUGGESTIONS — based on user interests/category
 */
const AI_THEME_SUGGESTIONS = {
    gaming:     { theme: 'neon-gaming',     reason: 'Phù hợp với đam mê Gaming của bạn!' },
    esports:    { theme: 'neon-gaming',     reason: 'Theme Gaming cho game thủ chân chính' },
    technology: { theme: 'discord-dark',    reason: 'Giao diện sạch sẽ cho dev & tech' },
    music:      { theme: 'sunset-chill',    reason: 'Giai điệu ấm áp như âm nhạc' },
    travel:     { theme: 'emerald-glass',   reason: 'Xanh tươi như thiên nhiên' },
    sports:     { theme: 'emerald-glass',   reason: 'Năng lượng xanh cho thể thao' },
    fashion:    { theme: 'sakura-pink',     reason: 'Phong cách hồng pastel thời thượng' },
    food:       { theme: 'sunset-chill',    reason: 'Ấm cúng như bữa ăn ngon' },
    art:        { theme: 'midnight-purple', reason: 'Bí ẩn và sáng tạo như nghệ thuật' },
    movies:     { theme: 'midnight-purple', reason: 'Tối như rạp chiếu phim' },
    community:  { theme: 'discord-dark',    reason: 'Giao diện cộng đồng thân quen' },
    default:    { theme: 'discord-dark',    reason: 'Theme cân bằng và phổ biến nhất' },
};

// Expose globally
window.THEME_PRESETS      = THEME_PRESETS;
window.ACCENT_COLORS      = ACCENT_COLORS;
window.BG_STYLES          = BG_STYLES;
window.CARD_STYLES        = CARD_STYLES;
window.CHAT_THEMES        = CHAT_THEMES;
window.FONT_STYLES        = FONT_STYLES;
window.ANIMATION_LEVELS   = ANIMATION_LEVELS;
window.AI_THEME_SUGGESTIONS = AI_THEME_SUGGESTIONS;
window.THEME_RANK_ORDER   = THEME_RANK_ORDER;
window.THEME_UNLOCK_RANK  = THEME_UNLOCK_RANK;

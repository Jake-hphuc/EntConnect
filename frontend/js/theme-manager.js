/**
 * EntConnect — Theme Manager (Core Engine)
 * theme-manager.js
 *
 * Handles applying, saving, and restoring all theme preferences.
 * SAFE: Isolated module — does NOT break existing UI logic.
 * All state stored in localStorage with prefix 'entconnect-studio-'.
 */

const ThemeManager = (() => {

    /* ──────────────────────────────────────────────────
       STORAGE KEYS
    ────────────────────────────────────────────────── */
    const KEYS = {
        theme:      'entconnect-theme',
        accent:     'entconnect-accent',
        bgStyle:    'entconnect-bg-style',
        cardStyle:  'entconnect-card-style',
        chatTheme:  'entconnect-chat-theme',
        font:       'entconnect-font',
        animLevel:  'entconnect-anim-level',
        glow:       'entconnect-glow',
    };

    /* ──────────────────────────────────────────────────
       DEFAULT PREFERENCES
    ────────────────────────────────────────────────── */
    const DEFAULTS = {
        theme:     'discord-dark',
        accent:    'indigo',
        bgStyle:   'mesh',
        cardStyle: 'glass',
        chatTheme: 'default',
        font:      'default',
        animLevel: 'smooth',
        glow:      true,
    };

    /* ──────────────────────────────────────────────────
       CURRENT STATE
    ────────────────────────────────────────────────── */
    let current = { ...DEFAULTS };

    /* ──────────────────────────────────────────────────
       LOAD — restore from localStorage
    ────────────────────────────────────────────────── */
    function load() {
        current.theme     = localStorage.getItem(KEYS.theme)     || DEFAULTS.theme;
        current.accent    = localStorage.getItem(KEYS.accent)    || DEFAULTS.accent;
        current.bgStyle   = localStorage.getItem(KEYS.bgStyle)   || DEFAULTS.bgStyle;
        current.cardStyle = localStorage.getItem(KEYS.cardStyle) || DEFAULTS.cardStyle;
        current.chatTheme = localStorage.getItem(KEYS.chatTheme) || DEFAULTS.chatTheme;
        current.font      = localStorage.getItem(KEYS.font)      || DEFAULTS.font;
        current.animLevel = localStorage.getItem(KEYS.animLevel) || DEFAULTS.animLevel;
        current.glow      = localStorage.getItem(KEYS.glow) !== null
                            ? localStorage.getItem(KEYS.glow) === 'true'
                            : DEFAULTS.glow;

        // Legacy: migrate old 'theme' key ('dark'/'light') → keep backwards compat
        const legacyTheme = localStorage.getItem('theme');
        if (legacyTheme === 'dark' || legacyTheme === 'light') {
            // Keep the Bootstrap data-bs-theme attribute for legacy
            document.documentElement.setAttribute('data-bs-theme', legacyTheme);
        }
    }

    /* ──────────────────────────────────────────────────
       SAVE — persist all preferences
    ────────────────────────────────────────────────── */
    function save(prefs = current) {
        Object.keys(KEYS).forEach(key => {
            if (prefs[key] !== undefined) {
                localStorage.setItem(KEYS[key], prefs[key]);
            }
        });
    }

    /* ──────────────────────────────────────────────────
       APPLY THEME — set data-theme attribute on <html>
       Also forces dark mode for Bootstrap compatibility
    ────────────────────────────────────────────────── */
    function applyTheme(themeId, options = {}) {
        const { preview = false } = options;
        const root = document.documentElement;

        // All custom themes are dark-mode based
        root.setAttribute('data-bs-theme', 'dark');
        root.setAttribute('data-theme', themeId);

        if (!preview) {
            current.theme = themeId;
        }

        // Dispatch custom event for other modules to react
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: themeId, preview }
        }));
    }

    /* ──────────────────────────────────────────────────
       APPLY ACCENT — update primary color CSS variables live
    ────────────────────────────────────────────────── */
    function applyAccent(accentId, options = {}) {
        const { preview = false } = options;
        const root = document.documentElement;

        // Remove all existing accent attributes
        root.removeAttribute('data-accent');

        if (accentId && accentId !== 'default') {
            root.setAttribute('data-accent', accentId);
        }

        if (!preview) {
            current.accent = accentId;
        }
    }

    /* ──────────────────────────────────────────────────
       APPLY BACKGROUND STYLE
    ────────────────────────────────────────────────── */
    function applyBgStyle(styleId, options = {}) {
        const { preview = false } = options;
        const body = document.body;

        // Remove existing bg style classes
        body.classList.remove('theme-animated-bg', 'bg-mesh', 'bg-solid', 'bg-blur');

        switch (styleId) {
            case 'mesh':
                body.classList.add('bg-mesh');
                break;
            case 'animated':
                body.classList.add('theme-animated-bg');
                break;
            case 'blur':
                body.classList.add('bg-blur');
                // Apply blur via inline style on pseudo content can't be done in JS,
                // so we use a body class and let CSS handle it via backdrop-filter
                break;
            case 'solid':
            default:
                // No special class — just solid background from CSS vars
                break;
        }

        if (!preview) {
            current.bgStyle = styleId;
        }
    }

    /* ──────────────────────────────────────────────────
       APPLY CARD STYLE
    ────────────────────────────────────────────────── */
    function applyCardStyle(styleId, options = {}) {
        const { preview = false } = options;
        const body = document.body;

        body.classList.remove(
            'card-style-glass', 'card-style-solid',
            'card-style-neon', 'card-style-minimal'
        );

        if (styleId) {
            body.classList.add(`card-style-${styleId}`);
        }

        if (!preview) {
            current.cardStyle = styleId;
        }
    }

    /* ──────────────────────────────────────────────────
       APPLY CHAT THEME
    ────────────────────────────────────────────────── */
    function applyChatTheme(themeId, options = {}) {
        const { preview = false } = options;
        const body = document.body;

        body.classList.remove(
            'chat-discord', 'chat-cyberpunk', 'chat-amoled', 'chat-messenger'
        );

        if (themeId && themeId !== 'default') {
            body.classList.add(`chat-${themeId}`);
        }

        if (!preview) {
            current.chatTheme = themeId;
        }
    }

    /* ──────────────────────────────────────────────────
       APPLY FONT STYLE
    ────────────────────────────────────────────────── */
    function applyFont(fontId, options = {}) {
        const { preview = false } = options;
        const root = document.documentElement;

        root.removeAttribute('data-font');

        if (fontId && fontId !== 'default') {
            root.setAttribute('data-font', fontId);
        } else {
            // Reset to default font
            document.body.style.fontFamily = '';
        }

        if (!preview) {
            current.font = fontId;
        }
    }

    /* ──────────────────────────────────────────────────
       APPLY ANIMATION LEVEL
    ────────────────────────────────────────────────── */
    function applyAnimLevel(levelId, options = {}) {
        const { preview = false } = options;
        const body = document.body;

        body.classList.remove(
            'anim-dynamic', 'anim-smooth', 'anim-minimal', 'anim-none'
        );

        if (levelId) {
            body.classList.add(`anim-${levelId}`);
        }

        if (!preview) {
            current.animLevel = levelId;
        }
    }

    /* ──────────────────────────────────────────────────
       APPLY GLOW EFFECTS
    ────────────────────────────────────────────────── */
    function applyGlow(enabled, options = {}) {
        const { preview = false } = options;
        const body = document.body;

        if (enabled) {
            body.classList.add('glow-enabled');
        } else {
            body.classList.remove('glow-enabled');
        }

        if (!preview) {
            current.glow = enabled;
        }
    }

    /* ──────────────────────────────────────────────────
       APPLY ALL — apply all saved preferences at once
    ────────────────────────────────────────────────── */
    function applyAll(prefs = current) {
        applyTheme(prefs.theme);
        applyAccent(prefs.accent);
        applyBgStyle(prefs.bgStyle);
        applyCardStyle(prefs.cardStyle);
        applyChatTheme(prefs.chatTheme);
        applyFont(prefs.font);
        applyAnimLevel(prefs.animLevel);
        applyGlow(prefs.glow);
    }

    /* ──────────────────────────────────────────────────
       RESET TO DEFAULTS
    ────────────────────────────────────────────────── */
    function reset() {
        current = { ...DEFAULTS };
        // Clear all custom storage
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
        applyAll(DEFAULTS);

        // Keep Bootstrap dark mode 
        document.documentElement.setAttribute('data-bs-theme', 'dark');

        window.dispatchEvent(new CustomEvent('themeReset'));
    }

    /* ──────────────────────────────────────────────────
       GET USER RANK — reads from ExpSystem or falls back
    ────────────────────────────────────────────────── */
    function getUserRank() {
        if (window.ExpSystem && typeof window.ExpSystem.getFullMembership === 'function') {
            try {
                const data = window.ExpSystem.getFullMembership();
                return data?.rank?.name || 'Explorer';
            } catch (e) {
                return 'Explorer';
            }
        }
        // Check if user is logged in at all
        const user = localStorage.getItem('user');
        return user ? 'Explorer' : 'Explorer';
    }

    /* ──────────────────────────────────────────────────
       CHECK THEME ACCESS — can user use this theme?
    ────────────────────────────────────────────────── */
    function canUseTheme(themeId) {
        if (!window.THEME_UNLOCK_RANK || !window.THEME_RANK_ORDER) {
            return true; // If data not loaded, allow all
        }

        const requiredRank = window.THEME_UNLOCK_RANK[themeId] || 'Explorer';
        const userRank = getUserRank();
        const requiredIdx = window.THEME_RANK_ORDER.indexOf(requiredRank);
        const userIdx     = window.THEME_RANK_ORDER.indexOf(userRank);

        return userIdx >= requiredIdx;
    }

    /* ──────────────────────────────────────────────────
       GET AI SUGGESTED THEME — based on user interests
    ────────────────────────────────────────────────── */
    function getAISuggestedTheme() {
        if (!window.AI_THEME_SUGGESTIONS) return null;

        // Get user interests from localStorage (set by userPrefs)
        let topCategory = 'default';
        try {
            const interactions = localStorage.getItem('ent_interactions');
            if (interactions) {
                const cats = JSON.parse(interactions);
                const sorted = Object.entries(cats).sort((a, b) => b[1] - a[1]);
                if (sorted.length > 0) {
                    topCategory = sorted[0][0];
                }
            }
        } catch (e) {}

        const suggestion = window.AI_THEME_SUGGESTIONS[topCategory]
                        || window.AI_THEME_SUGGESTIONS['default'];

        return suggestion;
    }

    /* ──────────────────────────────────────────────────
       INIT — load + apply on startup
    ────────────────────────────────────────────────── */
    function init() {
        load();
        applyAll(current);
        console.log('[ThemeManager] Initialized with theme:', current.theme);
    }

    /* ──────────────────────────────────────────────────
       PUBLIC API
    ────────────────────────────────────────────────── */
    return {
        init,
        load,
        save,
        applyAll,
        applyTheme,
        applyAccent,
        applyBgStyle,
        applyCardStyle,
        applyChatTheme,
        applyFont,
        applyAnimLevel,
        applyGlow,
        reset,
        canUseTheme,
        getUserRank,
        getAISuggestedTheme,
        get current() { return { ...current }; },
    };

})();

// Expose globally
window.ThemeManager = ThemeManager;

// ─── AUTO INIT ────────────────────────────────────────
// Apply theme ASAP (before DOMContentLoaded) to avoid flash
ThemeManager.init();

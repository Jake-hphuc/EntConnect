/**
 * EntConnect — Appearance Studio Controller
 * appearance-studio.js
 *
 * Renders the floating panel, handles all user interactions,
 * communicates with ThemeManager for live preview & saves.
 *
 * SAFE: Isolated UI module. Does NOT modify any existing code.
 * Integration: Replaces #theme-toggle-btn with #appearance-studio-btn
 */

const AppearanceStudio = (() => {

    /* ─────────────────────────────────────────────────
       STATE
    ───────────────────────────────────────────────── */
    let isOpen = false;
    let _rankTooltipEl = null;
    let _toastTimeout  = null;

    /* ─────────────────────────────────────────────────
       INIT — inject panel HTML and bind events
    ───────────────────────────────────────────────── */
    function init() {
        // Wait until DOM is ready
        if (document.readyState !== 'complete' && document.readyState !== 'interactive') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        _injectTriggerButton();
        _injectPanelHTML();
        _bindPanelEvents();
        _createRankTooltip();
        _renderAllSections();

        // Listen for theme changes from other modules
        window.addEventListener('themeChanged', () => {
            _syncActiveStates();
        });

        console.log('[AppearanceStudio] Ready ✅');
    }

    /* ─────────────────────────────────────────────────
       INJECT TRIGGER BUTTON
       Replaces the existing moon/sun button safely
    ───────────────────────────────────────────────── */
    function _injectTriggerButton() {
        const oldToggle = document.getElementById('theme-toggle-btn');
        if (!oldToggle) return;

        // Hide old toggle, insert new button next to it
        oldToggle.style.display = 'none';

        const btn = document.createElement('button');
        btn.id = 'appearance-studio-btn';
        btn.setAttribute('aria-label', 'Appearance Studio');
        btn.setAttribute('title', 'Appearance Studio — Tùy chỉnh giao diện');
        btn.innerHTML = '🎨';

        // Insert next to old toggle
        oldToggle.parentNode.insertBefore(btn, oldToggle);

        btn.addEventListener('click', () => {
            isOpen ? _closePanel() : _openPanel();
        });
    }

    /* ─────────────────────────────────────────────────
       INJECT PANEL HTML
    ───────────────────────────────────────────────── */
    function _injectPanelHTML() {
        // Backdrop
        const backdrop = document.createElement('div');
        backdrop.id = 'studio-backdrop';
        backdrop.addEventListener('click', _closePanel);

        // Main Panel
        const panel = document.createElement('div');
        panel.id = 'appearance-studio-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'Appearance Studio');

        panel.innerHTML = `
            <!-- HEADER -->
            <div class="studio-header">
                <div class="studio-header-left">
                    <div class="studio-header-icon">🎨</div>
                    <div>
                        <div class="studio-title">
                            Appearance Studio
                            <span class="preview-live-badge ms-2">LIVE</span>
                        </div>
                        <span class="studio-subtitle">Tùy chỉnh giao diện cá nhân</span>
                    </div>
                </div>
                <button class="studio-close-btn" id="studio-close-btn" aria-label="Close">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>

            <!-- BODY -->
            <div class="studio-body" id="studio-body">

                <!-- AI Suggestion -->
                <div class="studio-section" id="section-ai">
                    <div id="studio-ai-chip"></div>
                </div>

                <!-- Theme Presets -->
                <div class="studio-section" id="section-presets">
                    <div class="studio-section-label studio-section-toggle" data-section="presets">
                        <i class="bi bi-palette-fill"></i>
                        Theme Presets
                        <span class="toggle-arrow ms-auto"><i class="bi bi-chevron-down"></i></span>
                    </div>
                    <div class="studio-section-body">
                        <div class="theme-presets-grid" id="theme-presets-grid"></div>
                    </div>
                </div>

                <!-- Accent Colors -->
                <div class="studio-section" id="section-accent">
                    <div class="studio-section-label studio-section-toggle" data-section="accent">
                        <i class="bi bi-droplet-fill"></i>
                        Accent Color
                        <span class="toggle-arrow ms-auto"><i class="bi bi-chevron-down"></i></span>
                    </div>
                    <div class="studio-section-body">
                        <div class="accent-colors-row" id="accent-colors-row"></div>
                    </div>
                </div>

                <!-- Background Style -->
                <div class="studio-section" id="section-bg">
                    <div class="studio-section-label studio-section-toggle" data-section="bg">
                        <i class="bi bi-layers-fill"></i>
                        Background Style
                        <span class="toggle-arrow ms-auto"><i class="bi bi-chevron-down"></i></span>
                    </div>
                    <div class="studio-section-body">
                        <div class="studio-options-row" id="bg-style-options"></div>
                    </div>
                </div>

                <!-- Card Effects -->
                <div class="studio-section" id="section-card">
                    <div class="studio-section-label studio-section-toggle" data-section="card">
                        <i class="bi bi-card-image"></i>
                        Card Style
                        <span class="toggle-arrow ms-auto"><i class="bi bi-chevron-down"></i></span>
                    </div>
                    <div class="studio-section-body">
                        <div class="studio-options-row" id="card-style-options"></div>
                    </div>
                </div>

                <!-- Chat Theme -->
                <div class="studio-section" id="section-chat">
                    <div class="studio-section-label studio-section-toggle" data-section="chat">
                        <i class="bi bi-chat-dots-fill"></i>
                        Chat Theme
                        <span class="toggle-arrow ms-auto"><i class="bi bi-chevron-down"></i></span>
                    </div>
                    <div class="studio-section-body">
                        <div class="studio-options-row" id="chat-theme-options"></div>
                    </div>
                </div>

                <!-- Font Style -->
                <div class="studio-section" id="section-font">
                    <div class="studio-section-label studio-section-toggle" data-section="font">
                        <i class="bi bi-type"></i>
                        Font Style
                        <span class="toggle-arrow ms-auto"><i class="bi bi-chevron-down"></i></span>
                    </div>
                    <div class="studio-section-body">
                        <div class="font-options-grid" id="font-style-options"></div>
                    </div>
                </div>

                <!-- Animation Level -->
                <div class="studio-section" id="section-anim">
                    <div class="studio-section-label studio-section-toggle" data-section="anim">
                        <i class="bi bi-lightning-fill"></i>
                        Animation
                        <span class="toggle-arrow ms-auto"><i class="bi bi-chevron-down"></i></span>
                    </div>
                    <div class="studio-section-body">
                        <div class="studio-options-row" id="anim-level-options"></div>
                    </div>
                </div>

                <!-- Glow Toggle -->
                <div class="studio-section" id="section-glow">
                    <div class="studio-section-label">
                        <i class="bi bi-stars"></i>
                        Glow Effects
                        <div class="ms-auto">
                            <div class="form-check form-switch mb-0">
                                <input class="form-check-input" type="checkbox" id="glow-toggle" role="switch">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Spacer -->
                <div style="height: 10px;"></div>
            </div>

            <!-- FOOTER -->
            <div class="studio-footer">
                <button class="studio-btn-reset" id="studio-reset-btn">
                    <i class="bi bi-arrow-counterclockwise"></i> Reset
                </button>
                <button class="studio-btn-save" id="studio-save-btn">
                    <i class="bi bi-check-circle-fill"></i> Lưu giao diện
                </button>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.appendChild(panel);

        // Inject toast element
        const toast = document.createElement('div');
        toast.id = 'studio-toast';
        toast.className = 'studio-toast';
        toast.innerHTML = `<div class="studio-toast-icon"><i class="bi bi-check-lg"></i></div><span id="studio-toast-msg"></span>`;
        document.body.appendChild(toast);
    }

    /* ─────────────────────────────────────────────────
       BIND PANEL EVENTS
    ───────────────────────────────────────────────── */
    function _bindPanelEvents() {
        // Close button
        const closeBtn = document.getElementById('studio-close-btn');
        if (closeBtn) closeBtn.addEventListener('click', _closePanel);

        // Reset button
        const resetBtn = document.getElementById('studio-reset-btn');
        if (resetBtn) resetBtn.addEventListener('click', _handleReset);

        // Save button
        const saveBtn = document.getElementById('studio-save-btn');
        if (saveBtn) saveBtn.addEventListener('click', _handleSave);

        // Glow toggle
        const glowToggle = document.getElementById('glow-toggle');
        if (glowToggle) {
            glowToggle.checked = ThemeManager.current.glow;
            glowToggle.addEventListener('change', (e) => {
                ThemeManager.applyGlow(e.target.checked);
                ThemeManager.save();
            });
        }

        // Section collapse toggles
        document.querySelectorAll('.studio-section-toggle').forEach(toggle => {
            toggle.addEventListener('click', () => {
                const sectionId = toggle.dataset.section;
                const section = document.getElementById(`section-${sectionId}`);
                if (section) section.classList.toggle('collapsed');
            });
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isOpen) _closePanel();
        });
    }

    /* ─────────────────────────────────────────────────
       RENDER ALL SECTIONS
    ───────────────────────────────────────────────── */
    function _renderAllSections() {
        _renderAISuggestion();
        _renderThemePresets();
        _renderAccentColors();
        _renderOptionList('bg-style-options',     window.BG_STYLES,        'bgStyle',   ThemeManager.applyBgStyle.bind(ThemeManager));
        _renderOptionList('card-style-options',   window.CARD_STYLES,      'cardStyle', ThemeManager.applyCardStyle.bind(ThemeManager));
        _renderOptionList('chat-theme-options',   window.CHAT_THEMES,      'chatTheme', ThemeManager.applyChatTheme.bind(ThemeManager));
        _renderFontOptions();
        _renderOptionList('anim-level-options',   window.ANIMATION_LEVELS, 'animLevel', ThemeManager.applyAnimLevel.bind(ThemeManager));
        _syncGlowToggle();
    }

    /* ─────────────────────────────────────────────────
       RENDER — AI Suggestion chip
    ───────────────────────────────────────────────── */
    function _renderAISuggestion() {
        const container = document.getElementById('studio-ai-chip');
        if (!container || !window.ThemeManager) return;

        const suggestion = ThemeManager.getAISuggestedTheme();
        if (!suggestion) { container.innerHTML = ''; return; }

        const preset = (window.THEME_PRESETS || []).find(p => p.id === suggestion.theme);
        if (!preset) { container.innerHTML = ''; return; }

        container.innerHTML = `
            <div class="ai-suggest-chip" id="ai-suggest-chip-btn" data-theme="${suggestion.theme}">
                <div class="ai-chip-icon">✨</div>
                <div>
                    <div style="font-size: 0.72rem; font-weight: 800; color: var(--text-main);">AI Gợi ý: ${preset.emoji} ${preset.name}</div>
                    <div style="font-size: 0.64rem; color: var(--text-muted); margin-top: 1px;">${suggestion.reason}</div>
                </div>
                <i class="bi bi-arrow-right ms-auto" style="color: var(--primary); font-size: 0.75rem;"></i>
            </div>
        `;

        const chip = document.getElementById('ai-suggest-chip-btn');
        if (chip) {
            chip.addEventListener('click', () => {
                const themeId = chip.dataset.theme;
                if (ThemeManager.canUseTheme(themeId)) {
                    ThemeManager.applyTheme(themeId);
                    ThemeManager.save();
                    _syncActiveStates();
                    _showToast(`${preset.emoji} Theme ${preset.name} đã được áp dụng!`);
                } else {
                    _showToast(`🔒 Theme ${preset.name} yêu cầu rank cao hơn`);
                }
            });
        }
    }

    /* ─────────────────────────────────────────────────
       RENDER — Theme Preset Cards
    ───────────────────────────────────────────────── */
    function _renderThemePresets() {
        const grid = document.getElementById('theme-presets-grid');
        if (!grid || !window.THEME_PRESETS) return;

        const currentTheme = ThemeManager.current.theme;

        grid.innerHTML = window.THEME_PRESETS.map(preset => {
            const isActive  = currentTheme === preset.id;
            const canAccess = ThemeManager.canUseTheme(preset.id);
            const rankRequired = window.THEME_UNLOCK_RANK?.[preset.id] || 'Explorer';

            const dots = preset.dots.map(c =>
                `<div class="preset-dot" style="background:${c}; color:${c};"></div>`
            ).join('');

            return `
                <div class="theme-preset-card ${isActive ? 'active' : ''} ${canAccess ? '' : 'locked'}"
                     data-theme="${preset.id}"
                     data-rank="${rankRequired}"
                     style="
                         background: ${preset.cardGradient};
                         --card-active-color: ${preset.cardBorder};
                         --card-active-glow: ${preset.cardGlow};
                         border-color: ${isActive ? preset.cardBorder : 'transparent'};
                         box-shadow: ${isActive ? `0 0 20px ${preset.cardGlow}` : 'none'};
                     ">
                    ${!canAccess ? `
                        <div class="preset-lock">🔒</div>
                    ` : ''}
                    <div class="preset-active-check"><i class="bi bi-check-lg"></i></div>
                    <div class="preset-dots">${dots}</div>
                    <div class="preset-name">${preset.emoji} ${preset.name}</div>
                </div>
            `;
        }).join('');

        // Bind click events
        grid.querySelectorAll('.theme-preset-card').forEach(card => {
            card.addEventListener('click', () => {
                const themeId = card.dataset.theme;
                const canAccess = ThemeManager.canUseTheme(themeId);
                const rankReq = card.dataset.rank;

                if (!canAccess) {
                    _showRankTooltip(card, `🔒 Yêu cầu Rank ${rankReq}`);
                    return;
                }

                ThemeManager.applyTheme(themeId);
                ThemeManager.save();
                _syncActiveStates();

                const preset = (window.THEME_PRESETS || []).find(p => p.id === themeId);
                if (preset) {
                    _showToast(`${preset.emoji} Theme ${preset.name} đã áp dụng!`);
                    // Update the trigger btn color
                    const btn = document.getElementById('appearance-studio-btn');
                    if (btn) {
                        btn.style.background = `linear-gradient(135deg, ${preset.dots[0]}, ${preset.dots[2] || preset.dots[0]})`;
                        btn.style.boxShadow = `0 0 15px ${preset.cardGlow}, 0 4px 12px rgba(0,0,0,0.3)`;
                    }
                }
            });

            // Hover preview — temporarily apply theme
            card.addEventListener('mouseenter', () => {
                const themeId = card.dataset.theme;
                if (ThemeManager.canUseTheme(themeId)) {
                    ThemeManager.applyTheme(themeId, { preview: true });
                }
            });

            card.addEventListener('mouseleave', () => {
                // Restore saved theme
                ThemeManager.applyTheme(ThemeManager.current.theme);
            });
        });
    }

    /* ─────────────────────────────────────────────────
       RENDER — Accent Color Buttons
    ───────────────────────────────────────────────── */
    function _renderAccentColors() {
        const row = document.getElementById('accent-colors-row');
        if (!row || !window.ACCENT_COLORS) return;

        const currentAccent = ThemeManager.current.accent;

        row.innerHTML = window.ACCENT_COLORS.map(ac => `
            <button class="accent-color-btn ${currentAccent === ac.id ? 'active' : ''}"
                    data-accent="${ac.id}"
                    style="background: ${ac.color};"
                    title="${ac.label}"
                    aria-label="Accent ${ac.label}">
            </button>
        `).join('');

        row.querySelectorAll('.accent-color-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const accentId = btn.dataset.accent;
                ThemeManager.applyAccent(accentId);
                ThemeManager.save();
                _syncActiveStates();
            });
        });
    }

    /* ─────────────────────────────────────────────────
       RENDER — Generic Option List (bg/card/chat/anim)
    ───────────────────────────────────────────────── */
    function _renderOptionList(containerId, optionsData, prefKey, applyFn) {
        const container = document.getElementById(containerId);
        if (!container || !optionsData) return;

        const currentVal = ThemeManager.current[prefKey];

        container.innerHTML = optionsData.map(opt => `
            <div class="studio-option-item ${currentVal === opt.id ? 'active' : ''}"
                 data-val="${opt.id}"
                 data-pref="${prefKey}">
                <div class="option-icon">${opt.icon}</div>
                <div>
                    <div style="font-size: 0.82rem; font-weight: 700;">${opt.label}</div>
                    <div style="font-size: 0.67rem; color: var(--text-muted); margin-top: 1px;">${opt.desc}</div>
                </div>
                <div class="option-radio"></div>
            </div>
        `).join('');

        container.querySelectorAll('.studio-option-item').forEach(item => {
            item.addEventListener('click', () => {
                const val = item.dataset.val;
                applyFn(val);
                ThemeManager.save();
                _syncActiveStates();
            });
        });
    }

    /* ─────────────────────────────────────────────────
       RENDER — Font Options
    ───────────────────────────────────────────────── */
    function _renderFontOptions() {
        const container = document.getElementById('font-style-options');
        if (!container || !window.FONT_STYLES) return;

        const currentFont = ThemeManager.current.font;

        container.innerHTML = window.FONT_STYLES.map(f => `
            <button class="font-option-btn ${currentFont === f.id ? 'active' : ''}"
                    data-font="${f.id}"
                    style="font-family: '${f.font}', sans-serif;">
                <span class="font-preview" style="font-family: '${f.font}', sans-serif;">${f.preview}</span>
                <span class="font-name">${f.label}</span>
            </button>
        `).join('');

        container.querySelectorAll('.font-option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const fontId = btn.dataset.font;
                ThemeManager.applyFont(fontId);
                ThemeManager.save();
                _syncActiveStates();
            });
        });
    }

    /* ─────────────────────────────────────────────────
       SYNC — update all active states after change
    ───────────────────────────────────────────────── */
    function _syncActiveStates() {
        const c = ThemeManager.current;

        // Theme presets
        document.querySelectorAll('.theme-preset-card').forEach(card => {
            const preset = (window.THEME_PRESETS || []).find(p => p.id === card.dataset.theme);
            if (card.dataset.theme === c.theme) {
                card.classList.add('active');
                if (preset) {
                    card.style.borderColor = preset.cardBorder;
                    card.style.boxShadow = `0 0 20px ${preset.cardGlow}`;
                }
            } else {
                card.classList.remove('active');
                card.style.borderColor = 'transparent';
                card.style.boxShadow = 'none';
            }
        });

        // Accent colors
        document.querySelectorAll('.accent-color-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.accent === c.accent);
        });

        // Option items (bg, card, chat, anim)
        document.querySelectorAll('.studio-option-item').forEach(item => {
            const prefKey = item.dataset.pref;
            if (prefKey) {
                item.classList.toggle('active', item.dataset.val === c[prefKey]);
            }
        });

        // Font buttons
        document.querySelectorAll('.font-option-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.font === c.font);
        });

        // Glow toggle
        _syncGlowToggle();
    }

    function _syncGlowToggle() {
        const toggle = document.getElementById('glow-toggle');
        if (toggle) toggle.checked = ThemeManager.current.glow;
    }

    /* ─────────────────────────────────────────────────
       PANEL OPEN / CLOSE
    ───────────────────────────────────────────────── */
    function _openPanel() {
        isOpen = true;
        const panel    = document.getElementById('appearance-studio-panel');
        const backdrop = document.getElementById('studio-backdrop');
        const triggerBtn = document.getElementById('appearance-studio-btn');

        if (panel)    panel.classList.add('panel-open');
        if (backdrop) backdrop.classList.add('visible');
        if (triggerBtn) triggerBtn.classList.add('panel-open');

        // Re-render to pick up any rank changes
        _renderThemePresets();
        _renderAISuggestion();
    }

    function _closePanel() {
        isOpen = false;
        const panel    = document.getElementById('appearance-studio-panel');
        const backdrop = document.getElementById('studio-backdrop');
        const triggerBtn = document.getElementById('appearance-studio-btn');

        if (panel)    panel.classList.remove('panel-open');
        if (backdrop) backdrop.classList.remove('visible');
        if (triggerBtn) triggerBtn.classList.remove('panel-open');

        // Restore actual theme (discard any hover previews)
        ThemeManager.applyTheme(ThemeManager.current.theme);
    }

    /* ─────────────────────────────────────────────────
       RESET / SAVE HANDLERS
    ───────────────────────────────────────────────── */
    function _handleReset() {
        if (confirm('🎨 Reset về giao diện mặc định?')) {
            ThemeManager.reset();
            _renderAllSections();
            _showToast('✅ Đã reset về giao diện mặc định!');
        }
    }

    function _handleSave() {
        ThemeManager.save();
        _showToast('💾 Giao diện đã được lưu thành công!');
        setTimeout(_closePanel, 800);
    }

    /* ─────────────────────────────────────────────────
       TOAST NOTIFICATION
    ───────────────────────────────────────────────── */
    function _showToast(message) {
        const toast   = document.getElementById('studio-toast');
        const msgSpan = document.getElementById('studio-toast-msg');
        if (!toast || !msgSpan) return;

        msgSpan.textContent = message;
        toast.classList.add('visible');

        if (_toastTimeout) clearTimeout(_toastTimeout);
        _toastTimeout = setTimeout(() => {
            toast.classList.remove('visible');
        }, 2500);
    }

    /* ─────────────────────────────────────────────────
       RANK TOOLTIP
    ───────────────────────────────────────────────── */
    function _createRankTooltip() {
        _rankTooltipEl = document.createElement('div');
        _rankTooltipEl.className = 'studio-rank-tooltip';
        document.body.appendChild(_rankTooltipEl);
    }

    function _showRankTooltip(targetEl, message) {
        if (!_rankTooltipEl) return;

        const rect = targetEl.getBoundingClientRect();
        _rankTooltipEl.textContent = message;
        _rankTooltipEl.style.top  = `${rect.top - 40}px`;
        _rankTooltipEl.style.left = `${rect.left + rect.width / 2 - _rankTooltipEl.offsetWidth / 2}px`;
        _rankTooltipEl.classList.add('visible');

        setTimeout(() => {
            if (_rankTooltipEl) _rankTooltipEl.classList.remove('visible');
        }, 2000);
    }

    /* ─────────────────────────────────────────────────
       PUBLIC API
    ───────────────────────────────────────────────── */
    return {
        init,
        open: _openPanel,
        close: _closePanel,
        showToast: _showToast,
        get isOpen() { return isOpen; },
    };

})();

// Expose globally
window.AppearanceStudio = AppearanceStudio;

// ─── AUTO INIT ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Slight delay to ensure ThemeManager + presets data is loaded
    setTimeout(() => {
        if (window.ThemeManager && window.THEME_PRESETS) {
            AppearanceStudio.init();
        } else {
            console.warn('[AppearanceStudio] Waiting for dependencies...');
            setTimeout(AppearanceStudio.init, 500);
        }
    }, 100);
});

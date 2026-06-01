/**
 * EntConnect - Discover Page Controller
 * Handles real-time search, filtering, and sorting of activities
 */

const discover = {
    searchTimeout: null,
    filterState: {
        keyword: '',
        category: 'all',
        time: 'all',
        format: 'all',
        price: 'all',
        sort: 'newest',
        status: 'published',
        tags: [],
        page: 1,
        viewMode: 'list' // 'list' or 'map'
    },
    latestResults: [],
    mapInstance: null,
    mapMarkers: [],

    /**
     * Initialize discover page
     */
    init() {
        this.loadSettingsFromURL();
        this.loadActivities();
        this.attachEventListeners();
    },

    /**
     * Read initial query params from URL
     */
    loadSettingsFromURL() {
        const params = new URLSearchParams(window.location.search);
        if (params.has('q')) {
            this.filterState.keyword = params.get('q');
            const searchInput = document.getElementById('discover-search');
            if (searchInput) searchInput.value = this.filterState.keyword;
        }
    },

    /**
     * Main data loading function
     */
    async loadActivities() {
        const container = document.getElementById('events-container');
        const countBadge = document.getElementById('results-count');
        
        // Show Skeleton
        ui.showSkeleton(container, 6, 'col-md-6 col-xl-4');
        container.classList.add('loading');

        try {
            // 1. Fetch from API & Mock Data in parallel
            let apiUrl = `/events?status=${this.filterState.status}`;
            if (this.filterState.category !== 'all') apiUrl += `&category=${this.filterState.category}`;
            if (this.filterState.keyword) apiUrl += `&search=${encodeURIComponent(this.filterState.keyword)}`;
            
            const [apiRes] = await Promise.all([
                api.request(apiUrl)
                    .catch(() => ({ success: false })) // Graceful fallback
            ]);

            const eventsFromAPI = apiRes.success ? (apiRes.data.activities || apiRes.data) : [];
            const eventsFromMock = window.mockActivities || [];
            
            // 2. Merge & Deduplicate
            let allEvents = [...eventsFromAPI];
            eventsFromMock.forEach(m => {
                if (!allEvents.find(a => a.title === m.title)) allEvents.push(m);
            });

            // 3. Apply Filters
            let filteredResults = this.applyFilters(allEvents);

            // 4. Apply Sorting
            this.applySorting(filteredResults);
            
            // Store for map view
            this.latestResults = filteredResults;

            // 5. Render to UI based on View Mode
            if (this.filterState.viewMode === 'list') {
                this.renderResults(container, countBadge, filteredResults);
            } else {
                this.renderMap(countBadge, filteredResults);
            }
            container.classList.remove('loading');

            // 6. Ensure visibility for scroll-reveal elements
            this.triggerReveal();

        } catch (err) {
            container.classList.remove('loading');
            container.innerHTML = `<div class="col-12 text-center py-5 text-danger">Lỗi tải dữ liệu: ${err.message}. Vui lòng thử lại sau.</div>`;
        }
    },

    normalizeText(str) {
        if (!str) return "";
        return str
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    },

    /**
     * Filter logic
     */
    applyFilters(events) {
        const { keyword, category, price, time, format, status } = this.filterState;
        const now = new Date();

        return events.filter(ev => {
            const matchSearch =
                !keyword ||
                this.normalizeText(ev.title).includes(this.normalizeText(keyword)) ||
                this.normalizeText(ev.description || '').includes(this.normalizeText(keyword)) ||
                this.normalizeText(ev.category).includes(this.normalizeText(keyword)) ||
                this.normalizeText(ev.location?.venue?.name || '').includes(this.normalizeText(keyword));

            const matchCatFilter = category === 'all' || ev.category === category;
            
            let matchFormat = true;
            if (format === 'online') matchFormat = ev.location?.type === 'online' || ev.location?.platform;
            else if (format === 'offline') matchFormat = ev.location?.type === 'venue' || ev.location?.venue?.name;

            let matchStatus = true;
            if (status === 'published') matchStatus = ev.status === 'published' || !ev.status;
            else if (status !== 'all') matchStatus = ev.status === status;

            let matchTime = true;
            if (time !== 'all' && ev.schedule?.startDate) {
                const evDate = new Date(ev.schedule.startDate);
                if (time === 'today') {
                    matchTime = evDate.toDateString() === now.toDateString();
                } else if (time === 'this-week') {
                    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                    matchTime = evDate >= now && evDate <= nextWeek;
                } else if (time === 'this-month') {
                    matchTime = evDate.getMonth() === now.getMonth() && evDate.getFullYear() === now.getFullYear();
                }
            }

            let matchPrice = true;
            const evPrice = ev.pricing?.price || 0;
            const isFree = ev.pricing?.isFree || evPrice === 0;

            if (price === 'free') matchPrice = isFree;
            else if (price === 'paid') matchPrice = !isFree;
            else if (price === '0-100k') matchPrice = !isFree && evPrice <= 100000;
            else if (price === '100k-500k') matchPrice = !isFree && evPrice > 100000 && evPrice <= 500000;
            else if (price === '500k+') matchPrice = !isFree && evPrice > 500000;

            return matchSearch && matchCatFilter && matchFormat && matchTime && matchPrice && matchStatus;
        });
    },

    /**
     * Sorting logic
     */
    applySorting(events) {
        const { sort } = this.filterState;
        events.sort((a, b) => {
            if (sort === 'name') return a.title.localeCompare(b.title);
            if (sort === 'price-low') return (a.pricing?.price || 0) - (b.pricing?.price || 0);
            if (sort === 'price-high') return (b.pricing?.price || 0) - (a.pricing?.price || 0);
            // Default: Newest
            return new Date(b.schedule?.startDate) - new Date(a.schedule?.startDate);
        });
    },

    /**
     * Render results to DOM using shared UI module
     */
    renderResults(container, badge, results) {
        badge.textContent = `Tìm thấy ${results.length} sự kiện phù hợp`;
        
        const paginationContainer = document.getElementById('pagination-container');
        if (results.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style="width: 120px; height: 120px;">
                        <i class="bi bi-search display-4 text-muted"></i>
                    </div>
                    <h3 class="fw-bold">Không tìm thấy kết quả</h3>
                    <p class="text-muted mx-auto" style="max-width: 400px;">Thử thay đổi cấu trúc tìm kiếm hoặc tắt bớt bộ lọc để tìm kiếm những hoạt động thú vị khác nhé!</p>
                </div>`;
            if (paginationContainer) paginationContainer.classList.add('d-none');
            return;
        }

        // Apply Pagination with advanced search module
        const ITEMS_PER_PAGE = 6;
        const pagedData = searchAdvanced.paginate(results, this.filterState.page, ITEMS_PER_PAGE);

        container.innerHTML = pagedData.data.map((item, index) => {
            // Apply keyword highlight before sending to UI renderer
            if (this.filterState.keyword) {
                const highlightItem = { ...item };
                highlightItem.title = searchAdvanced.highlightText(item.title, this.filterState.keyword);
                return ui.renderEventCard(highlightItem, { className: 'col-md-6 col-xl-4', index });
            }
            return ui.renderEventCard(item, { className: 'col-md-6 col-xl-4', index });
        }).join('');

        // Re-observe new elements for reveal-on-scroll
        if (window.scrollObserver) {
            container.querySelectorAll('.reveal-on-scroll').forEach(el => window.scrollObserver.observe(el));
        }

        this.renderPagination(paginationContainer, pagedData);
    },

    renderPagination(container, pagedData) {
        if (!container) return;
        if (pagedData.totalPages <= 1) {
            container.classList.add('d-none');
            return;
        }
        
        container.classList.remove('d-none');
        let html = '<ul class="pagination pagination-sm m-0 gap-1">';
        
        // Prev
        html += `<li class="page-item ${pagedData.currentPage === 1 ? 'disabled' : ''}">
                    <a class="page-link rounded-circle border-0 text-dark mx-1" href="#" data-page="${pagedData.currentPage - 1}"><i class="bi bi-chevron-left"></i></a>
                 </li>`;
                 
        for (let i = 1; i <= pagedData.totalPages; i++) {
            if (i === pagedData.currentPage) {
                html += `<li class="page-item active"><a class="page-link rounded-circle border-0 mx-1 px-3 shadow-sm bg-primary" href="#">${i}</a></li>`;
            } else {
                html += `<li class="page-item"><a class="page-link rounded-circle border-0 text-dark mx-1 px-3 bg-light fade-hover" href="#" data-page="${i}">${i}</a></li>`;
            }
        }
        
        // Next
        html += `<li class="page-item ${pagedData.currentPage === pagedData.totalPages ? 'disabled' : ''}">
                    <a class="page-link rounded-circle border-0 text-dark mx-1" href="#" data-page="${pagedData.currentPage + 1}"><i class="bi bi-chevron-right"></i></a>
                 </li></ul>`;

        container.innerHTML = html;
        
        // Attach page clicks
        container.querySelectorAll('[data-page]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.filterState.page = parseInt(el.dataset.page);
                window.scrollTo({ top: document.getElementById('events-container').offsetTop - 120, behavior: 'smooth' });
                this.loadActivities();
            });
        });
    },

    /**
     * Map View Logic
     */
    renderMap(badge, results) {
        badge.textContent = `Hiển thị ${results.length} sự kiện trên bản đồ`;
        
        document.getElementById('events-container').classList.add('d-none');
        document.getElementById('pagination-container').classList.add('d-none');
        const mapContainer = document.getElementById('map-container');
        mapContainer.classList.remove('d-none');

        // Initialize Map if not yet
        if (!this.mapInstance) {
            // Center around Ho Chi Minh City
            this.mapInstance = L.map('map-container').setView([10.7769, 106.7009], 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap &copy; CARTO'
            }).addTo(this.mapInstance);
        }

        // Clear old markers
        this.mapMarkers.forEach(marker => this.mapInstance.removeLayer(marker));
        this.mapMarkers = [];

        // HCMC Bounding Box approx
        const bounds = {
            minLat: 10.7500, maxLat: 10.8200,
            minLng: 106.6500, maxLng: 106.7500
        };

        results.forEach(ev => {
            // Generate mock coordinates if missing
            const lat = ev.location?.coordinates?.lat || (bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat));
            const lng = ev.location?.coordinates?.lng || (bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng));
            
            const isFree = !ev.pricing || ev.pricing.isFree || ev.pricing.price === 0;
            const priceHtml = isFree ? '<span class="badge bg-success">Miễn phí</span>' : `<span class="badge bg-primary">${new Intl.NumberFormat('vi-VN').format(ev.pricing.price)}đ</span>`;
            const coverImage = ev.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=200&auto=format&fit=crop';
            const iconUrl = 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png';
            
            const customIcon = L.icon({
              iconUrl: iconUrl,
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            });

            const marker = L.marker([lat, lng], {icon: customIcon}).addTo(this.mapInstance);
            
            const popupContent = `
                <div style="width: 220px; font-family: 'Outfit', sans-serif;">
                    <img src="${coverImage}" class="w-100 rounded-3 mb-2" style="height: 100px; object-fit: cover;">
                    <h6 class="fw-bold mb-1 text-truncate">${ev.title}</h6>
                    <p class="small text-muted mb-2"><i class="bi bi-geo-alt-fill me-1"></i>${ev.location?.venue?.name || 'Online'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        ${priceHtml}
                        <a href="/activity-detail.html?id=${ev._id}" class="btn btn-sm btn-outline-primary rounded-pill x-small">Chi tiết</a>
                    </div>
                </div>
            `;
            marker.bindPopup(popupContent);
            this.mapMarkers.push(marker);
        });

        // Fit bounds if markers exist
        if (this.mapMarkers.length > 0) {
            const group = new L.featureGroup(this.mapMarkers);
            this.mapInstance.fitBounds(group.getBounds().pad(0.1));
        }

        // Force resize to fix Leaflet rendering glitch when container was hidden
        setTimeout(() => {
            this.mapInstance.invalidateSize();
        }, 100);
    },

    /**
     * Attach all interaction listeners
     */
    attachEventListeners() {
        // View Mode Toggles
        const btnList = document.getElementById('btn-view-list');
        const btnMap = document.getElementById('btn-view-map');
        
        if (btnList && btnMap) {
            btnList.addEventListener('click', () => {
                this.filterState.viewMode = 'list';
                btnList.classList.replace('btn-light', 'btn-primary');
                btnMap.classList.replace('btn-primary', 'btn-light');
                
                document.getElementById('map-container').classList.add('d-none');
                document.getElementById('events-container').classList.remove('d-none');
                
                this.loadActivities(); // Reload to render list & pagination
            });
            
            btnMap.addEventListener('click', () => {
                this.filterState.viewMode = 'map';
                btnMap.classList.replace('btn-light', 'btn-primary');
                btnList.classList.replace('btn-primary', 'btn-light');
                this.loadActivities(); // Reload to render map
            });
        }

        // Search Input with Debounce & Dropdown Logic
        const searchInput = document.getElementById('discover-search');
        if (searchInput) {
            // Button trigger search
            const btnSearch = document.getElementById('btn-search-trigger');
            if (btnSearch) {
                btnSearch.addEventListener('click', () => {
                    this.filterState.keyword = searchInput.value;
                    this.loadActivities();
                });
            }

            // Live Search input
            searchInput.addEventListener('input', (e) => {
                this.filterState.keyword = e.target.value;
                this.filterState.page = 1; // reset page on new search
                
                // Show dropdown logic
                searchAdvanced.renderSuggestions('search-suggestions-dropdown', this.filterState.keyword, [...(window.mockActivities || [])], (val, type) => {
                    if (type === 'keyword') {
                        searchInput.value = val;
                        this.filterState.keyword = val;
                        document.getElementById('search-suggestions-dropdown').classList.add('d-none');
                        this.loadActivities();
                    } else if (type === 'event') {
                        window.location.href = `/activity-detail.html?id=${val}`;
                    }
                });

                // Debounce load
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    if (this.filterState.keyword.trim()) searchAdvanced.saveHistory(this.filterState.keyword);
                    this.loadActivities();
                }, 400);
            });

            // Focus triggers dropdown
            searchInput.addEventListener('focus', () => {
                searchAdvanced.renderSuggestions('search-suggestions-dropdown', searchInput.value, [...(window.mockActivities || [])], (val, type) => {
                    if (type === 'keyword') {
                        searchInput.value = val;
                        this.filterState.keyword = val;
                        document.getElementById('search-suggestions-dropdown').classList.add('d-none');
                        this.loadActivities();
                    } else if (type === 'event') {
                        window.location.href = `/activity-detail.html?id=${val}`;
                    }
                });
            });

            // Hide dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const tgt = e.target;
                if (!tgt.closest('.filter-section.position-relative')) {
                    const drp = document.getElementById('search-suggestions-dropdown');
                    if (drp) drp.classList.add('d-none');
                }
            });
        }

        // Select Filters
        const filters = [
            { id: 'discover-category', key: 'category' },
            { id: 'discover-time', key: 'time' },
            { id: 'discover-price', key: 'price' },
            { id: 'discover-sort', key: 'sort' }
        ];

        filters.forEach(f => {
            const el = document.getElementById(f.id);
            if (el) {
                el.addEventListener('change', (e) => {
                    this.filterState[f.key] = e.target.value;
                    this.loadActivities();
                });
            }
        });

        // Format Radios
        document.querySelectorAll('input[name="format"]').forEach(el => {
            el.addEventListener('change', (e) => {
                this.filterState.format = e.target.value;
                this.loadActivities();
            });
        });

        // Status Radios
        document.querySelectorAll('input[name="status"]').forEach(el => {
            el.addEventListener('change', (e) => {
                this.filterState.status = e.target.value;
                this.loadActivities();
            });
        });

        // Reset Button
        const btnReset = document.getElementById('btn-reset-filters');
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                this.filterState = { keyword: '', category: 'all', time: 'all', format: 'all', price: 'all', sort: 'newest', status: 'published', tags: [], page: 1 };
                // Update UI elements
                if (searchInput) searchInput.value = '';
                document.getElementById('discover-category').value = 'all';
                document.getElementById('discover-time').value = 'all';
                document.getElementById('discover-price').value = 'all';
                document.getElementById('discover-sort').value = 'newest';
                document.getElementById('statusAll').checked = true;
                const formatAll = document.getElementById('formatAll');
                if (formatAll) formatAll.checked = true;
                
                // Reset tags
                document.querySelectorAll('.tag-item').forEach(el => el.classList.remove('active'));
                
                this.loadActivities();
            });
        }

    },

    /**
     * Activate reveal-on-scroll elements via IntersectionObserver
     * (Needed because discover page doesn't include main.js which has this)
     */
    triggerReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, { threshold: 0.05 });

        document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => discover.init());
window.discover = discover;

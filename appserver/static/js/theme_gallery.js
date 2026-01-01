/**
 * Dynamic Theme Gallery Builder for Splunk Dashboard Theme Manager
 * Scales to 1000+ themes with filtering, search, and lazy loading
 */

require([
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function($, mvc) {
    'use strict';

    // Configuration
    const CONFIG = {
        metadataUrl: '/static/app/dashboard_theme_manager/themes_metadata.json',
        cardsPerPage: 20,
        enableLazyLoad: false,
        enableVirtualScroll: false
    };

    // State
    let allThemes = [];
    let filteredThemes = [];
    let currentFilters = {
        mode: 'all',
        category: 'all',
        search: ''
    };
    let favorites = [];
    let currentPage = 1;
    let favoritesLoaded = false;
    let themesLoaded = false;

    /**
     * Load favorites from user-prefs.conf
     */
    function loadFavorites() {
        console.log('[Theme Gallery] Loading favorites...');
        
        let sdkAttempted = false;
        
        // Timeout fallback - render page even if favorites fail to load
        const timeoutId = setTimeout(function() {
            if (!favoritesLoaded) {
                console.warn('[Theme Gallery] Favorites loading timeout - proceeding with empty favorites');
                favorites = [];
                favoritesLoaded = true;
                renderThemeGallery();
            }
        }, 3000); // 3 second timeout
        
        // Function to handle successful load
        function onLoadSuccess(favoritesStr) {
            clearTimeout(timeoutId);
            favorites = favoritesStr ? favoritesStr.split(',').filter(Boolean) : [];
            console.log('[Theme Gallery] Loaded favorites:', favorites);
            favoritesLoaded = true;
            renderThemeGallery();
        }
        
        // Try SDK method first
        try {
            const service = mvc.createService({ app: 'dashboard_theme_manager' });
            sdkAttempted = true;
            
            service.request(
                'configs/conf-user-prefs/theme_favorites',
                'GET',
                { output_mode: 'json' },
                null,
                null,
                function(err, res) {
                    if (favoritesLoaded) return; // Already loaded via fallback
                    
                    if (err) {
                        console.warn('[Theme Gallery] SDK error:', err);
                        tryAjaxFallback();
                        return;
                    }
                    
                    try {
                        const entry = res && res.data && res.data.entry && res.data.entry[0];
                        const content = entry && entry.content ? entry.content : {};
                        onLoadSuccess(content.favorites || '');
                    } catch (error) {
                        console.error('[Theme Gallery] Parse error:', error);
                        tryAjaxFallback();
                    }
                }
            );
        } catch (error) {
            console.error('[Theme Gallery] SDK initialization failed:', error);
            tryAjaxFallback();
        }
        
        // AJAX fallback function
        function tryAjaxFallback() {
            if (favoritesLoaded) return;
            
            console.log('[Theme Gallery] Trying AJAX fallback...');
            
            // Get current username dynamically
            const service = mvc.createService();
            const username = service.username || 
                           Splunk?.util?.getConfigValue?.('USERNAME') || 
                           $C?.USERNAME || 
                           'admin';
            
            $.ajax({
                url: `/splunkd/__raw/servicesNS/${username}/dashboard_theme_manager/configs/conf-user-prefs/theme_favorites?output_mode=json`,
                type: 'GET',
                dataType: 'json',
                success: function(response) {
                    if (favoritesLoaded) return;
                    
                    try {
                        if (response.entry && response.entry.length > 0) {
                            const content = response.entry[0].content;
                            onLoadSuccess(content.favorites || '');
                        } else {
                            onLoadSuccess('');
                        }
                    } catch (error) {
                        console.error('[Theme Gallery] AJAX parse error:', error);
                        clearTimeout(timeoutId);
                        favorites = [];
                        favoritesLoaded = true;
                        renderThemeGallery();
                    }
                },
                error: function(xhr) {
                    if (favoritesLoaded) return;
                    console.warn('[Theme Gallery] AJAX failed:', xhr.status, xhr.statusText);
                    clearTimeout(timeoutId);
                    favorites = [];
                    favoritesLoaded = true;
                    renderThemeGallery();
                }
            });
        }
        
        // Start AJAX fallback after 1 second if SDK hasn't responded
        setTimeout(function() {
            if (!favoritesLoaded && sdkAttempted) {
                console.log('[Theme Gallery] SDK taking too long, trying AJAX fallback...');
                tryAjaxFallback();
            }
        }, 1000);
    }

    /**
     * Save favorites to user-prefs.conf
     */
    function saveFavorites() {
        const favoritesString = favorites.join(',');
        
        console.log('[Theme Gallery] Saving favorites:', favorites);
        console.log('[Theme Gallery] Favorites string:', favoritesString);
        
        // Update UI immediately (optimistic update)
        renderThemeGallery();
        
        // Get current username
        const service = mvc.createService({ app: 'dashboard_theme_manager' });
        const username = service.username || 
                       Splunk?.util?.getConfigValue?.('USERNAME') || 
                       $C?.USERNAME || 
                       'admin';
        
        let sdkSaveAttempted = false;
        let saveDone = false;
        
        // Try SDK method first
        try {
            sdkSaveAttempted = true;
            const payload = { favorites: favoritesString };
            
            service.request(
                'configs/conf-user-prefs/theme_favorites',
                'POST',
                { output_mode: 'json' },
                payload,
                null,
                function(err, res) {
                    if (saveDone) return;
                    saveDone = true;
                    
                    if (err) {
                        console.error('[Theme Gallery] SDK save failed:', err);
                        tryAjaxSave();
                        return;
                    }
                    
                    console.log('[Theme Gallery] Favorites saved successfully via SDK');
                    setTimeout(loadFavorites, 1000);
                }
            );
        } catch (error) {
            console.error('[Theme Gallery] SDK save error:', error);
            tryAjaxSave();
        }
        
        // AJAX fallback after 1 second
        setTimeout(function() {
            if (!saveDone && sdkSaveAttempted) {
                console.log('[Theme Gallery] SDK save taking too long, trying AJAX...');
                tryAjaxSave();
            }
        }, 1000);
        
        function tryAjaxSave() {
            if (saveDone) return;
            
            $.ajax({
                url: `/splunkd/__raw/servicesNS/${username}/dashboard_theme_manager/configs/conf-user-prefs/theme_favorites`,
                type: 'POST',
                data: { favorites: favoritesString },
                success: function() {
                    if (saveDone) return;
                    saveDone = true;
                    console.log('[Theme Gallery] Favorites saved successfully via AJAX');
                    setTimeout(loadFavorites, 1000);
                },
                error: function(xhr) {
                    if (saveDone) return;
                    saveDone = true;
                    console.error('[Theme Gallery] AJAX save failed:', xhr.status, xhr.statusText);
                    loadFavorites(); // Reload to restore state
                }
            });
        }
    }

    /**
     * Initialize the theme gallery
     */
    function initThemeGallery() {
        console.log('[Theme Gallery] Initializing...');
        loadFavorites(); // Load favorites first
        loadThemeMetadata();
        setupEventListeners();
    }

    /**
     * Load theme metadata from JSON
     */
    function loadThemeMetadata() {
        fetch(CONFIG.metadataUrl)
            .then(response => response.json())
            .then(data => {
                allThemes = data.themes || [];
                filteredThemes = [...allThemes];
                themesLoaded = true;
                console.log(`[Theme Gallery] Loaded ${allThemes.length} themes`);
                renderThemeGallery();
                updateThemeCount();
            })
            .catch(error => {
                console.error('[Theme Gallery] Failed to load metadata:', error);
                showError('Failed to load themes. Please refresh the page.');
            });
    }

    /**
     * Build HTML for a single theme card
     */
    function buildThemeCard(theme) {
        // Trim theme ID and favorites for comparison
        const themeId = (theme.id || '').trim();
        const trimmedFavorites = favorites.map(f => f.trim());
        const isFavorite = trimmedFavorites.includes(themeId);
        
        const heartPath = 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';
        const heartFill = isFavorite ? 'currentColor' : 'none';

        return `
            <div class="tm-card-box" data-theme-id="${themeId}" data-order="${theme.order}">
                <span class="tm-card-mode">${theme.mode}</span>
                <span class="tm-card-category">${theme.category}</span>
                <button class="tm-favorite-btn ${isFavorite ? 'is-favorite' : ''}" data-theme-id="${themeId}" aria-label="Toggle favorite">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${heartFill}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="${heartPath}"></path>
                    </svg>
                </button>
                <div class="tm-profile-pic">
                    <img src="${theme.thumb}" alt="${theme.name}" loading="lazy" />
                </div>
                <div class="tm-card-bottom">
                    <div class="tm-bottom-content">
                        <span class="tm-box-name">${theme.name}</span>
                        <span class="tm-box-desc">${theme.description}</span>
                    </div>
                    <div class="tm-bottom-footer">
                        <button class="tm-btn-small btn-details-theme" data-theme-id="${themeId}">Details</button>
                        <button class="tm-btn-small btn-use-theme" data-theme-id="${themeId}">Use Theme</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the theme gallery
     */
    function renderThemeGallery() {
        // Don't render until both themes and favorites are loaded
        if (!themesLoaded || !favoritesLoaded) {
            console.log('[Theme Gallery] Waiting for data to load... (themes:', themesLoaded, ', favorites:', favoritesLoaded, ')');
            return;
        }
        
        const container = document.getElementById('theme-gallery-container');
        const carouselContainer = document.getElementById('theme-carousel-container');
        
        if (!container && !carouselContainer) {
            console.warn('[Theme Gallery] No container found');
            return;
        }

        // Apply filters
        applyFilters();

        // Render to grid (theme_dh.xml)
        if (container) {
            // Pagination Logic
            const startIndex = (currentPage - 1) * CONFIG.cardsPerPage;
            const endIndex = Math.min(startIndex + CONFIG.cardsPerPage, filteredThemes.length);
            const themesToRender = filteredThemes.slice(startIndex, endIndex);
            
            // Auto-reset page if empty (e.g. filter changed)
            if (themesToRender.length === 0 && filteredThemes.length > 0 && currentPage > 1) {
                currentPage = 1;
                renderThemeGallery();
                return;
            }

            if (themesToRender.length === 0) {
                 container.innerHTML = `
                    <div class="tm-table-empty" style="grid-column: 1/-1;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <path d="m21 21-4.3-4.3"></path>
                        </svg>
                        <p>No themes found matching your filters.</p>
                    </div>
                 `;
            } else {
                 container.innerHTML = themesToRender.map(buildThemeCard).join('');
                 attachCardEventListeners(container);
            }

            // Update Pagination UI
            updatePaginationUI();
        }

        // Render to carousel (home_dh.xml) - featured themes only
        if (carouselContainer) {
            const featuredThemes = filteredThemes.filter(t => t.featured);
            const carouselHTML = featuredThemes.map(buildThemeCard).join('');
            
            // Add arrow to carousel  
            const arrowHTML = `
                <a href="theme_dh" class="tm-carousel-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6"></path>
                    </svg>
                </a>
            `;
            
            carouselContainer.innerHTML = carouselHTML + arrowHTML;
            attachCardEventListeners(carouselContainer);
        }

        // Render to Editor Pick carousel (home_dh.xml)
        const editorContainer = document.getElementById('editor-pick-carousel-container');
        if (editorContainer) {
            const editorThemes = filteredThemes.filter(t => t.editor === 1);
            const editorHTML = editorThemes.map(buildThemeCard).join('');
            
            // Add arrow to carousel  
            const arrowHTML = `
                <a href="theme_dh" class="tm-carousel-arrow">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m9 18 6-6-6-6"></path>
                    </svg>
                </a>
            `;
            
            editorContainer.innerHTML = editorHTML + arrowHTML;
            attachCardEventListeners(editorContainer);
        }
        
        // Trigger custom event so home.js knows cards are ready
        document.dispatchEvent(new CustomEvent('themeGalleryLoaded'));
    }

    /**
     * Apply current filters
     */
    function applyFilters() {
        filteredThemes = allThemes.filter(theme => {
            // Mode filter
            if (currentFilters.mode !== 'all' && theme.mode.toLowerCase() !== currentFilters.mode.toLowerCase()) {
                return false;
            }
            
            // Category filter
            if (currentFilters.category !== 'all' && theme.category.toLowerCase() !== currentFilters.category.toLowerCase()) {
                return false;
            }
            
            // Search filter
            if (currentFilters.search) {
                const searchLower = currentFilters.search.toLowerCase();
                return theme.name.toLowerCase().includes(searchLower) || 
                       theme.description.toLowerCase().includes(searchLower);
            }
            
            return true;
        });

        // Sort by order
        filteredThemes.sort((a, b) => a.order - b.order);
    }

    /**
     * Attach event listeners to theme cards
     */
    function attachCardEventListeners(container) {
        // Favorite buttons
        container.querySelectorAll('.tm-favorite-btn').forEach(btn => {
            btn.addEventListener('click', handleFavoriteToggle);
        });

        // Use theme buttons
        container.querySelectorAll('.btn-use-theme').forEach(btn => {
            btn.addEventListener('click', handleThemeSelection);
        });

        // Details buttons
        container.querySelectorAll('.btn-details-theme').forEach(btn => {
            btn.addEventListener('click', handleThemeDetails);
        });
    }

    /**
     * Update Pagination UI
     */
    function updatePaginationUI() {
        const totalItems = filteredThemes.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / CONFIG.cardsPerPage));
        
        // Update Info Text
        const infoEl = document.getElementById('paginationInfo');
        if (infoEl) {
            infoEl.textContent = `Page ${currentPage} of ${totalPages}`;
        }

        // Update Buttons
        const btnFirst = document.getElementById('btnFirstPage');
        const btnPrev = document.getElementById('btnPrevPage');
        const btnNext = document.getElementById('btnNextPage');
        const btnLast = document.getElementById('btnLastPage');

        if (btnFirst) btnFirst.disabled = currentPage === 1;
        if (btnPrev) btnPrev.disabled = currentPage === 1;
        if (btnNext) btnNext.disabled = currentPage === totalPages;
        if (btnLast) btnLast.disabled = currentPage === totalPages;
        
        // Ensure dropdown matches config
        const rowsSelect = document.getElementById('rowsPerPage');
        if (rowsSelect && parseInt(rowsSelect.value) !== CONFIG.cardsPerPage) {
             rowsSelect.value = CONFIG.cardsPerPage;
        }
    }

    /**
     * Setup global event listeners
     */
    function setupEventListeners() {
        console.log('[Theme Gallery] Setting up event listeners...');
        
        // Category filter dropdown toggle
        const categoryFilterBtn = document.getElementById('categoryFilter');
        console.log('[Theme Gallery] Category filter button:', categoryFilterBtn);
        if (categoryFilterBtn) {
            categoryFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = categoryFilterBtn.closest('.tm-filter-dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('open');
                    console.log('[Theme Gallery] Category dropdown toggled:', dropdown.classList.contains('open'));
                }
                // Close other dropdowns
                document.querySelectorAll('.tm-filter-dropdown').forEach(dd => {
                    if (dd !== dropdown) dd.classList.remove('open');
                });
            });
        }

        // Category filter items
        const categoryItems = document.querySelectorAll('#categoryMenu .tm-dropdown-item');
        console.log('[Theme Gallery] Category filter items found:', categoryItems.length);
        categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = item.dataset.category || item.getAttribute('data-category');
                const label = item.textContent.trim();
                
                // Update active state
                document.querySelectorAll('#categoryMenu .tm-dropdown-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Update label
                const categoryLabel = document.getElementById('categoryLabel');
                if (categoryLabel) {
                    categoryLabel.textContent = label.replace('All Themes', 'All');
                }
                
                // Update filter
                currentFilters.category = category === 'all' ? 'all' : category;
                currentPage = 1;
                renderThemeGallery();
                updateThemeCount();
                
                // Close dropdown
                const dropdown = categoryFilterBtn?.closest('.tm-filter-dropdown');
                if (dropdown) dropdown.classList.remove('open');
            });
        });

        // Mode filter dropdown toggle
        const modeFilterBtn = document.getElementById('modeFilter');
        console.log('[Theme Gallery] Mode filter button:', modeFilterBtn);
        if (modeFilterBtn) {
            modeFilterBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = modeFilterBtn.closest('.tm-filter-dropdown');
                if (dropdown) {
                    dropdown.classList.toggle('open');
                    console.log('[Theme Gallery] Mode dropdown toggled:', dropdown.classList.contains('open'));
                }
                // Close other dropdowns
                document.querySelectorAll('.tm-filter-dropdown').forEach(dd => {
                    if (dd !== dropdown) dd.classList.remove('open');
                });
            });
        }

        // Mode filter items
        const modeItems = document.querySelectorAll('#modeMenu .tm-dropdown-item');
        console.log('[Theme Gallery] Mode filter items found:', modeItems.length);
        modeItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const mode = item.dataset.mode || item.getAttribute('data-mode');
                const label = item.textContent.trim();
                
                // Update active state
                document.querySelectorAll('#modeMenu .tm-dropdown-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                
                // Update label
                const modeLabel = document.getElementById('modeLabel');
                if (modeLabel) {
                    modeLabel.textContent = label.replace('All Modes', 'All');
                }
                
                // Update filter
                currentFilters.mode = mode === 'all' ? 'all' : mode;
                currentPage = 1;
                renderThemeGallery();
                updateThemeCount();
                
                // Close dropdown
                const dropdown = modeFilterBtn?.closest('.tm-filter-dropdown');
                if (dropdown) dropdown.classList.remove('open');
            });
        });

        // Search - support both IDs
        const searchInput = document.getElementById('themeSearch') || document.getElementById('theme-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                currentFilters.search = e.target.value;
                currentPage = 1;
                renderThemeGallery();
                updateThemeCount();
            }, 300));
        }

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.tm-filter-dropdown')) {
                document.querySelectorAll('.tm-filter-dropdown').forEach(dd => {
                    dd.classList.remove('open');
                });
            }
        });

        // Pagination Controls
        const rowsPerPageSelect = document.getElementById('rowsPerPage');
        if (rowsPerPageSelect) {
            rowsPerPageSelect.addEventListener('change', (e) => {
                CONFIG.cardsPerPage = parseInt(e.target.value);
                currentPage = 1;
                renderThemeGallery();
            });
        }

        const btnFirst = document.getElementById('btnFirstPage');
        if (btnFirst) {
            btnFirst.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage = 1;
                    renderThemeGallery();
                }
            });
        }

        const btnPrev = document.getElementById('btnPrevPage');
        if (btnPrev) {
            btnPrev.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderThemeGallery();
                }
            });
        }

        const btnNext = document.getElementById('btnNextPage');
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                const totalPages = Math.ceil(filteredThemes.length / CONFIG.cardsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    renderThemeGallery();
                }
            });
        }

        const btnLast = document.getElementById('btnLastPage');
        if (btnLast) {
            btnLast.addEventListener('click', () => {
                const totalPages = Math.ceil(filteredThemes.length / CONFIG.cardsPerPage);
                if (currentPage < totalPages) {
                    currentPage = totalPages;
                    renderThemeGallery();
                }
            });
        }
    }

    /**
     * Handle favorite toggle
     */
    function handleFavoriteToggle(e) {
        e.stopPropagation();
        const themeId = e.currentTarget.dataset.themeId;
        
        if (favorites.includes(themeId)) {
            favorites = favorites.filter(id => id !== themeId);
        } else {
            favorites.push(themeId);
        }
        
        // Save to Splunk user-prefs (this will re-render after save completes)
        saveFavorites();
    }

    /**
     * Handle theme selection (apply theme)
     */
    function handleThemeSelection(e) {
        const themeId = e.currentTarget.dataset.themeId;
        const theme = allThemes.find(t => t.id === themeId);
        
        if (!theme) return;

        console.log(`[Theme Gallery] Applying theme: ${theme.name} (${themeId})`);
        
        // This will trigger the existing apply theme logic
        if (window.applyTheme) {
            window.applyTheme(themeId);
        } else {
            // Fallback: use existing modal logic
            const existingUseBtn = document.querySelector(`[data-theme-id="${themeId}"].btn-use-theme`);
            if (existingUseBtn && existingUseBtn !== e.currentTarget) {
                existingUseBtn.click();
            }
        }
    }

    /**
     * Handle theme details view
     */
    function handleThemeDetails(e) {
        const themeId = e.currentTarget.dataset.themeId;
        const theme = allThemes.find(t => t.id === themeId);
        
        if (!theme) {
            console.error('[Theme Details] Theme not found:', themeId);
            return;
        }

        console.log('[Theme Details] Theme object:', theme);
        console.log('[Theme Details] Features available:', theme.features);

        // Get theme features from metadata
        const features = theme.features || [
            'Professional color scheme',
            'Optimized for dashboard clarity',
            'Consistent visual hierarchy',
            'Enhanced user experience'
        ];

        console.log('[Theme Details] Using features:', features);

        const themeImg = theme.image || `/static/app/dashboard_theme_manager/images/themes/${themeId}.png`;

        const modalHTML = `
            <div class="tm-details-modal-overlay" id="detailsModal">
                <div class="tm-details-modal">
                    <div class="tm-details-modal-header">
                        <h2>${theme.name}</h2>
                        <button class="tm-details-modal-close" id="closeDetailsModal">&times;</button>
                    </div>
                    <div class="tm-details-modal-body">
                        <div class="tm-details-image-container">
                            <img src="${themeImg}" alt="${theme.name} Preview" />
                        </div>
                        <div class="tm-details-content">
                            <h3>About This Theme</h3>
                            <p>${theme.description}</p>
                            <div class="tm-details-features">
                                <h4>Key Features</h4>
                                <ul>
                                    ${features.map(feature => `<li>${feature}</li>`).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('detailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Setup close handlers
        const closeBtn = document.getElementById('closeDetailsModal');
        const overlay = document.getElementById('detailsModal');

        const closeModal = () => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 200);
        };

        closeBtn.addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal();
            }
        });
    }

    /**
     * Show load more button for pagination
     */
    function showLoadMoreButton(container) {
        const loadMoreBtn = document.createElement('div');
        loadMoreBtn.className = 'tm-load-more';
        loadMoreBtn.innerHTML = '<button class="tm-btn-load-more">Load More Themes</button>';
        loadMoreBtn.querySelector('button').addEventListener('click', () => {
            currentPage++;
            renderThemeGallery();
        });
        container.after(loadMoreBtn);
    }

    /**
     * Update theme count display
     */
    function updateThemeCount() {
        // Update Gallery View Count (next to "All Themes")
        const galleryCountEl = document.getElementById('theme-count-label');
        if (galleryCountEl) {
            galleryCountEl.textContent = `${filteredThemes.length} Available`;
            // Show/hide based on loading
            galleryCountEl.style.opacity = allThemes.length ? '1' : '0';
        }

        // Update Home View Stats
        const homeCountEl = document.getElementById('theme-count-home');
        if (homeCountEl) {
            homeCountEl.textContent = filteredThemes.length;
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        const container = document.getElementById('theme-gallery-container') || 
                         document.getElementById('theme-carousel-container');
        if (container) {
            container.innerHTML = `<div class="tm-error">${message}</div>`;
        }
    }

    /**
     * Debounce utility
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Initialize when DOM is ready - with delay to ensure RequireJS has loaded everything
    function delayedInit() {
        setTimeout(() => {
            const hasGalleryElements = document.getElementById('categoryFilter') || document.getElementById('themeSearch');
            const hasCarouselElements = document.getElementById('theme-carousel-container') || document.getElementById('editor-pick-carousel-container');
            
            if (hasGalleryElements || hasCarouselElements) {
                initThemeGallery();
            } else {
                // Retry after a short delay if elements aren't ready yet
                setTimeout(delayedInit, 100);
            }
        }, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', delayedInit);
    } else {
        delayedInit();
    }

    // Export for external use
    window.ThemeGallery = {
        reload: loadThemeMetadata,
        filter: (mode, category) => {
            currentFilters.mode = mode || 'all';
            currentFilters.category = category || 'all';
            currentPage = 1;
            renderThemeGallery();
            updateThemeCount();
        },
        search: (query) => {
            currentFilters.search = query || '';
            currentPage = 1;
            renderThemeGallery();
            updateThemeCount();
        }
    };

});

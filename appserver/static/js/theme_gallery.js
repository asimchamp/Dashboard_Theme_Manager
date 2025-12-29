/**
 * Dynamic Theme Gallery Builder for Splunk Dashboard Theme Manager
 * Scales to 1000+ themes with filtering, search, and lazy loading
 */

(function() {
    'use strict';

    // Configuration
    const CONFIG = {
        metadataUrl: '/static/app/dashboard_theme_manager/themes_metadata.json',
        cardsPerPage: 50,
        enableLazyLoad: true,
        enableVirtualScroll: true
    };

    // State
    let allThemes = [];
    let filteredThemes = [];
    let currentFilters = {
        mode: 'all',
        category: 'all',
        search: ''
    };
    let favorites = JSON.parse(localStorage.getItem('theme_favorites') || '[]');
    let currentPage = 1;

    /**
     * Initialize the theme gallery
     */
    function initThemeGallery() {
        console.log('[Theme Gallery] Initializing...');
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
        const isFavorite = favorites.includes(theme.id);
        const heartPath = isFavorite
            ? 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z'
            : 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';
        const heartFill = isFavorite ? 'currentColor' : 'none';

        return `
            <div class="tm-card-box" data-theme-id="${theme.id}" data-order="${theme.order}">
                <span class="tm-card-mode">${theme.mode}</span>
                <span class="tm-card-category">${theme.category}</span>
                <button class="tm-favorite-btn" data-theme-id="${theme.id}" aria-label="Toggle favorite">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="${heartFill}" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="${heartPath}"></path>
                    </svg>
                </button>
                <div class="tm-profile-pic">
                    <img src="${theme.image}" alt="${theme.name}" loading="lazy" />
                </div>
                <div class="tm-card-bottom">
                    <div class="tm-bottom-content">
                        <span class="tm-box-name">${theme.name}</span>
                        <span class="tm-box-desc">${theme.description}</span>
                    </div>
                    <div class="tm-bottom-footer">
                        <button class="tm-btn-small btn-details-theme" data-theme-id="${theme.id}">Details</button>
                        <button class="tm-btn-small btn-use-theme" data-theme-id="${theme.id}">Use Theme</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render the theme gallery
     */
    function renderThemeGallery() {
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
            const themesToRender = CONFIG.enableLazyLoad 
                ? filteredThemes.slice(0, currentPage * CONFIG.cardsPerPage)
                : filteredThemes;
            
            container.innerHTML = themesToRender.map(buildThemeCard).join('');
            attachCardEventListeners(container);

            // Add lazy load trigger
            if (CONFIG.enableLazyLoad && filteredThemes.length > currentPage * CONFIG.cardsPerPage) {
                showLoadMoreButton(container);
            }
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
     * Setup global event listeners
     */
    function setupEventListeners() {
        // Mode filter
        const modeFilter = document.getElementById('theme-mode-filter');
        if (modeFilter) {
            modeFilter.addEventListener('change', (e) => {
                currentFilters.mode = e.target.value;
                currentPage = 1;
                renderThemeGallery();
                updateThemeCount();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('theme-category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                currentFilters.category = e.target.value;
                currentPage = 1;
                renderThemeGallery();
                updateThemeCount();
            });
        }

        // Search
        const searchInput = document.getElementById('theme-search');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                currentFilters.search = e.target.value;
                currentPage = 1;
                renderThemeGallery();
                updateThemeCount();
            }, 300));
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
        
        localStorage.setItem('theme_favorites', JSON.stringify(favorites));
        renderThemeGallery();
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

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initThemeGallery);
    } else {
        initThemeGallery();
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

})();

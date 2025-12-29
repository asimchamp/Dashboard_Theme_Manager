require([
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/searchmanager',
    'splunkjs/mvc/simplexml/ready!'
], function ($, mvc, SearchManager) {
    console.log("Theme Manager: Loaded");

    const Utils = {
        currentThemeId: null,

        init: function () {
            this.loadThemeMetadata(); // Load theme names from JSON
            this.setupButtonInteractions();
            this.loadSavedTheme();
            this.setupSearchAndFilters();
            this.setupThemeToggle(); // Make sure this is called if it exists
            this.fetchStats();
            this.fetchDashboardTableData();
        },

        setupThemeToggle: function () {
            const $toggle = $('#darkModeToggle');
            const $container = $('#themeManagerApp');

            // Initial check for system preference
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                $container.addClass('dark');
                $('body').addClass('dark-mode'); // Add to body for modals
            }

            $toggle.on('click', function () {
                $container.toggleClass('dark');
                $('body').toggleClass('dark-mode'); // Toggle on body for modals
                console.log("Theme toggled. Dark mode active:", $container.hasClass('dark'));
            });
        },

        setupButtonInteractions: function () {
            const self = this;

            // Use Theme button
            $(document).on('click', '.btn-use-theme', function (e) {
                e.preventDefault();
                const $card = $(this).closest('.tm-card, .tm-card-box');
                const themeId = $card.data('theme-id');
                const themeName = $card.find('.tm-card-title, .tm-box-name').text();
                self.showDashboardModal(themeId, themeName);
            });

            // Details button handler removed - now handled by theme_gallery.js
        },

        showDetailsModal: function (themeId, themeName, themeDesc, themeImg) {
            const features = this.getThemeFeatures(themeId);

            const modalHTML = `
                <div class="tm-details-modal-overlay" id="detailsModal">
                    <div class="tm-details-modal">
                        <div class="tm-details-modal-header">
                            <h2>${themeName}</h2>
                            <button class="tm-details-modal-close" id="closeDetailsModal">&times;</button>
                        </div>
                        <div class="tm-details-modal-body">
                            <div class="tm-details-image-container">
                                <img src="${themeImg}" alt="${themeName} Preview" />
                            </div>
                            <div class="tm-details-content">
                                <h3>About This Theme</h3>
                                <p>${themeDesc}</p>
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
            $('#detailsModal').remove();

            // Add modal to body
            $('body').append(modalHTML);

            // Bind close events
            $('#closeDetailsModal').on('click', function () {
                $('#detailsModal').fadeOut(200, function () {
                    $(this).remove();
                });
            });

            $('.tm-details-modal-overlay').on('click', function (e) {
                if (e.target === this) {
                    $('#detailsModal').fadeOut(200, function () {
                        $(this).remove();
                    });
                }
            });
        },

        getThemeFeatures: function (themeId) {
            // Features now come from themes_metadata.json
            // This function remains for compatibility, but will be replaced
            // by direct metadata access in showThemePreview
            return [
                'Loading features from metadata...'
            ];
        },

        fetchDashboardTableData: function() {
            const self = this;
            const service = mvc.createService();

            service.get('/servicesNS/-/-/data/ui/views?output_mode=json&count=-1', {}, function (err, response) {
                if (err) {
                    console.error('Error loading dashboards:', err);
                    $('#dashboard-table-wrapper').html('<div class="tm-table-empty">Error loading dashboards</div>');
                    $('#top-themes-list').html('<div class="tm-table-empty">Error loading data</div>');
                    return;
                }

                try {
                    let data;
                    if (typeof response.data === 'string') {
                        data = JSON.parse(response.data);
                    } else {
                        data = response.data;
                    }

                    const dashboards = data.entry || [];
                    const themedDashboards = [];
                    const themeCounts = {};

                    // Parse dashboards to find themed ones
                    dashboards.forEach(dashboard => {
                        const name = dashboard.name;
                        const label = (dashboard.content && dashboard.content.label) || name;
                        const app = (dashboard.acl && dashboard.acl.app) || 'search';
                        const xmlContent = (dashboard.content && dashboard.content['eai:data']) || '';
                        
                        // Look for theme panel reference
                        const themeMatch = xmlContent.match(/panel\s+ref="(dhm_dashboard_[^"]+)"\s+[^>]*app="dashboard_theme_manager"/);
                        
                        if (themeMatch) {
                            const themeId = themeMatch[1];
                            themedDashboards.push({
                                name: label,
                                id: name,
                                app: app,
                                themeId: themeId
                            });

                            // Count themes
                            themeCounts[themeId] = (themeCounts[themeId] || 0) + 1;
                        }
                    });

                    // Render table
                    self.renderDashboardTable(themedDashboards);

                    // Render top themes
                    self.renderTopThemes(themeCounts);

                } catch (parseErr) {
                    console.error('Parse error:', parseErr);
                    $('#dashboard-table-wrapper').html('<div class="tm-table-empty">Error parsing dashboard data</div>');
                }
            });
        },

        renderDashboardTable: function(dashboards) {
            const self = this;
            const wrapper = $('#dashboard-table-wrapper');

            if (dashboards.length === 0) {
                wrapper.html(`
                    <div class="tm-table-empty">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                            <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                            <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                            <rect width="7" height="5" x="3" y="16" rx="1"></rect>
                        </svg>
                        <p>No themed dashboards found</p>
                    </div>
                `);
                return;
            }

            let tableHTML = `
                <table class="tm-dashboard-table">
                    <thead>
                        <tr>
                            <th><input type="checkbox" class="tm-table-checkbox" id="selectAll" /></th>
                            <th>Dashboard</th>
                            <th>App</th>
                            <th>Theme</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            dashboards.forEach((dash, index) => {
                const themeName = self.getThemeNameById(dash.themeId);
                tableHTML += `
                    <tr>
                        <td><input type="checkbox" class="tm-table-checkbox" data-dashboard="${dash.id}" /></td>
                        <td class="tm-table-dashboard-name">${dash.name}</td>
                        <td class="tm-table-muted">${dash.app}</td>
                        <td class="tm-table-muted">${themeName}</td>
                        <td><span class="tm-status-badge active">Active</span></td>
                        <td>
                            <div class="tm-table-dropdown">
                                <button class="tm-table-dropdown-trigger" data-dashboard="${dash.id}" data-app="${dash.app}" data-theme="${dash.themeId}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="1"></circle>
                                        <circle cx="12" cy="5" r="1"></circle>
                                        <circle cx="12" cy="19" r="1"></circle>
                                    </svg>
                                </button>
                                <div class="tm-table-dropdown-menu">
                                    <button class="tm-table-dropdown-item" data-action="visit">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                            <polyline points="15 3 21 3 21 9"></polyline>
                                            <line x1="10" x2="21" y1="14" y2="3"></line>
                                        </svg>
                                        Visit Dashboard
                                    </button>
                                    <button class="tm-table-dropdown-item" data-action="view">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                            <circle cx="12" cy="12" r="3"></circle>
                                        </svg>
                                        View Theme
                                    </button>
                                    <button class="tm-table-dropdown-item" data-action="change">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path>
                                        </svg>
                                        Change Theme
                                    </button>
                                    <div class="tm-table-dropdown-separator"></div>
                                    <button class="tm-table-dropdown-item danger" data-action="remove">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M3 6h18"></path>
                                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                        </svg>
                                        Remove Theme
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                `;
            });

            tableHTML += `
                    </tbody>
                </table>
                <div class="tm-table-footer">
                    <div class="tm-table-selected-info">0 of ${dashboards.length} row(s) selected.</div>
                    <div class="tm-table-pagination">
                        <span class="tm-table-pagination-info">Page 1 of 1</span>
                        <div class="tm-table-pagination-controls">
                            <button class="tm-table-pagination-btn" disabled>Previous</button>
                            <button class="tm-table-pagination-btn" disabled>Next</button>
                        </div>
                    </div>
                </div>
            `;

            wrapper.html(tableHTML);

            // Bind dropdown toggle
            wrapper.find('.tm-table-dropdown-trigger').on('click', function(e) {
                e.stopPropagation();
                const dropdown = $(this).parent();
                $('.tm-table-dropdown').not(dropdown).removeClass('open');
                dropdown.toggleClass('open');
            });

            // Close dropdowns when clicking outside
            $(document).on('click', function() {
                $('.tm-table-dropdown').removeClass('open');
            });

            // Bind action buttons
            wrapper.find('.tm-table-dropdown-item').on('click', function() {
                const action = $(this).data('action');
                const trigger = $(this).closest('.tm-table-dropdown').find('.tm-table-dropdown-trigger');
                const dashboard = trigger.data('dashboard');
                const app = trigger.data('app');
                const theme = trigger.data('theme');

                // Close dropdown
                $(this).closest('.tm-table-dropdown').removeClass('open');

                switch(action) {
                    case 'visit':
                        window.open(`/app/${app}/${dashboard}`, '_blank');
                        break;
                    case 'view':
                        self.showThemePreview(theme);
                        break;
                    case 'change':
                        self.showDashboardModal(null, null, dashboard, app);
                        break;
                    case 'remove':
                        self.handleRemoveTheme(dashboard, app);
                        break;
                }
            });

            // Handle select all checkbox
            $('#selectAll').on('change', function() {
                const isChecked = $(this).prop('checked');
                $('.tm-table-checkbox').not(this).prop('checked', isChecked);
                self.updateSelectedCount();
            });

            // Handle individual checkboxes
            wrapper.find('.tm-table-checkbox').not('#selectAll').on('change', function() {
                self.updateSelectedCount();
            });
        },

        updateSelectedCount: function() {
            const total = $('.tm-table-checkbox').not('#selectAll').length;
            const selected = $('.tm-table-checkbox:checked').not('#selectAll').length;
            $('.tm-table-selected-info').text(`${selected} of ${total} row(s) selected.`);
            
            // Update select all checkbox state
            $('#selectAll').prop('checked', selected === total && total > 0);
        },

        // Cache for theme metadata
        themeMetadataCache: null,

        getThemeNameById: function(themeId) {
            // If cache exists, use it synchronously
            if (this.themeMetadataCache && this.themeMetadataCache[themeId]) {
                return this.themeMetadataCache[themeId];
            }
            
            // Fallback if not in cache (shouldn't happen after init)
            return themeId.replace('dhm_dashboard_', '').split('_')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        },

        loadThemeMetadata: function() {
            const self = this;
            
            fetch('/static/app/dashboard_theme_manager/themes_metadata.json')
                .then(response => response.json())
                .then(data => {
                    // Build cache map: themeId -> themeName
                    self.themeMetadataCache = {};
                    (data.themes || []).forEach(theme => {
                        self.themeMetadataCache[theme.id] = theme.name;
                    });
                    console.log('[Theme Manager] Loaded metadata for', Object.keys(self.themeMetadataCache).length, 'themes');
                })
                .catch(error => {
                    console.error('[Theme Manager] Failed to load theme metadata:', error);
                    // Initialize empty cache to prevent repeated failed attempts
                    self.themeMetadataCache = {};
                });
        },

        showThemePreview: function(themeId) {
            const self = this;
            const themeName = this.getThemeNameById(themeId);
            const themeImg = `/static/app/dashboard_theme_manager/images/themes/${themeId}.png`;
            
            // Load features from metadata
            fetch('/static/app/dashboard_theme_manager/themes_metadata.json')
                .then(response => response.json())
                .then(data => {
                    const theme = data.themes.find(t => t.id === themeId);
                    const features = theme && theme.features ? theme.features : [
                        'Professional color scheme',
                        'Optimized for dashboard clarity',
                        'Consistent visual hierarchy',
                        'Enhanced user experience'
                    ];

                    const modalHTML = `
                        <div class="tm-details-modal-overlay" id="detailsModal">
                            <div class="tm-details-modal">
                                <div class="tm-details-modal-header">
                                    <h2>${themeName}</h2>
                                    <button class="tm-details-modal-close" id="closeDetailsModal">&times;</button>
                                </div>
                                <div class="tm-details-modal-body">
                                    <div class="tm-details-image-container">
                                        <img src="${themeImg}" alt="${themeName} Preview" />
                                    </div>
                                    <div class="tm-details-content">
                                        <h3>About This Theme</h3>
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

                    $('#detailsModal').remove();
                    $('body').append(modalHTML);

                    $('#closeDetailsModal, .tm-details-modal-overlay').on('click', function (e) {
                        if (e.target === this) {
                            $('#detailsModal').fadeOut(200, function () {
                                $(this).remove();
                            });
                        }
                    });
                })
                .catch(error => {
                    console.error('Error loading theme metadata:', error);
                    // Fallback to basic features
                    const features = self.getThemeFeatures(themeId);
                    // ... rest of modal code with fallback features
                });
        },

        handleRemoveTheme: function(dashboard, app) {
            const self = this;
            
            if (!confirm(`Are you sure you want to remove the theme from dashboard "${dashboard}"?`)) {
                return;
            }

            // Show progress modal
            self.showProgressModal('Removing Theme', [
                { title: 'Preparing', status: 'Pending' },
                { title: 'Removing Theme', status: 'Pending' },
                { title: 'Refreshing Dashboard', status: 'Pending' }
            ]);

            // Step 1: Preparing
            self.updateProgressStep(0, 'active');

            setTimeout(() => {
                self.updateProgressStep(0, 'completed');
                
                // Step 2: Removing
                self.updateProgressStep(1, 'active');

                $.ajax({
                    url: Splunk.util.make_url('/splunkd/__raw/servicesNS/nobody/dashboard_theme_manager/apply_theme'),
                    method: 'POST',
                    data: {
                        dashboard: dashboard,
                        source_app: app,
                        action: 'remove',
                        output_mode: 'json'
                    },
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    success: function (response) {
                        self.updateProgressStep(1, 'completed');
                        
                        // Step 3: Refreshing
                        self.updateProgressStep(2, 'active');
                        
                        setTimeout(() => {
                            self.updateProgressStep(2, 'completed');
                            
                            // Wait a bit to show completed state
                            setTimeout(() => {
                                self.closeProgressModal();
                                self.fetchDashboardTableData(); // Refresh table
                                self.fetchStats(); // Refresh stats
                            }, 800);
                        }, 500);
                    },
                    error: function (xhr, status, error) {
                        console.error('Remove theme error:', xhr, status, error);
                        self.closeProgressModal();
                        alert(`Error removing theme: ${error || xhr.statusText}`);
                    }
                });
            }, 600);
        },

        renderTopThemes: function(themeCounts) {
            const self = this;
            const container = $('#top-themes-list');

            // Convert to array and sort
            const themeArray = Object.entries(themeCounts)
                .map(([id, count]) => ({ id, name: self.getThemeNameById(id), count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5); // Top 5

            if (themeArray.length === 0) {
                container.html('<div class="tm-table-empty">No theme usage data</div>');
                return;
            }

            const maxCount = themeArray[0].count;
            let html = '';

            themeArray.forEach((theme, index) => {
                const rank = index + 1;
                const rankClass = rank <= 3 ? `rank-${rank}` : 'rank-other';
                const percentage = (theme.count / maxCount) * 100;

                html += `
                    <div class="tm-theme-rank-item">
                        <div class="tm-theme-rank-medal ${rankClass}">${rank}</div>
                        <div class="tm-theme-rank-content">
                            <p class="tm-theme-rank-name">${theme.name}</p>
                            <div class="tm-theme-rank-bar-wrapper">
                                <div class="tm-theme-rank-bar" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                        <span class="tm-theme-rank-count">${theme.count} use${theme.count !== 1 ? 's' : ''}</span>
                    </div>
                `;
            });

            container.html(html);
        },

        showProgressModal: function(title, steps) {
            const stepsHTML = steps.map((step, index) => `
                <div class="tm-progress-step" data-step="${index}">
                    <div class="tm-progress-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <div class="tm-progress-content">
                        <h3>${step.title}</h3>
                        <span class="tm-progress-status">${step.status}</span>
                    </div>
                </div>
            `).join('');

            const modalHTML = `
                <div class="tm-progress-overlay" id="progressModal">
                    <div class="tm-progress-modal">
                        <div class="tm-progress-steps">
                            ${stepsHTML}
                        </div>
                    </div>
                </div>
            `;

            $('#progressModal').remove();
            $('body').append(modalHTML);
        },

        updateProgressStep: function(stepIndex, status) {
            const step = $(`.tm-progress-step[data-step="${stepIndex}"]`);
            
            if (status === 'active') {
                step.addClass('active').removeClass('completed');
                step.find('.tm-progress-status').text('In Progress');
            } else if (status === 'completed') {
                step.addClass('completed').removeClass('active');
                step.find('.tm-progress-status').text('Completed');
            }
        },

        closeProgressModal: function() {
            $('#progressModal').fadeOut(200, function() {
                $(this).remove();
            });
        },

        showDashboardModal: function (themeId, themeName, targetDashboard, targetApp) {
            const self = this;
            self.currentThemeId = themeId;
            self.targetDashboard = targetDashboard;
            self.targetApp = targetApp;

            // Determine modal mode: applying theme to dashboard OR changing dashboard's theme
            const isChangeMode = !themeId && targetDashboard;
            const isApplyMode = themeId && !targetDashboard;

            // Create modal HTML
            let title, description, bodyContent;

            if (isChangeMode) {
                // Change mode: showing theme picker for specific dashboard
                title = 'Choose a New Theme';
                description = `Select a theme to apply to <strong>${targetDashboard}</strong>:`;
                bodyContent = `
                    <div id="themeSelector" class="tm-theme-selector">
                        <div class="tm-loading">Loading themes...</div>
                    </div>
                `;
            } else {
                // Apply mode: showing dashboard picker for specific theme
                title = `Apply "${themeName || 'Theme'}" Theme`;
                description = 'Search and select a dashboard to apply this theme:';
                bodyContent = `
                    <input type="text" id="dashboardSearch" class="tm-search-input" placeholder="Search dashboards..." />
                    <div id="dashboardList" class="tm-dashboard-list">
                        <div class="tm-loading">Loading dashboards...</div>
                    </div>
                `;
            }

            const modalHTML = `
                <div class="tm-modal-overlay" id="dashboardModal">
                    <div class="tm-modal">
                        <div class="tm-modal-header">
                            <h2>${title}</h2>
                            <button class="tm-modal-close" id="closeModal">&times;</button>
                        </div>
                        <div class="tm-modal-body">
                            <p>${description}</p>
                            ${bodyContent}
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            $('#dashboardModal').remove();

            // Add modal to body
            $('body').append(modalHTML);

            // Bind close event
            $('#closeModal, .tm-modal-overlay').on('click', function (e) {
                if (e.target === this) {
                    $('#dashboardModal').fadeOut(200, function () {
                        $(this).remove();
                    });
                }
            });

            // Fetch appropriate data
            if (isChangeMode) {
                self.fetchThemesForChange(targetDashboard, targetApp);
            } else {
                self.fetchDashboards();
            }
        },

        fetchThemesForChange: function(dashboard, app) {
            const self = this;
            
            fetch('/static/app/dashboard_theme_manager/themes_metadata.json')
                .then(response => response.json())
                .then(data => {
                    const themes = data.themes || [];
                    let html = '<div class="tm-grid" style="grid-template-columns: repeat(3, 1fr); gap: 1rem; max-height: 400px; overflow-y: auto;">';
                    
                    themes.forEach(theme => {
                        html += `
                            <div class="tm-theme-option" data-theme-id="${theme.id}" style="cursor: pointer; padding: 1rem; border: 1px solid hsl(var(--tm-border)); border-radius: var(--tm-radius); text-align: center; transition: all 0.2s;">
                                <img src="${theme.image}" alt="${theme.name}" style="width: 100%; border-radius: calc(var(--tm-radius) * 0.75); margin-bottom: 0.5rem;" />
                                <p style="font-weight: 600; margin: 0; font-size: 0.875rem;">${theme.name}</p>
                            </div>
                        `;
                    });
                    
                    html += '</div>';
                    $('#themeSelector').html(html);
                    
                    // Add hover effect
                    $('.tm-theme-option').hover(
                        function() { $(this).css('background-color', 'hsl(var(--tm-muted) / 0.3)'); },
                        function() { $(this).css('background-color', 'transparent'); }
                    );
                    
                    // Bind click events
                    $('.tm-theme-option').on('click', function() {
                        const selectedThemeId = $(this).data('theme-id');
                        self.currentThemeId = selectedThemeId;
                        self.applyTheme(dashboard, app);
                    });
                })
                .catch(error => {
                    console.error('Error loading themes:', error);
                    $('#themeSelector').html('<div class="tm-error">Error loading themes. Please try again.</div>');
                });
        },

        fetchStats: function() {
            console.log("Fetching theme stats...");
            
            // Create the stats search
            const statsSearch = new SearchManager({
                id: "theme_stats_search",
                earliest_time: "-15m",
                latest_time: "now",
                preview: false,
                cache: false,
                search: `
                    | rest /servicesNS/-/-/data/ui/views splunk_server=local
                    | search isDashboard=1
                    | eval xml='eai:data'
                    | rex field=xml "panel\\s+ref=\\"(?<active_theme>dhm_dashboard_[^\\"]+)\\"\\s+[^>]*app=\\"dashboard_theme_manager\\""
                    | stats count as total_dashboards, count(active_theme) as used_dashboards, dc(active_theme) as used_themes
                `
            });

            const results = statsSearch.data("results");

            results.on("data", function() {
                const data = results.data();
                if (data && data.rows && data.rows.length > 0) {
                    const row = data.rows[0];
                    // fields are [total_dashboards, used_dashboards, used_themes]
                    const idxTotal = data.fields.indexOf("total_dashboards");
                    const idxUsedDash = data.fields.indexOf("used_dashboards");
                    const idxUsedThemes = data.fields.indexOf("used_themes");

                    const totalDashboards = (idxTotal !== -1) ? row[idxTotal] : 0;
                    const usedDashboards = (idxUsedDash !== -1) ? row[idxUsedDash] : 0;
                    const usedThemes = (idxUsedThemes !== -1) ? row[idxUsedThemes] : 0;

                    // Update UI
                    $('#stat-total-dashboards').text(totalDashboards).css('opacity', 0).animate({opacity: 1}, 500);
                    $('#stat-used-dashboards').text(usedDashboards).css('opacity', 0).animate({opacity: 1}, 500);
                    $('#stat-used-themes').text(usedThemes).css('opacity', 0).animate({opacity: 1}, 500);
                    
                    console.log("Stats updated:", {total: totalDashboards, usedDash: usedDashboards, usedThemes: usedThemes});
                }
            });

            results.on("error", function(err) {
                console.error("Error fetching stats:", err);
            });
        },

        fetchDashboards: function () {
            const self = this;
            const service = mvc.createService();

            service.get('/servicesNS/-/-/data/ui/views?output_mode=json&count=-1', {}, function (err, response) {
                if (err) {
                    $('#dashboardList').html(`<div class="tm-error">Error loading dashboards: ${err.message || 'Unknown error'}</div>`);
                    return;
                }

                try {
                    // Response.data might already be parsed or might be a string
                    let data;
                    if (typeof response.data === 'string') {
                        data = JSON.parse(response.data);
                    } else {
                        data = response.data;
                    }

                    const dashboards = data.entry || [];

                    if (dashboards.length === 0) {
                        $('#dashboardList').html('<div class="tm-info">No dashboards found.</div>');
                        return;
                    }

                    // Filter and render dashboard list
                    let listHTML = '<div class="tm-dashboard-grid">';
                    let count = 0;
                    dashboards.forEach(dashboard => {
                        const name = dashboard.name;
                        const label = (dashboard.content && dashboard.content.label) || name;
                        const rootNode = (dashboard.content && dashboard.content.rootNode) || '';
                        const app = (dashboard.acl && dashboard.acl.app) || 'search';  // Extract source app

                        // Only show form and dashboard types, skip prebuilt and system dashboards
                        if ((rootNode === 'form' || rootNode === 'dashboard') && !name.startsWith('_')) {
                            listHTML += `
                                <button class="tm-dashboard-item" data-dashboard="${name}" data-app="${app}">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <rect width="7" height="9" x="3" y="3" rx="1"/>
                                        <rect width="7" height="5" x="14" y="3" rx="1"/>
                                        <rect width="7" height="9" x="14" y="12" rx="1"/>
                                        <rect width="7" height="5" x="3" y="16" rx="1"/>
                                    </svg>
                                    <span class="tm-dashboard-name">${label}</span>
                                    <span class="tm-dashboard-app">${app}</span>
                                </button>
                            `;
                            count++;
                        }
                    });
                    listHTML += '</div>';

                    if (count === 0) {
                        $('#dashboardList').html('<div class="tm-info">No compatible dashboards found.</div>');
                        return;
                    }

                    $('#dashboardList').html(listHTML);

                    // Bind click events to dashboard items
                    $('.tm-dashboard-item').on('click', function () {
                        const dashboardName = $(this).data('dashboard');
                        const sourceApp = $(this).data('app');
                        self.applyTheme(dashboardName, sourceApp);
                    });

                    // Add search functionality
                    $('#dashboardSearch').on('input', function () {
                        const searchTerm = $(this).val().toLowerCase();
                        $('.tm-dashboard-item').each(function () {
                            const dashboardText = $(this).text().toLowerCase();
                            if (dashboardText.includes(searchTerm)) {
                                $(this).show();
                            } else {
                                $(this).hide();
                            }
                        });
                    });

                } catch (parseErr) {
                    console.error('Parse error:', parseErr, 'Response:', response);
                    $('#dashboardList').html(`<div class="tm-error">Error loading dashboards. Please refresh and try again.</div>`);
                }
            });
        },

        applyTheme: function (dashboardName, sourceApp) {
            const self = this;
            const themeId = self.currentThemeId;
            
            // Close dashboard modal
            $('#dashboardModal').fadeOut(200, function() {
                $(this).remove();
            });

            // Show progress modal
            self.showProgressModal('Applying Theme', [
                { title: 'Select Dashboard', status: 'Completed' },
                { title: 'Processing', status: 'Pending' },
                { title: 'Theme Applied', status: 'Pending' }
            ]);

            // Step 1 is already completed (dashboard selected)
            self.updateProgressStep(0, 'completed');
            
            // Step 2: Processing
            self.updateProgressStep(1, 'active');

            // Start theme application via AJAX
            $.ajax({
                url: Splunk.util.make_url('/splunkd/__raw/servicesNS/nobody/dashboard_theme_manager/apply_theme'),
                method: 'POST',
                data: {
                    dashboard: dashboardName,
                    theme_id: themeId,
                    source_app: sourceApp,
                    output_mode: 'json'
                },
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                success: function (response) {
                    // Step 2: Processing complete
                    setTimeout(function () {
                        self.updateProgressStep(1, 'completed');
                        
                        // Step 3: Theme Applied
                        self.updateProgressStep(2, 'active');
                        
                        setTimeout(function () {
                            self.updateProgressStep(2, 'completed');
                            
                            // Wait a bit to show completed state, then show view option
                            setTimeout(() => {
                                // Add View button to completed modal
                                const viewBtn = `
                                    <div class="tm-progress-actions">
                                        <button class="tm-table-btn tm-table-btn-primary" id="progressViewBtn">
                                            View Dashboard →
                                        </button>
                                    </div>
                                `;
                                $('.tm-progress-modal').append(viewBtn);
                                
                                $('#progressViewBtn').on('click', function() {
                                    window.open(`/app/${sourceApp}/${dashboardName}`, '_blank');
                                    self.closeProgressModal();
                                });
                                
                                // Refresh table and stats
                                self.fetchDashboardTableData();
                                self.fetchStats();
                            }, 500);
                        }, 500);
                    }, 1000);
                },
                error: function (xhr, status, error) {
                    console.error('Apply theme error:', xhr, status, error);
                    self.closeProgressModal();
                    alert(`Error applying theme: ${error || xhr.statusText}`);
                }
            });
        },

        loadSavedTheme: function () {
            // Future implementation: Load saved theme from user pref or kvstore
        },

        setupSearchAndFilters: function () {
            // Search functionality
            $('#themeSearch').on('input', function () {
                const searchTerm = $(this).val().toLowerCase();
                $('.tm-card-box').each(function () {
                    const themeName = $(this).find('.tm-box-name').text().toLowerCase();
                    const themeDesc = $(this).find('.tm-box-desc').text().toLowerCase();
                    const category = $(this).find('.tm-card-category').text().toLowerCase();
                    const matches = themeName.includes(searchTerm) || themeDesc.includes(searchTerm) || category.includes(searchTerm);
                    $(this).toggle(matches);
                });
            });

            // Category filter dropdown toggle
            $('#categoryFilter').on('click', function (e) {
                e.stopPropagation();
                $(this).parent('.tm-filter-dropdown').toggleClass('open');
            });

            // Close dropdown when clicking outside
            $(document).on('click', function (e) {
                if (!$(e.target).closest('.tm-filter-dropdown').length) {
                    $('.tm-filter-dropdown').removeClass('open');
                }
            });

            // Category filter items
            $('.tm-dropdown-item').on('click', function (e) {
                e.stopPropagation();
                const category = $(this).data('category');
                const label = $(this).text();

                // Update active state
                $('.tm-dropdown-item').removeClass('active');
                $(this).addClass('active');

                // Update label
                $('#categoryLabel').text(label.replace('All Themes', 'All'));

                // Filter themes
                if (category === 'all') {
                    $('.tm-card-box').show();
                } else {
                    $('.tm-card-box').each(function () {
                        const themeCategory = $(this).find('.tm-card-category').text().toLowerCase();
                        $(this).toggle(themeCategory === category);
                    });
                }

                // Close dropdown
                $('.tm-filter-dropdown').removeClass('open');
            });

            // Mode filter dropdown toggle
            $('#modeFilter').on('click', function (e) {
                e.stopPropagation();
                $(this).parent('.tm-filter-dropdown').toggleClass('open');
            });

            // Mode filter items
            $('.tm-dropdown-menu#modeMenu .tm-dropdown-item').on('click', function (e) {
                e.stopPropagation();
                const mode = $(this).data('mode');
                const label = $(this).text();

                // Update active state
                $('.tm-dropdown-menu#modeMenu .tm-dropdown-item').removeClass('active');
                $(this).addClass('active');

                // Update label
                $('#modeLabel').text(label.replace('All Modes', 'All'));

                // Filter themes by mode
                if (mode === 'all') {
                    $('.tm-card-box').show();
                } else {
                    $('.tm-card-box').each(function () {
                        const themeMode = $(this).find('.tm-card-mode').text().toLowerCase();
                        $(this).toggle(themeMode === mode);
                    });
                }

                // Close dropdown
                $('.tm-filter-dropdown').removeClass('open');
            });
        }
    };

    Utils.init();
});
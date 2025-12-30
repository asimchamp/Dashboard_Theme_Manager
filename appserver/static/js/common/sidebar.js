require([
    'jquery',
    'splunkjs/mvc',
    'splunkjs/mvc/simplexml/ready!'
], function($, mvc) {
    
    // HTML Structure for sidebar
    const SIDEBAR_HTML = `
    <aside class="tm-sidebar">
        <button class="tm-sidebar-toggle" id="sidebarToggle" aria-label="Toggle Sidebar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                <path d="M9 3v18"></path>
            </svg>
        </button>
        <div class="tm-sidebar-title">Theme Manager</div>
        <ul class="tm-nav-list">
            <li>
                <a href="overview_dh" class="tm-nav-btn" data-page="overview_dh" data-label="Home">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Home</span>
                </a>
            </li>
            <li>
                <a href="home_dh" class="tm-nav-btn" data-page="home_dh" data-label="Dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                        <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                        <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                        <rect width="7" height="5" x="3" y="16" rx="1"></rect>
                    </svg>
                    <span>Dashboard</span>
                </a>
            </li>
            <li>
                <a href="theme_dh" class="tm-nav-btn" data-page="theme_dh" data-label="Theme Gallery">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle>
                        <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle>
                        <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle>
                        <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle>
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
                    </svg>
                    <span>Theme Gallery</span>
                </a>
            </li>
            <li>
                <a href="appearance" class="tm-nav-btn" data-page="appearance" data-label="Appearance">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>Appearance</span>
                </a>
            </li>
            <li>
                <a href="settings" class="tm-nav-btn" data-page="settings" data-label="Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Settings</span>
                </a>
            </li>
             <li>
                <a href="overview_dh#how-it-works" class="tm-nav-btn" data-page="help" data-label="Help">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <span>Help</span>
                </a>
            </li>
        </ul>
        <div class="tm-sidebar-footer">
            <button id="darkModeToggle" class="tm-theme-toggle" aria-label="Toggle Dark Mode" title="Toggle Dark/Light Mode">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="moon-icon">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sun-icon" style="display: none;">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            </button>
        </div>
    </aside>
    `;

    // --- Initialization ---
    $(document).ready(function() {
        console.log('[Theme Manager] Sidebar initializing...');
        
        // Find the main app container
        const $appContainer = $('#themeManagerApp, .dashboard-container');
        
        if ($appContainer.length === 0) {
            console.warn('[Theme Manager] No app container found');
            return;
        }

        // CRITICAL: Wrap existing content in a flex container if not already wrapped
        if ($('.tm-sidebar').length === 0) {
            // Get all existing content
            const existingContent = $appContainer.html();
            
            // Clear container and inject sidebar + wrapped content
            $appContainer.html(`
                ${SIDEBAR_HTML}
                <div class="tm-main-content">
                    ${existingContent}
                </div>
            `);
            
            console.log('[Theme Manager] Sidebar injected with flexbox layout');
        }

        // Handle Active State
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'overview_dh';
        
        $('.tm-nav-btn').removeClass('active');
        $(`.tm-nav-btn[data-page="${page}"]`).addClass('active');

        // Handle Toggle
        const isCollapsed = localStorage.getItem('tm_sidebar_collapsed') === 'true';
        if (isCollapsed) {
            $('.tm-sidebar').addClass('collapsed');
        }

        $(document).on('click', '#sidebarToggle', function() {
            $('.tm-sidebar').toggleClass('collapsed');
            
            const collapsed = $('.tm-sidebar').hasClass('collapsed');
            localStorage.setItem('tm_sidebar_collapsed', collapsed);
        });

        // Handle Dark Mode Toggle
        const isDarkMode = localStorage.getItem('tm_dark_mode') === 'true';
        const $themeManagerApp = $('#themeManagerApp');
        
        if (isDarkMode) {
            $('body').attr('data-theme', 'dark');
            if ($themeManagerApp.length) {
                $themeManagerApp.addClass('dark');
            }
            $('.moon-icon').hide();
            $('.sun-icon').show();
        }

        $(document).on('click', '#darkModeToggle', function() {
            const currentTheme = $('body').attr('data-theme');
            
            if (currentTheme === 'dark') {
                // Switch to light mode
                $('body').removeAttr('data-theme');
                if ($themeManagerApp.length) {
                    $themeManagerApp.removeClass('dark');
                }
                $('.moon-icon').show();
                $('.sun-icon').hide();
                localStorage.setItem('tm_dark_mode', 'false');
            } else {
                // Switch to dark mode
                $('body').attr('data-theme', 'dark');
                if ($themeManagerApp.length) {
                    $themeManagerApp.addClass('dark');
                }
                $('.moon-icon').hide();
                $('.sun-icon').show();
                localStorage.setItem('tm_dark_mode', 'true');
            }
        });

        console.log('[Theme Manager] Sidebar initialized successfully');
    });
});

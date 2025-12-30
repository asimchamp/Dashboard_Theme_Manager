// Load external libraries directly in RequireJS dependency array (like Chart.js example)
require([
    'jquery',
    'splunkjs/mvc/simplexml/ready!',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js',
    'https://unpkg.com/@studio-freight/lenis@1.0.42/dist/lenis.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js'
], function($, ready, gsapModule, LenisModule, ScrollTriggerModule) {
    // Function to load CSS files or preconnect links
    function loadCSS(href, rel, crossorigin) {
      rel = rel || "stylesheet";
      var link = document.createElement("link");
      link.href = href;
      link.rel = rel;
      if (crossorigin) {
        link.crossOrigin = crossorigin;
      }
      document.head.appendChild(link);
    }

    // Load Google Fonts
    loadCSS("https://fonts.googleapis.com", "preconnect");
    loadCSS("https://fonts.gstatic.com", "preconnect", "anonymous");
    loadCSS("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500;600&display=swap");

    console.log('Libraries loaded via RequireJS. Checking module returns...');
    console.log('gsapModule:', gsapModule, 'typeof gsap:', typeof gsap);
    console.log('LenisModule:', LenisModule, 'typeof Lenis:', typeof Lenis);
    console.log('ScrollTriggerModule:', ScrollTriggerModule, 'typeof ScrollTrigger:', typeof ScrollTrigger);
    
    // If modules are returned but not available as globals, assign them
    if (typeof Lenis === 'undefined' && LenisModule) {
        window.Lenis = LenisModule;
        console.log('Assigned Lenis to window from module');
    }
    
    if (typeof ScrollTrigger === 'undefined' && ScrollTriggerModule) {
        window.ScrollTrigger = ScrollTriggerModule;
        console.log('Assigned ScrollTrigger to window from module');
    }
    
    // Register ScrollTrigger plugin with GSAP
    if (window.gsap && window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        console.log('Registered ScrollTrigger with GSAP');
    }
    
      // Initialize app
      setTimeout(function() {
          initApp();
      }, 100);

      // Declare lenis at module scope so it's accessible to all functions
      let lenisInstance = null;

      function initApp() {
        // Verify all required libraries are available
        if (typeof gsap === 'undefined') {
          console.error('GSAP is not defined');
          return;
        }
        if (typeof Lenis === 'undefined') {
          console.error('Lenis is not defined');
          return;
        }
        if (typeof ScrollTrigger === 'undefined') {
          console.error('ScrollTrigger is not defined');
          return;
        }
        
        console.log('Initializing app with GSAP, Lenis, and ScrollTrigger');

      // 0. Initialize Lenis for Smooth Scroll
        lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
      });

        function raf(time) {
          lenisInstance.raf(time);
          requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        // Integrate Lenis with GSAP
        gsap.registerPlugin(ScrollTrigger);

      // 1. GSAP Parallax Logic

      // A. Hero Entrance (Explicit)
      const heroTl = gsap.timeline();
      heroTl
        .from(".hero-content", {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: "power3.out",
          delay: 0.2,
        })
        .from(
          ".hero-visual",
          {
            y: 100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
          },
          "-=0.8"
        );

      // B. Hero Scroll Parallax
      // Use immediateRender: false to prevent conflict with entrance
      gsap.to(".hero-visual", {
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 300, // Heavier parallax
        scale: 0.8, // Slight zoom out
        ease: "none",
        immediateRender: false,
      });

      gsap.to(".hero-content", {
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
        y: 150,
        opacity: 0,
        ease: "none",
        immediateRender: false,
      });

      // Blob Floating Parallax (Enhancement)
      gsap.to(".blob-1", {
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
        y: 500,
        rotation: 45,
      });

      gsap.to(".blob-2", {
        scrollTrigger: {
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
        y: -300,
        rotation: -45,
      });

      // General Fade In Up Animations (Replacing IntersectionObserver)
      const fadeElements = document.querySelectorAll(".fade-in-up");
      fadeElements.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
          }
        );
      });

      // Staggered Animations for Grids (Targeting specific feature cards now)
      gsap.from(".feature-card", {
        scrollTrigger: {
          trigger: ".features-grid",
          start: "top 80%",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "back.out(1.7)",
      });

      // Horizontal Parallax for Showcase Steps
      document.querySelectorAll(".step-container").forEach((step, index) => {
        const direction = index % 2 === 0 ? 1 : -1;

        gsap.fromTo(
          step.querySelector(".step-visual"),
          { x: direction * 100, opacity: 0 },
          {
            scrollTrigger: {
              trigger: step,
              start: "top 80%",
              end: "top 20%",
              scrub: 1,
            },
            x: 0,
            opacity: 1,
          }
        );

        gsap.fromTo(
          step.querySelector(".step-text"),
          { x: direction * -50, opacity: 0 },
          {
            scrollTrigger: {
              trigger: step,
              start: "top 80%",
              end: "top 20%",
              scrub: 1,
            },
            x: 0,
            opacity: 1,
          }
        );
      });

      // Navbar scroll effect
      const nav = document.querySelector("nav");
      // Use GSAP for navbar
      ScrollTrigger.create({
        start: "top -50",
        end: 99999,
        toggleClass: { className: "scrolled", targets: nav },
      });

        // Smooth scroll for anchors with offset for fixed nav
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
          anchor.addEventListener("click", function (e) {
            const href = this.getAttribute("href");
            if (href === "#" || href === "") return; // Skip empty anchors
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              // Calculate offset for fixed navbar (approximately 130px: nav height + spacing)
              const offset = 130;
              const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
              
              // Use Lenis smooth scroll
              lenisInstance.scrollTo(targetPosition, {
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              });
            }
          });
        });

      // --- EXISTING FUNCTIONALITY PRESERVED BELOW ---

      // Slider functionality
      const slider = document.getElementById("themeSlider");
      const leftBtn = document.getElementById("slideLeft");
      const rightBtn = document.getElementById("slideRight");

      if (slider && leftBtn && rightBtn) {
        leftBtn.addEventListener("click", () => {
          slider.scrollBy({ left: -370, behavior: "smooth" });
        });

        rightBtn.addEventListener("click", () => {
          slider.scrollBy({ left: 370, behavior: "smooth" });
        });

        // Drag functionality
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener("mousedown", (e) => {
          isDown = true;
          slider.classList.add("active");
          startX = e.pageX - slider.offsetLeft;
          scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener("mouseleave", () => {
          isDown = false;
          slider.classList.remove("active");
        });

        slider.addEventListener("mouseup", () => {
          isDown = false;
          slider.classList.remove("active");
        });

        slider.addEventListener("mousemove", (e) => {
          if (!isDown) return;
          e.preventDefault();
          const x = e.pageX - slider.offsetLeft;
          const walk = (x - startX) * 2; // scroll-fast
          slider.scrollLeft = scrollLeft - walk;
        });
      }

      /* --- NEW ENHANCEMENTS --- */

      // 1. Live Theming Controller
      const themes = {
        default: { p: "#38bdf8", s: "#818cf8" },
        sunset: { p: "#f59e0b", s: "#ef4444" },
        forest: { p: "#10b981", s: "#34d399" },
        cyber: { p: "#d946ef", s: "#8b5cf6" },
      };

      const themeController = document.createElement("div");
      themeController.className = "theme-controller glass";
      themeController.innerHTML = `
          <div class="color-btn" style="background: linear-gradient(135deg, #38bdf8, #818cf8)" data-theme="default" title="Ocean"></div>
          <div class="color-btn" style="background: linear-gradient(135deg, #f59e0b, #ef4444)" data-theme="sunset" title="Sunset"></div>
          <div class="color-btn" style="background: linear-gradient(135deg, #10b981, #34d399)" data-theme="forest" title="Forest"></div>
           <div class="color-btn" style="background: linear-gradient(135deg, #d946ef, #8b5cf6)" data-theme="cyber" title="Cyberpunk"></div>
      `;
      document.body.appendChild(themeController);

      document.querySelectorAll(".color-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const theme = themes[btn.dataset.theme];
          document.documentElement.style.setProperty("--primary-accent", theme.p);
          document.documentElement.style.setProperty("--secondary-accent", theme.s);

          // Update blob colors too
          document.querySelector(".blob-1").style.background = theme.p;
          document.querySelector(".blob-2").style.background = theme.s;
        });
      });

      // 2. 3D Tilt Effect
      const tiltCards = document.querySelectorAll(".glass-card, .theme-card");

      tiltCards.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -5; // Max 5 deg rotation
          const rotateY = ((x - centerX) / centerX) * 5;

          card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        card.addEventListener("mouseleave", () => {
          card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
        });
      });

      // 3. Magnetic Buttons
      const buttons = document.querySelectorAll(".cta-button");

      buttons.forEach((btn) => {
        btn.classList.add("magnetic-btn"); // Ensure class is present

        btn.addEventListener("mousemove", (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          // Move button slightly towards mouse
          const moveX = (x - centerX) * 0.3;
          const moveY = (y - centerY) * 0.3;

          btn.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.05)`;
        });

        btn.addEventListener("mouseleave", () => {
          btn.style.transform = "translate(0, 0) scale(1)";
        });
      });
        // 4. FAQ Accordion
        document.querySelectorAll(".faq-item").forEach((item) => {
          item.addEventListener("click", () => {
            // Close others
            document.querySelectorAll(".faq-item").forEach((other) => {
              if (other !== item) other.classList.remove("active");
            });
            item.classList.toggle("active");

            // Toggle icon
            const toggle = item.querySelector(".faq-toggle");
            toggle.textContent = item.classList.contains("active") ? "×" : "+";
            toggle.style.transform = item.classList.contains("active")
              ? "rotate(180deg)"
              : "rotate(0)";
          });
        });

        // 5. Vertical Timeline Sidebar
        initTimelineSidebar();
      }

      // Timeline Sidebar Functionality
      function initTimelineSidebar() {
        const sidebar = document.getElementById("timelineSidebar");
        const progressFill = document.getElementById("timelineProgress");
        const dragIndicator = document.getElementById("timelineDragIndicator");
        const timelineItems = document.querySelectorAll(".timeline-item");
        
        console.log('Timeline sidebar elements:', {
          sidebar: !!sidebar,
          progressFill: !!progressFill,
          dragIndicator: !!dragIndicator,
          timelineItems: timelineItems.length
        });
        
        if (!sidebar || !progressFill || timelineItems.length === 0) {
          console.warn("Timeline sidebar elements not found");
          return;
        }
        
        if (!dragIndicator) {
          console.warn("Drag indicator not found!");
        }

        // Get all sections that correspond to timeline items and sort by data-order
        const sections = [];
        const itemsArray = Array.from(timelineItems);
        
        // Sort items by their data-order attribute
        itemsArray.sort((a, b) => {
          const orderA = parseInt(a.getAttribute("data-order")) || 0;
          const orderB = parseInt(b.getAttribute("data-order")) || 0;
          return orderA - orderB;
        });

        itemsArray.forEach((item) => {
          const sectionId = item.getAttribute("data-section");
          const order = parseInt(item.getAttribute("data-order")) || 0;
          const section = document.getElementById(sectionId);
          if (section) {
            sections.push({ 
              element: section, 
              item: item, 
              id: sectionId,
              order: order 
            });
          }
        });

        // Show sidebar after scrolling down a bit
        function updateSidebarVisibility() {
          if (window.pageYOffset > 200) {
            sidebar.classList.add("visible");
          } else {
            sidebar.classList.remove("visible");
          }
        }

        // Update active section and progress
        function updateTimeline() {
          const scrollPosition = window.pageYOffset;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;

          // Calculate overall progress (0-100%)
          const progress = (scrollPosition / (documentHeight - windowHeight)) * 100;
          progressFill.style.height = Math.min(progress, 100) + "%";

          // Update drag indicator position based on progress
          if (dragIndicator) {
            const progressBarRect = dragIndicator.parentElement.getBoundingClientRect();
            const progressBarHeight = progressBarRect.height;
            const indicatorTop = (progress / 100) * progressBarHeight;
            dragIndicator.style.top = indicatorTop + 'px';
          }

          // Find the current active section based on scroll position
          let activeSection = null;
          let minDistance = Infinity;
          
          sections.forEach((section) => {
            const rect = section.element.getBoundingClientRect();
            const sectionTop = rect.top;
            const sectionMiddle = sectionTop + (rect.height / 2);
            const viewportMiddle = windowHeight / 2;
            
            // Calculate distance from viewport middle
            const distance = Math.abs(sectionMiddle - viewportMiddle);
            
            // Find the section closest to viewport middle
            if (distance < minDistance && sectionTop < windowHeight && rect.bottom > 0) {
              minDistance = distance;
              activeSection = section;
            }
          });

          // Update active state with animation
          timelineItems.forEach((item) => {
            item.classList.remove("active");
          });

          if (activeSection) {
            activeSection.item.classList.add("active");
          }

          updateSidebarVisibility();
        }

        // Click handler for timeline items - using dots directly
        timelineItems.forEach((item) => {
          const dot = item.querySelector('.timeline-dot');
          if (dot) {
            dot.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              
              console.log('Timeline item clicked:', item.getAttribute('data-section'));
              
              const sectionId = item.getAttribute("data-section");
              const target = document.getElementById(sectionId);
              
              if (target) {
                console.log('Scrolling to section:', sectionId);
                
                // Add click animation
                gsap.to(dot, {
                  scale: 1.4,
                  duration: 0.2,
                  ease: "back.out(2)",
                  onComplete: () => {
                    gsap.to(dot, { scale: 1, duration: 0.2 });
                  }
                });
                
                const offset = 130; // Nav bar height
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                
                if (lenisInstance) {
                  lenisInstance.scrollTo(targetPosition, {
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                  });
                } else {
                  // Fallback to native scroll if Lenis not available
                  window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                  });
                }
              } else {
                console.warn('Target section not found:', sectionId);
              }
            });
          }
        });

        // Drag functionality for the indicator
        if (dragIndicator) {
          console.log('Drag indicator found, initializing drag functionality');
          console.log('Drag indicator element:', dragIndicator);
          console.log('Drag indicator styles:', window.getComputedStyle(dragIndicator));
          
          let isDragging = false;
          let animationFrameId = null;
          
          // Test if element is visible and clickable
          dragIndicator.addEventListener('mouseenter', () => {
            console.log('Mouse entered drag indicator');
            dragIndicator.style.transform = 'translateX(-50%) scale(1.2)';
          });
          
          dragIndicator.addEventListener('mouseleave', () => {
            console.log('Mouse left drag indicator');
            dragIndicator.style.transform = 'translateX(-50%) scale(1)';
          });
          
          dragIndicator.addEventListener('click', (e) => {
            console.log('Drag indicator CLICKED!', e);
            e.preventDefault();
            e.stopPropagation();
          });
          
          function onDragStart(e) {
            console.log('Drag started, event:', e.type);
            isDragging = true;
            dragIndicator.classList.add('dragging');
            
            // Prevent text selection and default behavior
            e.preventDefault();
            e.stopPropagation();
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'grabbing';
          }
          
          function onDragMove(e) {
            if (!isDragging) return;
            
            // Use requestAnimationFrame for smooth updates
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
            
            animationFrameId = requestAnimationFrame(() => {
              const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
              const progressBar = dragIndicator.parentElement;
              const progressBarRect = progressBar.getBoundingClientRect();
              
              // Calculate position relative to progress bar
              let relativeY = clientY - progressBarRect.top;
              relativeY = Math.max(0, Math.min(relativeY, progressBarRect.height));
              
              // Calculate percentage
              const percentage = (relativeY / progressBarRect.height) * 100;
              
              // Calculate scroll position
              const documentHeight = document.documentElement.scrollHeight;
              const windowHeight = window.innerHeight;
              const maxScroll = documentHeight - windowHeight;
              const targetScroll = (percentage / 100) * maxScroll;
              
              console.log('Dragging to:', percentage.toFixed(1) + '%', 'scroll:', targetScroll.toFixed(0));
              
              // Update indicator position immediately for responsive feel
              dragIndicator.style.top = relativeY + 'px';
              
              // Scroll to position - use window.scrollTo for immediate response during drag
              window.scrollTo({
                top: targetScroll,
                behavior: 'auto' // instant during drag
              });
              
              // Update Lenis scroll position
              if (lenisInstance) {
                lenisInstance.scrollTo(targetScroll, { immediate: true });
              }
            });
          }
          
          function onDragEnd() {
            if (!isDragging) return;
            console.log('Drag ended');
            isDragging = false;
            dragIndicator.classList.remove('dragging');
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            
            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
            }
          }
          
          // Make sure indicator is visible and has proper styling
          dragIndicator.style.cursor = 'grab';
          dragIndicator.style.pointerEvents = 'all';
          
          // Also attach events to the drag handle inside
          const dragHandle = dragIndicator.querySelector('.drag-handle');
          if (dragHandle) {
            console.log('Drag handle found:', dragHandle);
            dragHandle.style.cursor = 'grab';
            dragHandle.style.pointerEvents = 'all';
            
            // Attach events to both indicator and handle
            dragHandle.addEventListener('mousedown', onDragStart, false);
            dragHandle.addEventListener('touchstart', onDragStart, { passive: false });
          }
          
          // Mouse events
          dragIndicator.addEventListener('mousedown', onDragStart, false);
          document.addEventListener('mousemove', onDragMove, false);
          document.addEventListener('mouseup', onDragEnd, false);
          
          // Touch events for mobile
          dragIndicator.addEventListener('touchstart', onDragStart, { passive: false });
          document.addEventListener('touchmove', onDragMove, { passive: false });
          document.addEventListener('touchend', onDragEnd, false);
          document.addEventListener('touchcancel', onDragEnd, false);
          
          console.log('Drag event listeners attached to indicator');
        } else {
          console.warn('Drag indicator not found!');
        }

        // Update on scroll using GSAP ScrollTrigger
        ScrollTrigger.create({
          trigger: "body",
          start: "top top",
          end: "bottom bottom",
          onUpdate: updateTimeline,
        });

        // Also update on window scroll (backup)
        window.addEventListener("scroll", updateTimeline, { passive: true });
        
        // Initial update
        updateTimeline();
      }
    });

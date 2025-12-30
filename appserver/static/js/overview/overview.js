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

        // 6. Transformation Image Enlargement
        initTransformationImageEnlargement();
      }

      // Transformation Image Enlargement Functionality
      function initTransformationImageEnlargement() {
        const transformationImages = document.querySelectorAll('.transformation-image');
        let enlargedImage = null;
        let enlargedBackdrop = null;

        transformationImages.forEach((img) => {
          const container = img.closest('.transformation-image-container');
          const hint = container?.querySelector('.image-enlarge-hint');

          // Show hint on hover
          container?.addEventListener('mouseenter', () => {
            if (!img.classList.contains('enlarged')) {
              gsap.to(hint, { opacity: 1, duration: 0.3, ease: 'power2.out' });
            }
          });

          container?.addEventListener('mouseleave', () => {
            gsap.to(hint, { opacity: 0, duration: 0.3, ease: 'power2.out' });
          });

          // Click to enlarge/reduce
          container?.addEventListener('click', (e) => {
            e.stopPropagation();

            if (img.classList.contains('enlarged')) {
              // Close enlargement
              closeEnlargement(img, container);
            } else {
              // Close any other enlarged image first
              if (enlargedImage && enlargedImage !== img) {
                const otherContainer = document.querySelector('.transformation-image-container');
                if (otherContainer) {
                  closeEnlargement(enlargedImage, otherContainer);
                }
              }
              // Enlarge this image
              enlargeImage(img, container);
            }
          });
          
          // Also allow clicking directly on the enlarged image to close
          img.addEventListener('click', (e) => {
            if (img.classList.contains('enlarged')) {
              e.stopPropagation();
              console.log('[Image Close] Image clicked to close');
              closeEnlargement(img, container);
            }
          });
        });

        // Close on backdrop click or anywhere on page (except the image itself)
        function handleDocumentClick(e) {
          if (enlargedImage && enlargedBackdrop) {
            console.log('[Image Close] Document click detected', e.target);
            
            // Close if clicking on backdrop
            if (e.target === enlargedBackdrop) {
              console.log('[Image Close] Backdrop clicked');
              e.preventDefault();
              e.stopPropagation();
              const container = document.querySelector('.transformation-image-container');
              closeEnlargement(enlargedImage, container);
              return;
            }
            
            // Close if clicking anywhere except the enlarged image itself
            // Check if click is on the image or inside the image
            const isClickOnImage = e.target === enlargedImage || 
                                   enlargedImage.contains(e.target) ||
                                   e.target.closest('.transformation-image.enlarged') === enlargedImage;
            
            if (!isClickOnImage) {
              console.log('[Image Close] Clicked outside image, closing...');
              e.preventDefault();
              e.stopPropagation();
              const container = document.querySelector('.transformation-image-container');
              closeEnlargement(enlargedImage, container);
            }
          }
        }
        
        // Use capture phase to catch clicks early
        document.addEventListener('click', handleDocumentClick, true);

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && enlargedImage) {
            console.log('[Image Close] ESC key pressed');
            const container = document.querySelector('.transformation-image-container');
            if (container) {
              closeEnlargement(enlargedImage, container);
            } else {
              closeEnlargement(enlargedImage, null);
            }
          }
        });

        function enlargeImage(img, container) {
          console.log('[Image Enlarge] Starting enlargement...', img);
          const rect = img.getBoundingClientRect();
          const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
          const scrollY = window.pageYOffset || document.documentElement.scrollTop;

          console.log('[Image Enlarge] Image rect:', rect);
          console.log('[Image Enlarge] Scroll:', scrollX, scrollY);

          // Create backdrop overlay
          enlargedBackdrop = document.createElement('div');
          enlargedBackdrop.className = 'transformation-backdrop';
          enlargedBackdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(10px);
            z-index: 9998;
            opacity: 0;
            pointer-events: auto;
          `;
          document.body.appendChild(enlargedBackdrop);
          console.log('[Image Enlarge] Backdrop created');

          // Store original position and dimensions
          img.dataset.originalViewportX = rect.left;
          img.dataset.originalViewportY = rect.top;
          img.dataset.originalScrollX = scrollX;
          img.dataset.originalScrollY = scrollY;
          img.dataset.originalWidth = rect.width;
          img.dataset.originalHeight = rect.height;
          img.dataset.originalZIndex = window.getComputedStyle(img).zIndex || '';
          img.dataset.originalPosition = window.getComputedStyle(img).position || '';

          // Calculate center position
          const scale = 1.5;
          const currentWidth = rect.width;
          const currentHeight = rect.height;
          const newWidth = currentWidth * scale;
          const newHeight = currentHeight * scale;
          const centerX = window.innerWidth / 2 - newWidth / 2;
          const centerY = window.innerHeight / 2 - newHeight / 2;

          console.log('[Image Enlarge] Target position:', centerX, centerY);
          console.log('[Image Enlarge] Target size:', newWidth, newHeight);

          // Store original container overflow
          img.dataset.originalContainerOverflow = container.style.overflow || '';
          
          // Remove overflow hidden from container to prevent clipping
          container.style.overflow = 'visible';
          
          // Store original styles before modifying
          const originalStyles = {
            position: img.style.position || '',
            zIndex: img.style.zIndex || '',
            left: img.style.left || '',
            top: img.style.top || '',
            width: img.style.width || '',
            height: img.style.height || '',
            margin: img.style.margin || '',
            transform: img.style.transform || ''
          };
          img.dataset.originalStyles = JSON.stringify(originalStyles);

          // Move image to body to avoid any parent clipping
          const placeholder = document.createElement('div');
          placeholder.style.width = currentWidth + 'px';
          placeholder.style.height = currentHeight + 'px';
          placeholder.style.visibility = 'hidden';
          placeholder.className = 'image-placeholder';
          container.insertBefore(placeholder, img);
          
          // Move image to body
          document.body.appendChild(img);

          // Apply fixed positioning and initial size
          img.style.position = 'fixed';
          img.style.zIndex = '10000';
          img.style.left = rect.left + 'px';
          img.style.top = rect.top + 'px';
          img.style.width = currentWidth + 'px';
          img.style.height = currentHeight + 'px';
          img.style.margin = '0';
          img.style.padding = '0';
          img.style.willChange = 'transform, width, height';
          img.style.objectFit = 'contain';
          img.style.display = 'block';
          img.style.visibility = 'visible';
          img.style.opacity = '1';
          img.style.transformOrigin = 'center center';
          img.style.overflow = 'visible';
          img.classList.add('enlarged');
          
          // Store placeholder reference
          img.dataset.placeholder = placeholder;

          console.log('[Image Enlarge] Image styles applied:', {
            position: img.style.position,
            zIndex: img.style.zIndex,
            left: img.style.left,
            top: img.style.top,
            width: img.style.width,
            height: img.style.height
          });

          // Set initial GSAP transform
          gsap.set(img, {
            x: 0,
            y: 0,
            scale: 1
          });

          // Animate backdrop fade in
          gsap.to(enlargedBackdrop, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out'
          });

          // Calculate transform needed to move from current position to center
          const deltaX = centerX - rect.left;
          const deltaY = centerY - rect.top;
          const scaleFactor = scale;

          console.log('[Image Enlarge] Transform delta:', deltaX, deltaY, 'scale:', scaleFactor);

          // Animate image enlargement using transforms (more reliable)
          gsap.to(img, {
            x: deltaX,
            y: deltaY,
            scale: scaleFactor,
            width: newWidth,
            height: newHeight,
            duration: 0.6,
            ease: 'power3.out',
            onStart: () => {
              console.log('[Image Enlarge] Animation started');
            },
            onUpdate: () => {
              const computed = window.getComputedStyle(img);
              console.log('[Image Enlarge] Animation updating - transform:', computed.transform, 'left:', img.style.left);
            },
            onComplete: () => {
              console.log('[Image Enlarge] Animation complete');
              img.style.borderRadius = '12px';
              img.style.boxShadow = '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(56, 189, 248, 0.3)';
              const computed = window.getComputedStyle(img);
              console.log('[Image Enlarge] Final image state:', {
                position: img.style.position,
                left: img.style.left,
                top: img.style.top,
                width: img.style.width,
                height: img.style.height,
                zIndex: img.style.zIndex,
                transform: computed.transform,
                display: computed.display,
                visibility: computed.visibility,
                opacity: computed.opacity
              });
            }
          });

          // Hide hint
          const hint = container.querySelector('.image-enlarge-hint');
          if (hint) {
            gsap.to(hint, { opacity: 0, duration: 0.2 });
          }

          enlargedImage = img;
        }

        function closeEnlargement(img, container) {
          if (!img) {
            console.log('[Image Close] No image provided');
            return;
          }
          
          // Find container if not provided or if it's not the right one
          if (!container || !container.classList.contains('transformation-image-container')) {
            // Try to find the original container by looking for placeholder
            const placeholder = document.querySelector('.image-placeholder');
            if (placeholder && placeholder.parentNode) {
              container = placeholder.parentNode;
            } else {
              // Fallback: find any transformation container
              container = document.querySelector('.transformation-image-container');
            }
          }
          
          if (!container) {
            console.warn('[Image Close] Container not found, will append to body');
            container = document.body;
          }
          
          console.log('[Image Close] Closing enlargement...', img, container);

          // Get stored original position and dimensions
          const originalViewportX = parseFloat(img.dataset.originalViewportX) || 0;
          const originalViewportY = parseFloat(img.dataset.originalViewportY) || 0;
          const originalWidth = parseFloat(img.dataset.originalWidth) || img.getBoundingClientRect().width / 1.5;
          const originalHeight = parseFloat(img.dataset.originalHeight) || img.getBoundingClientRect().height / 1.5;
          
          // Calculate where the container currently is (accounting for scroll changes)
          const currentScrollX = window.pageXOffset || document.documentElement.scrollLeft;
          const currentScrollY = window.pageXOffset || document.documentElement.scrollTop;
          const originalScrollX = parseFloat(img.dataset.originalScrollX) || currentScrollX;
          const originalScrollY = parseFloat(img.dataset.originalScrollY) || currentScrollY;
          
          // Adjust for scroll offset change
          const scrollDeltaX = currentScrollX - originalScrollX;
          const scrollDeltaY = currentScrollY - originalScrollY;
          const originalX = originalViewportX + scrollDeltaX;
          const originalY = originalViewportY + scrollDeltaY;

          // Animate backdrop fade out
          gsap.to(enlargedBackdrop, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.in',
            onComplete: () => {
              if (enlargedBackdrop && enlargedBackdrop.parentNode) {
                enlargedBackdrop.parentNode.removeChild(enlargedBackdrop);
              }
              enlargedBackdrop = null;
            }
          });

          // Calculate transform to return to original position
          const currentRect = img.getBoundingClientRect();
          const returnDeltaX = originalX - currentRect.left;
          const returnDeltaY = originalY - currentRect.top;

          // Animate image back to original position
          gsap.to(img, {
            x: returnDeltaX,
            y: returnDeltaY,
            scale: 1,
            width: originalWidth,
            height: originalHeight,
            duration: 0.6,
            ease: 'power3.out', // Matching parallax easing
            onComplete: () => {
              console.log('[Image Close] Animation complete, restoring image...');
              
              // Move image back to container - find placeholder by class
              const placeholder = document.querySelector('.image-placeholder');
              if (placeholder && placeholder.parentNode) {
                console.log('[Image Close] Replacing placeholder with image');
                placeholder.parentNode.replaceChild(img, placeholder);
              } else if (container && container.classList.contains('transformation-image-container')) {
                console.log('[Image Close] Appending image to container');
                container.appendChild(img);
              } else {
                // Find any transformation container
                const fallbackContainer = document.querySelector('.transformation-image-container');
                if (fallbackContainer) {
                  console.log('[Image Close] Using fallback container');
                  fallbackContainer.appendChild(img);
                }
              }
              
              // Reset container overflow
              if (container && img.dataset.originalContainerOverflow !== undefined) {
                container.style.overflow = img.dataset.originalContainerOverflow || '';
              }
              
              // Reset styles
              img.style.position = img.dataset.originalPosition || '';
              img.style.zIndex = img.dataset.originalZIndex || '';
              img.style.left = '';
              img.style.top = '';
              img.style.width = '';
              img.style.height = '';
              img.style.margin = '';
              img.style.boxShadow = '';
              img.style.borderRadius = '';
              img.style.willChange = '';
              img.style.transformOrigin = '';
              img.style.overflow = '';
              img.style.objectFit = '';
              gsap.set(img, { clearProps: 'all' }); // Clear GSAP transforms
              img.classList.remove('enlarged');

              if (container) {
                container.style.zIndex = '';
                container.style.position = '';
              }

              // Clean up data attributes
              delete img.dataset.originalViewportX;
              delete img.dataset.originalViewportY;
              delete img.dataset.originalScrollX;
              delete img.dataset.originalScrollY;
              delete img.dataset.originalWidth;
              delete img.dataset.originalHeight;
              delete img.dataset.originalZIndex;
              delete img.dataset.originalPosition;
              delete img.dataset.originalContainerOverflow;
              delete img.dataset.placeholder;

              enlargedImage = null;
              console.log('[Image Close] Cleanup complete');
            }
          });
        }
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

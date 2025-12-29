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
      const lenis = new Lenis({
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
        lenis.raf(time);
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

      // Smooth scroll for anchors (Handled by Lenis automatically if configured only for #internal links handled manually)
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute("href"));
          lenis.scrollTo(target);
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
    }
});

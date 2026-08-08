(function () {
  "use strict";

  const SELECTORS = {
    hero: "[data-vpn-hero]",
    heroEyebrow: "[data-vpn-hero-eyebrow]",
    heroTitle: "[data-vpn-hero-title]",
    heroText: "[data-vpn-hero-text]",
    heroActions: "[data-vpn-hero-actions]",
    heroMeta: "[data-vpn-hero-meta]",
    heroGlobe: "[data-vpn-hero-globe]",
    heroGlobeChip: "[data-vpn-hero-globe-chip]",
    heroParticle: "[data-vpn-hero-particle]",
    globeFrame: ".vpn-hero__globe-frame",
    globeDraw: "[data-vpn-globe-draw]",

    marquee: "[data-vpn-marquee]",
    marqueeTrack: "[data-vpn-marquee-track]",
    marqueeGroup: "[data-vpn-marquee-group]",

    reviewsSection: "[data-vpn-reviews]",
    reviewsSwiper: ".vpn-home-reviews-swiper",
    reviewsPrev: "[data-vpn-reviews-prev]",
    reviewsNext: "[data-vpn-reviews-next]",
    reviewsPagination: "[data-vpn-reviews-pagination]",

    pricingSection: "[data-vpn-home-pricing]",
    pricingGrid: "[data-vpn-home-pricing-grid]",
    pricingPagination: "[data-vpn-home-pricing-pagination]",

    cardScanner: "[data-vpn-card-scanner]",
    cardParticles: "[data-vpn-card-particles]",
    cardScannerCanvas: "[data-vpn-card-scanner-canvas]",
    cardWords: "[data-vpn-card-words]",
    cardLine: "[data-vpn-card-line]",
    cardAsciiCode: ".vpn-scan-card__ascii-code",
    scanCard: ".vpn-scan-card",

    parallax: "[data-vpn-parallax]"
  };

  const STATE = {
    initialised: false,
    heroTimeline: null,
    heroFloatTweens: [],
    marqueeTween: null,
    marqueeResizeObserver: null,
    reviewsSwiper: null,
    pricingSwiper: null,
    pricingWrapper: null,
    pricingMediaQuery: null,
    cardScanner: null,
    parallaxTweens: []
  };

  const REDUCED_MOTION_QUERY =
    "(prefers-reduced-motion: reduce)";

  const MOBILE_PRICING_QUERY =
    "(max-width: 600px)";

  function prefersReducedMotion() {
    return window.matchMedia(
      REDUCED_MOTION_QUERY
    ).matches;
  }

  function getGSAP() {
    return window.gsap || null;
  }

  function getScrollTrigger() {
    return window.ScrollTrigger || null;
  }

  function getSwiper() {
    return window.Swiper || null;
  }

  function registerScrollTrigger() {
    const gsap = getGSAP();
    const ScrollTrigger =
      getScrollTrigger();

    if (
      !gsap ||
      !ScrollTrigger ||
      typeof gsap.registerPlugin !==
        "function"
    ) {
      return false;
    }

    gsap.registerPlugin(ScrollTrigger);

    return true;
  }

  

  function splitHeroTitle(title) {
    if (
      !title ||
      title.dataset.vpnSplit === "true"
    ) {
      return title
        ? Array.from(
            title.querySelectorAll(
              ".vpn-hero__title-word"
            )
          )
        : [];
    }

    const originalText =
      title.textContent
        .replace(/\s+/g, " ")
        .trim();

    if (!originalText) {
      return [];
    }

    title.dataset.vpnSplit = "true";

    title.setAttribute(
      "aria-label",
      originalText
    );

    title.textContent = "";

    const line =
      document.createElement("span");

    line.className =
      "vpn-hero__title-line";

    line.setAttribute(
      "aria-hidden",
      "true"
    );

    const words =
      originalText.split(" ");

    words.forEach(
      (word, index) => {
        const wordElement =
          document.createElement("span");

        wordElement.className =
          "vpn-hero__title-word";

        wordElement.textContent = word;

        line.appendChild(
          wordElement
        );

        if (
          index <
          words.length - 1
        ) {
          line.appendChild(
            document.createTextNode(" ")
          );
        }
      }
    );

    title.appendChild(line);

    return Array.from(
      title.querySelectorAll(
        ".vpn-hero__title-word"
      )
    );
  }

  

  function getDrawableElements(hero) {
    if (!hero) {
      return [];
    }

    const explicitElements =
      Array.from(
        hero.querySelectorAll(
          SELECTORS.globeDraw
        )
      );

    if (explicitElements.length) {
      return explicitElements;
    }

    const globeFrame =
      hero.querySelector(
        SELECTORS.globeFrame
      );

    if (!globeFrame) {
      return [];
    }

    return Array.from(
      globeFrame.querySelectorAll(
        "path, circle, ellipse, line"
      )
    );
  }

  function prepareDrawableElement(
    element
  ) {
    if (
      !element ||
      typeof element.getTotalLength !==
        "function"
    ) {
      return false;
    }

    let length = 0;

    try {
      length =
        element.getTotalLength();
    } catch (error) {
      return false;
    }

    if (
      !Number.isFinite(length) ||
      length <= 0
    ) {
      return false;
    }

    element.style.strokeDasharray =
      `${length}`;

    element.style.strokeDashoffset =
      `${length}`;

    return true;
  }

  function resetDrawableElements(
    elements
  ) {
    elements.forEach((element) => {
      element.style.strokeDasharray =
        "";

      element.style.strokeDashoffset =
        "";
    });
  }

  

  function clearHeroFloatTweens() {
    STATE.heroFloatTweens.forEach(
      (tween) => {
        if (
          tween &&
          typeof tween.kill ===
            "function"
        ) {
          tween.kill();
        }
      }
    );

    STATE.heroFloatTweens = [];
  }

  function initHeroParticles(hero) {
    const gsap = getGSAP();

    clearHeroFloatTweens();

    if (
      !hero ||
      !gsap ||
      prefersReducedMotion()
    ) {
      return;
    }

    const particles =
      Array.from(
        hero.querySelectorAll(
          SELECTORS.heroParticle
        )
      );

    particles.forEach(
      (particle, index) => {
        const direction =
          index % 2 === 0
            ? 1
            : -1;

        const horizontal =
          3 + (index % 3) * 2;

        const vertical =
          5 + (index % 4) * 2;

        const tween = gsap.to(
          particle,
          {
            x:
              horizontal *
              direction,
            y:
              vertical *
              -direction,
            duration:
              2.8 +
              index * 0.24,
            delay:
              index * 0.12,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true
          }
        );

        STATE.heroFloatTweens.push(
          tween
        );
      }
    );
  }

  

  function initHeroAnimation() {
    const hero =
      document.querySelector(
        SELECTORS.hero
      );

    if (!hero) {
      return;
    }

    const title =
      hero.querySelector(
        SELECTORS.heroTitle
      );

    const words =
      splitHeroTitle(title);

    const eyebrow =
      hero.querySelector(
        SELECTORS.heroEyebrow
      );

    const text =
      hero.querySelector(
        SELECTORS.heroText
      );

    const actions =
      hero.querySelector(
        SELECTORS.heroActions
      );

    const meta =
      hero.querySelector(
        SELECTORS.heroMeta
      );

    const globe =
      hero.querySelector(
        SELECTORS.heroGlobe
      );

    const globeChips =
      Array.from(
        hero.querySelectorAll(
          SELECTORS.heroGlobeChip
        )
      );

    const drawableElements =
      getDrawableElements(hero);

    if (prefersReducedMotion()) {
      resetDrawableElements(
        drawableElements
      );

      initHeroParticles(null);

      return;
    }

    const gsap = getGSAP();

    if (!gsap) {
      resetDrawableElements(
        drawableElements
      );

      return;
    }

    if (
      STATE.heroTimeline &&
      typeof STATE.heroTimeline.kill ===
        "function"
    ) {
      STATE.heroTimeline.kill();
    }

    const preparedDrawables =
      drawableElements.filter(
        prepareDrawableElement
      );

    if (eyebrow) {
      gsap.set(eyebrow, {
        opacity: 0,
        y: 12
      });
    }

    if (words.length) {
      gsap.set(words, {
        opacity: 0,
        yPercent: 120
      });
    }

    if (text) {
      gsap.set(text, {
        opacity: 0,
        y: 18
      });
    }

    if (actions) {
      gsap.set(actions, {
        opacity: 0,
        y: 20
      });
    }

    if (meta) {
      gsap.set(meta, {
        opacity: 0,
        y: 15
      });
    }

    if (globe) {
      gsap.set(globe, {
        opacity: 0,
        scale: 0.94,
        rotate: -1.5,
        transformOrigin:
          "50% 50%"
      });
    }

    if (globeChips.length) {
      gsap.set(
        globeChips,
        {
          opacity: 0,
          y: 13
        }
      );
    }

    const timeline =
      gsap.timeline({
        defaults: {
          ease:
            "power3.out"
        }
      });

    STATE.heroTimeline =
      timeline;

    if (eyebrow) {
      timeline.to(
        eyebrow,
        {
          opacity: 1,
          y: 0,
          duration: 0.55
        },
        0.08
      );
    }

    if (words.length) {
      timeline.to(
        words,
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.85,
          stagger: 0.055
        },
        0.17
      );
    }

    if (text) {
      timeline.to(
        text,
        {
          opacity: 1,
          y: 0,
          duration: 0.68
        },
        0.53
      );
    }

    if (actions) {
      timeline.to(
        actions,
        {
          opacity: 1,
          y: 0,
          duration: 0.62
        },
        0.65
      );
    }

    if (meta) {
      timeline.to(
        meta,
        {
          opacity: 1,
          y: 0,
          duration: 0.58
        },
        0.78
      );
    }

    if (globe) {
      timeline.to(
        globe,
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 1.05
        },
        0.22
      );
    }

    if (
      preparedDrawables.length
    ) {
      timeline.to(
        preparedDrawables,
        {
          strokeDashoffset: 0,
          duration: 1.45,
          stagger: 0.055,
          ease:
            "power2.inOut"
        },
        0.36
      );
    }

    if (globeChips.length) {
      timeline.to(
        globeChips,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.12
        },
        0.76
      );
    }

    timeline.call(
      () => {
        initHeroParticles(hero);
      },
      null,
      1.05
    );
  }

  

  function killMarqueeTween() {
    if (
      STATE.marqueeTween &&
      typeof STATE.marqueeTween.kill ===
        "function"
    ) {
      STATE.marqueeTween.kill();
    }

    STATE.marqueeTween = null;
  }

  function ensureMarqueeClone(
    track,
    sourceGroup
  ) {
    if (!track || !sourceGroup) {
      return null;
    }

    const existingClone =
      track.querySelector(
        "[data-vpn-marquee-clone]"
      );

    if (existingClone) {
      return existingClone;
    }

    const clone =
      sourceGroup.cloneNode(true);

    clone.setAttribute(
      "data-vpn-marquee-clone",
      ""
    );

    clone.setAttribute(
      "aria-hidden",
      "true"
    );

    clone.removeAttribute(
      "data-vpn-marquee-group"
    );

    track.appendChild(clone);

    return clone;
  }

  function createMarqueeTween(
    root,
    track,
    sourceGroup
  ) {
    killMarqueeTween();

    if (
      prefersReducedMotion()
    ) {
      return;
    }

    const gsap = getGSAP();

    if (
      !gsap ||
      !root ||
      !track ||
      !sourceGroup
    ) {
      return;
    }

    const distance =
      sourceGroup.getBoundingClientRect()
        .width;

    if (
      !Number.isFinite(distance) ||
      distance <= 0
    ) {
      return;
    }

    const pixelsPerSecond = 88;

    const duration = Math.max(
      10,
      distance /
        pixelsPerSecond
    );

    gsap.set(track, {
      x: 0
    });

    STATE.marqueeTween =
      gsap.to(track, {
        x: -distance,
        duration,
        repeat: -1,
        ease: "none"
      });

    function pauseMarquee() {
      STATE.marqueeTween?.pause();
    }

    function resumeMarquee() {
      STATE.marqueeTween?.resume();
    }

    if (
      root.dataset
        .vpnHoverBound !== "true"
    ) {
      root.dataset.vpnHoverBound =
        "true";

      root.addEventListener(
        "pointerenter",
        pauseMarquee
      );

      root.addEventListener(
        "pointerleave",
        resumeMarquee
      );

      root.addEventListener(
        "focusin",
        pauseMarquee
      );

      root.addEventListener(
        "focusout",
        () => {
          window.requestAnimationFrame(
            () => {
              if (
                !root.contains(
                  document.activeElement
                )
              ) {
                resumeMarquee();
              }
            }
          );
        }
      );
    }
  }

  function initMarquee() {
    const root =
      document.querySelector(
        SELECTORS.marquee
      );

    if (!root) {
      return;
    }

    const track =
      root.querySelector(
        SELECTORS.marqueeTrack
      );

    const sourceGroup =
      root.querySelector(
        SELECTORS.marqueeGroup
      );

    if (
      !track ||
      !sourceGroup
    ) {
      return;
    }

    ensureMarqueeClone(
      track,
      sourceGroup
    );

    function rebuild() {
      createMarqueeTween(
        root,
        track,
        sourceGroup
      );
    }

    rebuild();

    if (
      document.fonts &&
      document.fonts.ready
    ) {
      document.fonts.ready.then(
        rebuild
      );
    }

    if (
      "ResizeObserver" in window
    ) {
      if (
        STATE.marqueeResizeObserver
      ) {
        STATE.marqueeResizeObserver.disconnect();
      }

      let resizeFrame = null;

      STATE.marqueeResizeObserver =
        new ResizeObserver(() => {
          if (resizeFrame) {
            window.cancelAnimationFrame(
              resizeFrame
            );
          }

          resizeFrame =
            window.requestAnimationFrame(
              rebuild
            );
        });

      STATE.marqueeResizeObserver.observe(
        sourceGroup
      );
    } else {
      let resizeTimer = null;

      window.addEventListener(
        "resize",
        () => {
          window.clearTimeout(
            resizeTimer
          );

          resizeTimer =
            window.setTimeout(
              rebuild,
              180
            );
        },
        {
          passive: true
        }
      );
    }
  }

  

  function initReviewsSwiper() {
    const Swiper = getSwiper();

    const swiperElement =
      document.querySelector(
        SELECTORS.reviewsSwiper
      );

    if (
      !Swiper ||
      !swiperElement ||
      STATE.reviewsSwiper
    ) {
      return;
    }

    const section =
      swiperElement.closest(
        SELECTORS.reviewsSection
      ) ||
      document;

    const previousButton =
      section.querySelector(
        SELECTORS.reviewsPrev
      );

    const nextButton =
      section.querySelector(
        SELECTORS.reviewsNext
      );

    const pagination =
      section.querySelector(
        SELECTORS.reviewsPagination
      );

    const options = {
      slidesPerView: 1,
      spaceBetween: 16,
      speed: 650,
      watchOverflow: true,
      grabCursor: true,
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      a11y: {
        enabled: true,
        prevSlideMessage:
          "Previous review",
        nextSlideMessage:
          "Next review",
        firstSlideMessage:
          "This is the first review",
        lastSlideMessage:
          "This is the last review"
      },
      breakpoints: {
        760: {
          slidesPerView: 2,
          spaceBetween: 18
        }
      }
    };

    if (
      previousButton &&
      nextButton
    ) {
      options.navigation = {
        prevEl: previousButton,
        nextEl: nextButton
      };
    }

    if (pagination) {
      options.pagination = {
        el: pagination,
        clickable: true
      };
    }

    STATE.reviewsSwiper =
      new Swiper(
        swiperElement,
        options
      );
  }

  

  function getPricingCards(grid) {
    if (!grid) {
      return [];
    }

    return Array.from(
      grid.children
    ).filter((element) => {
      return element.classList.contains(
        "vpn-home-price-card"
      );
    });
  }

  function createPricingWrapper(
    grid
  ) {
    const cards =
      getPricingCards(grid);

    if (!cards.length) {
      return null;
    }

    const wrapper =
      document.createElement("div");

    wrapper.className =
      "swiper-wrapper";

    cards.forEach((card) => {
      card.classList.add(
        "swiper-slide"
      );

      wrapper.appendChild(card);
    });

    grid.appendChild(wrapper);

    return wrapper;
  }

  function cleanPricingSlide(
    slide
  ) {
    slide.classList.remove(
      "swiper-slide",
      "swiper-slide-active",
      "swiper-slide-next",
      "swiper-slide-prev",
      "swiper-slide-visible",
      "swiper-slide-fully-visible"
    );

    slide.removeAttribute(
      "aria-label"
    );

    slide.removeAttribute(
      "role"
    );

    slide.style.removeProperty(
      "width"
    );

    slide.style.removeProperty(
      "margin-right"
    );

    slide.style.removeProperty(
      "transform"
    );

    slide.style.removeProperty(
      "height"
    );
  }

  function enablePricingSwiper() {
    const grid =
      document.querySelector(
        SELECTORS.pricingGrid
      );

    const Swiper = getSwiper();

    if (
      !grid ||
      !Swiper ||
      STATE.pricingSwiper
    ) {
      return;
    }

    const wrapper =
      createPricingWrapper(
        grid
      );

    if (!wrapper) {
      return;
    }

    STATE.pricingWrapper =
      wrapper;

    grid.classList.add(
      "swiper",
      "vpn-home-pricing-swiper"
    );

    const section =
      grid.closest(
        SELECTORS.pricingSection
      ) ||
      document;

    const pagination =
      section.querySelector(
        SELECTORS.pricingPagination
      );

    const options = {
      slidesPerView: 1,
      spaceBetween: 18,
      speed: 620,
      watchOverflow: true,
      grabCursor: true,
      autoHeight: false,
      observer: true,
      observeParents: true,
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      a11y: {
        enabled: true,
        firstSlideMessage:
          "This is the first pricing plan",
        lastSlideMessage:
          "This is the last pricing plan"
      }
    };

    if (pagination) {
      options.pagination = {
        el: pagination,
        clickable: true
      };
    }

    STATE.pricingSwiper =
      new Swiper(
        grid,
        options
      );
  }

  function disablePricingSwiper() {
    const grid =
      document.querySelector(
        SELECTORS.pricingGrid
      );

    if (!grid) {
      return;
    }

    if (
      STATE.pricingSwiper &&
      typeof STATE.pricingSwiper
        .destroy === "function"
    ) {
      STATE.pricingSwiper.destroy(
        true,
        false
      );
    }

    STATE.pricingSwiper = null;

    const wrapper =
      STATE.pricingWrapper ||
      grid.querySelector(
        ".swiper-wrapper"
      );

    if (wrapper) {
      const slides =
        Array.from(
          wrapper.children
        );

      slides.forEach((slide) => {
        cleanPricingSlide(slide);
        grid.appendChild(slide);
      });

      wrapper.remove();
    }

    STATE.pricingWrapper = null;

    grid.classList.remove(
      "swiper",
      "swiper-initialized",
      "swiper-horizontal",
      "swiper-backface-hidden",
      "vpn-home-pricing-swiper"
    );

    grid.removeAttribute(
      "style"
    );
  }

  function updatePricingSwiperMode(
    event
  ) {
    const shouldUseSwiper =
      typeof event.matches ===
      "boolean"
        ? event.matches
        : window.matchMedia(
            MOBILE_PRICING_QUERY
          ).matches;

    if (shouldUseSwiper) {
      enablePricingSwiper();
    } else {
      disablePricingSwiper();
    }
  }

  function initPricingSwiper() {
    const grid =
      document.querySelector(
        SELECTORS.pricingGrid
      );

    if (!grid) {
      return;
    }

    STATE.pricingMediaQuery =
      window.matchMedia(
        MOBILE_PRICING_QUERY
      );

    updatePricingSwiperMode(
      STATE.pricingMediaQuery
    );

    if (
      typeof STATE.pricingMediaQuery
        .addEventListener ===
      "function"
    ) {
      STATE.pricingMediaQuery.addEventListener(
        "change",
        updatePricingSwiperMode
      );
    } else if (
      typeof STATE.pricingMediaQuery
        .addListener === "function"
    ) {
      STATE.pricingMediaQuery.addListener(
        updatePricingSwiperMode
      );
    }
  }

  

  function clearParallaxTweens() {
    STATE.parallaxTweens.forEach(
      (tween) => {
        if (
          tween &&
          typeof tween.kill ===
            "function"
        ) {
          tween.kill();
        }
      }
    );

    STATE.parallaxTweens = [];
  }

  function initPhotoParallax() {
    clearParallaxTweens();

    if (
      prefersReducedMotion() ||
      window.innerWidth < 768
    ) {
      return;
    }

    const gsap = getGSAP();
    const ScrollTrigger =
      getScrollTrigger();

    if (
      !gsap ||
      !ScrollTrigger
    ) {
      return;
    }

    registerScrollTrigger();

    const images =
      Array.from(
        document.querySelectorAll(
          SELECTORS.parallax
        )
      );

    images.forEach(
      (image) => {
        if (
          image.hasAttribute(
            "data-aos"
          )
        ) {
          return;
        }

        const trigger =
          image.closest(
            ".vpn-home-parallax-frame"
          ) ||
          image.parentElement;

        if (!trigger) {
          return;
        }

        const tween =
          gsap.fromTo(
            image,
            {
              yPercent: -4
            },
            {
              yPercent: 4,
              ease: "none",
              scrollTrigger: {
                trigger,
                start:
                  "top bottom",
                end:
                  "bottom top",
                scrub: 0.75,
                invalidateOnRefresh:
                  true
              }
            }
          );

        STATE.parallaxTweens.push(
          tween
        );
      }
    );
  }

  

  function initArrowInteractions() {
    const interactiveLinks =
      document.querySelectorAll(
        [
          ".vpn-home-flow-card__link",
          ".vpn-home-tall-card__action",
          ".vpn-home-bento__assurance-link"
        ].join(",")
      );

    interactiveLinks.forEach(
      (element) => {
        if (
          element.dataset
            .vpnArrowInitialised ===
          "true"
        ) {
          return;
        }

        element.dataset
          .vpnArrowInitialised =
          "true";

        const arrow =
          element.querySelector(
            "svg"
          );

        if (
          !arrow ||
          prefersReducedMotion()
        ) {
          return;
        }

        const gsap = getGSAP();

        if (!gsap) {
          return;
        }

        element.addEventListener(
          "pointerenter",
          () => {
            gsap.to(arrow, {
              x: 4,
              duration: 0.2,
              ease:
                "power2.out"
            });
          }
        );

        element.addEventListener(
          "pointerleave",
          () => {
            gsap.to(arrow, {
              x: 0,
              duration: 0.22,
              ease:
                "power2.out"
            });
          }
        );
      }
    );
  }

  

  function buildScannerCode(columns, rows) {
    const snippets = [
      "// compiled preview • scanner demo",
      "/* generated for visual effect - not executed */",
      "const SCAN_WIDTH = 8;",
      "const FADE_ZONE = 35;",
      "const MAX_PARTICLES = 2500;",
      "function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }",
      "function lerp(a, b, t) { return a + (b - a) * t; }",
      "const now = () => performance.now();",
      "class Particle { constructor(x, y, vx, vy, r, a) { this.x = x; this.y = y; this.vx = vx; this.vy = vy; this.r = r; this.a = a; } }",
      "function drawParticle(ctx, p) { ctx.globalAlpha = clamp(p.a, 0, 1); }",
      "const scanner = { x: innerWidth / 2, width: SCAN_WIDTH, glow: 3.5 };",
      "ctx.globalCompositeOperation = 'lighter';"
    ];

    let source = snippets.join(" ");

    for (let index = 0; index < 44; index += 1) {
      source += ` const v${index} = (${index + 7} * ${index + 13}) & 0xff;`;
      source += " if (state.intensity > 1) { scanner.glow += 0.01; }";
    }

    source = source.replace(/\s+/g, " ").trim();

    const target = columns * rows;

    while (source.length < target + columns) {
      source += " " + snippets[source.length % snippets.length];
    }

    let output = "";
    let offset = 0;

    for (let row = 0; row < rows; row += 1) {
      let line = source.slice(offset, offset + columns);

      if (line.length < columns) {
        line = line + " ".repeat(columns - line.length);
      }

      output += line + (row < rows - 1 ? "\n" : "");
      offset += columns;
    }

    return output;
  }

  function populateScannerWords(layer) {
    if (!layer || layer.dataset.vpnWordsReady === "true") {
      return;
    }

    const words = [
      "privacy",
      "encrypted",
      "secure",
      "tunnel",
      "shield",
      "masked",
      "orbit",
      "routing",
      "tokenized",
      "private",
      "cipher",
      "network",
      "protected",
      "vault",
      "session",
      "access",
      "signal",
      "identity",
      "zero-log",
      "packet"
    ];
    const wordCount = 86;

    layer.dataset.vpnWordsReady = "true";
    layer.textContent = "";

    for (let index = 0; index < wordCount; index += 1) {
      const word = document.createElement("span");
      const angle =
        Math.random() * Math.PI * 2;
      const distance =
        80 + Math.random() * 260;
      const originX =
        50 + (Math.random() - 0.5) * 22;
      const originY =
        50 + (Math.random() - 0.5) * 36;
      const driftX =
        Math.cos(angle) * distance;
      const driftY =
        Math.sin(angle) * distance;
      const size =
        10 + Math.random() * 12;
      const alpha =
        0.18 + Math.random() * 0.34;
      const duration =
        11 + Math.random() * 17;
      const delay =
        -Math.random() * duration;
      const rotate =
        -10 + Math.random() * 20;
      const spin =
        -18 + Math.random() * 36;

      word.className = "vpn-home-services__word";
      word.textContent = words[index % words.length];
      word.style.setProperty(
        "--word-x",
        `${originX.toFixed(1)}%`
      );
      word.style.setProperty(
        "--word-y",
        `${originY.toFixed(1)}%`
      );
      word.style.setProperty(
        "--word-dx",
        `${driftX.toFixed(1)}px`
      );
      word.style.setProperty(
        "--word-dy",
        `${driftY.toFixed(1)}px`
      );
      word.style.setProperty(
        "--word-size",
        `${size.toFixed(1)}px`
      );
      word.style.setProperty(
        "--word-alpha",
        alpha.toFixed(2)
      );
      word.style.setProperty(
        "--word-duration",
        `${duration.toFixed(1)}s`
      );
      word.style.setProperty(
        "--word-delay",
        `${delay.toFixed(1)}s`
      );
      word.style.setProperty(
        "--word-rotate",
        `${rotate.toFixed(1)}deg`
      );
      word.style.setProperty(
        "--word-spin",
        `${spin.toFixed(1)}deg`
      );

      layer.appendChild(word);
    }
  }

  function initCardScanner() {
    const section = document.querySelector(
      SELECTORS.cardScanner
    );

    if (!section || STATE.cardScanner) {
      return;
    }

    const track = section.querySelector(
      SELECTORS.cardLine
    );
    const particleCanvas = section.querySelector(
      SELECTORS.cardParticles
    );
    const scannerCanvas = section.querySelector(
      SELECTORS.cardScannerCanvas
    );
    const wordLayer = section.querySelector(
      SELECTORS.cardWords
    );

    if (!track || !particleCanvas || !scannerCanvas) {
      return;
    }

    const reducedMotion = prefersReducedMotion();
    const originalCards = Array.from(track.children);

    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    populateScannerWords(wordLayer);

    Array.from(
      section.querySelectorAll(
        SELECTORS.cardAsciiCode
      )
    ).forEach((block) => {
      block.textContent = buildScannerCode(52, 18);
    });

    const particleContext = particleCanvas.getContext("2d");
    const scannerContext = scannerCanvas.getContext("2d");
    const particles = [];
    const particleCount = 360;
    let width = 0;
    let particleHeight = 0;
    let scannerHeight = 0;
    let position = 0;
    let velocity = -86;
    let lastTime = performance.now();
    let animationFrame = 0;
    let isDragging = false;
    let dragX = 0;
    let dragVelocity = velocity;

    function resizeCanvas(canvas, height) {
      const rect = section.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const context = canvas.getContext("2d");

      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = rect.width + "px";
      canvas.style.height = height + "px";
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticle() {
      return {
        x: width * 0.5 + (Math.random() - 0.5) * 9,
        y: Math.random() * particleHeight,
        vx: Math.random() * 1.4 + 0.25,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 2.2 + 0.7,
        life: Math.random() * 0.8 + 0.2,
        decay: Math.random() * 0.012 + 0.004,
        twinkle: Math.random() * 6.28
      };
    }

    function resetParticle(particle) {
      const nextParticle = createParticle();

      Object.keys(nextParticle).forEach((key) => {
        particle[key] = nextParticle[key];
      });
    }

    function resize() {
      const rect = section.getBoundingClientRect();
      width = rect.width;
      particleHeight = 300;
      scannerHeight = 360;

      resizeCanvas(particleCanvas, particleHeight);
      resizeCanvas(scannerCanvas, scannerHeight);

      particles.length = 0;

      for (let index = 0; index < particleCount; index += 1) {
        particles.push(createParticle());
      }

      if (!position) {
        position = width * 0.52;
      }
    }

    function drawParticles() {
      particleContext.clearRect(0, 0, width, particleHeight);
      particleContext.globalCompositeOperation = "lighter";

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= particle.decay;
        particle.twinkle += 0.08;

        if (
          particle.life <= 0 ||
          particle.x > width + 20 ||
          particle.y < -20 ||
          particle.y > particleHeight + 20
        ) {
          resetParticle(particle);
        }

        const alpha =
          Math.max(0, particle.life) *
          (0.58 + Math.sin(particle.twinkle) * 0.22);
        const gradient =
          particleContext.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size * 5
          );

        gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        gradient.addColorStop(0.28, `rgba(147, 197, 253, ${alpha * 0.8})`);
        gradient.addColorStop(1, "rgba(59, 130, 246, 0)");

        particleContext.fillStyle = gradient;
        particleContext.beginPath();
        particleContext.arc(
          particle.x,
          particle.y,
          particle.size * 5,
          0,
          Math.PI * 2
        );
        particleContext.fill();
      });

      particleContext.globalCompositeOperation = "source-over";
    }

    function drawScannerGlow(isActive) {
      const x = width * 0.5;
      const glow = isActive ? 1 : 0.72;

      scannerContext.clearRect(0, 0, width, scannerHeight);
      scannerContext.globalCompositeOperation = "lighter";

      [
        [42, 0.18, "139, 92, 246"],
        [22, 0.34, "168, 85, 247"],
        [8, 0.62, "221, 214, 254"],
        [3, 1, "255, 255, 255"]
      ].forEach(([bandWidth, alpha, color]) => {
        const gradient =
          scannerContext.createLinearGradient(
            x - bandWidth,
            0,
            x + bandWidth,
            0
          );

        gradient.addColorStop(0, `rgba(${color}, 0)`);
        gradient.addColorStop(0.5, `rgba(${color}, ${alpha * glow})`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);

        scannerContext.fillStyle = gradient;
        scannerContext.fillRect(
          x - bandWidth,
          0,
          bandWidth * 2,
          scannerHeight
        );
      });

      scannerContext.globalCompositeOperation = "destination-in";
      const mask = scannerContext.createLinearGradient(
        0,
        0,
        0,
        scannerHeight
      );
      mask.addColorStop(0, "rgba(255, 255, 255, 0)");
      mask.addColorStop(0.18, "rgba(255, 255, 255, 1)");
      mask.addColorStop(0.82, "rgba(255, 255, 255, 1)");
      mask.addColorStop(1, "rgba(255, 255, 255, 0)");
      scannerContext.fillStyle = mask;
      scannerContext.fillRect(0, 0, width, scannerHeight);
      scannerContext.globalCompositeOperation = "source-over";
    }

    function updateClipping() {
      const scannerX =
        section.getBoundingClientRect().left +
        width * 0.5;
      let active = false;

      Array.from(
        track.querySelectorAll(
          SELECTORS.scanCard
        )
      ).forEach((card) => {
        const rect = card.getBoundingClientRect();
        const normal = card.querySelector(
          ".vpn-scan-card__face--normal"
        );
        const ascii = card.querySelector(
          ".vpn-scan-card__face--ascii"
        );

        if (!normal || !ascii) {
          return;
        }

        if (rect.right < scannerX) {
          normal.style.setProperty("--scan-normal-left", "100%");
          ascii.style.setProperty("--scan-ascii-right", "100%");
          card.removeAttribute("data-scanning");
        } else if (rect.left > scannerX) {
          normal.style.setProperty("--scan-normal-left", "0%");
          ascii.style.setProperty("--scan-ascii-right", "0%");
          card.removeAttribute("data-scanning");
        } else {
          active = true;
          const progress = Math.max(
            0,
            Math.min(
              100,
              ((scannerX - rect.left) / rect.width) * 100
            )
          );

          normal.style.setProperty(
            "--scan-normal-left",
            `${progress}%`
          );
          ascii.style.setProperty(
            "--scan-ascii-right",
            `${progress}%`
          );

          if (!card.hasAttribute("data-scanning")) {
            const flash =
              document.createElement("span");
            flash.className =
              "vpn-scan-card__scan-flash";
            card.appendChild(flash);
            window.setTimeout(
              () => flash.remove(),
              650
            );
          }

          card.setAttribute("data-scanning", "true");
        }
      });

      drawScannerGlow(active);
    }

    function normalizePosition() {
      const firstSetWidth =
        track.scrollWidth / 2;

      if (position <= -firstSetWidth) {
        position += firstSetWidth;
      } else if (position > width) {
        position -= firstSetWidth;
      }
    }

    function render(currentTime) {
      const delta = Math.min(
        0.05,
        (currentTime - lastTime) / 1000
      );

      lastTime = currentTime;

      if (!reducedMotion && !isDragging) {
        position += velocity * delta;
      }

      normalizePosition();
      track.style.transform =
        `translate3d(${position}px, -50%, 0)`;

      if (!reducedMotion) {
        drawParticles();
      }

      updateClipping();
      animationFrame =
        window.requestAnimationFrame(render);
    }

    function beginDrag(event) {
      isDragging = true;
      dragX = event.clientX;
      dragVelocity = 0;
      track.dataset.dragging = "true";
      track.setPointerCapture?.(event.pointerId);
    }

    function continueDrag(event) {
      if (!isDragging) {
        return;
      }

      const delta = event.clientX - dragX;
      position += delta;
      dragVelocity = delta * 60;
      dragX = event.clientX;
      updateClipping();
    }

    function endDrag(event) {
      if (!isDragging) {
        return;
      }

      isDragging = false;
      velocity =
        Math.abs(dragVelocity) > 28
          ? dragVelocity
          : -86;
      track.dataset.dragging = "false";
      track.releasePointerCapture?.(event.pointerId);
    }

    resize();

    track.addEventListener("pointerdown", beginDrag);
    track.addEventListener("pointermove", continueDrag);
    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointercancel", endDrag);
    window.addEventListener(
      "resize",
      resize,
      {
        passive: true
      }
    );

    animationFrame =
      window.requestAnimationFrame(render);

    STATE.cardScanner = {
      stop() {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }

  

  function refreshMotionSystems() {
    const ScrollTrigger =
      getScrollTrigger();

    if (
      ScrollTrigger &&
      typeof ScrollTrigger.refresh ===
        "function"
    ) {
      ScrollTrigger.refresh();
    }

    if (
      window.VPNCommon &&
      typeof window.VPNCommon
        .refreshAOS === "function"
    ) {
      window.VPNCommon.refreshAOS();
    }
  }

  

  function initResponsiveParallax() {
    let lastDesktopState =
      window.innerWidth >= 768;

    let resizeTimer = null;

    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          resizeTimer
        );

        resizeTimer =
          window.setTimeout(
            () => {
              const desktopState =
                window.innerWidth >=
                768;

              if (
                desktopState !==
                lastDesktopState
              ) {
                lastDesktopState =
                  desktopState;

                initPhotoParallax();
                refreshMotionSystems();
              }
            },
            180
          );
      },
      {
        passive: true
      }
    );
  }

  

  function initReducedMotionListener() {
    const mediaQuery =
      window.matchMedia(
        REDUCED_MOTION_QUERY
      );

    function handleChange() {
      killMarqueeTween();
      clearHeroFloatTweens();
      clearParallaxTweens();

      if (mediaQuery.matches) {
        const hero =
          document.querySelector(
            SELECTORS.hero
          );

        if (hero) {
          resetDrawableElements(
            getDrawableElements(
              hero
            )
          );
        }

        return;
      }

      initHeroParticles(
        document.querySelector(
          SELECTORS.hero
        )
      );

      initMarquee();
      initPhotoParallax();
      refreshMotionSystems();
    }

    if (
      typeof mediaQuery
        .addEventListener ===
      "function"
    ) {
      mediaQuery.addEventListener(
        "change",
        handleChange
      );
    } else if (
      typeof mediaQuery
        .addListener ===
      "function"
    ) {
      mediaQuery.addListener(
        handleChange
      );
    }
  }

  

  function initialiseHome() {
    if (
      STATE.initialised ||
      !document.body.classList.contains(
        "page-home"
      )
    ) {
      return;
    }

    STATE.initialised = true;

    registerScrollTrigger();

    initHeroAnimation();
    initMarquee();
    initReviewsSwiper();
    initPricingSwiper();
    initCardScanner();
    initPhotoParallax();
    initArrowInteractions();
    initResponsiveParallax();
    initReducedMotionListener();

    document.dispatchEvent(
      new CustomEvent(
        "vpn:home-ready"
      )
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseHome,
      {
        once: true
      }
    );
  } else {
    initialiseHome();
  }

  window.addEventListener(
    "load",
    () => {
      refreshMotionSystems();
    },
    {
      once: true
    }
  );
})();

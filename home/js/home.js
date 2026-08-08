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

  /* =======================================================
     HERO TITLE SPLIT
     ======================================================= */

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

  /* =======================================================
     HERO SVG DRAW
     ======================================================= */

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

  /* =======================================================
     HERO FLOATING PARTICLES
     ======================================================= */

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

  /* =======================================================
     HERO INTRO
     ======================================================= */

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

  /* =======================================================
     MARQUEE
     ======================================================= */

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

  /* =======================================================
     REVIEWS SWIPER
     ======================================================= */

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

  /* =======================================================
     MOBILE PRICING SWIPER
     ======================================================= */

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

  /* =======================================================
     PHOTO PARALLAX
     ======================================================= */

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

  /* =======================================================
     SMALL CARD MICROINTERACTIONS
     ======================================================= */

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

  /* =======================================================
     REFRESH
     ======================================================= */

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

  /* =======================================================
     RESIZE
     ======================================================= */

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

  /* =======================================================
     REDUCED MOTION CHANGES
     ======================================================= */

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

  /* =======================================================
     HOME INITIALISATION
     ======================================================= */

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

(function () {
  "use strict";

  const CONFIG = window.SITE_CONFIG || {};

  const SELECTORS = {
    hero: "[data-vpn-hero]",
    heroEyebrow: "[data-vpn-hero-eyebrow]",
    heroTitle: "[data-vpn-hero-title]",
    heroText: "[data-vpn-hero-text]",
    heroActions: "[data-vpn-hero-actions]",
    heroMeta: "[data-vpn-hero-meta]",
    heroGlobe: "[data-vpn-hero-globe]",
    heroGlobeChip: "[data-vpn-hero-globe-chip]",
    globeFrame: ".vpn-hero__globe-frame",
    globeDraw: "[data-vpn-globe-draw]",

    pricingSection: "[data-vpn-service-pricing]",
    pricingGrid: "[data-vpn-service-pricing-grid]",
    pricingPagination: "[data-vpn-service-pricing-pagination]",

    planMatcher: "[data-vpn-plan-matcher]",
    planMatchCard: "[data-vpn-plan-match-card]",

    process: "[data-vpn-process]",
    processStep: "[data-vpn-process-step]",
    processImage: "[data-vpn-process-image]",

    streamSelector: "[data-vpn-stream-selector]",
    streamButton: "[data-vpn-stream-button]",
    streamPanel: "[data-vpn-stream-panel]",

    regionExplorer: "[data-vpn-region-explorer]",
    regionSearch: "[data-vpn-region-search]",
    regionFilters: "[data-vpn-region-filters]",
    regionGrid: "[data-vpn-region-grid]",
    regionEmpty: "[data-vpn-region-empty]",
    regionCount: "[data-vpn-region-count]",
    regionCategory: "[data-vpn-region-category]",

    reviewsRender: "[data-vpn-service-reviews-render]",
    regionSwiperRender: "[data-vpn-region-swiper-render]",
    deviceSwiperRender: "[data-vpn-device-swiper-render]",
    faqRender: "[data-vpn-service-faq-render]",

    reviewsSwiper: ".vpn-service-reviews-swiper",
    reviewsPrev: "[data-vpn-service-reviews-prev]",
    reviewsNext: "[data-vpn-service-reviews-next]",
    reviewsPagination: "[data-vpn-service-reviews-pagination]",

    regionSwiper: ".vpn-service-region-swiper",
    regionPrev: "[data-vpn-region-prev]",
    regionNext: "[data-vpn-region-next]",
    regionPagination: "[data-vpn-region-pagination]",

    deviceSwiper: ".vpn-service-device-swiper",
    devicePrev: "[data-vpn-device-prev]",
    deviceNext: "[data-vpn-device-next]",
    devicePagination: "[data-vpn-device-pagination]",

    screenshotsSwiper: ".vpn-service-screenshots-swiper",
    screenshotsPrev: "[data-vpn-screenshots-prev]",
    screenshotsNext: "[data-vpn-screenshots-next]",
    screenshotsPagination: "[data-vpn-screenshots-pagination]",

    layerSection: "[data-vpn-service-layers]",
    layerCard: "[data-vpn-layer-card]",

    parallax: "[data-vpn-service-parallax]"
  };

  const STATE = {
    initialised: false,
    heroTimeline: null,

    pricingSwiper: null,
    pricingWrapper: null,
    pricingMediaQuery: null,

    reviewSwipers: [],
    regionSwipers: [],
    deviceSwipers: [],
    screenshotSwipers: [],

    layerMatchMedia: null,
    parallaxMatchMedia: null
  };

  const MOBILE_PRICING_QUERY = "(max-width: 600px)";
  const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

  function getConfigValue(path, fallback = "") {
    if (
      window.VPNCommon &&
      typeof window.VPNCommon.getConfigValue === "function"
    ) {
      return window.VPNCommon.getConfigValue(path, fallback);
    }

    if (!path || typeof path !== "string") {
      return fallback;
    }

    const result = path.split(".").reduce((current, key) => {
      if (
        current !== null &&
        typeof current === "object" &&
        Object.prototype.hasOwnProperty.call(current, key)
      ) {
        return current[key];
      }

      return undefined;
    }, CONFIG);

    return result === undefined || result === null
      ? fallback
      : result;
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
      };

      return entities[character];
    });
  }

  function normalise(value) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isAllRegionFilter(value) {
    const filter = normalise(value);

    return filter === "all" || filter === "all regions";
  }

  function regionFiltersMatch(first, second) {
    if (isAllRegionFilter(first) && isAllRegionFilter(second)) {
      return true;
    }

    return normalise(first) === normalise(second);
  }

  function prefersReducedMotion() {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches;
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
    const ScrollTrigger = getScrollTrigger();

    if (
      !gsap ||
      !ScrollTrigger ||
      typeof gsap.registerPlugin !== "function"
    ) {
      return false;
    }

    gsap.registerPlugin(ScrollTrigger);

    return true;
  }

  function getArrowSvg() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 12H19M14 7L19 12L14 17"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    `;
  }

  function getCheckSvg() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M6 12L10 16L18 8"
          fill="none"
          stroke="currentColor"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        ></path>
      </svg>
    `;
  }

  function getSearchSvg() {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle
          cx="11"
          cy="11"
          r="7"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        ></circle>

        <path
          d="M16.2 16.2L21 21"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        ></path>
      </svg>
    `;
  }

  /* =======================================================
     HERO
     ======================================================= */

  function splitHeroTitle(title) {
    if (!title) {
      return [];
    }

    if (title.dataset.vpnSplit === "true") {
      return Array.from(
        title.querySelectorAll(".vpn-hero__title-word")
      );
    }

    const text = title.textContent
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      return [];
    }

    title.dataset.vpnSplit = "true";
    title.setAttribute("aria-label", text);
    title.textContent = "";

    const line = document.createElement("span");

    line.className = "vpn-hero__title-line";
    line.setAttribute("aria-hidden", "true");

    text.split(" ").forEach((word, index, words) => {
      const span = document.createElement("span");

      span.className = "vpn-hero__title-word";
      span.textContent = word;

      line.appendChild(span);

      if (index < words.length - 1) {
        line.appendChild(document.createTextNode(" "));
      }
    });

    title.appendChild(line);

    return Array.from(
      title.querySelectorAll(".vpn-hero__title-word")
    );
  }

  function getHeroDrawables(hero) {
    if (!hero) {
      return [];
    }

    const explicit = Array.from(
      hero.querySelectorAll(SELECTORS.globeDraw)
    );

    if (explicit.length) {
      return explicit;
    }

    const frame = hero.querySelector(SELECTORS.globeFrame);

    if (!frame) {
      return [];
    }

    return Array.from(
      frame.querySelectorAll("path, circle, ellipse, line")
    );
  }

  function prepareDrawable(element) {
    if (
      !element ||
      typeof element.getTotalLength !== "function"
    ) {
      return false;
    }

    let length = 0;

    try {
      length = element.getTotalLength();
    } catch (error) {
      return false;
    }

    if (!Number.isFinite(length) || length <= 0) {
      return false;
    }

    element.style.strokeDasharray = String(length);
    element.style.strokeDashoffset = String(length);

    return true;
  }

  function resetDrawable(element) {
    element.style.strokeDasharray = "";
    element.style.strokeDashoffset = "";
  }

  function initServiceHero() {
    const hero = document.querySelector(SELECTORS.hero);

    if (!hero) {
      return;
    }

    const title = hero.querySelector(SELECTORS.heroTitle);
    const eyebrow = hero.querySelector(SELECTORS.heroEyebrow);
    const text = hero.querySelector(SELECTORS.heroText);
    const actions = hero.querySelector(SELECTORS.heroActions);
    const meta = hero.querySelector(SELECTORS.heroMeta);
    const globe = hero.querySelector(SELECTORS.heroGlobe);

    const chips = Array.from(
      hero.querySelectorAll(SELECTORS.heroGlobeChip)
    );

    const words = splitHeroTitle(title);
    const drawables = getHeroDrawables(hero);

    if (prefersReducedMotion()) {
      drawables.forEach(resetDrawable);
      return;
    }

    const gsap = getGSAP();

    if (!gsap) {
      drawables.forEach(resetDrawable);
      return;
    }

    if (
      STATE.heroTimeline &&
      typeof STATE.heroTimeline.kill === "function"
    ) {
      STATE.heroTimeline.kill();
    }

    const drawableElements = drawables.filter(prepareDrawable);

    if (eyebrow) {
      gsap.set(eyebrow, {
        opacity: 0,
        y: 12
      });
    }

    if (words.length) {
      gsap.set(words, {
        opacity: 0,
        yPercent: 115
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
        y: 18
      });
    }

    if (meta) {
      gsap.set(meta, {
        opacity: 0,
        y: 14
      });
    }

    if (globe) {
      gsap.set(globe, {
        opacity: 0,
        scale: 0.94,
        rotate: -1.5,
        transformOrigin: "50% 50%"
      });
    }

    if (chips.length) {
      gsap.set(chips, {
        opacity: 0,
        y: 12
      });
    }

    const timeline = gsap.timeline({
      defaults: {
        ease: "power3.out"
      }
    });

    STATE.heroTimeline = timeline;

    if (eyebrow) {
      timeline.to(
        eyebrow,
        {
          opacity: 1,
          y: 0,
          duration: 0.5
        },
        0.05
      );
    }

    if (words.length) {
      timeline.to(
        words,
        {
          opacity: 1,
          yPercent: 0,
          duration: 0.82,
          stagger: 0.05
        },
        0.14
      );
    }

    if (text) {
      timeline.to(
        text,
        {
          opacity: 1,
          y: 0,
          duration: 0.62
        },
        0.46
      );
    }

    if (actions) {
      timeline.to(
        actions,
        {
          opacity: 1,
          y: 0,
          duration: 0.58
        },
        0.58
      );
    }

    if (meta) {
      timeline.to(
        meta,
        {
          opacity: 1,
          y: 0,
          duration: 0.52
        },
        0.7
      );
    }

    if (globe) {
      timeline.to(
        globe,
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.95
        },
        0.18
      );
    }

    if (drawableElements.length) {
      timeline.to(
        drawableElements,
        {
          strokeDashoffset: 0,
          duration: 1.35,
          stagger: 0.045,
          ease: "power2.inOut"
        },
        0.32
      );
    }

    if (chips.length) {
      timeline.to(
        chips,
        {
          opacity: 1,
          y: 0,
          duration: 0.52,
          stagger: 0.1
        },
        0.7
      );
    }
  }

  /* =======================================================
     PRICING RENDERER
     ======================================================= */

  function getPricingButtonClass(index) {
    if (index === 1) {
      return "vpn-button vpn-button--dark";
    }

    return "vpn-button vpn-button--orange";
  }

  function renderServicePricing() {
    const grid = document.querySelector(SELECTORS.pricingGrid);

    if (!grid) {
      return;
    }

    const plans = getConfigValue("pricing.plans", []);

    if (!Array.isArray(plans) || !plans.length) {
      return;
    }

    grid.innerHTML = plans
      .map((plan, index) => {
        const recommended = plan.recommended
          ? `
            <span class="vpn-service-price-card__recommended">
              Recommended
            </span>
          `
          : "";

        const features = Array.isArray(plan.features)
          ? plan.features
              .map((feature) => {
                return `
                  <li class="vpn-service-price-card__feature">
                    ${escapeHtml(feature)}
                  </li>
                `;
              })
              .join("")
          : "";

        return `
          <article
            class="vpn-service-price-card"
            data-plan-id="${escapeHtml(plan.id || "")}"
          >
            <div class="vpn-service-price-card__top">
              <span class="vpn-service-price-card__label">
                ${escapeHtml(plan.label || "")}
              </span>

              ${recommended}
            </div>

            <h3 class="vpn-service-price-card__name">
              ${escapeHtml(plan.planName || "")}
            </h3>

            <div class="vpn-service-price-card__price-row">
              <strong class="vpn-service-price-card__price">
                ${escapeHtml(plan.price || "")}
              </strong>

              <span class="vpn-service-price-card__suffix">
                ${escapeHtml(plan.priceSuffix || "")}
              </span>
            </div>

            <p class="vpn-service-price-card__billing">
              ${escapeHtml(plan.billingText || "")}
            </p>

            <p class="vpn-service-price-card__text">
              ${escapeHtml(plan.supportingText || "")}
            </p>

            <ul class="vpn-service-price-card__features">
              ${features}
            </ul>

            <div class="vpn-service-price-card__action">
              <a
                class="${getPricingButtonClass(index)}"
                href="${escapeHtml(plan.ctaUrl || "contact.html")}"
              >
                ${escapeHtml(plan.ctaLabel || "Choose Plan")}
              </a>
            </div>
          </article>
        `;
      })
      .join("");
  }

  /* =======================================================
     MOBILE PRICING SWIPER
     ======================================================= */

  function getPricingCards(grid) {
    return Array.from(grid.children).filter((element) => {
      return element.classList.contains("vpn-service-price-card");
    });
  }

  function createPricingWrapper(grid) {
    const cards = getPricingCards(grid);

    if (!cards.length) {
      return null;
    }

    const wrapper = document.createElement("div");

    wrapper.className = "swiper-wrapper";

    cards.forEach((card) => {
      card.classList.add("swiper-slide");
      wrapper.appendChild(card);
    });

    grid.appendChild(wrapper);

    return wrapper;
  }

  function cleanPricingSlide(slide) {
    slide.classList.remove(
      "swiper-slide",
      "swiper-slide-active",
      "swiper-slide-next",
      "swiper-slide-prev",
      "swiper-slide-visible",
      "swiper-slide-fully-visible"
    );

    slide.removeAttribute("role");
    slide.removeAttribute("aria-label");

    [
      "width",
      "height",
      "margin-right",
      "transform"
    ].forEach((property) => {
      slide.style.removeProperty(property);
    });
  }

  function enablePricingSwiper() {
    const grid = document.querySelector(SELECTORS.pricingGrid);
    const Swiper = getSwiper();

    if (
      !grid ||
      !Swiper ||
      STATE.pricingSwiper
    ) {
      return;
    }

    const wrapper = createPricingWrapper(grid);

    if (!wrapper) {
      return;
    }

    STATE.pricingWrapper = wrapper;

    grid.classList.add(
      "swiper",
      "vpn-service-pricing-swiper"
    );

    const section =
      grid.closest(SELECTORS.pricingSection) || document;

    const pagination = section.querySelector(
      SELECTORS.pricingPagination
    );

    const options = {
      slidesPerView: 1,
      spaceBetween: 18,
      speed: 620,
      grabCursor: true,
      watchOverflow: true,
      observer: true,
      observeParents: true,
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      a11y: {
        enabled: true,
        firstSlideMessage: "This is the first pricing plan",
        lastSlideMessage: "This is the last pricing plan"
      }
    };

    if (pagination) {
      options.pagination = {
        el: pagination,
        clickable: true
      };
    }

    STATE.pricingSwiper = new Swiper(grid, options);
  }

  function disablePricingSwiper() {
    const grid = document.querySelector(SELECTORS.pricingGrid);

    if (!grid) {
      return;
    }

    if (
      STATE.pricingSwiper &&
      typeof STATE.pricingSwiper.destroy === "function"
    ) {
      STATE.pricingSwiper.destroy(true, false);
    }

    STATE.pricingSwiper = null;

    const wrapper =
      STATE.pricingWrapper ||
      grid.querySelector(".swiper-wrapper");

    if (wrapper) {
      Array.from(wrapper.children).forEach((slide) => {
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
      "vpn-service-pricing-swiper"
    );

    grid.removeAttribute("style");
  }

  function updatePricingMode(event) {
    const mobile =
      typeof event.matches === "boolean"
        ? event.matches
        : window.matchMedia(MOBILE_PRICING_QUERY).matches;

    if (mobile) {
      enablePricingSwiper();
    } else {
      disablePricingSwiper();
    }
  }

  function initPricingSwiper() {
    const grid = document.querySelector(SELECTORS.pricingGrid);

    if (!grid) {
      return;
    }

    STATE.pricingMediaQuery = window.matchMedia(
      MOBILE_PRICING_QUERY
    );

    updatePricingMode(STATE.pricingMediaQuery);

    if (
      typeof STATE.pricingMediaQuery.addEventListener === "function"
    ) {
      STATE.pricingMediaQuery.addEventListener(
        "change",
        updatePricingMode
      );
    } else if (
      typeof STATE.pricingMediaQuery.addListener === "function"
    ) {
      STATE.pricingMediaQuery.addListener(updatePricingMode);
    }
  }

  /* =======================================================
     PLAN MATCHER
     ======================================================= */

  function initPlanMatcher() {
    const root = document.querySelector(SELECTORS.planMatcher);

    if (!root) {
      return;
    }

    const cards = Array.from(
      root.querySelectorAll(SELECTORS.planMatchCard)
    );

    if (!cards.length) {
      return;
    }

    function selectPlan(card, focus = false) {
      if (!card) {
        return;
      }

      cards.forEach((item) => {
        const active = item === card;

        item.setAttribute(
          "data-selected",
          active ? "true" : "false"
        );

        item.setAttribute(
          "aria-pressed",
          active ? "true" : "false"
        );
      });

      if (focus) {
        card.focus();
      }
    }

    cards.forEach((card, index) => {
      card.setAttribute("aria-pressed", "false");

      card.addEventListener("click", () => {
        selectPlan(card, false);
      });

      card.addEventListener("keydown", (event) => {
        if (
          event.key !== "ArrowRight" &&
          event.key !== "ArrowLeft" &&
          event.key !== "Home" &&
          event.key !== "End"
        ) {
          return;
        }

        event.preventDefault();

        let targetIndex = index;

        if (event.key === "ArrowRight") {
          targetIndex = (index + 1) % cards.length;
        }

        if (event.key === "ArrowLeft") {
          targetIndex =
            (index - 1 + cards.length) % cards.length;
        }

        if (event.key === "Home") {
          targetIndex = 0;
        }

        if (event.key === "End") {
          targetIndex = cards.length - 1;
        }

        selectPlan(cards[targetIndex], true);
      });
    });

    const params = new URLSearchParams(window.location.search);
    const requestedPlan = params.get("plan");

    const queryCard = requestedPlan
      ? cards.find(
          (card) =>
            card.getAttribute("data-plan-id") === requestedPlan
        )
      : null;

    const preselected = cards.find(
      (card) => card.getAttribute("data-selected") === "true"
    );

    const recommendedPlan = plans.find(
      (plan) => plan.recommended === true
    );

    const recommendedCard = recommendedPlan
      ? cards.find(
          (card) =>
            card.getAttribute("data-plan-id") === recommendedPlan.id
        )
      : null;

    selectPlan(
      queryCard ||
      preselected ||
      recommendedCard ||
      cards[0],
      false
    );
  }

  /* =======================================================
     PROCESS
     ======================================================= */

  function initProcess() {
    document
      .querySelectorAll(SELECTORS.process)
      .forEach((root) => {
        const steps = Array.from(
          root.querySelectorAll(SELECTORS.processStep)
        );

        const image = root.querySelector(SELECTORS.processImage);

        if (!steps.length) {
          return;
        }

        function activate(step, focus = false) {
          steps.forEach((item) => {
            const active = item === step;

            item.setAttribute(
              "data-active",
              active ? "true" : "false"
            );

            item.setAttribute(
              "aria-selected",
              active ? "true" : "false"
            );
          });

          if (image) {
            const newSrc = step.getAttribute("data-process-image");
            const newAlt = step.getAttribute("data-process-alt") || "";

            if (
              newSrc &&
              image.getAttribute("src") !== newSrc
            ) {
              const gsap = getGSAP();

              if (
                gsap &&
                !prefersReducedMotion()
              ) {
                gsap.to(image, {
                  opacity: 0,
                  duration: 0.18,
                  onComplete: () => {
                    image.setAttribute("src", newSrc);
                    image.setAttribute("alt", newAlt);

                    gsap.to(image, {
                      opacity: 1,
                      duration: 0.32
                    });
                  }
                });
              } else {
                image.setAttribute("src", newSrc);
                image.setAttribute("alt", newAlt);
              }
            }
          }

          if (focus) {
            step.focus();
          }
        }

        steps.forEach((step, index) => {
          step.setAttribute(
            "aria-selected",
            step.getAttribute("data-active") === "true"
              ? "true"
              : "false"
          );

          step.addEventListener("click", () => {
            activate(step, false);
          });

          step.addEventListener("keydown", (event) => {
            if (
              event.key !== "ArrowDown" &&
              event.key !== "ArrowUp" &&
              event.key !== "Home" &&
              event.key !== "End"
            ) {
              return;
            }

            event.preventDefault();

            let targetIndex = index;

            if (event.key === "ArrowDown") {
              targetIndex = (index + 1) % steps.length;
            }

            if (event.key === "ArrowUp") {
              targetIndex =
                (index - 1 + steps.length) % steps.length;
            }

            if (event.key === "Home") {
              targetIndex = 0;
            }

            if (event.key === "End") {
              targetIndex = steps.length - 1;
            }

            activate(steps[targetIndex], true);
          });
        });

        const activeStep =
          steps.find(
            (step) => step.getAttribute("data-active") === "true"
          ) || steps[0];

        activate(activeStep, false);
      });
  }

  /* =======================================================
     STREAMING SELECTOR
     ======================================================= */

  function initStreamingSelector() {
    document
      .querySelectorAll(SELECTORS.streamSelector)
      .forEach((root, rootIndex) => {
        const buttons = Array.from(
          root.querySelectorAll(SELECTORS.streamButton)
        );

        const panels = Array.from(
          root.querySelectorAll(SELECTORS.streamPanel)
        );

        if (!buttons.length || !panels.length) {
          return;
        }

        function activate(button, moveFocus = false) {
          const id = button.getAttribute("data-stream-id");

          buttons.forEach((item, index) => {
            const selected =
              item.getAttribute("data-stream-id") === id;

            item.setAttribute(
              "aria-selected",
              selected ? "true" : "false"
            );

            item.tabIndex = selected ? 0 : -1;

            if (!item.id) {
              item.id =
                `vpn-stream-tab-${rootIndex}-${index}`;
            }

            const panel = panels.find(
              (candidate) =>
                candidate.getAttribute(
                  "data-stream-panel-id"
                ) === item.getAttribute("data-stream-id")
            );

            if (panel) {
              if (!panel.id) {
                panel.id =
                  `vpn-stream-panel-${rootIndex}-${index}`;
              }

              item.setAttribute(
                "aria-controls",
                panel.id
              );

              panel.setAttribute(
                "aria-labelledby",
                item.id
              );

              panel.setAttribute("role", "tabpanel");

              panel.hidden = !selected;
            }
          });

          const activePanel = panels.find(
            (panel) =>
              panel.getAttribute("data-stream-panel-id") === id
          );

          const gsap = getGSAP();

          if (
            activePanel &&
            gsap &&
            !prefersReducedMotion()
          ) {
            gsap.fromTo(
              activePanel,
              {
                opacity: 0,
                y: 10
              },
              {
                opacity: 1,
                y: 0,
                duration: 0.38,
                ease: "power2.out",
                clearProps: "transform"
              }
            );
          }

          if (moveFocus) {
            button.focus();
          }
        }

        buttons.forEach((button, index) => {
          button.setAttribute("role", "tab");

          button.addEventListener("click", () => {
            activate(button, false);
          });

          button.addEventListener("keydown", (event) => {
            if (
              event.key !== "ArrowDown" &&
              event.key !== "ArrowUp" &&
              event.key !== "ArrowRight" &&
              event.key !== "ArrowLeft" &&
              event.key !== "Home" &&
              event.key !== "End"
            ) {
              return;
            }

            event.preventDefault();

            let targetIndex = index;

            if (
              event.key === "ArrowDown" ||
              event.key === "ArrowRight"
            ) {
              targetIndex = (index + 1) % buttons.length;
            }

            if (
              event.key === "ArrowUp" ||
              event.key === "ArrowLeft"
            ) {
              targetIndex =
                (index - 1 + buttons.length) % buttons.length;
            }

            if (event.key === "Home") {
              targetIndex = 0;
            }

            if (event.key === "End") {
              targetIndex = buttons.length - 1;
            }

            activate(buttons[targetIndex], true);
          });
        });

        activate(
          buttons.find(
            (button) =>
              button.getAttribute("aria-selected") === "true"
          ) || buttons[0],
          false
        );
      });
  }

  /* =======================================================
     REGION EXPLORER
     ======================================================= */

  function renderRegionFilters(root) {
    const filtersRoot = root.querySelector(
      SELECTORS.regionFilters
    );

    if (!filtersRoot || filtersRoot.children.length) {
      return;
    }

    const filters = getConfigValue("network.filters", []);

    if (!Array.isArray(filters)) {
      return;
    }

    filtersRoot.innerHTML = filters
      .map((filter, index) => {
        return `
          <button
            class="vpn-service-region-explorer__filter"
            type="button"
            aria-pressed="${index === 0 ? "true" : "false"}"
            data-vpn-region-filter="${escapeHtml(filter)}"
          >
            ${escapeHtml(filter)}
          </button>
        `;
      })
      .join("");
  }

  function renderRegionCards(root, regions) {
    const grid = root.querySelector(SELECTORS.regionGrid);

    if (!grid) {
      return;
    }

    grid.innerHTML = regions
      .map((region) => {
        return `
          <article
            class="vpn-service-server-card"
            data-region-group="${escapeHtml(region.group || "")}"
            data-region-search="${escapeHtml(
              [
                region.name,
                region.code,
                region.city,
                region.group
              ].join(" ")
            )}"
          >
            <div class="vpn-service-server-card__top">
              <span class="vpn-service-server-card__code">
                ${escapeHtml(region.code || "")}
              </span>

              <span class="vpn-service-server-card__status">
                ${escapeHtml(region.status || "Available")}
              </span>
            </div>

            <h3 class="vpn-service-server-card__name">
              ${escapeHtml(region.name || "")}
            </h3>

            <span class="vpn-service-server-card__city">
              ${escapeHtml(region.city || "")}
            </span>
          </article>
        `;
      })
      .join("");
  }

  function initRegionExplorer() {
    const root = document.querySelector(SELECTORS.regionExplorer);

    if (!root) {
      return;
    }

    const regions = getConfigValue("network.regions", []);

    if (!Array.isArray(regions)) {
      return;
    }

    renderRegionFilters(root);
    renderRegionCards(root, regions);

    const search = root.querySelector(SELECTORS.regionSearch);
    const empty = root.querySelector(SELECTORS.regionEmpty);
    const count = root.querySelector(SELECTORS.regionCount);

    const filterButtons = Array.from(
      root.querySelectorAll("[data-vpn-region-filter]")
    );

    let activeFilter =
      filterButtons
        .find(
          (button) =>
            button.getAttribute("aria-pressed") === "true"
        )
        ?.getAttribute("data-vpn-region-filter") ||
      filterButtons[0]?.getAttribute("data-vpn-region-filter") ||
      "All";

    function updateCategoryCards() {
      document
        .querySelectorAll(SELECTORS.regionCategory)
        .forEach((card) => {
          const filter = card.getAttribute("data-region-filter");

          card.setAttribute(
            "data-active",
            regionFiltersMatch(filter, activeFilter)
              ? "true"
              : "false"
          );
        });
    }

    function applyFilter() {
      const query = normalise(search ? search.value : "");

      const cards = Array.from(
        root.querySelectorAll(".vpn-service-server-card")
      );

      let visibleCount = 0;

      cards.forEach((card) => {
        const group =
          card.getAttribute("data-region-group") || "";

        const searchData =
          card.getAttribute("data-region-search") || "";

        const filterMatch =
          isAllRegionFilter(activeFilter) ||
          regionFiltersMatch(group, activeFilter);

        const searchMatch =
          !query ||
          normalise(searchData).includes(query);

        const visible = filterMatch && searchMatch;

        card.hidden = !visible;

        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.setAttribute(
          "data-visible",
          visibleCount === 0 ? "true" : "false"
        );
      }

      if (count) {
        count.textContent =
          `${visibleCount} location${visibleCount === 1 ? "" : "s"}`;
      }

      updateCategoryCards();
    }

    function selectFilter(filter) {
      activeFilter = filter;

      filterButtons.forEach((button) => {
        button.setAttribute(
          "aria-pressed",
          regionFiltersMatch(
            button.getAttribute("data-vpn-region-filter"),
            filter
          )
            ? "true"
            : "false"
        );
      });

      applyFilter();
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        selectFilter(
          button.getAttribute("data-vpn-region-filter") ||
          "All"
        );
      });
    });

    if (search) {
      search.addEventListener("input", applyFilter);
    }

    document
      .querySelectorAll(SELECTORS.regionCategory)
      .forEach((card) => {
        card.addEventListener("click", () => {
          const filter =
            card.getAttribute("data-region-filter") ||
            "All";

          if (search) {
            search.value = "";
          }

          selectFilter(filter);

          root.scrollIntoView({
            behavior: prefersReducedMotion() ? "auto" : "smooth",
            block: "start"
          });
        });
      });

    const params = new URLSearchParams(window.location.search);
    const requestedRegion = params.get("region");

    if (
      requestedRegion &&
      filterButtons.some(
        (button) =>
          regionFiltersMatch(
            button.getAttribute("data-vpn-region-filter"),
            requestedRegion
          )
      )
    ) {
      const button = filterButtons.find(
        (candidate) =>
          regionFiltersMatch(
            candidate.getAttribute("data-vpn-region-filter"),
            requestedRegion
          )
      );

      selectFilter(
        button.getAttribute("data-vpn-region-filter")
      );
    } else {
      applyFilter();
    }
  }

  /* =======================================================
     REGION CATEGORY CARDS
     ======================================================= */

  function initRegionCategories() {
    document
      .querySelectorAll(SELECTORS.regionCategory)
      .forEach((card) => {
        if (card.dataset.vpnRegionBound === "true") {
          return;
        }

        card.dataset.vpnRegionBound = "true";

        if (!card.hasAttribute("tabindex")) {
          card.tabIndex = 0;
        }

        if (!card.hasAttribute("role")) {
          card.setAttribute("role", "button");
        }

        card.addEventListener("keydown", (event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            card.click();
          }
        });
      });
  }

  /* =======================================================
     REVIEWS RENDER
     ======================================================= */

  function renderServiceReviews() {
    document
      .querySelectorAll(SELECTORS.reviewsRender)
      .forEach((wrapper) => {
        if (wrapper.children.length) {
          return;
        }

        const reviews = getConfigValue("reviews.items", []);

        if (!Array.isArray(reviews)) {
          return;
        }

        wrapper.innerHTML = reviews
          .map((review) => {
            return `
              <div class="swiper-slide">
                <article class="vpn-service-review-card">

                  <blockquote class="vpn-service-review-card__quote">
                    ${escapeHtml(review.quote || "")}
                  </blockquote>

                  <div class="vpn-service-review-card__person">
                    <div class="vpn-service-review-card__avatar">
                      <img
                        src="${escapeHtml(review.avatar || "")}"
                        alt="${escapeHtml(review.avatarAlt || "")}"
                        width="90"
                        height="90"
                        loading="lazy"
                        decoding="async"
                      >
                    </div>

                    <div>
                      <strong class="vpn-service-review-card__name">
                        ${escapeHtml(review.name || "")}
                      </strong>

                      <span class="vpn-service-review-card__role">
                        ${escapeHtml(review.role || "")}
                      </span>
                    </div>
                  </div>

                </article>
              </div>
            `;
          })
          .join("");
      });
  }

  /* =======================================================
     REGION SWIPER RENDER
     ======================================================= */

  function renderRegionSwiper() {
    document
      .querySelectorAll(SELECTORS.regionSwiperRender)
      .forEach((wrapper) => {
        if (wrapper.children.length) {
          return;
        }

        const regions = getConfigValue("network.regions", []);

        if (!Array.isArray(regions)) {
          return;
        }

        wrapper.innerHTML = regions
          .slice(0, 10)
          .map((region) => {
            return `
              <div class="swiper-slide">
                <article class="vpn-service-region-slide">

                  <span class="vpn-service-region-slide__code">
                    ${escapeHtml(region.code || "")}
                  </span>

                  <h3 class="vpn-service-region-slide__name">
                    ${escapeHtml(region.name || "")}
                  </h3>

                  <p class="vpn-service-region-slide__text">
                    Connect through the ${escapeHtml(
                      region.city || region.name || ""
                    )} region when it suits your current browsing or travel needs.
                  </p>

                </article>
              </div>
            `;
          })
          .join("");
      });
  }

  /* =======================================================
     DEVICE SWIPER RENDER
     ======================================================= */

  function renderDeviceSwiper() {
    document
      .querySelectorAll(SELECTORS.deviceSwiperRender)
      .forEach((wrapper) => {
        if (wrapper.children.length) {
          return;
        }

        const devices = getConfigValue("devices", []);

        if (!Array.isArray(devices)) {
          return;
        }

        wrapper.innerHTML = devices
          .map((device) => {
            return `
              <div class="swiper-slide">
                <article class="vpn-service-device-card">

                  <h3 class="vpn-service-device-card__name">
                    ${escapeHtml(device.name || "")}
                  </h3>

                  <span class="vpn-service-device-card__tag">
                    ${escapeHtml(device.tagline || "")}
                  </span>

                  <div class="vpn-service-device-card__visual">
                    <img
                      class="vpn-service-device-card__image"
                      src="${escapeHtml(device.image || "")}"
                      alt="${escapeHtml(device.imageAlt || "")}"
                      width="480"
                      height="360"
                      loading="lazy"
                      decoding="async"
                    >
                  </div>

                  <a
                    class="vpn-round-control vpn-service-device-card__arrow"
                    href="${escapeHtml(device.url || "download-apps.html")}"
                    aria-label="Explore ${escapeHtml(device.name || "device")} app"
                  >
                    ${getArrowSvg()}
                  </a>

                </article>
              </div>
            `;
          })
          .join("");
      });
  }

  /* =======================================================
     FAQ RENDER
     ======================================================= */

  function getFaqConfigKey() {
    const service = document.body.getAttribute("data-service");

    const map = {
      pricing: "pricing",
      features: "features",
      locations: "locations",
      streaming: "streaming",
      trial: "trial",
      downloads: "downloads"
    };

    return map[service] || "";
  }

  function renderServiceFaq() {
    const mount = document.querySelector(SELECTORS.faqRender);

    if (!mount || mount.children.length) {
      return;
    }

    const key = getFaqConfigKey();

    if (!key) {
      return;
    }

    const items = getConfigValue(`faq.${key}`, []);

    if (!Array.isArray(items) || !items.length) {
      return;
    }

    mount.innerHTML = `
      <div
        class="vpn-accordion"
        data-vpn-accordion
      >
        ${items
          .map((item, index) => {
            return `
              <article
                class="vpn-accordion__item"
                data-vpn-accordion-item
              >
                <button
                  class="vpn-accordion__trigger"
                  type="button"
                  aria-expanded="${index === 0 ? "true" : "false"}"
                  data-vpn-accordion-trigger
                >
                  <span class="vpn-accordion__question">
                    ${escapeHtml(item.question || "")}
                  </span>

                  <span
                    class="vpn-accordion__icon"
                    aria-hidden="true"
                  ></span>
                </button>

                <div
                  class="vpn-accordion__panel"
                  data-vpn-accordion-panel
                >
                  <div class="vpn-accordion__panel-inner">
                    <p class="vpn-accordion__answer">
                      ${escapeHtml(item.answer || "")}
                    </p>
                  </div>
                </div>
              </article>
            `;
          })
          .join("")}
      </div>
    `;

    if (
      window.VPNCommon &&
      typeof window.VPNCommon.initAccordions === "function"
    ) {
      window.VPNCommon.initAccordions(mount);
    }
  }

  /* =======================================================
     SWIPER HELPERS
     ======================================================= */

  function findSwiperControl(swiperElement, selector) {
    const shell =
      swiperElement.closest("[data-vpn-swiper-shell]") ||
      swiperElement.parentElement ||
      document;

    return shell.querySelector(selector);
  }

  function buildBaseSwiperOptions() {
    return {
      speed: 650,
      watchOverflow: true,
      grabCursor: true,
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      a11y: {
        enabled: true
      }
    };
  }

  function initReviewSwipers() {
    const Swiper = getSwiper();

    if (!Swiper) {
      return;
    }

    document
      .querySelectorAll(SELECTORS.reviewsSwiper)
      .forEach((element) => {
        if (element.dataset.vpnSwiperInitialised === "true") {
          return;
        }

        const previous = findSwiperControl(
          element,
          SELECTORS.reviewsPrev
        );

        const next = findSwiperControl(
          element,
          SELECTORS.reviewsNext
        );

        const pagination = findSwiperControl(
          element,
          SELECTORS.reviewsPagination
        );

        const options = {
          ...buildBaseSwiperOptions(),
          slidesPerView: 1,
          spaceBetween: 16,
          breakpoints: {
            720: {
              slidesPerView: 2,
              spaceBetween: 18
            }
          }
        };

        if (previous && next) {
          options.navigation = {
            prevEl: previous,
            nextEl: next
          };
        }

        if (pagination) {
          options.pagination = {
            el: pagination,
            clickable: true
          };
        }

        element.dataset.vpnSwiperInitialised = "true";

        STATE.reviewSwipers.push(
          new Swiper(element, options)
        );
      });
  }

  function initRegionSwipers() {
    const Swiper = getSwiper();

    if (!Swiper) {
      return;
    }

    document
      .querySelectorAll(SELECTORS.regionSwiper)
      .forEach((element) => {
        if (element.dataset.vpnSwiperInitialised === "true") {
          return;
        }

        const previous = findSwiperControl(
          element,
          SELECTORS.regionPrev
        );

        const next = findSwiperControl(
          element,
          SELECTORS.regionNext
        );

        const pagination = findSwiperControl(
          element,
          SELECTORS.regionPagination
        );

        const options = {
          ...buildBaseSwiperOptions(),
          slidesPerView: 1.12,
          spaceBetween: 15,
          breakpoints: {
            650: {
              slidesPerView: 2,
              spaceBetween: 16
            },
            980: {
              slidesPerView: 3,
              spaceBetween: 18
            }
          }
        };

        if (previous && next) {
          options.navigation = {
            prevEl: previous,
            nextEl: next
          };
        }

        if (pagination) {
          options.pagination = {
            el: pagination,
            clickable: true
          };
        }

        element.dataset.vpnSwiperInitialised = "true";

        STATE.regionSwipers.push(
          new Swiper(element, options)
        );
      });
  }

  function initDeviceSwipers() {
    const Swiper = getSwiper();

    if (!Swiper) {
      return;
    }

    document
      .querySelectorAll(SELECTORS.deviceSwiper)
      .forEach((element) => {
        if (element.dataset.vpnSwiperInitialised === "true") {
          return;
        }

        const previous = findSwiperControl(
          element,
          SELECTORS.devicePrev
        );

        const next = findSwiperControl(
          element,
          SELECTORS.deviceNext
        );

        const pagination = findSwiperControl(
          element,
          SELECTORS.devicePagination
        );

        const options = {
          ...buildBaseSwiperOptions(),
          slidesPerView: 1.14,
          spaceBetween: 16,
          breakpoints: {
            620: {
              slidesPerView: 2,
              spaceBetween: 17
            },
            930: {
              slidesPerView: 3,
              spaceBetween: 18
            },
            1280: {
              slidesPerView: 4,
              spaceBetween: 18
            }
          }
        };

        if (previous && next) {
          options.navigation = {
            prevEl: previous,
            nextEl: next
          };
        }

        if (pagination) {
          options.pagination = {
            el: pagination,
            clickable: true
          };
        }

        element.dataset.vpnSwiperInitialised = "true";

        STATE.deviceSwipers.push(
          new Swiper(element, options)
        );
      });
  }

  function initScreenshotSwipers() {
    const Swiper = getSwiper();

    if (!Swiper) {
      return;
    }

    document
      .querySelectorAll(SELECTORS.screenshotsSwiper)
      .forEach((element) => {
        if (element.dataset.vpnSwiperInitialised === "true") {
          return;
        }

        const previous = findSwiperControl(
          element,
          SELECTORS.screenshotsPrev
        );

        const next = findSwiperControl(
          element,
          SELECTORS.screenshotsNext
        );

        const pagination = findSwiperControl(
          element,
          SELECTORS.screenshotsPagination
        );

        const options = {
          ...buildBaseSwiperOptions(),
          slidesPerView: 1.18,
          centeredSlides: false,
          spaceBetween: 15,
          breakpoints: {
            650: {
              slidesPerView: 2.15,
              spaceBetween: 17
            },
            1050: {
              slidesPerView: 3.15,
              spaceBetween: 19
            }
          }
        };

        if (previous && next) {
          options.navigation = {
            prevEl: previous,
            nextEl: next
          };
        }

        if (pagination) {
          options.pagination = {
            el: pagination,
            clickable: true
          };
        }

        element.dataset.vpnSwiperInitialised = "true";

        STATE.screenshotSwipers.push(
          new Swiper(element, options)
        );
      });
  }

  function initServiceSwipers() {
    initReviewSwipers();
    initRegionSwipers();
    initDeviceSwipers();
    initScreenshotSwipers();
  }

  /* =======================================================
     SERVICE TAB ANIMATION
     Common.js owns tab state and accessibility.
     ======================================================= */

  function initServiceTabAnimations() {
    document
      .querySelectorAll("[data-vpn-tabs]")
      .forEach((root) => {
        if (root.dataset.vpnServiceTabAnimation === "true") {
          return;
        }

        root.dataset.vpnServiceTabAnimation = "true";

        root.addEventListener("vpn:tab-change", (event) => {
          const tabId = event.detail?.tabId;

          if (!tabId) {
            return;
          }

          const panel = root.querySelector(
            `[data-tab-panel-id="${CSS.escape(tabId)}"]`
          );

          const gsap = getGSAP();

          if (
            !panel ||
            !gsap ||
            prefersReducedMotion()
          ) {
            return;
          }

          gsap.fromTo(
            panel.children,
            {
              opacity: 0,
              y: 10
            },
            {
              opacity: 1,
              y: 0,
              duration: 0.36,
              stagger: 0.035,
              ease: "power2.out",
              clearProps: "transform"
            }
          );
        });
      });
  }

  /* =======================================================
     STICKY PROTECTION LAYERS
     ======================================================= */

  function initStickyLayers() {
    const section = document.querySelector(SELECTORS.layerSection);

    if (!section) {
      return;
    }

    const gsap = getGSAP();
    const ScrollTrigger = getScrollTrigger();

    if (!gsap || !ScrollTrigger) {
      return;
    }

    registerScrollTrigger();

    if (STATE.layerMatchMedia) {
      STATE.layerMatchMedia.revert();
    }

    STATE.layerMatchMedia = gsap.matchMedia();

    STATE.layerMatchMedia.add(
      "(min-width: 901px) and (prefers-reduced-motion: no-preference)",
      () => {
        const cards = Array.from(
          section.querySelectorAll(SELECTORS.layerCard)
        );

        const tweens = [];

        cards.forEach((card, index) => {
          const tween = gsap.to(card, {
            scale: 1 - index * 0.008,
            rotateX: index % 2 === 0 ? 0.35 : -0.35,
            transformOrigin: "50% 0%",
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start:
                `top top+=${170 + index * 20}`,
              end:
                `bottom top+=${220 + index * 20}`,
              scrub: 0.55,
              invalidateOnRefresh: true
            }
          });

          tweens.push(tween);
        });

        return () => {
          tweens.forEach((tween) => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
        };
      }
    );
  }

  /* =======================================================
     PHOTO PARALLAX
     ======================================================= */

  function initServiceParallax() {
    const gsap = getGSAP();
    const ScrollTrigger = getScrollTrigger();

    if (!gsap || !ScrollTrigger) {
      return;
    }

    registerScrollTrigger();

    if (STATE.parallaxMatchMedia) {
      STATE.parallaxMatchMedia.revert();
    }

    STATE.parallaxMatchMedia = gsap.matchMedia();

    STATE.parallaxMatchMedia.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const tweens = [];

        document
          .querySelectorAll(SELECTORS.parallax)
          .forEach((image) => {
            if (image.hasAttribute("data-aos")) {
              return;
            }

            const frame =
              image.closest(".vpn-service-parallax-frame") ||
              image.parentElement;

            if (!frame) {
              return;
            }

            const tween = gsap.fromTo(
              image,
              {
                yPercent: -4
              },
              {
                yPercent: 4,
                ease: "none",
                scrollTrigger: {
                  trigger: frame,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.75,
                  invalidateOnRefresh: true
                }
              }
            );

            tweens.push(tween);
          });

        return () => {
          tweens.forEach((tween) => {
            tween.scrollTrigger?.kill();
            tween.kill();
          });
        };
      }
    );
  }

  /* =======================================================
     SMALL 3D POINTER TILT
     ======================================================= */

  function initSubtleTilt() {
    if (
      prefersReducedMotion() ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) {
      return;
    }

    const gsap = getGSAP();

    if (!gsap) {
      return;
    }

    const cards = document.querySelectorAll(
      [
        ".vpn-service-plan-match-card",
        ".vpn-service-billing-card",
        ".vpn-service-region-card",
        ".vpn-service-server-card",
        ".vpn-service-trial-included-card",
        ".vpn-service-requirement-card"
      ].join(",")
    );

    cards.forEach((card) => {
      if (card.dataset.vpnTiltInitialised === "true") {
        return;
      }

      card.dataset.vpnTiltInitialised = "true";

      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();

        const x =
          (event.clientX - rect.left) / rect.width - 0.5;

        const y =
          (event.clientY - rect.top) / rect.height - 0.5;

        gsap.to(card, {
          rotateY: x * 1.4,
          rotateX: y * -1.2,
          duration: 0.25,
          ease: "power2.out",
          transformPerspective: 900
        });
      });

      card.addEventListener("pointerleave", () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.36,
          ease: "power2.out"
        });
      });
    });
  }

  /* =======================================================
     FORM PAGE HELPERS
     ======================================================= */

  function initTrialFormPlanBinding() {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get("plan");

    if (!plan) {
      return;
    }

    document
      .querySelectorAll("[data-vpn-plan-field]")
      .forEach((field) => {
        if ("value" in field) {
          field.value = plan;
        }
      });
  }

  /* =======================================================
     AOS / SCROLLTRIGGER REFRESH
     ======================================================= */

  function refreshSystems() {
    if (
      window.VPNCommon &&
      typeof window.VPNCommon.refreshAOS === "function"
    ) {
      window.VPNCommon.refreshAOS();
    }

    const ScrollTrigger = getScrollTrigger();

    if (
      ScrollTrigger &&
      typeof ScrollTrigger.refresh === "function"
    ) {
      ScrollTrigger.refresh();
    }
  }

  /* =======================================================
     INITIALISATION
     ======================================================= */

  function initialiseServicePage() {
    if (
      STATE.initialised ||
      !document.body.classList.contains("page-service")
    ) {
      return;
    }

    STATE.initialised = true;

    registerScrollTrigger();

    renderServicePricing();
    renderServiceReviews();
    renderRegionSwiper();
    renderDeviceSwiper();
    renderServiceFaq();

    if (
      window.VPNCommon &&
      typeof window.VPNCommon.applyConfigBindings === "function"
    ) {
      window.VPNCommon.applyConfigBindings(document);
    }

    initServiceHero();

    initPlanMatcher();
    initProcess();
    initStreamingSelector();

    initRegionCategories();
    initRegionExplorer();

    initPricingSwiper();
    initServiceSwipers();

    if (
      window.VPNCommon &&
      typeof window.VPNCommon.initTabs === "function"
    ) {
      window.VPNCommon.initTabs(document);
    }

    if (
      window.VPNCommon &&
      typeof window.VPNCommon.initAccordions === "function"
    ) {
      window.VPNCommon.initAccordions(document);
    }

    if (
      window.VPNCommon &&
      typeof window.VPNCommon.initForms === "function"
    ) {
      window.VPNCommon.initForms(document);
    }

    initServiceTabAnimations();
    initStickyLayers();
    initServiceParallax();
    initSubtleTilt();
    initTrialFormPlanBinding();

    window.requestAnimationFrame(() => {
      refreshSystems();
    });

    document.dispatchEvent(
      new CustomEvent("vpn:services-ready", {
        detail: {
          service: document.body.getAttribute("data-service") || ""
        }
      })
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseServicePage,
      {
        once: true
      }
    );
  } else {
    initialiseServicePage();
  }

  window.addEventListener(
    "load",
    () => {
      refreshSystems();
    },
    {
      once: true
    }
  );
})();

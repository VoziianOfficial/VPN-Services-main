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
    heroParticle: "[data-vpn-hero-particle]",
    globeFrame: ".vpn-hero__globe-frame",
    globeDraw: "[data-vpn-globe-draw]",

    contactForm: "[data-vpn-contact-form]",
    inquiryRoot: "[data-vpn-contact-inquiry]",
    inquiryChips: "[data-vpn-contact-inquiry-chips]",
    inquiryChip: "[data-vpn-contact-inquiry-chip]",
    inquiryInput: "[data-vpn-contact-inquiry-input]",

    projectGoalsSelect: "[data-vpn-project-goals-select]",
    budgetRangesSelect: "[data-vpn-budget-ranges-select]",

    planInput: "[data-vpn-contact-plan-input]",
    topicInput: "[data-vpn-contact-topic-input]",

    faqMount: "[data-vpn-contact-faq-render]",

    parallax: "[data-vpn-contact-parallax]",

    collaborationCard: ".vpn-contact-work-card",
    detailCard: ".vpn-contact-detail"
  };

  const STATE = {
    initialised: false,
    heroTimeline: null,
    parallaxMatchMedia: null,
    tiltElements: []
  };

  const REDUCED_MOTION_QUERY =
    "(prefers-reduced-motion: reduce)";

  /* =======================================================
     HELPERS
     ======================================================= */

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
    return String(value ?? "").replace(
      /[&<>"']/g,
      (character) => {
        const entities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          "\"": "&quot;",
          "'": "&#039;"
        };

        return entities[character];
      }
    );
  }

  function normalise(value) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function slugify(value) {
    return normalise(value)
      .replace(/\s+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

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
     HERO
     ======================================================= */

  function splitHeroTitle(title) {
    if (!title) {
      return [];
    }

    if (title.dataset.vpnSplit === "true") {
      return Array.from(
        title.querySelectorAll(
          ".vpn-hero__title-word"
        )
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

    text.split(" ").forEach(
      (word, index, words) => {
        const span = document.createElement("span");

        span.className =
          "vpn-hero__title-word";

        span.textContent = word;

        line.appendChild(span);

        if (index < words.length - 1) {
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

  function getHeroDrawables(hero) {
    if (!hero) {
      return [];
    }

    const explicit = Array.from(
      hero.querySelectorAll(
        SELECTORS.globeDraw
      )
    );

    if (explicit.length) {
      return explicit;
    }

    const frame = hero.querySelector(
      SELECTORS.globeFrame
    );

    if (!frame) {
      return [];
    }

    return Array.from(
      frame.querySelectorAll(
        "path, circle, ellipse, line"
      )
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

    if (
      !Number.isFinite(length) ||
      length <= 0
    ) {
      return false;
    }

    element.style.strokeDasharray =
      String(length);

    element.style.strokeDashoffset =
      String(length);

    return true;
  }

  function resetDrawable(element) {
    element.style.strokeDasharray = "";
    element.style.strokeDashoffset = "";
  }

  function resetHeroInlineStyles(hero) {
    if (!hero) {
      return;
    }

    const elements = [
      hero.querySelector(
        SELECTORS.heroEyebrow
      ),
      ...hero.querySelectorAll(
        ".vpn-hero__title-word"
      ),
      hero.querySelector(
        SELECTORS.heroText
      ),
      hero.querySelector(
        SELECTORS.heroActions
      ),
      hero.querySelector(
        SELECTORS.heroMeta
      ),
      hero.querySelector(
        SELECTORS.heroGlobe
      ),
      ...hero.querySelectorAll(
        SELECTORS.heroGlobeChip
      ),
      ...hero.querySelectorAll(
        SELECTORS.heroParticle
      )
    ].filter(Boolean);

    elements.forEach((element) => {
      element.removeAttribute("style");
    });

    getHeroDrawables(hero).forEach(
      resetDrawable
    );
  }

  function initContactHero() {
    const hero = document.querySelector(
      SELECTORS.hero
    );

    if (!hero) {
      return;
    }

    const title = hero.querySelector(
      SELECTORS.heroTitle
    );

    const eyebrow = hero.querySelector(
      SELECTORS.heroEyebrow
    );

    const text = hero.querySelector(
      SELECTORS.heroText
    );

    const actions = hero.querySelector(
      SELECTORS.heroActions
    );

    const meta = hero.querySelector(
      SELECTORS.heroMeta
    );

    const globe = hero.querySelector(
      SELECTORS.heroGlobe
    );

    const chips = Array.from(
      hero.querySelectorAll(
        SELECTORS.heroGlobeChip
      )
    );

    const particles = Array.from(
      hero.querySelectorAll(
        SELECTORS.heroParticle
      )
    );

    const words = splitHeroTitle(title);
    const drawables =
      getHeroDrawables(hero);

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
      typeof STATE.heroTimeline.kill ===
        "function"
    ) {
      STATE.heroTimeline.kill();
    }

    const drawableElements =
      drawables.filter(prepareDrawable);

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

    if (particles.length) {
      gsap.set(particles, {
        opacity: 0
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
        0.04
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
        0.13
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
        0.45
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
        0.57
      );
    }

    if (meta) {
      timeline.to(
        meta,
        {
          opacity: 1,
          y: 0,
          duration: 0.5
        },
        0.68
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
          duration: 1.3,
          stagger: 0.045,
          ease: "power2.inOut"
        },
        0.31
      );
    }

    if (chips.length) {
      timeline.to(
        chips,
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.09
        },
        0.7
      );
    }

    if (particles.length) {
      timeline.to(
        particles,
        {
          opacity: 1,
          duration: 0.4,
          stagger: 0.05
        },
        0.72
      );

      particles.forEach(
        (particle, index) => {
          gsap.to(particle, {
            x:
              index % 2 === 0
                ? 5
                : -5,
            y:
              index % 3 === 0
                ? -5
                : 5,
            duration:
              2.8 + index * 0.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: 1 + index * 0.08
          });
        }
      );
    }
  }

  /* =======================================================
     INQUIRY TYPE CHIPS
     ======================================================= */

  function renderInquiryChips() {
    document
      .querySelectorAll(
        SELECTORS.inquiryChips
      )
      .forEach((mount) => {
        if (mount.children.length) {
          return;
        }

        const inquiryTypes =
          getConfigValue(
            "forms.inquiryTypes",
            []
          );

        if (
          !Array.isArray(inquiryTypes) ||
          !inquiryTypes.length
        ) {
          return;
        }

        mount.innerHTML = inquiryTypes
          .map((type, index) => {
            return `
              <button
                class="vpn-contact-inquiry__chip"
                type="button"
                aria-pressed="${
                  index === 0
                    ? "true"
                    : "false"
                }"
                data-inquiry-value="${escapeHtml(
                  type
                )}"
                data-vpn-contact-inquiry-chip
              >
                ${escapeHtml(type)}
              </button>
            `;
          })
          .join("");
      });
  }

  function findInquiryChipByValue(
    chips,
    value
  ) {
    const query = normalise(value);

    if (!query) {
      return null;
    }

    const direct = chips.find(
      (chip) =>
        normalise(
          chip.getAttribute(
            "data-inquiry-value"
          )
        ) === query
    );

    if (direct) {
      return direct;
    }

    const aliases = {
      plan: [
        "plan",
        "pricing",
        "subscription"
      ],
      pricing: [
        "plan",
        "pricing",
        "subscription"
      ],
      business: [
        "business",
        "business vpn",
        "company"
      ],
      advertising: [
        "advertising",
        "advertise",
        "advertisement"
      ],
      advertise: [
        "advertising",
        "advertise"
      ],
      partnership: [
        "partnership",
        "partner",
        "collaboration"
      ],
      partner: [
        "partnership",
        "partner",
        "collaboration"
      ],
      media: [
        "media",
        "press"
      ],
      press: [
        "media",
        "press"
      ],
      technical: [
        "technical",
        "support",
        "app"
      ],
      support: [
        "technical",
        "support"
      ],
      trial: [
        "trial",
        "free trial"
      ],
      general: [
        "general",
        "question"
      ]
    };

    const candidates =
      aliases[query] || [query];

    return (
      chips.find((chip) => {
        const valueText = normalise(
          chip.getAttribute(
            "data-inquiry-value"
          )
        );

        return candidates.some(
          (candidate) =>
            valueText.includes(
              normalise(candidate)
            )
        );
      }) || null
    );
  }

  function initInquiryChips() {
    document
      .querySelectorAll(
        SELECTORS.inquiryRoot
      )
      .forEach((root) => {
        const chips = Array.from(
          root.querySelectorAll(
            SELECTORS.inquiryChip
          )
        );

        const input = root.querySelector(
          SELECTORS.inquiryInput
        );

        if (!chips.length || !input) {
          return;
        }

        function selectChip(
          selectedChip,
          moveFocus = false
        ) {
          if (!selectedChip) {
            return;
          }

          const value =
            selectedChip.getAttribute(
              "data-inquiry-value"
            ) || "";

          chips.forEach((chip) => {
            const active =
              chip === selectedChip;

            chip.setAttribute(
              "aria-pressed",
              active
                ? "true"
                : "false"
            );
          });

          input.value = value;

          input.dispatchEvent(
            new Event("change", {
              bubbles: true
            })
          );

          if (moveFocus) {
            selectedChip.focus();
          }
        }

        chips.forEach(
          (chip, index) => {
            chip.addEventListener(
              "click",
              () => {
                selectChip(
                  chip,
                  false
                );
              }
            );

            chip.addEventListener(
              "keydown",
              (event) => {
                if (
                  event.key !==
                    "ArrowRight" &&
                  event.key !==
                    "ArrowLeft" &&
                  event.key !==
                    "Home" &&
                  event.key !==
                    "End"
                ) {
                  return;
                }

                event.preventDefault();

                let targetIndex = index;

                if (
                  event.key ===
                  "ArrowRight"
                ) {
                  targetIndex =
                    (index + 1) %
                    chips.length;
                }

                if (
                  event.key ===
                  "ArrowLeft"
                ) {
                  targetIndex =
                    (index -
                      1 +
                      chips.length) %
                    chips.length;
                }

                if (
                  event.key ===
                  "Home"
                ) {
                  targetIndex = 0;
                }

                if (
                  event.key ===
                  "End"
                ) {
                  targetIndex =
                    chips.length - 1;
                }

                selectChip(
                  chips[targetIndex],
                  true
                );
              }
            );
          }
        );

        const params =
          new URLSearchParams(
            window.location.search
          );

        const requestedInquiry =
          params.get("inquiry") ||
          params.get("type");

        const requestedChip =
          findInquiryChipByValue(
            chips,
            requestedInquiry
          );

        const preselected =
          chips.find(
            (chip) =>
              chip.getAttribute(
                "aria-pressed"
              ) === "true"
          );

        selectChip(
          requestedChip ||
            preselected ||
            chips[0],
          false
        );
      });
  }

  /* =======================================================
     SELECT OPTIONS FROM CONFIG
     ======================================================= */

  function populateSelect(
    selector,
    configPath
  ) {
    document
      .querySelectorAll(selector)
      .forEach((select) => {
        if (
          select.dataset
            .vpnOptionsInitialised ===
          "true"
        ) {
          return;
        }

        const values =
          getConfigValue(
            configPath,
            []
          );

        if (
          !Array.isArray(values) ||
          !values.length
        ) {
          return;
        }

        const placeholder =
          select.querySelector(
            'option[value=""]'
          );

        select
          .querySelectorAll(
            "option:not([value=''])"
          )
          .forEach((option) => {
            option.remove();
          });

        values.forEach((value) => {
          const option =
            document.createElement(
              "option"
            );

          option.value = value;
          option.textContent = value;

          select.appendChild(option);
        });

        if (placeholder) {
          select.insertBefore(
            placeholder,
            select.firstChild
          );
        }

        select.dataset
          .vpnOptionsInitialised =
          "true";
      });
  }

  function renderConfigFormOptions() {
    populateSelect(
      SELECTORS.projectGoalsSelect,
      "forms.projectGoals"
    );

    populateSelect(
      SELECTORS.budgetRangesSelect,
      "forms.budgetRanges"
    );
  }

  /* =======================================================
     QUERY PARAMETER FORM BINDING
     ======================================================= */

  function bindContactQueryParameters() {
    const params =
      new URLSearchParams(
        window.location.search
      );

    const plan =
      params.get("plan");

    const topic =
      params.get("topic");

    if (plan) {
      document
        .querySelectorAll(
          SELECTORS.planInput
        )
        .forEach((input) => {
          input.value = plan;
        });
    }

    if (topic) {
      document
        .querySelectorAll(
          SELECTORS.topicInput
        )
        .forEach((input) => {
          input.value = topic;
        });
    }

    const hash =
      window.location.hash;

    if (
      hash === "#contact-form" ||
      hash === "#collaborate"
    ) {
      window.requestAnimationFrame(
        () => {
          const target =
            document.querySelector(
              hash
            );

          if (!target) {
            return;
          }

          target.scrollIntoView({
            behavior:
              prefersReducedMotion()
                ? "auto"
                : "smooth",
            block: "start"
          });
        }
      );
    }
  }

  /* =======================================================
     CONTACT FAQ
     ======================================================= */

  function renderContactFaq() {
    const mount =
      document.querySelector(
        SELECTORS.faqMount
      );

    if (
      !mount ||
      mount.children.length
    ) {
      return;
    }

    const items =
      getConfigValue(
        "faq.contact",
        []
      );

    if (
      !Array.isArray(items) ||
      !items.length
    ) {
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
                  aria-expanded="${
                    index === 0
                      ? "true"
                      : "false"
                  }"
                  data-vpn-accordion-trigger
                >
                  <span class="vpn-accordion__question">
                    ${escapeHtml(
                      item.question ||
                        ""
                    )}
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
                      ${escapeHtml(
                        item.answer ||
                          ""
                      )}
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
      typeof window.VPNCommon
        .initAccordions ===
        "function"
    ) {
      window.VPNCommon.initAccordions(
        mount
      );
    }
  }

  /* =======================================================
     PARALLAX
     ======================================================= */

  function initContactParallax() {
    const gsap = getGSAP();
    const ScrollTrigger =
      getScrollTrigger();

    if (!gsap || !ScrollTrigger) {
      return;
    }

    registerScrollTrigger();

    if (
      STATE.parallaxMatchMedia
    ) {
      STATE.parallaxMatchMedia.revert();
    }

    STATE.parallaxMatchMedia =
      gsap.matchMedia();

    STATE.parallaxMatchMedia.add(
      "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
      () => {
        const tweens = [];

        document
          .querySelectorAll(
            SELECTORS.parallax
          )
          .forEach((image) => {
            if (
              image.hasAttribute(
                "data-aos"
              )
            ) {
              return;
            }

            const frame =
              image.closest(
                ".vpn-contact-parallax-frame"
              ) ||
              image.parentElement;

            if (!frame) {
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
                    trigger: frame,
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

            tweens.push(tween);
          });

        return () => {
          tweens.forEach(
            (tween) => {
              tween.scrollTrigger?.kill();
              tween.kill();
            }
          );
        };
      }
    );
  }

  /* =======================================================
     COLLABORATION CARD MICROINTERACTION
     ======================================================= */

  function initSubtleTilt() {
    if (
      prefersReducedMotion() ||
      !window
        .matchMedia(
          "(hover: hover) and (pointer: fine)"
        )
        .matches
    ) {
      return;
    }

    const gsap = getGSAP();

    if (!gsap) {
      return;
    }

    const elements =
      document.querySelectorAll(
        [
          SELECTORS.collaborationCard,
          SELECTORS.detailCard
        ].join(",")
      );

    elements.forEach((element) => {
      if (
        element.dataset
          .vpnContactTilt ===
        "true"
      ) {
        return;
      }

      element.dataset
        .vpnContactTilt =
        "true";

      STATE.tiltElements.push(
        element
      );

      element.addEventListener(
        "pointermove",
        (event) => {
          const rect =
            element.getBoundingClientRect();

          const x =
            (event.clientX -
              rect.left) /
              rect.width -
            0.5;

          const y =
            (event.clientY -
              rect.top) /
              rect.height -
            0.5;

          gsap.to(element, {
            rotateY: x * 1.35,
            rotateX: y * -1.1,
            y: -2,
            duration: 0.25,
            ease: "power2.out",
            transformPerspective: 900,
            transformOrigin:
              "50% 50%"
          });
        }
      );

      element.addEventListener(
        "pointerleave",
        () => {
          gsap.to(element, {
            rotateX: 0,
            rotateY: 0,
            y: 0,
            duration: 0.36,
            ease: "power2.out"
          });
        }
      );
    });
  }

  /* =======================================================
     COLLABORATION LINKS -> FORM
     ======================================================= */

  function initCollaborationActions() {
    document
      .querySelectorAll(
        "[data-vpn-collaboration-action]"
      )
      .forEach((link) => {
        link.addEventListener(
          "click",
          () => {
            const inquiry =
              link.getAttribute(
                "data-collaboration-inquiry"
              );

            if (!inquiry) {
              return;
            }

            const root =
              document.querySelector(
                SELECTORS.inquiryRoot
              );

            if (!root) {
              return;
            }

            const chips = Array.from(
              root.querySelectorAll(
                SELECTORS.inquiryChip
              )
            );

            const target =
              findInquiryChipByValue(
                chips,
                inquiry
              );

            if (target) {
              target.click();
            }
          }
        );
      });
  }

  /* =======================================================
     FORM TYPE SAFETY
     ======================================================= */

  function ensureContactFormType() {
    document
      .querySelectorAll(
        SELECTORS.contactForm
      )
      .forEach((form) => {
        let input =
          form.querySelector(
            'input[name="formType"]'
          );

        if (!input) {
          input =
            document.createElement(
              "input"
            );

          input.type = "hidden";
          input.name = "formType";

          form.appendChild(input);
        }

        if (!input.value) {
          input.value = "contact";
        }

        if (
          !form.hasAttribute(
            "data-form-type"
          )
        ) {
          form.setAttribute(
            "data-form-type",
            "contact"
          );
        }
      });
  }

  /* =======================================================
     EXTERNAL MAILTO BINDING FALLBACK
     ======================================================= */

  function ensureCorporateEmailLinks() {
    const email =
      getConfigValue(
        "contact.corporateEmail",
        ""
      );

    if (!email) {
      return;
    }

    document
      .querySelectorAll(
        "[data-vpn-corporate-email]"
      )
      .forEach((element) => {
        element.textContent = email;

        if (
          element.tagName === "A"
        ) {
          element.setAttribute(
            "href",
            `mailto:${email}`
          );
        }
      });
  }

  /* =======================================================
     REDUCED MOTION CHANGE
     ======================================================= */

  function initReducedMotionListener() {
    const media =
      window.matchMedia(
        REDUCED_MOTION_QUERY
      );

    function handleChange() {
      const hero =
        document.querySelector(
          SELECTORS.hero
        );

      if (media.matches) {
        if (
          STATE.heroTimeline &&
          typeof STATE.heroTimeline
            .kill === "function"
        ) {
          STATE.heroTimeline.kill();
          STATE.heroTimeline = null;
        }

        if (
          STATE.parallaxMatchMedia
        ) {
          STATE.parallaxMatchMedia.revert();
          STATE.parallaxMatchMedia =
            null;
        }

        resetHeroInlineStyles(hero);

        STATE.tiltElements.forEach(
          (element) => {
            element.style.removeProperty(
              "transform"
            );
          }
        );

        refreshSystems();

        return;
      }

      initContactHero();
      initContactParallax();
      initSubtleTilt();

      refreshSystems();
    }

    if (
      typeof media.addEventListener ===
      "function"
    ) {
      media.addEventListener(
        "change",
        handleChange
      );
    } else if (
      typeof media.addListener ===
      "function"
    ) {
      media.addListener(
        handleChange
      );
    }
  }

  /* =======================================================
     INITIALISATION
     ======================================================= */

  function initialiseContactPage() {
    if (
      STATE.initialised ||
      !document.body.classList.contains(
        "page-contact"
      )
    ) {
      return;
    }

    STATE.initialised = true;

    registerScrollTrigger();

    renderInquiryChips();
    renderConfigFormOptions();
    renderContactFaq();

    if (
      window.VPNCommon &&
      typeof window.VPNCommon
        .applyConfigBindings ===
        "function"
    ) {
      window.VPNCommon.applyConfigBindings(
        document
      );
    }

    ensureCorporateEmailLinks();
    ensureContactFormType();

    initInquiryChips();
    bindContactQueryParameters();
    initCollaborationActions();

    if (
      window.VPNCommon &&
      typeof window.VPNCommon
        .initForms === "function"
    ) {
      window.VPNCommon.initForms(
        document
      );
    }

    if (
      window.VPNCommon &&
      typeof window.VPNCommon
        .initAccordions ===
        "function"
    ) {
      window.VPNCommon.initAccordions(
        document
      );
    }

    initContactHero();
    initContactParallax();
    initSubtleTilt();
    initReducedMotionListener();

    window.requestAnimationFrame(
      () => {
        refreshSystems();
      }
    );

    document.dispatchEvent(
      new CustomEvent(
        "vpn:contact-ready"
      )
    );
  }

  if (
    document.readyState === "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseContactPage,
      {
        once: true
      }
    );
  } else {
    initialiseContactPage();
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

  window.VPNContact = {
    initialise:
      initialiseContactPage,
    renderInquiryChips,
    renderContactFaq,
    bindContactQueryParameters
  };
})();

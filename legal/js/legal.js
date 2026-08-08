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

    document: "[data-vpn-legal-document]",
    content: "[data-vpn-legal-content]",
    section: "[data-vpn-legal-section]",

    desktopNav: "[data-vpn-legal-nav]",
    mobileSelect: "[data-vpn-legal-mobile-select]",

    progressBar: "[data-vpn-legal-progress-bar]",
    progressValue: "[data-vpn-legal-progress-value]",

    relatedMount: "[data-vpn-legal-related-render]",

    version: "[data-vpn-legal-version]",
    lastUpdated: "[data-vpn-legal-updated]",

    backTop: "[data-vpn-legal-back-top]"
  };

  const STATE = {
    initialised: false,
    heroTimeline: null,
    sectionObserver: null,
    resizeObserver: null,
    scrollFrame: null,
    sections: [],
    navLinks: [],
    currentSectionId: ""
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
      return window.VPNCommon.getConfigValue(
        path,
        fallback
      );
    }

    if (
      !path ||
      typeof path !== "string"
    ) {
      return fallback;
    }

    const value = path
      .split(".")
      .reduce((current, key) => {
        if (
          current !== null &&
          typeof current === "object" &&
          Object.prototype.hasOwnProperty.call(
            current,
            key
          )
        ) {
          return current[key];
        }

        return undefined;
      }, CONFIG);

    return value === undefined ||
      value === null
      ? fallback
      : value;
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

  function prefersReducedMotion() {
    return window.matchMedia(
      REDUCED_MOTION_QUERY
    ).matches;
  }

  function getGSAP() {
    return window.gsap || null;
  }

  function getHeaderOffset() {
    const rootStyles =
      window.getComputedStyle(
        document.documentElement
      );

    const variable =
      rootStyles.getPropertyValue(
        "--header-total-height"
      );

    const parsed =
      Number.parseFloat(variable);

    if (
      Number.isFinite(parsed) &&
      parsed > 0
    ) {
      return parsed;
    }

    const header =
      document.querySelector(
        ".vpn-header"
      );

    return header
      ? header.getBoundingClientRect()
          .height
      : 0;
  }

  function getCurrentFileName() {
    const path =
      window.location.pathname;

    const file =
      path.split("/").pop();

    return file || "index.html";
  }

  function getLegalPageType() {
    return (
      document.body.getAttribute(
        "data-legal"
      ) || ""
    );
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

  function getSectionLabel(section) {
    const explicit =
      section.getAttribute(
        "data-nav-label"
      );

    if (explicit) {
      return explicit.trim();
    }

    const heading =
      section.querySelector(
        ".vpn-legal-section__title"
      );

    if (heading) {
      return heading.textContent
        .replace(/\s+/g, " ")
        .trim();
    }

    return section.id || "Section";
  }

  function formatIndex(index) {
    return String(index + 1)
      .padStart(2, "0");
  }

  /* =======================================================
     HERO
     ======================================================= */

  function splitHeroTitle(title) {
    if (!title) {
      return [];
    }

    if (
      title.dataset.vpnSplit ===
      "true"
    ) {
      return Array.from(
        title.querySelectorAll(
          ".vpn-hero__title-word"
        )
      );
    }

    const text =
      title.textContent
        .replace(/\s+/g, " ")
        .trim();

    if (!text) {
      return [];
    }

    title.dataset.vpnSplit = "true";

    title.setAttribute(
      "aria-label",
      text
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

    text
      .split(" ")
      .forEach(
        (word, index, words) => {
          const span =
            document.createElement(
              "span"
            );

          span.className =
            "vpn-hero__title-word";

          span.textContent = word;

          line.appendChild(span);

          if (
            index <
            words.length - 1
          ) {
            line.appendChild(
              document.createTextNode(
                " "
              )
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

    const explicit =
      Array.from(
        hero.querySelectorAll(
          SELECTORS.globeDraw
        )
      );

    if (explicit.length) {
      return explicit;
    }

    const frame =
      hero.querySelector(
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
      String(length);

    element.style.strokeDashoffset =
      String(length);

    return true;
  }

  function resetDrawable(element) {
    element.style.strokeDasharray = "";
    element.style.strokeDashoffset = "";
  }

  function resetHeroStyles(hero) {
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

    elements.forEach(
      (element) => {
        element.removeAttribute(
          "style"
        );
      }
    );

    getHeroDrawables(hero).forEach(
      resetDrawable
    );
  }

  function initLegalHero() {
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

    const chips =
      Array.from(
        hero.querySelectorAll(
          SELECTORS.heroGlobeChip
        )
      );

    const particles =
      Array.from(
        hero.querySelectorAll(
          SELECTORS.heroParticle
        )
      );

    const words =
      splitHeroTitle(title);

    const drawables =
      getHeroDrawables(hero);

    if (prefersReducedMotion()) {
      drawables.forEach(
        resetDrawable
      );

      return;
    }

    const gsap = getGSAP();

    if (!gsap) {
      drawables.forEach(
        resetDrawable
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

    const drawableElements =
      drawables.filter(
        prepareDrawable
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

    const timeline =
      gsap.timeline({
        defaults: {
          ease: "power3.out"
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
          duration: 0.48
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
          stagger: 0.045
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
          duration: 0.6
        },
        0.44
      );
    }

    if (actions) {
      timeline.to(
        actions,
        {
          opacity: 1,
          y: 0,
          duration: 0.56
        },
        0.56
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
        0.67
      );
    }

    if (globe) {
      timeline.to(
        globe,
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          duration: 0.92
        },
        0.18
      );
    }

    if (
      drawableElements.length
    ) {
      timeline.to(
        drawableElements,
        {
          strokeDashoffset: 0,
          duration: 1.28,
          stagger: 0.04,
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
        0.69
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
        0.71
      );

      particles.forEach(
        (particle, index) => {
          gsap.to(particle, {
            x:
              index % 2 === 0
                ? 4
                : -4,
            y:
              index % 3 === 0
                ? -4
                : 4,
            duration:
              2.8 +
              index * 0.2,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay:
              1 +
              index * 0.08
          });
        }
      );
    }
  }

  /* =======================================================
     CONFIG META
     ======================================================= */

  function bindLegalMeta() {
    const version =
      getConfigValue(
        "legal.legalVersion",
        getConfigValue(
          "legal.version",
          ""
        )
      );

    const lastUpdated =
      getConfigValue(
        "legal.lastUpdated",
        ""
      );

    document
      .querySelectorAll(
        SELECTORS.version
      )
      .forEach((element) => {
        if (version) {
          element.textContent =
            version;
        }
      });

    document
      .querySelectorAll(
        SELECTORS.lastUpdated
      )
      .forEach((element) => {
        if (lastUpdated) {
          element.textContent =
            lastUpdated;
        }
      });
  }

  /* =======================================================
     TABLE OF CONTENTS
     ======================================================= */

  function collectSections() {
    STATE.sections =
      Array.from(
        document.querySelectorAll(
          SELECTORS.section
        )
      ).filter(
        (section) => section.id
      );

    return STATE.sections;
  }

  function renderDesktopNavigation() {
    const mount =
      document.querySelector(
        SELECTORS.desktopNav
      );

    if (!mount) {
      return;
    }

    const sections =
      STATE.sections.length
        ? STATE.sections
        : collectSections();

    mount.innerHTML =
      sections
        .map(
          (section, index) => {
            return `
              <a
                class="vpn-legal-page__nav-link"
                href="#${escapeHtml(
                  section.id
                )}"
                data-vpn-legal-nav-link="${escapeHtml(
                  section.id
                )}"
              >
                <span class="vpn-legal-page__nav-link-index">
                  ${formatIndex(
                    index
                  )}
                </span>

                <span>
                  ${escapeHtml(
                    getSectionLabel(
                      section
                    )
                  )}
                </span>
              </a>
            `;
          }
        )
        .join("");

    STATE.navLinks =
      Array.from(
        mount.querySelectorAll(
          "[data-vpn-legal-nav-link]"
        )
      );
  }

  function renderMobileNavigation() {
    const select =
      document.querySelector(
        SELECTORS.mobileSelect
      );

    if (!select) {
      return;
    }

    const sections =
      STATE.sections.length
        ? STATE.sections
        : collectSections();

    select.innerHTML =
      sections
        .map(
          (section, index) => {
            return `
              <option
                value="${escapeHtml(
                  section.id
                )}"
              >
                ${formatIndex(
                  index
                )} — ${escapeHtml(
                  getSectionLabel(
                    section
                  )
                )}
              </option>
            `;
          }
        )
        .join("");
  }

  function setActiveSection(
    sectionId,
    updateSelect = true
  ) {
    if (!sectionId) {
      return;
    }

    STATE.currentSectionId =
      sectionId;

    STATE.sections.forEach(
      (section) => {
        section.setAttribute(
          "data-active",
          section.id === sectionId
            ? "true"
            : "false"
        );
      }
    );

    STATE.navLinks.forEach(
      (link) => {
        const active =
          link.getAttribute(
            "data-vpn-legal-nav-link"
          ) === sectionId;

        if (active) {
          link.setAttribute(
            "aria-current",
            "true"
          );
        } else {
          link.removeAttribute(
            "aria-current"
          );
        }
      }
    );

    if (updateSelect) {
      const select =
        document.querySelector(
          SELECTORS.mobileSelect
        );

      if (
        select &&
        select.value !==
          sectionId
      ) {
        select.value =
          sectionId;
      }
    }
  }

  function scrollToSection(
    sectionId,
    updateHistory = true
  ) {
    const section =
      document.getElementById(
        sectionId
      );

    if (!section) {
      return;
    }

    setActiveSection(
      sectionId
    );

    section.scrollIntoView({
      behavior:
        prefersReducedMotion()
          ? "auto"
          : "smooth",
      block: "start"
    });

    if (
      updateHistory &&
      window.history &&
      typeof window.history
        .replaceState ===
        "function"
    ) {
      window.history.replaceState(
        null,
        "",
        `#${sectionId}`
      );
    }
  }

  function initNavigationEvents() {
    const nav =
      document.querySelector(
        SELECTORS.desktopNav
      );

    if (nav) {
      nav.addEventListener(
        "click",
        (event) => {
          const link =
            event.target.closest(
              "[data-vpn-legal-nav-link]"
            );

          if (!link) {
            return;
          }

          const sectionId =
            link.getAttribute(
              "data-vpn-legal-nav-link"
            );

          if (!sectionId) {
            return;
          }

          event.preventDefault();

          scrollToSection(
            sectionId
          );
        }
      );
    }

    const select =
      document.querySelector(
        SELECTORS.mobileSelect
      );

    if (select) {
      select.addEventListener(
        "change",
        () => {
          if (!select.value) {
            return;
          }

          scrollToSection(
            select.value
          );
        }
      );
    }
  }

  /* =======================================================
     ACTIVE SECTION OBSERVER
     ======================================================= */

  function destroySectionObserver() {
    if (
      STATE.sectionObserver
    ) {
      STATE.sectionObserver.disconnect();
      STATE.sectionObserver = null;
    }
  }

  function initSectionObserver() {
    destroySectionObserver();

    if (!STATE.sections.length) {
      return;
    }

    if (
      !("IntersectionObserver" in window)
    ) {
      setActiveSection(
        STATE.sections[0].id
      );

      return;
    }

    const headerOffset =
      Math.round(
        getHeaderOffset()
      );

    STATE.sectionObserver =
      new IntersectionObserver(
        (entries) => {
          const visible =
            entries
              .filter(
                (entry) =>
                  entry.isIntersecting
              )
              .sort((a, b) => {
                return (
                  Math.abs(
                    a.boundingClientRect
                      .top -
                      headerOffset
                  ) -
                  Math.abs(
                    b.boundingClientRect
                      .top -
                      headerOffset
                  )
                );
              });

          if (!visible.length) {
            return;
          }

          const section =
            visible[0].target;

          setActiveSection(
            section.id
          );
        },
        {
          root: null,
          rootMargin:
            `-${headerOffset + 18}px 0px -58% 0px`,
          threshold: [
            0,
            0.08,
            0.2,
            0.45
          ]
        }
      );

    STATE.sections.forEach(
      (section) => {
        STATE.sectionObserver.observe(
          section
        );
      }
    );
  }

  /* =======================================================
     READING PROGRESS
     ======================================================= */

  function clamp(
    value,
    minimum,
    maximum
  ) {
    return Math.min(
      maximum,
      Math.max(
        minimum,
        value
      )
    );
  }

  function updateReadingProgress() {
    STATE.scrollFrame = null;

    const content =
      document.querySelector(
        SELECTORS.content
      ) ||
      document.querySelector(
        SELECTORS.document
      );

    const bar =
      document.querySelector(
        SELECTORS.progressBar
      );

    const value =
      document.querySelector(
        SELECTORS.progressValue
      );

    if (
      !content ||
      !bar
    ) {
      return;
    }

    const rect =
      content.getBoundingClientRect();

    const absoluteTop =
      window.scrollY +
      rect.top;

    const headerOffset =
      getHeaderOffset();

    const start =
      absoluteTop -
      headerOffset -
      24;

    const end =
      absoluteTop +
      content.offsetHeight -
      window.innerHeight * 0.55;

    const distance =
      Math.max(
        1,
        end - start
      );

    const travelled =
      window.scrollY - start;

    const percentage =
      clamp(
        travelled /
          distance,
        0,
        1
      ) * 100;

    const rounded =
      Math.round(
        percentage
      );

    bar.style.setProperty(
      "--vpn-legal-progress",
      `${percentage}%`
    );

    if (value) {
      value.textContent =
        `${rounded}%`;
    }
  }

  function requestProgressUpdate() {
    if (
      STATE.scrollFrame !== null
    ) {
      return;
    }

    STATE.scrollFrame =
      window.requestAnimationFrame(
        updateReadingProgress
      );
  }

  /* =======================================================
     BACK TO TOP
     ======================================================= */

  function updateBackToTop() {
    const button =
      document.querySelector(
        SELECTORS.backTop
      );

    if (!button) {
      return;
    }

    const visible =
      window.scrollY >
      Math.max(
        520,
        window.innerHeight * 0.8
      );

    button.setAttribute(
      "data-visible",
      visible
        ? "true"
        : "false"
    );
  }

  function initBackToTop() {
    const button =
      document.querySelector(
        SELECTORS.backTop
      );

    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      () => {
        window.scrollTo({
          top: 0,
          behavior:
            prefersReducedMotion()
              ? "auto"
              : "smooth"
        });
      }
    );

    updateBackToTop();
  }

  /* =======================================================
     RELATED LEGAL DOCUMENTS
     ======================================================= */

  function normaliseLegalLink(
    link
  ) {
    if (
      !link ||
      typeof link !== "object"
    ) {
      return null;
    }

    const url =
      link.url ||
      link.href ||
      "";

    const title =
      link.title ||
      link.label ||
      "";

    if (!url || !title) {
      return null;
    }

    return {
      url: String(url),
      title: String(title),
      label:
        String(
          link.category ||
          link.eyebrow ||
          "Legal Document"
        )
    };
  }

  function renderRelatedLegalLinks() {
    document
      .querySelectorAll(
        SELECTORS.relatedMount
      )
      .forEach((mount) => {
        if (
          mount.children.length
        ) {
          return;
        }

        const links =
          getConfigValue(
            "legal.links",
            []
          );

        if (
          !Array.isArray(links)
        ) {
          return;
        }

        const currentFile =
          getCurrentFileName();

        const available =
          links
            .map(
              normaliseLegalLink
            )
            .filter(Boolean)
            .filter((link) => {
              const cleanUrl =
                link.url.split("#")[0]
                  .split("?")[0];

              return (
                cleanUrl !==
                currentFile
              );
            });

        mount.innerHTML =
          available
            .map((link) => {
              return `
                <a
                  class="vpn-legal-related-card"
                  href="${escapeHtml(
                    link.url
                  )}"
                >
                  <span class="vpn-legal-related-card__label">
                    ${escapeHtml(
                      link.label
                    )}
                  </span>

                  <span class="vpn-legal-related-card__bottom">
                    <strong class="vpn-legal-related-card__title">
                      ${escapeHtml(
                        link.title
                      )}
                    </strong>

                    <span
                      class="vpn-legal-related-card__arrow"
                      aria-hidden="true"
                    >
                      ${getArrowSvg()}
                    </span>
                  </span>
                </a>
              `;
            })
            .join("");
      });
  }

  /* =======================================================
     HASH HANDLING
     ======================================================= */

  function initInitialHash() {
    const hash =
      window.location.hash;

    if (!hash) {
      if (
        STATE.sections.length
      ) {
        setActiveSection(
          STATE.sections[0].id
        );
      }

      return;
    }

    let id = "";

    try {
      id =
        decodeURIComponent(
          hash.slice(1)
        );
    } catch (error) {
      id =
        hash.slice(1);
    }

    if (!id) {
      return;
    }

    const target =
      document.getElementById(id);

    if (
      target &&
      target.matches(
        SELECTORS.section
      )
    ) {
      setActiveSection(id);

      window.requestAnimationFrame(
        () => {
          target.scrollIntoView({
            behavior: "auto",
            block: "start"
          });
        }
      );
    }
  }

  function initHashChange() {
    window.addEventListener(
      "hashchange",
      () => {
        const id =
          window.location.hash
            .replace(/^#/, "");

        if (
          id &&
          document.getElementById(id)
        ) {
          setActiveSection(id);
        }
      }
    );
  }

  /* =======================================================
     KEYBOARD NAVIGATION
     ======================================================= */

  function initKeyboardShortcuts() {
    document.addEventListener(
      "keydown",
      (event) => {
        const activeElement =
          document.activeElement;

        const typing =
          activeElement &&
          (
            activeElement.tagName ===
              "INPUT" ||
            activeElement.tagName ===
              "TEXTAREA" ||
            activeElement.tagName ===
              "SELECT" ||
            activeElement
              .isContentEditable
          );

        if (typing) {
          return;
        }

        if (
          event.key === "Home" &&
          (event.ctrlKey ||
            event.metaKey)
        ) {
          event.preventDefault();

          window.scrollTo({
            top: 0,
            behavior:
              prefersReducedMotion()
                ? "auto"
                : "smooth"
          });
        }
      }
    );
  }

  /* =======================================================
     RESIZE
     ======================================================= */

  function handleResize() {
    initSectionObserver();
    requestProgressUpdate();
  }

  function initResizeHandling() {
    let resizeTimer = null;

    window.addEventListener(
      "resize",
      () => {
        window.clearTimeout(
          resizeTimer
        );

        resizeTimer =
          window.setTimeout(
            handleResize,
            140
          );
      },
      {
        passive: true
      }
    );

    const content =
      document.querySelector(
        SELECTORS.content
      );

    if (
      content &&
      "ResizeObserver" in window
    ) {
      STATE.resizeObserver =
        new ResizeObserver(() => {
          requestProgressUpdate();
        });

      STATE.resizeObserver.observe(
        content
      );
    }
  }

  /* =======================================================
     SCROLL EVENTS
     ======================================================= */

  function initScrollEvents() {
    window.addEventListener(
      "scroll",
      () => {
        requestProgressUpdate();
        updateBackToTop();
      },
      {
        passive: true
      }
    );
  }

  /* =======================================================
     REDUCED MOTION
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

      if (
        STATE.heroTimeline &&
        typeof STATE.heroTimeline
          .kill === "function"
      ) {
        STATE.heroTimeline.kill();

        STATE.heroTimeline =
          null;
      }

      resetHeroStyles(hero);

      if (!media.matches) {
        initLegalHero();
      }
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
     AOS REFRESH
     ======================================================= */

  function refreshAOS() {
    if (
      window.VPNCommon &&
      typeof window.VPNCommon.refreshAOS ===
        "function"
    ) {
      window.VPNCommon.refreshAOS();

      return;
    }

    if (
      window.AOS &&
      typeof window.AOS.refresh ===
        "function"
    ) {
      window.AOS.refresh();
    }
  }

  /* =======================================================
     INITIALISATION
     ======================================================= */

  function initialiseLegalPage() {
    if (
      STATE.initialised ||
      !document.body.classList.contains(
        "page-legal"
      )
    ) {
      return;
    }

    STATE.initialised = true;

    collectSections();

    renderDesktopNavigation();
    renderMobileNavigation();
    renderRelatedLegalLinks();

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

    bindLegalMeta();

    initNavigationEvents();
    initInitialHash();
    initHashChange();

    initSectionObserver();

    initBackToTop();
    initScrollEvents();
    initResizeHandling();
    initKeyboardShortcuts();

    initLegalHero();
    initReducedMotionListener();

    window.requestAnimationFrame(
      () => {
        updateReadingProgress();
        updateBackToTop();
        refreshAOS();
      }
    );

    document.dispatchEvent(
      new CustomEvent(
        "vpn:legal-ready",
        {
          detail: {
            legalType:
              getLegalPageType()
          }
        }
      )
    );
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseLegalPage,
      {
        once: true
      }
    );
  } else {
    initialiseLegalPage();
  }

  window.addEventListener(
    "load",
    () => {
      updateReadingProgress();
      refreshAOS();
    },
    {
      once: true
    }
  );

  window.VPNLegal = {
    initialise:
      initialiseLegalPage,
    collectSections,
    renderDesktopNavigation,
    renderMobileNavigation,
    renderRelatedLegalLinks,
    setActiveSection,
    scrollToSection,
    updateReadingProgress
  };
})();

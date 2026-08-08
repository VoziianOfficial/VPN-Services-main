(function () {
  "use strict";

  const CONFIG = window.SITE_CONFIG || {};

  const SELECTORS = {
    headerMount: "[data-vpn-header]",
    headerRoot: "[data-vpn-header-root]",
    footerMount: "[data-vpn-footer]",
    legalMount: "[data-vpn-legal]",
    menuToggle: "[data-vpn-menu-toggle]",
    mobileSearchToggle: "[data-vpn-mobile-search-toggle]",
    mobilePanel: "[data-vpn-mobile-panel]",
    mobileDropdownTrigger: "[data-vpn-mobile-dropdown-trigger]",
    mobileDropdown: "[data-vpn-mobile-dropdown]",
    desktopDropdown: "[data-vpn-dropdown]",
    desktopDropdownTrigger: "[data-vpn-dropdown-trigger]",
    search: "[data-vpn-search]",
    searchInput: "[data-vpn-search-input]",
    searchResults: "[data-vpn-search-results]",
    searchClear: "[data-vpn-search-clear]",
    legalNotice: "[data-vpn-legal-notice]",
    legalAccept: "[data-vpn-legal-accept]",
    form: "[data-vpn-form]",
    formField: "[data-vpn-field]",
    formError: "[data-vpn-field-error]",
    formSubmit: "[data-vpn-form-submit]",
    formStatus: "[data-vpn-form-status]",
    accordion: "[data-vpn-accordion]",
    accordionItem: "[data-vpn-accordion-item]",
    accordionTrigger: "[data-vpn-accordion-trigger]",
    accordionPanel: "[data-vpn-accordion-panel]",
    tabs: "[data-vpn-tabs]",
    tabList: "[data-vpn-tab-list]",
    tab: "[data-vpn-tab]",
    tabPanel: "[data-vpn-tab-panel]"
  };

  const ICONS = {
    search: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"></circle>
        <path d="M16.2 16.2 21 21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
      </svg>
    `,

    close: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 6 18 18M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
      </svg>
    `,

    menu: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7H20M4 12H20M4 17H20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
      </svg>
    `,

    arrow: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12H19M14 7 19 12 14 17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `,

    chevron: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 9 12 14 17 9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `,

    mail: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
        <path d="M4.5 7 12 13 19.5 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `,

    pin: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21S18 15.6 18 9.7A6 6 0 0 0 6 9.7C6 15.6 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
        <circle cx="12" cy="9.5" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
      </svg>
    `,

    shield: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 19 6V11C19 15.7 16.3 19 12 21 7.7 19 5 15.7 5 11V6L12 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
        <path d="m9 12 2 2 4-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    `,

    route: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="5" cy="18" r="2" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
        <circle cx="19" cy="6" r="2" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
        <path d="M7 18C12 18 9 8 14 8H17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2.5 3"></path>
      </svg>
    `,

    globe: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"></circle>
        <path d="M3.5 12H20.5M12 3C15 6.2 16 9.2 16 12S15 17.8 12 21M12 3C9 6.2 8 9.2 8 12S9 17.8 12 21" fill="none" stroke="currentColor" stroke-width="1.6"></path>
      </svg>
    `,

    play: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
        <path d="m10 9 5 3-5 3V9Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
      </svg>
    `,

    spark: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 13.8 8.2 19 10 13.8 11.8 12 17 10.2 11.8 5 10 10.2 8.2 12 3Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path>
        <path d="M18.5 15.5 19.3 17.7 21.5 18.5 19.3 19.3 18.5 21.5 17.7 19.3 15.5 18.5 17.7 17.7 18.5 15.5Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"></path>
      </svg>
    `,

    device: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="3" width="16" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"></rect>
        <path d="M8 20H16M12 15V20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
      </svg>
    `
  };

  const SERVICE_ICONS = [
    "shield",
    "route",
    "globe",
    "play",
    "spark",
    "device"
  ];

  let commonInitialised = false;
  let aosInitialised = false;
  let heroCodeBackgroundInitialised = false;

  function getConfigValue(path, fallback = "") {
    if (!path || typeof path !== "string") {
      return fallback;
    }

    const value = path.split(".").reduce((current, key) => {
      if (
        current !== null &&
        typeof current === "object" &&
        Object.prototype.hasOwnProperty.call(current, key)
      ) {
        return current[key];
      }

      return undefined;
    }, CONFIG);

    return value === undefined || value === null ? fallback : value;
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

  function normaliseText(value) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function getCurrentPageName() {
    const pathname = window.location.pathname || "";
    const segments = pathname.split("/").filter(Boolean);
    const fileName = segments[segments.length - 1] || "index.html";

    if (!fileName.includes(".")) {
      return "index.html";
    }

    return fileName;
  }

  function parseInternalUrl(url) {
    const raw = String(url || "");
    const hashIndex = raw.indexOf("#");
    const queryIndex = raw.indexOf("?");

    let pageEnd = raw.length;

    if (hashIndex >= 0) {
      pageEnd = Math.min(pageEnd, hashIndex);
    }

    if (queryIndex >= 0) {
      pageEnd = Math.min(pageEnd, queryIndex);
    }

    const page = raw.slice(0, pageEnd) || getCurrentPageName();
    const hash = hashIndex >= 0 ? raw.slice(hashIndex) : "";

    return {
      page,
      hash
    };
  }

  function isUrlCurrent(url) {
    if (!url || /^https?:\/\//i.test(url) || /^mailto:/i.test(url)) {
      return false;
    }

    const currentPage = getCurrentPageName();
    const currentHash = window.location.hash || "";
    const parsed = parseInternalUrl(url);

    if (parsed.page !== currentPage) {
      return false;
    }

    if (parsed.hash) {
      return parsed.hash === currentHash;
    }

    return currentHash === "";
  }

  function applyConfigBindings(root = document) {
    const textBindings = root.querySelectorAll("[data-config-text]");

    textBindings.forEach((element) => {
      const path = element.getAttribute("data-config-text");
      const value = getConfigValue(path, "");

      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        element.textContent = String(value);
      }
    });

    const hrefBindings = root.querySelectorAll("[data-config-href]");

    hrefBindings.forEach((element) => {
      const path = element.getAttribute("data-config-href");
      const value = getConfigValue(path, "");

      if (typeof value === "string" && value.trim()) {
        element.setAttribute("href", value);
      }
    });

    const srcBindings = root.querySelectorAll("[data-config-src]");

    srcBindings.forEach((element) => {
      const path = element.getAttribute("data-config-src");
      const value = getConfigValue(path, "");

      if (typeof value === "string" && value.trim()) {
        element.setAttribute("src", value);
      }
    });

    const altBindings = root.querySelectorAll("[data-config-alt]");

    altBindings.forEach((element) => {
      const path = element.getAttribute("data-config-alt");
      const value = getConfigValue(path, "");

      if (typeof value === "string") {
        element.setAttribute("alt", value);
      }
    });

    const placeholderBindings = root.querySelectorAll(
      "[data-config-placeholder]"
    );

    placeholderBindings.forEach((element) => {
      const path = element.getAttribute("data-config-placeholder");
      const value = getConfigValue(path, "");

      if (typeof value === "string") {
        element.setAttribute("placeholder", value);
      }
    });

    const valueBindings = root.querySelectorAll("[data-config-value]");

    valueBindings.forEach((element) => {
      const path = element.getAttribute("data-config-value");
      const value = getConfigValue(path, "");

      if ("value" in element) {
        element.value = String(value);
      } else {
        element.setAttribute("value", String(value));
      }
    });

    const mailBindings = root.querySelectorAll("[data-config-mailto]");

    mailBindings.forEach((element) => {
      const path = element.getAttribute("data-config-mailto");
      const value = getConfigValue(path, "");

      if (typeof value === "string" && value.trim()) {
        element.setAttribute("href", `mailto:${value}`);
      }
    });

    const genericBindings = root.querySelectorAll("[data-config-attr]");

    genericBindings.forEach((element) => {
      const definition = element.getAttribute("data-config-attr");

      if (!definition || !definition.includes(":")) {
        return;
      }

      const separatorIndex = definition.indexOf(":");
      const attributeName = definition.slice(0, separatorIndex).trim();
      const path = definition.slice(separatorIndex + 1).trim();
      const value = getConfigValue(path, "");

      if (attributeName && value !== "") {
        element.setAttribute(attributeName, String(value));
      }
    });
  }

  function getServiceIcon(index) {
    const iconName = SERVICE_ICONS[index % SERVICE_ICONS.length];

    return ICONS[iconName] || ICONS.shield;
  }

  function createSearchMarkup(instanceName) {
    const placeholder = escapeHtml(
      getConfigValue(
        "navigation.header.searchPlaceholder",
        "Search protection, plans, locations..."
      )
    );

    const resultsLabel = escapeHtml(
      getConfigValue("search.resultsLabel", "Search results")
    );

    const inputId = `vpn-search-${instanceName}`;
    const resultsId = `vpn-search-results-${instanceName}`;

    return `
      <div
        class="vpn-header__search"
        data-vpn-search
        data-has-value="false"
        data-search-open="false"
      >
        <div class="vpn-header__search-field">
          <span class="vpn-header__search-icon" aria-hidden="true">
            ${ICONS.search}
          </span>

          <input
            class="vpn-header__search-input"
            id="${inputId}"
            type="search"
            inputmode="search"
            autocomplete="off"
            spellcheck="false"
            placeholder="${placeholder}"
            aria-label="${placeholder}"
            aria-controls="${resultsId}"
            aria-expanded="false"
            aria-autocomplete="list"
            data-vpn-search-input
          >

          <button
            class="vpn-header__search-clear"
            type="button"
            aria-label="Clear search"
            data-vpn-search-clear
          >
            ${ICONS.close}
          </button>
        </div>

        <div
          class="vpn-header__search-results"
          id="${resultsId}"
          role="listbox"
          aria-label="${resultsLabel}"
          data-vpn-search-results
        ></div>
      </div>
    `;
  }

  function createDesktopServiceDropdown(services) {
    const serviceLinks = services
      .map((service, index) => {
        return `
          <a
            class="vpn-header__dropdown-link"
            href="${escapeHtml(service.url)}"
            data-vpn-nav-link
          >
            <span class="vpn-header__dropdown-icon" aria-hidden="true">
              ${getServiceIcon(index)}
            </span>

            <span>
              <span class="vpn-header__dropdown-title">
                ${escapeHtml(service.label)}
              </span>

              <span class="vpn-header__dropdown-description">
                ${escapeHtml(service.description || "")}
              </span>
            </span>

            <span class="vpn-header__dropdown-arrow" aria-hidden="true">
              ${ICONS.arrow}
            </span>
          </a>
        `;
      })
      .join("");

    return `
      <li
        class="vpn-header__nav-item"
        data-vpn-dropdown
        data-dropdown-open="false"
      >
        <button
          class="vpn-header__nav-dropdown-trigger"
          type="button"
          aria-expanded="false"
          aria-haspopup="true"
          data-vpn-dropdown-trigger
        >
          <span>
            ${escapeHtml(
              getConfigValue(
                "navigation.servicesDropdownLabel",
                "Protection"
              )
            )}
          </span>

          <span class="vpn-header__nav-chevron" aria-hidden="true">
            ${ICONS.chevron}
          </span>
        </button>

        <div class="vpn-header__dropdown">
          <div class="vpn-header__dropdown-grid">
            ${serviceLinks}
          </div>
        </div>
      </li>
    `;
  }

  function createMobileServiceDropdown(services) {
    const links = services
      .map((service) => {
        return `
          <a
            class="vpn-header__mobile-dropdown-link"
            href="${escapeHtml(service.url)}"
            data-vpn-nav-link
          >
            <span>${escapeHtml(service.label)}</span>
            <span aria-hidden="true">${ICONS.arrow}</span>
          </a>
        `;
      })
      .join("");

    return `
      <div>
        <button
          class="vpn-header__mobile-dropdown-trigger"
          type="button"
          aria-expanded="false"
          data-vpn-mobile-dropdown-trigger
        >
          <span>
            ${escapeHtml(
              getConfigValue(
                "navigation.servicesDropdownLabel",
                "Protection"
              )
            )}
          </span>

          <span aria-hidden="true">
            ${ICONS.chevron}
          </span>
        </button>

        <div
          class="vpn-header__mobile-dropdown"
          data-mobile-dropdown-open="false"
          data-vpn-mobile-dropdown
        >
          ${links}
        </div>
      </div>
    `;
  }

  function renderHeader() {
    const mount = document.querySelector(SELECTORS.headerMount);

    if (!mount) {
      return;
    }

    const navigationItems = Array.isArray(
      getConfigValue("navigation.main", [])
    )
      ? getConfigValue("navigation.main", [])
      : [];

    const services = Array.isArray(
      getConfigValue("navigation.services", [])
    )
      ? getConfigValue("navigation.services", [])
      : [];

    const servicesLabel = getConfigValue(
      "navigation.servicesDropdownLabel",
      "Protection"
    );

    const desktopNavigation = navigationItems
      .map((item) => {
        const isServicesItem =
          item.label === servicesLabel ||
          item.url === "index.html#services";

        if (isServicesItem) {
          return createDesktopServiceDropdown(services);
        }

        const current = isUrlCurrent(item.url)
          ? ' aria-current="page"'
          : "";

        return `
          <li class="vpn-header__nav-item">
            <a
              class="vpn-header__nav-link"
              href="${escapeHtml(item.url)}"
              data-vpn-nav-link
              ${current}
            >
              ${escapeHtml(item.label)}
            </a>
          </li>
        `;
      })
      .join("");

    const mobileNavigation = navigationItems
      .map((item) => {
        const isServicesItem =
          item.label === servicesLabel ||
          item.url === "index.html#services";

        if (isServicesItem) {
          return createMobileServiceDropdown(services);
        }

        const current = isUrlCurrent(item.url)
          ? ' aria-current="page"'
          : "";

        return `
          <a
            class="vpn-header__mobile-nav-link"
            href="${escapeHtml(item.url)}"
            data-vpn-nav-link
            ${current}
          >
            <span>${escapeHtml(item.label)}</span>
            <span aria-hidden="true">${ICONS.arrow}</span>
          </a>
        `;
      })
      .join("");

    const logoImage = escapeHtml(
      getConfigValue(
        "brand.logoImage",
        "assets/svg/logo-mark.svg"
      )
    );

    const logoAlt = escapeHtml(
      getConfigValue(
        "brand.logoAlt",
        "OrbitLock VPN"
      )
    );

    const siteName = escapeHtml(
      getConfigValue(
        "brand.siteName",
        "OrbitLock VPN"
      )
    );

    const trialLabel = escapeHtml(
      getConfigValue(
        "navigation.header.trialLabel",
        "Start Free Trial"
      )
    );

    const trialUrl = escapeHtml(
      getConfigValue(
        "navigation.header.trialUrl",
        "free-trial.html"
      )
    );

    const menuOpenLabel = escapeHtml(
      getConfigValue(
        "navigation.header.menuOpenLabel",
        "Open navigation"
      )
    );

    const searchOpenLabel = escapeHtml(
      getConfigValue(
        "navigation.header.searchOpenLabel",
        "Open search"
      )
    );

    mount.innerHTML = `
      <header
        class="vpn-header"
        data-vpn-header-root
        data-menu-open="false"
        data-search-mobile-open="false"
      >
        <div class="vpn-header__top">
          <div class="vpn-container vpn-header__top-inner">

            <a
              class="vpn-header__brand"
              href="index.html"
              aria-label="${siteName}"
            >
              <img
                class="vpn-header__logo"
                src="${logoImage}"
                alt="${logoAlt}"
                width="44"
                height="44"
              >

              <span class="vpn-header__brand-text">
                ${siteName}
              </span>
            </a>

            ${createSearchMarkup("desktop")}

            <div class="vpn-header__actions">
              <a
                class="vpn-button vpn-button--green vpn-button--compact vpn-header__trial"
                href="${trialUrl}"
              >
                <span>${trialLabel}</span>
                <span class="vpn-button__icon" aria-hidden="true">
                  ${ICONS.arrow}
                </span>
              </a>

              <button
                class="vpn-header__mobile-control"
                type="button"
                aria-label="${searchOpenLabel}"
                aria-expanded="false"
                data-vpn-mobile-search-toggle
              >
                ${ICONS.search}
              </button>

              <button
                class="vpn-header__mobile-control"
                type="button"
                aria-label="${menuOpenLabel}"
                aria-expanded="false"
                data-vpn-menu-toggle
              >
                ${ICONS.menu}
              </button>
            </div>
          </div>
        </div>

        <div class="vpn-header__bottom">
          <div class="vpn-container vpn-header__bottom-inner">
            <nav
              class="vpn-header__nav"
              aria-label="Primary navigation"
            >
              <ul class="vpn-header__nav-list">
                ${desktopNavigation}
              </ul>
            </nav>
          </div>
        </div>

        <div class="vpn-header__mobile-search">
          ${createSearchMarkup("mobile")}
        </div>

        <div
          class="vpn-header__mobile-panel"
          data-vpn-mobile-panel
        >
          <nav
            class="vpn-header__mobile-nav"
            aria-label="Mobile navigation"
          >
            ${mobileNavigation}
          </nav>

          <div class="vpn-header__mobile-cta">
            <a
              class="vpn-button vpn-button--green vpn-button--arrow"
              href="${trialUrl}"
            >
              <span>${trialLabel}</span>

              <span class="vpn-button__icon" aria-hidden="true">
                ${ICONS.arrow}
              </span>
            </a>
          </div>
        </div>
      </header>
    `;
  }

  function renderFooterGroup(title, links) {
    if (!Array.isArray(links)) {
      return "";
    }

    const items = links
      .map((item) => {
        return `
          <li>
            <a
              class="vpn-footer__link"
              href="${escapeHtml(item.url)}"
            >
              ${escapeHtml(item.label)}
            </a>
          </li>
        `;
      })
      .join("");

    return `
      <div class="vpn-footer__group">
        <h2 class="vpn-footer__group-title">
          ${escapeHtml(title)}
        </h2>

        <ul class="vpn-footer__links">
          ${items}
        </ul>
      </div>
    `;
  }

  function renderFooter() {
    const mount = document.querySelector(SELECTORS.footerMount);

    if (!mount) {
      return;
    }

    const siteName = escapeHtml(
      getConfigValue(
        "brand.siteName",
        "OrbitLock VPN"
      )
    );

    const logoImage = escapeHtml(
      getConfigValue(
        "brand.logoImage",
        "assets/svg/logo-mark.svg"
      )
    );

    const logoAlt = escapeHtml(
      getConfigValue(
        "brand.logoAlt",
        "OrbitLock VPN"
      )
    );

    const description = escapeHtml(
      getConfigValue(
        "footer.description",
        ""
      )
    );

    const email = escapeHtml(
      getConfigValue(
        "contact.corporateEmail",
        ""
      )
    );

    const address = escapeHtml(
      getConfigValue(
        "contact.address",
        ""
      )
    );

    const headings = getConfigValue("footer.headings", {});
    const socials = getConfigValue("footer.socialLinks", []);

    const socialMarkup = Array.isArray(socials)
      ? socials
          .map((social) => {
            return `
              <a
                class="vpn-footer__social-link"
                href="${escapeHtml(social.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                ${escapeHtml(social.label)}
              </a>
            `;
          })
          .join("")
      : "";

    mount.innerHTML = `
      <footer class="vpn-footer">
        <div class="vpn-container vpn-footer__inner">

          <div class="vpn-footer__top">
            <div class="vpn-footer__brand">
              <a
                class="vpn-footer__brand-link"
                href="index.html"
                aria-label="${siteName}"
              >
                <img
                  class="vpn-footer__logo"
                  src="${logoImage}"
                  alt="${logoAlt}"
                  width="46"
                  height="46"
                  loading="lazy"
                  decoding="async"
                >

                <span class="vpn-footer__brand-name">
                  ${siteName}
                </span>
              </a>

              <p class="vpn-footer__description">
                ${description}
              </p>

              <address class="vpn-footer__contact">
                <div class="vpn-footer__contact-row">
                  <span
                    class="vpn-footer__contact-icon"
                    aria-hidden="true"
                  >
                    ${ICONS.mail}
                  </span>

                  <a href="mailto:${email}">
                    ${email}
                  </a>
                </div>

                <div class="vpn-footer__contact-row">
                  <span
                    class="vpn-footer__contact-icon"
                    aria-hidden="true"
                  >
                    ${ICONS.pin}
                  </span>

                  <span>${address}</span>
                </div>
              </address>
            </div>

            ${renderFooterGroup(
              headings.explore || "Explore",
              getConfigValue("footer.exploreLinks", [])
            )}

            ${renderFooterGroup(
              headings.protection || "Protection",
              getConfigValue("footer.protectionLinks", [])
            )}

            ${renderFooterGroup(
              headings.company || "Company",
              getConfigValue("footer.companyLinks", [])
            )}

            ${renderFooterGroup(
              headings.legal || "Legal",
              getConfigValue("footer.legalLinks", [])
            )}
          </div>

          <div class="vpn-footer__bottom">
            <p
              class="vpn-footer__copyright"
              data-config-text="footer.copyrightText"
            >
              ${escapeHtml(
                getConfigValue(
                  "footer.copyrightText",
                  ""
                )
              )}
            </p>

            <div
              class="vpn-footer__socials"
              aria-label="Social links"
            >
              ${socialMarkup}
            </div>
          </div>
        </div>
      </footer>
    `;
  }

  function ensureLegalMount() {
    let mount = document.querySelector(SELECTORS.legalMount);

    if (mount) {
      return mount;
    }

    mount = document.createElement("div");
    mount.setAttribute("data-vpn-legal", "");
    document.body.appendChild(mount);

    return mount;
  }

  function renderLegalNotice() {
    const mount = ensureLegalMount();

    const heading = escapeHtml(
      getConfigValue(
        "legal.noticeHeading",
        "Legal & Privacy Notice"
      )
    );

    const text = escapeHtml(
      getConfigValue(
        "legal.noticeText",
        ""
      )
    );

    const buttonText = escapeHtml(
      getConfigValue(
        "legal.buttonText",
        "I Understand"
      )
    );

    const links = getConfigValue(
      "legal.links",
      []
    );

    const linksMarkup = Array.isArray(links)
      ? links
          .map((link) => {
            return `
              <a
                class="vpn-legal-notice__link"
                href="${escapeHtml(link.url)}"
              >
                ${escapeHtml(link.label)}
              </a>
            `;
          })
          .join("")
      : "";

    mount.innerHTML = `
      <aside
        class="vpn-legal-notice"
        aria-label="${heading}"
        data-vpn-legal-notice
        data-vpn-state="hidden"
      >
        <div class="vpn-legal-notice__inner">
          <div class="vpn-legal-notice__content">
            <h2 class="vpn-legal-notice__heading">
              ${heading}
            </h2>

            <p class="vpn-legal-notice__text">
              ${text}
            </p>

            <div class="vpn-legal-notice__links">
              ${linksMarkup}
            </div>
          </div>

          <div class="vpn-legal-notice__action">
            <button
              class="vpn-button vpn-button--green vpn-button--compact"
              type="button"
              data-vpn-legal-accept
            >
              <span>${buttonText}</span>

              <span class="vpn-button__icon" aria-hidden="true">
                ${ICONS.arrow}
              </span>
            </button>
          </div>
        </div>
      </aside>
    `;
  }

  function initLegalNotice() {
    const notice = document.querySelector(
      SELECTORS.legalNotice
    );

    const acceptButton = document.querySelector(
      SELECTORS.legalAccept
    );

    if (!notice || !acceptButton) {
      return;
    }

    const storageKey = getConfigValue(
      "legal.legalStorageKey",
      "vpn_legal_confirmation"
    );

    const version = String(
      getConfigValue(
        "legal.legalVersion",
        "1.0"
      )
    );

    let acceptedVersion = null;

    try {
      acceptedVersion = window.localStorage.getItem(
        storageKey
      );
    } catch (error) {
      acceptedVersion = null;
    }

    if (acceptedVersion === version) {
      notice.setAttribute(
        "data-vpn-state",
        "hidden"
      );

      return;
    }

    notice.setAttribute(
      "data-vpn-state",
      "visible"
    );

    acceptButton.addEventListener(
      "click",
      () => {
        try {
          window.localStorage.setItem(
            storageKey,
            version
          );
        } catch (error) {
          
        }

        notice.setAttribute(
          "data-vpn-state",
          "hidden"
        );
      }
    );
  }

  function initSearch(searchRoot) {
    if (!searchRoot) {
      return;
    }

    const input = searchRoot.querySelector(
      SELECTORS.searchInput
    );

    const resultsContainer = searchRoot.querySelector(
      SELECTORS.searchResults
    );

    const clearButton = searchRoot.querySelector(
      SELECTORS.searchClear
    );

    if (!input || !resultsContainer) {
      return;
    }

    const searchItems = Array.isArray(
      getConfigValue("search.items", [])
    )
      ? getConfigValue("search.items", [])
      : [];

    let matches = [];
    let activeIndex = -1;

    function closeResults() {
      activeIndex = -1;

      searchRoot.setAttribute(
        "data-search-open",
        "false"
      );

      input.setAttribute(
        "aria-expanded",
        "false"
      );

      input.removeAttribute(
        "aria-activedescendant"
      );
    }

    function setActiveResult(index) {
      const resultElements = Array.from(
        resultsContainer.querySelectorAll(
          ".vpn-header__search-result"
        )
      );

      if (!resultElements.length) {
        activeIndex = -1;
        return;
      }

      if (index < 0) {
        index = resultElements.length - 1;
      }

      if (index >= resultElements.length) {
        index = 0;
      }

      activeIndex = index;

      resultElements.forEach(
        (element, elementIndex) => {
          const active =
            elementIndex === activeIndex;

          element.setAttribute(
            "aria-selected",
            active ? "true" : "false"
          );

          if (active) {
            input.setAttribute(
              "aria-activedescendant",
              element.id
            );

            element.scrollIntoView({
              block: "nearest"
            });
          }
        }
      );
    }

    function scoreSearchItem(item, query) {
      const normalisedQuery = normaliseText(query);

      if (!normalisedQuery) {
        return 0;
      }

      const queryTerms = normalisedQuery
        .split(" ")
        .filter(Boolean);

      const title = normaliseText(item.title);
      const keywords = normaliseText(item.keywords);
      const category = normaliseText(item.category);

      const haystack = [
        title,
        keywords,
        category
      ].join(" ");

      const everyTermMatches = queryTerms.every(
        (term) => haystack.includes(term)
      );

      if (!everyTermMatches) {
        return 0;
      }

      let score = 10;

      if (title === normalisedQuery) {
        score += 100;
      }

      if (title.startsWith(normalisedQuery)) {
        score += 60;
      }

      if (title.includes(normalisedQuery)) {
        score += 35;
      }

      if (category.includes(normalisedQuery)) {
        score += 15;
      }

      queryTerms.forEach((term) => {
        if (title.includes(term)) {
          score += 12;
        }

        if (keywords.includes(term)) {
          score += 5;
        }
      });

      return score;
    }

    function findMatches(query) {
      return searchItems
        .map((item) => {
          return {
            item,
            score: scoreSearchItem(item, query)
          };
        })
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 8)
        .map((entry) => entry.item);
    }

    function renderResults(query) {
      resultsContainer.innerHTML = "";
      activeIndex = -1;

      if (!query.trim()) {
        matches = [];
        closeResults();
        return;
      }

      matches = findMatches(query);

      if (!matches.length) {
        const empty = document.createElement("div");
        empty.className =
          "vpn-header__search-empty";

        empty.textContent = getConfigValue(
          "search.emptyMessage",
          "No matching pages found."
        );

        resultsContainer.appendChild(empty);

        searchRoot.setAttribute(
          "data-search-open",
          "true"
        );

        input.setAttribute(
          "aria-expanded",
          "true"
        );

        return;
      }

      matches.forEach((item, index) => {
        const link = document.createElement("a");

        link.className =
          "vpn-header__search-result";

        link.href = item.url;
        link.id = `${resultsContainer.id}-option-${index}`;
        link.setAttribute("role", "option");
        link.setAttribute(
          "aria-selected",
          "false"
        );

        const copy = document.createElement("span");
        copy.className =
          "vpn-header__search-result-copy";

        const title = document.createElement("span");
        title.className =
          "vpn-header__search-result-title";
        title.textContent = item.title;

        const category =
          document.createElement("span");

        category.className =
          "vpn-header__search-result-category";

        category.textContent =
          item.category || "Result";

        copy.appendChild(title);
        copy.appendChild(category);

        const arrow =
          document.createElement("span");

        arrow.className =
          "vpn-header__search-result-arrow";

        arrow.setAttribute(
          "aria-hidden",
          "true"
        );

        arrow.innerHTML = ICONS.arrow;

        link.appendChild(copy);
        link.appendChild(arrow);

        link.addEventListener(
          "mouseenter",
          () => {
            setActiveResult(index);
          }
        );

        resultsContainer.appendChild(link);
      });

      searchRoot.setAttribute(
        "data-search-open",
        "true"
      );

      input.setAttribute(
        "aria-expanded",
        "true"
      );
    }

    input.addEventListener(
      "input",
      () => {
        const value = input.value;

        searchRoot.setAttribute(
          "data-has-value",
          value.trim() ? "true" : "false"
        );

        renderResults(value);
      }
    );

    input.addEventListener(
      "focus",
      () => {
        if (input.value.trim()) {
          renderResults(input.value);
        }
      }
    );

    input.addEventListener(
      "keydown",
      (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();

          if (!matches.length) {
            return;
          }

          setActiveResult(
            activeIndex + 1
          );
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();

          if (!matches.length) {
            return;
          }

          setActiveResult(
            activeIndex - 1
          );
        }

        if (event.key === "Enter") {
          if (!matches.length) {
            return;
          }

          event.preventDefault();

          const destination =
            activeIndex >= 0
              ? matches[activeIndex]
              : matches[0];

          if (destination && destination.url) {
            window.location.href =
              destination.url;
          }
        }

        if (event.key === "Escape") {
          closeResults();
          input.blur();
        }
      }
    );

    if (clearButton) {
      clearButton.addEventListener(
        "click",
        () => {
          input.value = "";

          searchRoot.setAttribute(
            "data-has-value",
            "false"
          );

          resultsContainer.innerHTML = "";
          closeResults();

          input.focus();
        }
      );
    }

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (!searchRoot.contains(event.target)) {
          closeResults();
        }
      }
    );
  }

  function initAllSearchInstances() {
    document
      .querySelectorAll(SELECTORS.search)
      .forEach((searchRoot) => {
        initSearch(searchRoot);
      });
  }

  function getFocusableElements(container) {
    if (!container) {
      return [];
    }

    return Array.from(
      container.querySelectorAll(
        [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])"
        ].join(",")
      )
    ).filter((element) => {
      return (
        !element.hidden &&
        element.offsetParent !== null
      );
    });
  }

  function initHeaderInteractions() {
    const header = document.querySelector(
      SELECTORS.headerRoot
    );

    if (!header) {
      return;
    }

    const menuToggle = header.querySelector(
      SELECTORS.menuToggle
    );

    const mobileSearchToggle = header.querySelector(
      SELECTORS.mobileSearchToggle
    );

    const mobilePanel = header.querySelector(
      SELECTORS.mobilePanel
    );

    const desktopDropdowns = Array.from(
      header.querySelectorAll(
        SELECTORS.desktopDropdown
      )
    );

    const mobileDropdownTrigger =
      header.querySelector(
        SELECTORS.mobileDropdownTrigger
      );

    const mobileDropdown =
      header.querySelector(
        SELECTORS.mobileDropdown
      );

    const menuOpenLabel = getConfigValue(
      "navigation.header.menuOpenLabel",
      "Open navigation"
    );

    const menuCloseLabel = getConfigValue(
      "navigation.header.menuCloseLabel",
      "Close navigation"
    );

    const searchOpenLabel = getConfigValue(
      "navigation.header.searchOpenLabel",
      "Open search"
    );

    const searchCloseLabel = getConfigValue(
      "navigation.header.searchCloseLabel",
      "Close search"
    );

    function isMenuOpen() {
      return (
        header.getAttribute(
          "data-menu-open"
        ) === "true"
      );
    }

    function isMobileSearchOpen() {
      return (
        header.getAttribute(
          "data-search-mobile-open"
        ) === "true"
      );
    }

    function closeDesktopDropdowns(
      exception = null
    ) {
      desktopDropdowns.forEach((dropdown) => {
        if (dropdown === exception) {
          return;
        }

        dropdown.setAttribute(
          "data-dropdown-open",
          "false"
        );

        const trigger =
          dropdown.querySelector(
            SELECTORS.desktopDropdownTrigger
          );

        if (trigger) {
          trigger.setAttribute(
            "aria-expanded",
            "false"
          );
        }
      });
    }

    function closeMobileDropdown() {
      if (!mobileDropdownTrigger || !mobileDropdown) {
        return;
      }

      mobileDropdownTrigger.setAttribute(
        "aria-expanded",
        "false"
      );

      mobileDropdown.setAttribute(
        "data-mobile-dropdown-open",
        "false"
      );
    }

    function openMenu() {
      if (!menuToggle || !mobilePanel) {
        return;
      }

      closeMobileSearch(false);
      closeDesktopDropdowns();

      header.setAttribute(
        "data-menu-open",
        "true"
      );

      menuToggle.setAttribute(
        "aria-expanded",
        "true"
      );

      menuToggle.setAttribute(
        "aria-label",
        menuCloseLabel
      );

      menuToggle.innerHTML = ICONS.close;

      document.body.classList.add(
        "vpn-scroll-locked"
      );

      window.requestAnimationFrame(() => {
        const focusable =
          getFocusableElements(mobilePanel);

        if (focusable.length) {
          focusable[0].focus();
        }
      });
    }

    function closeMenu(
      returnFocus = false
    ) {
      if (!menuToggle) {
        return;
      }

      header.setAttribute(
        "data-menu-open",
        "false"
      );

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      menuToggle.setAttribute(
        "aria-label",
        menuOpenLabel
      );

      menuToggle.innerHTML = ICONS.menu;

      document.body.classList.remove(
        "vpn-scroll-locked"
      );

      closeMobileDropdown();

      if (returnFocus) {
        menuToggle.focus();
      }
    }

    function openMobileSearch() {
      if (!mobileSearchToggle) {
        return;
      }

      closeMenu(false);
      closeDesktopDropdowns();

      header.setAttribute(
        "data-search-mobile-open",
        "true"
      );

      mobileSearchToggle.setAttribute(
        "aria-expanded",
        "true"
      );

      mobileSearchToggle.setAttribute(
        "aria-label",
        searchCloseLabel
      );

      mobileSearchToggle.innerHTML =
        ICONS.close;

      window.requestAnimationFrame(() => {
        const mobileSearchInput =
          header.querySelector(
            ".vpn-header__mobile-search [data-vpn-search-input]"
          );

        if (mobileSearchInput) {
          mobileSearchInput.focus();
        }
      });
    }

    function closeMobileSearch(
      returnFocus = false
    ) {
      if (!mobileSearchToggle) {
        return;
      }

      header.setAttribute(
        "data-search-mobile-open",
        "false"
      );

      mobileSearchToggle.setAttribute(
        "aria-expanded",
        "false"
      );

      mobileSearchToggle.setAttribute(
        "aria-label",
        searchOpenLabel
      );

      mobileSearchToggle.innerHTML =
        ICONS.search;

      if (returnFocus) {
        mobileSearchToggle.focus();
      }
    }

    if (menuToggle) {
      menuToggle.addEventListener(
        "click",
        () => {
          if (isMenuOpen()) {
            closeMenu(true);
          } else {
            openMenu();
          }
        }
      );
    }

    if (mobileSearchToggle) {
      mobileSearchToggle.addEventListener(
        "click",
        () => {
          if (isMobileSearchOpen()) {
            closeMobileSearch(true);
          } else {
            openMobileSearch();
          }
        }
      );
    }

    desktopDropdowns.forEach((dropdown) => {
      const trigger =
        dropdown.querySelector(
          SELECTORS.desktopDropdownTrigger
        );

      if (!trigger) {
        return;
      }

      trigger.addEventListener(
        "click",
        (event) => {
          event.stopPropagation();

          const open =
            dropdown.getAttribute(
              "data-dropdown-open"
            ) === "true";

          closeDesktopDropdowns(dropdown);

          dropdown.setAttribute(
            "data-dropdown-open",
            open ? "false" : "true"
          );

          trigger.setAttribute(
            "aria-expanded",
            open ? "false" : "true"
          );
        }
      );

      trigger.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key === "ArrowDown" &&
            dropdown.getAttribute(
              "data-dropdown-open"
            ) !== "true"
          ) {
            event.preventDefault();
            trigger.click();
          }
        }
      );
    });

    if (
      mobileDropdownTrigger &&
      mobileDropdown
    ) {
      mobileDropdownTrigger.addEventListener(
        "click",
        () => {
          const open =
            mobileDropdownTrigger.getAttribute(
              "aria-expanded"
            ) === "true";

          mobileDropdownTrigger.setAttribute(
            "aria-expanded",
            open ? "false" : "true"
          );

          mobileDropdown.setAttribute(
            "data-mobile-dropdown-open",
            open ? "false" : "true"
          );
        }
      );
    }

    if (mobilePanel) {
      mobilePanel.addEventListener(
        "click",
        (event) => {
          const link = event.target.closest(
            "a[href]"
          );

          if (link) {
            closeMenu(false);
          }
        }
      );

      mobilePanel.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key !== "Tab" ||
            !isMenuOpen()
          ) {
            return;
          }

          const focusable =
            getFocusableElements(mobilePanel);

          if (!focusable.length) {
            return;
          }

          const first = focusable[0];
          const last =
            focusable[focusable.length - 1];

          if (
            event.shiftKey &&
            document.activeElement === first
          ) {
            event.preventDefault();
            last.focus();
          } else if (
            !event.shiftKey &&
            document.activeElement === last
          ) {
            event.preventDefault();
            first.focus();
          }
        }
      );
    }

    document.addEventListener(
      "pointerdown",
      (event) => {
        if (!header.contains(event.target)) {
          closeDesktopDropdowns();

          if (isMenuOpen()) {
            closeMenu(false);
          }

          if (isMobileSearchOpen()) {
            closeMobileSearch(false);
          }
        }
      }
    );

    document.addEventListener(
      "keydown",
      (event) => {
        if (event.key !== "Escape") {
          return;
        }

        closeDesktopDropdowns();

        if (isMenuOpen()) {
          closeMenu(true);
        }

        if (isMobileSearchOpen()) {
          closeMobileSearch(true);
        }
      }
    );

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth > 900) {
          if (isMenuOpen()) {
            closeMenu(false);
          }

          if (isMobileSearchOpen()) {
            closeMobileSearch(false);
          }
        }
      },
      {
        passive: true
      }
    );
  }

  function getFieldErrorElement(field) {
    const wrapper = field.closest(
      SELECTORS.formField
    );

    if (!wrapper) {
      return null;
    }

    let errorElement = wrapper.querySelector(
      SELECTORS.formError
    );

    if (!errorElement) {
      errorElement = document.createElement("p");

      errorElement.className =
        "vpn-form__error";

      errorElement.setAttribute(
        "data-vpn-field-error",
        ""
      );

      wrapper.appendChild(errorElement);
    }

    return errorElement;
  }

  function getFieldLabel(field) {
    const wrapper = field.closest(
      SELECTORS.formField
    );

    if (!wrapper) {
      return (
        field.getAttribute("aria-label") ||
        field.name ||
        "This field"
      );
    }

    const label = wrapper.querySelector(
      "label"
    );

    if (label) {
      return label.textContent
        .replace("*", "")
        .trim();
    }

    return (
      field.getAttribute("aria-label") ||
      field.name ||
      "This field"
    );
  }

  function getValidationMessage(field) {
    const label = getFieldLabel(field);

    if (field.validity.valueMissing) {
      return `${label} is required.`;
    }

    if (field.validity.typeMismatch) {
      return `Please enter a valid ${label.toLowerCase()}.`;
    }

    if (field.validity.tooLong) {
      return `${label} is too long.`;
    }

    if (field.validity.tooShort) {
      return `${label} is too short.`;
    }

    if (field.validity.patternMismatch) {
      return `Please check the format of ${label.toLowerCase()}.`;
    }

    return `Please check ${label.toLowerCase()}.`;
  }

  function setFieldError(
    field,
    message
  ) {
    const wrapper = field.closest(
      SELECTORS.formField
    );

    const errorElement =
      getFieldErrorElement(field);

    field.setAttribute(
      "aria-invalid",
      "true"
    );

    if (wrapper) {
      wrapper.setAttribute(
        "data-error",
        "true"
      );
    }

    if (errorElement) {
      if (!errorElement.id) {
        errorElement.id = `vpn-error-${
          field.name ||
          Math.random()
            .toString(36)
            .slice(2)
        }`;
      }

      errorElement.textContent = message;

      field.setAttribute(
        "aria-describedby",
        errorElement.id
      );
    }
  }

  function clearFieldError(field) {
    const wrapper = field.closest(
      SELECTORS.formField
    );

    field.removeAttribute(
      "aria-invalid"
    );

    if (wrapper) {
      wrapper.setAttribute(
        "data-error",
        "false"
      );
    }

    const errorElement =
      wrapper?.querySelector(
        SELECTORS.formError
      );

    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  function validateField(field) {
    if (
      field.disabled ||
      field.type === "hidden" ||
      field.closest(".vpn-form__honeypot")
    ) {
      return true;
    }

    clearFieldError(field);

    if (!field.checkValidity()) {
      setFieldError(
        field,
        getValidationMessage(field)
      );

      return false;
    }

    return true;
  }

  function validateForm(form) {
    const fields = Array.from(
      form.querySelectorAll(
        "input, select, textarea"
      )
    ).filter((field) => {
      return (
        field.type !== "hidden" &&
        !field.closest(
          ".vpn-form__honeypot"
        )
      );
    });

    let firstInvalidField = null;

    fields.forEach((field) => {
      const valid =
        validateField(field);

      if (!valid && !firstInvalidField) {
        firstInvalidField = field;
      }
    });

    if (firstInvalidField) {
      firstInvalidField.focus();

      return false;
    }

    return true;
  }

  function ensureHoneypot(form) {
    if (
      form.querySelector(
        "input[name='website']"
      )
    ) {
      return;
    }

    const wrapper = document.createElement("div");

    wrapper.className =
      "vpn-form__honeypot";

    wrapper.setAttribute(
      "aria-hidden",
      "true"
    );

    const label =
      document.createElement("label");

    label.textContent =
      "Leave this field empty";

    const input =
      document.createElement("input");

    input.type = "text";
    input.name = "website";
    input.tabIndex = -1;
    input.autocomplete = "off";

    label.appendChild(input);
    wrapper.appendChild(label);
    form.appendChild(wrapper);
  }

  function ensureFormType(form) {
    let formTypeInput =
      form.querySelector(
        "input[name='formType']"
      );

    if (formTypeInput) {
      return;
    }

    formTypeInput =
      document.createElement("input");

    formTypeInput.type = "hidden";
    formTypeInput.name = "formType";
    formTypeInput.value =
      form.getAttribute(
        "data-form-type"
      ) || "contact";

    form.appendChild(formTypeInput);
  }

  function setFormStatus(
    form,
    status,
    message
  ) {
    const statusElement =
      form.querySelector(
        SELECTORS.formStatus
      );

    if (!statusElement) {
      return;
    }

    if (!status) {
      statusElement.removeAttribute(
        "data-status"
      );

      statusElement.textContent = "";

      return;
    }

    statusElement.setAttribute(
      "data-status",
      status
    );

    statusElement.textContent =
      message || "";
  }

  function setFormLoading(
    form,
    loading
  ) {
    const submitButton =
      form.querySelector(
        SELECTORS.formSubmit
      );

    if (!submitButton) {
      return;
    }

    const labelElement =
      submitButton.querySelector(
        "[data-vpn-submit-label]"
      );

    if (
      !submitButton.dataset.originalLabel
    ) {
      submitButton.dataset.originalLabel =
        labelElement
          ? labelElement.textContent
          : submitButton.textContent.trim();
    }

    submitButton.disabled = loading;
    submitButton.setAttribute(
      "aria-disabled",
      loading ? "true" : "false"
    );

    if (loading) {
      const loadingLabel =
        getConfigValue(
          "forms.loadingLabel",
          "Sending..."
        );

      if (labelElement) {
        labelElement.innerHTML = `
          <span class="vpn-form__loading">
            <span
              class="vpn-form__spinner"
              aria-hidden="true"
            ></span>
            <span>${escapeHtml(loadingLabel)}</span>
          </span>
        `;
      } else {
        submitButton.textContent =
          loadingLabel;
      }

      return;
    }

    if (labelElement) {
      labelElement.textContent =
        submitButton.dataset.originalLabel;
    } else {
      submitButton.textContent =
        submitButton.dataset.originalLabel;
    }
  }

  function initForm(form) {
    if (!form) {
      return;
    }

    form.noValidate = true;

    ensureHoneypot(form);
    ensureFormType(form);

    const fields = Array.from(
      form.querySelectorAll(
        "input, select, textarea"
      )
    );

    fields.forEach((field) => {
      const eventName =
        field.tagName === "SELECT" ||
        field.type === "checkbox" ||
        field.type === "radio"
          ? "change"
          : "input";

      field.addEventListener(
        eventName,
        () => {
          if (
            field.getAttribute(
              "aria-invalid"
            ) === "true"
          ) {
            validateField(field);
          }
        }
      );

      field.addEventListener(
        "blur",
        () => {
          if (
            field.required &&
            field.value !== ""
          ) {
            validateField(field);
          }
        }
      );
    });

    form.addEventListener(
      "submit",
      async (event) => {
        event.preventDefault();

        if (
          form.dataset.submitting ===
          "true"
        ) {
          return;
        }

        setFormStatus(
          form,
          "",
          ""
        );

        const valid =
          validateForm(form);

        if (!valid) {
          return;
        }

        form.dataset.submitting =
          "true";

        setFormLoading(
          form,
          true
        );

        const endpoint =
          form.getAttribute("action") ||
          getConfigValue(
            "contact.formEndpoint",
            "contact.php"
          );

        const formData =
          new FormData(form);

        try {
          const response = await fetch(
            endpoint,
            {
              method: "POST",
              body: formData,
              headers: {
                Accept: "application/json"
              }
            }
          );

          let payload = null;

          try {
            payload =
              await response.json();
          } catch (error) {
            payload = null;
          }

          if (
            !response.ok ||
            !payload ||
            payload.success !== true
          ) {
            const message =
              payload &&
              typeof payload.message ===
                "string"
                ? payload.message
                : getConfigValue(
                    "forms.errorMessage",
                    "We could not send your request right now. Please check your information and try again."
                  );

            throw new Error(message);
          }

          setFormStatus(
            form,
            "success",
            getConfigValue(
              "forms.successMessage",
              "Thank you! We have successfully received your request. Our team will review your information and get back to you shortly."
            )
          );

          form.reset();

          form
            .querySelectorAll(
              SELECTORS.formField
            )
            .forEach((wrapper) => {
              wrapper.setAttribute(
                "data-error",
                "false"
              );
            });

          form
            .querySelectorAll(
              "[aria-invalid='true']"
            )
            .forEach((field) => {
              field.removeAttribute(
                "aria-invalid"
              );
            });

          form.dispatchEvent(
            new CustomEvent(
              "vpn:form-success",
              {
                bubbles: true
              }
            )
          );
        } catch (error) {
          const fallback =
            getConfigValue(
              "forms.networkErrorMessage",
              "A connection problem prevented your request from being sent. Please try again shortly."
            );

          const message =
            error instanceof Error &&
            error.message
              ? error.message
              : fallback;

          setFormStatus(
            form,
            "error",
            message
          );

          form.dispatchEvent(
            new CustomEvent(
              "vpn:form-error",
              {
                bubbles: true,
                detail: {
                  message
                }
              }
            )
          );
        } finally {
          form.dataset.submitting =
            "false";

          setFormLoading(
            form,
            false
          );
        }
      }
    );
  }

  function initForms(root = document) {
    root
      .querySelectorAll(
        SELECTORS.form
      )
      .forEach((form) => {
        if (
          form.dataset.vpnInitialised ===
          "true"
        ) {
          return;
        }

        form.dataset.vpnInitialised =
          "true";

        initForm(form);
      });
  }

  function initMessageCounters(
    root = document
  ) {
    const textareas =
      root.querySelectorAll(
        "textarea[maxlength][data-vpn-counter-source]"
      );

    textareas.forEach((textarea) => {
      const counterId =
        textarea.getAttribute(
          "data-vpn-counter-source"
        );

      const counter =
        document.getElementById(
          counterId
        );

      if (!counter) {
        return;
      }

      const maximum = Number(
        textarea.getAttribute(
          "maxlength"
        )
      );

      function updateCounter() {
        counter.textContent = `${
          textarea.value.length
        } / ${maximum}`;
      }

      textarea.addEventListener(
        "input",
        updateCounter
      );

      updateCounter();
    });
  }

  function initAccordions(
    root = document
  ) {
    root
      .querySelectorAll(
        SELECTORS.accordion
      )
      .forEach(
        (
          accordion,
          accordionIndex
        ) => {
          if (
            accordion.dataset
              .vpnInitialised === "true"
          ) {
            return;
          }

          accordion.dataset
            .vpnInitialised = "true";

          const items = Array.from(
            accordion.querySelectorAll(
              SELECTORS.accordionItem
            )
          );

          const triggers = [];

          items.forEach(
            (item, itemIndex) => {
              const trigger =
                item.querySelector(
                  SELECTORS.accordionTrigger
                );

              const panel =
                item.querySelector(
                  SELECTORS.accordionPanel
                );

              if (!trigger || !panel) {
                return;
              }

              const triggerId =
                trigger.id ||
                `vpn-accordion-trigger-${accordionIndex}-${itemIndex}`;

              const panelId =
                panel.id ||
                `vpn-accordion-panel-${accordionIndex}-${itemIndex}`;

              trigger.id = triggerId;
              panel.id = panelId;

              trigger.setAttribute(
                "aria-controls",
                panelId
              );

              panel.setAttribute(
                "aria-labelledby",
                triggerId
              );

              panel.setAttribute(
                "role",
                "region"
              );

              if (
                !trigger.hasAttribute(
                  "aria-expanded"
                )
              ) {
                trigger.setAttribute(
                  "aria-expanded",
                  itemIndex === 0
                    ? "true"
                    : "false"
                );
              }

              panel.setAttribute(
                "aria-hidden",
                trigger.getAttribute(
                  "aria-expanded"
                ) === "true"
                  ? "false"
                  : "true"
              );

              triggers.push(trigger);

              trigger.addEventListener(
                "click",
                () => {
                  const currentlyOpen =
                    trigger.getAttribute(
                      "aria-expanded"
                    ) === "true";

                  items.forEach(
                    (otherItem) => {
                      const otherTrigger =
                        otherItem.querySelector(
                          SELECTORS.accordionTrigger
                        );

                      const otherPanel =
                        otherItem.querySelector(
                          SELECTORS.accordionPanel
                        );

                      if (
                        !otherTrigger ||
                        !otherPanel
                      ) {
                        return;
                      }

                      otherTrigger.setAttribute(
                        "aria-expanded",
                        "false"
                      );

                      otherPanel.setAttribute(
                        "aria-hidden",
                        "true"
                      );
                    }
                  );

                  if (!currentlyOpen) {
                    trigger.setAttribute(
                      "aria-expanded",
                      "true"
                    );

                    panel.setAttribute(
                      "aria-hidden",
                      "false"
                    );
                  }
                }
              );
            }
          );

          triggers.forEach(
            (trigger, index) => {
              trigger.addEventListener(
                "keydown",
                (event) => {
                  if (
                    event.key !==
                      "ArrowDown" &&
                    event.key !==
                      "ArrowUp" &&
                    event.key !== "Home" &&
                    event.key !== "End"
                  ) {
                    return;
                  }

                  event.preventDefault();

                  let targetIndex = index;

                  if (
                    event.key ===
                    "ArrowDown"
                  ) {
                    targetIndex =
                      (index + 1) %
                      triggers.length;
                  }

                  if (
                    event.key ===
                    "ArrowUp"
                  ) {
                    targetIndex =
                      (index -
                        1 +
                        triggers.length) %
                      triggers.length;
                  }

                  if (
                    event.key === "Home"
                  ) {
                    targetIndex = 0;
                  }

                  if (
                    event.key === "End"
                  ) {
                    targetIndex =
                      triggers.length - 1;
                  }

                  triggers[
                    targetIndex
                  ]?.focus();
                }
              );
            }
          );
        }
      );
  }

  function initTabs(
    root = document
  ) {
    root
      .querySelectorAll(
        SELECTORS.tabs
      )
      .forEach(
        (
          tabsRoot,
          tabsIndex
        ) => {
          if (
            tabsRoot.dataset
              .vpnInitialised === "true"
          ) {
            return;
          }

          tabsRoot.dataset
            .vpnInitialised = "true";

          const list =
            tabsRoot.querySelector(
              SELECTORS.tabList
            );

          const tabs = Array.from(
            tabsRoot.querySelectorAll(
              SELECTORS.tab
            )
          );

          const panels = Array.from(
            tabsRoot.querySelectorAll(
              SELECTORS.tabPanel
            )
          );

          if (!tabs.length) {
            return;
          }

          if (list) {
            list.setAttribute(
              "role",
              "tablist"
            );
          }

          function activateTab(
            targetTab,
            moveFocus = true
          ) {
            const targetId =
              targetTab.getAttribute(
                "data-tab-id"
              );

            tabs.forEach(
              (tab, index) => {
                const tabId =
                  tab.getAttribute(
                    "data-tab-id"
                  );

                const selected =
                  tabId === targetId;

                const tabDomId =
                  tab.id ||
                  `vpn-tab-${tabsIndex}-${index}`;

                tab.id = tabDomId;

                tab.setAttribute(
                  "role",
                  "tab"
                );

                tab.setAttribute(
                  "aria-selected",
                  selected
                    ? "true"
                    : "false"
                );

                tab.tabIndex =
                  selected ? 0 : -1;

                const targetPanel =
                  panels.find(
                    (panel) =>
                      panel.getAttribute(
                        "data-tab-panel-id"
                      ) === tabId
                  );

                if (targetPanel) {
                  const panelId =
                    targetPanel.id ||
                    `vpn-tab-panel-${tabsIndex}-${index}`;

                  targetPanel.id =
                    panelId;

                  tab.setAttribute(
                    "aria-controls",
                    panelId
                  );

                  targetPanel.setAttribute(
                    "role",
                    "tabpanel"
                  );

                  targetPanel.setAttribute(
                    "aria-labelledby",
                    tabDomId
                  );

                  targetPanel.hidden =
                    !selected;
                }
              }
            );

            if (moveFocus) {
              targetTab.focus();
            }

            tabsRoot.dispatchEvent(
              new CustomEvent(
                "vpn:tab-change",
                {
                  bubbles: true,
                  detail: {
                    tabId: targetId
                  }
                }
              )
            );
          }

          tabs.forEach(
            (tab, index) => {
              tab.addEventListener(
                "click",
                () => {
                  activateTab(
                    tab,
                    false
                  );
                }
              );

              tab.addEventListener(
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
                      tabs.length;
                  }

                  if (
                    event.key ===
                    "ArrowLeft"
                  ) {
                    targetIndex =
                      (index -
                        1 +
                        tabs.length) %
                      tabs.length;
                  }

                  if (
                    event.key === "Home"
                  ) {
                    targetIndex = 0;
                  }

                  if (
                    event.key === "End"
                  ) {
                    targetIndex =
                      tabs.length - 1;
                  }

                  activateTab(
                    tabs[targetIndex],
                    true
                  );
                }
              );
            }
          );

          const initiallySelected =
            tabs.find(
              (tab) =>
                tab.getAttribute(
                  "aria-selected"
                ) === "true"
            ) || tabs[0];

          activateTab(
            initiallySelected,
            false
          );
        }
      );
  }

  function bindQueryParameters(
    root = document
  ) {
    const params =
      new URLSearchParams(
        window.location.search
      );

    root
      .querySelectorAll(
        "[data-vpn-query-param]"
      )
      .forEach((element) => {
        const parameter =
          element.getAttribute(
            "data-vpn-query-param"
          );

        if (
          !parameter ||
          !params.has(parameter)
        ) {
          return;
        }

        const value =
          params.get(parameter);

        if ("value" in element) {
          element.value = value;
        } else {
          element.textContent = value;
        }
      });
  }

  function initExternalLinks() {
    document
      .querySelectorAll(
        "a[target='_blank']"
      )
      .forEach((link) => {
        const rel = new Set(
          (
            link.getAttribute("rel") ||
            ""
          )
            .split(/\s+/)
            .filter(Boolean)
        );

        rel.add("noopener");
        rel.add("noreferrer");

        link.setAttribute(
          "rel",
          Array.from(rel).join(" ")
        );
      });
  }

  function createHeroCodeLines() {
    return [
      "const tunnel = await orbitLock.connect({ protocol: 'wireguard', region: 'auto', killSwitch: true, publicWifi: 'shielded' });",
      "session.rotateKeys({ interval: '90s', entropy: crypto.getRandomValues(new Uint32Array(8)), dns: 'private-resolver' });",
      "route.stream('4k').through(['nearest-node', 'low-latency-hop', 'encrypted-edge']).verifyNoLeaks();",
      "policy.blockTrackers().maskLocation().sealMetadata().syncDevices(['macOS', 'iOS', 'Android', 'Windows']);",
      "monitor.latency().on('spike', () => tunnel.rebalance({ preserveSession: true, target: 'fastest-secure-path' }));",
      "firewall.whenNetworkChanges().pauseTraffic().handshake().resumeAfter(() => audit.ip === 'protected');",
      "const privacy = new OrbitLockVault({ logs: false, splitTunnel: true, smartRules: ['banking', 'travel', 'streaming'] });",
      "edge.nodes.filter(node => node.load < 0.62).sort(byLatency).slice(0, 3).map(node => tunnel.pin(node));"
    ];
  }

  function initHeroCodeBackground() {
    if (heroCodeBackgroundInitialised) {
      return;
    }

    const heroes = Array.from(
      document.querySelectorAll("[data-vpn-hero]")
    );

    if (!heroes.length) {
      return;
    }

    heroCodeBackgroundInitialised = true;

    const codeLines = createHeroCodeLines();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    heroes.forEach((hero) => {
      if (hero.querySelector(".vpn-hero__code-bg")) {
        return;
      }

      const background = document.createElement("div");
      const linesRoot = document.createElement("div");
      const overlay = document.createElement("div");
      const lineElements = codeLines.map((line, index) => {
        const lineElement = document.createElement("span");
        const visibleRatio = index < 4 ? 0.9 : 0.58;
        const startLength = Math.min(
          line.length,
          Math.floor(line.length * visibleRatio)
        );

        lineElement.className = "vpn-hero__code-line";
        lineElement.textContent = line.slice(0, startLength);

        return lineElement;
      });

      background.className = "vpn-hero__code-bg";
      background.setAttribute("aria-hidden", "true");

      linesRoot.className = "vpn-hero__code-lines";
      overlay.className = "vpn-hero__code-overlay";
      overlay.setAttribute("aria-hidden", "true");

      lineElements.forEach((lineElement) => {
        linesRoot.append(lineElement);
      });

      background.append(linesRoot);
      hero.prepend(background);
      hero.append(overlay);

      if (reducedMotion) {
        lineElements.forEach((lineElement, index) => {
          lineElement.textContent = codeLines[index];
        });

        return;
      }

      const cursor = document.createElement("span");
      let lineIndex = 4;
      let charIndex = lineElements[lineIndex].textContent.length;
      let lastTimestamp = 0;
      let storedProgress = 0;
      const charsPerSecond = 92;

      cursor.className = "vpn-hero__code-cursor";
      lineElements[lineIndex].append(cursor);

      function moveCursor() {
        cursor.remove();
        lineElements[lineIndex].append(cursor);
      }

      function tick(timestamp) {
        if (document.hidden) {
          lastTimestamp = timestamp;
          window.requestAnimationFrame(tick);
          return;
        }

        if (!lastTimestamp) {
          lastTimestamp = timestamp;
        }

        storedProgress += (
          (timestamp - lastTimestamp) /
          1000
        ) * charsPerSecond;
        lastTimestamp = timestamp;

        let charactersToType = Math.floor(storedProgress);

        if (charactersToType > 0) {
          storedProgress -= charactersToType;
        }

        while (charactersToType > 0) {
          const currentLine = codeLines[lineIndex];

          if (charIndex >= currentLine.length) {
            lineIndex = (lineIndex + 1) % codeLines.length;
            charIndex = 0;
            lineElements[lineIndex].textContent = "";
            moveCursor();
          }

          const batchSize = Math.min(
            charactersToType,
            currentLine.length - charIndex,
            5
          );

          lineElements[lineIndex].insertBefore(
            document.createTextNode(
              currentLine.slice(
                charIndex,
                charIndex + batchSize
              )
            ),
            cursor
          );

          charIndex += batchSize;
          charactersToType -= batchSize;
        }

        window.requestAnimationFrame(tick);
      }

      window.requestAnimationFrame(tick);
    });
  }

  function initAOS() {
    if (
      aosInitialised ||
      !window.AOS ||
      typeof window.AOS.init !==
        "function"
    ) {
      return;
    }

    const reducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

    if (reducedMotion) {
      return;
    }

    window.AOS.init({
      once: true,
      duration: 650,
      easing: "ease-out-cubic",
      offset: 42,
      delay: 0,
      mirror: false,
      anchorPlacement: "top-bottom"
    });

    aosInitialised = true;
  }

  function refreshAOS() {
    if (
      window.AOS &&
      aosInitialised &&
      typeof window.AOS.refreshHard ===
        "function"
    ) {
      window.AOS.refreshHard();
    }
  }

  function dispatchCommonReady() {
    document.dispatchEvent(
      new CustomEvent(
        "vpn:common-ready",
        {
          detail: {
            config: CONFIG
          }
        }
      )
    );
  }

  function initialiseCommon() {
    if (commonInitialised) {
      return;
    }

    commonInitialised = true;

    renderHeader();
    renderFooter();
    renderLegalNotice();

    applyConfigBindings(document);

    initHeaderInteractions();
    initAllSearchInstances();
    initLegalNotice();
    initForms(document);
    initMessageCounters(document);
    initAccordions(document);
    initTabs(document);
    bindQueryParameters(document);
    initExternalLinks();
    initHeroCodeBackground();
    initAOS();

    dispatchCommonReady();
  }

  window.VPNCommon = {
    config: CONFIG,
    getConfigValue,
    applyConfigBindings,
    initForms,
    initAccordions,
    initTabs,
    initAOS,
    initHeroCodeBackground,
    refreshAOS,
    bindQueryParameters,
    icons: ICONS
  };

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      initialiseCommon,
      {
        once: true
      }
    );
  } else {
    initialiseCommon();
  }

  window.addEventListener(
    "load",
    () => {
      initAOS();
      refreshAOS();
    },
    {
      once: true
    }
  );
})();

// Shared behaviour for every public page: navigation, data helpers, loading /
// empty / error states, the photo lightbox, and scroll-reveal animations.
const Site = (function () {
    document.documentElement.classList.remove("no-js");

    // ---------- DOM helpers ----------

    // Build elements safely: strings become text nodes, never HTML.
    function el(tag, props = {}, ...children) {
        const node = document.createElement(tag);

        Object.entries(props || {}).forEach(([key, value]) => {
            if (value === null || value === undefined || value === false) return;
            if (key === "className") node.className = value;
            else if (key === "text") node.textContent = value;
            else if (key === "html") node.innerHTML = value; // only for trusted icon markup
            else if (key === "dataset") Object.assign(node.dataset, value);
            else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value);
            else node.setAttribute(key, value === true ? "" : value);
        });

        children.flat().forEach(child => {
            if (child === null || child === undefined || child === false) return;
            node.append(child instanceof Node ? child : document.createTextNode(String(child)));
        });

        return node;
    }

    function image(src, alt, { className, eager = false, sizes } = {}) {
        const img = el("img", {
            src: normalizeImageUrl(src),
            alt: alt || "",
            className,
            loading: eager ? "eager" : "lazy",
            decoding: "async",
            sizes
        });
        img.addEventListener("error", () => {
            if (img.src !== DEFAULT_IMAGE_URL) img.src = DEFAULT_IMAGE_URL;
        }, { once: true });
        return img;
    }

    // ---------- Formatting ----------

    const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Dates arrive as "YYYY-MM-DD"; parse the parts directly so the displayed
    // day never shifts with the visitor's time zone.
    function dateParts(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
        return match ? { year: +match[1], month: +match[2], day: +match[3] } : null;
    }

    function formatDate(value, { short = false } = {}) {
        const parts = dateParts(value);
        if (!parts) return "Date not recorded";
        const month = MONTHS[parts.month - 1];
        return `${parts.day} ${short ? month.slice(0, 3) : month} ${parts.year}`;
    }

    function formatNumber(value, digits = 0) {
        return Number(value).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: digits
        });
    }

    function roomArea(room) {
        const length = Number(room.length);
        const width = Number(room.width);
        return length > 0 && width > 0 ? length * width : null;
    }

    function formatDistance(meters) {
        if (meters === null || meters === undefined || meters === "") return null;
        const value = Number(meters);
        return value >= 1000 ? `${formatNumber(value / 1000, 1)} km` : `${formatNumber(value)} m`;
    }

    // Typical walking pace of about 80 m per minute (4.8 km/h).
    function walkingTime(meters) {
        const value = Number(meters);
        if (!(value > 0)) return null;
        const minutes = Math.max(1, Math.round(value / 80));
        return minutes >= 60
            ? `about ${formatNumber(minutes / 60, 1)} h walk`
            : `about ${minutes} min walk`;
    }

    function locationLine(house) {
        if (!house) return "";
        return [house.village, house.sector, house.district, house.country].filter(Boolean).join(", ");
    }

    function categoryIcon(category = "") {
        const value = category.toLowerCase();
        if (/market|shop|store|mall/.test(value)) return "market";
        if (/school|educat|universit|college/.test(value)) return "school";
        if (/health|hospital|clinic|pharm|medical/.test(value)) return "health";
        if (/church|mosque|relig|worship|temple/.test(value)) return "worship";
        if (/road|bus|transport|station|taxi/.test(value)) return "road";
        if (/park|lake|nature|garden|beach/.test(value)) return "leaf";
        return "pin";
    }

    function materialIcon(component = "") {
        const value = component.toLowerCase();
        if (/roof/.test(value)) return "roof";
        if (/wall|brick/.test(value)) return "brick";
        if (/window|glass/.test(value)) return "window";
        if (/door/.test(value)) return "door";
        if (/floor|tile/.test(value)) return "floor";
        if (/foundation|base/.test(value)) return "foundation";
        if (/ceiling/.test(value)) return "layers";
        return "layers";
    }

    // ---------- States ----------

    function renderState(container, { type = "empty", title, message, retry } = {}) {
        const iconName = type === "error" ? "alert" : "inbox";
        const state = el("div", { className: `state state-${type}`, role: type === "error" ? "alert" : "status" },
            el("span", { html: icon(iconName) }),
            el("h3", { text: title || (type === "error" ? "Something went wrong" : "Nothing here yet") }),
            message ? el("p", { text: message }) : null,
            retry ? el("button", { className: "btn btn-ghost btn-sm", type: "button", onclick: retry, html: `${icon("refresh")} Try again` }) : null
        );
        container.replaceChildren(state);
        container.setAttribute("aria-busy", "false");
    }

    function renderSkeletons(container, count = 3, kind = "card") {
        container.setAttribute("aria-busy", "true");
        const items = Array.from({ length: count }, () => {
            if (kind === "line") {
                return el("div", { className: "card", style: "padding:22px" },
                    el("div", { className: "skeleton skeleton-line lg w-60" }),
                    el("div", { className: "skeleton skeleton-line w-100" }),
                    el("div", { className: "skeleton skeleton-line w-80" }));
            }
            if (kind === "photo") {
                return el("div", { className: "skeleton", style: "min-height:180px;border-radius:16px" });
            }
            return el("div", { className: "card skeleton-card", "aria-hidden": "true" },
                el("div", { className: "skeleton skeleton-media" }),
                el("div", { className: "card-body" },
                    el("div", { className: "skeleton skeleton-line lg w-60" }),
                    el("div", { className: "skeleton skeleton-line w-100" }),
                    el("div", { className: "skeleton skeleton-line w-40" })));
        });
        container.replaceChildren(...items);
    }

    // ---------- Data ----------

    let housePromise = null;
    let galleryPromise = null;

    function loadHouse() {
        if (!housePromise) {
            housePromise = getHouse().then(response => {
                if (!response || !response.success) throw new Error(response?.message || "Unable to load house information.");
                return response.data?.[0] || null;
            });
            housePromise.catch(() => { housePromise = null; });
        }
        return housePromise;
    }

    function loadGallery() {
        if (!galleryPromise) {
            galleryPromise = getGallery().then(response => {
                if (!response || !response.success) throw new Error(response?.message || "Unable to load gallery.");
                return response.data || [];
            });
            galleryPromise.catch(() => { galleryPromise = null; });
        }
        return galleryPromise;
    }

    // The house cover photo, falling back to the first gallery image.
    async function coverImage() {
        const house = await loadHouse().catch(() => null);
        if (house?.image_url) return { src: house.image_url, alt: house.name };
        const gallery = await loadGallery().catch(() => []);
        if (gallery.length) return { src: gallery[0].image_url, alt: gallery[0].caption || "" };
        return null;
    }

    // ---------- Map ----------

    function renderMap(container, house) {
        const lat = Number(house?.latitude);
        const lon = Number(house?.longitude);

        if (!house || house.latitude === null || house.longitude === null || !Number.isFinite(lat) || !Number.isFinite(lon)) {
            renderState(container, { title: "Map unavailable", message: "Coordinates for the home have not been added yet." });
            return;
        }

        const delta = 0.008;
        const bbox = [lon - delta, lat - delta * 0.6, lon + delta, lat + delta * 0.6].map(n => n.toFixed(6)).join(",");
        const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
        const link = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
        const directions = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

        container.replaceChildren(
            el("iframe", {
                className: "map-frame",
                src: embed,
                title: `Map showing the location of ${house.name}`,
                loading: "lazy",
                referrerpolicy: "no-referrer-when-downgrade"
            }),
            el("div", { className: "map-meta" },
                el("span", { text: `${lat.toFixed(5)}, ${lon.toFixed(5)}` }),
                el("div", { style: "display:flex;gap:8px;flex-wrap:wrap" },
                    el("a", { className: "btn btn-ghost btn-sm", href: link, target: "_blank", rel: "noopener", html: `${icon("external")} OpenStreetMap` }),
                    el("a", { className: "btn btn-sm", href: directions, target: "_blank", rel: "noopener", html: `${icon("pin")} Google Maps` })))
        );
    }

    // ---------- Lightbox ----------

    let lightbox = null;

    function buildLightbox() {
        const dialog = el("dialog", { className: "lightbox", "aria-label": "Photo viewer" });
        const counter = el("span", { className: "lightbox-counter" });
        const closeBtn = el("button", { className: "icon-btn", type: "button", "aria-label": "Close photo viewer", html: icon("close") });
        const img = el("img", { alt: "" });
        const prev = el("button", { className: "icon-btn lightbox-nav lightbox-prev", type: "button", "aria-label": "Previous photo", html: icon("chevronLeft") });
        const next = el("button", { className: "icon-btn lightbox-nav lightbox-next", type: "button", "aria-label": "Next photo", html: icon("chevronRight") });
        const title = el("h2");
        const text = el("p");

        dialog.append(
            el("div", { className: "lightbox-top" }, counter, closeBtn),
            el("div", { className: "lightbox-stage" }, prev, img, next),
            el("div", { className: "lightbox-caption", "aria-live": "polite" }, title, text)
        );

        const state = { items: [], index: 0 };

        function show(index) {
            const count = state.items.length;
            state.index = (index + count) % count;
            const item = state.items[state.index];
            img.src = normalizeImageUrl(item.src);
            img.alt = item.title || "Photo";
            title.textContent = item.title || "";
            text.textContent = item.text || "";
            text.hidden = !item.text;
            counter.textContent = count > 1 ? `${state.index + 1} / ${count}` : "";
            prev.hidden = next.hidden = count < 2;
        }

        closeBtn.addEventListener("click", () => dialog.close());
        prev.addEventListener("click", () => show(state.index - 1));
        next.addEventListener("click", () => show(state.index + 1));
        dialog.addEventListener("click", event => {
            if (event.target === dialog || event.target.classList.contains("lightbox-stage")) dialog.close();
        });
        dialog.addEventListener("keydown", event => {
            if (event.key === "ArrowLeft") show(state.index - 1);
            if (event.key === "ArrowRight") show(state.index + 1);
        });

        let touchStart = null;
        dialog.addEventListener("touchstart", event => { touchStart = event.touches[0].clientX; }, { passive: true });
        dialog.addEventListener("touchend", event => {
            if (touchStart === null) return;
            const delta = event.changedTouches[0].clientX - touchStart;
            if (Math.abs(delta) > 50) show(state.index + (delta < 0 ? 1 : -1));
            touchStart = null;
        });

        dialog.addEventListener("close", () => document.body.style.removeProperty("overflow"));

        document.body.append(dialog);
        return { dialog, state, show };
    }

    function openLightbox(items, index = 0) {
        if (!items.length) return;
        lightbox = lightbox || buildLightbox();
        lightbox.state.items = items;
        lightbox.show(index);
        document.body.style.overflow = "hidden";
        lightbox.dialog.showModal();
    }

    // ---------- Motion ----------

    const revealObserver = "IntersectionObserver" in window
        ? new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { rootMargin: "0px 0px -60px 0px", threshold: 0.08 })
        : null;

    function reveal(root = document) {
        const targets = root.matches?.(".reveal") ? [root] : root.querySelectorAll(".reveal:not(.is-visible)");
        targets.forEach((target, index) => {
            if (!revealObserver) {
                target.classList.add("is-visible");
                return;
            }
            target.style.transitionDelay = `${Math.min(index, 6) * 60}ms`;
            revealObserver.observe(target);
        });
    }

    // ---------- Layout ----------

    function initNav() {
        const header = document.querySelector(".site-header");
        const toggle = document.querySelector(".nav-toggle");
        if (!header || !toggle) return;

        const setOpen = open => {
            header.classList.toggle("nav-open", open);
            toggle.setAttribute("aria-expanded", String(open));
            toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            toggle.innerHTML = icon(open ? "close" : "menu");
        };

        toggle.addEventListener("click", () => setOpen(!header.classList.contains("nav-open")));
        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && header.classList.contains("nav-open")) {
                setOpen(false);
                toggle.focus();
            }
        });
        header.querySelectorAll(".nav-menu a").forEach(link => link.addEventListener("click", () => setOpen(false)));
        window.matchMedia("(min-width: 1025px)").addEventListener("change", () => setOpen(false));
        setOpen(false);
    }

    async function fillChrome() {
        document.querySelectorAll("[data-year]").forEach(node => { node.textContent = new Date().getFullYear(); });

        const house = await loadHouse().catch(() => null);
        if (house) {
            document.querySelectorAll("[data-house-location]").forEach(node => {
                node.textContent = locationLine(house);
            });
            document.querySelectorAll("[data-house-name]").forEach(node => {
                node.textContent = house.name;
            });
        }

        const hero = document.querySelector(".page-hero");
        if (hero) {
            const cover = await coverImage();
            if (cover) {
                const url = normalizeImageUrl(cover.src);
                // Preload so the background appears without a flash.
                const preload = new Image();
                preload.onload = () => hero.style.setProperty("--hero-image", `url("${url.replace(/"/g, "%22")}")`);
                preload.src = url;
            }
        }
    }

    function ready(fn) {
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
        else fn();
    }

    ready(() => {
        initNav();
        fillChrome();
        reveal();
    });

    return {
        el,
        image,
        ready,
        formatDate,
        dateParts,
        formatNumber,
        formatDistance,
        walkingTime,
        roomArea,
        locationLine,
        categoryIcon,
        materialIcon,
        renderState,
        renderSkeletons,
        loadHouse,
        loadGallery,
        coverImage,
        renderMap,
        openLightbox,
        reveal
    };
})();

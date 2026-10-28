// Generic management module used by the Rooms, Gallery, Materials, History and
// Nearby Places pages. Each page passes a configuration describing its fields,
// table columns, filters, and API functions.
const AdminForm = (function () {
    const { el } = Admin;

    let housesPromise = null;

    function loadHouses() {
        if (!housesPromise) {
            housesPromise = getHouse().then(response => (response.success ? response.data || [] : []));
        }
        return housesPromise;
    }

    // Build form controls from field definitions.
    // Field: { name, label, type, required, maxlength, min, max, step, placeholder, hint, full, options, suggestions }
    function build(fields) {
        const controls = {};
        const nodes = fields.map(field => {
            if (field.type === "image") {
                const image = Admin.createImageField({ label: field.label, required: field.required, hint: field.hint });
                controls[field.name] = { field, image, wrapper: image.element };
                return image.element;
            }

            const id = `field-${field.name}`;
            let input;

            if (field.type === "textarea") {
                input = el("textarea", { id, name: field.name, rows: field.rows || 5, maxlength: field.maxlength, placeholder: field.placeholder });
            } else if (field.type === "select" || field.type === "house") {
                input = el("select", { id, name: field.name });
            } else {
                input = el("input", {
                    id,
                    name: field.name,
                    type: field.type || "text",
                    maxlength: field.maxlength,
                    min: field.min,
                    max: field.max,
                    step: field.step,
                    placeholder: field.placeholder,
                    inputmode: field.inputmode,
                    autocomplete: "off",
                    list: field.suggestions ? `${id}-list` : null
                });
            }

            if (field.required) input.required = true;

            const error = el("p", { className: "field-error", id: `${id}-error`, hidden: true });
            const count = field.maxlength && (field.type === "textarea" || field.maxlength >= 100)
                ? el("span", { className: "char-count", "aria-hidden": "true" })
                : null;
            input.setAttribute("aria-describedby", `${id}-error${field.hint ? ` ${id}-hint` : ""}`);

            const wrapper = el("div", { className: `form-field${field.full || field.type === "textarea" ? " full" : ""}` },
                el("label", { for: id }, field.label, field.required ? el("span", { className: "required", "aria-hidden": "true", text: "*" }) : null),
                input,
                field.suggestions ? el("datalist", { id: `${id}-list` }) : null,
                field.hint ? el("p", { className: "form-hint", id: `${id}-hint`, text: field.hint }) : null,
                count,
                error);

            if (count) {
                const update = () => { count.textContent = `${input.value.length} / ${field.maxlength}`; };
                input.addEventListener("input", update);
                controls[field.name] = { field, input, wrapper, error, updateCount: update };
            } else {
                controls[field.name] = { field, input, wrapper, error };
            }

            input.addEventListener("input", () => setError(controls[field.name], ""));
            return wrapper;
        });

        return { nodes, controls };
    }

    async function populateOptions(controls, items = []) {
        for (const control of Object.values(controls)) {
            const { field, input } = control;
            if (!input) continue;

            if (field.type === "house") {
                const houses = await loadHouses();
                input.replaceChildren(
                    el("option", { value: "", text: houses.length ? "Select a house" : "No houses found — create one first" }),
                    ...houses.map(house => el("option", { value: house.id, text: house.name })));
                input.disabled = !houses.length;
                // Single-house sites: hide the selector and use that house.
                control.wrapper.hidden = houses.length === 1;
                control.defaultValue = houses.length === 1 ? String(houses[0].id) : "";
            }

            if (field.type === "select") {
                input.replaceChildren(...field.options.map(option =>
                    el("option", { value: option.value ?? option, text: option.label ?? option })));
            }

            if (field.suggestions) {
                const values = [...new Set([...(field.suggestions === true ? [] : field.suggestions), ...items.map(item => item[field.name]).filter(Boolean)])];
                control.wrapper.querySelector("datalist").replaceChildren(...values.sort().map(value => el("option", { value })));
            }
        }
    }

    function setError(control, message) {
        if (!control || !control.error) return;
        control.error.textContent = message || "";
        control.error.hidden = !message;
        control.wrapper.classList.toggle("invalid", Boolean(message));
        if (control.input) control.input.setAttribute("aria-invalid", message ? "true" : "false");
    }

    function fill(controls, record) {
        Object.values(controls).forEach(control => {
            const { field } = control;
            if (control.image) {
                control.image.reset(record ? record[field.imageUrlKey || "image_url"] || null : null);
                return;
            }

            let value = record ? record[field.name] : undefined;
            if (value === undefined || value === null) value = control.defaultValue ?? field.defaultValue ?? "";
            if (field.type === "date" && value) value = String(value).slice(0, 10);
            if (field.type === "number" && value !== "") value = Number(value);
            control.input.value = value;
            control.updateCount?.();
            setError(control, "");
        });
    }

    function read(controls) {
        const data = {};
        Object.values(controls).forEach(({ field, input }) => {
            if (!input) return;
            data[field.name] = input.value.trim();
        });
        return data;
    }

    // Client-side validation mirrors the API rules; the server re-validates.
    function validate(controls) {
        let firstInvalid = null;

        Object.values(controls).forEach(control => {
            const { field, input } = control;

            if (control.image) {
                if (!control.image.validate() && !firstInvalid) firstInvalid = control.image.input;
                return;
            }

            const value = input.value.trim();
            let message = "";

            if (field.required && !value) {
                message = field.type === "house" ? "Select a house." : `${field.label} is required.`;
            } else if (value && field.maxlength && value.length > field.maxlength) {
                message = `${field.label} cannot exceed ${field.maxlength} characters.`;
            } else if (value && field.type === "number") {
                const number = Number(value);
                if (!Number.isFinite(number)) message = `${field.label} must be a number.`;
                else if (field.integer && !Number.isInteger(number)) message = `${field.label} must be a whole number.`;
                else if (field.exclusiveMin !== undefined && number <= field.exclusiveMin) message = `${field.label} must be greater than ${field.exclusiveMin}.`;
                else if (field.min !== undefined && number < field.min) message = `${field.label} must be at least ${field.min}.`;
                else if (field.max !== undefined && number > field.max) message = `${field.label} cannot be greater than ${field.max}.`;
            } else if (value && field.type === "date" && Number.isNaN(Date.parse(value))) {
                message = `${field.label} must be a valid date.`;
            }

            setError(control, message);
            if (message && !firstInvalid) firstInvalid = input;
        });

        if (firstInvalid) {
            // Reveal a hidden house selector if it is the problem.
            firstInvalid.closest("[hidden]")?.removeAttribute("hidden");
            firstInvalid.focus();
        }

        return !firstInvalid;
    }

    function snapshot(controls) {
        return JSON.stringify(read(controls)) + Object.values(controls).map(control => control.image?.hasChange() ? "1" : "0").join("");
    }

    return { build, populateOptions, fill, read, validate, snapshot, loadHouses };
})();


function AdminResource(config) {
    const { el } = Admin;

    const state = {
        items: [],
        search: "",
        filters: {},
        sort: config.defaultSort || null,
        editing: null,
        loading: true,
        error: null
    };

    const root = document.getElementById(config.mount || "resource");
    const { nodes: formNodes, controls } = AdminForm.build(config.fields);
    const imageControl = Object.values(controls).find(control => control.image);

    // ---------- Layout ----------

    const searchInput = el("input", { className: "input", type: "search", placeholder: config.searchPlaceholder || "Search…", "aria-label": `Search ${config.plural}` });
    const count = el("span", { className: "result-count", "aria-live": "polite" });
    const addBtn = el("button", { className: "btn", type: "button", html: `${icon("plus")} ${config.addLabel || `Add ${config.singular}`}` });

    const filterSelects = (config.filters || []).map(filter => {
        const select = el("select", { className: "input", "aria-label": filter.label, style: "width:auto" });
        select.addEventListener("change", () => {
            state.filters[filter.key] = select.value;
            render();
        });
        return { filter, select };
    });

    const body = el("div", { "aria-live": "polite" });

    root.replaceChildren(el("section", { className: "panel" },
        el("div", { className: "toolbar" },
            el("label", { className: "search" }, el("span", { html: icon("search") }), searchInput),
            ...filterSelects.map(({ select }) => select),
            count,
            el("span", { className: "toolbar-spacer" }),
            addBtn),
        body));

    // ---------- Drawer form ----------

    const formTitle = el("h2", { id: `${config.key}-form-title` });
    const formAlert = el("div", { className: "form-alert", role: "alert", hidden: true });
    const submitBtn = el("button", { className: "btn", type: "submit", form: `${config.key}-form` });
    const cancelBtn = el("button", { className: "btn btn-secondary", type: "button", text: "Cancel" });
    const closeBtn = el("button", { className: "icon-btn", type: "button", "aria-label": "Close", html: icon("close") });
    const form = el("form", { id: `${config.key}-form`, className: "form-grid", novalidate: true }, ...formNodes);

    const drawer = el("dialog", { className: "drawer", "aria-labelledby": formTitle.id },
        el("div", { className: "drawer-head" }, formTitle, closeBtn),
        el("div", { className: "drawer-body" }, formAlert, form),
        el("div", { className: "drawer-foot" }, el("div", { className: "form-actions" }, cancelBtn, submitBtn)));

    let initialSnapshot = "";

    async function requestClose() {
        if (AdminForm.snapshot(controls) !== initialSnapshot) {
            const discard = await Admin.confirm({
                title: "Discard changes?",
                message: "You have unsaved changes in this form.",
                confirmText: "Discard",
                danger: false
            });
            if (!discard) return;
        }
        drawer.close();
    }

    drawer.addEventListener("cancel", event => {
        event.preventDefault();
        requestClose();
    });
    closeBtn.addEventListener("click", requestClose);
    cancelBtn.addEventListener("click", requestClose);

    // ---------- Detail view ----------

    const viewTitle = el("h2", { id: `${config.key}-view-title` });
    const viewBody = el("div", { className: "drawer-body" });
    const viewEditBtn = el("button", { className: "btn", type: "button", html: `${icon("edit")} Edit` });
    const viewCloseBtn = el("button", { className: "icon-btn", type: "button", "aria-label": "Close", html: icon("close") });
    const viewer = el("dialog", { className: "drawer", "aria-labelledby": viewTitle.id },
        el("div", { className: "drawer-head" }, viewTitle, viewCloseBtn),
        viewBody,
        el("div", { className: "drawer-foot" }, el("div", { className: "form-actions" },
            config.publicUrl ? el("a", { className: "btn btn-secondary", href: config.publicUrl, target: "_blank", rel: "noopener", html: `${icon("external")} View on website` }) : null,
            viewEditBtn)));

    viewCloseBtn.addEventListener("click", () => viewer.close());

    document.body.append(drawer, viewer);

    // ---------- Data ----------

    const idOf = item => String(item.id);
    const titleOf = item => (config.titleOf ? config.titleOf(item) : item.name) || `${config.singular} #${item.id}`;

    async function load() {
        state.loading = true;
        state.error = null;
        render();

        const response = await config.api.list();

        state.loading = false;

        if (!response || !response.success) {
            state.error = response?.message || `Unable to load ${config.plural}.`;
        } else {
            state.items = response.data || [];
            await AdminForm.populateOptions(controls, state.items);
            refreshFilterOptions();
        }

        render();
        config.onLoad?.(state.items);
    }

    function refreshFilterOptions() {
        filterSelects.forEach(({ filter, select }) => {
            const values = [...new Set(state.items.map(item => item[filter.key]).filter(Boolean))].sort();
            const current = select.value;
            select.replaceChildren(el("option", { value: "", text: filter.label }), ...values.map(value => el("option", { value, text: value })));
            select.value = values.includes(current) ? current : "";
            select.hidden = values.length < 2;
        });
    }

    function visibleItems() {
        const query = state.search.toLowerCase();
        let items = state.items.filter(item => {
            const matchesSearch = !query || config.searchText(item).toLowerCase().includes(query);
            const matchesFilters = Object.entries(state.filters).every(([key, value]) => !value || item[key] === value);
            return matchesSearch && matchesFilters;
        });

        if (state.sort) {
            const column = config.columns.find(col => col.key === state.sort.key);
            const value = column?.sortValue || (item => item[state.sort.key]);
            items = items.slice().sort((a, b) => {
                const left = value(a);
                const right = value(b);
                const result = typeof left === "number" && typeof right === "number"
                    ? left - right
                    : String(left ?? "").localeCompare(String(right ?? ""), undefined, { numeric: true });
                return state.sort.dir === "desc" ? -result : result;
            });
        }

        return items;
    }

    // ---------- Rendering ----------

    function actionButtons(item) {
        const name = titleOf(item);
        return el("div", { className: "cell-actions" },
            el("button", { className: "icon-btn icon-btn-sm", type: "button", title: "View", "aria-label": `View ${name}`, html: icon("eye"), onclick: () => openViewer(item) }),
            el("button", { className: "icon-btn icon-btn-sm", type: "button", title: "Edit", "aria-label": `Edit ${name}`, html: icon("edit"), onclick: () => openForm(item) }),
            el("button", { className: "icon-btn icon-btn-sm danger", type: "button", title: "Delete", "aria-label": `Delete ${name}`, html: icon("trash"), onclick: () => remove(item) }));
    }

    function renderTable(items) {
        const headerCells = config.columns.map(column => {
            if (!column.key || column.sortable === false) return el("th", { scope: "col", text: column.label });
            const active = state.sort?.key === column.key;
            const button = el("button", {
                className: "th-sort",
                type: "button",
                "aria-sort": active ? (state.sort.dir === "asc" ? "ascending" : "descending") : null,
                text: `${column.label}${active ? (state.sort.dir === "asc" ? " ↑" : " ↓") : ""}`,
                onclick: () => {
                    state.sort = active && state.sort.dir === "asc" ? { key: column.key, dir: "desc" } : { key: column.key, dir: "asc" };
                    render();
                }
            });
            return el("th", { scope: "col" }, button);
        });

        const rows = items.map(item => el("tr", { dataset: { id: idOf(item) } },
            ...config.columns.map(column => el("td", {
                "data-label": column.label,
                className: column.media ? "td-media" : null
            }, column.render ? column.render(item) : (item[column.key] ?? "—"))),
            el("td", { className: "td-actions" }, actionButtons(item))));

        return el("div", { className: "table-wrap" },
            el("table", { className: "data-table" },
                el("thead", {}, el("tr", {}, ...headerCells, el("th", { scope: "col" }, el("span", { className: "visually-hidden", text: "Actions" })))),
                el("tbody", {}, ...rows)));
    }

    function renderGrid(items) {
        return el("div", { className: "card-grid" }, ...items.map(item =>
            el("article", { className: "media-card", dataset: { id: idOf(item) } },
                Admin.thumb(item.image_url, titleOf(item), ""),
                el("div", { className: "media-card-body" }, config.cardBody(item)),
                actionButtons(item))));
    }

    function render() {
        addBtn.disabled = state.loading || Boolean(state.error);

        if (state.loading) {
            count.textContent = "";
            body.setAttribute("aria-busy", "true");
            body.replaceChildren(el("div", { className: "panel-body", style: "display:grid;gap:14px" },
                ...Array.from({ length: 4 }, () => el("div", { className: "skeleton", style: "height:48px" }))));
            return;
        }

        body.setAttribute("aria-busy", "false");

        if (state.error) {
            count.textContent = "";
            body.replaceChildren(el("div", { className: "empty error", role: "alert" },
                el("span", { html: icon("alert") }),
                el("strong", { text: `Unable to load ${config.plural}` }),
                el("p", { text: state.error }),
                el("button", { className: "btn btn-secondary btn-sm", type: "button", html: `${icon("refresh")} Try again`, onclick: load })));
            return;
        }

        const items = visibleItems();
        count.textContent = items.length === state.items.length
            ? `${state.items.length} ${state.items.length === 1 ? config.singular : config.plural}`
            : `${items.length} of ${state.items.length} shown`;

        if (!state.items.length) {
            body.replaceChildren(el("div", { className: "empty" },
                el("span", { html: icon(config.icon || "inbox") }),
                el("strong", { text: `No ${config.plural} yet` }),
                el("p", { text: config.emptyText || `Add the first ${config.singular} to show it on the website.` }),
                el("button", { className: "btn btn-sm", type: "button", html: `${icon("plus")} ${config.addLabel || `Add ${config.singular}`}`, onclick: () => openForm() })));
            return;
        }

        if (!items.length) {
            body.replaceChildren(el("div", { className: "empty" },
                el("span", { html: icon("search") }),
                el("strong", { text: "No matches" }),
                el("p", { text: "Try a different search or filter." })));
            return;
        }

        body.replaceChildren(config.view === "grid" ? renderGrid(items) : renderTable(items));
    }

    function flash(id) {
        const node = body.querySelector(`[data-id="${CSS.escape(String(id))}"]`);
        if (!node) return;
        node.scrollIntoView({ block: "nearest", behavior: "smooth" });
        node.animate([{ backgroundColor: "var(--primary-soft)" }, { backgroundColor: "transparent" }], { duration: 1600 });
    }

    // ---------- Actions ----------

    function openForm(item = null) {
        state.editing = item;
        formTitle.textContent = item ? `Edit ${config.singular}` : (config.addLabel || `Add ${config.singular}`);
        submitBtn.innerHTML = item ? `${icon("check")} Save changes` : `${icon("plus")} ${config.createLabel || `Create ${config.singular}`}`;
        formAlert.hidden = true;
        if (imageControl) imageControl.image.setRequired(item ? imageControl.field.required : imageControl.field.required || imageControl.field.requiredOnCreate);
        AdminForm.fill(controls, item);
        if (imageControl) imageControl.image.setProgress(null);
        initialSnapshot = AdminForm.snapshot(controls);
        drawer.showModal();
        drawer.querySelector("input:not([type=file]):not([hidden]), textarea, select")?.focus();
    }

    function openViewer(item) {
        viewTitle.textContent = titleOf(item);
        const rows = config.fields
            .filter(field => field.type !== "image" && field.type !== "house")
            .map(field => {
                const raw = item[field.name];
                const value = config.formatValue?.(field.name, raw, item) ?? raw;
                return el("div", { className: field.type === "textarea" ? "full" : "" },
                    el("dt", { text: field.label }),
                    el("dd", { text: value === null || value === undefined || value === "" ? "—" : value }));
            });

        viewBody.replaceChildren(
            imageControl ? Admin.thumb(item.image_url, titleOf(item), "detail-image") : null,
            el("dl", { className: "detail-grid" }, ...rows,
                el("div", {}, el("dt", { text: "Record ID" }), el("dd", { text: item.id })),
                item.house_name ? el("div", {}, el("dt", { text: "House" }), el("dd", { text: item.house_name })) : null));

        viewEditBtn.onclick = () => {
            viewer.close();
            openForm(item);
        };
        viewer.showModal();
    }

    async function save(event) {
        event.preventDefault();
        formAlert.hidden = true;

        if (!AdminForm.validate(controls)) return;

        const data = AdminForm.read(controls);
        let payload = data;

        if (config.multipart) {
            payload = new FormData();
            Object.entries(data).forEach(([key, value]) => payload.append(key, value));
            const file = imageControl ? await imageControl.image.getFile() : null;
            if (file) payload.append("image", file, file.name);
        }

        const options = imageControl ? { onProgress: fraction => imageControl.image.setProgress(fraction) } : undefined;

        Admin.setBusy(submitBtn, true);
        const response = state.editing
            ? await config.api.update(state.editing.id, payload, options)
            : await config.api.create(payload, options);
        Admin.setBusy(submitBtn, false);
        if (imageControl) imageControl.image.setProgress(null);

        if (!response || !response.success) {
            formAlert.replaceChildren(el("span", { html: icon("alert") }), el("div", { text: response?.message || `Unable to save ${config.singular}.` }));
            formAlert.hidden = false;
            formAlert.scrollIntoView({ block: "nearest" });
            return;
        }

        const saved = response.data;
        const index = state.items.findIndex(item => idOf(item) === idOf(saved));
        if (index >= 0) state.items[index] = { ...state.items[index], ...saved };
        else state.items.push(saved);

        initialSnapshot = AdminForm.snapshot(controls);
        drawer.close();
        Admin.toast(`${titleOf(saved)} ${state.editing ? "updated" : "created"}.`);

        await AdminForm.populateOptions(controls, state.items);
        refreshFilterOptions();
        render();
        flash(saved.id);
        config.onLoad?.(state.items);
    }

    async function remove(item) {
        const ok = await Admin.confirm({
            title: `Delete ${config.singular}?`,
            message: `"${titleOf(item)}" will be permanently removed from the website. This cannot be undone.`,
            confirmText: "Delete"
        });
        if (!ok) return;

        const response = await config.api.remove(item.id);

        if (!response || !response.success) {
            Admin.toast(response?.message || `Unable to delete ${config.singular}.`, "error");
            return;
        }

        state.items = state.items.filter(existing => idOf(existing) !== idOf(item));
        refreshFilterOptions();
        render();
        Admin.toast(`${titleOf(item)} deleted.`);
        config.onLoad?.(state.items);
    }

    // ---------- Wiring ----------

    form.addEventListener("submit", save);
    addBtn.addEventListener("click", () => openForm());

    let searchTimer;
    searchInput.addEventListener("input", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            state.search = searchInput.value.trim();
            render();
        }, 120);
    });

    // Support links such as rooms.html?new=1 from the dashboard.
    load().then(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.has("new") && !state.error) openForm();
        const editId = params.get("edit");
        const item = editId && state.items.find(existing => idOf(existing) === editId);
        if (item) openForm(item);
    });

    return { reload: load, openForm };
}

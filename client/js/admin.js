// Shared behaviour for every administration page: authentication gate, shell
// (sidebar, logout, mobile menu), toasts, confirmation dialogs, and the image
// upload field.
const Admin = (function () {

    // ---------- DOM helpers ----------

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

    function thumb(src, alt, className = "thumb") {
        const img = el("img", { className, src: normalizeImageUrl(src), alt: alt || "", loading: "lazy", decoding: "async" });
        img.addEventListener("error", () => { if (img.src !== DEFAULT_IMAGE_URL) img.src = DEFAULT_IMAGE_URL; }, { once: true });
        return img;
    }

    // ---------- Formatting ----------

    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    function formatDate(value) {
        const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || "");
        return match ? `${+match[3]} ${MONTHS[+match[2] - 1]} ${match[1]}` : "—";
    }

    // Timestamps from the API are UTC ("...Z"); show them in local time.
    function timeAgo(value) {
        if (!value) return "";
        const date = new Date(value);
        const seconds = Math.round((Date.now() - date.getTime()) / 1000);
        if (seconds < 45) return "just now";
        const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
        for (const [unit, size] of units) {
            if (seconds >= size) {
                const count = Math.floor(seconds / size);
                return `${count} ${unit}${count === 1 ? "" : "s"} ago`;
            }
        }
        return "just now";
    }

    function formatBytes(bytes) {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
        return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
    }

    // ---------- Toasts ----------

    function toast(message, type = "success") {
        let stack = document.querySelector(".toasts");
        if (!stack) {
            stack = el("div", { className: "toasts", role: "status", "aria-live": "polite" });
            document.body.append(stack);
        }

        const item = el("div", { className: `toast ${type}` },
            el("span", { html: icon(type === "error" ? "alert" : "check") }),
            el("div", { text: message }));
        stack.append(item);

        setTimeout(() => {
            item.classList.add("leaving");
            setTimeout(() => item.remove(), 250);
        }, type === "error" ? 6000 : 3500);
    }

    // ---------- Confirmation dialog ----------

    // Resolves true when confirmed. `requireText` makes the user type a value
    // (e.g. a house name) before a destructive action is allowed.
    function confirm({ title = "Are you sure?", message = "", confirmText = "Delete", danger = true, requireText = null } = {}) {
        return new Promise(resolve => {
            const typed = requireText
                ? el("input", { className: "input", type: "text", autocomplete: "off", "aria-label": `Type ${requireText} to confirm` })
                : null;
            const okBtn = el("button", { className: `btn ${danger ? "btn-danger" : ""}`, type: "button", text: confirmText });
            const cancelBtn = el("button", { className: "btn btn-secondary", type: "button", text: "Cancel" });

            const dialog = el("dialog", { className: "modal", "aria-labelledby": "confirmTitle" },
                el("div", { className: "modal-body" },
                    el("span", { className: `modal-icon ${danger ? "" : "neutral"}`, html: icon(danger ? "trash" : "alert") }),
                    el("div", {},
                        el("h2", { id: "confirmTitle", text: title }),
                        el("p", { text: message }),
                        typed ? el("div", { className: "form-field" },
                            el("label", {}, "Type ", el("strong", { text: requireText }), " to confirm"),
                            typed) : null)),
                el("div", { className: "form-actions" }, cancelBtn, okBtn));

            if (typed) {
                okBtn.disabled = true;
                typed.addEventListener("input", () => { okBtn.disabled = typed.value.trim() !== requireText; });
            }

            let result = false;
            okBtn.addEventListener("click", () => { result = true; dialog.close(); });
            cancelBtn.addEventListener("click", () => dialog.close());
            dialog.addEventListener("close", () => {
                dialog.remove();
                resolve(result);
            });

            document.body.append(dialog);
            dialog.showModal();
            (typed || cancelBtn).focus();
        });
    }

    // ---------- Busy buttons ----------

    function setBusy(button, busy, busyLabel = "Saving…") {
        if (!button) return;
        if (busy) {
            button.dataset.label = button.innerHTML;
            button.disabled = true;
            button.setAttribute("aria-busy", "true");
            button.innerHTML = "";
            button.append(el("span", { className: "spinner", "aria-hidden": "true" }), busyLabel);
        } else {
            button.disabled = false;
            button.removeAttribute("aria-busy");
            if (button.dataset.label) button.innerHTML = button.dataset.label;
        }
    }

    // ---------- Image upload field ----------

    const MAX_BYTES = 10 * 1024 * 1024;
    // Larger originals are accepted because they are downscaled before upload.
    const MAX_SOURCE_BYTES = 30 * 1024 * 1024;
    const MAX_DIMENSION = 2400;

    function canvasToBlob(canvas, type, quality) {
        return new Promise(resolve => canvas.toBlob(resolve, type, quality));
    }

    // Identify the real format from the file's first bytes; file names and the
    // browser-reported type are often wrong (e.g. AVIF photos saved as .jpg).
    async function sniffType(file) {
        const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
        const ascii = (start, end) => String.fromCharCode(...bytes.slice(start, end));
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
        if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
        if (ascii(0, 4) === "GIF8") return "image/gif";
        if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
        return null;
    }

    // Prepare a photo for upload: formats the server does not accept (AVIF,
    // HEIC where supported, ...) are converted, and very large photos are
    // downscaled. GIFs are left untouched so animations survive, and an
    // accepted original is kept whenever re-encoding would not make it smaller.
    async function optimizeImage(file) {
        const realType = await sniffType(file);
        if (realType === "image/gif") return file;

        const mustConvert = !realType;
        if (!window.createImageBitmap) {
            if (mustConvert) throw new Error("This image format is not supported. Please choose a JPG, PNG or WEBP photo.");
            return file;
        }

        let bitmap;
        try {
            bitmap = await createImageBitmap(file);
        } catch (error) {
            if (mustConvert) throw new Error("This file could not be read as an image. Please choose a JPG, PNG or WEBP photo.");
            return file;
        }

        const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
        if (!mustConvert && scale === 1 && file.size < 1.5 * 1024 * 1024) {
            bitmap.close?.();
            return file;
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close?.();

        // JPEG for photos; WebP keeps transparency for PNG/WebP sources.
        let targetType = realType === "image/png" || realType === "image/webp" ? "image/webp" : "image/jpeg";
        let blob = await canvasToBlob(canvas, targetType, 0.86);

        if (!blob || blob.type !== targetType) {
            // Browser cannot encode WebP: fall back to JPEG.
            targetType = "image/jpeg";
            blob = await canvasToBlob(canvas, targetType, 0.86);
        }

        if (!mustConvert && (!blob || blob.size >= file.size)) return file;
        if (!blob) throw new Error("This image could not be converted. Please choose a JPG, PNG or WEBP photo.");

        const extension = targetType === "image/jpeg" ? ".jpg" : ".webp";
        const name = file.name.replace(/\.[^.]+$/, "") + extension;
        return new File([blob], name, { type: targetType, lastModified: Date.now() });
    }

    function createImageField({ label = "Image", required = false, hint } = {}) {
        const input = el("input", { type: "file", accept: "image/*", "aria-label": label });
        const zone = el("label", { className: "dropzone" },
            el("span", { html: icon("upload") }),
            el("strong", { text: "Choose a photo or drag it here" }),
            el("span", { text: "JPG, PNG, WEBP or GIF · up to 10 MB" }),
            input);

        const previewImg = el("img", { alt: "Selected image preview" });
        const previewName = el("strong");
        const previewMeta = el("small");
        const previewBadge = el("span", { className: "badge" });
        const replaceBtn = el("button", { className: "btn btn-secondary btn-sm", type: "button", html: `${icon("upload")} Replace` });
        const undoBtn = el("button", { className: "btn btn-ghost btn-sm", type: "button", text: "Keep current image" });
        const removeBtn = el("button", { className: "btn btn-ghost btn-sm", type: "button", text: "Remove" });
        const preview = el("div", { className: "upload-preview", hidden: true },
            previewImg,
            el("div", {}, previewName, previewMeta, previewBadge,
                el("div", { className: "upload-actions" }, replaceBtn, undoBtn, removeBtn)));

        const progressBar = el("span");
        const progress = el("div", { className: "progress", hidden: true, role: "progressbar", "aria-label": "Upload progress", "aria-valuemin": "0", "aria-valuemax": "100" }, progressBar);
        const error = el("p", { className: "field-error", hidden: true, role: "alert" });

        const requiredMark = el("span", { className: "required", "aria-hidden": "true", text: "*", hidden: !required });
        const field = el("div", { className: "form-field full upload" },
            el("span", { className: "form-label" }, label, requiredMark),
            zone, preview, progress,
            hint ? el("p", { className: "form-hint", text: hint }) : null,
            error);

        const state = { file: null, currentUrl: null, objectUrl: null, preparing: null, required };

        function showError(message) {
            error.textContent = message || "";
            error.hidden = !message;
            field.classList.toggle("invalid", Boolean(message));
        }

        function render() {
            const hasNew = Boolean(state.file);
            const hasCurrent = Boolean(state.currentUrl);
            zone.hidden = hasNew || hasCurrent;
            preview.hidden = !(hasNew || hasCurrent);
            undoBtn.hidden = !(hasNew && hasCurrent);
            removeBtn.hidden = !(hasNew && !hasCurrent);

            if (hasNew) {
                previewImg.src = state.objectUrl;
                previewName.textContent = state.file.name;
                previewMeta.textContent = formatBytes(state.file.size);
                previewBadge.textContent = hasCurrent ? "New image — will replace the current one" : "Ready to upload";
                previewBadge.className = "badge warn";
            } else if (hasCurrent) {
                previewImg.src = normalizeImageUrl(state.currentUrl);
                previewName.textContent = "Current image";
                previewMeta.textContent = "Choose Replace to upload a different photo.";
                previewBadge.textContent = "Saved";
                previewBadge.className = "badge";
            }
        }

        function clearNew() {
            if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
            state.file = null;
            state.objectUrl = null;
            input.value = "";
            field.dispatchEvent(new Event("change", { bubbles: true }));
            render();
        }

        async function accept(file) {
            showError("");
            if (!file) return;

            if (!file.type.startsWith("image/") && !/\.(jpe?g|png|gif|webp|avif|heic|heif)$/i.test(file.name)) {
                showError("Please choose an image file (JPG, PNG, WEBP or GIF).");
                input.value = "";
                return;
            }

            if (file.size > MAX_SOURCE_BYTES) {
                showError(`This image is ${formatBytes(file.size)}. Please choose one under ${formatBytes(MAX_SOURCE_BYTES)}.`);
                input.value = "";
                return;
            }

            previewMeta.textContent = "Preparing image…";
            let optimized;
            state.preparing = optimizeImage(file);
            try {
                optimized = await state.preparing;
            } catch (prepareError) {
                state.preparing = null;
                showError(prepareError.message);
                input.value = "";
                return;
            }
            state.preparing = null;

            if (optimized.size > MAX_BYTES) {
                showError(`This image is ${formatBytes(optimized.size)} even after compression. The maximum size is 10 MB.`);
                input.value = "";
                return;
            }

            if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
            state.file = optimized;
            state.objectUrl = URL.createObjectURL(optimized);
            field.dispatchEvent(new Event("change", { bubbles: true }));
            render();
        }

        input.addEventListener("change", () => accept(input.files[0]));
        replaceBtn.addEventListener("click", () => input.click());
        undoBtn.addEventListener("click", clearNew);
        removeBtn.addEventListener("click", clearNew);

        ["dragenter", "dragover"].forEach(type => zone.addEventListener(type, event => {
            event.preventDefault();
            zone.classList.add("is-dragging");
        }));
        ["dragleave", "drop"].forEach(type => zone.addEventListener(type, event => {
            event.preventDefault();
            zone.classList.remove("is-dragging");
        }));
        zone.addEventListener("drop", event => accept(event.dataTransfer.files[0]));

        return {
            element: field,
            input,
            async getFile() {
                if (state.preparing) await state.preparing;
                return state.file;
            },
            hasChange: () => Boolean(state.file),
            reset(currentUrl = null) {
                clearNew();
                state.currentUrl = currentUrl;
                showError("");
                progress.hidden = true;
                render();
            },
            setRequired(value) {
                state.required = Boolean(value);
                requiredMark.hidden = !state.required;
            },
            validate() {
                if (state.required && !state.file && !state.currentUrl) {
                    showError(`${label} is required.`);
                    return false;
                }
                return !error.textContent || error.hidden;
            },
            setProgress(fraction) {
                if (fraction === null) {
                    progress.hidden = true;
                    return;
                }
                const percent = Math.round(fraction * 100);
                progress.hidden = false;
                progressBar.style.width = `${percent}%`;
                progress.setAttribute("aria-valuenow", String(percent));
            },
            showError
        };
    }

    // ---------- Authentication & shell ----------

    let currentAdmin = null;

    function redirectToLogin(reason) {
        localStorage.removeItem("token");
        localStorage.removeItem("administrator");
        const next = encodeURIComponent(window.location.pathname.split("/").pop() || "dashboard.html");
        window.location.replace(`login.html?next=${next}${reason ? `&reason=${reason}` : ""}`);
    }

    function fillUser(admin) {
        if (!admin) return;
        const name = admin.full_name || "Administrator";
        document.querySelectorAll("[data-admin-name]").forEach(node => { node.textContent = name; });
        document.querySelectorAll("[data-admin-email]").forEach(node => { node.textContent = admin.email || ""; });
        document.querySelectorAll("[data-admin-initials]").forEach(node => {
            node.textContent = name.split(/\s+/).map(part => part[0]).join("").slice(0, 2).toUpperCase();
        });
    }

    function initShell() {
        document.querySelectorAll("[data-icon]").forEach(node => { node.insertAdjacentHTML("afterbegin", icon(node.dataset.icon)); });

        const shell = document.querySelector(".admin");
        const toggle = document.querySelector(".menu-toggle");
        const setOpen = open => {
            shell?.classList.toggle("sidebar-open", open);
            toggle?.setAttribute("aria-expanded", String(open));
        };
        toggle?.addEventListener("click", () => setOpen(!shell.classList.contains("sidebar-open")));
        document.querySelector(".sidebar-backdrop")?.addEventListener("click", () => setOpen(false));
        document.addEventListener("keydown", event => { if (event.key === "Escape") setOpen(false); });

        document.querySelectorAll("[data-logout]").forEach(button => button.addEventListener("click", async () => {
            const ok = await confirm({ title: "Log out?", message: "You will need to sign in again to manage content.", confirmText: "Log out", danger: false });
            if (ok) logout();
        }));
    }

    let expiredNotified = false;
    window.addEventListener("auth:expired", () => {
        if (expiredNotified) return;
        expiredNotified = true;
        toast("Your session has expired. Please sign in again.", "error");
        setTimeout(() => redirectToLogin("expired"), 1500);
    });

    // Verify the stored token with the API before showing the page.
    async function init(onReady) {
        if (!isAuthenticated()) {
            redirectToLogin(getToken() ? "expired" : null);
            return;
        }

        initShell();
        fillUser(getAdministrator());

        const boot = document.querySelector(".boot");
        const response = await getCurrentAdmin();

        if (!response.success && /expired|invalid|missing|no longer exists/i.test(response.message || "")) {
            redirectToLogin("expired");
            return;
        }

        if (response.success) {
            currentAdmin = response.data;
            localStorage.setItem("administrator", JSON.stringify(currentAdmin));
            fillUser(currentAdmin);
        } else {
            toast(response.message || "Unable to verify your session.", "error");
        }

        boot?.classList.add("done");
        setTimeout(() => boot?.remove(), 300);

        if (typeof onReady === "function") onReady(currentAdmin);
    }

    return {
        el,
        thumb,
        formatDate,
        timeAgo,
        formatBytes,
        toast,
        confirm,
        setBusy,
        createImageField,
        init,
        get admin() { return currentAdmin; }
    };
})();

// Backwards-compatible helpers used by older page scripts.
function setupAdminPage(initFn) {
    Admin.init(initFn);
}

function showToast(message, type = "success") {
    Admin.toast(message, type);
}

function confirmAction(message) {
    return Admin.confirm({ message });
}

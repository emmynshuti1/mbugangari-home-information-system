// History page: chronological timeline of events.
const { el } = Site;

Site.ready(loadHistory);

async function loadHistory() {
    const container = document.getElementById("historyContainer");
    const summary = document.getElementById("historySummary");
    Site.renderSkeletons(container, 3, "line");

    const response = await getHistory();

    if (!response || !response.success) {
        Site.renderState(container, { type: "error", title: "Unable to load the history", message: response?.message, retry: loadHistory });
        return;
    }

    // Oldest first; undated events go last.
    const history = (response.data || []).slice().sort((a, b) =>
        (a.event_date || "9999").localeCompare(b.event_date || "9999"));

    if (!history.length) {
        summary.textContent = "";
        Site.renderState(container, { title: "No history yet", message: "Historical events will appear here once they are added." });
        return;
    }

    const years = history.map(event => Site.dateParts(event.event_date)?.year).filter(Boolean);
    summary.replaceChildren(
        el("span", {}, el("strong", { text: history.length }), ` event${history.length === 1 ? "" : "s"}`),
        years.length > 1 && years[0] !== years[years.length - 1]
            ? el("span", {}, "from ", el("strong", { text: years[0] }), " to ", el("strong", { text: years[years.length - 1] }))
            : ""
    );

    container.setAttribute("aria-busy", "false");
    container.replaceChildren(...history.map(event => {
        const parts = Site.dateParts(event.event_date);
        return el("article", { className: "timeline-item reveal" },
            el("div", { className: "timeline-year" },
                el("strong", { text: parts ? parts.year : "—" }),
                el("span", { text: parts ? Site.formatDate(event.event_date).replace(/ \d{4}$/, "") : "Date not recorded" })),
            el("div", { className: "card timeline-card" },
                el("h3", { text: event.title }),
                el("p", { text: event.description || "No description available." })));
    }));

    Site.reveal(container);
}

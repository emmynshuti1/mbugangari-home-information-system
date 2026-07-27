document.addEventListener("DOMContentLoaded", loadHistory);

async function loadHistory() {

    const loading = document.getElementById("loading");

    try {

        const response = await getHistory();

        if (!response || !response.success) {

            loading.textContent = "Unable to load home history.";

            return;

        }

        const history = response.data;

        // Sort by event date (oldest to newest)
        history.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

        loading.style.display = "none";

        displayHistory(history);

    }

    catch (error) {

        console.error(error);

        loading.textContent = "Failed to connect to the server.";

    }

}

function displayHistory(history) {

    const container = document.getElementById("historyContainer");

    container.innerHTML = "";

    if (history.length === 0) {

        const empty = document.createElement("div");
        empty.className = "no-history";
        empty.textContent = "No history events available.";

        container.appendChild(empty);

        return;

    }

    history.forEach(event => {

        const date = event.event_date
            ? new Date(event.event_date).toLocaleDateString()
            : "Unknown Date";

        const item = document.createElement("div");
        item.className = "timeline-item";

        const dot = document.createElement("div");
        dot.className = "timeline-dot";

        const content = document.createElement("div");
        content.className = "timeline-content";

        const dateDiv = document.createElement("div");
        dateDiv.className = "timeline-date";
        dateDiv.textContent = date;

        const title = document.createElement("h2");
        title.textContent = event.title || "Untitled Event";

        const description = document.createElement("p");
        description.textContent =
            event.description || "No description available.";

        content.appendChild(dateDiv);
        content.appendChild(title);
        content.appendChild(description);

        item.appendChild(dot);
        item.appendChild(content);

        container.appendChild(item);

    });

}
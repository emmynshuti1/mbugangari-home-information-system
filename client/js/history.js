document.addEventListener("DOMContentLoaded", loadHistory);

async function loadHistory() {

    const loading = document.getElementById("loading");
    const container = document.getElementById("historyContainer");

    try {

        const response = await getHistory();

        if (!response || !response.success) {

            loading.innerHTML = "Unable to load home history.";

            return;

        }

        let history = response.data;

        // Sort by event date (oldest to newest)
        history.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));

        loading.style.display = "none";

        displayHistory(history);

    }

    catch (error) {

        console.error(error);

        loading.innerHTML = "Failed to connect to the server.";

    }

}

function displayHistory(history) {

    const container = document.getElementById("historyContainer");

    container.innerHTML = "";

    if (history.length === 0) {

        container.innerHTML = `
            <div class="no-history">
                No history events available.
            </div>
        `;

        return;

    }

    history.forEach(event => {

        const date = event.event_date
            ? new Date(event.event_date).toLocaleDateString()
            : "Unknown Date";

        container.innerHTML += `

        <div class="timeline-item">

            <div class="timeline-dot"></div>

            <div class="timeline-content">

                <div class="timeline-date">

                    ${date}

                </div>

                <h2>

                    ${event.title}

                </h2>

                <p>

                    ${event.description || "No description available."}

                </p>

            </div>

        </div>

        `;

    });

}
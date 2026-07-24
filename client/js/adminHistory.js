let historyItems = [];

document.addEventListener("DOMContentLoaded", () => {
    setupAdminPage(() => {
        loadHistory();
        loadHouseOptions("house_id", ".field-note");
        document.getElementById("historyForm")?.addEventListener("submit", handleAddHistory);
        document.getElementById("searchHistory")?.addEventListener("keyup", searchHistory);
    });
});

async function loadHistory() {
    const response = await getHistory();
    if (!response.success) {
        alert(response.message || "Unable to load history entries.");
        return;
    }
    historyItems = response.data;
    renderHistory(historyItems);
}

function renderHistory(items) {
    const container = document.getElementById("historyTable");
    container.innerHTML = "";
    if (!items.length) {
        container.innerHTML = `<div class="empty-state">No history entries available.</div>`;
        return;
    }
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Event Date</th>
                    <th>Detail</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.title}</td>
                        <td>${item.event_date ? new Date(item.event_date).toLocaleDateString() : "—"}</td>
                        <td>${item.detail}</td>
                        <td>
                            <button class="editBtn" onclick="editHistory(${item.id})">Edit</button>
                            <button class="deleteBtn" onclick="deleteHistoryItem(${item.id})">Delete</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>`;
}

async function handleAddHistory(event) {
    event.preventDefault();
    const title = document.getElementById("title").value.trim();
    const event_date = document.getElementById("event_date").value || null;
    const detail = document.getElementById("detail").value.trim();

    if (!title) {
        alert("Entry title is required.");
        return;
    }

    const house_id = getSelectedHouseId("house_id");
    if (!house_id) {
        alert("Please select a house before adding history records.");
        return;
    }

    const response = await createHistory({ house_id, title, event_date, detail });
    if (!response.success) {
        alert(response.message || "Unable to add history entry.");
        return;
    }

    document.getElementById("historyForm").reset();
    loadHistory();
}

function searchHistory() {
    const query = document.getElementById("searchHistory").value.toLowerCase();
    const filtered = historyItems.filter(item =>
        item.title.toLowerCase().includes(query) ||
        (item.detail || "").toLowerCase().includes(query)
    );
    renderHistory(filtered);
}

async function editHistory(id) {
    const item = historyItems.find(entry => entry.id === id);
    if (!item) return;

    const title = prompt("Title", item.title);
    if (title === null) return;
    const event_date = prompt("Event Date", item.event_date ? item.event_date.split('T')[0] : "") || null;
    const detail = prompt("Detail", item.detail);

    const response = await updateHistory(id, {
        house_id: item.house_id,
        title,
        event_date,
        detail
    });
    if (!response.success) {
        alert(response.message || "Unable to update history entry.");
        return;
    }

    loadHistory();
}

async function deleteHistoryItem(id) {
    if (!confirm("Delete this history entry?")) {
        return;
    }

    const response = await deleteHistory(id);
    if (!response.success) {
        alert(response.message || "Unable to delete history entry.");
        return;
    }

    loadHistory();
}

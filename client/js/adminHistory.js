let historyItems = [];

document.addEventListener("DOMContentLoaded", () => {

    setupAdminPage(() => {

        loadHistory();

        loadHouseOptions("house_id", ".field-note");

        document
            .getElementById("historyForm")
            ?.addEventListener("submit", saveHistory);

        document
            .getElementById("searchHistory")
            ?.addEventListener("keyup", searchHistory);

        document
            .getElementById("addHistoryBtn")
            ?.addEventListener("click", () => {

                showHistoryForm();

            });

        document
            .getElementById("cancelHistoryBtn")
            ?.addEventListener("click", hideHistoryForm);

    });

});

async function loadHistory() {

    try {

        const response = await getHistory();

        if (!response.success) {

            showToast(response.message, "error");

            return;

        }

        historyItems = response.data || [];

        renderHistory(historyItems);

    }

    catch (error) {

        console.error(error);

        showToast("Unable to load history.", "error");

    }

}

function showHistoryForm(item = null) {

    document
        .getElementById("historyFormCard")
        .classList
        .remove("hidden");

    if (item) {

        document.getElementById("historyFormTitle").textContent = "Edit History";

        document.getElementById("historyId").value = item.id;

        document.getElementById("title").value = item.title;

        document.getElementById("description").value = item.description || "";

        document.getElementById("event_date").value = item.event_date
            ? item.event_date.substring(0, 10)
            : "";

        document.getElementById("house_id").value = item.house_id;

    }

    else {

        document.getElementById("historyFormTitle").textContent = "Add History";

        document.getElementById("historyForm").reset();

        document.getElementById("historyId").value = "";

    }

}

function hideHistoryForm() {

    document
        .getElementById("historyFormCard")
        .classList
        .add("hidden");

}

function renderHistory(items) {

    const container = document.getElementById("historyTable");

    container.innerHTML = "";

    if (!items.length) {

        container.textContent = "No history available.";

        return;

    }

    const table = document.createElement("table");

    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Date</th>
                <th>Actions</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement("tbody");

    items.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.title}</td>
            <td>${item.event_date || ""}</td>
        `;

        const actions = document.createElement("td");

        const edit = document.createElement("button");

        edit.className = "editBtn";

        edit.textContent = "Edit";

        edit.onclick = () => showHistoryForm(item);

        const del = document.createElement("button");

        del.className = "deleteBtn";

        del.textContent = "Delete";

        del.onclick = () => deleteHistoryEntry(item.id);

        actions.append(edit, del);

        tr.appendChild(actions);

        tbody.appendChild(tr);

    });

    table.appendChild(tbody);

    container.appendChild(table);

}

async function saveHistory(e) {

    e.preventDefault();

    const id = document.getElementById("historyId").value;

    const history = {

        house_id: document.getElementById("house_id").value,

        title: document.getElementById("title").value.trim(),

        description: document.getElementById("description").value.trim(),

        event_date: document.getElementById("event_date").value

    };

    if (!history.house_id) {

        showToast("Select a house.", "error");

        return;

    }

    if (!history.title) {

        showToast("Title is required.", "error");

        return;

    }

    let response;

    if (id) {

        response = await updateHistory(id, history);

    }

    else {

        response = await createHistory(history);

    }

    if (!response.success) {

        showToast(response.message, "error");

        return;

    }

    hideHistoryForm();

    showToast("History saved.");

    loadHistory();

}

function searchHistory() {

    const keyword = document
        .getElementById("searchHistory")
        .value
        .toLowerCase();

    renderHistory(

        historyItems.filter(item =>

            item.title.toLowerCase().includes(keyword)

        )

    );

}

async function deleteHistoryEntry(id) {

    const confirmed = await confirmAction(

        "Delete this history event?"

    );

    if (!confirmed) return;

    const response = await deleteHistory(id);

    if (!response.success) {

        showToast(response.message, "error");

        return;

    }

    showToast("History deleted.");

    loadHistory();

}
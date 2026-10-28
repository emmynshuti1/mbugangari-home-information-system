// History timeline management.
Admin.init(() => {
    AdminResource({
        key: "history",
        singular: "event",
        plural: "events",
        icon: "clock",
        publicUrl: "../pages/history.html",
        searchPlaceholder: "Search events…",
        api: { list: getHistory, create: createHistory, update: updateHistory, remove: deleteHistory },
        defaultSort: { key: "event_date", dir: "desc" },
        searchText: item => `${item.title} ${item.description || ""} ${item.event_date || ""}`,
        fields: [
            { name: "house_id", label: "House", type: "house", required: true },
            { name: "title", label: "Title", required: true, maxlength: 150, placeholder: "e.g. Construction Started" },
            { name: "event_date", label: "Date", type: "date", max: "9999-12-31" },
            { name: "description", label: "Description", type: "textarea", maxlength: 5000 }
        ],
        columns: [
            { label: "Date", key: "event_date", render: item => Admin.formatDate(item.event_date) },
            {
                label: "Event", key: "title", render: item => Admin.el("div", {},
                    Admin.el("span", { className: "cell-title", text: item.title }),
                    Admin.el("span", { className: "cell-sub", text: item.description || "No description" }))
            },
            { label: "ID", key: "id", sortValue: item => Number(item.id), render: item => `#${item.id}` }
        ],
        titleOf: item => item.title,
        formatValue: (name, value) => name === "event_date" ? Admin.formatDate(value) : value
    });
});

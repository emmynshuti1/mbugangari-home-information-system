async function loadHouseOptions(selectId, helperSelector = ".field-note") {
    const select = document.getElementById(selectId);
    const helper = helperSelector ? document.querySelector(helperSelector) : null;

    if (!select) {
        return [];
    }

    const response = await getHouse();
    select.innerHTML = '<option value="">Select a house</option>';

    if (!response.success || !Array.isArray(response.data) || response.data.length === 0) {
        select.disabled = true;
        if (helper) {
            helper.textContent = "No house records found. Please create a house first.";
        }
        return [];
    }

    response.data.forEach((house) => {
        const option = document.createElement("option");
        option.value = house.id;
        option.textContent = `${house.name || "House"} (ID ${house.id})`;
        select.appendChild(option);
    });

    if (response.data.length === 1) {
        select.value = response.data[0].id;
    }

    select.disabled = false;
    if (helper) {
        helper.textContent = "Choose the house record to associate with this entry.";
    }

    return response.data;
}

function getSelectedHouseId(selectId) {
    const select = document.getElementById(selectId);
    if (!select) {
        return null;
    }

    const value = select.value;
    const houseId = Number(value);
    return houseId > 0 ? houseId : null;
}

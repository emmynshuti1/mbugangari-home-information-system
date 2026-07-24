let rooms = [];

document.addEventListener("DOMContentLoaded", () => {
    setupAdminPage(() => {
        loadRooms();
        loadHouseOptions("room_house_id", ".field-note");
        document.getElementById("searchRoom")?.addEventListener("keyup", searchRooms);
        document.getElementById("addRoomBtn")?.addEventListener("click", addRoom);
    });
});

async function loadRooms() {

    try {

        const response = await getRooms();

        if (!response.success) {

            alert(response.message);

            return;

        }

        rooms = response.data;

        displayRooms(rooms);

    }

    catch(error){

        console.error(error);

    }

}

function displayRooms(data){

    const tbody = document.querySelector("#roomsTable tbody");

    tbody.innerHTML = "";

    data.forEach(room=>{

        tbody.innerHTML += `

        <tr>

            <td>${room.id}</td>
            
            <td>${room.name}</td>
            
            <td>${room.floor}</td>
            
            <td>${room.length} × ${room.width}</td>
            
            <td>
            
                <img src="../images/${room.image_url}" alt="${room.name}"">
            
            </td>

            <td>

                <button
                    class="editBtn"
                    onclick="editRoom(${room.id})">

                    Edit

                </button>

                <button
                    class="deleteBtn"
                    onclick="removeRoom(${room.id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

function searchRooms(){

    const keyword = document
        .getElementById("searchRoom")
        .value
        .toLowerCase();

    const filtered = rooms.filter(room=>

        room.name.toLowerCase().includes(keyword) ||
            (room.floor || "").toLowerCase().includes(keyword)
    );

    displayRooms(filtered);

}

async function addRoom(){

    const name = prompt("Room name:");

    if(!name) return;

    const floor = prompt("Floor:");

    const length = prompt("Length:");

    const width = prompt("Width:");

    const description = prompt("Description:");

    const image_url = prompt("Image filename (example: bedroom.jpg)");

    const house_id = getSelectedHouseId("room_house_id");
    if (!house_id) {
        alert("Please select a house before adding a room.");
        return;
    }

    const room = {
        house_id,
        name,
        floor,
        length,
        width,
        description,
        image_url
    };

    const response = await createRoom(room);

    if(response.success){

        alert("Room created successfully.");

        loadRooms();

    }

    else{

        alert(response.message);

    }

}

async function editRoom(id){

    const room = rooms.find(r=>r.id===id);

    const name = prompt("Room name",room.name);

    if(name===null) return;

    const floor = prompt("Floor",room.floor);

    const length = prompt("Length",room.length);

    const width = prompt("Width",room.width);

    const description = prompt("Description",room.description);

    const image_url = prompt("Image filename",room.image_url);

    const updated = {
        house_id: room.house_id,
        name,
        floor,
        length,
        width,
        description,
        image_url
    };

    const response = await updateRoom(id,updated);

    if(response.success){

        alert("Room updated.");

        loadRooms();

    }

}

async function removeRoom(id){

    if(!confirm("Delete this room?"))

        return;

    const response = await deleteRoom(id);

    if(response.success){

        alert("Room deleted.");

        loadRooms();

    }

}
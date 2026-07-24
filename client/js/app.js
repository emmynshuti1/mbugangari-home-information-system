document.addEventListener("DOMContentLoaded", async () => {

    loadStatistics();

    loadFeaturedRooms();

    loadLatestHistory();

    loadHomeDescription();

});

async function loadStatistics() {

    const rooms = await getRooms();
    const gallery = await getGallery();
    const materials = await getMaterials();
    const places = await getNearbyPlaces();

    document.getElementById("roomCount").textContent =
        rooms?.count || 0;

    document.getElementById("galleryCount").textContent =
        gallery?.count || 0;

    document.getElementById("materialCount").textContent =
        materials?.count || 0;

    document.getElementById("placeCount").textContent =
        places?.count || 0;

}

async function loadFeaturedRooms() {

    const result = await getRooms();

    const container = document.getElementById("featuredRooms");

    if (!result || result.count === 0) {

        container.innerHTML = "<p>No rooms available.</p>";

        return;

    }

    container.innerHTML = "";

    result.data.slice(0,3).forEach(room=>{

        container.innerHTML += `

        <div class="room-card">

            <h3>${room.name}</h3>

            <p><strong>Floor:</strong> ${room.floor}</p>

            <p>${room.description}</p>

        </div>

        `;

    });

}

async function loadLatestHistory(){

    const result = await getHistory();

    const container = document.getElementById("latestHistory");

    if(!result || result.count===0){

        container.innerHTML="<p>No history available.</p>";

        return;

    }

    const history=result.data[0];

    container.innerHTML=`

        <h3>${history.title}</h3>

        <p>${history.description}</p>

        <small>${history.event_date}</small>

    `;

}

async function loadHomeDescription(){

    const result= await getHouse();

    if(result && result.count>0){

        document.getElementById("homeDescription").textContent=

        result.data[0].description;

    }

}
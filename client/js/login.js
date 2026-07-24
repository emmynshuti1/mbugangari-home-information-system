const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", login);

async function login(e) {

    e.preventDefault();

    message.className = "";
    message.textContent = "Logging in...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {

        const response = await fetch(`${CONFIG.API_URL}/auth/login`, {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                email,
                password

            })

        });

        const data = await response.json();

        if (!response.ok || !data.success) {

            message.className = "error";

            message.textContent =
                data.message || "Invalid email or password.";

            return;

        }

        localStorage.setItem("token", data.token);

        localStorage.setItem(
            "administrator",
            JSON.stringify(data.administrator)
        );

        message.className = "success";

        message.textContent = "Login successful.";

        setTimeout(() => {

            window.location.href = "dashboard.html";

        }, 1000);

    }

    catch (error) {

        console.error(error);

        message.className = "error";

        message.textContent = "Unable to connect to the server.";

    }

}
function showToast(message, type = "success") {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.className = `toast ${type} show`;

    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}

function confirmAction(message) {

    return new Promise(resolve => {

        const modal = document.getElementById("confirmModal");

        document.getElementById("confirmMessage").textContent = message;

        modal.classList.remove("hidden");

        document.getElementById("confirmOk").onclick = () => {

            modal.classList.add("hidden");

            resolve(true);

        };

        document.getElementById("confirmCancel").onclick = () => {

            modal.classList.add("hidden");

            resolve(false);

        };

    });

}
function setupAdminPage(initFn) {
    if (typeof protectPage === 'function') {
        protectPage();
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    if (typeof initFn === 'function') {
        initFn();
    }
}

function showAdminMessage(message, type = 'info') {
    console[type === 'error' ? 'error' : 'log'](message);
    if (typeof alert === 'function') {
        alert(message);
    }
}

function buildAdminPageUrl(pageName) {
    return pageName ? `${pageName}.html` : 'dashboard.html';
}

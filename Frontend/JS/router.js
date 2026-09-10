let currentPage= ""

const pages = {
    dashboard: Dashboard,
    teachers: Teachers,
    tasks: Tasks,
    reports: Reports,
    analytics: Analytics,
    settings: Settings
};

function loadPage(page) {

    const main = document.getElementById("main");

    main.innerHTML = "";

    pages[page](main);

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    document
        .querySelector(`[data-page="${page}"]`)
        .classList.add("active");

    if (page === "dashboard") {
        refreshUI();
    }

}

function refreshUI() {

    if (currentPage === "dashboard") {
        updateDashboardStats();
    }

    if (currentPage === "tasks") {
        loadTasks();
    }

}
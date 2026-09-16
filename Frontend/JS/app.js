window.onload = () => {

    loadData();

    document.querySelectorAll(".nav-item").forEach(item => {

        item.addEventListener("click", () => {

            loadPage(item.dataset.page);

        });

    });

    loadPage("dashboard");

};

window.onload = () => {

    loadData();

    document.querySelectorAll(".nav-item").forEach(item => {

        item.addEventListener("click", () => {

            loadPage(item.dataset.page);

        });

    });

    loadPage("dashboard");

};

const savedTheme =
    localStorage.getItem("theme") || "ocean";

applyTheme(savedTheme);

const savedBorder = localStorage.getItem("borderStyle");

if (savedBorder) {

    applyBorder(savedBorder);

}
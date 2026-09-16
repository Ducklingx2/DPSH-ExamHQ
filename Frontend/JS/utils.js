function generateId() {

    return Date.now();

}

function getTeacherById(id) {

    return teachers.find(teacher => teacher.id === id);

}

function getTaskById(id) {

    return tasks.find(task => task.id === id);

}

function countTasks(status) {

    return tasks.filter(task => task.status === status).length;

}

function formatDate(date) {

    return new Date(date).toLocaleDateString();

}

function today() {

    return new Date().toISOString().split("T")[0];

}

function isOverdue(task) {

    if (task.status === "Completed")
        return false;

    return task.deadline < today();

}

function saveData() {

    localStorage.setItem("teachers", JSON.stringify(teachers));
    localStorage.setItem("tasks", JSON.stringify(tasks));

}

// =========================
// Load Data
// =========================

function loadData() {

    const savedTeachers = JSON.parse(localStorage.getItem("teachers"));

    if (savedTeachers) {

        teachers.length = 0;

        teachers.push(...savedTeachers);

    }

    const savedTasks = JSON.parse(localStorage.getItem("tasks"));

    if (savedTasks) {

        tasks.length = 0;

        tasks.push(...savedTasks);

    }

}

function getTaskStatus(task) {

    if (task.status === "Completed")
        return "🟢 Completed";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.deadline);
    deadline.setHours(0, 0, 0, 0);

    if (deadline < today)
        return "🔴 Overdue";

    return "🟡 Pending";

}

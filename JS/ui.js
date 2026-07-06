// =========================
// Dashboard UI
// =========================

function updateDashboardStats() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.status === "Completed").length;

    const pending = tasks.filter(task => task.status === "Pending").length;

    const overdue = tasks.filter(task => task.status === "Overdue").length;

    document.getElementById("totalTasks").textContent = total;

    document.getElementById("completedTasks").textContent = completed;

    document.getElementById("pendingTasks").textContent = pending;

    document.getElementById("overdueTasks").textContent = overdue;

}

// =========================
// Teacher List
// =========================

function renderTeachers() {

    const list = document.getElementById("teacherList");

    if (!list) return;

    list.innerHTML = "";

    if (teachers.length === 0) {

        list.innerHTML = `
            <p class="empty-message">
                No teachers have been added.
            </p>
        `;

        return;

    }

    teachers.forEach(teacher => {

        list.innerHTML += `

            <div class="teacher-card">

                <h3>${teacher.name}</h3>

                <p>${teacher.department}</p>

                <p>${teacher.subject}</p>

                <small>${teacher.email}</small>

            </div>

        `;

    });

}

// =========================
// Task Table
// =========================

function renderTasks() {

    const table = document.getElementById("taskTable");

    if (!table) return;

    table.innerHTML = "";

    tasks.forEach(task => {

        const teacher = teachers.find(t => t.id === task.teacherId);

        table.innerHTML += `

            <tr>

                <td>${teacher ? teacher.name : "Unknown"}</td>

                <td>${task.title}</td>

                <td>${task.department}</td>

                <td>${task.deadline}</td>

                <td>${task.status}</td>

            </tr>

        `;

    });

}

// =========================
// Refresh Everything
// =========================

function refreshUI() {

    updateDashboardStats();

    renderTeachers();

    renderTasks();

}

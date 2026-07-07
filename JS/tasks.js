if (typeof tasks === "undefined") {
    const tasks = [];
}

function Tasks(main) {

    let teacherOptions = "";

    teachers.forEach(teacher => {

        teacherOptions += `
            <option value="${teacher.id}">
                ${teacher.name}
            </option>
        `;

    });

    main.innerHTML = `

        <h1>Tasks</h1>

        <div class="task-form">

            <input
                id="taskTitle"
                type="text"
                placeholder="Task Title"
            >

            <select id="taskTeacher">

                ${teacherOptions}

            </select>

            <input
                id="taskDeadline"
                type="date"
            >

            <select id="taskStatus">

                <option>Pending</option>
                <option>Completed</option>
                <option>Overdue</option>

            </select>

            <button id="addTaskBtn">

                Add Task

            </button>

        </div>

        <table>

            <thead>

                <tr>

                    <th>Teacher</th>
                    <th>Task</th>
                    <th>Deadline</th>
                    <th>Status</th>

                </tr>

            </thead>

            <tbody id="taskTable">

            </tbody>

        </table>

    `;

    document
        .getElementById("addTaskBtn")
        .addEventListener("click", addTask);

    renderTasks();

}

function addTask() {

    const title =
        document.getElementById("taskTitle").value.trim();

    const teacherId =
        Number(document.getElementById("taskTeacher").value);

    const deadline =
        document.getElementById("taskDeadline").value;

    const status =
        document.getElementById("taskStatus").value;

    if (title === "") {

        alert("Please enter a task.");

        return;

    }

    tasks.push({

        id: generateId(),

        teacherId,

        title,

        deadline,

        status

    });

    saveData();
    
    renderTasks();

    updateDashboardStats();

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDeadline").value = "";

}

function renderTasks() {

    const table = document.getElementById("taskTable");

    if (!table) return;

    table.innerHTML = "";

    tasks.forEach(task => {

        const teacher =
            teachers.find(t => t.id === task.teacherId);

        table.innerHTML += `

            <tr>

                <td>${teacher ? teacher.name : "Unknown"}</td>

                <td>${task.title}</td>

                <td>${task.deadline}</td>

                <td>${task.status}</td>

            </tr>

        `;

    });

}
